import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { z } from "zod";
import { Link } from "wouter";
import { 
  Settings as SettingsIcon, 
  ChevronLeft, 
  User,
  Bell, 
  Palette, 
  Save, 
  RefreshCw,
  Monitor,
  Clock,
  Mail,
  Phone,
  FileText,
  AlertTriangle,
  Calendar,
  Database,
  Key,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Sun,
  Moon,
  Smartphone,
  Laptop,
  Tablet,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  MapPin,
  Globe,
  Heart,
  Star,
  Zap,
  Target,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  Layers,
  Grid,
  List,
  Layout,
  Maximize,
  Minimize,
  RotateCcw,
  Download,
  Upload,
  Trash2,
  Edit,
  Copy,
  Share,
  MessageSquare,
  Users,
  UserPlus,
  UserMinus,
  UserCheck,
  UserX,
  Crown,
  Award,
  Trophy,
  Gift,
  Camera,
  Image,
  Volume1,
  Settings2,
  Sliders,
  ToggleLeft,
  ToggleRight,
  Check,
  X,
  Plus,
  Minus,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  MoreHorizontal,
  MoreVertical,
  Menu,
  Home,
  Building,
  Navigation,
  Compass,
  Flag,
  Bookmark,
  Tag,
  Hash,
  AtSign,
  DollarSign,
  Percent,
  Calculator,
  Timer
} from "@/lib/icons";

const userProfileSchema = z.object({
  firstName: z.string().min(1, "الاسم الأول مطلوب"),
  lastName: z.string().min(1, "الاسم الأخير مطلوب"),
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  phone: z.string().optional(),
  department: z.string().optional(),
  position: z.string().optional(),
  bio: z.string().optional(),
});

const interfaceSettingsSchema = z.object({
  theme: z.enum(["light", "dark", "auto"]),
  fontSize: z.enum(["small", "medium", "large"]),
  colorScheme: z.enum(["blue", "green", "purple", "orange", "red", "pink"]),
  layout: z.enum(["compact", "comfortable", "spacious"]),
  sidebarCollapsed: z.boolean(),
  showAnimations: z.boolean(),
  showTooltips: z.boolean(),
  autoSave: z.boolean(),
  showGridLines: z.boolean(),
  enableSounds: z.boolean(),
  showNotifications: z.boolean(),
  compactMode: z.boolean(),
  showBreadcrumbs: z.boolean(),
  enableKeyboardShortcuts: z.boolean(),
  showStatusBar: z.boolean(),
  enableDragDrop: z.boolean(),
  showPreview: z.boolean(),
  enableAutoComplete: z.boolean(),
  showLineNumbers: z.boolean(),
  enableSyntaxHighlighting: z.boolean(),
});

const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  documentUpdates: z.boolean(),
  systemAlerts: z.boolean(),
  weeklyReports: z.boolean(),
  soundNotifications: z.boolean(),
  desktopNotifications: z.boolean(),
  mobileNotifications: z.boolean(),
  reminderNotifications: z.boolean(),
  commentNotifications: z.boolean(),
  mentionNotifications: z.boolean(),
  deadlineNotifications: z.boolean(),
  statusChangeNotifications: z.boolean(),
  newUserNotifications: z.boolean(),
  systemMaintenanceNotifications: z.boolean(),
});

