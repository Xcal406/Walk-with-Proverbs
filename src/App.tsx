import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BookOpen, Calendar, Compass, Flame, Heart, Sparkles, BookMarked, Sun, HelpCircle, Bookmark, Bell, X } from "lucide-react";
import { JournalEntry, UserProgress, ReadingPortion } from "./types";
import { getReadingForDay, allReadings } from "./readingPlan";

// Subcomponents
import TodayWisdom from "./components/TodayWisdom";
import ProgressMap from "./components/ProgressMap";
import SpiritualDiary from "./components/SpiritualDiary";
import WisdomCounselor from "./components/WisdomCounselor";

const PROGRESS_KEY = "proverbs_journal_profile";
const ENTRIES_KEY = "proverbs_journal_entries";

export default function App() {
  const [activeTab, setActiveTab] = useState<"today" | "map" | "diary" | "counselor">("today");
  const [userProgress, setUserProgress] = useState<UserProgress>({
    completedDays: [],
    currentDayIndex: 1,
    favoriteVerses: [],
    streak: 0,
  });
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showRemindToast, setShowRemindToast] = useState(false);

  // Clean-up document element classes on mount if dark theme remains active
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    try {
      localStorage.removeItem("proverbs_journal_theme");
    } catch (err) {
      console.error(err);
    }
  }, []);

  // Monitor daily completed status to notify user if incomplete
  useEffect(() => {
    if (isLoaded) {
      const isTodayCompleted = userProgress.completedDays.includes(userProgress.currentDayIndex);
      if (!isTodayCompleted) {
        // Trigger with a subtle delay to not overlap layout transition
        const timer = setTimeout(() => {
          setShowRemindToast(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    }
  }, [isLoaded, userProgress.completedDays, userProgress.currentDayIndex]);

  // Initialize and load saved state from localStorage
  useEffect(() => {
    try {
      const storedProgress = localStorage.getItem(PROGRESS_KEY);
      const storedEntries = localStorage.getItem(ENTRIES_KEY);

      if (storedProgress) {
        setUserProgress(JSON.parse(storedProgress));
      } else {
        // Initialize active day based on current date if they are new, to make it super seamless!
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 0);
        const diff = now.getTime() - start.getTime();
        const oneDay = 1000 * 60 * 60 * 24;
        const dayOfYear = Math.min(365, Math.max(1, Math.floor(diff / oneDay)));
        
        const initialProgress: UserProgress = {
          completedDays: [],
          currentDayIndex: dayOfYear,
          favoriteVerses: [],
          streak: 0,
        };
        setUserProgress(initialProgress);
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(initialProgress));
      }

      if (storedEntries) {
        setEntries(JSON.parse(storedEntries));
      }
    } catch (err) {
      console.error("Failed to load local storage profile data:", err);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const activePortion = getReadingForDay(userProgress.currentDayIndex);
  const currentEntry = entries.find((e) => e.dayIndex === userProgress.currentDayIndex);

  // Save changes to localStorage on state changes
  const saveUserData = (nextProgress: UserProgress, nextEntries: JournalEntry[]) => {
    setUserProgress(nextProgress);
    setEntries(nextEntries);
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(nextProgress));
    localStorage.setItem(ENTRIES_KEY, JSON.stringify(nextEntries));
  };

  // Streaking tracking logic
  const calculateUpdatedStreak = (lastDateStr?: string, currentStreak: number = 0): number => {
    if (!lastDateStr) return 1;

    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    
    const lastDate = new Date(lastDateStr);
    lastDate.setHours(0, 0, 0, 0);

    const diffTime = Math.abs(todayDate.getTime() - lastDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      // Saved another entry today, retain current streak
      return currentStreak || 1;
    } else if (diffDays === 1) {
      // Met consecutive standard, increment
      return currentStreak + 1;
    } else {
      // Broke standard sequence, reset
      return 1;
    }
  };

  // Submit/Update the today reflection entry
  const handleSaveTodayEntry = (content: string, aiReflection?: string) => {
    const todayISO = new Date().toISOString();
    const todayDateOnly = todayISO.split("T")[0];

    // Check if modifying or inserting a completely new entry
    const existingIndex = entries.findIndex((e) => e.dayIndex === userProgress.currentDayIndex);
    let updatedEntries = [...entries];
    
    let nextStreak = userProgress.streak;
    
    if (existingIndex >= 0) {
      // Modify
      updatedEntries[existingIndex] = {
        ...updatedEntries[existingIndex],
        content: content,
        aiReflection: aiReflection || updatedEntries[existingIndex].aiReflection,
        date: todayISO,
      };
    } else {
      // Insert new
      const newEntry: JournalEntry = {
        id: `entry_${userProgress.currentDayIndex}_${Date.now()}`,
        dayIndex: userProgress.currentDayIndex,
        reference: activePortion.reference,
        keyTheme: activePortion.theme,
        promptQuestion: activePortion.defaultPrompt,
        content: content,
        aiReflection: aiReflection,
        date: todayISO,
      };
      updatedEntries.push(newEntry);
      
      // Since it's a completely new daily log, increment streak
      nextStreak = calculateUpdatedStreak(userProgress.lastReadDate, userProgress.streak);
    }

    // Add day Index to completed list
    let updatedCompleted = [...userProgress.completedDays];
    if (!updatedCompleted.includes(userProgress.currentDayIndex)) {
      updatedCompleted.push(userProgress.currentDayIndex);
    }

    const nextProgress: UserProgress = {
      ...userProgress,
      completedDays: updatedCompleted,
      streak: nextStreak,
      lastReadDate: todayDateOnly,
    };

    saveUserData(nextProgress, updatedEntries);
  };

  // Update a past entry inline from the Diary Feed panel
  const handleUpdatePastEntry = (dayIndex: number, newContent: string) => {
    const updatedEntries = entries.map((e) => {
      if (e.dayIndex === dayIndex) {
        return { ...e, content: newContent };
      }
      return e;
    });
    saveUserData({ ...userProgress }, updatedEntries);
  };

  // Remove a diary entry completely
  const handleDeleteEntry = (dayIndex: number) => {
    const updatedEntries = entries.filter((e) => e.dayIndex !== dayIndex);
    const updatedCompleted = userProgress.completedDays.filter((d) => d !== dayIndex);

    const nextProgress: UserProgress = {
      ...userProgress,
      completedDays: updatedCompleted,
    };

    saveUserData(nextProgress, updatedEntries);
  };

  // Bookmarking favorites
  const handleToggleFavorite = (ref: string) => {
    let updatedFavs = [...userProgress.favoriteVerses];
    if (updatedFavs.includes(ref)) {
      updatedFavs = updatedFavs.filter((f) => f !== ref);
    } else {
      updatedFavs.push(ref);
    }

    const nextProgress: UserProgress = {
      ...userProgress,
      favoriteVerses: updatedFavs,
    };

    saveUserData(nextProgress, entries);
  };

  // Quick navigation vectors (next day / prev day)
  const handleNavigateDay = (direction: "prev" | "next") => {
    let nextIndex = userProgress.currentDayIndex;
    if (direction === "prev") {
      nextIndex = Math.max(1, nextIndex - 1);
    } else {
      nextIndex = Math.min(365, nextIndex + 1);
    }

    const nextProgress: UserProgress = {
      ...userProgress,
      currentDayIndex: nextIndex,
    };

    saveUserData(nextProgress, entries);
  };

  // Jump to specific day index from external matrices
  const handleSelectDayIndex = (dayIndex: number) => {
    const nextProgress: UserProgress = {
      ...userProgress,
      currentDayIndex: dayIndex,
    };
    saveUserData(nextProgress, entries);
    setActiveTab("today"); // Auto focus workspace view
  };

  // Master wipe/reboot
  const handleClearAllProgress = () => {
    localStorage.removeItem(PROGRESS_KEY);
    localStorage.removeItem(ENTRIES_KEY);
    
    // Default boot setup
    setUserProgress({
      completedDays: [],
      currentDayIndex: 1,
      favoriteVerses: [],
      streak: 0,
    });
    setEntries([]);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-linen-50 flex flex-col items-center justify-center">
        <Sun className="w-8 h-8 animate-spin text-sage-600 mb-2" />
        <span className="font-mono text-xs font-semibold text-stone-500">Unlocking Daily Sages...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linen-50 flex flex-col font-sans select-text">
      
      {/* 1. TOP HEADER NAVIGATION FRAME */}
      <header className="sticky top-0 bg-linen-100/90 backdrop-blur-md border-b border-linen-200 z-40 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo Heading (Aesthetic typography) */}
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-sage-600 flex items-center justify-center text-white shadow">
              <Sun className="w-5 h-5" />
            </span>
            <div>
              <span className="font-mono text-[9px] uppercase tracking-widest text-sage-605 font-bold block mb-0.5">
                Spiritual Character Growth
              </span>
              <h1 className="text-base font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
                Daily Proverbs Journal
                <span className="font-serif italic font-medium text-xs text-stone-505">
                  — Annual Walk
                </span>
              </h1>
            </div>
          </div>

          {/* Right side controls: Tabs navigation list */}
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <nav className="flex items-center gap-1.5 bg-linen-200 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab("today")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "today"
                    ? "bg-white text-stone-900 shadow-sm"
                    : "text-stone-500 hover:text-stone-805 hover:bg-white/40"
                }`}
                id="tab_today"
              >
                <BookOpen className="w-4 h-4" />
                <span>Today's Wisdom</span>
              </button>
              
              <button
                onClick={() => setActiveTab("map")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "map"
                    ? "bg-white text-stone-900 shadow-sm"
                    : "text-stone-500 hover:text-stone-805 hover:bg-white/40"
                }`}
                id="tab_map"
              >
                <Flame className="w-4 h-4" />
                <span>Year Matrix</span>
              </button>

              <button
                onClick={() => setActiveTab("diary")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "diary"
                    ? "bg-white text-stone-900 shadow-sm"
                    : "text-stone-500 hover:text-stone-800 hover:bg-white/40"
                }`}
                id="tab_diary"
              >
                <Calendar className="w-4 h-4" />
                <span>Spiritual Diary</span>
              </button>

              <button
                onClick={() => setActiveTab("counselor")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "counselor"
                    ? "bg-white text-stone-900 shadow-sm"
                    : "text-stone-500 hover:text-stone-800 hover:bg-white/40"
                }`}
                id="tab_counselor"
              >
                <Compass className="w-4 h-4" />
                <span>Consult Sage</span>
              </button>
            </nav>
          </div>

        </div>
      </header>

      {/* 1.5 DYNAMIC STUDY PROGRESS BAR */}
      <div className="bg-linen-100 border-b border-linen-200 py-3 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex-shrink-0 inline-block w-2 h-2 rounded-full bg-sage-600 animate-pulse" />
            <span className="font-mono text-[10px] font-bold text-stone-600 uppercase tracking-wider flex items-center gap-2">
              Annual Path Completion:
              <span className="text-stone-800 font-extrabold font-sans text-xs">
                {userProgress.completedDays.length} of 365 Days
              </span>
            </span>
          </div>
          <div className="flex-grow sm:max-w-md w-full flex items-center gap-3">
            <div className="flex-grow h-2 bg-linen-200 rounded-full overflow-hidden relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(1, (userProgress.completedDays.length / 365) * 100)}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-sage-600 rounded-full"
              />
            </div>
            <span className="font-mono text-xs font-bold text-sage-600 shrink-0">
              {Math.round((userProgress.completedDays.length / 365) * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* 2. CORE DISPLAY CONTENT VIEWPORT */}
      <main className="flex-grow py-8 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab + "_" + userProgress.currentDayIndex}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            {activeTab === "today" && (
              <TodayWisdom
                portion={activePortion}
                userProgress={userProgress}
                onSaveEntry={handleSaveTodayEntry}
                onToggleFavorite={handleToggleFavorite}
                onNavigateDay={handleNavigateDay}
                existingEntry={currentEntry}
              />
            )}

            {activeTab === "map" && (
              <ProgressMap
                userProgress={userProgress}
                activeDayIndex={userProgress.currentDayIndex}
                onSelectDay={handleSelectDayIndex}
                onClearProgress={handleClearAllProgress}
              />
            )}

            {activeTab === "diary" && (
              <SpiritualDiary
                entries={entries}
                userProgress={userProgress}
                onSelectDay={handleSelectDayIndex}
                onUpdateEntry={handleUpdatePastEntry}
                onDeleteEntry={handleDeleteEntry}
              />
            )}

            {activeTab === "counselor" && (
              <WisdomCounselor apiKeyExists={true} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* 3. MINIMAL MUTED SACRED FOOTER */}
      <footer className="border-t border-linen-200 bg-linen-100 py-6 mt-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="font-serif italic text-xs text-stone-500">
            "Instruction is a fountain of life to those who possess it." — Proverbs 16:22
          </p>
          <div className="mt-2.5 flex items-center justify-center gap-1 text-[10px] font-mono font-semibold text-stone-400 uppercase tracking-widest">
            <span>May knowledge and discretion guard your path today.</span>
          </div>
        </div>
      </footer>

      {/* DAILY REMINDER TOAST */}
      <AnimatePresence>
        {showRemindToast && !userProgress.completedDays.includes(userProgress.currentDayIndex) && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-white border border-linen-200 shadow-2xl rounded-2xl p-4 flex gap-4 select-none"
            id="reminder_toast"
          >
            <div className="w-10 h-10 rounded-xl bg-linen-100 border border-linen-200 flex items-center justify-center shrink-0 text-sage-600">
              <Bell className="w-5 h-5 animate-[bounce_2.5s_infinite]" />
            </div>
            
            <div className="flex-grow min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-[9px] font-bold text-sage-600 uppercase tracking-widest">
                  Daily Habit Reminder
                </span>
                <button 
                  onClick={() => setShowRemindToast(false)}
                  className="text-sage-200 hover:text-stone-800 p-0.5 rounded transition-colors cursor-pointer"
                  title="Dismiss Reminder"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <h4 className="text-xs font-bold text-stone-850 tracking-tight leading-tight mb-1">
                Reflection Pending
              </h4>
              <p className="text-[11px] text-stone-600 leading-normal mb-3">
                Day {userProgress.currentDayIndex} Proverbs reading is waiting for your insight. Keep your streak alive!
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setActiveTab("today");
                    setShowRemindToast(false);
                  }}
                  className="px-3 py-1.5 bg-sage-600 hover:bg-sage-700 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer shadow-sm"
                >
                  Reflect Now
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
