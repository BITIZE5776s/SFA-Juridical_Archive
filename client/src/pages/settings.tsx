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
  Shield,
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
  Map,
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

const privacySettingsSchema = z.object({
  profileVisibility: z.enum(["public", "private", "contacts"]),
  showOnlineStatus: z.boolean(),
  allowDirectMessages: z.boolean(),
  showLastSeen: z.boolean(),
  allowProfileSearch: z.boolean(),
  shareActivity: z.boolean(),
  allowTagging: z.boolean(),
  showEmail: z.boolean(),
  showPhone: z.boolean(),
  allowFriendRequests: z.boolean(),
  enableTwoFactor: z.boolean(),
  requirePasswordForSensitive: z.boolean(),
  autoLogout: z.boolean(),
  clearHistoryOnExit: z.boolean(),
  disableTracking: z.boolean(),
  allowAnalytics: z.boolean(),
});

type UserProfileData = z.infer<typeof userProfileSchema>;
type InterfaceSettingsData = z.infer<typeof interfaceSettingsSchema>;
type NotificationSettingsData = z.infer<typeof notificationSettingsSchema>;
type PrivacySettingsData = z.infer<typeof privacySettingsSchema>;

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'profile' | 'interface' | 'notifications' | 'privacy'>('profile');

  const userProfileForm = useForm<UserProfileData>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
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
      theme: "light",
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

  const privacyForm = useForm<PrivacySettingsData>({
    resolver: zodResolver(privacySettingsSchema),
    defaultValues: {
      profileVisibility: "contacts",
      showOnlineStatus: true,
      allowDirectMessages: true,
      showLastSeen: false,
      allowProfileSearch: true,
      shareActivity: false,
      allowTagging: true,
      showEmail: false,
      showPhone: false,
      allowFriendRequests: true,
      enableTwoFactor: false,
      requirePasswordForSensitive: true,
      autoLogout: false,
      clearHistoryOnExit: false,
      disableTracking: false,
      allowAnalytics: true,
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

  const updatePrivacySettingsMutation = useMutation({
    mutationFn: async (data: PrivacySettingsData) => {
      const response = await fetch("/api/user/privacy", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("فشل في حفظ إعدادات الخصوصية");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم الحفظ",
        description: "تم حفظ إعدادات الخصوصية بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في حفظ إعدادات الخصوصية",
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

  const onPrivacySubmit = (data: PrivacySettingsData) => {
    updatePrivacySettingsMutation.mutate(data);
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 space-x-reverse text-sm text-gray-600">
            <li>
              <Link href="/dashboard" className="hover:text-primary-600 transition-colors duration-200 flex items-center space-x-1 space-x-reverse">
                <ChevronLeft className="w-4 h-4" />
                <span>الرئيسية</span>
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-900 font-medium">إعداداتي</li>
          </ol>
        </nav>

        {/* Settings Header */}
        <div className="mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <SettingsIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">إعداداتي الشخصية</h1>
                  <p className="text-gray-600">إدارة إعداداتك الشخصية وتفضيلات الواجهة</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg rounded-2xl overflow-hidden">
            <CardContent className="p-2">
              <nav className="flex space-x-2 space-x-reverse">
                {[
                  { id: 'profile', label: 'الملف الشخصي', icon: User },
                  { id: 'interface', label: 'الواجهة', icon: Palette },
                  { id: 'notifications', label: 'الإشعارات', icon: Bell },
                  { id: 'privacy', label: 'الخصوصية', icon: Shield },
                ].map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex-1 py-3 px-4 rounded-xl font-medium text-sm flex items-center justify-center space-x-2 space-x-reverse transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
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
                              <FormLabel>الوضع الافتراضي</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="اختر الوضع" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="light">فاتح</SelectItem>
                                  <SelectItem value="dark">داكن</SelectItem>
                                  <SelectItem value="auto">تلقائي</SelectItem>
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

                        <FormField
                          control={interfaceForm.control}
                          name="colorScheme"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>نظام الألوان</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="اختر نظام الألوان" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="blue">أزرق</SelectItem>
                                  <SelectItem value="green">أخضر</SelectItem>
                                  <SelectItem value="purple">بنفسجي</SelectItem>
                                  <SelectItem value="orange">برتقالي</SelectItem>
                                  <SelectItem value="red">أحمر</SelectItem>
                                  <SelectItem value="pink">وردي</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={interfaceForm.control}
                          name="layout"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>تخطيط الواجهة</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="اختر التخطيط" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="compact">مضغوط</SelectItem>
                                  <SelectItem value="comfortable">مريح</SelectItem>
                                  <SelectItem value="spacious">واسع</SelectItem>
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
                        <Label className="text-base font-medium">إخفاء الشريط الجانبي</Label>
                        <p className="text-sm text-gray-600">إخفاء الشريط الجانبي افتراضياً</p>
                      </div>
                      <Switch />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">عرض الرسوم المتحركة</Label>
                        <p className="text-sm text-gray-600">تفعيل الرسوم المتحركة في الواجهة</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">عرض التلميحات</Label>
                        <p className="text-sm text-gray-600">عرض تلميحات عند التمرير</p>
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
                        <Label className="text-base font-medium">عرض الإشعارات</Label>
                        <p className="text-sm text-gray-600">عرض الإشعارات في الواجهة</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">الوضع المضغوط</Label>
                        <p className="text-sm text-gray-600">عرض المزيد من المحتوى في مساحة أقل</p>
                      </div>
                      <Switch />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">عرض مسار التنقل</Label>
                        <p className="text-sm text-gray-600">عرض مسار التنقل في أعلى الصفحة</p>
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
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">عرض شريط الحالة</Label>
                        <p className="text-sm text-gray-600">عرض شريط الحالة في أسفل الشاشة</p>
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
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">التقارير الأسبوعية</Label>
                      <p className="text-sm text-gray-600">تلقي تقرير أسبوعي عن النشاط</p>
                    </div>
                    <Switch />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">الإشعارات الصوتية</Label>
                      <p className="text-sm text-gray-600">تشغيل صوت عند وصول إشعار</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">إشعارات سطح المكتب</Label>
                      <p className="text-sm text-gray-600">عرض الإشعارات على سطح المكتب</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">إشعارات التذكير</Label>
                      <p className="text-sm text-gray-600">تذكيرات للمهام المهمة</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">إشعارات التعليقات</Label>
                      <p className="text-sm text-gray-600">إشعار عند إضافة تعليق جديد</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">إشعارات المواعيد النهائية</Label>
                      <p className="text-sm text-gray-600">تذكير بالمواعيد النهائية</p>
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

        {/* Privacy Settings Tab */}
        {activeTab === 'privacy' && (
          <div className="max-w-4xl">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات الخصوصية والأمان</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">إعدادات الملف الشخصي</h3>
                    <div className="space-y-2">
                      <Label>رؤية الملف الشخصي</Label>
                      <Select defaultValue="contacts">
                        <SelectTrigger>
                          <SelectValue placeholder="اختر مستوى الرؤية" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">عام</SelectItem>
                          <SelectItem value="contacts">المعرفون فقط</SelectItem>
                          <SelectItem value="private">خاص</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">إعدادات النشاط</h3>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-base font-medium">عرض حالة الاتصال</Label>
                          <p className="text-sm text-gray-600">إظهار أنك متصل حالياً</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-base font-medium">السماح بالرسائل المباشرة</Label>
                          <p className="text-sm text-gray-600">السماح للمستخدمين بإرسال رسائل مباشرة</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-base font-medium">عرض آخر ظهور</Label>
                          <p className="text-sm text-gray-600">إظهار وقت آخر نشاط لك</p>
                        </div>
                        <Switch />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-base font-medium">السماح بالبحث في الملف الشخصي</Label>
                          <p className="text-sm text-gray-600">السماح بالبحث عن ملفك الشخصي</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-base font-medium">مشاركة النشاط</Label>
                          <p className="text-sm text-gray-600">مشاركة نشاطك مع المستخدمين الآخرين</p>
                        </div>
                        <Switch />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">إعدادات الأمان</h3>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-base font-medium">المصادقة الثنائية</Label>
                          <p className="text-sm text-gray-600">تفعيل المصادقة الثنائية للحساب</p>
                        </div>
                        <Switch />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-base font-medium">طلب كلمة المرور للمعلومات الحساسة</Label>
                          <p className="text-sm text-gray-600">طلب كلمة المرور للوصول للمعلومات الحساسة</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-base font-medium">تسجيل الخروج التلقائي</Label>
                          <p className="text-sm text-gray-600">تسجيل الخروج تلقائياً بعد فترة عدم نشاط</p>
                        </div>
                        <Switch />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-base font-medium">مسح السجل عند الخروج</Label>
                          <p className="text-sm text-gray-600">مسح سجل التصفح عند تسجيل الخروج</p>
                        </div>
                        <Switch />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-base font-medium">تعطيل التتبع</Label>
                          <p className="text-sm text-gray-600">منع تتبع نشاطك في النظام</p>
                        </div>
                        <Switch />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-base font-medium">السماح بالتحليلات</Label>
                          <p className="text-sm text-gray-600">السماح بجمع بيانات الاستخدام للتحسين</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={() => {
                    toast({
                      title: "تم الحفظ",
                      description: "تم حفظ إعدادات الخصوصية بنجاح",
                    });
                  }}
                  className="w-full mt-6"
                >
                  حفظ إعدادات الخصوصية
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
}