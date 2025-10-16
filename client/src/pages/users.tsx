import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu as DropdownMenuRoot,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { formatDateArabic } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { type User, type InsertUser, type UserStats, type UserActivityLog } from "@shared/schema";
import { ROLE_LABELS } from "@/lib/constants";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { z } from "zod";
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  Building, 
  Shield, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  X, 
  Check, 
  Eye, 
  Mail as MailIcon,
  Calendar,
  Activity,
  FileText,
  MessageSquare,
  Lightbulb,
  Flag,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle
} from "@/lib/icons";

const userSchema = z.object({
  username: z.string().min(3, "اسم المستخدم يجب أن يكون 3 أحرف على الأقل"),
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  fullName: z.string().min(2, "الاسم الكامل مطلوب"),
  role: z.enum(["admin", "archivist", "viewer"]),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل").optional(),
});

const restrictUserSchema = z.object({
  reason: z.string().optional(),
});

type UserFormData = z.infer<typeof userSchema>;
type RestrictUserFormData = z.infer<typeof restrictUserSchema>;

const restrictionReasons = [
  "سوء السلوك",
  "عدم الالتزام بالقوانين",
  "إساءة استخدام الصلاحيات",
  "عدم الحضور",
  "مخالفة الأمان",
  "سبب إداري",
  "سبب غير محدد"
];

