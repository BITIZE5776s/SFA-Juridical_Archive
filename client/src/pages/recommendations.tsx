import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MainLayout } from "@/components/layout/main-layout";
import { useAuth } from "@/hooks/use-auth";
import type { Recommendation } from "@shared/schema";
import { formatDateArabic } from "@/lib/utils";

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const { user } = useAuth();

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/recommendations");
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data);
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecommendations = recommendations.filter((rec) => {
    const matchesSearch = 
      rec.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.documents?.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || rec.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || rec.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-100";
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-100";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-100";
      case "implemented":
        return "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-100";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-500/30 dark:text-gray-100";
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-100";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-100";
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-100";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-500/30 dark:text-gray-100";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "في الانتظار";
      case "approved":
        return "موافق عليه";
      case "rejected":
        return "مرفوض";
      case "implemented":
        return "تم التنفيذ";
      default:
        return status;
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "high":
        return "عالي";
      case "medium":
        return "متوسط";
      case "low":
        return "منخفض";
      default:
        return priority;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">جاري تحميل التوصيات...</p>
        </div>
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">التوصيات</h1>
            <p className="text-gray-600 dark:text-gray-300">إدارة وتتبع التوصيات المقدمة للوثائق</p>
          </div>
          <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-400">
            <Link href="/recommendations/new">
              <i className="fas fa-plus ml-2"></i>
              توصية جديدة
            </Link>
          </Button>
        </div>

      {/* Filters */}
      <Card className="bg-white/80 dark:bg-gray-900/60 border border-gray-100/60 dark:border-gray-800/70 shadow-sm backdrop-blur">
        <CardHeader className="p-6 pb-4">
          <CardTitle className="text-gray-900 dark:text-white">تصفية التوصيات</CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                البحث
              </label>
              <Input
                placeholder="البحث في التوصيات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                الحالة
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="pending">في الانتظار</SelectItem>
                  <SelectItem value="approved">موافق عليه</SelectItem>
                  <SelectItem value="rejected">مرفوض</SelectItem>
                  <SelectItem value="implemented">تم التنفيذ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                الأولوية
              </label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الأولوية" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأولويات</SelectItem>
                  <SelectItem value="high">عالي</SelectItem>
                  <SelectItem value="medium">متوسط</SelectItem>
                  <SelectItem value="low">منخفض</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setPriorityFilter("all");
                }}
                className="w-full border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200"
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
        {filteredRecommendations.length === 0 ? (
          <Card className="bg-white/80 dark:bg-gray-900/60 border border-gray-100/60 dark:border-gray-800/70 shadow-sm backdrop-blur">
            <CardContent className="text-center py-8 text-gray-900 dark:text-gray-100">
              <i className="fas fa-lightbulb text-4xl text-gray-400 dark:text-gray-500 mb-4"></i>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                لا توجد توصيات
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {searchTerm || statusFilter !== "all" || priorityFilter !== "all"
                  ? "لم يتم العثور على توصيات تطابق المعايير المحددة"
                  : "لم يتم إنشاء أي توصيات بعد"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredRecommendations.map((recommendation) => (
            <Card key={recommendation.id} className="hover:shadow-md transition-shadow bg-white/90 dark:bg-gray-900/70 border border-gray-100/60 dark:border-gray-800/70 backdrop-blur">
              <CardHeader className="p-6 pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2 text-gray-900 dark:text-white">
                      {recommendation.title}
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                      {recommendation.description}
                    </CardDescription>
                    <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-500 dark:text-gray-400">
                      <span>
                        <i className="fas fa-user ml-1"></i>
                        {recommendation.users?.full_name || recommendation.users?.username}
                      </span>
                      <span>•</span>
                      <span>
                        <i className="fas fa-calendar ml-1"></i>
                        {formatDateArabic(recommendation.created_at)}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Badge className={getStatusBadgeColor(recommendation.status)}>
                      {getStatusText(recommendation.status)}
                    </Badge>
                    <Badge className={getPriorityBadgeColor(recommendation.priority)}>
                      {getPriorityText(recommendation.priority)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-600 dark:text-gray-300">
                    <i className="fas fa-file-alt"></i>
                    <span>الوثيقة:</span>
                    <Link
                      href={`/documents/${recommendation.document_id}`}
                      className="text-primary-600 hover:text-primary-800 dark:text-primary-300 dark:hover:text-primary-200 font-medium"
                    >
                      {recommendation.documents?.title || recommendation.documents?.reference}
                    </Link>
                  </div>
                  <div className="flex space-x-2 space-x-reverse">
                    <Button variant="outline" size="sm" asChild className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200">
                      <Link href={`/recommendations/${recommendation.id}`}>
                        <i className="fas fa-eye ml-1"></i>
                        عرض التفاصيل
                      </Link>
                    </Button>
                    {(user?.role === "admin" || user?.role === "archivist") && (
                      <Button variant="outline" size="sm" className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200">
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
