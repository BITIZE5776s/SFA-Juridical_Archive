import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

const reportProblemSchema = z.object({
  problemType: z.string().min(1, "نوع المشكلة مطلوب"),
  priority: z.string().min(1, "أولوية المشكلة مطلوبة"),
  title: z.string().min(1, "عنوان المشكلة مطلوب"),
  description: z.string().min(10, "وصف المشكلة يجب أن يكون 10 أحرف على الأقل"),
  steps: z.string().optional(),
  expectedBehavior: z.string().optional(),
  actualBehavior: z.string().optional(),
  additionalInfo: z.string().optional(),
});

type ReportProblemFormData = z.infer<typeof reportProblemSchema>;

interface ReportProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  documentTitle: string;
}

const PROBLEM_TYPES = [
  "مشكلة تقنية",
  "مشكلة في المحتوى",
  "مشكلة في التصميم",
  "مشكلة في الأداء",
  "مشكلة في الأمان",
  "مشكلة أخرى"
];

const PRIORITY_LEVELS = [
  { value: "low", label: "منخفضة" },
  { value: "medium", label: "متوسطة" },
  { value: "high", label: "عالية" },
  { value: "critical", label: "حرجة" }
];

export function ReportProblemModal({ 
  isOpen, 
  onClose, 
  documentId, 
  documentTitle 
}: ReportProblemModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ReportProblemFormData>({
    resolver: zodResolver(reportProblemSchema),
    defaultValues: {
      problemType: "",
      priority: "",
      title: "",
      description: "",
      steps: "",
      expectedBehavior: "",
      actualBehavior: "",
      additionalInfo: "",
    },
  });

  const onSubmit = async (data: ReportProblemFormData) => {
    setIsSubmitting(true);
    try {
      // Get current user ID from auth context
      if (!user?.id) {
        throw new Error("User not authenticated");
      }
      const currentUserId = user.id;
      
      const reportData = {
        document_id: documentId,
        user_id: currentUserId,
        title: data.title,
        description: `${data.description}\n\nنوع المشكلة: ${data.problemType}\nخطوات إعادة الإنتاج: ${data.steps || 'غير محدد'}\nالسلوك المتوقع: ${data.expectedBehavior || 'غير محدد'}\nالسلوك الفعلي: ${data.actualBehavior || 'غير محدد'}\nمعلومات إضافية: ${data.additionalInfo || 'غير محدد'}`,
        type: data.problemType === "مشكلة تقنية" ? "error" : 
              data.problemType === "مشكلة في المحتوى" ? "improvement" :
              data.problemType === "مشكلة في التصميم" ? "improvement" :
              data.problemType === "مشكلة في الأداء" ? "improvement" :
              data.problemType === "مشكلة في الأمان" ? "error" : "complaint",
        severity: data.priority,
        status: "open"
      };

      console.log("Submitting report:", reportData);

      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reportData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create report");
      }

      const result = await response.json();
      console.log("Report created successfully:", result);

      toast({
        title: "تم الإبلاغ بنجاح",
        description: "تم إرسال تقرير المشكلة بنجاح. سيتم مراجعته من قبل الفريق التقني.",
      });

      form.reset();
      onClose();
    } catch (error) {
      console.error("Error creating report:", error);
      toast({
        title: "خطأ",
        description: error instanceof Error ? error.message : "فشل في إرسال تقرير المشكلة. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>الإبلاغ عن مشكلة</DialogTitle>
          <p className="text-sm text-gray-600">
            الوثيقة: <span className="font-medium">{documentTitle}</span>
          </p>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Problem Type and Priority */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="problemType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نوع المشكلة</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر نوع المشكلة" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PROBLEM_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
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
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>أولوية المشكلة</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الأولوية" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PRIORITY_LEVELS.map((priority) => (
                          <SelectItem key={priority.value} value={priority.value}>
                            {priority.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>عنوان المشكلة</FormLabel>
                  <FormControl>
                    <Input placeholder="أدخل عنوان مختصر للمشكلة" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>وصف المشكلة</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="اشرح المشكلة بالتفصيل..."
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Steps to Reproduce */}
            <FormField
              control={form.control}
              name="steps"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>خطوات إعادة إنتاج المشكلة (اختياري)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="1. اذهب إلى..."
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Expected vs Actual Behavior */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="expectedBehavior"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>السلوك المتوقع (اختياري)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="ما كان يجب أن يحدث..."
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="actualBehavior"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>السلوك الفعلي (اختياري)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="ما حدث فعلاً..."
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Additional Information */}
            <FormField
              control={form.control}
              name="additionalInfo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>معلومات إضافية (اختياري)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="أي معلومات أخرى قد تساعد في حل المشكلة..."
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-2 space-x-reverse pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                إلغاء
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "جاري الإرسال..." : "إرسال التقرير"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
