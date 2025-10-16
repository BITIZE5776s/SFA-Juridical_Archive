import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { type DocumentWithDetails } from "@shared/schema";
import { formatDateArabic } from "@/lib/utils";
import { Upload, FileText, X } from "@/lib/icons";

const fileUploadSchema = z.object({
  documentId: z.string().min(1, "الوثيقة مطلوبة"),
  paperTitle: z.string().min(1, "عنوان الورقة مطلوب"),
  blockLabel: z.string().min(1, "الكتلة مطلوبة"),
  documentTitle: z.string().min(1, "عنوان الوثيقة مطلوب"),
});

type FileUploadFormData = z.infer<typeof fileUploadSchema>;

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FileUploadModal({ isOpen, onClose }: FileUploadModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentWithDetails | null>(null);
  const [showDocumentList, setShowDocumentList] = useState(true);

  const form = useForm<FileUploadFormData>({
    resolver: zodResolver(fileUploadSchema),
    defaultValues: {
      documentId: "",
      paperTitle: "",
      blockLabel: "",
      documentTitle: "",
    },
  });

  // Fetch documents for selection
  const { data: documents = [], isLoading: loadingDocuments } = useQuery<DocumentWithDetails[]>({
    queryKey: ["/api/documents"],
    queryFn: async () => {
      const response = await fetch("/api/documents");
      if (!response.ok) throw new Error('Failed to fetch documents');
      return response.json();
    },
    enabled: isOpen,
  });

  // File upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (data: { file: File; formData: FileUploadFormData }) => {
      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('documentId', data.formData.documentId);
      formData.append('blockLabel', data.formData.blockLabel);
      formData.append('documentTitle', data.formData.documentTitle);
      formData.append('paperTitle', data.formData.paperTitle);

      const response = await fetch('/api/upload/paper', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم رفع الملف بنجاح",
        description: "تم رفع الملف وإضافته إلى الوثيقة بنجاح.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
    },
    onError: (error) => {
      toast({
        title: "خطأ في رفع الملف",
        description: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (data: FileUploadFormData) => {
    if (selectedFiles.length === 0) {
      toast({
        title: "لم يتم اختيار ملفات",
        description: "يرجى اختيار ملف واحد على الأقل للرفع.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      // Upload each file
      for (const file of selectedFiles) {
        await uploadMutation.mutateAsync({ file, formData: data });
      }
      
      // Reset form and close modal
      form.reset();
      setSelectedFiles([]);
      onClose();
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDocumentSelect = (document: DocumentWithDetails) => {
    setSelectedDocument(document);
    setShowDocumentList(false);
    form.setValue('documentId', document.id);
    form.setValue('documentTitle', document.title);
  };

  const handleBackToDocumentList = () => {
    setSelectedDocument(null);
    setShowDocumentList(true);
    form.reset();
  };

  const handleClose = () => {
    setSelectedDocument(null);
    setShowDocumentList(true);
    setSelectedFiles([]);
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 space-x-reverse">
            <Upload className="w-5 h-5" />
            <span>
              {showDocumentList ? 'اختر وثيقة لرفع الملفات إليها' : 'رفع ملفات إلى وثيقة'}
            </span>
          </DialogTitle>
          <DialogDescription>
            {showDocumentList 
              ? 'اختر وثيقة من القائمة أدناه لرفع الملفات إليها'
              : `رفع ملفات إلى: ${selectedDocument?.title}`
            }
          </DialogDescription>
        </DialogHeader>

        {showDocumentList ? (
          // Document Selection View
          <div className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              اختر الوثيقة التي تريد رفع الملفات إليها:
            </div>
            
            {loadingDocuments ? (
              <div className="text-center py-8 text-gray-500">
                جاري تحميل الوثائق...
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {documents.length > 0 ? (
                  documents.map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => handleDocumentSelect(doc)}
                      className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-all duration-200"
                    >
                      <div className="flex items-start space-x-3 space-x-reverse">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">{doc.title}</h4>
                          <p className="text-xs text-gray-500 mt-1">
                            المرجع: {doc.reference} | الفئة: {doc.category}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatDateArabic(doc.created_at)}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <Button size="sm" variant="outline">
                            اختر
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    لا توجد وثائق متاحة
                  </div>
                )}
              </div>
            )}
            
            <div className="flex justify-end space-x-2 space-x-reverse pt-4">
              <Button variant="outline" onClick={handleClose}>
                إلغاء
              </Button>
            </div>
          </div>
        ) : (
          // File Upload View
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Selected Document Info */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">الوثيقة المختارة</h4>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={handleBackToDocumentList}
                >
                  تغيير الوثيقة
                </Button>
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <p><span className="font-medium">العنوان:</span> {selectedDocument?.title}</p>
                <p><span className="font-medium">المرجع:</span> {selectedDocument?.reference}</p>
                <p><span className="font-medium">الفئة:</span> {selectedDocument?.category}</p>
                <p><span className="font-medium">الحالة:</span> {selectedDocument?.status}</p>
              </div>
            </div>

            {/* Paper Title */}
            <FormField
              control={form.control}
              name="paperTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>عنوان الورقة</FormLabel>
                  <FormControl>
                    <Input placeholder="أدخل عنوان الورقة..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Block Label */}
            <FormField
              control={form.control}
              name="blockLabel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الكتلة</FormLabel>
                  <FormControl>
                    <Input placeholder="مثال: A" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Document Title */}
            <FormField
              control={form.control}
              name="documentTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>عنوان الوثيقة (للتخزين)</FormLabel>
                  <FormControl>
                    <Input placeholder="عنوان الوثيقة..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* File Selection */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اختر الملفات
                </label>
                <input
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.webp"
                />
              </div>

              {/* Selected Files */}
              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">الملفات المختارة:</h4>
                  <div className="space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <FileText className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-700">{file.name}</span>
                          <span className="text-xs text-gray-500">
                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-2 space-x-reverse">
              <Button type="button" variant="outline" onClick={handleClose}>
                إلغاء
              </Button>
              <Button 
                type="submit" 
                disabled={isUploading || selectedFiles.length === 0}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isUploading ? "جاري الرفع..." : `رفع ${selectedFiles.length} ملف`}
              </Button>
            </div>
          </form>
        </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
