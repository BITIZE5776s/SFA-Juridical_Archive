import { useState } from "react";
import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { EnhancedDocumentUploadModal } from "@/components/enhanced-document-upload-modal";
import { RestrictionGuard } from "@/components/restriction-guard";
import { useAutoRefresh } from "@/hooks/use-auto-refresh";

interface MainLayoutProps {
  children: React.ReactNode;
  onSearch?: (query: string) => void;
  searchQuery?: string;
  onCategorySelect?: (category: string) => void;
}

export function MainLayout({ children, onSearch, searchQuery, onCategorySelect }: MainLayoutProps) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Enable automatic data refreshing when navigating between pages
  useAutoRefresh();

  return (
    <RestrictionGuard>
      <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        <Header 
          onSearch={onSearch} 
          searchQuery={searchQuery} 
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <div className="flex flex-1 pt-16">
          <Sidebar 
            onNewDocument={() => setIsUploadModalOpen(true)} 
            onCategorySelect={onCategorySelect}
            isOpen={isSidebarOpen}
            onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          />
          <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900 transition-all duration-300 ease-in-out">
            <div className="h-full">
              {children}
            </div>
          </main>
        </div>
        
        <EnhancedDocumentUploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
        />
      </div>
    </RestrictionGuard>
  );
}
