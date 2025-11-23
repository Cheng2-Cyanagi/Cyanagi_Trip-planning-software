import { HashRouter } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")).render(
  <HashRouter>
    <App />
  </HashRouter>
);

import React, { useState, useEffect, useRef } from 'react';
import { CATEGORY_LABELS, Category, TodoItem } from './types';
import { INITIAL_DATA } from './data';
import ItemCard from './components/ItemCard';
import EditModal from './components/EditModal';
import CalendarView from './components/CalendarView';
import { 
  LayoutDashboard, 
  Calendar as CalendarIcon, 
  ListChecks, 
  Shuffle, 
  Plus, 
  Search, 
  ShoppingBag, 
  Users,
  Clock,
  MapPin,
  X,
  Dices,
  CheckCircle2,
  Loader2,
  Utensils,
  ClipboardList,
  Info,
  Trash2
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';

// ==================================================================
// 👇👇👇【請在此處替換您的 LOGO 照片連結】👇👇👇
// ==================================================================
const LOGO_URL = "https://i.ibb.co/dJ5nR4KM/avatar-jpg.png"; 
// 建議使用正方形圖片，連結結尾通常是 .png 或 .jpg
// 👆👆👆=============================================================

type Tab = 'dashboard' | 'calendar' | 'lists' | 'inventory';

interface ToastMsg {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

const BackgroundBlobs = () => (
  <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-c-cyan/30 rounded-full blur-3xl animate-blob mix-blend-multiply filter opacity-60"></div>
    <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-c-purple/20 rounded-full blur-3xl animate-blob animation-delay-2000 mix-blend-multiply filter opacity-60"></div>
    <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[60%] bg-c-sky/20 rounded-full blur-3xl animate-blob animation-delay-4000 mix-blend-multiply filter opacity-60"></div>
    <style>{`
      @keyframes blob {
        0% { transform: translate(0px, 0px) scale(1); }
        33% { transform: translate(30px, -50px) scale(1.1); }
        66% { transform: translate(-20px, 20px) scale(0.9); }
        100% { transform: translate(0px, 0px) scale(1); }
      }
      .animate-blob { animation: blob 7s infinite; }
      .animation-delay-2000 { animation-delay: 2s; }
      .animation-delay-4000 { animation-delay: 4s; }
    `}</style>
  </div>
);

const QuickNav = ({ activeTab, onScrollTo }: { activeTab: Tab, onScrollTo: (id: string) => void }) => {
  if (activeTab !== 'dashboard') return null;
  
  const navItems = [
    { id: 'section-daily', label: '每日' },
    { id: 'section-todo', label: '待辦' },
    { id: 'section-critical', label: '緊急' },
    { id: 'section-costume', label: '服裝' },
    { id: 'section-A', label: 'A 長時' },
    { id: 'section-B', label: 'B 短程' },
    { id: 'section-C', label: 'C 放鬆' },
    { id: 'section-D', label: 'D 填補' },
  ];

  return (
    <div className="sticky top-[88px] z-20 py-2 -mx-4 px-4 overflow-x-auto scrollbar-hide flex items-center gap-2 bg-gradient-to-b from-c-light/95 to-transparent mask-image-linear-to-b pb-4">
      {navItems.map(item => (
        <button
          key={item.id}
          onClick={() => onScrollTo(item.id)}
          className="flex-shrink-0 px-3 py-1.5 bg-white/70 backdrop-blur-md border border-white/60 rounded-full text-xs font-bold text-gray-600 shadow-sm hover:bg-c-purple hover:text-white transition-all active:scale-95 whitespace-nowrap hover:shadow-c-purple/20 hover:shadow-md"
        >
          {item.label}
        </button>
      ))}
    </div>
  );
};

function App() {
  const [items, setItems] = useState<TodoItem[]>(() => {
    const saved = localStorage.getItem('qing_items');
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TodoItem | undefined>(undefined);
  const [initialModalDate, setInitialModalDate] = useState<string | null>(null);
  
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
  const [randomResult, setRandomResult] = useState<string | null>(null);
  const [highlightedItemId, setHighlightedItemId] = useState<string | null>(null);

  const [toasts, setToasts] = useState<ToastMsg[]>([]);

  useEffect(() => {
    localStorage.setItem('qing_items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const lastReset = localStorage.getItem('last_reset_date');
    const today = new Date().toDateString();
    
    if (lastReset !== today) {
      setItems(prev => prev.map(item => 
        item.category === 'Daily' ? { ...item, isCompleted: false } : item
      ));
      localStorage.setItem('last_reset_date', today);
      if (lastReset) showToast('每日行程已重置', 'info');
    }
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    const id = uuidv4();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const toggleItem = (id: string) => {
    setItems(prev => prev.map(i => {
      if (i.id === id) {
        const nextCompleted = !i.isCompleted;
        if (nextCompleted) showToast('行程完成！', 'success');
        return { 
          ...i, 
          isCompleted: nextCompleted,
          timerStartedAt: nextCompleted ? undefined : i.timerStartedAt
        };
      }
      return i;
    }));
  };

  const updateProgress = (id: string, val: number) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, progress: val, isCompleted: val === 100 } : i));
    if (val === 100) showToast('進度 100% 達成！', 'success');
  };

  const deleteItem = (id: string) => {
    if(confirm('確定要刪除此項目嗎？')) {
      setItems(prev => prev.filter(i => i.id !== id));
      showToast('項目已刪除', 'error');
    }
  };

  const changeCategory = (id: string, newCategory: Category) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, category: newCategory } : i));
    showToast(`分類已變更為 ${CATEGORY_LABELS[newCategory].split(' ')[0]}`, 'info');
  };

  const handleTimerToggle = (id: string) => {
    let isStarting = false;
    setItems(prev => prev.map(i => {
      if (i.id === id) {
        if (i.timerStartedAt) {
          return { ...i, timerStartedAt: undefined };
        } else {
          isStarting = true;
          return { ...i, timerStartedAt: Date.now() };
        }
      }
      return i;
    }));
    showToast(isStarting ? '計時開始 ⏳' : '計時停止', 'info');
  };

  const handleSave = (data: Partial<TodoItem>) => {
    const cleanDate = data.date === '' ? undefined : data.date;
    const cleanTime = data.time === '' ? undefined : data.time;

    if (editingItem) {
      setItems(prev => prev.map(i => i.id === editingItem.id ? { ...i, ...data, date: cleanDate, time: cleanTime } as TodoItem : i));
      showToast('變更已儲存', 'success');
    } else {
      const newItem: TodoItem = {
        id: uuidv4(),
        title: data.title || '新項目',
        category: data.category || 'D',
        isCompleted: false,
        progress: 0,
        description: data.description,
        date: cleanDate,
        time: cleanTime,
        location: data.location,
        suggestedDuration: data.suggestedDuration
      };
      setItems(prev => [...prev, newItem]);
      showToast('新行程已新增', 'success');
    }
    setEditingItem(undefined);
    setInitialModalDate(null);
    setIsModalOpen(false);
  };

  const openEdit = (item?: TodoItem) => {
    setEditingItem(item);
    setInitialModalDate(null);
    setIsModalOpen(true);
  };

  const openNewWithDate = (date: string) => {
    setEditingItem(undefined);
    setInitialModalDate(date);
    setIsModalOpen(true);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.pageYOffset - 145;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const handleDateClick = (date: string) => {
    setSelectedDate(date);
  };

  const closeDateDetail = () => {
    setSelectedDate(null);
  };

  const pickRandom = (category?: Category) => {
    let candidates = items.filter(i => !i.isCompleted);
    if (category) candidates = candidates.filter(i => i.category === category);
    
    if (candidates.length === 0) {
      showToast('該類別已全部完成或無行程！', 'info');
      return;
    }
    
    setRandomResult("🎲 正在抽籤...");
    
    setTimeout(() => {
      const winner = candidates[Math.floor(Math.random() * candidates.length)];
      
      setRandomResult(`✨ 命運決定：${winner.title}`);
      setHighlightedItemId(winner.id);

      if (['Inventory', 'Food', 'Meetup'].includes(winner.category)) {
        setActiveTab('inventory');
      } else {
        setActiveTab('dashboard');
      }

      setTimeout(() => {
        const el = document.getElementById(`item-${winner.id}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);

      setTimeout(() => {
        setRandomResult(null);
        setHighlightedItemId(null);
      }, 4000);
    }, 600);
  };

  const filteredItems = items.filter(i => 
    i.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) || 
    i.description?.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
  );
  
  const getCategoryList = (cats: Category[]) => filteredItems.filter(i => cats.includes(i.category));

  const renderDashboard = () => (
    <div className="space-y-6 pb-28">
      <div className="flex justify-between items-end px-2 mb-2">
         <div className="flex flex-col">
           <span className="text-c-purple font-black text-5xl font-mono tracking-tighter drop-shadow-sm leading-none">
             {format(currentTime, 'HH:mm')}
           </span>
           <span className="text-gray-500 text-sm font-bold mt-1 pl-1">
             {format(currentTime, 'MM 月 dd 日 EEEE', { locale: zhTW })}
           </span>
         </div>
         <div className="text-right bg-white/60 backdrop-blur-sm px-3 py-1 rounded-xl border border-white/50 shadow-sm">
           <span className="font-bold text-gray-600 flex items-center gap-1 text-sm">
             <MapPin size={14} className="text-c-sky fill-sky-100"/> 台灣
           </span>
         </div>
      </div>

      <QuickNav activeTab={activeTab} onScrollTo={scrollToSection} />

      <div className="bg-gradient-to-br from-c-purple via-[#8A77FF] to-c-sky p-6 rounded-[2.5rem] text-white shadow-2xl shadow-c-purple/30 relative overflow-hidden group border border-white/20 transform transition-transform hover:scale-[1.01]">
        <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4 rotate-12 transition-transform duration-1000 group-hover:rotate-45">
           <Clock size={200} />
        </div>
        <div className="relative z-10">
          <h1 className="text-xl font-bold mb-6 opacity-90 tracking-wide">2026 靑凪旅程紀錄</h1>
          <div className="flex items-end gap-2 mb-2">
            <span className="text-6xl font-mono font-black tracking-tighter">
              {Math.round((items.filter(i => i.isCompleted).length / items.length) * 100 || 0)}
            </span>
            <span className="text-2xl font-bold mb-1.5">%</span>
            <span className="text-sm font-medium opacity-80 mb-2 ml-auto bg-white/20 px-2 py-0.5 rounded text-white">已完成進度</span>
          </div>
          <div className="w-full bg-black/20 h-3 rounded-full overflow-hidden backdrop-blur-sm ring-1 ring-white/20">
             <div 
               className="bg-gradient-to-r from-c-light to-white h-full transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(197,255,248,0.5)] relative" 
               style={{ width: `${(items.filter(i => i.isCompleted).length / items.length) * 100}%` }}
             >
               <div className="absolute inset-0 bg-white/30 animate-pulse"/>
             </div>
          </div>
        </div>
      </div>

      <div className="bg-white/60 backdrop-blur-md p-5 rounded-[2rem] border border-white/60 shadow-sm hover:shadow-md transition-shadow">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
          <Dices size={18} className="text-gray-800"/> 隨機行程決策
        </h3>
        <div className="grid grid-cols-6 gap-2">
          {[
            { id: 'A', label: 'A 長時' },
            { id: 'B', label: 'B 短程' },
            { id: 'C', label: 'C 放鬆' },
            { id: 'D', label: 'D 填補' },
            { id: 'Todo', label: '待辦' },
            { id: 'Food', label: '食' },
          ].map(btn => (
            <button
              key={btn.id}
              onClick={() => pickRandom(btn.id as Category)}
              className="flex flex-col items-center justify-center py-3.5 rounded-2xl bg-white border border-gray-200 hover:bg-gray-800 hover:border-gray-800 hover:text-white transition-all active:scale-95 shadow-sm group"
            >
               <span className="text-[10px] font-bold text-gray-700 group-hover:text-white">{btn.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
         <section id="section-daily">
           <div className="flex items-center gap-2 mb-3 text-c-purple font-bold bg-white/80 backdrop-blur w-fit px-4 py-1.5 rounded-full border border-purple-100 shadow-sm mx-auto sm:mx-0">
              <CheckCircle2 size={16}/>
              <span>每日必做 (00:00 重置)</span>
           </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {getCategoryList(['Daily']).map(i => (
              <ItemCard 
                key={i.id} 
                item={i} 
                onToggle={toggleItem} 
                onDelete={deleteItem} 
                onEdit={openEdit} 
                onDateClick={openEdit} 
                onCategoryChange={changeCategory}
                onTimerToggle={handleTimerToggle}
                highlighted={highlightedItemId === i.id}
              />
            ))}
           </div>
         </section>
         
         <section id="section-todo">
           <div className="flex items-center gap-2 mb-3 text-c-sky font-bold bg-white/80 backdrop-blur w-fit px-4 py-1.5 rounded-full border border-sky-100 shadow-sm mx-auto sm:mx-0">
              <ClipboardList size={16}/>
              <span>待辦事項清單</span>
           </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {getCategoryList(['Todo']).length > 0 ? getCategoryList(['Todo']).map(i => (
              <ItemCard 
                key={i.id} 
                item={i} 
                onToggle={toggleItem} 
                onDelete={deleteItem} 
                onEdit={openEdit} 
                onDateClick={openEdit} 
                onCategoryChange={changeCategory}
                onTimerToggle={handleTimerToggle}
                highlighted={highlightedItemId === i.id}
              />
            )) : (
               <div className="text-center p-4 bg-white/30 rounded-xl border border-dashed border-gray-200 text-gray-400 text-xs w-full col-span-full">
                 無待辦事項，好好享受旅程！
               </div>
            )}
           </div>
         </section>

         <section id="section-critical" className="bg-white/40 backdrop-blur-sm rounded-[2rem] p-4 border border-white/50 shadow-sm">
           <div className="flex items-center gap-2 mb-4 text-red-500 font-bold bg-white/80 backdrop-blur w-fit px-4 py-1.5 rounded-full border border-red-100 shadow-sm">
              <span className="animate-pulse">🔥</span>
              <span>超級必要 (不可延後)</span>
           </div>
           <div className="grid grid-cols-1 gap-3">
             {getCategoryList(['Critical']).length > 0 ? (
               getCategoryList(['Critical']).map(i => (
                 <ItemCard 
                    key={i.id} 
                    item={i} 
                    onToggle={toggleItem} 
                    onDelete={deleteItem} 
                    onEdit={openEdit} 
                    onDateClick={openEdit} 
                    onCategoryChange={changeCategory}
                    onTimerToggle={handleTimerToggle}
                    highlighted={highlightedItemId === i.id}
                 />
               ))
             ) : (
               <div className="text-center p-6 bg-white/50 rounded-xl border border-dashed border-gray-300 text-gray-400 text-sm">
                 目前沒有緊急事項，太棒了！
               </div>
             )}
           </div>
         </section>
      </div>

      <section id="section-costume" className="bg-white/60 backdrop-blur-md p-5 rounded-[2rem] border border-white/60 shadow-sm">
        <div className="flex justify-between items-center mb-5 border-b border-gray-200/50 pb-3">
           <h3 className="font-bold text-emerald-700 flex items-center gap-2 text-lg">
             <span>🛠️</span>
             服裝製作進度
           </h3>
           <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-mono font-bold shadow-sm">
              {getCategoryList(['Costume']).filter(i => i.isCompleted).length} / {getCategoryList(['Costume']).length}
           </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {getCategoryList(['Costume']).map(i => (
             <ItemCard 
               key={i.id} 
               item={i} 
               onToggle={toggleItem} 
               onDelete={deleteItem} 
               onEdit={openEdit} 
               onProgressChange={updateProgress} 
               onDateClick={openEdit} 
               onCategoryChange={changeCategory}
               onTimerToggle={handleTimerToggle}
               highlighted={highlightedItemId === i.id}
             />
          ))}
        </div>
      </section>

      <div className="space-y-8">
        {['A', 'B', 'C', 'D', 'Uncertain'].map((cat) => {
           const list = getCategoryList([cat as Category]);
           if (list.length === 0 && debouncedSearchQuery === '') return null;
           
           const label = CATEGORY_LABELS[cat as Category];
           const headerColor = cat === 'A' ? 'text-c-purple border-c-purple' :
                               cat === 'B' ? 'text-c-sky border-c-sky' :
                               cat === 'C' ? 'text-c-cyan border-c-cyan' :
                               'text-gray-500 border-gray-300';
           
           return (
             <section key={cat} id={`section-${cat}`} className="bg-white/40 backdrop-blur-sm rounded-[2rem] p-5 border border-white/50 shadow-sm hover:shadow-md transition-shadow">
               <div className="flex justify-between items-center mb-4">
                 <h3 className={`font-bold border-l-4 pl-3 text-lg ${headerColor}`}>{label}</h3>
                 <button onClick={() => pickRandom(cat as Category)} className="text-[10px] bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-full flex items-center gap-1 hover:bg-gray-800 hover:text-white transition-all active:scale-95 font-bold shadow-sm">
                   <Shuffle size={10}/> 隨機
                 </button>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                 {list.length > 0 ? list.map(i => (
                   <ItemCard 
                     key={i.id} 
                     item={i} 
                     onToggle={toggleItem} 
                     onDelete={deleteItem} 
                     onEdit={openEdit} 
                     onDateClick={openEdit} 
                     onCategoryChange={changeCategory}
                     onTimerToggle={handleTimerToggle}
                     highlighted={highlightedItemId === i.id}
                   />
                 )) : (
                   <div className="text-gray-400 text-center text-sm py-4 col-span-full">無符合項目</div>
                 )}
               </div>
             </section>
           );
        })}
      </div>
    </div>
  );

  const renderCalendar = () => (
    <div className="space-y-6 pb-28">
      <CalendarView items={items} onDateSelect={handleDateClick} />
      
      <div className="bg-white/70 backdrop-blur-md p-6 rounded-[2rem] border border-c-sky/20 shadow-sm">
        <h3 className="font-bold text-gray-600 mb-5 flex items-center gap-2 border-b border-gray-100 pb-3">
          <Clock size={18} className="text-c-sky"/>
          即將到來 (未來5天)
        </h3>
        <div className="space-y-3">
        {items
          .filter(i => i.date && !i.isCompleted && new Date(i.date) >= new Date())
          .sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime())
          .slice(0, 5)
          .map(i => (
            <div key={i.id} onClick={() => openEdit(i)} className="flex justify-between items-center p-4 hover:bg-sky-50/50 rounded-2xl transition cursor-pointer group border border-transparent hover:border-sky-100 bg-white/80 shadow-sm">
              <div className="flex items-center gap-4">
                 <div className="flex flex-col items-center bg-white shadow-sm border border-gray-100 px-4 py-2 rounded-xl text-c-sky min-w-[4rem]">
                    <span className="text-[10px] uppercase font-bold opacity-60 tracking-wider">{format(new Date(i.date!), 'MMM')}</span>
                    <span className="text-2xl font-bold leading-none tracking-tighter">{format(new Date(i.date!), 'dd')}</span>
                 </div>
                 <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-700 group-hover:text-c-sky transition-colors">{i.title}</span>
                    {i.time && <span className="text-xs text-gray-400 flex items-center gap-1"><Clock size={10}/>{i.time}</span>}
                 </div>
              </div>
              <div className={`w-2.5 h-2.5 rounded-full ${i.priority === 'High' || i.category === 'Critical' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'bg-c-cyan'}`}></div>
            </div>
        ))}
        </div>
      </div>
    </div>
  );

  const renderInventory = () => (
    <div className="space-y-8 pb-28">
      <section>
        <div className="flex items-center gap-2 mb-4 text-c-cyan font-bold text-lg bg-white/80 backdrop-blur w-fit px-5 py-2 rounded-full border border-c-cyan/30 shadow-sm">
          <ShoppingBag size={20}/>
          <span className="text-teal-600">背包整理 / 必備物品</span>
        </div>
        <div className="bg-white/50 backdrop-blur-sm p-4 rounded-[2rem] border border-c-cyan/20 shadow-sm">
           {getCategoryList(['Inventory']).map(i => (
             <ItemCard 
               key={i.id} 
               item={i} 
               onToggle={toggleItem} 
               onDelete={deleteItem} 
               onEdit={openEdit} 
               onDateClick={openEdit} 
               onCategoryChange={changeCategory}
               onTimerToggle={handleTimerToggle}
               highlighted={highlightedItemId === i.id}
             />
           ))}
        </div>
      </section>

      <section>
         <div className="flex justify-between items-center mb-4 text-pink-600 font-bold text-lg bg-white/80 backdrop-blur px-5 py-2 rounded-full border border-pink-100 shadow-sm w-full">
            <span className="flex items-center gap-2"><Utensils size={18}/> 必吃美食清單</span>
            <button onClick={() => pickRandom('Food')} className="text-xs bg-pink-500 text-white px-3 py-1.5 rounded-full flex items-center gap-1 shadow-md hover:bg-pink-600 transition-transform active:scale-95 font-bold">
               <Shuffle size={12}/> 吃什麼？
            </button>
         </div>
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
           {getCategoryList(['Food']).map(i => (
             <ItemCard 
               key={i.id} 
               item={i} 
               onToggle={toggleItem} 
               onDelete={deleteItem} 
               onEdit={openEdit} 
               onDateClick={openEdit} 
               onCategoryChange={changeCategory}
               onTimerToggle={handleTimerToggle}
               highlighted={highlightedItemId === i.id}
             />
           ))}
         </div>
      </section>

      <section>
         <div className="flex items-center gap-2 mb-4 text-indigo-600 font-bold text-lg bg-white/80 backdrop-blur w-fit px-5 py-2 rounded-full border border-indigo-100 shadow-sm">
            <Users size={20}/>
            <span>🤝 必約對象 & 任務</span>
         </div>
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
           {getCategoryList(['Meetup']).map(i => (
             <ItemCard 
               key={i.id} 
               item={i} 
               onToggle={toggleItem} 
               onDelete={deleteItem} 
               onEdit={openEdit} 
               onDateClick={openEdit} 
               onCategoryChange={changeCategory}
               onTimerToggle={handleTimerToggle}
               highlighted={highlightedItemId === i.id}
             />
           ))}
         </div>
      </section>
    </div>
  );

  return (
    <div className="min-h-screen max-w-3xl mx-auto relative font-sans overflow-x-hidden">
      <BackgroundBlobs />
      
      <div className="sticky top-0 bg-c-light/85 backdrop-blur-xl p-4 z-30 border-b border-white/30 flex justify-between items-center gap-4 shadow-sm">
        {/* Logo Area */}
        <div className="flex-shrink-0">
          <img 
             src={LOGO_URL} 
             alt="App Logo" 
             className="w-11 h-11 rounded-full border-2 border-white shadow-md object-cover bg-white"
          />
        </div>

        <div className="relative flex-1 group">
          {searchQuery !== debouncedSearchQuery ? (
            <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 text-c-purple animate-spin" size={18} />
          ) : (
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-c-sky group-focus-within:text-c-purple transition-colors" size={18} />
          )}
          <input 
            type="text" 
            placeholder="搜尋行程、物品..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3.5 bg-white/60 border border-white/40 rounded-full text-sm focus:ring-2 focus:ring-c-purple focus:bg-white outline-none transition-all shadow-sm placeholder-gray-400 font-medium"
          />
        </div>
        <button 
          onClick={() => openEdit()}
          className="bg-gradient-to-r from-c-purple to-c-sky text-white p-3.5 rounded-full shadow-lg shadow-c-purple/30 hover:scale-110 transition-all duration-300 active:scale-95 border border-white/20"
          title="新增行程"
        >
          <Plus size={24} />
        </button>
      </div>

      <main className="p-4 pt-2 min-h-screen">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'calendar' && renderCalendar()}
        {activeTab === 'inventory' && renderInventory()}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-white/40 py-3 px-6 pb-safe z-40 max-w-3xl mx-auto shadow-[0_-5px_30px_rgba(197,255,248,0.6)]">
        <div className="flex justify-around items-center">
          <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all duration-300 active:scale-90 ${activeTab === 'dashboard' ? 'text-c-purple bg-[#7B66FF]/10 scale-105 shadow-sm' : 'text-gray-400 hover:text-c-sky hover:bg-gray-50'}`}>
            <LayoutDashboard size={24} />
            <span className="text-[10px] font-bold tracking-wide">總覽</span>
          </button>
          <button onClick={() => setActiveTab('calendar')} className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all duration-300 active:scale-90 ${activeTab === 'calendar' ? 'text-c-purple bg-[#7B66FF]/10 scale-105 shadow-sm' : 'text-gray-400 hover:text-c-sky hover:bg-gray-50'}`}>
            <CalendarIcon size={24} />
            <span className="text-[10px] font-bold tracking-wide">日曆</span>
          </button>
          <button onClick={() => setActiveTab('inventory')} className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all duration-300 active:scale-90 ${activeTab === 'inventory' ? 'text-c-purple bg-[#7B66FF]/10 scale-105 shadow-sm' : 'text-gray-400 hover:text-c-sky hover:bg-gray-50'}`}>
            <ListChecks size={24} />
            <span className="text-[10px] font-bold tracking-wide">清單</span>
          </button>
        </div>
      </nav>

      <EditModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        item={editingItem} 
        onSave={handleSave} 
        initialDate={initialModalDate}
      />

      {selectedDate && (
        <div className="fixed inset-0 bg-c-purple/20 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 animate-in fade-in duration-200 p-0 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl max-h-[85vh] flex flex-col border border-white/50 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-c-light to-c-cyan">
               <div className="flex flex-col">
                 <span className="text-xs text-c-purple font-bold uppercase tracking-wider mb-1">行程規劃</span>
                 <h2 className="text-3xl font-black text-gray-800 tracking-tight">{selectedDate}</h2>
               </div>
               <button onClick={closeDateDetail} className="p-2 hover:bg-white/50 rounded-full transition text-gray-600 active:scale-95">
                 <X size={28}/>
               </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50 scrollbar-hide">
               {items.filter(i => i.date === selectedDate).length > 0 ? (
                 items.filter(i => i.date === selectedDate)
                   .sort((a, b) => (a.time || '24:00').localeCompare(b.time || '24:00'))
                   .map(item => (
                   <ItemCard 
                     key={item.id} 
                     item={item} 
                     onToggle={toggleItem} 
                     onDelete={deleteItem} 
                     onEdit={(i) => {
                        closeDateDetail();
                        openEdit(i);
                     }}
                     onDateClick={openEdit}
                     onCategoryChange={changeCategory}
                     onTimerToggle={handleTimerToggle}
                     highlighted={highlightedItemId === item.id}
                   />
                 ))
               ) : (
                 <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-4">
                    <div className="p-5 bg-white rounded-full shadow-sm border border-gray-100">
                       <CalendarIcon size={48} className="text-c-sky/50"/>
                    </div>
                    <p className="font-medium text-sm">當天尚無安排行程</p>
                 </div>
               )}
            </div>

            <div className="p-5 border-t border-gray-100 bg-white pb-safe">
               <button 
                 onClick={() => {
                   closeDateDetail();
                   openNewWithDate(selectedDate);
                 }}
                 className="w-full py-4 bg-gradient-to-r from-c-purple to-c-sky text-white font-bold rounded-2xl shadow-lg shadow-c-purple/20 hover:scale-[1.02] transition-all active:scale-95 flex justify-center items-center gap-2 text-lg"
               >
                 <Plus size={24}/> 新增當日行程
               </button>
            </div>
          </div>
        </div>
      )}

      {randomResult && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-gray-900/90 backdrop-blur-lg text-white px-6 py-3 rounded-full shadow-2xl z-50 animate-bounce font-bold border border-white/10 flex items-center gap-3 pointer-events-none">
          {randomResult}
        </div>
      )}
      
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 flex flex-col gap-2 z-50 w-full max-w-sm px-4 pointer-events-none">
        {toasts.map(toast => (
          <div 
            key={toast.id}
            className={`animate-in fade-in slide-in-from-bottom-5 duration-300 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl backdrop-blur-md border text-sm font-bold
              ${toast.type === 'success' ? 'bg-emerald-500/90 text-white border-emerald-400' : 
                toast.type === 'error' ? 'bg-red-500/90 text-white border-red-400' : 
                'bg-gray-800/90 text-white border-gray-600'}
            `}
          >
             {toast.type === 'success' && <CheckCircle2 size={18}/>}
             {toast.type === 'error' && <Trash2 size={18}/>}
             {toast.type === 'info' && <Info size={18}/>}
             {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
