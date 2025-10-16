import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';

/**
 * Custom hook to automatically refresh data when navigating between pages
 * This ensures that document lists and dashboard data are always up-to-date
 */
export function useAutoRefresh() {
  const queryClient = useQueryClient();
  const [location] = useLocation();

  useEffect(() => {
    // Invalidate and refetch document-related queries when navigating
    const invalidateDocumentQueries = () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
    };

    // Invalidate queries when navigating to document-related pages
    if (location === '/documents' || location === '/dashboard' || location === '/recent' || location === '/favorites' || location === '/pending') {
      invalidateDocumentQueries();
    }

    // Also invalidate when navigating to document editor
    if (location.startsWith('/documents/') && location !== '/documents') {
      invalidateDocumentQueries();
    }
  }, [location, queryClient]);

  return null;
}
