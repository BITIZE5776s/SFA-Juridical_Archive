import { useState, useEffect } from "react";
import { Link, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MainLayout } from "@/components/layout/main-layout";
import { useAuth } from "@/hooks/use-auth";
import type { Comment } from "@shared/schema";
import { formatDateArabic } from "@/lib/utils";

export default function CommentDetailPage() {
  const { id } = useParams();
  const [comment, setComment] = useState<Comment | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (id) {
      fetchComment(id);
    }
  }, [id]);

  const fetchComment = async (commentId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/comments/${commentId}`);
      if (response.ok) {
        const data = await response.json();
        setComment(data);
      }
    } catch (error) {
      console.error("Error fetching comment:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateComment = async (updates: Partial<Comment>) => {
    if (!id) return;

    try {
      setUpdating(true);
      const response = await fetch(`/api/comments/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const updatedComment = await response.json();
        setComment(updatedComment);
      }
    } catch (error) {
      console.error("Error updating comment:", error);
    } finally {
      setUpdating(false);
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "general":
        return "bg-gray-100 text-gray-800";
      case "review":
        return "bg-blue-100 text-blue-800";
      case "suggestion":
        return "bg-green-100 text-green-800";
      case "question":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case "general":
        return "عام";
      case "review":
        return "مراجعة";
      case "suggestion":
        return "اقتراح";
      case "question":
        return "سؤال";
      default:
        return type;
    }
  };

  const getResolvedBadgeColor = (isResolved: boolean) => {
    return isResolved 
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";
  };

  const getResolvedText = (isResolved: boolean) => {
    return isResolved ? "محلول" : "غير محلول";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">جاري تحميل التعليق...</p>
        </div>
      </div>
    );
  }

  if (!comment) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">التعليق غير موجود</h2>
        <p className="text-gray-600 mb-4">لم يتم العثور على التعليق المطلوب</p>
        <Button asChild>
          <Link href="/comments">
            <i className="fas fa-arrow-right ml-2"></i>
            العودة إلى التعليقات
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
          <h1 className="text-2xl font-bold text-gray-900">تفاصيل التعليق</h1>
          <p className="text-gray-600">عرض وتعديل تفاصيل التعليق</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/comments">
            <i className="fas fa-arrow-right ml-2"></i>
            العودة إلى التعليقات
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardDescription className="text-base leading-relaxed">
                    {comment.content}
                  </CardDescription>
                </div>
                <div className="flex flex-col space-y-2">
                  <Badge className={getTypeBadgeColor(comment.type)}>
                    {getTypeText(comment.type)}
                  </Badge>
                  <Badge className={getResolvedBadgeColor(comment.is_resolved)}>
                    {getResolvedText(comment.is_resolved)}
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
                      href={`/documents/${comment.document_id}`}
                      className="text-primary-600 hover:text-primary-800 font-medium"
                    >
                      {comment.documents?.title || comment.documents?.reference}
                    </Link>
                  </div>
                  {comment.documents?.category && (
                    <p className="text-sm text-gray-600 mt-1">
                      الفئة: {comment.documents.category}
                    </p>
                  )}
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">مقدم التعليق</h4>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <i className="fas fa-user text-gray-400"></i>
                    <span>{comment.users?.full_name || comment.users?.username}</span>
                    <Badge variant="outline" className="text-xs">
                      {comment.users?.role}
                    </Badge>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">تواريخ مهمة</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">تاريخ الإنشاء:</span>
                      <p className="font-medium">
                        {formatDateArabic(comment.created_at, {
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
                        {formatDateArabic(comment.updated_at, {
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
                <CardTitle className="text-lg">إدارة التعليق</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    النوع
                  </label>
                  <Select
                    value={comment.type}
                    onValueChange={(value) => updateComment({ type: value as any })}
                    disabled={updating}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">عام</SelectItem>
                      <SelectItem value="review">مراجعة</SelectItem>
                      <SelectItem value="suggestion">اقتراح</SelectItem>
                      <SelectItem value="question">سؤال</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الحالة
                  </label>
                  <Select
                    value={comment.is_resolved ? "resolved" : "unresolved"}
                    onValueChange={(value) => updateComment({ is_resolved: value === "resolved" })}
                    disabled={updating}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unresolved">غير محلول</SelectItem>
                      <SelectItem value="resolved">محلول</SelectItem>
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
                <Link href={`/documents/${comment.document_id}`}>
                  <i className="fas fa-file-alt ml-2"></i>
                  عرض الوثيقة
                </Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/comments">
                  <i className="fas fa-list ml-2"></i>
                  جميع التعليقات
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
