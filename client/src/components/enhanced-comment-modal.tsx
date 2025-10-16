import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { type Paper } from "@shared/schema";

const enhancedCommentSchema = z.object({
  commentType: z.string().min(1, "نوع التعليق مطلوب"),
  content: z.string().min(10, "محتوى التعليق يجب أن يكون 10 أحرف على الأقل"),
  isPublic: z.boolean().default(false),
  taggedMedia: z.array(z.string()).optional(),
  mentions: z.array(z.string()).optional(),
  suggestedContent: z.string().optional(),
});

type EnhancedCommentFormData = z.infer<typeof enhancedCommentSchema>;

interface EnhancedCommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  documentTitle: string;
  papers?: Paper[];
}

const COMMENT_TYPES = [
  "تعليق عام",
  "ملاحظة مهمة",
  "اقتراح تحسين",
  "سؤال",
  "تعليق تقني",
  "تعليق على المحتوى",
  "تعليق على التصميم",
  "تعليق على الأداء"
];

const SUGGESTED_COMMENTS = {
  "تعليق على المحتوى": [
    "هذا المحتوى واضح ومفيد",
    "يحتاج إلى توضيح أكثر",
    "المعلومات محدثة ومفيدة",
    "هناك بعض الأخطاء الإملائية",
    "المحتوى منظم بشكل جيد"
  ],
  "تعليق على التصميم": [
    "التصميم جميل وسهل القراءة",
    "الألوان مناسبة ومريحة للعين",
    "التخطيط واضح ومنظم",
    "يحتاج إلى تحسين في التنسيق",
    "الخط واضح ومقروء"
  ],
  "تعليق على الأداء": [
    "الوثيقة تفتح بسرعة",
    "الجودة عالية وواضحة",
    "سهل التنقل والاستخدام",
    "يحتاج إلى تحسين في السرعة",
    "الأداء جيد بشكل عام"
  ],
  "تعليق تقني": [
    "التقنية المستخدمة مناسبة",
    "يحتاج إلى تحديث تقني",
    "التوافق جيد مع المتصفحات",
    "هناك مشاكل في التوافق",
    "الأمان جيد ومحمي"
  ]
};

export function EnhancedCommentModal({ 
  isOpen, 
  onClose, 
  documentId, 
  documentTitle,
  papers = []
}: EnhancedCommentModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<string[]>([]);
  const [suggestedComments, setSuggestedComments] = useState<string[]>([]);

  const form = useForm<EnhancedCommentFormData>({
    resolver: zodResolver(enhancedCommentSchema),
    defaultValues: {
      commentType: "",
      content: "",
      isPublic: false,
      taggedMedia: [],
      mentions: [],
      suggestedContent: "",
    },
  });

  const commentType = form.watch("commentType");

  // Update suggested comments when comment type changes
  useEffect(() => {
    if (commentType && SUGGESTED_COMMENTS[commentType as keyof typeof SUGGESTED_COMMENTS]) {
      setSuggestedComments(SUGGESTED_COMMENTS[commentType as keyof typeof SUGGESTED_COMMENTS]);
    } else {
      setSuggestedComments([]);
    }
  }, [commentType]);

  const onSubmit = async (data: EnhancedCommentFormData) => {
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
              data.commentType === "تعليق على المحتوى" ? "review" :
              data.commentType === "اقتراح تحسين" ? "suggestion" :
              data.commentType === "سؤال" ? "question" : "general",
        is_resolved: false
      };

      console.log("Submitting enhanced comment:", commentData);

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
      console.log("Enhanced comment created successfully:", result);

      toast({
        title: "تم إضافة التعليق",
        description: "تم إضافة تعليقك مع الوسوم والإشارات بنجاح.",
      });

      form.reset();
      setSelectedMedia([]);
      onClose();
    } catch (error) {
      console.error("Error creating enhanced comment:", error);
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
    setSelectedMedia([]);
    onClose();
  };

  const toggleMediaSelection = (mediaId: string) => {
    setSelectedMedia(prev => 
      prev.includes(mediaId) 
        ? prev.filter(id => id !== mediaId)
        : [...prev, mediaId]
    );
  };

  const insertSuggestedComment = (suggestion: string) => {
    const currentContent = form.getValues("content");
    form.setValue("content", currentContent + (currentContent ? "\n" : "") + suggestion);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>إضافة تعليق متقدم</DialogTitle>
          <p className="text-sm text-gray-600">
            الوثيقة: <span className="font-medium">{documentTitle}</span>
          </p>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Comment Type */}
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

            {/* Media Tagging */}
            {papers.length > 0 && (
              <div>
                <FormLabel>وسم الملفات المرفقة</FormLabel>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                  {papers.map((paper) => (
                    <Card 
                      key={paper.id}
                      className={`cursor-pointer transition-colors ${
                        selectedMedia.includes(paper.id) 
                          ? 'ring-2 ring-primary-500 bg-primary-50' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => toggleMediaSelection(paper.id)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                            <i className="fas fa-file text-gray-600"></i>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{paper.title}</p>
                            <p className="text-xs text-gray-500">{paper.file_type}</p>
                          </div>
                          {selectedMedia.includes(paper.id) && (
                            <Badge variant="secondary" className="text-xs">
                              مختار
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {selectedMedia.length > 0 && (
                  <p className="text-xs text-gray-600 mt-2">
                    تم اختيار {selectedMedia.length} ملف للوسم
                  </p>
                )}
              </div>
            )}

            {/* Suggested Comments */}
            {suggestedComments.length > 0 && (
              <div>
                <FormLabel>اقتراحات التعليق</FormLabel>
                <div className="grid grid-cols-1 gap-2 mt-2">
                  {suggestedComments.map((suggestion, index) => (
                    <Button
                      key={index}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="justify-start text-left h-auto p-3"
                      onClick={() => insertSuggestedComment(suggestion)}
                    >
                      <i className="fas fa-plus ml-2 text-xs"></i>
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Comment Content */}
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>محتوى التعليق</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="اكتب تعليقك هنا... يمكنك استخدام الوسوم والإشارات"
                      className="min-h-[120px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Mentions */}
            <FormField
              control={form.control}
              name="mentions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الإشارات (اختياري)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="اكتب @ للبحث عن المستخدمين..."
                      {...field}
                    />
                  </FormControl>
                  <p className="text-xs text-gray-500">
                    استخدم @ للإشارة إلى مستخدمين محددين
                  </p>
                </FormItem>
              )}
            />

            {/* Privacy Setting */}
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

            {/* Submit Buttons */}
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
