import { useState, useEffect } from "react";
import { Link, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MainLayout } from "@/components/layout/main-layout";
import { useAuth } from "@/hooks/use-auth";
import type { Report } from "@shared/schema";
import { formatDateArabic } from "@/lib/utils";

export default function ReportDetailPage() {
  const { id } = useParams();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (id) {
      fetchReport(id);
    }
  }, [id]);

  const fetchReport = async (reportId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/reports/${reportId}`);
      if (response.ok) {
        const data = await response.json();
        setReport(data);
      }
    } catch (error) {
      console.error("Error fetching report:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateReport = async (updates: Partial<Report>) => {
    if (!id) return;

    try {
      setUpdating(true);
      const response = await fetch(`/api/reports/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const updatedReport = await response.json();
        setReport(updatedReport);
      }
    } catch (error) {
      console.error("Error updating report:", error);
    } finally {
      setUpdating(false);
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "error":
        return "bg-red-100 text-red-800";
      case "improvement":
        return "bg-blue-100 text-blue-800";
      case "complaint":
        return "bg-orange-100 text-orange-800";
      case "suggestion":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-red-100 text-red-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case "error":
        return "خطأ";
      case "improvement":
        return "تحسين";
      case "complaint":
        return "شكوى";
      case "suggestion":
        return "اقتراح";
      default:
        return type;
    }
  };

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case "critical":
        return "حرج";
      case "high":
        return "عالي";
      case "medium":
        return "متوسط";
      case "low":
        return "منخفض";
      default:
        return severity;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "open":
        return "مفتوح";
      case "in_progress":
        return "قيد التنفيذ";
      case "resolved":
        return "محلول";
      case "closed":
        return "مغلق";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">جاري تحميل التقرير...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">التقرير غير موجود</h2>
        <p className="text-gray-600 mb-4">لم يتم العثور على التقرير المطلوب</p>
        <Button asChild>
          <Link href="/reports">
            <i className="fas fa-arrow-right ml-2"></i>
            العودة إلى التقارير
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">تفاصيل التقرير</h1>
          <p className="text-gray-600">عرض وتعديل تفاصيل التقرير</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/reports">
            <i className="fas fa-arrow-right ml-2"></i>
            العودة إلى التقارير
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{report.title}</CardTitle>
                  <CardDescription className="mt-2">
                    {report.description}
                  </CardDescription>
                </div>
                <div className="flex flex-col space-y-2">
                  <Badge className={getTypeBadgeColor(report.type)}>
                    {getTypeText(report.type)}
                  </Badge>
                  <Badge className={getSeverityBadgeColor(report.severity)}>
                    {getSeverityText(report.severity)}
                  </Badge>
                  <Badge className={getStatusBadgeColor(report.status)}>
                    {getStatusText(report.status)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">الوثيقة المرتبطة</h4>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <i className="fas fa-file-alt text-gray-400"></i>
                    <Link
                      href={`/documents/${report.document_id}`}
                      className="text-primary-600 hover:text-primary-800 font-medium"
                    >
                      {report.documents?.title || report.documents?.reference}
                    </Link>
                  </div>
                  {report.documents?.category && (
                    <p className="text-sm text-gray-600 mt-1">
                      الفئة: {report.documents.category}
                    </p>
                  )}
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">مقدم التقرير</h4>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <i className="fas fa-user text-gray-400"></i>
                    <span>{report.users?.full_name || report.users?.username}</span>
                    <Badge variant="outline" className="text-xs">
                      {report.users?.role}
                    </Badge>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">تواريخ مهمة</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">تاريخ الإنشاء:</span>
                      <p className="font-medium">
                        {formatDateArabic(report.created_at, {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-300">آخر تحديث:</span>
                      <p className="font-medium">
                        {formatDateArabic(report.updated_at, {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Management */}
          {(user?.role === "admin" || user?.role === "archivist") && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">إدارة التقرير</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    النوع
                  </label>
                  <Select
                    value={report.type}
                    onValueChange={(value) => updateReport({ type: value as any })}
                    disabled={updating}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="error">خطأ</SelectItem>
                      <SelectItem value="improvement">تحسين</SelectItem>
                      <SelectItem value="complaint">شكوى</SelectItem>
                      <SelectItem value="suggestion">اقتراح</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الخطورة
                  </label>
                  <Select
                    value={report.severity}
                    onValueChange={(value) => updateReport({ severity: value as any })}
                    disabled={updating}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">منخفض</SelectItem>
                      <SelectItem value="medium">متوسط</SelectItem>
                      <SelectItem value="high">عالي</SelectItem>
                      <SelectItem value="critical">حرج</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الحالة
                  </label>
                  <Select
                    value={report.status}
                    onValueChange={(value) => updateReport({ status: value as any })}
                    disabled={updating}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">مفتوح</SelectItem>
                      <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                      <SelectItem value="resolved">محلول</SelectItem>
                      <SelectItem value="closed">مغلق</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {updating && (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500 mx-auto"></div>
                    <p className="text-sm text-gray-600 mt-1">جاري التحديث...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">إجراءات سريعة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/documents/${report.document_id}`}>
                  <i className="fas fa-file-alt ml-2"></i>
                  عرض الوثيقة
                </Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/reports">
                  <i className="fas fa-list ml-2"></i>
                  جميع التقارير
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </MainLayout>
  );
}
