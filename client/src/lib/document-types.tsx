import React from 'react';
import {
  Scale,
  Gavel,
  Handshake,
  Users,
  Building,
  Home,
  Shield,
  Globe,
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  File,
  Clock,
  CheckCircle,
  XCircle,
  Archive,
  AlertCircle,
} from "@/lib/icons";
import { CircleDollarSign } from 'lucide-react';

// Legal Document Type Configuration
export interface DocumentTypeConfig {
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  borderColor: string;
  hoverColor: string;
  label: string;
  description: string;
}

// Legal Case Types - using Arabic keys to match constants.ts
export const LegalCaseTypes: Record<string, DocumentTypeConfig> = {
  'قانونية': {
    icon: Scale,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    hoverColor: 'hover:bg-blue-100',
    label: 'قانونية',
    description: 'وثائق قانونية عامة'
  },
  'مالية': {
    icon: CircleDollarSign,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    hoverColor: 'hover:bg-green-100',
    label: 'مالية',
    description: 'وثائق مالية ومحاسبية'
  },
  'إدارية': {
    icon: Building,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    hoverColor: 'hover:bg-orange-100',
    label: 'إدارية',
    description: 'وثائق إدارية وتنظيمية'
  },
  'مدنية': {
    icon: Scale,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    hoverColor: 'hover:bg-blue-100',
    label: 'مدنية',
    description: 'قضايا تتعلق بالحقوق المدنية والالتزامات'
  },
  'جنائية': {
    icon: Gavel,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    hoverColor: 'hover:bg-red-100',
    label: 'جنائية',
    description: 'قضايا تتعلق بالجرائم والعقوبات'
  },
  'تجارية': {
    icon: Handshake,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    hoverColor: 'hover:bg-green-100',
    label: 'تجارية',
    description: 'قضايا تتعلق بالأعمال التجارية والاستثمار'
  },
  'أسرية': {
    icon: Users,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    hoverColor: 'hover:bg-purple-100',
    label: 'أسرية',
    description: 'قضايا تتعلق بالأسرة والزواج والطلاق'
  },
  // Keep English keys as fallbacks for backward compatibility
  civil: {
    icon: Scale,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    hoverColor: 'hover:bg-blue-100',
    label: 'القضايا المدنية',
    description: 'قضايا تتعلق بالحقوق المدنية والالتزامات'
  },
  criminal: {
    icon: Gavel,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    hoverColor: 'hover:bg-red-100',
    label: 'القضايا الجنائية',
    description: 'قضايا تتعلق بالجرائم والعقوبات'
  },
  commercial: {
    icon: Handshake,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    hoverColor: 'hover:bg-green-100',
    label: 'القضايا التجارية',
    description: 'قضايا تتعلق بالأعمال التجارية والاستثمار'
  },
  family: {
    icon: Users,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    hoverColor: 'hover:bg-purple-100',
    label: 'القضايا العائلية',
    description: 'قضايا تتعلق بالأسرة والزواج والطلاق'
  },
  administrative: {
    icon: Building,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    hoverColor: 'hover:bg-orange-100',
    label: 'القضايا الإدارية',
    description: 'قضايا تتعلق بالإدارة العامة والموظفين'
  },
  labor: {
    icon: Users,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    hoverColor: 'hover:bg-indigo-100',
    label: 'القضايا العمالية',
    description: 'قضايا تتعلق بحقوق العمال والعمالة'
  },
  realEstate: {
    icon: Home,
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    hoverColor: 'hover:bg-teal-100',
    label: 'قضايا العقارات',
    description: 'قضايا تتعلق بالعقارات والملكية'
  },
  tax: {
    icon: File,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    hoverColor: 'hover:bg-yellow-100',
    label: 'القضايا الضريبية',
    description: 'قضايا تتعلق بالضرائب والرسوم'
  },
  constitutional: {
    icon: Shield,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    hoverColor: 'hover:bg-gray-100',
    label: 'القضايا الدستورية',
    description: 'قضايا تتعلق بالدستور والحقوق الأساسية'
  },
  international: {
    icon: Globe,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    hoverColor: 'hover:bg-cyan-100',
    label: 'القضايا الدولية',
    description: 'قضايا تتعلق بالقانون الدولي'
  }
};

