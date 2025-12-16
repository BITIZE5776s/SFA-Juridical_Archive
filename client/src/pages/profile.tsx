import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { formatDateArabic } from "@/lib/utils";
import { z } from "zod";
import { Link } from "wouter";
import {
  User,
  Lock,
  History,
  ChevronLeft,
  Shield,
  CheckCircle,
  AlertCircle,
  Clock,
  FileText,
  Activity,
  Mail,
  Phone,
  Building,
  Key,
  Eye,
  EyeOff
} from "@/lib/icons";

const profileSchema = z.object({
  fullName: z.string().min(2, "الاسم الكامل مطلوب"),
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  username: z.string().min(3, "اسم المستخدم يجب أن يكون 3 أحرف على الأقل"),
  phone: z.string().optional(),
  department: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "كلمة المرور الحالية مطلوبة"),
  newPassword: z.string().min(6, "كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل"),
  confirmPassword: z.string().min(6, "تأكيد كلمة المرور مطلوب"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "كلمات المرور غير متطابقة",
  path: ["confirmPassword"],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function Profile() {
  const { user, login } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'profile' | 'activity'>('profile');
  const [adminName, setAdminName] = useState<string>('');

  // Fetch admin information when component mounts
  useEffect(() => {
    const fetchAdminInfo = async () => {
      if (!user?.restrictedBy) return;

      try {
        const response = await fetch(`/api/users/${user.restrictedBy}`);
        if (response.ok) {
          const adminData = await response.json();
          setAdminName(adminData.fullName);
        }
      } catch (error) {
        console.error('Failed to fetch admin info:', error);
      }
    };

    fetchAdminInfo();
  }, [user?.restrictedBy]);

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      email: user?.email || "",
      username: user?.username || "",
      phone: "",
      department: "",
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Fetch user activity
  // Fetch user activity
  const { data: userActivity = [] } = useQuery({
    queryKey: ["/api/user/activity", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await fetch(`/api/user/activity?userId=${user.id}`);
      if (!response.ok) return [];
      return response.json();
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("فشل في تحديث الملف الشخصي");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم التحديث",
        description: "تم تحديث الملف الشخصي بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في تحديث الملف الشخصي",
        variant: "destructive",
      });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: PasswordFormData) => {
      const response = await fetch("/api/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });
      if (!response.ok) throw new Error("فشل في تغيير كلمة المرور");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم التغيير",
        description: "تم تغيير كلمة المرور بنجاح",
      });
      passwordForm.reset();
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في تغيير كلمة المرور",
        variant: "destructive",
      });
    },
  });

  const onProfileSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  const onPasswordSubmit = (data: PasswordFormData) => {
    changePasswordMutation.mutate(data);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'archivist':
        return 'bg-blue-100 text-blue-800';
      case 'viewer':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'مدير النظام';
      case 'archivist':
        return 'أمين الأرشيف';
      case 'viewer':
        return 'مستعرض';
      default:
        return 'غير محدد';
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 space-x-reverse text-sm text-gray-600 dark:text-gray-400">
            <li>
              <Link href="/dashboard" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 flex items-center space-x-1 space-x-reverse">
                <ChevronLeft className="w-4 h-4" />
                <span>الرئيسية</span>
              </Link>
            </li>
            <li className="text-gray-400 dark:text-gray-500">/</li>
            <li className="text-gray-900 dark:text-white font-medium">الملف الشخصي</li>
          </ol>
        </nav>

        {/* Profile Header */}
        <div className="mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-center space-x-6 space-x-reverse">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <User className="w-12 h-12 text-white" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{user?.fullName}</h1>
                  <div className="flex items-center space-x-2 space-x-reverse mb-4">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
                  </div>
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <Badge className={`${getRoleBadgeColor(user?.role || '')} px-3 py-1 rounded-full font-medium`}>
                      <Shield className="w-3 h-3 ml-1" />
                      {getRoleLabel(user?.role || '')}
                    </Badge>
                    <Badge variant="outline" className="px-3 py-1 rounded-full">
                      <Clock className="w-3 h-3 ml-1" />
                      عضو منذ {formatDateArabic(user?.createdAt || '')}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Restriction Notice */}
        {user?.isRestricted && (
          <div className="mb-8">
            <Card className="bg-red-50 border-red-200 shadow-lg rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4 space-x-reverse">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-red-800 mb-2">حسابك مقيد</h3>
                    <div className="space-y-2">
                      <p className="text-sm text-red-700">
                        <strong>سبب التقييد:</strong> {user.restrictionReason || "سبب غير محدد"}
                      </p>
                      {adminName && (
                        <p className="text-sm text-red-700">
                          <strong>مقيد من قبل:</strong> {adminName}
                        </p>
                      )}
                      {user.restrictedAt && (
                        <p className="text-sm text-red-700">
                          <strong>تاريخ التقييد:</strong> {formatDateArabic(user.restrictedAt)}
                        </p>
                      )}
                    </div>
                    <div className="mt-4">
                      <Button
                        onClick={async () => {
                          try {
                            const response = await fetch(`/api/users/${user.restrictedBy}`);
                            if (response.ok) {
                              const adminData = await response.json();
                              const subject = encodeURIComponent("طلب إلغاء التقييد - Request to Remove Restriction");
                              const body = encodeURIComponent(
                                `مرحباً ${adminName || 'الإدارة'}،\n\nأطلب منكم إلغاء التقييد المفروض على حسابي.\n\nمع الشكر،\n${user.fullName}`
                              );
                              const mailtoUrl = `mailto:${adminData.email}?subject=${subject}&body=${body}`;
                              window.open(mailtoUrl, '_blank');
                            } else {
                              toast({
                                title: "خطأ",
                                description: "لا يمكن العثور على معلومات الإدارة",
                                variant: "destructive",
                              });
                            }
                          } catch (error) {
                            toast({
                              title: "خطأ",
                              description: "فشل في التواصل مع الإدارة",
                              variant: "destructive",
                            });
                          }
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        <Mail className="w-4 h-4 ml-2" />
                        التواصل مع الإدارة
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-8">
          <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg rounded-2xl overflow-hidden">
            <CardContent className="p-2">
              <nav className="flex space-x-2 space-x-reverse">
                {[
                  { id: 'profile', label: 'الملف الشخصي', icon: User },
                  { id: 'activity', label: 'النشاط', icon: History },
                ].map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex-1 py-3 px-4 rounded-xl font-medium text-sm flex items-center justify-center space-x-2 space-x-reverse transition-all duration-200 ${activeTab === tab.id
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-700/50'
                        }`}
                    >
                      <IconComponent className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                  <CardTitle className="flex items-center space-x-2 space-x-reverse">
                    <User className="w-5 h-5" />
                    <span>معلومات الملف الشخصي</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={profileForm.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center space-x-2 space-x-reverse text-sm font-medium text-gray-700 dark:text-gray-300">
                                <User className="w-4 h-4" />
                                <span>الاسم الكامل</span>
                              </FormLabel>
                              <FormControl>
                                <Input {...field} className="bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={profileForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center space-x-2 space-x-reverse text-sm font-medium text-gray-700 dark:text-gray-300">
                                <Mail className="w-4 h-4" />
                                <span>البريد الإلكتروني</span>
                              </FormLabel>
                              <FormControl>
                                <Input {...field} type="email" className="bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={profileForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center space-x-2 space-x-reverse text-sm font-medium text-gray-700 dark:text-gray-300">
                                <User className="w-4 h-4" />
                                <span>اسم المستخدم</span>
                              </FormLabel>
                              <FormControl>
                                <Input {...field} className="bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={profileForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center space-x-2 space-x-reverse text-sm font-medium text-gray-700 dark:text-gray-300">
                                <Phone className="w-4 h-4" />
                                <span>رقم الهاتف</span>
                              </FormLabel>
                              <FormControl>
                                <Input {...field} type="tel" className="bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={profileForm.control}
                          name="department"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center space-x-2 space-x-reverse text-sm font-medium text-gray-700 dark:text-gray-300">
                                <Building className="w-4 h-4" />
                                <span>القسم</span>
                              </FormLabel>
                              <FormControl>
                                <Input {...field} className="bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={updateProfileMutation.isPending}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        {updateProfileMutation.isPending ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                  <CardTitle className="flex items-center space-x-2 space-x-reverse">
                    <Activity className="w-5 h-5" />
                    <span>إحصائيات الحساب</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">الوثائق المضافة</span>
                    </div>
                    <span className="font-bold text-blue-600 text-lg">24</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-xl">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Clock className="w-4 h-4 text-purple-600" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">آخر نشاط</span>
                    </div>
                    <span className="font-bold text-purple-600">منذ ساعتين</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">حالة الحساب</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800 px-3 py-1 rounded-full">نشط</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-orange-500 to-red-600 text-white">
                  <CardTitle className="flex items-center space-x-2 space-x-reverse">
                    <Shield className="w-5 h-5" />
                    <span>الأمان</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">تسجيل الدخول الآمن</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800 px-3 py-1 rounded-full">مفعل</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <AlertCircle className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">المصادقة الثنائية</span>
                    </div>
                    <Badge variant="outline" className="px-3 py-1 rounded-full">غير مفعل</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}



        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className="max-w-4xl">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
                <CardTitle className="flex items-center space-x-2 space-x-reverse">
                  <History className="w-5 h-5" />
                  <span>سجل النشاط</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-4">
                  {userActivity.length > 0 ? (
                    userActivity.map((activity: any, index: number) => (
                      <div key={index} className="flex items-center space-x-4 space-x-reverse p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100 hover:shadow-lg transition-all duration-200">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                          <Activity className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900 mb-1">
                            {activity.action === 'create_document' ? 'إضافة وثيقة' :
                              activity.action === 'delete_document' ? 'حذف وثيقة' :
                                activity.action === 'login' ? 'تسجيل الدخول' :
                                  activity.action === 'logout' ? 'تسجيل الخروج' :
                                    activity.action === 'update_profile' ? 'تحديث الملف الشخصي' :
                                      activity.action}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{activity.details}</p>
                        </div>
                        <div className="text-xs text-gray-500 bg-white/50 px-3 py-1 rounded-full">
                          {formatDateArabic(activity.created_at)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <History className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-lg font-medium">لا يوجد نشاط مسجل</p>
                      <p className="text-sm text-gray-400 mt-2">سيظهر نشاطك هنا عند استخدام النظام</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
