export const CATEGORIES = [
  'قانونية',
  'مالية', 
  'إدارية',
  'مدنية',
  'جنائية',
  'تجارية',
  'أسرية'
] as const;

export const STATUSES = [
  'نشط',
  'مؤرشف',
  'معلق',
  'يحتاج مراجعة'
] as const;

export const ROLES = [
  'admin',
  'archivist',
  'viewer'
] as const;

export const ROLE_LABELS = {
  admin: 'مدير النظام',
  archivist: 'أمين الأرشيف',
  viewer: 'مستعرض'
} as const;

export const STATUS_LABELS = {
  'نشط': 'نشط',
  'مؤرشف': 'مؤرشف',
  'معلق': 'معلق',
  'need revising': 'يحتاج مراجعة'
} as const;

export const STATUS_COLORS = {
  'نشط': 'bg-green-100 text-green-800',
  'مؤرشف': 'bg-gray-100 text-gray-800',
  'معلق': 'bg-yellow-100 text-yellow-800',
  'need revising': 'bg-orange-100 text-orange-800'
} as const;

export const FILE_TYPE_ICONS = {
  pdf: 'fas fa-file-pdf text-red-600',
  doc: 'fas fa-file-word text-blue-600',
  docx: 'fas fa-file-word text-blue-600',
  image: 'fas fa-file-image text-green-600',
  jpg: 'fas fa-file-image text-green-600',
  jpeg: 'fas fa-file-image text-green-600',
  png: 'fas fa-file-image text-green-600',
  default: 'fas fa-file-alt text-purple-600'
} as const;

export const PRIORITY_COLORS = {
  'عالية': 'bg-red-100 text-red-800',
  'متوسطة': 'bg-blue-100 text-blue-800',
  'منخفضة': 'bg-gray-100 text-gray-800'
} as const;
