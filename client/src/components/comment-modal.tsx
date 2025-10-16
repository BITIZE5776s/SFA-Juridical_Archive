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

const commentSchema = z.object({
  commentType: z.string().min(1, "نوع التعليق مطلوب"),
  content: z.string().min(10, "محتوى التعليق يجب أن يكون 10 أحرف على الأقل"),
  isPublic: z.boolean().default(false),
});

type CommentFormData = z.infer<typeof commentSchema>;

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  documentTitle: string;
}

const COMMENT_TYPES = [
  "تعليق عام",
  "ملاحظة مهمة",
  "اقتراح تحسين",
  "سؤال",
  "توضيح",
  "تعليق تقني"
];

export function CommentModal({ 
  isOpen, 
  onClose, 
  documentId, 
  documentTitle 
}: CommentModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      commentType: "",
      content: "",
      isPublic: false,
    },
  });

  const onSubmit = async (data: CommentFormData) => {
    setIsSubmitting(true);
    try {
      // Get current user ID from auth context
      if (!user?.id) {
        throw new Error("User not authenticated");
      }
      const currentUserId = user.id;
      
      const commentData = {
        document_id: documentId,
        user_id: currentUserId,
        content: data.content,
        type: data.commentType === "تعليق عام" ? "general" : 
              data.commentType === "ملاحظة مهمة" ? "review" :
              data.commentType === "اقتراح تحسين" ? "suggestion" :
              data.commentType === "سؤال" ? "question" : "general",
        is_resolved: false
      };

      console.log("Submitting comment:", commentData);

      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(commentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create comment");
      }

      const result = await response.json();
      console.log("Comment created successfully:", result);

      toast({
        title: "تم إضافة التعليق",
        description: "تم إضافة تعليقك بنجاح.",
      });

      form.reset();
      onClose();
    } catch (error) {
      console.error("Error creating comment:", error);
      toast({
        title: "خطأ",
        description: error instanceof Error ? error.message : "فشل في إضافة التعليق. يرجى المحاولة مرة أخرى.",
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
          <DialogTitle>إضافة تعليق</DialogTitle>
          <p className="text-sm text-gray-600">
            الوثيقة: <span className="font-medium">{documentTitle}</span>
          </p>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="commentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نوع التعليق</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر نوع التعليق" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {COMMENT_TYPES.map((type) => (
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
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>محتوى التعليق</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="اكتب تعليقك هنا..."
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
                    تعليق عام (يمكن للآخرين رؤيته)
                  </FormLabel>
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 space-x-reverse pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                إلغاء
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "جاري الإضافة..." : "إضافة التعليق"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
