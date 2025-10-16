import { useState } from "react";
import { type DocumentWithDetails } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { getDocumentTypeConfig, getFileTypeFromExtension } from "@/lib/document-types";
import { 
  Eye, 
  Edit, 
  Trash2, 
  MessageSquare, 
  ThumbsUp, 
  AlertTriangle, 
  MoreHorizontal,
  Download,
  Share,
  Star
} from "@/lib/icons";

interface DocumentListItemProps {
  document: DocumentWithDetails;
  onViewDocument?: (id: string) => void;
  onEditDocument?: (id: string) => void;
  onDeleteDocument?: (id: string) => void;
  onDownloadDocument?: (id: string) => void;
  onComment?: (id: string) => void;
  onRecommend?: (id: string) => void;
  onReportProblem?: (id: string) => void;
}

export function DocumentListItem({ 
  document, 
  onViewDocument, 
  onEditDocument, 
  onDeleteDocument, 
  onDownloadDocument,
  onComment, 
  onRecommend, 
  onReportProblem 
}: DocumentListItemProps) {
  const { canManageDocuments, hasRole, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State for dialogs
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);
  const [showEmptyDocumentDialog, setShowEmptyDocumentDialog] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const mainPaper = document.papers?.[0];
  const fileType = getFileTypeFromExtension(mainPaper?.file_name || '');
  const fileTypeConfig = getDocumentTypeConfig(fileType, 'file');
  const statusConfig = getDocumentTypeConfig(document.status, 'status');
  const caseTypeConfig = getDocumentTypeConfig(document.category, 'case');
  
  const FileIcon = fileTypeConfig.icon;
  const StatusIcon = statusConfig.icon;
  const CaseIcon = caseTypeConfig.icon;

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'غير محدد';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} ميجابايت`;
  };
  
  // Safely format the date with error handling
  const formatTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'تاريخ غير صحيح';
      }
      return formatDistanceToNow(date, { 
        addSuffix: true, 
        locale: ar 
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'تاريخ غير صحيح';
    }
  };

  const timeAgo = formatTimeAgo(document.created_at);

  // Mutations
  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      console.log("🔄 Toggling favorite for document:", document.id);
      console.log("🔄 Current user:", user);
      console.log("🔄 Current favorite status:", document.is_favorited);
      
      if (document.is_favorited) {
        // Remove from favorites
        console.log("🗑️ Removing from favorites...");
        return apiRequest("DELETE", `/api/documents/${document.id}/favorite`, {
          userId: user?.id
        });
      } else {
        // Add to favorites
        console.log("⭐ Adding to favorites...");
        return apiRequest("POST", `/api/documents/${document.id}/favorite`, {
          userId: user?.id
        });
      }
    },
    onSuccess: () => {
      toast({
        title: document.is_favorited ? "تم إزالة من المفضلة" : "تم إضافة إلى المفضلة",
        description: document.is_favorited 
          ? "تم إزالة الوثيقة من قائمة المفضلة" 
          : "تم إضافة الوثيقة إلى قائمة المفضلة",
      });
      
      // Invalidate all relevant queries for real-time updates
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/documents", document.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/documents/favorites", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/user-activity", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/recent-documents"] });
      
      // Force refetch critical queries
      queryClient.refetchQueries({ 
        queryKey: ["/api/documents"],
        type: 'active'
      });
      queryClient.refetchQueries({ 
        queryKey: ["/api/documents/favorites", user?.id],
        type: 'active'
      });
      queryClient.refetchQueries({ 
        queryKey: ["/api/dashboard/stats"],
        type: 'active'
      });
      
      console.log("✅ Favorite toggled successfully, refreshing all relevant data");
    },
    onError: (error) => {
      console.error("❌ Error toggling favorite:", error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث المفضلة",
        variant: "destructive",
      });
    },
  });


  // Helper functions
  const handleDownload = () => {
    if (onDownloadDocument) {
      onDownloadDocument(document.id);
    } else {
      // Fallback to internal logic if no parent handler provided
      if (!document.papers || document.papers.length === 0) {
        setShowEmptyDocumentDialog(true);
        return;
      }
      setShowDownloadDialog(true);
    }
  };

  const handleDownloadConfirm = async () => {
    setIsDownloading(true);
    try {
      console.log(`📥 Starting download for document: ${document.id}`);
      
      // Create ZIP file with all papers
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

      // Check if response is actually a ZIP file
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/zip')) {
        throw new Error('Invalid response format');
      }

      const blob = await response.blob();
      console.log(`📦 ZIP file size: ${blob.size} bytes`);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = `${document.title.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '_')}.zip`;
      a.style.display = 'none';
      window.document.body.appendChild(a);
      a.click();
      
      // Cleanup
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

  const handleEdit = () => {
    onEditDocument?.(document.id);
  };

  const handleDelete = () => {
    onDeleteDocument?.(document.id);
  };

  const handleToggleFavorite = () => {
    if (!user?.id) {
      console.error("❌ No user ID available");
      toast({
        title: "خطأ",
        description: "لم يتم العثور على معرف المستخدم",
        variant: "destructive",
      });
      return;
    }
    toggleFavoriteMutation.mutate();
  };

  return (
    <div 
      className="group flex items-center space-x-4 space-x-reverse p-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 rounded-xl transition-all duration-200 cursor-pointer border border-transparent hover:border-blue-200 hover:shadow-md"
      onClick={() => onViewDocument?.(document.id)}
    >
      {/* Legal Section Icon */}
      <div className={`w-12 h-12 ${caseTypeConfig.bgColor} ${caseTypeConfig.borderColor} border-2 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200 shadow-sm`}>
        <CaseIcon className={`w-6 h-6 ${caseTypeConfig.color}`} />
      </div>
      
      {/* Document Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 space-x-reverse mb-2">
          <h3 className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-700 transition-colors">
            {document.title}
          </h3>
          {document.is_favorited && (
            <Star className="w-4 h-4 text-green-600 fill-current" />
          )}
          <div className="flex items-center space-x-1 space-x-reverse">
            <CaseIcon className={`w-4 h-4 ${caseTypeConfig.color}`} />
            <span className={`text-xs font-medium ${caseTypeConfig.color}`}>
              {caseTypeConfig.label}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 space-x-reverse text-xs text-gray-500">
          <span className="flex items-center space-x-1 space-x-reverse">
            <StatusIcon className="w-3 h-3" />
            <span>{statusConfig.label}</span>
          </span>
          <span>{timeAgo}</span>
          <span>{formatFileSize(mainPaper?.file_size ?? undefined)}</span>
        </div>
      </div>
      
      {/* Status Badge and Actions */}
      <div className="flex items-center space-x-2 space-x-reverse">
        <Badge 
          className={`${statusConfig.bgColor} ${statusConfig.color} ${statusConfig.borderColor} border font-medium`}
        >
          <StatusIcon className="w-3 h-3 ml-1" />
          {statusConfig.label}
        </Badge>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white/95 backdrop-blur-sm border-0 shadow-xl rounded-xl">
            <DropdownMenuItem 
              onClick={(e) => {
                e.stopPropagation();
                onViewDocument?.(document.id);
              }}
              className="flex items-center space-x-2 space-x-reverse hover:bg-blue-50 transition-colors"
            >
              <Eye className="w-4 h-4 text-blue-600" />
              <span>عرض الوثيقة</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              onClick={(e) => {
                e.stopPropagation();
                handleDownload();
              }}
              className="flex items-center space-x-2 space-x-reverse hover:bg-green-50 transition-colors"
            >
              <Download className="w-4 h-4 text-green-600" />
              <span>تحميل</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              onClick={(e) => {
                e.stopPropagation();
                handleToggleFavorite();
              }}
              className="flex items-center space-x-2 space-x-reverse hover:bg-yellow-50 transition-colors"
            >
              <Star className={`w-4 h-4 ${document.is_favorited ? 'text-yellow-600 fill-current' : 'text-yellow-600'}`} />
              <span>{document.is_favorited ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}</span>
            </DropdownMenuItem>
            
            {canManageDocuments() && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit();
                  }}
                  className="flex items-center space-x-2 space-x-reverse hover:bg-yellow-50 transition-colors"
                >
                  <Edit className="w-4 h-4 text-yellow-600" />
                  <span>تعديل الوثيقة</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                  className="flex items-center space-x-2 space-x-reverse hover:bg-red-50 transition-colors text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>حذف الوثيقة</span>
                </DropdownMenuItem>
              </>
            )}
            
            {hasRole('viewer') && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    onComment?.(document.id);
                  }}
                  className="flex items-center space-x-2 space-x-reverse hover:bg-indigo-50 transition-colors"
                >
                  <MessageSquare className="w-4 h-4 text-indigo-600" />
                  <span>إضافة تعليق</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    onRecommend?.(document.id);
                  }}
                  className="flex items-center space-x-2 space-x-reverse hover:bg-green-50 transition-colors"
                >
                  <ThumbsUp className="w-4 h-4 text-green-600" />
                  <span>توصية</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    onReportProblem?.(document.id);
                  }}
                  className="flex items-center space-x-2 space-x-reverse hover:bg-orange-50 transition-colors"
                >
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                  <span>الإبلاغ عن مشكلة</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>


      {/* Download Confirmation Dialog */}
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
              لا يمكن تحميل الوثيقة "{document.title}" لأنها لا تحتوي على أي أوراق.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-yellow-600 ml-2" />
                <p className="text-yellow-800">
                  يرجى إضافة أوراق إلى الوثيقة قبل محاولة تحميلها.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowEmptyDocumentDialog(false)}>
              موافق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
