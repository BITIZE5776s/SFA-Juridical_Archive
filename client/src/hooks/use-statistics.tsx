import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./use-auth";

export interface Statistics {
  totalDocuments: number;
  pendingDocuments: number;
  favoriteDocuments: number;
  userActivity: {
    documentsCreated: number;
    commentsPosted: number;
    recommendationsMade: number;
    reportsSubmitted: number;
  };
}

export function useStatistics() {
  const { user } = useAuth();

  const { data: stats, isLoading, error } = useQuery<Statistics>({
    queryKey: ["/api/dashboard/stats", user?.id],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/stats");
      if (!response.ok) {
        throw new Error('Failed to fetch statistics');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });

  return {
    stats,
    isLoading,
    error,
  };
}