type UserProfileData = z.infer<typeof userProfileSchema>;
type InterfaceSettingsData = z.infer<typeof interfaceSettingsSchema>;
type NotificationSettingsData = z.infer<typeof notificationSettingsSchema>;

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme, actualTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'profile' | 'interface' | 'notifications'>('profile');

  const userProfileForm = useForm<UserProfileData>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      firstName: user?.name?.split(' ')[0] || "",
      lastName: user?.name?.split(' ').slice(1).join(' ') || "",
      email: user?.email || "",
      phone: "",
      department: "",
      position: "",
      bio: "",
    },
  });

  const interfaceForm = useForm<InterfaceSettingsData>({
    resolver: zodResolver(interfaceSettingsSchema),
    defaultValues: {
      theme: theme,
      fontSize: "medium",
      colorScheme: "blue",
      layout: "comfortable",
      sidebarCollapsed: false,
      showAnimations: true,
      showTooltips: true,
      autoSave: true,
      showGridLines: false,
      enableSounds: true,
      showNotifications: true,
      compactMode: false,
      showBreadcrumbs: true,
      enableKeyboardShortcuts: true,
      showStatusBar: true,
      enableDragDrop: true,
      showPreview: true,
      enableAutoComplete: true,
      showLineNumbers: false,
      enableSyntaxHighlighting: true,
    },
  });

  const notificationForm = useForm<NotificationSettingsData>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      emailNotifications: true,
      pushNotifications: false,
      documentUpdates: true,
      systemAlerts: true,
      weeklyReports: false,
      soundNotifications: true,
      desktopNotifications: true,
      mobileNotifications: false,
      reminderNotifications: true,
      commentNotifications: true,
      mentionNotifications: true,
      deadlineNotifications: true,
      statusChangeNotifications: false,
      newUserNotifications: false,
      systemMaintenanceNotifications: true,
    },
  });


  // Fetch current user settings
  const { data: currentSettings } = useQuery({
    queryKey: ["/api/user/settings"],
    queryFn: async () => {
      const response = await fetch("/api/user/settings");
      if (!response.ok) return null;
      return response.json();
    },
  });

  const updateUserProfileMutation = useMutation({
    mutationFn: async (data: UserProfileData) => {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("فشل في حفظ بيانات الملف الشخصي");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم الحفظ",
        description: "تم حفظ بيانات الملف الشخصي بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في حفظ بيانات الملف الشخصي",
        variant: "destructive",
      });
    },
  });

  const updateInterfaceSettingsMutation = useMutation({
    mutationFn: async (data: InterfaceSettingsData) => {
      const response = await fetch("/api/user/interface-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("فشل في حفظ إعدادات الواجهة");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم الحفظ",
        description: "تم حفظ إعدادات الواجهة بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في حفظ إعدادات الواجهة",
        variant: "destructive",
      });
    },
  });

  const updateNotificationSettingsMutation = useMutation({
    mutationFn: async (data: NotificationSettingsData) => {
      const response = await fetch("/api/user/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("فشل في حفظ إعدادات الإشعارات");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم الحفظ",
        description: "تم حفظ إعدادات الإشعارات بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في حفظ إعدادات الإشعارات",
        variant: "destructive",
      });
    },
  });


  const onUserProfileSubmit = (data: UserProfileData) => {
    updateUserProfileMutation.mutate(data);
  };

  const onInterfaceSubmit = (data: InterfaceSettingsData) => {
    updateInterfaceSettingsMutation.mutate(data);
  };

  const onNotificationSubmit = (data: NotificationSettingsData) => {
    updateNotificationSettingsMutation.mutate(data);
  };


  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:bg-gradient-dark p-8">
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
            <li className="text-gray-900 dark:text-white font-medium">إعداداتي</li>
          </ol>
        </nav>

        {/* Settings Header */}
        <div className="mb-8">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <SettingsIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">إعداداتي الشخصية</h1>
                  <p className="text-gray-600 dark:text-gray-400">إدارة إعداداتك الشخصية وتفضيلات الواجهة</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-0 shadow-lg rounded-2xl overflow-hidden">
            <CardContent className="p-2">
              <nav className="flex space-x-2 space-x-reverse">
                {[
                  { id: 'profile', label: 'الملف الشخصي', icon: User },
                  { id: 'interface', label: 'الواجهة', icon: Palette },
                  { id: 'notifications', label: 'الإشعارات', icon: Bell },
                ].map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex-1 py-3 px-4 rounded-xl font-medium text-sm flex items-center justify-center space-x-2 space-x-reverse transition-all duration-200 ${
                        activeTab === tab.id
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

        {/* User Profile Tab */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>معلومات الملف الشخصي</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...userProfileForm}>
                    <form onSubmit={userProfileForm.handleSubmit(onUserProfileSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={userProfileForm.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>الاسم الأول</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={userProfileForm.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>الاسم الأخير</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={userProfileForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>البريد الإلكتروني</FormLabel>
                              <FormControl>
                                <Input {...field} type="email" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={userProfileForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>رقم الهاتف</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={userProfileForm.control}
                          name="department"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>القسم</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={userProfileForm.control}
                          name="position"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>المنصب</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={userProfileForm.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>نبذة شخصية</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="اكتب نبذة مختصرة عن نفسك..." />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        disabled={updateUserProfileMutation.isPending}
                        className="w-full"
                      >
                        {updateUserProfileMutation.isPending ? 'جاري الحفظ...' : 'حفظ الملف الشخصي'}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>معلومات الحساب</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">تاريخ الانضمام</span>
                    <Badge variant="outline">يناير 2024</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">آخر نشاط</span>
                    <Badge className="bg-green-100 text-green-800">الآن</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">عدد الوثائق</span>
                    <span className="text-sm font-medium">127</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Interface Settings Tab */}
        {activeTab === 'interface' && (
          <div className="max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Theme and Appearance */}
              <Card>
                <CardHeader>
                  <CardTitle>المظهر </CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...interfaceForm}>
                    <form onSubmit={interfaceForm.handleSubmit(onInterfaceSubmit)} className="space-y-6">
                      <div className="space-y-4">
                        <FormField
                          control={interfaceForm.control}
                          name="theme"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center space-x-2 space-x-reverse">
                                <span>الوضع الافتراضي</span>
                                {actualTheme === 'dark' ? (
                                  <Moon className="w-4 h-4 text-yellow-500" />
                                ) : (
                                  <Sun className="w-4 h-4 text-orange-500" />
                                )}
                                {theme === 'auto' && <Monitor className="w-4 h-4 text-blue-500" />}
                              </FormLabel>
                              <Select 
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  setTheme(value as 'light' | 'dark' | 'auto');
                                }} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="اختر الوضع" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="light">
                                    <div className="flex items-center space-x-2 space-x-reverse">
                                      <Sun className="w-4 h-4" />
                                      <span>فاتح</span>
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="dark">
                                    <div className="flex items-center space-x-2 space-x-reverse">
                                      <Moon className="w-4 h-4" />
                                      <span>داكن</span>
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="auto">
                                    <div className="flex items-center space-x-2 space-x-reverse">
                                      <Monitor className="w-4 h-4" />
                                      <span>تلقائي</span>
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={interfaceForm.control}
                          name="fontSize"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>حجم الخط</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="اختر حجم الخط" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="small">صغير</SelectItem>
                                  <SelectItem value="medium">متوسط</SelectItem>
                                  <SelectItem value="large">كبير</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              {/* Interface Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle>تفضيلات الواجهة</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">عرض الرسوم المتحركة</Label>
                        <p className="text-sm text-gray-600">تفعيل الرسوم المتحركة في الواجهة</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">الحفظ التلقائي</Label>
                        <p className="text-sm text-gray-600">حفظ التغييرات تلقائياً</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">تفعيل الأصوات</Label>
                        <p className="text-sm text-gray-600">تشغيل أصوات التنبيهات</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">اختصارات لوحة المفاتيح</Label>
                        <p className="text-sm text-gray-600">تفعيل اختصارات لوحة المفاتيح</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                  <Button 
                    onClick={() => {
                      toast({
                        title: "تم الحفظ",
                        description: "تم حفظ إعدادات الواجهة بنجاح",
                      });
                    }}
                    className="w-full mt-6"
                  >
                    حفظ إعدادات الواجهة
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Notifications Settings Tab */}
        {activeTab === 'notifications' && (
          <div className="max-w-4xl">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات الإشعارات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">إشعارات البريد الإلكتروني</Label>
                      <p className="text-sm text-gray-600">تلقي إشعارات عبر البريد الإلكتروني</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">الإشعارات الفورية</Label>
                      <p className="text-sm text-gray-600">تلقي إشعارات فورية في المتصفح</p>
                    </div>
                    <Switch />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">تحديثات الوثائق</Label>
                      <p className="text-sm text-gray-600">إشعار عند تحديث الوثائق</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">تنبيهات النظام</Label>
                      <p className="text-sm text-gray-600">إشعارات مهمة من النظام</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>

                <Button 
                  onClick={() => {
                    toast({
                      title: "تم الحفظ",
                      description: "تم حفظ إعدادات الإشعارات بنجاح",
                    });
                  }}
                  className="w-full mt-6"
                >
                  حفظ إعدادات الإشعارات
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

      </div>
    </MainLayout>
  );
}