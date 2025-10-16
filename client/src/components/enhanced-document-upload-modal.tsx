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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { CATEGORIES, STATUSES } from "@/lib/constants";
import { type Block, type Row, type Section } from "@shared/schema";

const documentSchema = z.object({
  title: z.string().min(1, "عنوان الوثيقة مطلوب"),
  category: z.string().min(1, "فئة الوثيقة مطلوبة"),
  status: z.string().min(1, "حالة الوثيقة مطلوبة"),
  blockLabel: z.string().min(1, "الكتلة مطلوبة"),
  customBlockLabel: z.string().optional(),
  rowLabel: z.string().min(1, "الصف مطلوب").max(3, "الصف يجب أن يكون 3 أرقام كحد أقصى"),
  columnLabel: z.string().min(1, "العمود مطلوب").max(3, "العمود يجب أن يكون 3 أرقام كحد أقصى"),
  metadata: z.object({
    priority: z.string().optional(),
    court: z.string().optional(),
    notes: z.string().optional(),
  }).optional(),
});

type DocumentFormData = z.infer<typeof documentSchema>;

interface EnhancedDocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Generate A-Z blocks
const generateAlphabetBlocks = () => {
  return Array.from({ length: 26 }, (_, i) => ({
    id: `block-${String.fromCharCode(65 + i)}`,
    label: String.fromCharCode(65 + i),
    created_at: new Date().toISOString(),
  }));
};

