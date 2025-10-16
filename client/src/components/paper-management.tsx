import React, { useState, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { type Paper } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

const paperSchema = z.object({
  title: z.string().min(1, "عنوان الورقة مطلوب"),
  content: z.string().optional(),
});

type PaperFormData = z.infer<typeof paperSchema>;

interface PaperManagementProps {
  documentId: string;
  blockLabel: string;
  documentTitle: string;
}

export function PaperManagement({ documentId, blockLabel, documentTitle }: PaperManagementProps) {
  const { toast } = useToast();
  const { canManageDocuments } = useAuth();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isAddingPaper, setIsAddingPaper] = useState(false);
  const [editingPaper, setEditingPaper] = useState<Paper | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const batchFileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<PaperFormData>({
    resolver: zodResolver(paperSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  // Fetch papers for this document
  const { data: papers = [], isLoading } = useQuery<Paper[]>({
    queryKey: ["/api/documents", documentId, "papers"],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/documents/${documentId}/papers`);
      return response.json();
    },
  });

  const createPaperMutation = useMutation({
    mutationFn: async (data: PaperFormData) => {
      return apiRequest("POST", "/api/papers", {
        ...data,
        documentId,
      });
    },
    onSuccess: () => {
      toast({
        title: "تم الإضافة",
        description: "تم إضافة الورقة بنجاح",
      });
      // Invalidate both papers query and document query to update statistics
      queryClient.invalidateQueries({ queryKey: ["/api/documents", documentId, "papers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/documents", documentId] });
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      setIsAddingPaper(false);
      form.reset();
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
      // Invalidate both papers query and document query to update statistics
      queryClient.invalidateQueries({ queryKey: ["/api/documents", documentId, "papers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/documents", documentId] });
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      setEditingPaper(null);
      form.reset();
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
      // Invalidate both papers query and document query to update statistics
      queryClient.invalidateQueries({ queryKey: ["/api/documents", documentId, "papers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/documents", documentId] });
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في حذف الورقة",
        variant: "destructive",
      });
    },
  });

  const uploadFileMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/upload/paper", {
        method: "POST",
        body: formData,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم الرفع",
        description: "تم رفع الملف بنجاح",
      });
      // Invalidate both papers query and document query to update statistics
      queryClient.invalidateQueries({ queryKey: ["/api/documents", documentId, "papers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/documents", documentId] });
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      setIsUploading(false);
      setUploadProgress(0);
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في رفع الملف",
        variant: "destructive",
      });
      setIsUploading(false);
      setUploadProgress(0);
    },
  });

  const batchUploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/upload/batch", {
        method: "POST",
        body: formData,
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "تم الرفع الجماعي",
        description: data.message,
      });
      // Invalidate both papers query and document query to update statistics
      queryClient.invalidateQueries({ queryKey: ["/api/documents", documentId, "papers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/documents", documentId] });
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      setIsUploading(false);
      setUploadProgress(0);
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في الرفع الجماعي",
        variant: "destructive",
      });
      setIsUploading(false);
      setUploadProgress(0);
    },
  });

  const onSubmit = (data: PaperFormData) => {
    if (editingPaper) {
      // When editing, preserve the original file extension
      const originalExtension = editingPaper.title.match(/\.[^/.]+$/)?.[0] || '';
      const updatedTitle = data.title + originalExtension;
      updatePaperMutation.mutate({ ...data, title: updatedTitle, id: editingPaper.id });
    } else {
      createPaperMutation.mutate(data);
    }
  };

  const handleFileUpload = async (file: File, paperTitle: string) => {
    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentId', documentId);
    formData.append('blockLabel', blockLabel);
    formData.append('documentTitle', documentTitle);
    formData.append('paperTitle', paperTitle);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => Math.min(prev + 10, 90));
    }, 200);

    try {
      await uploadFileMutation.mutateAsync(formData);
      clearInterval(progressInterval);
      setUploadProgress(100);
    } catch (error) {
      clearInterval(progressInterval);
      setUploadProgress(0);
    }
  };

  const handleBatchUpload = async (files: FileList) => {
    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });
    formData.append('documentId', documentId);
    formData.append('blockLabel', blockLabel);
    formData.append('documentTitle', documentTitle);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => Math.min(prev + 5, 90));
    }, 200);

    try {
      await batchUploadMutation.mutateAsync(formData);
      clearInterval(progressInterval);
      setUploadProgress(100);
    } catch (error) {
      clearInterval(progressInterval);
      setUploadProgress(0);
    }
  };

  const handleEditPaper = (paper: Paper) => {
    setEditingPaper(paper);
    // Extract name without extension for editing
    const nameWithoutExtension = paper.title.replace(/\.[^/.]+$/, "");
    form.reset({
      title: nameWithoutExtension,
      content: paper.content || "",
    });
    setIsAddingPaper(true);
  };

  const handleDownload = async (paper: Paper) => {
    try {
      if (!paper.attachment_url) return;
      
      // Fetch the file
      const response = await fetch(paper.attachment_url);
      const blob = await response.blob();
      
      // Create download link with proper filename
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Use the paper title as filename (it already includes the extension)
      link.download = paper.title;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "خطأ في التحميل",
        description: "فشل في تحميل الملف",
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'غير محدد';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} ميجابايت`;
  };

  const getFileIcon = (fileType?: string) => {
    const icons: Record<string, string> = {
      pdf: 'fas fa-file-pdf text-red-500',
      doc: 'fas fa-file-word text-blue-500',
      docx: 'fas fa-file-word text-blue-500',
      image: 'fas fa-file-image text-green-500',
      text: 'fas fa-file-alt text-gray-500',
      rtf: 'fas fa-file-alt text-gray-500',
    };
    return icons[fileType || ''] || 'fas fa-file text-gray-500';
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-2 text-gray-600">جاري التحميل...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>أوراق الوثيقة ({(papers as Paper[]).length})</CardTitle>
          {canManageDocuments() && (
            <div className="flex items-center space-x-2 space-x-reverse">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <i className="fas fa-upload ml-2"></i>
                رفع ملف
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => batchFileInputRef.current?.click()}
                disabled={isUploading}
              >
                <i className="fas fa-upload ml-2"></i>
                رفع جماعي
              </Button>
              <Button
                onClick={() => {
                  setEditingPaper(null);
                  form.reset();
                  setIsAddingPaper(true);
                }}
                disabled={isUploading}
              >
                <i className="fas fa-plus ml-2"></i>
                إضافة ورقة
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp,.txt,.rtf"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const paperTitle = prompt('أدخل عنوان الورقة:', file.name);
              if (paperTitle) {
                handleFileUpload(file, paperTitle);
              }
            }
          }}
          className="hidden"
        />
        <input
          ref={batchFileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp,.txt,.rtf"
          onChange={(e) => {
            const files = e.target.files;
            if (files && files.length > 0) {
              handleBatchUpload(files);
            }
          }}
          className="hidden"
        />

        {/* Upload Progress */}
        {isUploading && (
          <div className="mb-6 p-4 border border-blue-200 rounded-lg bg-blue-50">
            <div className="flex items-center space-x-2 space-x-reverse mb-2">
              <i className="fas fa-upload text-blue-600"></i>
              <span className="text-sm font-medium text-blue-900">جاري رفع الملفات...</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
            <p className="text-xs text-blue-700 mt-1">{uploadProgress}% مكتمل</p>
          </div>
        )}

        {/* Add/Edit Paper Form */}
        {isAddingPaper && (
          <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <h4 className="font-medium text-gray-900 mb-4">
              {editingPaper ? "تعديل الورقة" : "إضافة ورقة جديدة"}
            </h4>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>عنوان الورقة</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {!editingPaper && (
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>المحتوى</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div className="flex justify-end space-x-2 space-x-reverse">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsAddingPaper(false);
                      setEditingPaper(null);
                      form.reset();
                    }}
                  >
                    إلغاء
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createPaperMutation.isPending || updatePaperMutation.isPending}
                  >
                    {(createPaperMutation.isPending || updatePaperMutation.isPending) 
                      ? "جاري الحفظ..." 
                      : "حفظ"
                    }
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        )}

        {/* Papers List */}
        <div className="space-y-4">
          {(papers as Paper[]).map((paper) => (
            <div key={paper.id} className="flex items-center space-x-4 space-x-reverse p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <i className={getFileIcon(paper.file_type)}></i>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 truncate">{paper.title}</h4>
                <div className="flex items-center space-x-4 space-x-reverse mt-1">
                  {paper.file_type && (
                    <Badge variant="outline" className="text-xs">
                      {paper.file_type.toUpperCase()}
                    </Badge>
                  )}
                  <p className="text-xs text-gray-500">{formatFileSize(paper.file_size)}</p>
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(paper.created_at), { addSuffix: true, locale: ar })}
                  </p>
                </div>
                {paper.content && (
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">{paper.content}</p>
                )}
                {paper.attachment_url && (
                  <button 
                    onClick={() => handleDownload(paper)}
                    className="text-xs text-blue-600 hover:text-blue-800 mt-1 inline-block"
                  >
                    <i className="fas fa-download ml-1"></i>
                    تحميل الملف
                  </button>
                )}
              </div>
              {canManageDocuments() && (
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditPaper(paper)}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <i className="fas fa-edit ml-1"></i>
                    تعديل
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                      >
                        <i className="fas fa-trash ml-1"></i>
                        حذف
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>حذف الورقة</AlertDialogTitle>
                        <AlertDialogDescription>
                          هل أنت متأكد من حذف هذه الورقة؟ هذا الإجراء لا يمكن التراجع عنه.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deletePaperMutation.mutate(paper.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          حذف
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </div>
          ))}
          {(papers as Paper[]).length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <i className="fas fa-file-alt text-gray-300 text-4xl mb-2"></i>
              <p>لا توجد أوراق مرفقة</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
