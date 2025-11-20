import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MainLayout } from "@/components/layout/main-layout";
import { useAuth } from "@/hooks/use-auth";
import type { Comment } from "@shared/schema";
import { formatDateArabic } from "@/lib/utils";

export default function CommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [resolvedFilter, setResolvedFilter] = useState<string>("all");
  const { user } = useAuth();

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/comments");
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredComments = comments.filter((comment) => {
    const matchesSearch = 
      comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comment.documents?.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === "all" || comment.type === typeFilter;
    const matchesResolved = 
      resolvedFilter === "all" || 
      (resolvedFilter === "resolved" && comment.is_resolved) ||
      (resolvedFilter === "unresolved" && !comment.is_resolved);
    
    return matchesSearch && matchesType && matchesResolved;
  });

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "general":
        return "bg-gray-100 text-gray-800 dark:bg-gray-500/30 dark:text-gray-100";
      case "review":
        return "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-100";
      case "suggestion":
        return "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-100";
      case "question":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-100";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-500/30 dark:text-gray-100";
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
      ? "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-100"
      : "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-100";
  };

  const getResolvedText = (isResolved: boolean) => {
    return isResolved ? "محلول" : "غير محلول";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">جاري تحميل التعليقات...</p>
        </div>
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">التعليقات</h1>
            <p className="text-gray-600 dark:text-gray-300">إدارة وتتبع التعليقات على الوثائق</p>
          </div>
          <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-500 dark:hover:bg-indigo-400">
            <Link href="/comments/new">
              <i className="fas fa-plus ml-2"></i>
              تعليق جديد
            </Link>
          </Button>
        </div>

      {/* Filters */}
      <Card className="bg-white/80 dark:bg-gray-900/60 border border-gray-100/60 dark:border-gray-800/70 shadow-sm backdrop-blur">
        <CardHeader className="p-6 pb-4">
          <CardTitle className="text-gray-900 dark:text-white">تصفية التعليقات</CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                البحث
              </label>
              <Input
                placeholder="البحث في التعليقات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                النوع
              </label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر النوع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأنواع</SelectItem>
                  <SelectItem value="general">عام</SelectItem>
                  <SelectItem value="review">مراجعة</SelectItem>
                  <SelectItem value="suggestion">اقتراح</SelectItem>
                  <SelectItem value="question">سؤال</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                الحالة
              </label>
              <Select value={resolvedFilter} onValueChange={setResolvedFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="resolved">محلول</SelectItem>
                  <SelectItem value="unresolved">غير محلول</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setTypeFilter("all");
                  setResolvedFilter("all");
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
        {filteredComments.length === 0 ? (
          <Card className="bg-white/80 dark:bg-gray-900/60 border border-gray-100/60 dark:border-gray-800/70 shadow-sm backdrop-blur">
            <CardContent className="text-center py-8 text-gray-900 dark:text-gray-100">
              <i className="fas fa-comments text-4xl text-gray-400 dark:text-gray-500 mb-4"></i>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                لا توجد تعليقات
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {searchTerm || typeFilter !== "all" || resolvedFilter !== "all"
                  ? "لم يتم العثور على تعليقات تطابق المعايير المحددة"
                  : "لم يتم إنشاء أي تعليقات بعد"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredComments.map((comment) => (
            <Card key={comment.id} className="hover:shadow-md transition-shadow bg-white/90 dark:bg-gray-900/70 border border-gray-100/60 dark:border-gray-800/70 backdrop-blur">
              <CardHeader className="p-6 pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardDescription className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                      {comment.content}
                    </CardDescription>
                    <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-500 dark:text-gray-400">
                      <span>
                        <i className="fas fa-user ml-1"></i>
                        {comment.users?.full_name || comment.users?.username}
                      </span>
                      <span>•</span>
                      <span>
                        <i className="fas fa-calendar ml-1"></i>
                        {formatDateArabic(comment.created_at)}
                      </span>
                    </div>
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
              <CardContent className="p-6 pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-600 dark:text-gray-300">
                    <i className="fas fa-file-alt"></i>
                    <span>الوثيقة:</span>
                    <Link
                      href={`/documents/${comment.document_id}`}
                      className="text-primary-600 hover:text-primary-800 dark:text-primary-300 dark:hover:text-primary-200 font-medium"
                    >
                      {comment.documents?.title || comment.documents?.reference}
                    </Link>
                  </div>
                  <div className="flex space-x-2 space-x-reverse">
                    <Button variant="outline" size="sm" asChild className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200">
                      <Link href={`/comments/${comment.id}`}>
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