export function EnhancedDocumentUploadModal({ isOpen, onClose }: EnhancedDocumentUploadModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedBlockId, setSelectedBlockId] = useState<string>("");
  const [blockType, setBlockType] = useState<"alphabet" | "custom">("alphabet");
  const [customBlockLabel, setCustomBlockLabel] = useState<string>("");

  const form = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      title: "",
      category: "",
      status: "نشط",
      blockLabel: "",
      customBlockLabel: "",
      rowLabel: "",
      columnLabel: "",
      metadata: {
        priority: "متوسطة",
        court: "محكمة الاستئناف بالرباط",
        notes: "",
      },
    },
  });

  // Generate alphabet blocks (A-Z)
  const alphabetBlocks = generateAlphabetBlocks();

  // Fetch existing custom blocks from database
  const { data: customBlocks = [] } = useQuery<Block[]>({
    queryKey: ["/api/blocks"],
    enabled: isOpen,
  });

  // Filter out alphabet blocks from custom blocks
  const actualCustomBlocks = customBlocks.filter(block => 
    !alphabetBlocks.some(alphabetBlock => alphabetBlock.label === block.label)
  );

  // No need for row/section queries since we're using input fields

  const createDocumentMutation = useMutation({
    mutationFn: async (data: DocumentFormData) => {
      console.log("🚀 Starting document creation...");
      console.log("📋 Form data:", data);
      console.log("👤 User:", user);
      console.log("🔧 Block type:", blockType);
      console.log("🏷️ Selected block ID:", selectedBlockId);
      console.log("📝 Custom block label:", customBlockLabel);

      // Determine the block label to use
      const blockLabel = blockType === "alphabet" 
        ? alphabetBlocks.find(b => b.id === selectedBlockId)?.label || ""
        : customBlockLabel;

      console.log("🏷️ Final block label:", blockLabel);

      if (!blockLabel) {
        throw new Error("Block label is required");
      }

      if (!user?.id) {
        throw new Error("User ID is required");
      }

      // If it's a custom block, create the folder first
      if (blockType === "custom" && customBlockLabel) {
        console.log("📁 Creating custom block folder...");
        try {
          await apiRequest("POST", "/api/storage/custom-block", {
            blockLabel: customBlockLabel
          });
          console.log("✅ Custom block folder created");
        } catch (error) {
          console.error("❌ Error creating custom block folder:", error);
          throw error;
        }
      }

      // Generate reference based on block structure (A.1.1 format)
      const reference = `${blockLabel}.${data.rowLabel}.${data.columnLabel}`;
      console.log("📄 Generated reference:", reference);

      // Create the document with proper schema structure
      const documentData = {
        title: data.title,
        category: data.category,
        status: data.status,
        reference: reference,
        description: data.metadata?.notes || "",
        metadata: data.metadata,
        // We need to create/find the section_id based on the block structure
        // For now, we'll use a placeholder that the backend will handle
        sectionId: `section-${blockLabel}-${data.rowLabel}-${data.columnLabel}`,
        createdBy: user.id,
      };

      console.log("📤 Sending document data:", documentData);

      try {
        const result = await apiRequest("POST", "/api/documents", documentData);
        console.log("✅ Document created successfully:", result);
        return result;
      } catch (error) {
        console.error("❌ Error creating document:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("🎉 Document creation successful:", data);
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
    onError: (error) => {
      console.error("❌ Document creation failed:", error);
      toast({
        title: "خطأ في إنشاء الوثيقة",
        description: error instanceof Error ? error.message : "فشل في إنشاء الوثيقة",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: DocumentFormData) => {
    console.log("🎯 FORM SUBMISSION TRIGGERED!");
    console.log("📋 Form data received:", data);
    console.log("🔧 Block type:", blockType);
    console.log("🏷️ Selected block ID:", selectedBlockId);
    console.log("📝 Custom block label:", customBlockLabel);
    
    // Check if we have a valid block selection
    const blockLabel = blockType === "alphabet" 
      ? alphabetBlocks.find(b => b.id === selectedBlockId)?.label || ""
      : customBlockLabel;
    
    console.log("🏷️ Resolved block label:", blockLabel);
    
    if (!blockLabel) {
      console.error("❌ No block label found!");
      toast({
        title: "خطأ في اختيار الكتلة",
        description: "يرجى اختيار كتلة صحيحة",
        variant: "destructive",
      });
      return;
    }
    
    if (!user?.id) {
      console.error("❌ No user ID found!");
      toast({
        title: "خطأ في المصادقة",
        description: "يرجى تسجيل الدخول مرة أخرى",
        variant: "destructive",
      });
      return;
    }
    
    // Ensure blockLabel is set in the form data
    const finalData = {
      ...data,
      blockLabel: blockLabel
    };
    
    console.log("📤 Final form data:", finalData);
    console.log("✅ All validations passed, calling mutation...");
    createDocumentMutation.mutate(finalData);
  };

  const handleClose = () => {
    onClose();
    form.reset();
    setSelectedBlockId("");
    setBlockType("alphabet");
    setCustomBlockLabel("");
  };

  const handleBlockTypeChange = (type: "alphabet" | "custom") => {
    console.log("🔄 Block type changed to:", type);
    setBlockType(type);
    setSelectedBlockId("");
    form.setValue("blockLabel", "");
    form.setValue("customBlockLabel", "");
  };

  const handleCustomBlockLabelChange = (value: string) => {
    // Only allow uppercase letters and max 3 characters
    const cleaned = value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3);
    setCustomBlockLabel(cleaned);
    form.setValue("customBlockLabel", cleaned);
    form.setValue("blockLabel", cleaned);
  };

  const availableBlocks = blockType === "alphabet" ? alphabetBlocks : actualCustomBlocks;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>إنشاء وثيقة جديدة</DialogTitle>
          <DialogDescription>
            نموذج لإنشاء وثيقة جديدة في الأرشيف القضائي
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Document Basic Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">معلومات الوثيقة</h3>
              
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
            </div>

            <Separator />

            {/* Block Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">اختيار الكتلة</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">نوع الكتلة</label>
                  <Select onValueChange={handleBlockTypeChange} value={blockType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alphabet">كتل الأبجدية (A-Z)</SelectItem>
                      <SelectItem value="custom">كتلة مخصصة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {blockType === "custom" && (
                  <div>
                    <FormLabel>تسمية الكتلة المخصصة</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="أدخل 1-3 أحرف كبيرة (مثل: AA, AB)"
                        value={customBlockLabel}
                        onChange={(e) => handleCustomBlockLabelChange(e.target.value)}
                        maxLength={3}
                        className="uppercase"
                      />
                    </FormControl>
                    <p className="text-xs text-gray-500 mt-1">
                      أدخل 1-3 أحرف كبيرة فقط (A-Z)
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">الكتلة</label>
                  <Select onValueChange={(value) => {
                    console.log("🏷️ Block selected:", value);
                    setSelectedBlockId(value);
                    const selectedBlock = alphabetBlocks.find(b => b.id === value);
                    if (selectedBlock) {
                      form.setValue("blockLabel", selectedBlock.label);
                      console.log("✅ Block label set to:", selectedBlock.label);
                    }
                  }} value={selectedBlockId}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الكتلة" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableBlocks.map((block) => (
                        <SelectItem key={block.id} value={block.id}>
                          الكتلة {block.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <FormField
                  control={form.control}
                  name="rowLabel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الصف (رقم)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="مثال: 1"
                          maxLength={3}
                          onChange={(e) => {
                            // Only allow numbers
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="columnLabel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>العمود (رقم)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="مثال: 1"
                          maxLength={3}
                          onChange={(e) => {
                            // Only allow numbers
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Reference Preview */}
              {selectedBlockId && form.watch("rowLabel") && form.watch("columnLabel") && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <span className="text-sm font-medium text-gray-700">المرجع المتوقع:</span>
                    <Badge variant="outline" className="font-mono">
                      {blockType === "alphabet" 
                        ? alphabetBlocks.find(b => b.id === selectedBlockId)?.label || ""
                        : customBlockLabel
                      }.{form.watch("rowLabel")}.{form.watch("columnLabel")}
                    </Badge>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Additional Metadata */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">معلومات إضافية</h3>
              
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
            </div>

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
                onClick={() => {
                  console.log("🖱️ CREATE BUTTON CLICKED!");
                  console.log("📋 Form state:", form.getValues());
                  console.log("🔧 Block type:", blockType);
                  console.log("🏷️ Selected block ID:", selectedBlockId);
                  console.log("📝 Custom block label:", customBlockLabel);
                }}
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