// Document Status Types
export const DocumentStatusTypes: Record<string, DocumentTypeConfig> = {
  pending: {
    icon: Clock,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    hoverColor: 'hover:bg-orange-100',
    label: 'في الانتظار',
    description: 'وثيقة في انتظار المراجعة'
  },
  approved: {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    hoverColor: 'hover:bg-green-100',
    label: 'معتمدة',
    description: 'وثيقة معتمدة ومقبولة'
  },
  rejected: {
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    hoverColor: 'hover:bg-red-100',
    label: 'مرفوضة',
    description: 'وثيقة مرفوضة'
  },
  archived: {
    icon: Archive,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    hoverColor: 'hover:bg-gray-100',
    label: 'مؤرشفة',
    description: 'وثيقة مؤرشفة'
  },
  draft: {
    icon: FileText,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    hoverColor: 'hover:bg-blue-100',
    label: 'مسودة',
    description: 'وثيقة في مرحلة المسودة'
  },
  published: {
    icon: File,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    hoverColor: 'hover:bg-purple-100',
    label: 'منشورة',
    description: 'وثيقة منشورة ومتاحة للعامة'
  },
  // New status types
  'need revising': {
    icon: AlertCircle,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    hoverColor: 'hover:bg-orange-100',
    label: 'يحتاج مراجعة',
    description: 'وثيقة تحتاج إلى مراجعة وتحديث'
  },
  // Arabic equivalents
  'نشط': {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    hoverColor: 'hover:bg-green-100',
    label: 'نشط',
    description: 'وثيقة نشطة ومتاحة للاستخدام'
  },
  'مؤرشف': {
    icon: Archive,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    hoverColor: 'hover:bg-gray-100',
    label: 'مؤرشف',
    description: 'وثيقة مؤرشفة'
  },
  'معلق': {
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    hoverColor: 'hover:bg-yellow-100',
    label: 'معلق',
    description: 'وثيقة معلقة في انتظار إجراء'
  }
};

// File Type Icons
export const FileTypeIcons: Record<string, DocumentTypeConfig> = {
  pdf: {
    icon: File,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    hoverColor: 'hover:bg-red-100',
    label: 'PDF',
    description: 'ملف PDF'
  },
  word: {
    icon: FileText,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    hoverColor: 'hover:bg-blue-100',
    label: 'Word',
    description: 'ملف Microsoft Word'
  },
  excel: {
    icon: File,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    hoverColor: 'hover:bg-green-100',
    label: 'Excel',
    description: 'ملف Microsoft Excel'
  },
  powerpoint: {
    icon: File,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    hoverColor: 'hover:bg-orange-100',
    label: 'PowerPoint',
    description: 'ملف Microsoft PowerPoint'
  },
  image: {
    icon: FileImage,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    hoverColor: 'hover:bg-purple-100',
    label: 'صورة',
    description: 'ملف صورة'
  },
  video: {
    icon: FileVideo,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    hoverColor: 'hover:bg-pink-100',
    label: 'فيديو',
    description: 'ملف فيديو'
  },
  audio: {
    icon: FileAudio,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    hoverColor: 'hover:bg-indigo-100',
    label: 'صوت',
    description: 'ملف صوتي'
  },
  archive: {
    icon: Archive,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    hoverColor: 'hover:bg-gray-100',
    label: 'أرشيف',
    description: 'ملف مضغوط'
  },
  default: {
    icon: File,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    hoverColor: 'hover:bg-gray-100',
    label: 'ملف',
    description: 'ملف عام'
  }
};

