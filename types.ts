
export type Category = 'A' | 'B' | 'C' | 'D' | 'Critical' | 'Daily' | 'Costume' | 'Inventory' | 'Food' | 'Meetup' | 'Uncertain' | 'Todo';

export interface TodoItem {
  id: string;
  title: string;
  description?: string; // Short AI-generated description
  category: Category;
  date?: string; // ISO string YYYY-MM-DD
  time?: string; // ISO string HH:mm
  isCompleted: boolean;
  progress?: number; // 0, 25, 50, 75, 100
  location?: string;
  priority?: 'High' | 'Medium' | 'Low';
  locked?: boolean; // If true, cannot change category easily (like critical dates)
  suggestedDuration?: number; // in minutes
  timerStartedAt?: number; // timestamp when timer started
}

export const TIME_BASED_CATS: Category[] = ['Critical', 'A', 'B', 'C', 'D'];
export const FUNCTION_BASED_CATS: Category[] = ['Daily', 'Todo', 'Costume', 'Inventory', 'Food', 'Meetup', 'Uncertain'];

export const CATEGORY_LABELS: Record<Category, string> = {
  'Critical': '🔥 超級必要 (無法延後)',
  'Daily': '✅ 每日必做 (00:00 重置)',
  'Todo': '📝 待辦事項 (To-Do)',
  'Costume': '🛠️ 服裝製作 (CCF前完成)',
  'A': '📅 A. 半天以上行程',
  'B': '⏳ B. 3-4 小時短程',
  'C': '💤 C. 放鬆/低消耗',
  'D': '🆓 D. 填補空檔',
  'Inventory': '🎒 必備物品/購物',
  'Food': '🍜 必吃美食',
  'Meetup': '🤝 必約對象',
  'Uncertain': '❓ 待確認行程'
};

// Revised to strictly use c-light (#C5FFF8), c-cyan (#96EFFF), c-sky (#5FBDFF), c-purple (#7B66FF) where applicable
export const CATEGORY_COLORS: Record<Category, string> = {
  'Critical': 'border-l-4 border-red-400 bg-white ring-1 ring-red-100',
  'Daily': 'border-l-4 border-c-purple bg-white ring-1 ring-c-purple/20',
  'Todo': 'border-l-4 border-c-sky bg-white ring-1 ring-c-sky/20',
  'Costume': 'border-l-4 border-emerald-400 bg-white ring-1 ring-emerald-100',
  
  'A': 'border-l-4 border-c-purple bg-white ring-1 ring-c-purple/20',
  'B': 'border-l-4 border-c-sky bg-white ring-1 ring-c-sky/20',
  'C': 'border-l-4 border-c-cyan bg-white ring-1 ring-c-cyan/20',
  'D': 'border-l-4 border-gray-300 bg-white ring-1 ring-gray-200',
  
  'Inventory': 'border-l-4 border-c-cyan bg-white ring-1 ring-c-cyan/30',
  'Food': 'border-l-4 border-pink-400 bg-white ring-1 ring-pink-100',
  'Meetup': 'border-l-4 border-indigo-400 bg-white ring-1 ring-indigo-100',
  'Uncertain': 'border-l-4 border-slate-300 bg-slate-50 ring-1 ring-slate-200'
};

// Specific badge styles for tags - using palette colors
export const CATEGORY_BADGE_STYLES: Record<Category, string> = {
  'Critical': 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100',
  'Daily': 'bg-[#7B66FF]/10 text-c-purple border-c-purple/30 hover:bg-c-purple/20',
  'Todo': 'bg-[#5FBDFF]/10 text-c-sky border-c-sky/30 hover:bg-c-sky/20',
  'Costume': 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100',
  'A': 'bg-[#7B66FF]/10 text-c-purple border-c-purple/30 hover:bg-c-purple/20',
  'B': 'bg-[#5FBDFF]/10 text-c-sky border-c-sky/30 hover:bg-c-sky/20',
  'C': 'bg-[#96EFFF]/20 text-teal-600 border-c-cyan/50 hover:bg-c-cyan/30', 
  'D': 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200',
  'Inventory': 'bg-[#96EFFF]/20 text-teal-600 border-c-cyan/50 hover:bg-c-cyan/30',
  'Food': 'bg-pink-50 text-pink-600 border-pink-200 hover:bg-pink-100',
  'Meetup': 'bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100',
  'Uncertain': 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
};

// Helper for calendar dots
export const CATEGORY_DOT_COLORS: Record<Category, string> = {
  'Critical': 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]',
  'Daily': 'bg-c-purple shadow-[0_0_6px_rgba(123,102,255,0.6)]',
  'Todo': 'bg-c-sky shadow-[0_0_6px_rgba(95,189,255,0.6)]',
  'Costume': 'bg-emerald-500',
  'A': 'bg-c-purple',
  'B': 'bg-c-sky',
  'C': 'bg-c-cyan',
  'D': 'bg-gray-400',
  'Inventory': 'bg-c-cyan',
  'Food': 'bg-pink-400',
  'Meetup': 'bg-indigo-400',
  'Uncertain': 'bg-slate-300'
};
