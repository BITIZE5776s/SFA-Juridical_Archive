import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { StatsCard } from "@/components/stats-card";
import { DocumentListItem } from "@/components/document-list-item";
import { CaseListItem } from "@/components/case-list-item";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { type DashboardStats, type DocumentWithDetails } from "@shared/schema";
import { Link, useLocation } from "wouter";
import { formatDateArabic } from "@/lib/utils";
import { useState } from "react";
import { EnhancedDocumentUploadModal } from "@/components/enhanced-document-upload-modal";
import { FileUploadModal } from "@/components/file-upload-modal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  ChevronLeft, 
  Folder, 
  FileCheck, 
  Clock, 
  Archive, 
  Plus, 
  Upload, 
  Search, 
  BarChart3,
  TrendingUp,
  Users,
  Calendar,
  Star,
  FileText,
  Lightbulb,
  MessageSquare,
  Flag
} from "@/lib/icons";

export default function Dashboard() {
  const { user, canManageDocuments } = useAuth();
  const [, setLocation] = useLocation();
  
  // Modal states
  const [isCreateDocumentModalOpen, setIsCreateDocumentModalOpen] = useState(false);
  const [isFileUploadModalOpen, setIsFileUploadModalOpen] = useState(false);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);

  // Handler functions
  const handleCreateDocument = () => {
    if (canManageDocuments()) {
      setIsCreateDocumentModalOpen(true);
    } else {
      setShowPermissionDialog(true);
    }
  };

  const handleUploadFile = () => {
    if (canManageDocuments()) {
      setIsFileUploadModalOpen(true);
    } else {
      setShowPermissionDialog(true);
    }
  };

  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    staleTime: 0, // Always consider data stale to ensure fresh data
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: true, // Refetch when component mounts
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  // Fetch user activity data
  const { data: userActivity, isLoading: loadingActivity } = useQuery({
    queryKey: ["/api/dashboard/user-activity", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const response = await fetch(`/api/dashboard/user-activity?userId=${user.id}&limit=10`);
      if (!response.ok) {
        throw new Error('Failed to fetch user activity');
      }
      return response.json();
    },
    enabled: !!user?.id,
    staleTime: 0, // Always consider data stale
    refetchInterval: 30000, // Auto-refresh every 30 seconds
    refetchOnWindowFocus: true,
  });

  // Fetch recommendations data
  const { data: recommendations = [], isLoading: loadingRecommendations } = useQuery({
    queryKey: ["/api/recommendations"],
    queryFn: async () => {
      const response = await fetch("/api/recommendations?limit=5");
      if (!response.ok) throw new Error('Failed to fetch recommendations');
      return response.json();
    },
    staleTime: 0, // Always consider data stale
    refetchInterval: 30000, // Auto-refresh every 30 seconds
    refetchOnWindowFocus: true,
  });

  // Fetch reports data
  const { data: reports = [], isLoading: loadingReports } = useQuery({
    queryKey: ["/api/reports"],
    queryFn: async () => {
      const response = await fetch("/api/reports?limit=5");
      if (!response.ok) throw new Error('Failed to fetch reports');
      return response.json();
    },
    staleTime: 0, // Always consider data stale
    refetchInterval: 30000, // Auto-refresh every 30 seconds
    refetchOnWindowFocus: true,
  });

  // Fetch comments data
  const { data: comments = [], isLoading: loadingComments } = useQuery({
    queryKey: ["/api/comments"],
    queryFn: async () => {
      const response = await fetch("/api/comments?limit=5");
      if (!response.ok) throw new Error('Failed to fetch comments');
      return response.json();
    },
    staleTime: 0, // Always consider data stale
    refetchInterval: 30000, // Auto-refresh every 30 seconds
    refetchOnWindowFocus: true,
  });

  // Fetch user's favorite documents using the same approach as the main favorites page
  const { data: allDocuments = [], isLoading: loadingFavorites, error: favoritesError } = useQuery<DocumentWithDetails[]>({
    queryKey: ["/api/documents", user?.id, "favorites"],
    queryFn: async () => {
      if (!user?.id) return [];
      const cacheBuster = `&_t=${Date.now()}`;
      const url = `/api/documents?userId=${user.id}&sortBy=recent${cacheBuster}`;
      const response = await fetch(url, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (!response.ok) {
        console.error('Dashboard: Failed to fetch documents:', response.status, response.statusText);
        return [];
      }
      return response.json();
    },
    enabled: !!user?.id,
    staleTime: 0, // Always consider data stale to ensure fresh data
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: true, // Refetch when component mounts
    refetchInterval: 10000, // More frequent refresh for favorites
  });

  // Filter documents to get only favorites
  const userFavorites = allDocuments.filter(doc => doc.is_favorited);

  const { data: recentCases = [], isLoading: loadingCases } = useQuery<DocumentWithDetails[]>({
    queryKey: ["/api/dashboard/recent-cases"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/recent-documents?limit=3");
      if (!response.ok) {
        throw new Error('Failed to fetch recent cases');
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
    staleTime: 0, // Always consider data stale to ensure fresh data
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: true, // Refetch when component mounts
  });

  return (
    <MainLayout>
      <div className="p-6 min-h-full bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:bg-gradient-dark">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 space-x-reverse text-sm text-gray-600 dark:text-gray-400">
            <li><Link href="/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">الرئيسية</Link></li>
            <li><ChevronLeft className="w-3 h-3" /></li>
            <li className="text-gray-900 dark:text-white font-medium">لوحة التحكم</li>
          </ol>
        </nav>

        {/* Dashboard Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 space-x-reverse mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                مرحباً، {user?.fullName}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 flex items-center space-x-2 space-x-reverse">
                <Calendar className="w-4 h-4" />
                <span>إليك نظرة عامة على قضاياك ووثائقك الحديثة.</span>
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatsCard
            title="إجمالي القضايا"
            value={stats?.totalCases || 0}
            icon={Folder}
            iconBgColor="bg-blue-100"
            iconColor="text-blue-600"
            trend={{
              value: "+12%",
              label: "هذا الشهر",
              positive: true,
            }}
          />

          <StatsCard
            title="الوثائق المعالجة"
            value={stats?.processedDocs || 0}
            icon={FileCheck}
            iconBgColor="bg-green-100"
            iconColor="text-green-600"
            trend={{
              value: "+8%",
              label: "هذا الأسبوع",
              positive: true,
            }}
          />

          <StatsCard
            title="في الانتظار"
            value={stats?.pendingDocs || 0}
            icon={Clock}
            iconBgColor="bg-orange-100"
            iconColor="text-orange-600"
            trend={{
              value: "+3",
              label: "اليوم",
              positive: false,
            }}
          />

          <StatsCard
            title="مؤرشفة"
            value={stats?.archivedCases || 0}
            icon={Archive}
            iconBgColor="bg-gray-100"
            iconColor="text-gray-600"
            trend={{
              value: "+5",
              label: "هذا الشهر",
            }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* System Overview */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-4 h-4 text-blue-600" />
                    </div>
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">نظرة عامة على النظام</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loadingActivity ? (
                  <div className="text-center py-8 text-gray-500">
                    جاري التحميل...
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-600 p-4 rounded-lg">
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                            <FileCheck className="w-4 h-4 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي الوثائق</p>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats?.total_documents || 0}</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-gray-700 dark:to-gray-600 p-4 rounded-lg">
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                            <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">في الانتظار</p>
                            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats?.pending_documents || 0}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* System Health Overview */}
                    <div className="mt-6">
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">صحة النظام</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-600 p-3 rounded-lg">
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                              <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full"></div>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600 dark:text-gray-400">حالة الخادم</p>
                              <p className="text-sm font-semibold text-green-600 dark:text-green-400">ممتاز</p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-gray-700 dark:to-gray-600 p-3 rounded-lg">
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                              <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600 dark:text-gray-400">الأداء</p>
                              <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">98%</p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-gray-700 dark:to-gray-600 p-3 rounded-lg">
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                              <div className="w-2 h-2 bg-purple-500 dark:bg-purple-400 rounded-full"></div>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600 dark:text-gray-400">الأمان</p>
                              <p className="text-sm font-semibold text-purple-600 dark:text-purple-400">محمي</p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-gray-700 dark:to-gray-600 p-3 rounded-lg">
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <div className="w-6 h-6 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                              <div className="w-2 h-2 bg-orange-500 dark:bg-orange-400 rounded-full"></div>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600 dark:text-gray-400">التخزين</p>
                              <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">جيد</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Three detailed sections for recommendations, reports, and comments - Vertically aligned */}
            <div className="space-y-4 mt-6">
            {/* Recommendations Section */}
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-gray-700 dark:to-gray-600 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Lightbulb className="w-4 h-4 text-yellow-600" />
                    </div>
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">التوصيات</CardTitle>
                  </div>
                  <Link href="/recommendations">
                    <Button variant="ghost" size="sm" className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 transition-colors">
                      عرض الكل
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {loadingRecommendations ? (
                  <div className="text-center py-4 text-gray-500">
                    جاري التحميل...
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recommendations.length > 0 ? (
                      recommendations.slice(0, 4).map((rec: any) => (
                        <div key={rec.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                          <div className="flex items-start space-x-2 space-x-reverse">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{rec.title}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{rec.description}</p>
                              <div className="flex items-center justify-between mt-2">
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                                  rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-green-100 text-green-700'
                                }`}>
                                  {rec.priority === 'high' ? 'عالي' : rec.priority === 'medium' ? 'متوسط' : 'منخفض'}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {formatDateArabic(rec.created_at)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        لا توجد توصيات
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Reports Section */}
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-gray-700 dark:to-gray-600 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <Flag className="w-4 h-4 text-red-600" />
                    </div>
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">التقارير</CardTitle>
                  </div>
                  <Link href="/reports">
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors">
                      عرض الكل
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {loadingReports ? (
                  <div className="text-center py-4 text-gray-500">
                    جاري التحميل...
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reports.length > 0 ? (
                      reports.slice(0, 4).map((report: any) => (
                        <div key={report.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                          <div className="flex items-start space-x-2 space-x-reverse">
                            <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                              report.severity === 'critical' ? 'bg-red-500' :
                              report.severity === 'high' ? 'bg-orange-500' :
                              report.severity === 'medium' ? 'bg-yellow-500' :
                              'bg-green-500'
                            }`}></div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{report.title}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{report.description}</p>
                              <div className="flex items-center justify-between mt-2">
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  report.severity === 'critical' ? 'bg-red-100 text-red-700' :
                                  report.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                                  report.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-green-100 text-green-700'
                                }`}>
                                  {report.severity === 'critical' ? 'حرج' : 
                                   report.severity === 'high' ? 'عالي' :
                                   report.severity === 'medium' ? 'متوسط' : 'منخفض'}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {formatDateArabic(report.created_at)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        لا توجد تقارير
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Comments Section */}
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-blue-600" />
                    </div>
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">التعليقات</CardTitle>
                  </div>
                  <Link href="/comments">
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors">
                      عرض الكل
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {loadingComments ? (
                  <div className="text-center py-4 text-gray-500">
                    جاري التحميل...
                  </div>
                ) : (
                  <div className="space-y-3">
                    {comments.length > 0 ? (
                      comments.slice(0, 4).map((comment: any) => (
                        <div key={comment.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                          <div className="flex items-start space-x-2 space-x-reverse">
                            <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                              comment.is_resolved ? 'bg-green-500' : 'bg-blue-500'
                            }`}></div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{comment.content}</p>
                              <div className="flex items-center justify-between mt-2">
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  comment.type === 'question' ? 'bg-purple-100 text-purple-700' :
                                  comment.type === 'suggestion' ? 'bg-green-100 text-green-700' :
                                  comment.type === 'review' ? 'bg-blue-100 text-blue-700' :
                                  'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                }`}>
                                  {comment.type === 'question' ? 'سؤال' :
                                   comment.type === 'suggestion' ? 'اقتراح' :
                                   comment.type === 'review' ? 'مراجعة' : 'عام'}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {formatDateArabic(comment.created_at)}
                                </span>
                              </div>
                            </div>
                          </div>
                    </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        لا توجد تعليقات
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
            </div>
          </div>

          {/* Quick Actions & Favorites */}
          <div className="space-y-4">
            {/* Quick Actions */}
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-600 rounded-t-lg">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Plus className="w-4 h-4 text-green-600" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">إجراءات سريعة</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 p-6">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start h-12 hover:bg-blue-50 transition-all duration-200 group"
                  onClick={handleCreateDocument}
                >
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center ml-3 group-hover:bg-blue-200 transition-colors">
                      <Plus className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="font-medium">إنشاء قضية جديدة</span>
                  </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full justify-start h-12 hover:bg-green-50 transition-all duration-200 group"
                  onClick={handleUploadFile}
                >
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center ml-3 group-hover:bg-green-200 transition-colors">
                    <Upload className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="font-medium">رفع وثيقة</span>
                </Button>
                
                <Link href="/documents">
                  <Button variant="ghost" className="w-full justify-start h-12 hover:bg-purple-50 transition-all duration-200 group">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center ml-3 group-hover:bg-purple-200 transition-colors">
                      <Search className="w-5 h-5 text-purple-600" />
                    </div>
                    <span className="font-medium">بحث متقدم</span>
                  </Button>
                </Link>
                
                <Link href="/reports">
                  <Button variant="ghost" className="w-full justify-start h-12 hover:bg-orange-50 transition-all duration-200 group">
                    <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center ml-3 group-hover:bg-orange-200 transition-colors">
                      <BarChart3 className="w-5 h-5 text-orange-600" />
                    </div>
                    <span className="font-medium">إنشاء تقرير</span>
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Favorites */}
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-gray-700 dark:to-gray-600 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Star className="w-4 h-4 text-yellow-600" />
                    </div>
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                      الوثائق المفضلة {userFavorites && userFavorites.length > 0 && `(${userFavorites.length})`}
                    </CardTitle>
                  </div>
                  <Link href="/favorites">
                    <Button variant="ghost" size="sm" className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 transition-colors">
                      عرض الكل
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {loadingFavorites ? (
                  <div className="text-center py-4 text-gray-500">
                    جاري التحميل...
                  </div>
                ) : favoritesError ? (
                  <div className="text-center py-4 text-red-500">
                    خطأ في تحميل المفضلة: {favoritesError.message}
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      {userFavorites && userFavorites.length > 0 ? (
                        userFavorites.slice(0, 3).map((doc: any) => (
                          <div 
                            key={doc.id} 
                            className="flex items-center space-x-3 space-x-reverse p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
                            onClick={() => setLocation(`/documents/${doc.id}`)}
                          >
                            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                              <FileText className="w-4 h-4 text-yellow-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{doc.title}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {formatDateArabic(doc.created_at)}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          لا توجد وثائق مفضلة
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Modals and Dialogs */}
        <EnhancedDocumentUploadModal
          isOpen={isCreateDocumentModalOpen}
          onClose={() => setIsCreateDocumentModalOpen(false)}
        />

        <FileUploadModal
          isOpen={isFileUploadModalOpen}
          onClose={() => setIsFileUploadModalOpen(false)}
        />

        {/* Permission Denied Dialog */}
        <Dialog open={showPermissionDialog} onOpenChange={setShowPermissionDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center text-gray-900">صلاحيات محدودة</DialogTitle>
              <DialogDescription className="text-center text-gray-600 mt-2">
                عذراً، لا تملك الصلاحيات اللازمة لإنشاء الوثائق أو رفع الملفات.
                <br />
                <span className="text-sm text-gray-500 mt-2 block">
                  دورك الحالي: {user?.role || 'viewer'}
                </span>
                <br />
                <span className="text-sm text-gray-500">
                  يرجى التواصل مع مدير النظام للحصول على الصلاحيات المناسبة.
                </span>
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-center mt-6">
              <Button 
                onClick={() => setShowPermissionDialog(false)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                فهمت
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