export default function Users() {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUserDetailModalOpen, setIsUserDetailModalOpen] = useState(false);
  const [isRestrictModalOpen, setIsRestrictModalOpen] = useState(false);
  const [isSelfDeleteModalOpen, setIsSelfDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isRestrictConfirmOpen, setIsRestrictConfirmOpen] = useState(false);
  const [pendingRestriction, setPendingRestriction] = useState<{id: string, reason: string, restrict: boolean} | null>(null);
  const [isRoleSelectOpen, setIsRoleSelectOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('');

  const { data: usersData = [], isLoading, error } = useQuery<User[]>({
    queryKey: ["/api/users"],
    queryFn: async () => {
      try {
        console.log("Fetching users from API...");
        const response = await apiRequest("GET", "/api/users");
        console.log("Raw response:", response);
        
        // Parse the JSON from the response
        const users = await response.json();
        console.log("Parsed users data:", users);
        console.log("Users type:", typeof users);
        console.log("Is array:", Array.isArray(users));
        console.log("Users length:", users?.length);
        
        if (Array.isArray(users)) {
          console.log("First user:", users[0]);
          return users;
        } else {
          console.warn("Users is not an array:", users);
          return [];
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        return [];
      }
    },
  });

  // Ensure users is always an array
  const users = Array.isArray(usersData) ? usersData : [];

  const { data: userStats } = useQuery<UserStats>({
    queryKey: ["/api/users", selectedUser?.id, "stats"],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/users/${selectedUser?.id}/stats`);
      return await response.json();
    },
    enabled: !!selectedUser,
  });

  const { data: userActivity = [] } = useQuery<UserActivityLog[]>({
    queryKey: ["/api/users", selectedUser?.id, "activity"],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/users/${selectedUser?.id}/activity`);
      return await response.json();
    },
    enabled: !!selectedUser,
  });

  const userForm = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: "",
      email: "",
      fullName: "",
      role: "viewer",
      password: "",
    },
  });

  const restrictForm = useForm<RestrictUserFormData>({
    resolver: zodResolver(restrictUserSchema),
    defaultValues: {
      reason: "",
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: UserFormData) => {
      const response = await apiRequest("POST", "/api/users", data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم الإنشاء",
        description: "تم إنشاء المستخدم بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setIsCreateModalOpen(false);
      userForm.reset();
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في إنشاء المستخدم",
        variant: "destructive",
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<UserFormData> }) => {
      const response = await apiRequest("PUT", `/api/users/${id}`, data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم التحديث",
        description: "تم تحديث المستخدم بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setIsCreateModalOpen(false);
      setSelectedUser(null);
      userForm.reset();
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في تحديث المستخدم",
        variant: "destructive",
      });
    },
  });

  const restrictUserMutation = useMutation({
    mutationFn: async ({ id, reason, restrict }: { id: string; reason: string; restrict: boolean }) => {
      const response = await apiRequest("PUT", `/api/users/${id}/restrict`, {
        restrictedBy: currentUser?.id,
        reason,
        restrict,
      });
      return await response.json();
    },
    onSuccess: (_, { restrict }) => {
      toast({
        title: "تم التقييد",
        description: restrict ? "تم تقييد المستخدم بنجاح" : "تم إلغاء تقييد المستخدم بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setIsRestrictModalOpen(false);
      restrictForm.reset();
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في تقييد المستخدم",
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/users/${id}`);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم الحذف",
        description: "تم حذف المستخدم بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في حذف المستخدم",
        variant: "destructive",
      });
    },
  });

  const permanentDeleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/users/${id}/permanent`);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم الحذف النهائي",
        description: "تم حذف المستخدم نهائياً من النظام",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في حذف المستخدم نهائياً",
        variant: "destructive",
      });
    },
  });

  const selfDeleteMutation = useMutation({
    mutationFn: async ({ id, password }: { id: string; password: string }) => {
      const response = await apiRequest("DELETE", `/api/users/${id}/permanent`, {
        password: password
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم حذف الحساب",
        description: "تم حذف حسابك نهائياً من النظام. سيتم تسجيل خروجك تلقائياً...",
      });
      
      // Force logout immediately using the auth service
      setTimeout(() => {
        // Import and use the force logout function
        import('@/lib/auth').then(({ authService }) => {
          authService.forceLogout();
        });
      }, 1000); // 1 second delay to show the success message
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "فشل في حذف الحساب",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: UserFormData) => {
    if (selectedUser) {
      updateUserMutation.mutate({ id: selectedUser.id, data });
    } else {
      createUserMutation.mutate(data);
    }
  };

  const onRestrictSubmit = (data: RestrictUserFormData) => {
    if (selectedUser) {
      // If it's a viewer being unrestricted, show role selection
      if (selectedUser.role === 'viewer' && selectedUser.isRestricted) {
        setIsRestrictModalOpen(false);
        setIsRoleSelectOpen(true);
        return;
      }
      
      // For other cases, show confirmation dialog
      setPendingRestriction({
        id: selectedUser.id,
        reason: data.reason || "سبب غير محدد",
        restrict: !selectedUser.isRestricted,
      });
      setIsRestrictModalOpen(false);
      setIsRestrictConfirmOpen(true);
    }
  };

  const confirmRestriction = () => {
    if (pendingRestriction) {
      restrictUserMutation.mutate(pendingRestriction);
      setIsRestrictConfirmOpen(false);
      setPendingRestriction(null);
    }
  };

  const cancelRestriction = () => {
    setIsRestrictConfirmOpen(false);
    setPendingRestriction(null);
  };

  const updateUserRoleMutation = useMutation({
    mutationFn: async (data: { id: string; role: string; userId: string }) => {
      // First update the role
      const roleResponse = await apiRequest("PUT", `/api/users/${data.id}`, {
        role: data.role
      });
      
      // Then unrestrict the user
      const unrestrictResponse = await apiRequest("PUT", `/api/users/${data.userId}/restrict`, {
        restrictedBy: currentUser?.id,
        reason: "",
        restrict: false,
      });
      
      return await roleResponse.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setIsRoleSelectOpen(false);
      setSelectedRole('');
      toast({
        title: "تم إلغاء التقييد",
        description: `تم إلغاء تقييد المستخدم وتغيير دوره إلى ${variables.role === 'admin' ? 'مدير' : variables.role === 'archivist' ? 'أمين الأرشيف' : 'مستعرض'}`,
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في إلغاء التقييد",
        variant: "destructive",
      });
    },
  });

  const confirmRoleSelection = () => {
    if (selectedUser && selectedRole) {
      updateUserRoleMutation.mutate({
        id: selectedUser.id,
        role: selectedRole,
        userId: selectedUser.id
      });
    }
  };

  const cancelRoleSelection = () => {
    setIsRoleSelectOpen(false);
    setSelectedRole('');
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    userForm.reset({
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role as "admin" | "archivist" | "viewer",
      password: "",
    });
    setIsCreateModalOpen(true);
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsUserDetailModalOpen(true);
  };

  const handleRestrictUser = (user: User) => {
    setSelectedUser(user);
    restrictForm.reset({ reason: "" });
    setIsRestrictModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsCreateModalOpen(false);
    setIsUserDetailModalOpen(false);
    setIsRestrictModalOpen(false);
    setIsSelfDeleteModalOpen(false);
    setSelectedUser(null);
    setDeletePassword("");
    setDeleteConfirmation("");
    userForm.reset();
    restrictForm.reset();
  };

  const handleSelfDelete = (user: User) => {
    setSelectedUser(user);
    setDeletePassword("");
    setDeleteConfirmation("");
    setIsSelfDeleteModalOpen(true);
  };

  const onSelfDeleteSubmit = () => {
    if (!selectedUser) return;
    
    // Validate password and confirmation
    if (!deletePassword) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال كلمة المرور",
        variant: "destructive",
      });
      return;
    }
    
    // Accept confirmation in multiple languages
    const validConfirmations = [
      "حذف حسابي",           // Arabic
      "remove my account",    // English
      "supprimer mon compte"  // French
    ];
    
    if (!validConfirmations.includes(deleteConfirmation)) {
      toast({
        title: "خطأ",
        description: "يرجى كتابة 'حذف حسابي' أو 'remove my account' أو 'supprimer mon compte' للتأكيد",
        variant: "destructive",
      });
      return;
    }
    
    selfDeleteMutation.mutate({
      id: selectedUser.id,
      password: deletePassword
    });
  };

  const handleEmailUser = (user: User) => {
    window.open(`mailto:${user.email}?subject=رسالة من إدارة النظام`, '_blank');
  };

  const filteredUsers = users.filter((user) => {
    // Add safety checks for undefined properties
    if (!user || !user.fullName || !user.username || !user.email) {
      return false;
    }

    const matchesSearch =
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === "" || roleFilter === "all" || user.role === roleFilter;
    const isActive = user.isActive;
    const isRestricted = user.isRestricted;
    
    const matchesStatus = statusFilter === "" || statusFilter === "all" ||
      (statusFilter === "active" && isActive && !isRestricted) ||
      (statusFilter === "inactive" && !isActive) ||
      (statusFilter === "restricted" && isRestricted);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadgeColor = (role: string) => {
    const colors = {
      admin: "bg-red-100 text-red-800",
      archivist: "bg-blue-100 text-blue-800",
      viewer: "bg-gray-100 text-gray-800",
    };
    return colors[role as keyof typeof colors] || colors.viewer;
  };

  const getStatusBadge = (user: User) => {
    if (user.isRestricted) {
      return <Badge className="bg-orange-100 text-orange-800">مقيد</Badge>;
    }
    if (!user.isActive) {
      return <Badge className="bg-red-100 text-red-800">غير نشط</Badge>;
    }
    return <Badge className="bg-green-100 text-green-800">نشط</Badge>;
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة المستخدمين</h1>
          <p className="text-gray-600">إدارة حسابات المستخدمين وصلاحياتهم في النظام</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">إجمالي المستخدمين</p>
                  <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <UserIcon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">المستخدمون النشطون</p>
                  <p className="text-2xl font-bold text-green-600">
                    {users.filter(u => u?.isActive && !u?.isRestricted).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">المستخدمون المقيدون</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {users.filter(u => u?.isRestricted).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">المديرون</p>
                  <p className="text-2xl font-bold text-red-600">
                    {users.filter(u => u?.role === 'admin').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card className="mb-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2 space-x-reverse">
                <UserIcon className="w-5 h-5" />
                <span>المستخدمون ({filteredUsers?.length || 0})</span>
              </CardTitle>
              <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
                    <UserIcon className="w-4 h-4 ml-2" />
                    إضافة مستخدم جديد
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>
                      {selectedUser ? "تعديل المستخدم" : "إضافة مستخدم جديد"}
                    </DialogTitle>
                  </DialogHeader>

                  <Form {...userForm}>
                    <form onSubmit={userForm.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={userForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>الاسم الكامل</FormLabel>
                            <FormControl>
                              <Input placeholder="أدخل الاسم الكامل" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={userForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>اسم المستخدم</FormLabel>
                            <FormControl>
                              <Input placeholder="أدخل اسم المستخدم" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={userForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>البريد الإلكتروني</FormLabel>
                            <FormControl>
                              <Input placeholder="أدخل البريد الإلكتروني" type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={userForm.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>الدور</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="اختر دور المستخدم" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="admin">مدير النظام</SelectItem>
                                <SelectItem value="archivist">أمين الأرشيف</SelectItem>
                                <SelectItem value="viewer">مستعرض</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {!selectedUser && (
                        <FormField
                          control={userForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>كلمة المرور</FormLabel>
                              <FormControl>
                                <Input placeholder="أدخل كلمة المرور" type="password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      <div className="flex justify-end space-x-2 space-x-reverse pt-4">
                        <Button type="button" variant="outline" onClick={handleCloseModals}>
                          إلغاء
                        </Button>
                        <Button
                          type="submit"
                          disabled={createUserMutation.isPending || updateUserMutation.isPending}
                          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                        >
                          {(createUserMutation.isPending || updateUserMutation.isPending)
                            ? "جاري الحفظ..."
                            : selectedUser ? "تحديث" : "إنشاء"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="flex-1">
                <Input
                  placeholder="البحث في الأسماء أو أسماء المستخدمين..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="تصفية حسب الدور" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأدوار</SelectItem>
                  <SelectItem value="admin">مدير النظام</SelectItem>
                  <SelectItem value="archivist">أمين الأرشيف</SelectItem>
                  <SelectItem value="viewer">مستعرض</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="تصفية حسب الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="inactive">غير نشط</SelectItem>
                  <SelectItem value="restricted">مقيد</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <p className="mt-2 text-gray-600">جاري التحميل...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">خطأ في تحميل البيانات</h3>
                <p className="text-gray-600 mb-4">حدث خطأ أثناء جلب بيانات المستخدمين</p>
                <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/users"] })}>
                  إعادة المحاولة
                </Button>
              </div>
            ) : filteredUsers.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>المستخدم</TableHead>
                    <TableHead>الدور</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>تاريخ الإنشاء</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <UserIcon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="font-medium">{user.fullName}</div>
                            <div className="text-sm text-gray-500">
                              {user.username} • {user.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleBadgeColor(user.role)}>
                          {ROLE_LABELS[user.role as keyof typeof ROLE_LABELS]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(user)}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {formatDistanceToNow(new Date(user.createdAt), {
                            addSuffix: true,
                            locale: ar
                          })}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenuRoot>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleViewUser(user)}>
                              <Eye className="w-4 h-4 ml-2" />
                              عرض التفاصيل
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditUser(user)}>
                              <Edit className="w-4 h-4 ml-2" />
                              تعديل
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEmailUser(user)}>
                              <MailIcon className="w-4 h-4 ml-2" />
                              إرسال بريد
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {/* Allow restriction for admin and archivist roles, unrestrict for all restricted users */}
                            {((user.role === 'admin' || user.role === 'archivist') && !user.isRestricted) || user.isRestricted ? (
                              <DropdownMenuItem 
                                onClick={() => handleRestrictUser(user)}
                                className={user.isRestricted ? "text-green-600" : "text-orange-600"}
                              >
                                {user.isRestricted ? (
                                  <>
                                    <Check className="w-4 h-4 ml-2" />
                                    إلغاء التقييد
                                  </>
                                ) : (
                                  <>
                                    <X className="w-4 h-4 ml-2" />
                                    تقييد المستخدم
                                  </>
                                )}
                              </DropdownMenuItem>
                            ) : null}
                            <DropdownMenuSeparator />
                            {user.id === currentUser?.id ? (
                              <DropdownMenuItem 
                                onClick={() => handleSelfDelete(user)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 ml-2" />
                                حذف حسابي نهائياً
                              </DropdownMenuItem>
                            ) : (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem 
                                    className="text-red-600"
                                    onSelect={(e) => e.preventDefault()}
                                  >
                                    <Trash2 className="w-4 h-4 ml-2" />
                                    حذف نهائي
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>حذف المستخدم نهائياً</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      هل أنت متأكد من حذف المستخدم "{user.fullName}" نهائياً؟
                                      هذا الإجراء سيحذف جميع بيانات المستخدم ولا يمكن التراجع عنه.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => permanentDeleteUserMutation.mutate(user.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      حذف نهائي
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenuRoot>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <UserIcon className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  لم يتم العثور على مستخدمين
                </h3>
                <p className="text-gray-600 mb-4">
                  جرب تعديل المرشحات أو إضافة مستخدم جديد
                </p>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  إضافة أول مستخدم
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Detail Modal */}
        <Dialog open={isUserDetailModalOpen} onOpenChange={setIsUserDetailModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2 space-x-reverse">
                <UserIcon className="w-5 h-5" />
                <span>تفاصيل المستخدم</span>
              </DialogTitle>
            </DialogHeader>

            {selectedUser && (
              <div className="space-y-6">
                {/* User Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 space-x-reverse">
                      <UserIcon className="w-5 h-5" />
                      <span>معلومات المستخدم</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-600">الاسم الكامل</label>
                          <p className="text-lg font-semibold">{selectedUser.fullName}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">اسم المستخدم</label>
                          <p className="text-lg">{selectedUser.username}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">البريد الإلكتروني</label>
                          <p className="text-lg">{selectedUser.email}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-600">الدور</label>
                          <div className="mt-1">
                            <Badge className={getRoleBadgeColor(selectedUser.role)}>
                              {ROLE_LABELS[selectedUser.role as keyof typeof ROLE_LABELS]}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">الحالة</label>
                          <div className="mt-1">
                            {getStatusBadge(selectedUser)}
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">تاريخ الإنشاء</label>
                          <p className="text-lg">
                            {formatDateArabic(selectedUser.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* User Stats */}
                {userStats && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 space-x-reverse">
                        <Activity className="w-5 h-5" />
                        <span>إحصائيات المستخدم</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-xl">
                          <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-blue-600">{userStats.total_documents}</p>
                          <p className="text-sm text-gray-600">الوثائق</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-xl">
                          <MessageSquare className="w-8 h-8 text-green-600 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-green-600">{userStats.total_comments}</p>
                          <p className="text-sm text-gray-600">التعليقات</p>
                        </div>
                        <div className="text-center p-4 bg-yellow-50 rounded-xl">
                          <Lightbulb className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-yellow-600">{userStats.total_recommendations}</p>
                          <p className="text-sm text-gray-600">التوصيات</p>
                        </div>
                        <div className="text-center p-4 bg-red-50 rounded-xl">
                          <Flag className="w-8 h-8 text-red-600 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-red-600">{userStats.total_reports}</p>
                          <p className="text-sm text-gray-600">التقارير</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 space-x-reverse">
                      <Clock className="w-5 h-5" />
                      <span>النشاط الأخير</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {userActivity.slice(0, 10).map((activity) => (
                        <div key={activity.id} className="flex items-center space-x-3 space-x-reverse p-3 bg-gray-50 rounded-lg">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Activity className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{activity.action}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(activity.created_at).toLocaleString('ar-SA')}
                            </p>
                          </div>
                        </div>
                      ))}
                      {userActivity.length === 0 && (
                        <p className="text-center text-gray-500 py-4">لا يوجد نشاط مسجل</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Restrict User Modal */}
        <Dialog open={isRestrictModalOpen} onOpenChange={setIsRestrictModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedUser?.isRestricted ? "إلغاء تقييد المستخدم" : "تقييد المستخدم"}
              </DialogTitle>
            </DialogHeader>

            <Form {...restrictForm}>
              <form onSubmit={restrictForm.handleSubmit(onRestrictSubmit)} className="space-y-4">
                {/* Only show reason input for restriction, not unrestriction */}
                {!selectedUser?.isRestricted && (
                  <FormField
                    control={restrictForm.control}
                    name="reason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>سبب التقييد (اختياري)</FormLabel>
                        <div className="space-y-3">
                          <div className="flex flex-wrap gap-2">
                            {restrictionReasons.map((reason) => (
                              <Button
                                key={reason}
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => field.onChange(reason)}
                                className="text-xs"
                              >
                                {reason}
                              </Button>
                            ))}
                          </div>
                          <FormControl>
                            <Textarea 
                              placeholder="اكتب سبب تقييد المستخدم أو اختر من الأسباب أعلاه..." 
                              {...field} 
                              rows={3}
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div className="flex justify-end space-x-2 space-x-reverse pt-4">
                  <Button type="button" variant="outline" onClick={handleCloseModals}>
                    إلغاء
                  </Button>
                  <Button
                    type="submit"
                    disabled={restrictUserMutation.isPending}
                    className={selectedUser?.isRestricted 
                      ? "bg-green-600 hover:bg-green-700" 
                      : "bg-orange-600 hover:bg-orange-700"
                    }
                  >
                    {restrictUserMutation.isPending
                      ? "جاري المعالجة..."
                      : selectedUser?.isRestricted ? "إلغاء التقييد" : "تقييد المستخدم"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Enhanced Self-Deletion Modal */}
        <Dialog open={isSelfDeleteModalOpen} onOpenChange={setIsSelfDeleteModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-red-600">حذف حسابك نهائياً</DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Warning Message */}
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start space-x-3 space-x-reverse">
                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-red-800 mb-2">تحذير: هذا الإجراء لا يمكن التراجع عنه</h4>
                    <p className="text-sm text-red-700">
                      سيتم حذف حسابك نهائياً من النظام. جميع بياناتك وملفاتك سيتم حذفها نهائياً ولا يمكن استردادها.
                    </p>
                  </div>
                </div>
              </div>

              {/* Password Verification */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    كلمة المرور للتأكيد
                  </label>
                  <Input
                    type="password"
                    placeholder="أدخل كلمة المرور"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    اكتب أحد النصوص التالية للتأكيد:
                  </label>
                  <div className="text-xs text-gray-500 mb-2">
                    • "حذف حسابي" (عربي) • "remove my account" (إنجليزي) • "supprimer mon compte" (فرنسي)
                  </div>
                  <Input
                    placeholder="حذف حسابي"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 space-x-reverse pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCloseModals}
                  disabled={selfDeleteMutation.isPending}
                >
                  إلغاء
                </Button>
                <Button
                  type="button"
                  onClick={onSelfDeleteSubmit}
                  disabled={selfDeleteMutation.isPending || !deletePassword || !["حذف حسابي", "remove my account", "supprimer mon compte"].includes(deleteConfirmation)}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {selfDeleteMutation.isPending ? "جاري الحذف..." : "حذف حسابي نهائياً"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Restriction Confirmation Dialog */}
        <Dialog open={isRestrictConfirmOpen} onOpenChange={() => {}}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-orange-600">
                {pendingRestriction?.restrict ? "تأكيد تقييد المستخدم" : "تأكيد إلغاء التقييد"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Warning Message */}
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-start space-x-3 space-x-reverse">
                  <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-orange-800 mb-2">
                      {pendingRestriction?.restrict ? "سيتم تقييد المستخدم" : "سيتم إلغاء تقييد المستخدم"}
                    </h4>
                    {pendingRestriction?.restrict ? (
                      <p className="text-sm text-orange-700">
                        <strong>سبب التقييد:</strong> {pendingRestriction?.reason || "سبب غير محدد"}
                      </p>
                    ) : (
                      <p className="text-sm text-orange-700">
                        <strong>المستخدم مقيد بسبب:</strong> {selectedUser?.restrictionReason || "سبب غير محدد"}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* What user won't be able to do */}
              {pendingRestriction?.restrict && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h5 className="text-sm font-medium text-red-800 mb-2">لن يتمكن المستخدم من:</h5>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• إدارة المستخدمين الآخرين</li>
                    <li>• إضافة أو تعديل أو حذف الوثائق</li>
                    <li>• إدارة الأوراق والمستندات</li>
                    <li>• الوصول إلى إعدادات النظام</li>
                    <li>• تنفيذ أي إجراءات إدارية</li>
                  </ul>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 space-x-reverse pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={cancelRestriction}
                  disabled={restrictUserMutation.isPending}
                >
                  إلغاء
                </Button>
                <Button
                  type="button"
                  onClick={confirmRestriction}
                  disabled={restrictUserMutation.isPending}
                  className={pendingRestriction?.restrict 
                    ? "bg-orange-600 hover:bg-orange-700" 
                    : "bg-green-600 hover:bg-green-700"
                  }
                >
                  {restrictUserMutation.isPending 
                    ? "جاري المعالجة..." 
                    : pendingRestriction?.restrict ? "تأكيد التقييد" : "تأكيد إلغاء التقييد"
                  }
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Role Selection Dialog for Viewers */}
        <Dialog open={isRoleSelectOpen} onOpenChange={() => {}}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-blue-600">اختيار دور المستخدم</DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Info Message */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-3 space-x-reverse">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <UserIcon className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-blue-800 mb-2">اختيار الدور الجديد</h4>
                    <p className="text-sm text-blue-700">
                      يرجى اختيار الدور الذي سيحصل عليه المستخدم بعد إلغاء التقييد.
                    </p>
                  </div>
                </div>
              </div>

              {/* Role Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">اختر الدور:</label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3 space-x-reverse p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      value="admin"
                      checked={selectedRole === 'admin'}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="text-blue-600"
                    />
                    <div>
                      <div className="font-medium">مدير النظام</div>
                      <div className="text-sm text-gray-500">صلاحيات كاملة لإدارة النظام</div>
                    </div>
                  </label>
                  <label className="flex items-center space-x-3 space-x-reverse p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      value="archivist"
                      checked={selectedRole === 'archivist'}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="text-blue-600"
                    />
                    <div>
                      <div className="font-medium">أمين الأرشيف</div>
                      <div className="text-sm text-gray-500">إدارة الوثائق والأوراق</div>
                    </div>
                  </label>
                  <label className="flex items-center space-x-3 space-x-reverse p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      value="viewer"
                      checked={selectedRole === 'viewer'}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="text-blue-600"
                    />
                    <div>
                      <div className="font-medium">مستعرض</div>
                      <div className="text-sm text-gray-500">عرض الوثائق فقط</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 space-x-reverse pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={cancelRoleSelection}
                  disabled={updateUserRoleMutation.isPending}
                >
                  إلغاء
                </Button>
                <Button
                  type="button"
                  onClick={confirmRoleSelection}
                  disabled={updateUserRoleMutation.isPending || !selectedRole}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {updateUserRoleMutation.isPending ? "جاري المعالجة..." : "تأكيد"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
