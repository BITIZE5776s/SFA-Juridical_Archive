import { supabase } from "./supabase";

export async function setupSupabaseBucket() {
  const bucketName = "archive-documents";
  
  try {
    console.log("Setting up Supabase storage bucket...");
    
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error("Error listing buckets:", listError);
      return false;
    }
    
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      console.log(`Creating bucket: ${bucketName}`);
      const { data: bucket, error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        allowedMimeTypes: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
          'text/plain',
          'application/rtf'
        ],
        fileSizeLimit: 52428800 // 50MB
      });
      
      if (createError) {
        console.error("Error creating bucket:", createError);
        return false;
      }
      
      console.log("Bucket created successfully:", bucket);
    } else {
      console.log("Bucket already exists");
    }
    
    // Create folder structure for A-Z blocks
    console.log("Creating folder structure for A-Z blocks...");
    const alphabetBlocks = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));
    
    for (const block of alphabetBlocks) {
      try {
        // Create a placeholder file to ensure the folder exists
        const placeholderPath = `${block}/.gitkeep`;
        const { error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(placeholderPath, new Blob([''], { type: 'text/plain' }), {
            contentType: 'text/plain',
            cacheControl: '3600'
          });
        
        if (uploadError && !uploadError.message.includes('already exists')) {
          console.error(`Error creating folder for block ${block}:`, uploadError);
        } else {
          console.log(`✓ Created folder for block ${block}`);
        }
      } catch (error) {
        console.error(`Error processing block ${block}:`, error);
      }
    }
    
    console.log("Bucket setup completed successfully!");
    return true;
    
  } catch (error) {
    console.error("Error setting up bucket:", error);
    return false;
  }
}

export async function createCustomBlockFolder(blockLabel: string) {
  const bucketName = "archive-documents";
  
  try {
    console.log(`Creating folder for custom block: ${blockLabel}`);
    
    // Create a placeholder file to ensure the folder exists
    const placeholderPath = `${blockLabel}/.gitkeep`;
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(placeholderPath, new Blob([''], { type: 'text/plain' }), {
        contentType: 'text/plain',
        cacheControl: '3600'
      });
    
    if (uploadError && !uploadError.message.includes('already exists')) {
      console.error(`Error creating folder for custom block ${blockLabel}:`, uploadError);
      return false;
    } else {
      console.log(`✓ Created folder for custom block ${blockLabel}`);
      return true;
    }
  } catch (error) {
    console.error("Error creating custom block folder %s:", blockLabel, error);
    return false;
  }
}

export async function getBucketStructure() {
  const bucketName = "archive-documents";
  
  try {
    const { data: files, error } = await supabase.storage
      .from(bucketName)
      .list('', {
        limit: 1000,
        sortBy: { column: 'name', order: 'asc' }
      });
    
    if (error) {
      console.error("Error listing bucket contents:", error);
      return null;
    }
    
    // Group files by folder (block)
    const structure: Record<string, string[]> = {};
    
    files?.forEach(file => {
      if (file.name !== '.gitkeep') {
        const parts = file.name.split('/');
        if (parts.length > 1) {
          const block = parts[0];
          if (!structure[block]) {
            structure[block] = [];
          }
          structure[block].push(parts.slice(1).join('/'));
        }
      }
    });
    
    return structure;
  } catch (error) {
    console.error("Error getting bucket structure:", error);
    return null;
  }
}

// Run setup if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupSupabaseBucket()
    .then(success => {
      if (success) {
        console.log("✅ Bucket setup completed successfully!");
        process.exit(0);
      } else {
        console.log("❌ Bucket setup failed!");
        process.exit(1);
      }
    })
    .catch(error => {
      console.error("❌ Setup error:", error);
      process.exit(1);
    });
}
