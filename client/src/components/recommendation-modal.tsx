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

const recommendationSchema = z.object({
  recommendationType: z.string().min(1, "نوع التوصية مطلوب"),
  rating: z.string().min(1, "التقييم مطلوب"),
  content: z.string().min(10, "محتوى التوصية يجب أن يكون 10 أحرف على الأقل"),
  isPublic: z.boolean().default(true),
});

type RecommendationFormData = z.infer<typeof recommendationSchema>;

interface RecommendationModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  documentTitle: string;
}

const RECOMMENDATION_TYPES = [
  "توصية للقراءة",
  "توصية للاستخدام",
  "توصية للتحسين",
  "توصية للفريق",
  "توصية عامة"
];

const RATINGS = [
  { value: "1", label: "⭐ (1/5)" },
  { value: "2", label: "⭐⭐ (2/5)" },
  { value: "3", label: "⭐⭐⭐ (3/5)" },
  { value: "4", label: "⭐⭐⭐⭐ (4/5)" },
  { value: "5", label: "⭐⭐⭐⭐⭐ (5/5)" }
];

export function RecommendationModal({ 
  isOpen, 
  onClose, 
  documentId, 
  documentTitle 
}: RecommendationModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RecommendationFormData>({
    resolver: zodResolver(recommendationSchema),
    defaultValues: {
      recommendationType: "",
      rating: "",
      content: "",
      isPublic: true,
    },
  });

  const onSubmit = async (data: RecommendationFormData) => {
    setIsSubmitting(true);
    try {
      // Get current user ID from auth context
      if (!user?.id) {
        throw new Error("User not authenticated");
      }
      const currentUserId = user.id;
      
      const recommendationData = {
        document_id: documentId,
        user_id: currentUserId,
        title: data.recommendationType,
        description: data.content,
        priority: data.rating === "5" || data.rating === "4" ? "high" : data.rating === "3" ? "medium" : "low",
        status: "pending"
      };

      console.log("Submitting recommendation:", recommendationData);

      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(recommendationData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create recommendation");
      }

      const result = await response.json();
      console.log("Recommendation created successfully:", result);

      toast({
        title: "تم إضافة التوصية",
        description: "تم إضافة توصيتك بنجاح.",
      });

      form.reset();
      onClose();
    } catch (error) {
      console.error("Error creating recommendation:", error);
      toast({
        title: "خطأ",
        description: error instanceof Error ? error.message : "فشل في إضافة التوصية. يرجى المحاولة مرة أخرى.",
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>إضافة توصية</DialogTitle>
          <p className="text-sm text-gray-600">
            الوثيقة: <span className="font-medium">{documentTitle}</span>
          </p>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="recommendationType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نوع التوصية</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر نوع التوصية" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {RECOMMENDATION_TYPES.map((type) => (
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
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>التقييم</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر التقييم" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {RATINGS.map((rating) => (
                          <SelectItem key={rating.value} value={rating.value}>
                            {rating.label}
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
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>محتوى التوصية</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="اكتب توصيتك هنا..."
                      className="min-h-[120px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isPublic"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-x-reverse">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="rounded border-gray-300"
                    />
                  </FormControl>
                  <FormLabel className="text-sm">
                    توصية عامة (يمكن للآخرين رؤيتها)
                  </FormLabel>
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 space-x-reverse pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                إلغاء
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "جاري الإضافة..." : "إضافة التوصية"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
