import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { CATEGORIES } from "@/lib/constants";
import { getDocumentTypeConfig } from "@/lib/document-types";
import { useQuery } from "@tanstack/react-query";
import { 
  Home, 
  Folder, 
  FileText, 
  Star, 
  Clock, 
  Users, 
  Scale, 
  Gavel, 
  Handshake, 
  Building, 
  Lightbulb, 
  MessageSquare, 
  Flag, 
  Settings, 
  BarChart3, 
  Plus,
  UserCog,
  Shield
} from "@/lib/icons";

interface SidebarProps {
  onNewDocument?: () => void;
  onCategorySelect?: (category: string) => void;
}

export function Sidebar({ onNewDocument, onCategorySelect }: SidebarProps) {
  const [location] = useLocation();
  const { canManageDocuments, canManageUsers, canPerformActions, user } = useAuth();

  // Fetch real statistics
  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/stats");
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
    staleTime: 0, // Always consider data stale for real-time updates
    refetchOnWindowFocus: true,
  });

  // Fetch user's favorite count using the same approach as the main favorites page
  const { data: allDocuments = [] } = useQuery({
    queryKey: ["/api/documents", user?.id, "sidebar"],
    queryFn: async () => {
      if (!user?.id) return [];
      const cacheBuster = `&_t=${Date.now()}`;
      const url = `/api/documents?userId=${user.id}&sortBy=recent${cacheBuster}`;
      const response = await fetch(url, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (!response.ok) {
        console.error('Failed to fetch documents:', response.status, response.statusText);
        return [];
      }
      return response.json();
    },
    enabled: !!user?.id,
    staleTime: 0, // Always consider data stale to ensure fresh data
    refetchOnWindowFocus: true,
    refetchInterval: 10000, // More frequent refresh for favorites
  });

  // Filter documents to get only favorites and count them
  const favoritesCount = allDocuments.filter(doc => doc.is_favorited).length;

  const navigation = [
    {
      name: "لوحة التحكم",
      href: "/dashboard",
      icon: Home,
      current: location === "/dashboard",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      name: "جميع القضايا",
      href: "/documents",
      icon: Folder,
      current: location === "/documents",
      badge: stats?.total_documents?.toString() || "0",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      name: "الوثائق الحديثة",
      href: "/recent",
      icon: FileText,
      current: location === "/recent",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      name: "الوثائق المفضلة",
      href: "/favorites",
      icon: Star,
      current: location === "/favorites",
      badge: favoritesCount.toString(),
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      name: "في انتظار الموافقة",
      href: "/pending",
      icon: Clock,
      current: location === "/pending",
      badge: stats?.pending_documents?.toString() || "0",
      badgeColor: "bg-orange-500 text-white",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  // Generate categories dynamically from constants
  const categories = CATEGORIES.map(category => {
    const config = getDocumentTypeConfig(category, 'case');
    return {
      name: config.label,
      icon: config.icon,
      href: `/documents?category=${encodeURIComponent(category)}`,
      color: config.color,
      bgColor: config.bgColor,
      categoryKey: category
    };
  });

  const feedbackNavigation = [
    {
      name: "التوصيات",
      href: "/recommendations",
      icon: Lightbulb,
      current: location === "/recommendations",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      name: "التعليقات",
      href: "/comments",
      icon: MessageSquare,
      current: location === "/comments",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
    {
      name: "التقارير",
      href: "/reports",
      icon: Flag,
      current: location === "/reports",
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  ];

  const adminNavigation = [
    {
      name: "إدارة المستخدمين",
      href: "/users",
      icon: UserCog,
      current: location === "/users",
      color: "text-teal-600",
      bgColor: "bg-teal-50",
    },
    {
      name: "تقارير النظام",
      href: "/rapport",
      icon: BarChart3,
      current: location === "/rapport",
      color: "text-cyan-600",
      bgColor: "bg-cyan-50",
    },
    {
      name: "الإعدادات",
      href: "/settings",
      icon: Settings,
      current: location === "/settings",
      color: "text-gray-600",
      bgColor: "bg-gray-50",
    },
  ];

  return (
    <aside className="w-80 bg-gradient-to-b from-white to-gray-50 shadow-lg border-r border-gray-200 flex-shrink-0 h-full overflow-y-auto">
      <nav className="p-6 space-y-2">
        <div className="mb-6">
          {canManageDocuments() && canPerformActions() && (
            <Button
              onClick={onNewDocument}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-3 rounded-xl font-medium flex items-center justify-center space-x-2 space-x-reverse transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
            >
              <Plus className="w-4 h-4" />
              <span>وثيقة جديدة</span>
            </Button>
          )}
        </div>

        <div className="space-y-1">
          {navigation.map((item) => {
            const IconComponent = item.icon;
            return (
              <Link key={item.name} href={item.href}>
                <div
                  className={cn(
                    "flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-xl transition-all duration-200 group",
                    item.current
                      ? `${item.color} ${item.bgColor} font-medium shadow-sm`
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <div className={cn(
                    "p-2 rounded-lg transition-colors",
                    item.current ? "bg-white/50" : "group-hover:bg-white/50"
                  )}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <span className="flex-1">{item.name}</span>
                  {item.badge && (
                    <span
                      className={cn(
                        "text-xs px-2 py-1 rounded-full font-medium",
                        item.badgeColor || "bg-gray-200 text-gray-700"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        <div className="pt-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center space-x-2 space-x-reverse">
            <Shield className="w-3 h-3" />
            <span>الفئات</span>
          </h3>
          <div className="space-y-1">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <div
                  key={category.name}
                  onClick={() => onCategorySelect?.(category.categoryKey)}
                  className={cn(
                    "flex items-center space-x-3 space-x-reverse px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-all duration-200 group cursor-pointer",
                    "hover:shadow-sm"
                  )}
                >
                  <div className={cn(
                    "p-1.5 rounded-md transition-colors",
                    category.bgColor,
                    "group-hover:shadow-sm"
                  )}>
                    <IconComponent className={cn("w-4 h-4", category.color)} />
                  </div>
                  <span className="text-sm">{category.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center space-x-2 space-x-reverse">
            <MessageSquare className="w-3 h-3" />
            <span>التوصيات والملاحظات</span>
          </h3>
          <div className="space-y-1">
            {feedbackNavigation.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link key={item.name} href={item.href}>
                  <div
                    className={cn(
                      "flex items-center space-x-3 space-x-reverse px-4 py-2 rounded-lg transition-all duration-200 text-sm group",
                      item.current
                        ? `${item.color} ${item.bgColor} font-medium shadow-sm`
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <div className={cn(
                      "p-1.5 rounded-md transition-colors",
                      item.current ? "bg-white/50" : "group-hover:bg-white/50"
                    )}>
                      <IconComponent className={cn("w-4 h-4", item.current ? item.color : "text-gray-500")} />
                    </div>
                    <span className="text-sm truncate">{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {canManageUsers() && (
          <div className="pt-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center space-x-2 space-x-reverse">
              <UserCog className="w-3 h-3" />
              <span>الإدارة</span>
            </h3>
            <div className="space-y-1">
              {adminNavigation.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link key={item.name} href={item.href}>
                    <div
                      className={cn(
                        "flex items-center space-x-3 space-x-reverse px-4 py-2 rounded-lg transition-all duration-200 text-sm group",
                        item.current
                          ? `${item.color} ${item.bgColor} font-medium shadow-sm`
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      )}
                    >
                      <div className={cn(
                        "p-1.5 rounded-md transition-colors",
                        item.current ? "bg-white/50" : "group-hover:bg-white/50"
                      )}>
                        <IconComponent className={cn("w-4 h-4", item.current ? item.color : "text-gray-500")} />
                      </div>
                      <span className="text-sm truncate">{item.name}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>
    </aside>
  );
}
