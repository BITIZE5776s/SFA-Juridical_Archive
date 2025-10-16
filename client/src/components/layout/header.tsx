import { Search, Bell, ChevronDown, User, Settings, LogOut, Scale, Building } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

interface HeaderProps {
  onSearch?: (query: string) => void;
  searchQuery?: string;
}

export function Header({ onSearch, searchQuery = "" }: HeaderProps) {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  return (
    <header className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-200 fixed top-0 left-0 right-0 z-50 h-16">
      <div className="flex items-center justify-between px-6 h-full">
        <div className="flex items-center space-x-4 space-x-reverse">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 flex items-center space-x-2 space-x-reverse">
                <span>الأرشيف القضائي</span>
                <Building className="w-4 h-4 text-blue-600" />
              </h1>
              <p className="text-xs text-gray-600">محكمة الاستئناف بالمغرب</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-6 space-x-reverse">
          {/* Search Bar */}
          <div className="relative hidden md:block">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="البحث في الوثائق والقضايا..."
              className="w-80 pr-10 pl-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50/80 backdrop-blur-sm transition-all duration-200 hover:bg-white hover:shadow-md"
              value={searchQuery}
              onChange={(e) => onSearch?.(e.target.value)}
            />
          </div>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="sm"
            className="relative p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:shadow-md"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -left-1 w-5 h-5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium shadow-lg">
              3
            </span>
          </Button>

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-3 space-x-reverse hover:bg-gray-50 rounded-xl transition-all duration-200 hover:shadow-md">
                <div className="text-right hidden lg:block">
                  <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
                  <div className="text-xs text-gray-600 flex items-center space-x-1 space-x-reverse">
                    <span>
                      {user?.role === 'admin' ? 'مدير النظام' :
                        user?.role === 'archivist' ? 'أمين الأرشيف' : 'مستعرض'}
                    </span>
                    <div className={`w-2 h-2 rounded-full ${
                      user?.role === 'admin' ? 'bg-green-500' :
                      user?.role === 'archivist' ? 'bg-blue-500' : 'bg-gray-500'
                    }`}></div>
                  </div>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-medium text-sm">
                    {user?.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white/95 backdrop-blur-sm border-0 shadow-xl rounded-xl">
              <DropdownMenuItem onClick={() => setLocation("/profile")} className="flex items-center space-x-3 space-x-reverse hover:bg-blue-50 transition-colors">
                <User className="w-4 h-4 text-blue-600" />
                <span>الملف الشخصي</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLocation("/settings")} className="flex items-center space-x-3 space-x-reverse hover:bg-gray-50 transition-colors">
                <Settings className="w-4 h-4 text-gray-600" />
                <span>الإعدادات</span>
              </DropdownMenuItem>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="flex items-center space-x-3 space-x-reverse hover:bg-red-50 transition-colors text-red-600">
                    <LogOut className="w-4 h-4" />
                    <span>تسجيل الخروج</span>
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-white/95 backdrop-blur-sm border-0 shadow-xl rounded-xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center space-x-2 space-x-reverse">
                      <LogOut className="w-5 h-5 text-red-600" />
                      <span>تأكيد تسجيل الخروج</span>
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      هل أنت متأكد من أنك تريد تسجيل الخروج؟ سيتم إغلاق جلسة العمل الحالية.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="hover:bg-gray-50">إلغاء</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleLogout}
                      className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                    >
                      تسجيل الخروج
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
