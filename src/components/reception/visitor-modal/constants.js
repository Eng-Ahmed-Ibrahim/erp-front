import {
  UserOutlined,
  CalendarOutlined,
  DollarOutlined,
  FileTextOutlined,
} from '@ant-design/icons';

export const NATIONALITIES = {
  middleEast: {
    label: 'الشرق الأوسط',
    options: [
      { value: 'مصر', label: 'مصر' },
      { value: 'السعودية', label: 'السعودية' },
      { value: 'الإمارات', label: 'الإمارات' },
      { value: 'الكويت', label: 'الكويت' },
      { value: 'قطر', label: 'قطر' },
      { value: 'البحرين', label: 'البحرين' },
      { value: 'عمان', label: 'عمان' },
      { value: 'اليمن', label: 'اليمن' },
      { value: 'العراق', label: 'العراق' },
      { value: 'سوريا', label: 'سوريا' },
      { value: 'لبنان', label: 'لبنان' },
      { value: 'الأردن', label: 'الأردن' },
      { value: 'فلسطين', label: 'فلسطين' },
    ],
  },
  africa: {
    label: 'أفريقيا',
    options: [
      { value: 'السودان', label: 'السودان' },
      { value: 'ليبيا', label: 'ليبيا' },
      { value: 'تونس', label: 'تونس' },
      { value: 'الجزائر', label: 'الجزائر' },
      { value: 'المغرب', label: 'المغرب' },
      { value: 'الصومال', label: 'الصومال' },
      { value: 'جيبوتي', label: 'جيبوتي' },
      { value: 'أفريقيا أخرى', label: 'دول أفريقية أخرى' },
    ],
  },
  foreign: {
    label: 'أجنبي',
    options: [
      { value: 'أوروبا', label: 'أوروبا' },
      { value: 'أمريكا', label: 'أمريكا' },
      { value: 'آسيا', label: 'آسيا' },
      { value: 'أخرى', label: 'جنسيات أخرى' },
    ],
  },
};

export const STEPS = [
  {
    title: 'بيانات الزائر',
    icon: UserOutlined,
    description: 'المعلومات الشخصية والهوية',
  },
  {
    title: 'تفاصيل الحجز',
    icon: CalendarOutlined,
    description: 'التواريخ والمدة وطريقة الدفع',
  },
  {
    title: 'الوجبات والمنتجات',
    icon: DollarOutlined,
    description: 'الخدمات الإضافية والحساب النهائي وتفاصيل الدفع',
  },
  {
    title: 'المرفقات والملاحظات',
    icon: FileTextOutlined,
    description: 'الملفات والتعليقات الإضافية',
  },
];
