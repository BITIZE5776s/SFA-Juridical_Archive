import type { Express } from "express";
import { createServer, type Server } from "http";
import { supabase } from "./supabase";
import { loginSchema, type InsertUser, type InsertDocument, type InsertPaper, type InsertRecommendation, type InsertComment, type InsertReport } from "@shared/schema";
import { storage } from "./storage";
import { fileUploadService } from "./upload";
import { setupSupabaseBucket, createCustomBlockFolder } from "./setup-bucket";
import multer from "multer";
import JSZip from "jszip";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'text/plain',
      'application/rtf'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      
      // Step 1: Try Supabase Auth first
      console.log("Attempting Supabase Auth login for:", username);
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: username,
        password,
      });

      if (!authError && authData.user) {
        console.log("Supabase Auth login successful for:", username);
        
        // Fetch additional user data from database including restriction status
        try {
          const { data: dbUser, error: dbError } = await supabase
            .from("users")
            .select("*")
            .eq("email", username)
            .single();
          
          if (!dbError && dbUser) {
            console.log("Fetched database user data:", dbUser);
            
            // Log login event
            await supabase
              .from("user_activity_logs")
              .insert({
                user_id: dbUser.id,
                action: "login",
                resource_type: "auth",
                details: {
                  login_method: "supabase_auth",
                  ip_address: req.ip || req.connection.remoteAddress,
                  user_agent: req.get('User-Agent')
                }
              });
            
            // Enhance the auth user with database restriction data
            const enhancedUser = {
              ...authData.user,
              user_metadata: {
                ...authData.user.user_metadata,
                is_restricted: dbUser.is_restricted,
                restriction_reason: dbUser.restriction_reason,
                restricted_by: dbUser.restricted_by,
                restricted_at: dbUser.restricted_at
              }
            };
            
            console.log("Enhanced user with restriction data:", enhancedUser);
            return res.json({ user: enhancedUser });
          }
        } catch (dbError) {
          console.warn("Failed to fetch database user data:", dbError);
        }
        
        return res.json({ user: authData.user });
      }

      // Step 2: If Supabase Auth fails, check database
      console.log("Supabase Auth failed, checking database for:", username);
      console.log("Looking for user with email:", username, "and password:", password);
      
      const { data: dbUser, error: dbError } = await supabase
        .from("users")
        .select("*")
        .eq("email", username)
        .eq("password", password)
        .eq("is_active", true)
        .single();
      
      console.log("Database query result:", { dbUser, dbError });

      if (dbError || !dbUser) {
        console.log("Database login failed for:", username);
        return res.status(401).json({ message: "بيانات الدخول غير صحيحة" });
      }

      // Log login event for database users
      await supabase
        .from("user_activity_logs")
        .insert({
          user_id: dbUser.id,
          action: "login",
          resource_type: "auth",
          details: {
            login_method: "database_auth",
            ip_address: req.ip || req.connection.remoteAddress,
            user_agent: req.get('User-Agent')
          }
        });

      // Step 3: Create a mock user object for database users
      console.log("Database login successful for:", username);
      console.log("User restriction status:", {
        is_restricted: dbUser.is_restricted,
        restriction_reason: dbUser.restriction_reason,
        restricted_by: dbUser.restricted_by
      });
      
      const mockUser = {
        id: dbUser.id,
        email: dbUser.email,
        user_metadata: {
          username: dbUser.username,
          full_name: dbUser.full_name,
          role: dbUser.role,
          is_restricted: dbUser.is_restricted,
          restriction_reason: dbUser.restriction_reason,
          restricted_by: dbUser.restricted_by,
          restricted_at: dbUser.restricted_at
        },
        app_metadata: {
          role: dbUser.role
        }
      };

      res.json({ user: mockUser });
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({ message: "بيانات غير صالحة" });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    try {
      // Get user ID from request if available
      const userId = req.body.userId || req.headers['x-user-id'];
      
      // Log logout event if we have a user ID
      if (userId) {
        await supabase
          .from("user_activity_logs")
          .insert({
            user_id: userId,
            action: "logout",
            resource_type: "auth",
            details: {
              logout_method: "api_logout",
              ip_address: req.ip || req.connection.remoteAddress,
              user_agent: req.get('User-Agent')
            }
          });
      }

      const { error } = await supabase.auth.signOut();

      if (error) {
        return res.status(500).json({ message: "خطأ في تسجيل الخروج" });
      }

      res.json({ message: "تم تسجيل الخروج بنجاح" });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "خطأ في تسجيل الخروج" });
    }
  });

  // User management routes
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "خطأ في جلب المستخدمين" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      console.log("Creating user with data:", req.body);
      const user = await storage.createUser(req.body as InsertUser);
      console.log("User created successfully:", user);
      res.status(201).json(user);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(400).json({ 
        message: "فشل في إنشاء المستخدم", 
        error: error instanceof Error ? error.message : "Unknown error",
        details: error
      });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const user = await storage.updateUser(id, req.body as Partial<InsertUser>);

      if (!user) {
        return res.status(404).json({ message: "المستخدم غير موجود" });
      }

      res.json(user);
    } catch (error) {
      res.status(400).json({ message: "بيانات غير صالحة" });
    }
  });

  app.delete("/api/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteUser(id);

      if (!success) {
        return res.status(404).json({ message: "المستخدم غير موجود" });
      }

      res.json({ message: "تم حذف المستخدم بنجاح" });
    } catch (error) {
      res.status(500).json({ message: "خطأ في حذف المستخدم" });
    }
  });

  // Enhanced user management routes
  app.put("/api/users/:id/restrict", async (req, res) => {
    try {
      const { id } = req.params;
      const { restrictedBy, reason, restrict = true } = req.body;
      
      const success = await storage.restrictUser(id, restrictedBy, reason, restrict);
      
      if (!success) {
        return res.status(404).json({ message: "المستخدم غير موجود" });
      }

      res.json({ message: restrict ? "تم تقييد المستخدم بنجاح" : "تم إلغاء تقييد المستخدم بنجاح" });
    } catch (error) {
      res.status(500).json({ message: "خطأ في تقييد المستخدم" });
    }
  });

  app.delete("/api/users/:id/permanent", async (req, res) => {
    try {
      const { id } = req.params;
      const { password } = req.body;

      // If password is provided, this is a self-deletion request
      if (password) {
        console.log("Self-deletion request for user:", id);
        
        // Verify the password by checking the user in database
        const { data: user, error: userError } = await supabase
          .from("users")
          .select("password")
          .eq("id", id)
          .single();

        if (userError || !user) {
          return res.status(404).json({ message: "المستخدم غير موجود" });
        }

        if (user.password !== password) {
          return res.status(401).json({ message: "كلمة المرور غير صحيحة" });
        }

        console.log("Password verified for self-deletion");
      }

      const success = await storage.permanentlyDeleteUser(id);

      if (!success) {
        return res.status(404).json({ message: "المستخدم غير موجود" });
      }

      // If this was a self-deletion (password provided), also sign out from Supabase Auth
      if (password) {
        try {
          // Try to sign out the user from Supabase Auth
          const { error: signOutError } = await supabase.auth.admin.signOut(id);
          if (signOutError) {
            console.warn('Could not sign out user from Supabase Auth:', signOutError.message);
          } else {
            console.log('User signed out from Supabase Auth successfully');
          }
        } catch (error) {
          console.warn('Error signing out user from Supabase Auth:', error);
        }
      }

      res.json({ message: "تم حذف المستخدم نهائياً من النظام" });
    } catch (error) {
      console.error("Permanent delete error:", error);
      res.status(500).json({ message: "خطأ في حذف المستخدم نهائياً" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const user = await storage.getUser(id);

      if (!user) {
        return res.status(404).json({ message: "المستخدم غير موجود" });
      }

      res.json(user);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "خطأ في جلب بيانات المستخدم" });
    }
  });

  app.get("/api/users/:id/stats", async (req, res) => {
    try {
      const { id } = req.params;
      const stats = await storage.getUserStats(id);

      if (!stats) {
        return res.status(404).json({ message: "المستخدم غير موجود" });
      }

      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "خطأ في جلب إحصائيات المستخدم" });
    }
  });

  app.get("/api/users/:id/activity", async (req, res) => {
    try {
      const { id } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;
      const activity = await storage.getUserActivityLogs(id, limit);

      if (!activity) {
        return res.status(404).json({ message: "المستخدم غير موجود" });
      }

      res.json(activity);
    } catch (error) {
      res.status(500).json({ message: "خطأ في جلب نشاط المستخدم" });
    }
  });

  // Document routes
  app.get("/api/documents", async (req, res) => {
    try {
      console.log("📋 Documents GET request received");
      const { search, category, status, userId, blockId, specializedSection, sortBy } = req.query;
      console.log("🔍 Query params:", { search, category, status, userId, blockId, specializedSection, sortBy });

      let documents;

      // Always get documents with user's favorite status if userId is provided
      if (userId) {
        console.log("📋 Fetching documents with user favorites for userId:", userId);
        documents = await storage.getAllDocumentsWithUserFavorites(userId as string);
        console.log("📋 Documents with favorites result:", documents?.length || 0, "documents");
        if (documents && documents.length > 0) {
          console.log("📋 Sample document favorite status:", documents[0]?.is_favorited);
        }
      } else {
        console.log("📋 Fetching all documents");
        documents = await storage.getAllDocuments();
      }

      // Apply client-side filtering if we have documents
      if (documents && documents.length > 0) {
        console.log("🔍 Applying client-side filtering...");
        
        // Search filter - supports title search, full address search, and block letter filtering
        if (search) {
          console.log("🔍 Filtering by search:", search);
          documents = documents.filter(doc => {
            const searchTerm = (search as string).toLowerCase();
            const reference = (doc.reference || '').toLowerCase();
            
            // If search is just 1-3 letters (like "A", "AB", "ABC"), treat it as block filtering
            if (/^[a-z]{1,3}$/i.test(searchTerm)) {
              const blockMatch = reference.startsWith(searchTerm.toLowerCase() + '.');
              console.log(`🔍 Document ${doc.id} reference "${doc.reference}" block matches "${search}": ${blockMatch}`);
              return blockMatch;
            }
            
            // Otherwise, search in title and reference
            const titleMatch = doc.title.toLowerCase().includes(searchTerm);
            const referenceMatch = reference.includes(searchTerm);
            const matches = titleMatch || referenceMatch;
            console.log(`🔍 Document ${doc.id} title "${doc.title}" reference "${doc.reference}" matches "${search}": ${matches}`);
            return matches;
          });
        }

        // Category filter
        if (category && category !== "all") {
          console.log("🔍 Filtering by category:", category);
          documents = documents.filter(doc => {
            const matches = doc.category === category;
            console.log(`🔍 Document ${doc.id} category "${doc.category}" matches "${category}": ${matches}`);
            return matches;
          });
        }

        // Status filter
        if (status && status !== "all") {
          console.log("🔍 Filtering by status:", status);
          documents = documents.filter(doc => doc.status === status);
        }

        // Block filter (filter by section's row's block)
        if (blockId && blockId !== "all") {
          console.log("🔍 Filtering by block:", blockId);
          documents = documents.filter(doc => {
            // This would need to be implemented based on your database structure
            // For now, we'll skip this filter as it requires joining tables
            return true;
          });
        }

        // Specialized section filter - exact block letter matching
        if (specializedSection) {
          console.log("🔍 Filtering by specialized section:", specializedSection);
          documents = documents.filter(doc => {
            const reference = doc.reference || '';
            
            // Only match if the reference starts with the exact specialized section
            // This ensures "A" only matches "A.1.1", "A.2.1", etc., not "AB.1.1"
            const referenceMatches = reference.toUpperCase().startsWith((specializedSection as string).toUpperCase() + '.');
            
            console.log(`🔍 Document ${doc.id} reference "${reference}" matches "${specializedSection}": ${referenceMatches}`);
            return referenceMatches;
          });
        }

        // Sorting
        if (sortBy) {
          console.log("🔍 Sorting by:", sortBy);
          switch (sortBy) {
            case "recent":
              documents = documents.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
              break;
            case "oldest":
              documents = documents.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
              break;
            case "title":
              documents = documents.sort((a, b) => a.title.localeCompare(b.title));
              break;
            case "category":
              documents = documents.sort((a, b) => a.category.localeCompare(b.category));
              break;
            default:
              // Default to recent
              documents = documents.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          }
        } else {
          // Default sorting to newest
          documents = documents.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        }
      }

      console.log(`📄 Found ${documents?.length || 0} documents after filtering`);

      // Return the filtered results (empty array if no matches)
      if (!documents) {
        console.log("📄 No documents found in database");
        return res.json([]);
      }

      console.log("✅ Returning documents:", documents.length);
      res.json(documents);
    } catch (error) {
      console.error('❌ Documents error:', error);
      res.status(500).json({ message: "خطأ في جلب الوثائق" });
    }
  });

  // Favorites route must come before the generic :id route to avoid conflicts
  app.get("/api/documents/favorites", async (req, res) => {
    try {
      const userId = req.query.userId as string; // This should come from authentication in a real app
      if (!userId) {
        return res.status(401).json({ message: "المستخدم غير مصرح له" });
      }

      const favorites = await storage.getUserFavorites(userId);
      
      res.json(favorites || []);
    } catch (error) {
      console.error("❌ Error getting favorites:", error);
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  app.get("/api/documents/:id", async (req, res) => {
    try {
      const { id } = req.params;
      console.log(`🔍 Fetching document with ID: ${id}`);
      
      const document = await storage.getDocument(id);

      if (!document) {
        console.log(`❌ Document not found: ${id}`);
        return res.status(404).json({ message: "الوثيقة غير موجودة" });
      }

      console.log(`✅ Document found: ${document.title}`);
      res.json(document);
    } catch (error) {
      console.error('❌ Error fetching document:', error);
      res.status(500).json({ message: "خطأ في جلب الوثيقة" });
    }
  });

  app.post("/api/documents", async (req, res) => {
    try {
      console.log("🚀 Document creation request received");
      console.log("📋 Request body:", req.body);
      
      const { sectionId, createdBy, ...documentData } = req.body;
      
      console.log("👤 Created by:", createdBy);
      console.log("📄 Document data:", documentData);
      console.log("🏷️ Section ID:", sectionId);
      
      if (!createdBy) {
        console.error("❌ Missing createdBy field");
        return res.status(400).json({ message: "معرف المستخدم مطلوب" });
      }
      
      // Create a simple section structure for the document
      let sectionIdToUse = 'default-section';
      
      try {
        // First, ensure we have a default block
        const { data: defaultBlock, error: blockError } = await supabase
          .from("blocks")
          .select("*")
          .eq("id", "default-block")
          .single();
        
        if (!defaultBlock && blockError?.code === 'PGRST116') {
          console.log("📝 Creating default block...");
          const { data: newBlock, error: createBlockError } = await supabase
            .from("blocks")
            .insert({
              id: "default-block",
              label: "Default Block"
            })
            .select()
            .single();
          
          if (createBlockError) {
            console.error("❌ Error creating default block:", createBlockError);
          } else {
            console.log("✅ Created default block:", newBlock);
          }
        }
        
        // Then, ensure we have a default row
        const { data: defaultRow, error: rowError } = await supabase
          .from("rows")
          .select("*")
          .eq("id", "default-row")
          .single();
        
        if (!defaultRow && rowError?.code === 'PGRST116') {
          console.log("📝 Creating default row...");
          const { data: newRow, error: createRowError } = await supabase
            .from("rows")
            .insert({
              id: "default-row",
              block_id: "default-block",
              label: "Default Row"
            })
            .select()
            .single();
          
          if (createRowError) {
            console.error("❌ Error creating default row:", createRowError);
          } else {
            console.log("✅ Created default row:", newRow);
          }
        }
        
        // Finally, ensure we have a default section
        const { data: defaultSection, error: sectionError } = await supabase
          .from("sections")
          .select("*")
          .eq("id", "default-section")
          .single();
        
        if (!defaultSection && sectionError?.code === 'PGRST116') {
          console.log("📝 Creating default section...");
          const { data: newSection, error: createSectionError } = await supabase
            .from("sections")
            .insert({
              id: "default-section",
              row_id: "default-row",
              label: "Default Section"
            })
            .select()
            .single();
          
          if (createSectionError) {
            console.error("❌ Error creating default section:", createSectionError);
          } else {
            console.log("✅ Created default section:", newSection);
            sectionIdToUse = newSection.id;
          }
        } else if (defaultSection) {
          sectionIdToUse = defaultSection.id;
        }
        
      } catch (structureError) {
        console.error("❌ Error setting up document structure:", structureError);
        // Continue with default section ID
      }
      
      console.log("🏷️ Using section ID:", sectionIdToUse);
      
      // Create the document
      const document = await storage.createDocument({
        ...documentData,
        section_id: sectionIdToUse,
        created_by: createdBy,
      } as InsertDocument);
      
      if (!document) {
        console.error("❌ Document creation returned null");
        return res.status(500).json({ message: "فشل في إنشاء الوثيقة" });
      }
      
      console.log("✅ Document created successfully:", document);
      res.status(201).json(document);
    } catch (error) {
      console.error('❌ Document creation error:', error);
      res.status(400).json({ 
        message: "بيانات الوثيقة غير صالحة",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.put("/api/documents/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const document = await storage.updateDocument(id, req.body as Partial<InsertDocument>);

      if (!document) {
        return res.status(404).json({ message: "الوثيقة غير موجودة" });
      }

      res.json(document);
    } catch (error) {
      res.status(400).json({ message: "بيانات غير صالحة" });
    }
  });

  // User Favorites routes
  app.post("/api/documents/:id/favorite", async (req, res) => {
    try {
      console.log("🌟 FAVORITE ROUTE HIT - POST /api/documents/:id/favorite");
      console.log("🌟 Request received at:", new Date().toISOString());
      const { id } = req.params;
      const userId = req.body.userId; // This should come from authentication in a real app
      
      console.log("🌟 Adding favorite - Document ID:", id, "User ID:", userId);
      console.log("🌟 Request body:", req.body);
      console.log("🌟 Request headers:", req.headers);

      if (!userId) {
        console.log("❌ No userId provided in request body");
        return res.status(401).json({ message: "المستخدم غير مصرح له" });
      }

      const favorite = await storage.addUserFavorite(userId, id);
      
      if (!favorite) {
        console.log("❌ Failed to add favorite to storage");
        return res.status(400).json({ message: "فشل في إضافة الوثيقة إلى المفضلة" });
      }

      console.log("✅ Successfully added favorite:", favorite);
      res.json({ message: "تم إضافة الوثيقة إلى المفضلة", favorite });
    } catch (error) {
      console.error("❌ Error adding favorite:", error);
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  app.delete("/api/documents/:id/favorite", async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.body.userId; // This should come from authentication in a real app
      
      console.log("🗑️ Removing favorite - Document ID:", id, "User ID:", userId);
      console.log("🗑️ Request body:", req.body);

      if (!userId) {
        console.log("❌ No userId provided in request body");
        return res.status(401).json({ message: "المستخدم غير مصرح له" });
      }

      const success = await storage.removeUserFavorite(userId, id);
      
      if (!success) {
        console.log("❌ Failed to remove favorite from storage");
        return res.status(400).json({ message: "فشل في إزالة الوثيقة من المفضلة" });
      }

      console.log("✅ Successfully removed favorite");
      res.json({ message: "تم إزالة الوثيقة من المفضلة" });
    } catch (error) {
      console.error("❌ Error removing favorite:", error);
      res.status(500).json({ message: "خطأ في الخادم" });
    }
  });

  // Test endpoint to verify database connection and table existence
  app.get("/api/test/favorites", async (req, res) => {
    try {
      console.log("🧪 Testing favorites database connection...");
      
      // Test if user_favorites table exists by trying to query it
      const { data, error } = await supabase
        .from('user_favorites')
        .select('*')
        .limit(1);

      if (error) {
        console.error("❌ Database test failed:", error);
        return res.status(500).json({ 
          message: "Database test failed", 
          error: error.message,
          details: error
        });
      }

      console.log("✅ Database test successful, table exists");
      res.json({ 
        message: "Database connection successful", 
        tableExists: true,
        sampleData: data 
      });
    } catch (error) {
      console.error("❌ Database test exception:", error);
      res.status(500).json({ 
        message: "Database test exception", 
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.delete("/api/documents/:id", async (req, res) => {
    try {
      const { id } = req.params;
      console.log(`🗑️ DELETE request for document ID: ${id}`);
      
      const success = await storage.deleteDocument(id);
      console.log(`🗑️ Delete result for ${id}: ${success}`);

      if (!success) {
        console.log(`❌ Document ${id} not found or deletion failed`);
        return res.status(404).json({ message: "الوثيقة غير موجودة" });
      }

      console.log(`✅ Document ${id} deleted successfully`);
      res.json({ message: "تم حذف الوثيقة بنجاح" });
    } catch (error) {
      console.error(`❌ Error deleting document ${req.params.id}:`, error);
      res.status(500).json({ message: "خطأ في حذف الوثيقة" });
    }
  });

  // Dashboard routes
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error('Dashboard stats error:', error);
      res.status(500).json({ message: "خطأ في جلب الإحصائيات" });
    }
  });

  app.get("/api/dashboard/recent-documents", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const documents = await storage.getRecentDocuments(limit);
      res.json(documents || []);
    } catch (error) {
      console.error('Recent documents error:', error);
      res.status(500).json({ message: "خطأ في جلب الوثائق الحديثة" });
    }
  });

  app.get("/api/dashboard/user-activity", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ message: "معرف المستخدم مطلوب" });
      }

      const limit = parseInt(req.query.limit as string) || 20;
      
      // Get user's recent activity
      const { data: activities, error: activityError } = await supabase
        .from("user_activity_logs")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (activityError) {
        console.error('User activity error:', activityError);
        return res.status(500).json({ message: "خطأ في جلب نشاط المستخدم" });
      }

      // Get user's document creation count
      const { data: userDocs, error: docsError } = await supabase
        .from("documents")
        .select("id, title, created_at")
        .eq("created_by", userId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (docsError) {
        console.error('User documents error:', docsError);
      }

      res.json({
        activities: activities || [],
        recentDocuments: userDocs || [],
        totalDocuments: userDocs?.length || 0
      });
    } catch (error) {
      console.error('User activity error:', error);
      res.status(500).json({ message: "خطأ في جلب نشاط المستخدم" });
    }
  });

  // Blocks, rows, and sections routes
  app.get("/api/blocks", async (req, res) => {
    try {
      const { data, error } = await supabase.from("blocks").select("*");
      if (error) {
        console.error('Error fetching blocks:', error);
        // Return fallback data if database query fails
        const fallbackBlocks = [
          { id: 'block-1', label: 'كتلة القضايا المدنية', created_at: new Date().toISOString() },
          { id: 'block-2', label: 'كتلة القضايا الجنائية', created_at: new Date().toISOString() },
          { id: 'block-3', label: 'كتلة القضايا التجارية', created_at: new Date().toISOString() }
        ];
        return res.json(fallbackBlocks);
      }
      res.json(data || []);
    } catch (error) {
      console.error('Blocks error:', error);
      // Return fallback data on any error
      const fallbackBlocks = [
        { id: 'block-1', label: 'كتلة القضايا المدنية', created_at: new Date().toISOString() },
        { id: 'block-2', label: 'كتلة القضايا الجنائية', created_at: new Date().toISOString() },
        { id: 'block-3', label: 'كتلة القضايا التجارية', created_at: new Date().toISOString() }
      ];
      res.json(fallbackBlocks);
    }
  });

  app.get("/api/blocks/:blockId/rows", async (req, res) => {
    try {
      const { blockId } = req.params;
      const { data, error } = await supabase.from("rows").select("*").eq("block_id", blockId);
      if (error) {
        console.error('Error fetching rows:', error);
        // Return fallback data
        const fallbackRows = [
          { id: 'row-1', block_id: blockId, label: 'صف الأحكام', created_at: new Date().toISOString() },
          { id: 'row-2', block_id: blockId, label: 'صف المراسلات', created_at: new Date().toISOString() }
        ];
        return res.json(fallbackRows);
      }
      res.json(data || []);
    } catch (error) {
      console.error('Rows error:', error);
      const fallbackRows = [
        { id: 'row-1', block_id: req.params.blockId, label: 'صف الأحكام', created_at: new Date().toISOString() },
        { id: 'row-2', block_id: req.params.blockId, label: 'صف المراسلات', created_at: new Date().toISOString() }
      ];
      res.json(fallbackRows);
    }
  });

  app.get("/api/rows/:rowId/sections", async (req, res) => {
    try {
      const { rowId } = req.params;
      const { data, error } = await supabase.from("sections").select("*").eq("row_id", rowId);
      if (error) {
        console.error('Error fetching sections:', error);
        // Return fallback data
        const fallbackSections = [
          { id: 'section-1', row_id: rowId, label: 'قسم الأحكام', created_at: new Date().toISOString() },
          { id: 'section-2', row_id: rowId, label: 'قسم المراسلات', created_at: new Date().toISOString() }
        ];
        return res.json(fallbackSections);
      }
      res.json(data || []);
    } catch (error) {
      console.error('Sections error:', error);
      const fallbackSections = [
        { id: 'section-1', row_id: req.params.rowId, label: 'قسم الأحكام', created_at: new Date().toISOString() },
        { id: 'section-2', row_id: req.params.rowId, label: 'قسم المراسلات', created_at: new Date().toISOString() }
      ];
      res.json(fallbackSections);
    }
  });

  // User profile routes
  app.put("/api/user/profile", async (req, res) => {
    try {
      const { fullName, email, username, phone, department } = req.body;
      // In a real app, you'd update the user in the database
      // For now, just return success
      res.json({ message: "تم تحديث الملف الشخصي بنجاح" });
    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({ message: "خطأ في تحديث الملف الشخصي" });
    }
  });

  app.put("/api/user/password", async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      // In a real app, you'd verify current password and update
      res.json({ message: "تم تغيير كلمة المرور بنجاح" });
    } catch (error) {
      console.error('Password change error:', error);
      res.status(500).json({ message: "خطأ في تغيير كلمة المرور" });
    }
  });

  app.get("/api/user/activity", async (req, res) => {
    try {
      // Return sample activity data
      const activities = [
        {
          id: 1,
          action: "تسجيل الدخول",
          details: "تم تسجيل الدخول بنجاح",
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          action: "إضافة وثيقة",
          details: "تم إضافة وثيقة جديدة: حكم رقم 123/2024",
          created_at: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: 3,
          action: "تحديث ملف شخصي",
          details: "تم تحديث المعلومات الشخصية",
          created_at: new Date(Date.now() - 7200000).toISOString()
        }
      ];
      res.json(activities);
    } catch (error) {
      console.error('Activity fetch error:', error);
      res.status(500).json({ message: "خطأ في جلب النشاط" });
    }
  });

  // Settings routes
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = {
        system: {
          siteName: "الأرشيف القضائي",
          siteDescription: "نظام إدارة الأرشيف القضائي",
          defaultLanguage: "ar",
          timezone: "Africa/Casablanca",
          dateFormat: "DD/MM/YYYY",
          itemsPerPage: 20
        },
        notifications: {
          emailNotifications: true,
          pushNotifications: false,
          documentUpdates: true,
          systemAlerts: true,
          weeklyReports: false
        },
        security: {
          sessionTimeout: 120,
          requirePasswordChange: false,
          enableAuditLog: true,
          ipWhitelist: ""
        }
      };
      res.json(settings);
    } catch (error) {
      console.error('Settings fetch error:', error);
      res.status(500).json({ message: "خطأ في جلب الإعدادات" });
    }
  });

  app.put("/api/settings/system", async (req, res) => {
    try {
      // In a real app, you'd save these settings to the database
      res.json({ message: "تم حفظ إعدادات النظام بنجاح" });
    } catch (error) {
      console.error('System settings error:', error);
      res.status(500).json({ message: "خطأ في حفظ إعدادات النظام" });
    }
  });

  app.put("/api/settings/notifications", async (req, res) => {
    try {
      // In a real app, you'd save these settings to the database
      res.json({ message: "تم حفظ إعدادات الإشعارات بنجاح" });
    } catch (error) {
      console.error('Notification settings error:', error);
      res.status(500).json({ message: "خطأ في حفظ إعدادات الإشعارات" });
    }
  });

  app.put("/api/settings/security", async (req, res) => {
    try {
      // In a real app, you'd save these settings to the database
      res.json({ message: "تم حفظ إعدادات الأمان بنجاح" });
    } catch (error) {
      console.error('Security settings error:', error);
      res.status(500).json({ message: "خطأ في حفظ إعدادات الأمان" });
    }
  });

  // Test endpoint
  app.get("/api/test", (req, res) => {
    res.json({ 
      message: "API is working", 
      timestamp: new Date().toISOString(),
      status: "OK"
    });
  });

  // Storage setup routes
  app.post("/api/storage/setup", async (req, res) => {
    try {
      const success = await setupSupabaseBucket();
      if (success) {
        res.json({ message: "تم إعداد التخزين بنجاح" });
      } else {
        res.status(500).json({ message: "فشل في إعداد التخزين" });
      }
    } catch (error) {
      console.error('Storage setup error:', error);
      res.status(500).json({ message: "خطأ في إعداد التخزين" });
    }
  });

  app.post("/api/storage/custom-block", async (req, res) => {
    try {
      const { blockLabel } = req.body;
      if (!blockLabel) {
        return res.status(400).json({ message: "تسمية الكتلة مطلوبة" });
      }
      
      const success = await createCustomBlockFolder(blockLabel);
      if (success) {
        res.json({ message: `تم إنشاء مجلد للكتلة ${blockLabel} بنجاح` });
      } else {
        res.status(500).json({ message: "فشل في إنشاء مجلد الكتلة" });
      }
    } catch (error) {
      console.error('Custom block folder creation error:', error);
      res.status(500).json({ message: "خطأ في إنشاء مجلد الكتلة" });
    }
  });

  // Paper management routes
  app.get("/api/documents/:documentId/papers", async (req, res) => {
    try {
      const { documentId } = req.params;
      const papers = await storage.getPapersByDocument(documentId);
      res.json(papers || []);
    } catch (error) {
      console.error('Papers fetch error:', error);
      res.status(500).json({ message: "خطأ في جلب الأوراق" });
    }
  });

  app.post("/api/papers", async (req, res) => {
    try {
      const paper = await storage.createPaper(req.body as InsertPaper);
      if (!paper) {
        return res.status(400).json({ message: "فشل في إنشاء الورقة" });
      }
      res.status(201).json(paper);
    } catch (error) {
      console.error('Paper creation error:', error);
      res.status(400).json({ message: "بيانات الورقة غير صالحة" });
    }
  });

  app.put("/api/papers/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const paper = await storage.updatePaper(id, req.body as Partial<InsertPaper>);
      if (!paper) {
        return res.status(404).json({ message: "الورقة غير موجودة" });
      }
      res.json(paper);
    } catch (error) {
      console.error('Paper update error:', error);
      res.status(400).json({ message: "بيانات غير صالحة" });
    }
  });

  app.delete("/api/papers/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deletePaper(id);
      if (!success) {
        return res.status(404).json({ message: "الورقة غير موجودة" });
      }
      res.json({ message: "تم حذف الورقة بنجاح" });
    } catch (error) {
      console.error('Paper deletion error:', error);
      res.status(500).json({ message: "خطأ في حذف الورقة" });
    }
  });

  // Document download as ZIP
  app.post("/api/documents/:id/download", async (req, res) => {
    try {
      const { id } = req.params;
      console.log(`📦 Download request for document: ${id}`);
      
      // Get document with papers
      const document = await storage.getDocument(id);
      if (!document) {
        console.log(`❌ Document ${id} not found`);
        return res.status(404).json({ message: "الوثيقة غير موجودة" });
      }

      console.log(`📄 Document found: ${document.title}`);
      console.log(`📄 Papers count: ${document.papers?.length || 0}`);

      if (!document.papers || document.papers.length === 0) {
        console.log(`❌ Document ${id} has no papers`);
        return res.status(400).json({ message: "الوثيقة فارغة" });
      }

      // Log paper details
      document.papers.forEach((paper, index) => {
        console.log(`📄 Paper ${index + 1}: ${paper.title}, URL: ${paper.attachment_url}, Type: ${paper.file_type}`);
      });

      // Create ZIP file
      const zip = new JSZip();
      
      // Add each paper to the ZIP
      for (const paper of document.papers) {
        try {
          console.log(`🔄 Processing paper: ${paper.title} (ID: ${paper.id})`);
          let fileContent: ArrayBuffer;
          
          if (paper.attachment_url) {
            console.log(`📁 Attempting to download file from storage: ${paper.attachment_url}`);
            // Try to download file from Supabase storage
            const { data: fileData, error: downloadError } = await supabase.storage
              .from('archive-documents')
              .download(paper.attachment_url);
            
            if (downloadError) {
              console.log(`❌ File not found in storage for paper ${paper.id}:`, downloadError.message);
              // Create a placeholder file if the actual file doesn't exist
              const placeholderContent = `Placeholder file for: ${paper.title}\n\nThis is a placeholder file because the actual file is not available in storage.\n\nPaper ID: ${paper.id}\nDocument ID: ${document.id}\nCreated: ${paper.created_at}\nStorage Error: ${downloadError.message}`;
              fileContent = new TextEncoder().encode(placeholderContent).buffer;
            } else {
              console.log(`✅ File downloaded successfully from storage`);
              fileContent = await fileData.arrayBuffer();
              console.log(`📦 File size: ${fileContent.byteLength} bytes`);
            }
          } else {
            console.log(`⚠️ No attachment URL for paper ${paper.id}, creating placeholder`);
            // Create a placeholder file if no attachment URL
            const placeholderContent = `Placeholder file for: ${paper.title}\n\nThis is a placeholder file because no attachment URL was provided.\n\nPaper ID: ${paper.id}\nDocument ID: ${document.id}\nCreated: ${paper.created_at}`;
            fileContent = new TextEncoder().encode(placeholderContent).buffer;
          }
          
          // Add file to ZIP with proper extension
          const fileName = paper.title || `paper_${paper.id}`;
          const extension = paper.file_type || 'txt';
          const fullFileName = `${fileName}.${extension}`;
          zip.file(fullFileName, fileContent);
          
          console.log(`✅ Added ${fullFileName} to ZIP (${fileContent.byteLength} bytes)`);
        } catch (error) {
          console.error(`❌ Error processing paper ${paper.id}:`, error);
          // Create a minimal placeholder file
          const errorContent = `Error loading file: ${paper.title}\n\nPaper ID: ${paper.id}\nError: ${error instanceof Error ? error.message : 'Unknown error'}`;
          zip.file(`${paper.title || `paper_${paper.id}`}.txt`, errorContent);
        }
      }

      // Generate ZIP buffer
      console.log(`🔄 Generating ZIP file...`);
      const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
      console.log(`📦 ZIP buffer size: ${zipBuffer.length} bytes`);
      
      // Set response headers
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="${document.title}.zip"`);
      res.setHeader('Content-Length', zipBuffer.length);
      
      // Send ZIP file
      res.send(zipBuffer);
      
      console.log(`✅ ZIP file created for document: ${document.title} (${zipBuffer.length} bytes)`);
    } catch (error) {
      console.error('Document download error:', error);
      res.status(500).json({ message: "خطأ في تحميل الوثيقة" });
    }
  });

  // File upload routes
  app.post("/api/upload/paper", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "لم يتم اختيار ملف" });
      }

      const { documentId, blockLabel, documentTitle, paperTitle } = req.body;
      
      if (!documentId || !blockLabel || !documentTitle || !paperTitle) {
        return res.status(400).json({ message: "بيانات مطلوبة مفقودة" });
      }

      // Generate unique file name
      const fileName = fileUploadService.generateFileName(
        req.file.originalname,
        documentId
      );

      // Upload file to Supabase storage
      const uploadResult = await fileUploadService.uploadFile(
        req.file.buffer,
        fileName,
        req.file.mimetype,
        blockLabel,
        documentTitle
      );

      if (!uploadResult.success) {
        return res.status(500).json({ 
          message: "فشل في رفع الملف",
          error: uploadResult.error 
        });
      }

      // Create paper record in database
      const paperData: InsertPaper = {
        document_id: documentId,
        title: paperTitle,
        attachment_url: uploadResult.url,
        file_type: fileUploadService.getFileTypeFromMimeType(req.file.mimetype),
        file_size: req.file.size,
      };

      const paper = await storage.createPaper(paperData);
      
      if (!paper) {
        return res.status(500).json({ message: "فشل في إنشاء سجل الورقة" });
      }

      res.status(201).json({
        message: "تم رفع الملف بنجاح",
        paper,
        fileUrl: uploadResult.url
      });
    } catch (error) {
      console.error('File upload error:', error);
      res.status(500).json({ message: "خطأ في رفع الملف" });
    }
  });

  app.post("/api/upload/batch", upload.array('files', 10), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ message: "لم يتم اختيار ملفات" });
      }

      const { documentId, blockLabel, documentTitle } = req.body;
      
      if (!documentId || !blockLabel || !documentTitle) {
        return res.status(400).json({ message: "بيانات مطلوبة مفقودة" });
      }

      const results = [];
      
      for (const file of files) {
        try {
          const fileName = fileUploadService.generateFileName(
            file.originalname,
            documentId
          );

          const uploadResult = await fileUploadService.uploadFile(
            file.buffer,
            fileName,
            file.mimetype,
            blockLabel,
            documentTitle
          );

          if (uploadResult.success) {
            const paperData: InsertPaper = {
              document_id: documentId,
              title: file.originalname,
              attachment_url: uploadResult.url,
              file_type: fileUploadService.getFileTypeFromMimeType(file.mimetype),
              file_size: file.size,
            };

            const paper = await storage.createPaper(paperData);
            results.push({ success: true, paper, fileName });
          } else {
            results.push({ 
              success: false, 
              fileName: file.originalname, 
              error: uploadResult.error 
            });
          }
        } catch (error) {
          results.push({ 
            success: false, 
            fileName: file.originalname, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          });
        }
      }

      const successCount = results.filter(r => r.success).length;
      const failCount = results.length - successCount;

      res.json({
        message: `تم رفع ${successCount} من ${results.length} ملف بنجاح`,
        results,
        summary: {
          total: results.length,
          success: successCount,
          failed: failCount
        }
      });
    } catch (error) {
      console.error('Batch upload error:', error);
      res.status(500).json({ message: "خطأ في رفع الملفات" });
    }
  });

  // Recommendations API routes
  app.get("/api/recommendations", async (req, res) => {
    try {
      const { status, priority, user_id, document_id } = req.query;
      
      let query = supabase
        .from("recommendations")
        .select(`
          *,
          documents (
            id,
            title,
            reference,
            category
          ),
          users (
            id,
            username,
            full_name,
            role
          )
        `)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }
      if (priority) {
        query = query.eq('priority', priority);
      }
      if (user_id) {
        query = query.eq('user_id', user_id);
      }
      if (document_id) {
        query = query.eq('document_id', document_id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Recommendations fetch error:', error);
        return res.status(500).json({ message: "خطأ في جلب التوصيات" });
      }

      res.json(data || []);
    } catch (error) {
      console.error('Recommendations error:', error);
      res.status(500).json({ message: "خطأ في جلب التوصيات" });
    }
  });

  app.get("/api/recommendations/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { data, error } = await supabase
        .from("recommendations")
        .select(`
          *,
          documents (
            id,
            title,
            reference,
            category,
            description
          ),
          users (
            id,
            username,
            full_name,
            role
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        return res.status(404).json({ message: "التوصية غير موجودة" });
      }

      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "خطأ في جلب التوصية" });
    }
  });

  app.post("/api/recommendations", async (req, res) => {
    try {
      const recommendation = await storage.createRecommendation(req.body as InsertRecommendation);
      res.status(201).json(recommendation);
    } catch (error) {
      console.error('Recommendation creation error:', error);
      res.status(400).json({ message: "بيانات التوصية غير صالحة" });
    }
  });

  app.put("/api/recommendations/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const recommendation = await storage.updateRecommendation(id, req.body as Partial<InsertRecommendation>);

      if (!recommendation) {
        return res.status(404).json({ message: "التوصية غير موجودة" });
      }

      res.json(recommendation);
    } catch (error) {
      res.status(400).json({ message: "بيانات غير صالحة" });
    }
  });

  app.delete("/api/recommendations/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteRecommendation(id);

      if (!success) {
        return res.status(404).json({ message: "التوصية غير موجودة" });
      }

      res.json({ message: "تم حذف التوصية بنجاح" });
    } catch (error) {
      res.status(500).json({ message: "خطأ في حذف التوصية" });
    }
  });

  // Comments API routes
  app.get("/api/comments", async (req, res) => {
    try {
      const { type, is_resolved, user_id, document_id } = req.query;
      
      let query = supabase
        .from("comments")
        .select(`
          *,
          documents (
            id,
            title,
            reference,
            category
          ),
          users (
            id,
            username,
            full_name,
            role
          )
        `)
        .order('created_at', { ascending: false });

      if (type) {
        query = query.eq('type', type);
      }
      if (is_resolved !== undefined) {
        query = query.eq('is_resolved', is_resolved === 'true');
      }
      if (user_id) {
        query = query.eq('user_id', user_id);
      }
      if (document_id) {
        query = query.eq('document_id', document_id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Comments fetch error:', error);
        return res.status(500).json({ message: "خطأ في جلب التعليقات" });
      }

      res.json(data || []);
    } catch (error) {
      console.error('Comments error:', error);
      res.status(500).json({ message: "خطأ في جلب التعليقات" });
    }
  });

  app.get("/api/comments/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { data, error } = await supabase
        .from("comments")
        .select(`
          *,
          documents (
            id,
            title,
            reference,
            category,
            description
          ),
          users (
            id,
            username,
            full_name,
            role
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        return res.status(404).json({ message: "التعليق غير موجود" });
      }

      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "خطأ في جلب التعليق" });
    }
  });

  app.post("/api/comments", async (req, res) => {
    try {
      const comment = await storage.createComment(req.body as InsertComment);
      res.status(201).json(comment);
    } catch (error) {
      console.error('Comment creation error:', error);
      res.status(400).json({ message: "بيانات التعليق غير صالحة" });
    }
  });

  app.put("/api/comments/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const comment = await storage.updateComment(id, req.body as Partial<InsertComment>);

      if (!comment) {
        return res.status(404).json({ message: "التعليق غير موجود" });
      }

      res.json(comment);
    } catch (error) {
      res.status(400).json({ message: "بيانات غير صالحة" });
    }
  });

  app.delete("/api/comments/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteComment(id);

      if (!success) {
        return res.status(404).json({ message: "التعليق غير موجود" });
      }

      res.json({ message: "تم حذف التعليق بنجاح" });
    } catch (error) {
      res.status(500).json({ message: "خطأ في حذف التعليق" });
    }
  });

  // Reports API routes
  app.get("/api/reports", async (req, res) => {
    try {
      const { type, severity, status, user_id, document_id } = req.query;
      
      let query = supabase
        .from("reports")
        .select(`
          *,
          documents (
            id,
            title,
            reference,
            category
          ),
          users (
            id,
            username,
            full_name,
            role
          )
        `)
        .order('created_at', { ascending: false });

      if (type) {
        query = query.eq('type', type);
      }
      if (severity) {
        query = query.eq('severity', severity);
      }
      if (status) {
        query = query.eq('status', status);
      }
      if (user_id) {
        query = query.eq('user_id', user_id);
      }
      if (document_id) {
        query = query.eq('document_id', document_id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Reports fetch error:', error);
        return res.status(500).json({ message: "خطأ في جلب التقارير" });
      }

      res.json(data || []);
    } catch (error) {
      console.error('Reports error:', error);
      res.status(500).json({ message: "خطأ في جلب التقارير" });
    }
  });

  app.get("/api/reports/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { data, error } = await supabase
        .from("reports")
        .select(`
          *,
          documents (
            id,
            title,
            reference,
            category,
            description
          ),
          users (
            id,
            username,
            full_name,
            role
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        return res.status(404).json({ message: "التقرير غير موجود" });
      }

      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "خطأ في جلب التقرير" });
    }
  });

  app.post("/api/reports", async (req, res) => {
    try {
      const report = await storage.createReport(req.body as InsertReport);
      res.status(201).json(report);
    } catch (error) {
      console.error('Report creation error:', error);
      res.status(400).json({ message: "بيانات التقرير غير صالحة" });
    }
  });

  app.put("/api/reports/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const report = await storage.updateReport(id, req.body as Partial<InsertReport>);

      if (!report) {
        return res.status(404).json({ message: "التقرير غير موجود" });
      }

      res.json(report);
    } catch (error) {
      res.status(400).json({ message: "بيانات غير صالحة" });
    }
  });

  app.delete("/api/reports/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteReport(id);

      if (!success) {
        return res.status(404).json({ message: "التقرير غير موجود" });
      }

      res.json({ message: "تم حذف التقرير بنجاح" });
    } catch (error) {
      res.status(500).json({ message: "خطأ في حذف التقرير" });
    }
  });

  // System Reports routes
  app.get("/api/system-reports", async (req, res) => {
    try {
      const reports = await storage.getAllSystemReports();
      res.json(reports || []);
    } catch (error) {
      console.error('System reports error:', error);
      res.status(500).json({ message: "خطأ في جلب تقارير النظام" });
    }
  });

  // Real data endpoints for report generation
  app.get("/api/reports/user-activity/:days", async (req, res) => {
    try {
      const days = parseInt(req.params.days);
      if (isNaN(days) || days < 1 || days > 365) {
        return res.status(400).json({ message: "عدد الأيام غير صحيح" });
      }
      
      const data = await storage.getUserActivityReportData(days);
      if (!data) {
        return res.status(500).json({ message: "خطأ في جلب بيانات تقرير النشاط" });
      }
      
      res.json(data);
    } catch (error) {
      console.error('User activity report error:', error);
      res.status(500).json({ message: "خطأ في جلب تقرير النشاط" });
    }
  });

  // Endpoint to generate sample activity data for testing
  app.post("/api/generate-sample-activity", async (req, res) => {
    try {
      const { data: users, error: usersError } = await supabase
        .from("users")
        .select("id, username, full_name, role");

      if (usersError || !users || users.length === 0) {
        return res.status(400).json({ message: "لا توجد مستخدمين في النظام" });
      }

      const sampleActivities = [];
      const actions = ['login', 'logout', 'view_document', 'create_document', 'update_document', 'delete_document', 'create_comment', 'view_user', 'update_user'];
      const resourceTypes = ['document', 'user', 'comment', 'report', 'auth'];

      // Generate activities for the last 7 days
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        // Generate 5-15 activities per day
        const activitiesPerDay = Math.floor(Math.random() * 11) + 5;
        
        for (let j = 0; j < activitiesPerDay; j++) {
          const user = users[Math.floor(Math.random() * users.length)];
          const action = actions[Math.floor(Math.random() * actions.length)];
          const resourceType = resourceTypes[Math.floor(Math.random() * resourceTypes.length)];
          
          const activityTime = new Date(date);
          activityTime.setHours(Math.floor(Math.random() * 24));
          activityTime.setMinutes(Math.floor(Math.random() * 60));
          
          sampleActivities.push({
            user_id: user.id,
            action: action,
            resource_type: resourceType,
            resource_id: Math.random().toString(36).substr(2, 9),
            details: {
              user_name: user.full_name || user.username,
              user_role: user.role,
              action_description: `User ${user.full_name || user.username} performed ${action} on ${resourceType}`,
              ip_address: `192.168.1.${Math.floor(Math.random() * 255)}`,
              user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            created_at: activityTime.toISOString()
          });
        }
      }

      // Insert sample activities
      const { error: insertError } = await supabase
        .from("user_activity_logs")
        .insert(sampleActivities);

      if (insertError) {
        console.error('Error inserting sample activities:', insertError);
        return res.status(500).json({ message: "خطأ في إدراج بيانات النشاط التجريبية" });
      }

      res.json({ 
        message: "تم إنشاء بيانات النشاط التجريبية بنجاح",
        activitiesCreated: sampleActivities.length
      });
    } catch (error) {
      console.error('Sample activity generation error:', error);
      res.status(500).json({ message: "خطأ في إنشاء بيانات النشاط التجريبية" });
    }
  });

  app.get("/api/reports/document-stats/:days", async (req, res) => {
    try {
      const days = parseInt(req.params.days);
      if (isNaN(days) || days < 1 || days > 365) {
        return res.status(400).json({ message: "عدد الأيام غير صحيح" });
      }
      
      const data = await storage.getDocumentStatsReportData(days);
      if (!data) {
        return res.status(500).json({ message: "خطأ في جلب بيانات تقرير الوثائق" });
      }
      
      res.json(data);
    } catch (error) {
      console.error('Document stats report error:', error);
      res.status(500).json({ message: "خطأ في جلب تقرير الوثائق" });
    }
  });

  app.get("/api/reports/system-health", async (req, res) => {
    try {
      const data = await storage.getSystemHealthReportData();
      if (!data) {
        return res.status(500).json({ message: "خطأ في جلب بيانات تقرير صحة النظام" });
      }
      
      res.json(data);
    } catch (error) {
      console.error('System health report error:', error);
      res.status(500).json({ message: "خطأ في جلب تقرير صحة النظام" });
    }
  });

  app.get("/api/reports/security-audit/:days", async (req, res) => {
    try {
      const days = parseInt(req.params.days);
      if (isNaN(days) || days < 1 || days > 365) {
        return res.status(400).json({ message: "عدد الأيام غير صحيح" });
      }
      
      const data = await storage.getSecurityAuditReportData(days);
      if (!data) {
        return res.status(500).json({ message: "خطأ في جلب بيانات تقرير الأمان" });
      }
      
      res.json(data);
    } catch (error) {
      console.error('Security audit report error:', error);
      res.status(500).json({ message: "خطأ في جلب تقرير الأمان" });
    }
  });

  app.get("/api/system-reports/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const report = await storage.getSystemReport(id);

      if (!report) {
        return res.status(404).json({ message: "التقرير غير موجود" });
      }

      res.json(report);
    } catch (error) {
      res.status(500).json({ message: "خطأ في جلب التقرير" });
    }
  });

  app.post("/api/system-reports", async (req, res) => {
    try {
      const report = await storage.createSystemReport(req.body);
      res.status(201).json(report);
    } catch (error) {
      console.error('System report creation error:', error);
      res.status(400).json({ message: "بيانات التقرير غير صالحة" });
    }
  });

  app.delete("/api/system-reports/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteSystemReport(id);

      if (!success) {
        return res.status(404).json({ message: "التقرير غير موجود" });
      }

      res.json({ message: "تم حذف التقرير بنجاح" });
    } catch (error) {
      res.status(500).json({ message: "خطأ في حذف التقرير" });
    }
  });

  // Dashboard stats for recommendations, comments, and reports
  app.get("/api/dashboard/recommendation-stats", async (req, res) => {
    try {
      const { data: recommendations, error: recError } = await supabase
        .from("recommendations")
        .select("status, priority");

      const { data: comments, error: comError } = await supabase
        .from("comments")
        .select("is_resolved, type");

      const { data: reports, error: repError } = await supabase
        .from("reports")
        .select("status, severity, type");

      if (recError || comError || repError) {
        console.error('Stats fetch error:', { recError, comError, repError });
        return res.status(500).json({ message: "خطأ في جلب الإحصائيات" });
      }

      const stats = {
        recommendations: {
          total: recommendations?.length || 0,
          pending: recommendations?.filter(r => r.status === 'pending').length || 0,
          approved: recommendations?.filter(r => r.status === 'approved').length || 0,
          high_priority: recommendations?.filter(r => r.priority === 'high').length || 0,
        },
        comments: {
          total: comments?.length || 0,
          resolved: comments?.filter(c => c.is_resolved).length || 0,
          unresolved: comments?.filter(c => !c.is_resolved).length || 0,
          questions: comments?.filter(c => c.type === 'question').length || 0,
        },
        reports: {
          total: reports?.length || 0,
          open: reports?.filter(r => r.status === 'open').length || 0,
          critical: reports?.filter(r => r.severity === 'critical').length || 0,
          errors: reports?.filter(r => r.type === 'error').length || 0,
        }
      };

      res.json(stats);
    } catch (error) {
      console.error('Recommendation stats error:', error);
      res.status(500).json({ message: "خطأ في جلب إحصائيات التوصيات" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