// Document Priority Types
export const DocumentPriorityTypes: Record<string, DocumentTypeConfig> = {
  low: {
    icon: Clock,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    hoverColor: 'hover:bg-gray-100',
    label: 'منخفضة',
    description: 'أولوية منخفضة'
  },
  medium: {
    icon: AlertCircle,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    hoverColor: 'hover:bg-yellow-100',
    label: 'متوسطة',
    description: 'أولوية متوسطة'
  },
  high: {
    icon: AlertCircle,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    hoverColor: 'hover:bg-orange-100',
    label: 'عالية',
    description: 'أولوية عالية'
  },
  urgent: {
    icon: AlertCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    hoverColor: 'hover:bg-red-100',
    label: 'عاجلة',
    description: 'أولوية عاجلة'
  }
};

// Utility Functions
export const getDocumentTypeConfig = (type: string, category: 'case' | 'status' | 'file' | 'priority' = 'case'): DocumentTypeConfig => {
  switch (category) {
    case 'case':
      return LegalCaseTypes[type] || {
        icon: FileText,
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
        hoverColor: 'hover:bg-gray-100',
        label: type || 'غير محدد',
        description: 'فئة غير محددة'
      };
    case 'status':
      return DocumentStatusTypes[type] || DocumentStatusTypes.pending;
    case 'file':
      return FileTypeIcons[type] || FileTypeIcons.default;
    case 'priority':
      return DocumentPriorityTypes[type] || DocumentPriorityTypes.medium;
    default:
      return {
        icon: FileText,
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
        hoverColor: 'hover:bg-gray-100',
        label: type || 'غير محدد',
        description: 'فئة غير محددة'
      };
  }
};

export const getFileTypeFromExtension = (filename: string): string => {
  const extension = filename.split('.').pop()?.toLowerCase();
  
  const typeMap: Record<string, string> = {
    'pdf': 'pdf',
    'doc': 'word',
    'docx': 'word',
    'xls': 'excel',
    'xlsx': 'excel',
    'ppt': 'powerpoint',
    'pptx': 'powerpoint',
    'jpg': 'image',
    'jpeg': 'image',
    'png': 'image',
    'gif': 'image',
    'bmp': 'image',
    'mp4': 'video',
    'avi': 'video',
    'mov': 'video',
    'mp3': 'audio',
    'wav': 'audio',
    'zip': 'archive',
    'rar': 'archive',
    '7z': 'archive'
  };
  
  return typeMap[extension || ''] || 'default';
};

// Document Type Badge Component
export const DocumentTypeBadge: React.FC<{
  type: string;
  category: 'case' | 'status' | 'file' | 'priority';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}> = ({ type, category, size = 'md', showLabel = true, className = '' }) => {
  const config = getDocumentTypeConfig(type, category);
  const IconComponent = config.icon;
  
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base'
  };
  
  return (
    <div className={`inline-flex items-center space-x-2 space-x-reverse ${className}`}>
      <div className={`${sizeClasses[size]} ${config.bgColor} ${config.borderColor} border rounded-lg flex items-center justify-center`}>
        <IconComponent className={`w-4 h-4 ${config.color}`} />
      </div>
      {showLabel && (
        <span className={`text-sm font-medium ${config.color}`}>
          {config.label}
        </span>
      )}
    </div>
  );
};

// Document Type Card Component
export const DocumentTypeCard: React.FC<{
  type: string;
  category: 'case' | 'status' | 'file' | 'priority';
  title: string;
  description?: string;
  onClick?: () => void;
  className?: string;
}> = ({ type, category, title, description, onClick, className = '' }) => {
  const config = getDocumentTypeConfig(type, category);
  const IconComponent = config.icon;
  
  return (
    <div 
      className={`p-4 rounded-xl border-2 ${config.borderColor} ${config.bgColor} ${config.hoverColor} transition-all duration-200 cursor-pointer hover:shadow-md ${className}`}
      onClick={onClick}
    >
      <div className="flex items-center space-x-3 space-x-reverse">
        <div className={`w-12 h-12 ${config.bgColor} rounded-xl flex items-center justify-center shadow-sm`}>
          <IconComponent className={`w-6 h-6 ${config.color}`} />
        </div>
        <div className="flex-1">
          <h3 className={`font-semibold ${config.color}`}>{title}</h3>
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
};
