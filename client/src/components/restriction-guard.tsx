import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogPortal, DialogOverlay } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, User, Mail, LogOut, X } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

interface RestrictionGuardProps {
  children: React.ReactNode;
}

// Custom DialogContent without automatic close button
const CustomDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPortal>
));
CustomDialogContent.displayName = DialogPrimitive.Content.displayName;

export function RestrictionGuard({ children }: RestrictionGuardProps) {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isChangingRole, setIsChangingRole] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string>('');
  const [adminName, setAdminName] = useState<string>('');

  // Fetch admin information when component mounts
  useEffect(() => {
    const fetchAdminInfo = async () => {
      if (!user?.restrictedBy) return;
      
      try {
        const response = await apiRequest("GET", `/api/users/${user.restrictedBy}`);
        const adminData = await response.json();
        setAdminEmail(adminData.email);
        setAdminName(adminData.fullName);
      } catch (error) {
        console.error('Failed to fetch admin info:', error);
      }
    };

    fetchAdminInfo();
  }, [user?.restrictedBy]);

  // If user is not restricted OR has viewer role, show normal content
  if (!user?.isRestricted || user?.role === 'viewer') {
    return <>{children}</>;
  }

  const handleRoleChange = async () => {
    if (!user) return;
    
    setIsChangingRole(true);
    try {
      // Update user role to viewer but keep restriction status
      const response = await apiRequest("PUT", `/api/users/${user.id}`, {
        role: 'viewer'
        // Don't remove restriction - keep isRestricted, restrictionReason, etc.
      });
      
      if (response.ok) {
        toast({
          title: "تم تغيير الدور",
          description: "تم تغيير دورك إلى مستعرض. يمكنك الآن استخدام النظام بصلاحيات محدودة.",
        });
        
        // Update local user state instead of reloading
        const updatedUser = {
          ...user,
          role: 'viewer'
        };
        
        // Update localStorage with new role
        const sessionData = {
          user: updatedUser,
          timestamp: Date.now(),
          expiresAt: Date.now() + (24 * 60 * 60 * 1000)
        };
        localStorage.setItem('user', JSON.stringify(sessionData));
        
        // Force a page refresh to update the auth context
        window.location.reload();
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في تغيير الدور. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setIsChangingRole(false);
    }
  };

  const handleContactAdmin = () => {
    if (!adminEmail) {
      toast({
        title: "خطأ",
        description: "لا يمكن العثور على معلومات الإدارة",
        variant: "destructive",
      });
      return;
    }
    
    const subject = encodeURIComponent("طلب إلغاء التقييد - Request to Remove Restriction");
    const body = encodeURIComponent(
      `مرحباً ${adminName || 'الإدارة'}،\n\nأطلب منكم إلغاء التقييد المفروض على حسابي.\n\nمع الشكر،\n${user?.fullName}`
    );
    
    const mailtoUrl = `mailto:${adminEmail}?subject=${subject}&body=${body}`;
    window.open(mailtoUrl, '_blank');
  };

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/login';
    } catch (error) {
      // Force logout even if there's an error
      window.location.href = '/login';
    }
  };

  const handleBackgroundClick = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    setShowLogoutDialog(true);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutDialog(false);
    handleLogout();
  };

  const handleLogoutCancel = () => {
    setShowLogoutDialog(false);
  };

  const handleCloseClick = () => {
    setShowLogoutDialog(true);
  };


  return (
    <>
      {/* Main Restriction Dialog */}
      <Dialog open={true} onOpenChange={() => {}}>
        <CustomDialogContent 
          className="max-w-md"
          onPointerDownOutside={handleBackgroundClick}
          onEscapeKeyDown={handleBackgroundClick}
          onInteractOutside={handleBackgroundClick}
        >
          <DialogHeader>
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLogoutDialog(true)}
                className="h-6 w-6 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
              <DialogTitle className="text-red-600 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                حسابك مقيد
              </DialogTitle>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* Warning Message */}
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start space-x-3 space-x-reverse">
                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-red-800 mb-2">حسابك مقيد حالياً</h4>
                  <p className="text-sm text-red-700">
                    <strong>سبب التقييد:</strong> {user.restrictionReason || "سبب غير محدد"}
                  </p>
                  {adminName && (
                    <p className="text-xs text-red-600 mt-1">
                      مقيد من قبل: {adminName}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Options */}
            <div className="space-y-4">
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3 space-x-reverse">
                    <User className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-blue-800 mb-1">
                        العمل كمستعرض
                      </h4>
                      <p className="text-xs text-blue-700 mb-3">
                        يمكنك تغيير دورك إلى مستعرض للوصول المحدود للنظام
                      </p>
                      <Button
                        onClick={handleRoleChange}
                        disabled={isChangingRole}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {isChangingRole ? "جاري التغيير..." : "تغيير إلى مستعرض"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3 space-x-reverse">
                    <Mail className="w-5 h-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-green-800 mb-1">
                        التواصل مع الإدارة
                      </h4>
                      <p className="text-xs text-green-700 mb-3">
                        يمكنك إرسال رسالة للإدارة لطلب إلغاء التقييد
                      </p>
                      <Button
                        onClick={handleContactAdmin}
                        size="sm"
                        variant="outline"
                        className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                      >
                        إرسال رسالة للإدارة
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CustomDialogContent>
      </Dialog>

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={() => {}}>
        <CustomDialogContent className="max-w-sm" onInteractOutside={handleBackgroundClick}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LogOut className="w-5 h-5" />
              تأكيد تسجيل الخروج
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              هل أنت متأكد من تسجيل الخروج من النظام؟
            </p>
            
            <div className="flex justify-end space-x-3 space-x-reverse">
              <Button
                variant="outline"
                onClick={handleLogoutCancel}
              >
                إلغاء
              </Button>
              <Button
                onClick={handleLogoutConfirm}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                تسجيل الخروج
              </Button>
            </div>
          </div>
        </CustomDialogContent>
      </Dialog>

      {/* Background Overlay - Prevents interaction with main content */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={handleBackgroundClick}
        onContextMenu={handleBackgroundClick}
        style={{ pointerEvents: 'auto' }}
      />
    </>
  );
}