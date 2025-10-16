import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MainLayout } from "@/components/layout/main-layout";
import { useAuth } from "@/hooks/use-auth";
import type { Report } from "@shared/schema";
import { formatDateArabic } from "@/lib/utils";

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { user } = useAuth();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/reports");
      if (response.ok) {
        const data = await response.json();
        setReports(data);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter((report) => {
    const matchesSearch = 
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.documents?.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === "all" || report.type === typeFilter;
    const matchesSeverity = severityFilter === "all" || report.severity === severityFilter;
    const matchesStatus = statusFilter === "all" || report.status === statusFilter;
    
    return matchesSearch && matchesType && matchesSeverity && matchesStatus;
  });

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
          <p className="mt-2 text-gray-600">جاري تحميل التقارير...</p>
        </div>
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">التقارير</h1>
            <p className="text-gray-600">إدارة وتتبع التقارير المقدمة للوثائق</p>
          </div>
          <Button asChild>
            <Link href="/reports/new">
              <i className="fas fa-plus ml-2"></i>
              تقرير جديد
            </Link>
          </Button>
        </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>تصفية التقارير</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                البحث
              </label>
              <Input
                placeholder="البحث في التقارير..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                النوع
              </label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر النوع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأنواع</SelectItem>
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
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الخطورة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المستويات</SelectItem>
                  <SelectItem value="critical">حرج</SelectItem>
                  <SelectItem value="high">عالي</SelectItem>
                  <SelectItem value="medium">متوسط</SelectItem>
                  <SelectItem value="low">منخفض</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الحالة
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="open">مفتوح</SelectItem>
                  <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                  <SelectItem value="resolved">محلول</SelectItem>
                  <SelectItem value="closed">مغلق</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setTypeFilter("all");
                  setSeverityFilter("all");
                  setStatusFilter("all");
                }}
                className="w-full"
              >
                <i className="fas fa-refresh ml-2"></i>
                إعادة تعيين
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="grid gap-4">
        {filteredReports.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <i className="fas fa-flag text-4xl text-gray-400 mb-4"></i>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                لا توجد تقارير
              </h3>
              <p className="text-gray-600">
                {searchTerm || typeFilter !== "all" || severityFilter !== "all" || statusFilter !== "all"
                  ? "لم يتم العثور على تقارير تطابق المعايير المحددة"
                  : "لم يتم إنشاء أي تقارير بعد"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredReports.map((report) => (
            <Card key={report.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">
                      {report.title}
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-600 mb-3">
                      {report.description}
                    </CardDescription>
                    <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-500">
                      <span>
                        <i className="fas fa-user ml-1"></i>
                        {report.users?.full_name || report.users?.username}
                      </span>
                      <span>•</span>
                      <span>
                        <i className="fas fa-calendar ml-1"></i>
                        {formatDateArabic(report.created_at)}
                      </span>
                    </div>
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-600">
                    <i className="fas fa-file-alt"></i>
                    <span>الوثيقة:</span>
                    <Link
                      href={`/documents/${report.document_id}`}
                      className="text-primary-600 hover:text-primary-800 font-medium"
                    >
                      {report.documents?.title || report.documents?.reference}
                    </Link>
                  </div>
                  <div className="flex space-x-2 space-x-reverse">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/reports/${report.id}`}>
                        <i className="fas fa-eye ml-1"></i>
                        عرض التفاصيل
                      </Link>
                    </Button>
                    {(user?.role === "admin" || user?.role === "archivist") && (
                      <Button variant="outline" size="sm">
                        <i className="fas fa-edit ml-1"></i>
                        تعديل
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      </div>
    </MainLayout>
  );
}
