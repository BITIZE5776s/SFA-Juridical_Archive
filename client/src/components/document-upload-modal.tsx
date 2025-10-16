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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { CATEGORIES, STATUSES } from "@/lib/constants";
import { type Block, type Row, type Section } from "@shared/schema";

const documentSchema = z.object({
  title: z.string().min(1, "عنوان الوثيقة مطلوب"),
  category: z.string().min(1, "فئة الوثيقة مطلوبة"),
  status: z.string().min(1, "حالة الوثيقة مطلوبة"),
  sectionId: z.string().min(1, "القسم مطلوب"),
  metadata: z.object({
    priority: z.string().optional(),
    court: z.string().optional(),
    notes: z.string().optional(),
  }).optional(),
});

type DocumentFormData = z.infer<typeof documentSchema>;

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DocumentUploadModal({ isOpen, onClose }: DocumentUploadModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedBlockId, setSelectedBlockId] = useState<string>("");
  const [selectedRowId, setSelectedRowId] = useState<string>("");

  const form = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      title: "",
      category: "",
      status: "نشط",
      sectionId: "",
      metadata: {
        priority: "متوسطة",
        court: "محكمة الاستئناف بالرباط",
        notes: "",
      },
    },
  });

  // Fetch blocks
  const { data: blocks = [] } = useQuery<Block[]>({
    queryKey: ["/api/blocks"],
    enabled: isOpen,
  });

  // Fetch rows for selected block
  const { data: rows = [] } = useQuery<Row[]>({
    queryKey: ["/api/blocks", selectedBlockId, "rows"],
    enabled: !!selectedBlockId,
  });

  // Fetch sections for selected row
  const { data: sections = [] } = useQuery<Section[]>({
    queryKey: ["/api/rows", selectedRowId, "sections"],
    enabled: !!selectedRowId,
  });

  const createDocumentMutation = useMutation({
    mutationFn: async (data: DocumentFormData) => {
      return apiRequest("POST", "/api/documents", {
        ...data,
        createdBy: user?.id,
      });
    },
    onSuccess: () => {
      toast({
        title: "نجح الحفظ",
        description: "تم إنشاء الوثيقة بنجاح",
      });
      // Invalidate all document-related queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/user-activity", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/recent-documents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/blocks"] });
      
      // Force refetch critical queries
      queryClient.refetchQueries({ queryKey: ["/api/documents"] });
      queryClient.refetchQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.refetchQueries({ queryKey: ["/api/dashboard/user-activity", user?.id] });
      
      onClose();
      form.reset();
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في إنشاء الوثيقة",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: DocumentFormData) => {
    createDocumentMutation.mutate(data);
  };

  const handleClose = () => {
    onClose();
    form.reset();
    setSelectedBlockId("");
    setSelectedRowId("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>إنشاء وثيقة جديدة</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>عنوان الوثيقة</FormLabel>
                  <FormControl>
                    <Input placeholder="أدخل عنوان الوثيقة" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>فئة الوثيقة</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر فئة الوثيقة" />
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
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>حالة الوثيقة</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر حالة الوثيقة" />
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

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">الكتلة</label>
                <Select onValueChange={setSelectedBlockId} value={selectedBlockId}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الكتلة" />
                  </SelectTrigger>
                  <SelectContent>
                    {blocks.map((block) => (
                      <SelectItem key={block.id} value={block.id}>
                        الكتلة {block.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">الصف</label>
                <Select 
                  onValueChange={setSelectedRowId} 
                  value={selectedRowId}
                  disabled={!selectedBlockId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الصف" />
                  </SelectTrigger>
                  <SelectContent>
                    {rows.map((row) => (
                      <SelectItem key={row.id} value={row.id}>
                        الصف {row.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <FormField
                control={form.control}
                name="sectionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>القسم</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={!selectedRowId}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر القسم" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {sections.map((section) => (
                          <SelectItem key={section.id} value={section.id}>
                            القسم {section.label}
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
              control={form.control}
              name="metadata.priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الأولوية</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
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
              control={form.control}
              name="metadata.notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ملاحظات إضافية</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="أدخل أي ملاحظات إضافية..." 
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 space-x-reverse pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                disabled={createDocumentMutation.isPending}
              >
                إلغاء
              </Button>
              <Button 
                type="submit" 
                disabled={createDocumentMutation.isPending}
              >
                {createDocumentMutation.isPending ? "جاري الحفظ..." : "إنشاء الوثيقة"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
