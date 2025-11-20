import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { type SystemReport, type UserActivityLog, type User } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { 
  BarChart3, 
  FileText, 
  Download, 
  Eye, 
  Trash2, 
  Plus,
  Calendar,
  Users,
  Activity,
  Shield,
  AlertTriangle,
  TrendingUp,
  Clock,
  Filter,
  RefreshCw
} from "@/lib/icons";
import { ReportDisplay } from "@/components/report-display";
import { PDFGenerator } from "@/lib/pdf-generator";

export default function Rapport() {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<SystemReport | null>(null);
  const [reportType, setReportType] = useState<string>("");
  const [dateRange, setDateRange] = useState<string>("7");

  const { data: systemReports = [], isLoading: reportsLoading } = useQuery<SystemReport[]>({
    queryKey: ["/api/system-reports"],
  });

  const { data: allUsers = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const { data: userActivity = [] } = useQuery<UserActivityLog[]>({
    queryKey: ["/api/user-activity"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/user-activity");
      return await response.json();
    },
  });

  const generateReportMutation = useMutation({
    mutationFn: async (data: { title: string; reportType: string; dateRange: string }) => {
      // Generate report data based on type
      let reportData: any = {};
      
      switch (data.reportType) {
        case 'user_activity':
          reportData = await generateUserActivityReport(data.dateRange);
          break;
        case 'document_stats':
          reportData = await generateDocumentStatsReport(data.dateRange);
          break;
        case 'system_health':
          reportData = await generateSystemHealthReport();
          break;
        case 'security_audit':
          reportData = await generateSecurityAuditReport(data.dateRange);
          break;
      }

      const response = await apiRequest("POST", "/api/system-reports", {
        title: data.title,
        description: `تقرير ${getReportTypeLabel(data.reportType)} - ${data.dateRange} أيام`,
        report_type: data.reportType,
        data: reportData,
        generated_by: currentUser?.id,
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم الإنشاء",
        description: "تم إنشاء التقرير بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/system-reports"] });
      setIsGenerateModalOpen(false);
      setReportType("");
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في إنشاء التقرير",
        variant: "destructive",
      });
    },
  });

  const deleteReportMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/system-reports/${id}`);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم الحذف",
        description: "تم حذف التقرير بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/system-reports"] });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في حذف التقرير",
        variant: "destructive",
      });
    },
  });

  const generateUserActivityReport = async (dateRange: string) => {
    try {
      const days = parseInt(dateRange);
      const response = await apiRequest("GET", `/api/reports/user-activity/${days}`);
      return await response.json();
    } catch (error) {
      console.error('Error generating user activity report:', error);
      // Fallback to basic data if API fails
      return {
        period: `${dateRange} أيام`,
        totalActivities: 0,
        activeUsers: 0,
        activityBreakdown: {
          documentActions: 0,
          userActions: 0,
          commentActions: 0,
          reportActions: 0,
        },
        userStats: []
      };
    }
  };

  const generateDocumentStatsReport = async (dateRange: string) => {
    try {
      const days = parseInt(dateRange);
      const response = await apiRequest("GET", `/api/reports/document-stats/${days}`);
      return await response.json();
    } catch (error) {
      console.error('Error generating document stats report:', error);
      // Fallback to basic data if API fails
      return {
        period: `${dateRange} أيام`,
        totalDocuments: 0,
        newDocuments: 0,
        updatedDocuments: 0,
        deletedDocuments: 0,
        documentsByCategory: {},
        documentsByStatus: {
          active: 0,
          pending: 0,
          archived: 0
        }
      };
    }
  };

  const generateSystemHealthReport = async () => {
    try {
      const response = await apiRequest("GET", "/api/reports/system-health");
      return await response.json();
    } catch (error) {
      console.error('Error generating system health report:', error);
      // Fallback to basic data if API fails
      return {
        generatedAt: new Date().toISOString(),
        systemStatus: 'unknown',
        totalUsers: 0,
        activeUsers: 0,
        restrictedUsers: 0,
        userRoles: {
          admin: 0,
          archivist: 0,
          viewer: 0,
        },
        recentActivity: [],
        systemAlerts: []
      };
    }
  };

  const generateSecurityAuditReport = async (dateRange: string) => {
    try {
      const days = parseInt(dateRange);
      const response = await apiRequest("GET", `/api/reports/security-audit/${days}`);
      return await response.json();
    } catch (error) {
      console.error('Error generating security audit report:', error);
      // Fallback to basic data if API fails
      return {
        period: `${dateRange} أيام`,
        totalSecurityEvents: 0,
        loginEvents: 0,
        logoutEvents: 0,
        userRestrictions: 0,
        userDeletions: 0,
        roleChanges: 0,
        recentSecurityEvents: []
      };
    }
  };

  const getReportTypeLabel = (type: string) => {
    const labels = {
      'user_activity': 'نشاط المستخدمين',
      'document_stats': 'إحصائيات الوثائق',
      'system_health': 'صحة النظام',
      'security_audit': 'مراجعة الأمان'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getReportTypeIcon = (type: string) => {
    const icons = {
      'user_activity': Activity,
      'document_stats': FileText,
      'system_health': Shield,
      'security_audit': AlertTriangle
    };
    return icons[type as keyof typeof icons] || BarChart3;
  };

  const getReportTypeColor = (type: string) => {
    const colors = {
      'user_activity': 'bg-blue-100 text-blue-800',
      'document_stats': 'bg-green-100 text-green-800',
      'system_health': 'bg-purple-100 text-purple-800',
      'security_audit': 'bg-red-100 text-red-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const handleGenerateReport = () => {
    if (!reportType) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار نوع التقرير",
        variant: "destructive",
      });
      return;
    }

    const title = `تقرير ${getReportTypeLabel(reportType)} - ${new Date().toLocaleDateString('en-US')}`;
    
    generateReportMutation.mutate({
      title,
      reportType,
      dateRange,
    });
  };

  const handleViewReport = (report: SystemReport) => {
    setSelectedReport(report);
  };

  const handleDownloadReport = async (report: SystemReport) => {
    try {
      await PDFGenerator.generateReportPDF(report);
      toast({
        title: "تم التحميل",
        description: "تم تحميل التقرير كملف PDF بنجاح",
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل التقرير",
        variant: "destructive",
      });
    }
  };

  const filteredReports = systemReports.filter(report => {
    if (reportType && report.report_type !== reportType) return false;
    return true;
  });

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:bg-gradient-dark p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">تقارير النظام</h1>
          <p className="text-gray-600 dark:text-gray-400">مراقبة وإدارة تقارير النظام والنشاط</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">إجمالي التقارير</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{systemReports.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">تقارير النشاط</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {systemReports.filter(r => r.report_type === 'user_activity').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">تقارير الأمان</p>
                  <p className="text-2xl font-bold text-red-600">
                    {systemReports.filter(r => r.report_type === 'security_audit').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">صحة النظام</p>
                  <p className="text-2xl font-bold text-green-600">
                    {systemReports.filter(r => r.report_type === 'system_health').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions and Filters */}
        <Card className="mb-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2 space-x-reverse">
                <BarChart3 className="w-5 h-5" />
                <span>التقارير ({filteredReports.length})</span>
              </CardTitle>
              <Dialog open={isGenerateModalOpen} onOpenChange={setIsGenerateModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
                    <Plus className="w-4 h-4 ml-2" />
                    إنشاء تقرير جديد
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>إنشاء تقرير جديد</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">نوع التقرير</label>
                      <Select value={reportType} onValueChange={setReportType}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر نوع التقرير" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user_activity">نشاط المستخدمين</SelectItem>
                          <SelectItem value="document_stats">إحصائيات الوثائق</SelectItem>
                          <SelectItem value="system_health">صحة النظام</SelectItem>
                          <SelectItem value="security_audit">مراجعة الأمان</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">الفترة الزمنية</label>
                      <Select value={dateRange} onValueChange={setDateRange}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الفترة الزمنية" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">آخر 24 ساعة</SelectItem>
                          <SelectItem value="7">آخر 7 أيام</SelectItem>
                          <SelectItem value="30">آخر 30 يوم</SelectItem>
                          <SelectItem value="90">آخر 90 يوم</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end space-x-2 space-x-reverse pt-4">
                      <Button variant="outline" onClick={() => setIsGenerateModalOpen(false)}>
                        إلغاء
                      </Button>
                      <Button
                        onClick={handleGenerateReport}
                        disabled={generateReportMutation.isPending}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                      >
                        {generateReportMutation.isPending ? "جاري الإنشاء..." : "إنشاء التقرير"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="flex-1">
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="تصفية حسب نوع التقرير" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الأنواع</SelectItem>
                    <SelectItem value="user_activity">نشاط المستخدمين</SelectItem>
                    <SelectItem value="document_stats">إحصائيات الوثائق</SelectItem>
                    <SelectItem value="system_health">صحة النظام</SelectItem>
                    <SelectItem value="security_audit">مراجعة الأمان</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="outline"
                onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/system-reports"] })}
              >
                <RefreshCw className="w-4 h-4 ml-2" />
                تحديث
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Reports Table */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
          <CardContent>
            {reportsLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <p className="mt-2 text-gray-600 dark:text-gray-400">جاري التحميل...</p>
              </div>
            ) : filteredReports.length > 0 ? (
              <Table>
                <TableHeader className="bg-gray-50 dark:bg-gray-700">
                  <TableRow className="border-gray-200 dark:border-gray-600">
                    <TableHead className="text-gray-700 dark:text-gray-300">التقرير</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-300">النوع</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-300">تاريخ الإنشاء</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-300">المنشئ</TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-300">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((report) => {
                    const IconComponent = getReportTypeIcon(report.report_type);
                    return (
                      <TableRow key={report.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <TableCell>
                          <div className="flex items-center space-x-3 space-x-reverse">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <IconComponent className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">{report.title}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">{report.description}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getReportTypeColor(report.report_type)}>
                            {getReportTypeLabel(report.report_type)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(report.created_at).toLocaleDateString('en-US')} {new Date(report.created_at).toLocaleTimeString('en-US')}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {allUsers.find(u => u.id === report.generated_by)?.fullName || 'غير معروف'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewReport(report)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownloadReport(report)}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>حذف التقرير</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    هل أنت متأكد من حذف التقرير "{report.title}"؟
                                    هذا الإجراء لا يمكن التراجع عنه.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteReportMutation.mutate(report.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    حذف
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  لا توجد تقارير
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  ابدأ بإنشاء تقرير جديد لمراقبة النظام
                </p>
                <Button onClick={() => setIsGenerateModalOpen(true)}>
                  إنشاء أول تقرير
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Report Detail Modal */}
        <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
          <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2 space-x-reverse">
                <BarChart3 className="w-5 h-5" />
                <span>تفاصيل التقرير</span>
              </DialogTitle>
            </DialogHeader>

            {selectedReport && (
              <ReportDisplay 
                report={selectedReport} 
                onDownload={() => handleDownloadReport(selectedReport)}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
