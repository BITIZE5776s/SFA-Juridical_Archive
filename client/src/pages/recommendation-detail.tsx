import { useState, useEffect } from "react";
import { Link, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MainLayout } from "@/components/layout/main-layout";
import { useAuth } from "@/hooks/use-auth";
import type { Recommendation } from "@shared/schema";
import { formatDateArabic } from "@/lib/utils";

export default function RecommendationDetailPage() {
  const { id } = useParams();
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (id) {
      fetchRecommendation(id);
    }
  }, [id]);

  const fetchRecommendation = async (recommendationId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/recommendations/${recommendationId}`);
      if (response.ok) {
        const data = await response.json();
        setRecommendation(data);
      }
    } catch (error) {
      console.error("Error fetching recommendation:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateRecommendation = async (updates: Partial<Recommendation>) => {
    if (!id) return;

    try {
      setUpdating(true);
      const response = await fetch(`/api/recommendations/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const updatedRecommendation = await response.json();
        setRecommendation(updatedRecommendation);
      }
    } catch (error) {
      console.error("Error updating recommendation:", error);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "implemented":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
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
          <p className="mt-2 text-gray-600">جاري تحميل التوصية...</p>
        </div>
      </div>
    );
  }

  if (!recommendation) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">التوصية غير موجودة</h2>
        <p className="text-gray-600 mb-4">لم يتم العثور على التوصية المطلوبة</p>
        <Button asChild>
          <Link href="/recommendations">
            <i className="fas fa-arrow-right ml-2"></i>
            العودة إلى التوصيات
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
            <h1 className="text-2xl font-bold text-gray-900">تفاصيل التوصية</h1>
            <p className="text-gray-600">عرض وتعديل تفاصيل التوصية</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/recommendations">
              <i className="fas fa-arrow-right ml-2"></i>
              العودة إلى التوصيات
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
                  <CardTitle className="text-xl">{recommendation.title}</CardTitle>
                  <CardDescription className="mt-2">
                    {recommendation.description}
                  </CardDescription>
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
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">الوثيقة المرتبطة</h4>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <i className="fas fa-file-alt text-gray-400"></i>
                    <Link
                      href={`/documents/${recommendation.document_id}`}
                      className="text-primary-600 hover:text-primary-800 font-medium"
                    >
                      {recommendation.documents?.title || recommendation.documents?.reference}
                    </Link>
                  </div>
                  {recommendation.documents?.category && (
                    <p className="text-sm text-gray-600 mt-1">
                      الفئة: {recommendation.documents.category}
                    </p>
                  )}
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">مقدم التوصية</h4>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <i className="fas fa-user text-gray-400"></i>
                    <span>{recommendation.users?.full_name || recommendation.users?.username}</span>
                    <Badge variant="outline" className="text-xs">
                      {recommendation.users?.role}
                    </Badge>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">تواريخ مهمة</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">تاريخ الإنشاء:</span>
                      <p className="font-medium">
                        {formatDateArabic(recommendation.created_at, {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">آخر تحديث:</span>
                      <p className="font-medium">
                        {formatDateArabic(recommendation.updated_at, {
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
                <CardTitle className="text-lg">إدارة التوصية</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الحالة
                  </label>
                  <Select
                    value={recommendation.status}
                    onValueChange={(value) => updateRecommendation({ status: value as any })}
                    disabled={updating}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">في الانتظار</SelectItem>
                      <SelectItem value="approved">موافق عليه</SelectItem>
                      <SelectItem value="rejected">مرفوض</SelectItem>
                      <SelectItem value="implemented">تم التنفيذ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الأولوية
                  </label>
                  <Select
                    value={recommendation.priority}
                    onValueChange={(value) => updateRecommendation({ priority: value as any })}
                    disabled={updating}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">منخفض</SelectItem>
                      <SelectItem value="medium">متوسط</SelectItem>
                      <SelectItem value="high">عالي</SelectItem>
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
                <Link href={`/documents/${recommendation.document_id}`}>
                  <i className="fas fa-file-alt ml-2"></i>
                  عرض الوثيقة
                </Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/recommendations">
                  <i className="fas fa-list ml-2"></i>
                  جميع التوصيات
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
