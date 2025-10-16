import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { type DocumentWithDetails, type Paper } from "@shared/schema";
import { CATEGORIES, STATUSES, STATUS_COLORS, FILE_TYPE_ICONS, PRIORITY_COLORS } from "@/lib/constants";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { PaperManagement } from "@/components/paper-management";
import { EnhancedCommentModal } from "@/components/enhanced-comment-modal";
import { RecommendationModal } from "@/components/recommendation-modal";
import { ReportProblemModal } from "@/components/report-problem-modal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const documentSchema = z.object({
  title: z.string().min(1, "عنوان الوثيقة مطلوب"),
  category: z.string().min(1, "فئة الوثيقة مطلوبة"),
  status: z.string().min(1, "حالة الوثيقة مطلوبة"),
  metadata: z.object({
    priority: z.string().optional(),
    court: z.string().optional(),
    notes: z.string().optional(),
  }).optional(),
});

const paperSchema = z.object({
  title: z.string().min(1, "عنوان الورقة مطلوب"),
  content: z.string().optional(),
  fileType: z.string().optional(),
});

type DocumentFormData = z.infer<typeof documentSchema>;
type PaperFormData = z.infer<typeof paperSchema>;

interface DocumentEditorProps {
  documentId: string;
}

export default function DocumentEditor({ documentId }: DocumentEditorProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { canManageDocuments } = useAuth();
  const queryClient = useQueryClient();
  
  // Check if edit mode should be enabled from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const shouldStartInEditMode = urlParams.get('edit') === 'true';
  
  const [isEditingDocument, setIsEditingDocument] = useState(shouldStartInEditMode);
  const [isAddingPaper, setIsAddingPaper] = useState(false);
  const [editingPaper, setEditingPaper] = useState<Paper | null>(null);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [isRecommendationModalOpen, setIsRecommendationModalOpen] = useState(false);
  const [isReportProblemModalOpen, setIsReportProblemModalOpen] = useState(false);
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);
  const [showEmptyDocumentDialog, setShowEmptyDocumentDialog] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const { data: document, isLoading } = useQuery<DocumentWithDetails>({
    queryKey: ["/api/documents", documentId],
    queryFn: () => fetch(`/api/documents/${documentId}`).then(res => res.json()),
    staleTime: 0, // Always consider data stale to ensure fresh data
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: true, // Refetch when component mounts
    // Removed refetchInterval to prevent fetching after deletion
  });

  const documentForm = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      title: document?.title || "",
      category: document?.category || "",
      status: document?.status || "",
      metadata: document?.metadata || {
        priority: "متوسطة",
        court: "محكمة الاستئناف بالرباط",
        notes: "",
      },
    },
  });

  const paperForm = useForm<PaperFormData>({
    resolver: zodResolver(paperSchema),
    defaultValues: {
      title: "",
      content: "",
      fileType: "pdf",
    },
  });

  // Update form when document data loads
  React.useEffect(() => {
    if (document) {
      documentForm.reset({
        title: document.title,
        category: document.category,
        status: document.status,
        metadata: document.metadata || {
          priority: "متوسطة",
          court: "محكمة الاستئناف بالرباط",
          notes: "",
        },
      });
    }
  }, [document, documentForm]);

  // Clear URL parameter when exiting edit mode
  React.useEffect(() => {
    if (!isEditingDocument && shouldStartInEditMode) {
      // Remove the edit parameter from URL
      const url = new URL(window.location.href);
      url.searchParams.delete('edit');
      window.history.replaceState({}, '', url.toString());
    }
  }, [isEditingDocument, shouldStartInEditMode]);

  const updateDocumentMutation = useMutation({
    mutationFn: async (data: DocumentFormData) => {
      return apiRequest("PUT", `/api/documents/${documentId}`, data);
    },
    onSuccess: () => {
      toast({
        title: "تم التحديث",
        description: "تم تحديث الوثيقة بنجاح",
      });
      // Invalidate all document-related queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/documents", documentId] });
      setIsEditingDocument(false);
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في تحديث الوثيقة",
        variant: "destructive",
      });
    },
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("DELETE", `/api/documents/${documentId}`);
    },
    onSuccess: () => {
      toast({
        title: "تم الحذف",
        description: "تم حذف الوثيقة بنجاح",
      });
      // Invalidate all document-related queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/user-activity", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/recent-documents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/documents/favorites", user?.id] });
      
      // Force refetch critical queries
      queryClient.refetchQueries({ queryKey: ["/api/documents"] });
      queryClient.refetchQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.refetchQueries({ queryKey: ["/api/documents/favorites", user?.id] });
      
      setLocation("/documents");
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في حذف الوثيقة",
        variant: "destructive",
      });
    },
  });

  // Download functionality
  const handleDownload = () => {
    if (!document?.papers || document.papers.length === 0) {
      setShowEmptyDocumentDialog(true);
      return;
    }
    setShowDownloadDialog(true);
  };

  const handleDownloadConfirm = async () => {
    if (!document) return;
    
    setIsDownloading(true);
    try {
      console.log(`📥 Starting download for document: ${document.id}`);
      
      const response = await fetch(`/api/documents/${document.id}/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to download document');
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/zip')) {
        throw new Error('Invalid response format');
      }

      const blob = await response.blob();
      console.log(`📦 ZIP file size: ${blob.size} bytes`);
      
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = `${document.title.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '_')}.zip`;
      a.style.display = 'none';
      window.document.body.appendChild(a);
      a.click();
      
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        window.document.body.removeChild(a);
      }, 100);

      toast({
        title: "تم التحميل",
        description: "تم تحميل الوثيقة بنجاح",
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "خطأ",
        description: error instanceof Error ? error.message : "فشل في تحميل الوثيقة",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
      setShowDownloadDialog(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 بايت';
    const k = 1024;
    const sizes = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const createPaperMutation = useMutation({
    mutationFn: async (data: PaperFormData) => {
      return apiRequest("POST", "/api/papers", {
        ...data,
        documentId,
        attachmentUrl: `/uploads/${documentId}_${Date.now()}.${data.fileType || 'pdf'}`,
        fileSize: Math.floor(Math.random() * 5000000) + 100000,
      });
    },
    onSuccess: () => {
      toast({
        title: "تم الإضافة",
        description: "تم إضافة الورقة بنجاح",
      });
      // Invalidate all document-related queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/documents", documentId] });
      setIsAddingPaper(false);
      paperForm.reset();
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في إضافة الورقة",
        variant: "destructive",
      });
    },
  });

  const updatePaperMutation = useMutation({
    mutationFn: async (data: PaperFormData & { id: string }) => {
      return apiRequest("PUT", `/api/papers/${data.id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "تم التحديث",
        description: "تم تحديث الورقة بنجاح",
      });
      // Invalidate all document-related queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/documents", documentId] });
      setEditingPaper(null);
      paperForm.reset();
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في تحديث الورقة",
        variant: "destructive",
      });
    },
  });

  const deletePaperMutation = useMutation({
    mutationFn: async (paperId: string) => {
      return apiRequest("DELETE", `/api/papers/${paperId}`);
    },
    onSuccess: () => {
      toast({
        title: "تم الحذف",
        description: "تم حذف الورقة بنجاح",
      });
      // Invalidate all document-related queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/documents", documentId] });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في حذف الورقة",
        variant: "destructive",
      });
    },
  });

  const onSubmitDocument = (data: DocumentFormData) => {
    updateDocumentMutation.mutate(data);
  };

  const onSubmitPaper = (data: PaperFormData) => {
    if (editingPaper) {
      updatePaperMutation.mutate({ ...data, id: editingPaper.id });
    } else {
      createPaperMutation.mutate(data);
    }
  };

  const handleEditPaper = (paper: Paper) => {
    setEditingPaper(paper);
    paperForm.reset({
      title: paper.title,
      content: paper.content || "",
      fileType: paper.file_type || "pdf",
    });
    setIsAddingPaper(true);
  };


  const getFileIcon = (fileType?: string) => {
    if (!fileType) return FILE_TYPE_ICONS.default;
    return FILE_TYPE_ICONS[fileType as keyof typeof FILE_TYPE_ICONS] || FILE_TYPE_ICONS.default;
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-2 text-gray-600">جاري التحميل...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!document) {
    return (
      <MainLayout>
        <div className="p-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <i className="fas fa-file-times text-gray-400 text-4xl mb-4"></i>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  الوثيقة غير موجودة
                </h3>
                <p className="text-gray-600 mb-4">
                  لم يتم العثور على الوثيقة المطلوبة
                </p>
                <Button onClick={() => setLocation("/documents")}>
                  العودة إلى الوثائق
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  const timeAgo = formatDistanceToNow(new Date(document.created_at), { 
    addSuffix: true, 
    locale: ar 
  });

  return (
    <MainLayout>
      <div className="p-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 space-x-reverse text-sm text-gray-600">
            <li><Button variant="link" className="p-0 h-auto" onClick={() => setLocation("/documents")}>الوثائق</Button></li>
            <li><i className="fas fa-chevron-left text-xs"></i></li>
            <li className="text-gray-900 font-medium">عرض الوثيقة</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Document Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <CardTitle>تفاصيل الوثيقة</CardTitle>
                    <Badge className={STATUS_COLORS[document.status as keyof typeof STATUS_COLORS]}>
                      {document.status}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {canManageDocuments() && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsEditingDocument(!isEditingDocument)}
                          className="flex-shrink-0"
                        >
                          <i className="fas fa-edit ml-2"></i>
                          {isEditingDocument ? "إلغاء" : "تعديل"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDownload}
                          className="flex-shrink-0"
                        >
                          <i className="fas fa-download ml-2"></i>
                          تحميل
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" className="flex-shrink-0">
                              <i className="fas fa-trash ml-2"></i>
                              حذف
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                              <AlertDialogDescription>
                                {document?.is_favorited ? (
                                  <div className="space-y-3">
                                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                      <div className="flex items-start space-x-2 space-x-reverse">
                                        <div className="w-5 h-5 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                          <span className="text-yellow-600 text-xs">⚠️</span>
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium text-yellow-800">تحذير: هذه الوثيقة في قائمة المفضلة</p>
                                          <p className="text-xs text-yellow-700 mt-1">
                                            سيتم حذف الوثيقة من المفضلة أيضاً عند الحذف
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                    <p>هل أنت متأكد من حذف هذه الوثيقة؟ هذا الإجراء لا يمكن التراجع عنه.</p>
                                  </div>
                                ) : (
                                  "هل أنت متأكد من حذف هذه الوثيقة؟ هذا الإجراء لا يمكن التراجع عنه."
                                )}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>إلغاء</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteDocumentMutation.mutate()}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                حذف
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
                    
                    {/* Viewer-specific actions - organized in a responsive grid */}
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsCommentModalOpen(true)}
                        className="flex-shrink-0"
                      >
                        <i className="fas fa-comment ml-2"></i>
                        تعليق
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsRecommendationModalOpen(true)}
                        className="flex-shrink-0"
                      >
                        <i className="fas fa-thumbs-up ml-2"></i>
                        توصية
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsReportProblemModalOpen(true)}
                        className="flex-shrink-0"
                      >
                        <i className="fas fa-exclamation-triangle ml-2"></i>
                        إبلاغ عن مشكلة
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isEditingDocument ? (
                  <Form {...documentForm}>
                    <form onSubmit={documentForm.handleSubmit(onSubmitDocument)} className="space-y-4">
                      <FormField
                        control={documentForm.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>عنوان الوثيقة</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={documentForm.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>الفئة</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="اختر الفئة" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {CATEGORIES.map((category) => (
                                    <SelectItem key={category} value={category}>
                                      {category}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={documentForm.control}
                          name="status"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>الحالة</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="اختر الحالة" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {STATUSES.map((status) => (
                                    <SelectItem key={status} value={status}>
                                      {status}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={documentForm.control}
                        name="metadata.priority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>الأولوية</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="اختر الأولوية" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="عالية">عالية</SelectItem>
                                <SelectItem value="متوسطة">متوسطة</SelectItem>
                                <SelectItem value="منخفضة">منخفضة</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={documentForm.control}
                        name="metadata.notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ملاحظات</FormLabel>
                            <FormControl>
                              <Textarea {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end space-x-2 space-x-reverse">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsEditingDocument(false)}
                        >
                          إلغاء
                        </Button>
                        <Button type="submit" disabled={updateDocumentMutation.isPending}>
                          {updateDocumentMutation.isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{document.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">الرقم المرجعي: {document.reference}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">الفئة:</span>
                        <span className="mr-2">{document.category}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">الحالة:</span>
                        <Badge className={`mr-2 ${STATUS_COLORS[document.status as keyof typeof STATUS_COLORS]}`}>
                          {document.status}
                        </Badge>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">تاريخ الإنشاء:</span>
                        <span className="mr-2">{timeAgo}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">المنشئ:</span>
                        <span className="mr-2">{document.users?.fullName || 'غير محدد'}</span>
                      </div>
                    </div>

                    {document.metadata && (
                      <div className="pt-4 border-t">
                        <h4 className="font-medium text-gray-900 mb-2">معلومات إضافية</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          {(document.metadata as any)?.priority && (
                            <div>
                              <span className="font-medium text-gray-700">الأولوية:</span>
                              <Badge className={`mr-2 ${PRIORITY_COLORS[(document.metadata as any).priority as keyof typeof PRIORITY_COLORS] || ''}`}>
                                {(document.metadata as any).priority}
                              </Badge>
                            </div>
                          )}
                          {(document.metadata as any)?.court && (
                            <div>
                              <span className="font-medium text-gray-700">المحكمة:</span>
                              <span className="mr-2">{(document.metadata as any).court}</span>
                            </div>
                          )}
                        </div>
                        {(document.metadata as any)?.notes && (
                          <div className="mt-2">
                            <span className="font-medium text-gray-700">ملاحظات:</span>
                            <p className="text-gray-600 mt-1">{(document.metadata as any).notes}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Papers Section */}
            <PaperManagement 
              documentId={document.id}
              blockLabel={document.sections?.label || "A"}
              documentTitle={document.title}
            />
          </div>

          {/* Document Info Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>معلومات الموقع</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(() => {
                  // Parse the reference to extract block, row, and column
                  // Format: "X.Y.Z" where X is block, Y is row, Z is column
                  const referenceMatch = document.reference?.match(/([A-Z])\.(\d+)\.(\d+)/);
                  const block = referenceMatch ? referenceMatch[1] : 'غير محدد';
                  const row = referenceMatch ? referenceMatch[2] : 'غير محدد';
                  const column = referenceMatch ? referenceMatch[3] : 'غير محدد';
                  
                  return (
                    <>
                      <div>
                        <span className="text-sm font-medium text-gray-700">الكتلة:</span>
                        <p className="text-sm text-gray-900">{block}</p>
                      </div>
                      <Separator />
                      <div>
                        <span className="text-sm font-medium text-gray-700">الصف:</span>
                        <p className="text-sm text-gray-900">{row}</p>
                      </div>
                      <Separator />
                      <div>
                        <span className="text-sm font-medium text-gray-700">القسم:</span>
                        <p className="text-sm text-gray-900">{column}</p>
                      </div>
                      <Separator />
                      <div>
                        <span className="text-sm font-medium text-gray-700">المرجع الكامل:</span>
                        <p className="text-sm text-gray-900 font-mono">{document.reference}</p>
                      </div>
                    </>
                  );
                })()}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>إحصائيات سريعة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">عدد الأوراق:</span>
                  <span className="text-sm font-medium">{document.papers?.length || 0}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">الحجم الإجمالي:</span>
                  <span className="text-sm font-medium">
                    {formatFileSize(document.papers?.reduce((total, paper) => total + (paper.file_size || 0), 0) || 0)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">آخر تحديث:</span>
                  <span className="text-sm font-medium">
                    {formatDistanceToNow(new Date(document.updated_at), { addSuffix: true, locale: ar })}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Viewer-specific Modals */}
      {document && (
        <>
          <EnhancedCommentModal
            isOpen={isCommentModalOpen}
            onClose={() => setIsCommentModalOpen(false)}
            documentId={document.id}
            documentTitle={document.title}
            papers={document.papers || []}
          />
          
          <RecommendationModal
            isOpen={isRecommendationModalOpen}
            onClose={() => setIsRecommendationModalOpen(false)}
            documentId={document.id}
            documentTitle={document.title}
          />
          
          <ReportProblemModal
            isOpen={isReportProblemModalOpen}
            onClose={() => setIsReportProblemModalOpen(false)}
            documentId={document.id}
            documentTitle={document.title}
          />

          {/* Download Dialog */}
          <Dialog open={showDownloadDialog} onOpenChange={setShowDownloadDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>تحميل الوثيقة</DialogTitle>
                <DialogDescription>
                  سيتم تحميل الوثيقة "{document.title}" كملف مضغوط يحتوي على جميع الأوراق.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">تفاصيل التحميل:</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>عدد الأوراق:</span>
                      <span className="font-medium">{document.papers?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>الحجم الإجمالي:</span>
                      <span className="font-medium">
                        {formatFileSize(document.papers?.reduce((total, paper) => total + (paper.file_size || 0), 0) || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>اسم الملف:</span>
                      <span className="font-medium">{document.title}.zip</span>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDownloadDialog(false)}>
                  إلغاء
                </Button>
                <Button
                  onClick={handleDownloadConfirm}
                  disabled={isDownloading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isDownloading ? "جاري التحميل..." : "تحميل"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Empty Document Dialog */}
          <Dialog open={showEmptyDocumentDialog} onOpenChange={setShowEmptyDocumentDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>الوثيقة فارغة</DialogTitle>
                <DialogDescription>
                  لا يمكن تحميل هذه الوثيقة لأنها لا تحتوي على أوراق.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <div className="text-center text-gray-600">
                  <i className="fas fa-exclamation-triangle text-4xl text-yellow-500 mb-4"></i>
                  <p>يجب إضافة أوراق إلى الوثيقة قبل إمكانية تحميلها.</p>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => setShowEmptyDocumentDialog(false)}>
                  موافق
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </MainLayout>
  );
}
