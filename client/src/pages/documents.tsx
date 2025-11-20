import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { DocumentListItem } from "@/components/document-list-item";
import { EnhancedDocumentUploadModal } from "@/components/enhanced-document-upload-modal";
import { FileUploadModal } from "@/components/file-upload-modal";
import { EnhancedCommentModal } from "@/components/enhanced-comment-modal";
import { RecommendationModal } from "@/components/recommendation-modal";
import { ReportProblemModal } from "@/components/report-problem-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { type DocumentWithDetails, type Block } from "@shared/schema";
import { CATEGORIES, STATUSES } from "@/lib/constants";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAutoRefresh } from "@/hooks/use-auto-refresh";

export default function Documents() {
  const [location, setLocation] = useLocation();
  const { canManageDocuments, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedBlock, setSelectedBlock] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("recent");
  const [specializedSection, setSpecializedSection] = useState<string>("");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isFileUploadModalOpen, setIsFileUploadModalOpen] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [isRecommendationModalOpen, setIsRecommendationModalOpen] = useState(false);
  const [isReportProblemModalOpen, setIsReportProblemModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentWithDetails | null>(null);
  
  // Determine if we're on the favorites page
  const isFavoritesPage = location === "/favorites";
  
  // Auto-refresh for favorites page
  useAutoRefresh();
  
  // Download and Delete states
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);
  const [showEmptyDocumentDialog, setShowEmptyDocumentDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<DocumentWithDetails | null>(null);
  const [documentToDownload, setDocumentToDownload] = useState<DocumentWithDetails | null>(null);

  // Load filters from localStorage and URL parameters on component mount
  useEffect(() => {
    // Check for URL parameters first
    const urlParams = new URLSearchParams(window.location.search);
    const categoryFromUrl = urlParams.get('category');
    
    if (categoryFromUrl) {
      // If category is in URL, clear other filters and set only the category
      setSearchQuery("");
      setSelectedCategory(categoryFromUrl);
      setSelectedStatus("all");
      setSelectedBlock("all");
      setSortBy("recent");
      setSpecializedSection("");
    } else {
      // Otherwise, load from localStorage
      const savedFilters = localStorage.getItem('documentFilters');
      if (savedFilters) {
        try {
          const filters = JSON.parse(savedFilters);
          setSearchQuery(filters.searchQuery || "");
          setSelectedCategory(filters.selectedCategory || "all");
          setSelectedStatus(filters.selectedStatus || "all");
          setSelectedBlock(filters.selectedBlock || "all");
          setSortBy(filters.sortBy || "recent");
          setSpecializedSection(filters.specializedSection || "");
        } catch (error) {
          console.error("Error loading saved filters:", error);
        }
      }
    }
  }, []);

  // Save filters to localStorage whenever they change
  useEffect(() => {
    const filters = {
      searchQuery,
      selectedCategory,
      selectedStatus,
      selectedBlock,
      sortBy,
      specializedSection
    };
    localStorage.setItem('documentFilters', JSON.stringify(filters));
  }, [searchQuery, selectedCategory, selectedStatus, selectedBlock, sortBy, specializedSection]);

  // Build query parameters
  const queryParams = new URLSearchParams();
  if (searchQuery) queryParams.set("search", searchQuery);
  if (selectedCategory && selectedCategory !== "all") queryParams.set("category", selectedCategory);
  if (selectedStatus && selectedStatus !== "all") queryParams.set("status", selectedStatus);
  if (selectedBlock && selectedBlock !== "all") queryParams.set("blockId", selectedBlock);
  if (specializedSection) queryParams.set("specializedSection", specializedSection);
  if (sortBy) queryParams.set("sortBy", sortBy);
  if (user?.id) queryParams.set("userId", user.id);

  const { data: documents = [], isLoading } = useQuery<DocumentWithDetails[]>({
    queryKey: ["/api/documents", queryParams.toString(), isFavoritesPage ? "favorites" : "all"],
    queryFn: () => {
      // Add cache-busting parameter to force fresh data
      const cacheBuster = `&_t=${Date.now()}`;
      const url = `/api/documents${queryParams.toString() ? `?${queryParams.toString()}${cacheBuster}` : `?${cacheBuster}`}`;
      console.log("🔄 Fetching documents from:", url);
      return fetch(url, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      }).then(res => res.json());
    },
    staleTime: 0, // Always consider data stale to ensure fresh data
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnMount: true, // Refetch when component mounts
    refetchInterval: isFavoritesPage ? 10000 : 30000, // More frequent refresh for favorites
  });

  const { data: blocks = [] } = useQuery<Block[]>({
    queryKey: ["/api/blocks"],
  });

  // Filter documents based on current page
  const filteredDocuments = isFavoritesPage 
    ? documents.filter(doc => doc.is_favorited)
    : documents;

  // Delete mutation
  const deleteDocumentMutation = useMutation({
    mutationFn: async (documentId: string) => {
      return apiRequest("DELETE", `/api/documents/${documentId}`);
    },
    onSuccess: () => {
      toast({
        title: "تم الحذف",
        description: "تم حذف الوثيقة نهائياً",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/user-activity", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/recent-documents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/documents/favorites", user?.id] });
      
      // Force refetch critical queries
      queryClient.refetchQueries({ queryKey: ["/api/documents"] });
      queryClient.refetchQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.refetchQueries({ queryKey: ["/api/documents/favorites", user?.id] });
      
      setShowDeleteDialog(false);
      setDocumentToDelete(null);
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في حذف الوثيقة",
        variant: "destructive",
      });
    },
  });

  const handleViewDocument = (id: string) => {
    setLocation(`/documents/${id}`);
  };

  const handleEditDocument = (id: string) => {
    setLocation(`/documents/${id}?edit=true`);
  };

  const handleDeleteDocument = (id: string) => {
    const document = documents.find(doc => doc.id === id);
    if (document) {
      setDocumentToDelete(document);
      setShowDeleteDialog(true);
    }
  };

  const handleDownloadDocument = (id: string) => {
    const document = documents.find(doc => doc.id === id);
    if (document) {
      if (!document.papers || document.papers.length === 0) {
        setShowEmptyDocumentDialog(true);
        return;
      }
      setDocumentToDownload(document);
      setShowDownloadDialog(true);
    }
  };

  const handleDownloadConfirm = async () => {
    if (!documentToDownload) return;
    
    setIsDownloading(true);
    try {
      console.log(`📥 Starting download for document: ${documentToDownload.id}`);
      
      const response = await fetch(`/api/documents/${documentToDownload.id}/download`, {
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
      a.download = `${documentToDownload.title.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '_')}.zip`;
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
      setDocumentToDownload(null);
    }
  };

  const handleDeleteConfirm = () => {
    if (documentToDelete) {
      deleteDocumentMutation.mutate(documentToDelete.id);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 بايت';
    const k = 1024;
    const sizes = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleComment = (id: string) => {
    const document = documents.find(doc => doc.id === id);
    if (document) {
      setSelectedDocument(document);
      setIsCommentModalOpen(true);
    }
  };

  const handleRecommend = (id: string) => {
    const document = documents.find(doc => doc.id === id);
    if (document) {
      setSelectedDocument(document);
      setIsRecommendationModalOpen(true);
    }
  };

  const handleReportProblem = (id: string) => {
    const document = documents.find(doc => doc.id === id);
    if (document) {
      setSelectedDocument(document);
      setIsReportProblemModalOpen(true);
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedStatus("all");
    setSelectedBlock("all");
    setSpecializedSection("");
    setSortBy("recent");
  };

  // Individual filter functions
  const removeSearchFilter = () => setSearchQuery("");
  const removeCategoryFilter = () => setSelectedCategory("all");
  const removeStatusFilter = () => setSelectedStatus("all");
  const removeBlockFilter = () => setSelectedBlock("all");
  const removeSectionFilter = () => setSpecializedSection("");
  const removeSortFilter = () => setSortBy("recent");

  // Handle category selection from sidebar
  const handleCategorySelect = (category: string) => {
    // Clear all other filters and set only the selected category
    setSearchQuery("");
    setSelectedCategory(category);
    setSelectedStatus("all");
    setSelectedBlock("all");
    setSortBy("recent");
    setSpecializedSection("");
    
    // Update URL to reflect the category selection
    const newUrl = `/documents?category=${encodeURIComponent(category)}`;
    setLocation(newUrl);
  };

  const activeFiltersCount = [
    searchQuery, 
    selectedCategory !== "all" ? selectedCategory : "", 
    selectedStatus !== "all" ? selectedStatus : "", 
    selectedBlock !== "all" ? selectedBlock : "",
    specializedSection,
    sortBy !== "recent" ? sortBy : ""
  ].filter(Boolean).length;

  return (
    <MainLayout 
      onSearch={setSearchQuery} 
      searchQuery={searchQuery}
      onCategorySelect={handleCategorySelect}
    >
      <div className="p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {isFavoritesPage ? "الوثائق المفضلة" : "إدارة الوثائق"}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {isFavoritesPage 
                  ? "تصفح وإدارة الوثائق المفضلة" 
                  : "تصفح وإدارة جميع وثائق المحكمة"
                }
              </p>
            </div>
            {canManageDocuments() && !isFavoritesPage && (
              <div className="flex space-x-2 space-x-reverse">
                <Button onClick={() => setIsUploadModalOpen(true)}>
                  <i className="fas fa-plus ml-2"></i>
                  إنشاء وثيقة جديدة
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsFileUploadModalOpen(true)}
                >
                  <i className="fas fa-upload ml-2"></i>
                  رفع ملفات
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>المرشحات</CardTitle>
              {activeFiltersCount > 0 && (
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    مسح جميع المرشحات
                  </Button>
                </div>
              )}
            </div>
            
            {/* Individual Active Filters */}
            {activeFiltersCount > 0 && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2 space-x-reverse mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">المرشحات النشطة:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {searchQuery && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      البحث: {searchQuery}
                      <button
                        onClick={removeSearchFilter}
                        className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                      >
                        ×
                      </button>
                    </Badge>
                  )}
                  {selectedCategory !== "all" && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      الفئة: {selectedCategory}
                      <button
                        onClick={removeCategoryFilter}
                        className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                      >
                        ×
                      </button>
                    </Badge>
                  )}
                  {selectedStatus !== "all" && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      الحالة: {selectedStatus}
                      <button
                        onClick={removeStatusFilter}
                        className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                      >
                        ×
                      </button>
                    </Badge>
                  )}
                  {selectedBlock !== "all" && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      الكتلة: {selectedBlock}
                      <button
                        onClick={removeBlockFilter}
                        className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                      >
                        ×
                      </button>
                    </Badge>
                  )}
                  {specializedSection && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      القسم: {specializedSection}
                      <button
                        onClick={removeSectionFilter}
                        className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                      >
                        ×
                      </button>
                    </Badge>
                  )}
                  {sortBy !== "recent" && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      الترتيب: {sortBy === "oldest" ? "الأقدم" : sortBy === "title" ? "حسب العنوان" : sortBy === "category" ? "حسب الفئة" : sortBy}
                      <button
                        onClick={removeSortFilter}
                        className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                      >
                        ×
                      </button>
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                  البحث
                </label>
                <Input
                  placeholder="ابحث بالعناوين (A.1.1)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                  الفئة
                </label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="جميع الفئات" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الفئات</SelectItem>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                  الحالة
                </label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="جميع الحالات" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    {STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                  القسم
                </label>
                <Input
                  placeholder="أدخل القسم (A,B أو CD)"
                  value={specializedSection}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase();
                    if (value.length <= 3) {
                      setSpecializedSection(value);
                    }
                  }}
                  maxLength={3}
                  className="uppercase"
                />
                {specializedSection && (
                  <div className="mt-2">
                    <Badge variant="secondary" className="mr-2">
                      الكتلة: {specializedSection}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSpecializedSection("")}
                    >
                      إزالة
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {isFavoritesPage ? "الوثائق المفضلة" : "الوثائق"} ({filteredDocuments.length})
              </CardTitle>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">الأحدث</SelectItem>
                    <SelectItem value="oldest">الأقدم</SelectItem>
                    <SelectItem value="title">حسب العنوان</SelectItem>
                    <SelectItem value="category">حسب الفئة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <p className="mt-2 text-gray-600">جاري التحميل...</p>
              </div>
            ) : filteredDocuments.length > 0 ? (
              <div className="space-y-1">
                {filteredDocuments.map((document) => (
                  <DocumentListItem
                    key={document.id}
                    document={document}
                    onViewDocument={handleViewDocument}
                    onEditDocument={handleEditDocument}
                    onDeleteDocument={handleDeleteDocument}
                    onDownloadDocument={handleDownloadDocument}
                    onComment={handleComment}
                    onRecommend={handleRecommend}
                    onReportProblem={handleReportProblem}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <i className={`fas ${isFavoritesPage ? 'fa-star' : 'fa-search'} text-gray-400 text-4xl mb-4`}></i>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {isFavoritesPage ? "لا توجد وثائق مفضلة" : "لم يتم العثور على وثائق"}
                </h3>
                <p className="text-gray-600 mb-4">
                  {isFavoritesPage 
                    ? "لم تقم بإضافة أي وثائق إلى المفضلة بعد" 
                    : activeFiltersCount > 0 
                      ? "لا توجد وثائق تطابق المرشحات المحددة. جرب تعديل المرشحات أو البحث عن شيء آخر"
                      : "جرب تعديل المرشحات أو البحث عن شيء آخر"
                  }
                </p>
                {activeFiltersCount > 0 && !isFavoritesPage && (
                  <Button variant="outline" onClick={clearFilters}>
                    مسح المرشحات
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Document Upload Modal */}
        {canManageDocuments() && (
          <EnhancedDocumentUploadModal
            isOpen={isUploadModalOpen}
            onClose={() => setIsUploadModalOpen(false)}
          />
        )}

        {/* File Upload Modal */}
        {canManageDocuments() && (
          <FileUploadModal
            isOpen={isFileUploadModalOpen}
            onClose={() => setIsFileUploadModalOpen(false)}
          />
        )}

        {/* Viewer-specific Modals */}
        {selectedDocument && (
          <>
            <EnhancedCommentModal
              isOpen={isCommentModalOpen}
              onClose={() => {
                setIsCommentModalOpen(false);
                setSelectedDocument(null);
              }}
              documentId={selectedDocument.id}
              documentTitle={selectedDocument.title}
              papers={selectedDocument.papers || []}
            />
            
            <RecommendationModal
              isOpen={isRecommendationModalOpen}
              onClose={() => {
                setIsRecommendationModalOpen(false);
                setSelectedDocument(null);
              }}
              documentId={selectedDocument.id}
              documentTitle={selectedDocument.title}
            />
            
            <ReportProblemModal
              isOpen={isReportProblemModalOpen}
              onClose={() => {
                setIsReportProblemModalOpen(false);
                setSelectedDocument(null);
              }}
              documentId={selectedDocument.id}
              documentTitle={selectedDocument.title}
            />
          </>
        )}

        {/* Download Dialog */}
        <Dialog open={showDownloadDialog} onOpenChange={setShowDownloadDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>تحميل الوثيقة</DialogTitle>
              <DialogDescription>
                سيتم تحميل الوثيقة "{documentToDownload?.title}" كملف مضغوط يحتوي على جميع الأوراق.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">تفاصيل التحميل:</h4>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex justify-between">
                    <span>عدد الأوراق:</span>
                    <span className="font-medium">{documentToDownload?.papers?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>الحجم الإجمالي:</span>
                    <span className="font-medium">
                      {formatFileSize(documentToDownload?.papers?.reduce((total, paper) => total + (paper.file_size || 0), 0) || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>اسم الملف:</span>
                    <span className="font-medium">{documentToDownload?.title}.zip</span>
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

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
              <AlertDialogDescription>
                {documentToDelete?.is_favorited ? (
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
                    <p>هل أنت متأكد من حذف الوثيقة "{documentToDelete?.title}"؟ هذا الإجراء لا يمكن التراجع عنه.</p>
                  </div>
                ) : (
                  `هل أنت متأكد من حذف الوثيقة "${documentToDelete?.title}"؟ هذا الإجراء لا يمكن التراجع عنه.`
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>
                إلغاء
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                disabled={deleteDocumentMutation.isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleteDocumentMutation.isPending ? "جاري الحذف..." : "حذف"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
}
