import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, 
  FileText, 
  Shield, 
  AlertTriangle, 
  Users, 
  TrendingUp, 
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Calendar,
  Database,
  Eye,
  Download as DownloadIcon,
  Trash2
} from "@/lib/icons";
import { SystemReport } from "@shared/schema";

interface ReportDisplayProps {
  report: SystemReport;
  onDownload?: () => void;
}

export function ReportDisplay({ report, onDownload }: ReportDisplayProps) {
  const getReportIcon = (type: string) => {
    const icons = {
      'user_activity': Activity,
      'document_stats': FileText,
      'system_health': Shield,
      'security_audit': AlertTriangle
    };
    return icons[type as keyof typeof icons] || BarChart3;
  };

  const getReportColor = (type: string) => {
    const colors = {
      'user_activity': 'text-blue-600',
      'document_stats': 'text-green-600',
      'system_health': 'text-purple-600',
      'security_audit': 'text-red-600'
    };
    return colors[type as keyof typeof colors] || 'text-gray-600';
  };

  const formatNumber = (num: number) => {
    return num.toString().replace(/\d/g, (digit) => {
      const arabicToEnglish: { [key: string]: string } = {
        '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
        '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
      };
      return arabicToEnglish[digit] || digit;
    });
  };

  const renderUserActivityReport = (data: any) => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">إجمالي الأنشطة</p>
                <p className="text-2xl font-bold text-blue-900">{formatNumber(data.totalActivities)}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">المستخدمون النشطون</p>
                <p className="text-2xl font-bold text-green-900">{formatNumber(data.activeUsers)}</p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">الفترة الزمنية</p>
                <p className="text-lg font-bold text-purple-900">{data.period}</p>
              </div>
              <Clock className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 space-x-reverse">
            <BarChart3 className="w-5 h-5" />
            <span>توزيع الأنشطة</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 space-x-reverse">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>الوثائق</span>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <span className="font-medium">{formatNumber(data.activityBreakdown.documentActions)}</span>
                <Progress 
                  value={(data.activityBreakdown.documentActions / data.totalActivities) * 100} 
                  className="w-24"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Users className="w-4 h-4 text-green-600" />
                <span>المستخدمون</span>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <span className="font-medium">{formatNumber(data.activityBreakdown.userActions)}</span>
                <Progress 
                  value={(data.activityBreakdown.userActions / data.totalActivities) * 100} 
                  className="w-24"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Eye className="w-4 h-4 text-purple-600" />
                <span>التعليقات</span>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <span className="font-medium">{formatNumber(data.activityBreakdown.commentActions)}</span>
                <Progress 
                  value={(data.activityBreakdown.commentActions / data.totalActivities) * 100} 
                  className="w-24"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 space-x-reverse">
                <BarChart3 className="w-4 h-4 text-orange-600" />
                <span>التقارير</span>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <span className="font-medium">{formatNumber(data.activityBreakdown.reportActions)}</span>
                <Progress 
                  value={(data.activityBreakdown.reportActions / data.totalActivities) * 100} 
                  className="w-24"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 space-x-reverse">
            <TrendingUp className="w-5 h-5" />
            <span>أكثر المستخدمين نشاطاً</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.userStats.slice(0, 5).map((user: any, index: number) => (
              <div key={user.userId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{user.userName}</p>
                    <p className="text-sm text-gray-600">{user.userRole}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-600">{formatNumber(user.activityCount)}</p>
                  <p className="text-xs text-gray-500">نشاط</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderDocumentStatsReport = (data: any) => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">إجمالي الوثائق</p>
                <p className="text-2xl font-bold text-blue-900">{formatNumber(data.totalDocuments)}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">وثائق جديدة</p>
                <p className="text-2xl font-bold text-green-900">{formatNumber(data.newDocuments)}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">وثائق محدثة</p>
                <p className="text-2xl font-bold text-orange-900">{formatNumber(data.updatedDocuments)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700">وثائق محذوفة</p>
                <p className="text-2xl font-bold text-red-900">{formatNumber(data.deletedDocuments)}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Documents by Category */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 space-x-reverse">
            <BarChart3 className="w-5 h-5" />
            <span>الوثائق حسب الفئة</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(data.documentsByCategory).map(([category, count]: [string, any]) => (
              <div key={category} className="flex items-center justify-between">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
                  <span className="font-medium">{category}</span>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <span className="font-bold text-blue-600">{formatNumber(count)}</span>
                  <Progress 
                    value={(count / data.totalDocuments) * 100} 
                    className="w-24"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Documents by Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 space-x-reverse">
            <Database className="w-5 h-5" />
            <span>الوثائق حسب الحالة</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-green-700">نشطة</p>
              <p className="text-2xl font-bold text-green-900">{formatNumber(data.documentsByStatus.active)}</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-xl">
              <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-sm text-yellow-700">معلقة</p>
              <p className="text-2xl font-bold text-yellow-900">{formatNumber(data.documentsByStatus.pending)}</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <Database className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-700">مؤرشفة</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(data.documentsByStatus.archived)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSystemHealthReport = (data: any) => (
    <div className="space-y-6">
      {/* System Status */}
      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">حالة النظام</p>
              <p className="text-2xl font-bold text-green-900 capitalize">{data.systemStatus}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
        </CardContent>
      </Card>

      {/* User Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">إجمالي المستخدمين</p>
                <p className="text-2xl font-bold text-blue-900">{formatNumber(data.totalUsers)}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">المستخدمون النشطون</p>
                <p className="text-2xl font-bold text-green-900">{formatNumber(data.activeUsers)}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700">المستخدمون المقيدون</p>
                <p className="text-2xl font-bold text-red-900">{formatNumber(data.restrictedUsers)}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Roles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 space-x-reverse">
            <Users className="w-5 h-5" />
            <span>توزيع المستخدمين حسب الأدوار</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Shield className="w-4 h-4 text-red-600" />
                <span>المديرون</span>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <span className="font-medium">{formatNumber(data.userRoles.admin)}</span>
                <Progress 
                  value={(data.userRoles.admin / data.totalUsers) * 100} 
                  className="w-24"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 space-x-reverse">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>الأرشيفيون</span>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <span className="font-medium">{formatNumber(data.userRoles.archivist)}</span>
                <Progress 
                  value={(data.userRoles.archivist / data.totalUsers) * 100} 
                  className="w-24"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Eye className="w-4 h-4 text-green-600" />
                <span>المشاهدون</span>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <span className="font-medium">{formatNumber(data.userRoles.viewer)}</span>
                <Progress 
                  value={(data.userRoles.viewer / data.totalUsers) * 100} 
                  className="w-24"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSecurityAuditReport = (data: any) => (
    <div className="space-y-6">
      {/* Security Summary */}
      <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-700">إجمالي أحداث الأمان</p>
              <p className="text-2xl font-bold text-red-900">{formatNumber(data.totalSecurityEvents)}</p>
            </div>
            <AlertTriangle className="w-12 h-12 text-red-600" />
          </div>
        </CardContent>
      </Card>

      {/* Security Events Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">تسجيلات الدخول</p>
                <p className="text-2xl font-bold text-blue-900">{formatNumber(data.loginEvents)}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">تسجيلات الخروج</p>
                <p className="text-2xl font-bold text-orange-900">{formatNumber(data.logoutEvents)}</p>
              </div>
              <XCircle className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700">قيود المستخدمين</p>
                <p className="text-2xl font-bold text-red-900">{formatNumber(data.userRestrictions)}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">حذف المستخدمين</p>
                <p className="text-2xl font-bold text-purple-900">{formatNumber(data.userDeletions)}</p>
              </div>
              <Trash2 className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-700">تغيير الأدوار</p>
                <p className="text-2xl font-bold text-yellow-900">{formatNumber(data.roleChanges)}</p>
              </div>
              <Users className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderReportContent = () => {
    switch (report.report_type) {
      case 'user_activity':
        return renderUserActivityReport(report.data);
      case 'document_stats':
        return renderDocumentStatsReport(report.data);
      case 'system_health':
        return renderSystemHealthReport(report.data);
      case 'security_audit':
        return renderSecurityAuditReport(report.data);
      default:
        return (
          <Card>
            <CardContent className="p-6">
              <p className="text-gray-600">نوع التقرير غير مدعوم</p>
            </CardContent>
          </Card>
        );
    }
  };

  const IconComponent = getReportIcon(report.report_type);

  return (
    <div className="space-y-6">
      {/* Report Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <IconComponent className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">{report.title}</CardTitle>
                <p className="text-gray-600">{report.description}</p>
              </div>
            </div>
            {onDownload && (
              <button
                onClick={onDownload}
                className="flex items-center space-x-2 space-x-reverse px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
              >
                <DownloadIcon className="w-4 h-4" />
                <span>تحميل PDF</span>
              </button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Report Content */}
      {renderReportContent()}
    </div>
  );
}
