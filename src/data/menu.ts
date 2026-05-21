// قائمة لُقمة يُمّه — البيانات الحقيقية
// Built with love by Dr. Mohammed for his mother 💚

export type MenuCategory = 'mains' | 'salads' | 'extras'

export interface MenuItem {
  id: string
  nameAr: string
  nameEn: string
  descAr: string
  price: number
  category: MenuCategory
  emoji: string
}

export const menuItems: MenuItem[] = [
  // الأطباق الرئيسية
  {
    id: 'mahshi',
    nameAr: 'محشي يُمّه',
    nameEn: 'Mahshi — Stuffed Vegetables',
    descAr: 'كوسا وطماطم وفلفلية محشية بالأرز واللحم، طبخ بطيء بحب',
    price: 39,
    category: 'mains',
    emoji: '🌿',
  },
  {
    id: 'kamouniya',
    nameAr: 'كمونية يُمّه',
    nameEn: 'Kamouniya — Cumin Stew',
    descAr: 'يخنة دافية بنكهة الكمون والبهارات، سر جدّاتنا',
    price: 35,
    category: 'mains',
    emoji: '🍲',
  },
  {
    id: 'rejla',
    nameAr: 'رجلة يُمّه',
    nameEn: 'Rejla — Purslane Stew',
    descAr: 'بقلة الرجلة الخضراء، صحة وطعم من الأرض',
    price: 30,
    category: 'mains',
    emoji: '🌱',
  },
  {
    id: 'sarkama',
    nameAr: 'سركمة يُمّه',
    nameEn: 'Sarkama — Potato Qeemah',
    descAr: 'قيمة البطاطس بصلصة طماطم وبصل، يذوب في الفم',
    price: 30,
    category: 'mains',
    emoji: '🥔',
  },
  {
    id: 'malah-rob',
    nameAr: 'ملاح روب (نعيمة)',
    nameEn: 'Malah Rob — Yogurt Malah',
    descAr: 'لبن مطبوخ ناعم، خفيف ومنعش يفتح القلب',
    price: 30,
    category: 'mains',
    emoji: '🥛',
  },
  {
    id: 'mulukhiya',
    nameAr: 'ملوخية يُمّه (خدرة)',
    nameEn: 'Mulukhiyah',
    descAr: 'خضراء حريرية، طازجة مفرومة، مع لمسة ثوم وكزبرة',
    price: 30,
    category: 'mains',
    emoji: '🥬',
  },
  {
    id: 'bamia',
    nameAr: 'بامية يُمّه (دمعة/إيدام)',
    nameEn: 'Bamia — Okra Stew',
    descAr: 'بامية صغيرة بصلصة طماطم غنية، طبق دافي وكلاسيكي',
    price: 30,
    category: 'mains',
    emoji: '🌶️',
  },
  {
    id: 'silq',
    nameAr: 'سلج يُمّه',
    nameEn: 'Silq — Chard Stew',
    descAr: 'سلق أخضر مع البصل والثوم، مذاق أصيل وبسيط',
    price: 30,
    category: 'mains',
    emoji: '🥗',
  },
  {
    id: 'wika',
    nameAr: 'ويكة يُمّه',
    nameEn: 'Wika — Yemeni Okra',
    descAr: 'بامية مجففة مطحونة، نكهة عميقة لا تشبه غيرها',
    price: 30,
    category: 'mains',
    emoji: '🍵',
  },

  // السلطات
  {
    id: 'aswad',
    nameAr: 'سلطة أسود',
    nameEn: 'Aswad — Eggplant Salad',
    descAr: 'باذنجان مشوي مع طحينة وليمون، دخاني ومنعش',
    price: 25,
    category: 'salads',
    emoji: '🍆',
  },
  {
    id: 'salata-rob',
    nameAr: 'سلطة روب',
    nameEn: 'Salata Rob — Cucumber Yogurt',
    descAr: 'خيار بالزبادي والنعناع، بارد ومرافق مثالي',
    price: 23,
    category: 'salads',
    emoji: '🥒',
  },

  // الإضافات
  {
    id: 'shatta',
    nameAr: 'شطة يُمّه',
    nameEn: 'Shatta — Hot Chili Sauce',
    descAr: 'صلصة حارة بيتية، لمسة نار على لقمتك',
    price: 9,
    category: 'extras',
    emoji: '🌶️',
  },
  {
    id: 'kisra',
    nameAr: 'كسرة حبشية',
    nameEn: 'Kisra — Habashi Bread (per piece)',
    descAr: 'خبز حبشي طازج، يخبز على الصاج بالحب',
    price: 2,
    category: 'extras',
    emoji: '🫓',
  },
]

export const WHATSAPP_NUMBER = '966553134696'

export function buildWhatsAppLink(itemNameAr?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`
  if (!itemNameAr) {
    const msg = encodeURIComponent('السلام عليكم 🌿\nأبي أطلب من لُقمة يُمّه، ممكن مساعدة؟')
    return `${base}?text=${msg}`
  }
  const msg = encodeURIComponent(`السلام عليكم 🌿\nأبي أطلب: ${itemNameAr}\nشكراً يُمّه 💚`)
  return `${base}?text=${msg}`
}
