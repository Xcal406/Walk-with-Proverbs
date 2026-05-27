import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  Flame, 
  CheckCircle, 
  Calendar, 
  Trash2, 
  Sparkles, 
  BookOpen, 
  Award,
  ChevronRight,
  HelpCircle,
  AlertTriangle
} from "lucide-react";
import { UserProgress } from "../types";
import { allReadings, getReadingForDay } from "../readingPlan";

interface ProgressMapProps {
  userProgress: UserProgress;
  activeDayIndex: number;
  onSelectDay: (dayIndex: number) => void;
  onClearProgress: () => void;
}

const MONTHS = [
  { name: "January", days: 31 },
  { name: "February", days: 28 },
  { name: "March", days: 31 },
  { name: "April", days: 30 },
  { name: "May", days: 31 },
  { name: "June", days: 30 },
  { name: "July", days: 31 },
  { name: "August", days: 31 },
  { name: "September", days: 30 },
  { name: "October", days: 31 },
  { name: "November", days: 30 },
  { name: "December", days: 31 }
];

export default function ProgressMap({ 
  userProgress, 
  activeDayIndex, 
  onSelectDay, 
  onClearProgress 
}: ProgressMapProps) {
  const [selectedDay, setSelectedDay] = useState<number>(activeDayIndex);
  const [showConfirmReset, setShowConfirmReset] = useState<boolean>(false);

  // Precompute start dayIndex for each month
  let runningIndex = 1;
  const monthData = MONTHS.map(m => {
    const start = runningIndex;
    runningIndex += m.days;
    return {
      name: m.name,
      days: m.days,
      startDayIndex: start
    };
  });

  const selectedReading = getReadingForDay(selectedDay);
  const isSelectedCompleted = userProgress.completedDays.includes(selectedDay);
  const completionPercent = Math.round((userProgress.completedDays.length / 365) * 100);

  const handleDayClick = (dayIndex: number) => {
    setSelectedDay(dayIndex);
    onSelectDay(dayIndex);
  };

  return (
    <div className="flex flex-col gap-8">
      
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Streak card (line 49 placeholder reference) */}
        <div className="bg-white border border-stone-100 rounded-2xl p-5 flex items-center gap-4 paper-shadow">
          <div className="p-3 bg-red-50 text-red-500 rounded-xl">
            <Flame className="w-6 h-6 fill-current animate-pulse" />
          </div>
          <div>
            <div className="text-2xl font-bold text-stone-900 tracking-tight font-sans">
              {userProgress.streak} Days
            </div>
            <p className="text-xs text-stone-500 font-medium font-sans">
              Current Devotional Streak
            </p>
          </div>
        </div>

        {/* Completion details card (line 67 placeholder reference) */}
        <div className="bg-white border border-stone-100 rounded-2xl p-5 flex items-center gap-4 paper-shadow">
          <div className="p-3 bg-sage-50 text-sage-600 rounded-xl">
            <Award className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="text-2xl font-bold text-stone-900 tracking-tight font-sans flex items-baseline gap-1.5">
              <span>{completionPercent}%</span>
              <span className="text-xs font-normal text-stone-400">
                ({userProgress.completedDays.length} / 365)
              </span>
            </div>
            <p className="text-xs text-stone-500 font-medium font-sans">
              Scripture Reading Progress
            </p>
          </div>
        </div>

        {/* Selected day milestones (line 85 placeholder reference) */}
        <div className="bg-white border border-stone-100 rounded-2xl p-5 flex items-center gap-4 paper-shadow">
          <div className="p-3 bg-amber-50 text-amber-550 rounded-xl">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-stone-900 tracking-tight font-sans">
              Day {activeDayIndex}
            </div>
            <p className="text-xs text-stone-500 font-medium font-sans">
              Active Focus Portion Index
            </p>
          </div>
        </div>
      </div>

      {/* Main Year Matrix Board Card (line 120 reference) */}
      <div className="bg-white border border-linen-200 rounded-2xl p-6 md:p-8 paper-shadow flex flex-col gap-6">
        
        {/* Header and Legend */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-stone-100 pb-5">
          <div>
            <h2 className="text-xl font-bold text-stone-900 tracking-tight font-sans flex items-center gap-2">
              <Calendar className="w-5 h-5 text-sage-600" />
              Annual Devotional Matrix
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Select any block to quick-jump to that day's wisdom and view details below.
            </p>
          </div>

          {/* Color Legend (line 143 reference) */}
          <div className="flex items-center gap-4 flex-wrap text-[11px] font-medium text-stone-500 font-sans">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-linen-100 border border-stone-200" />
              <span>Unread</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-sage-600 border border-sage-700" />
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded border border-amber-400 bg-white ring-2 ring-amber-100" />
              <span>Selected Target</span>
            </div>
          </div>
        </div>

        {/* 12 Months Responsive Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {monthData.map(month => (
            <div 
              key={month.name} 
              className="bg-stone-50/50 border border-stone-150 rounded-xl p-4 flex flex-col gap-3"
            >
              <div className="flex justify-between items-center border-b border-stone-200 pb-1.5">
                <span className="font-bold text-xs text-stone-800 font-sans tracking-wide">
                  {month.name}
                </span>
                <span className="text-[10px] text-stone-400 font-mono">
                  {month.days} Days
                </span>
              </div>

              {/* Day Dots Grid */}
              <div className="grid grid-cols-7 gap-1.5">
                {Array.from({ length: month.days }).map((_, i) => {
                  const dayIdx = month.startDayIndex + i;
                  const isCompleted = userProgress.completedDays.includes(dayIdx);
                  const isCurSelected = selectedDay === dayIdx;
                  
                  return (
                    <button
                      key={dayIdx}
                      onClick={() => handleDayClick(dayIdx)}
                      className={`aspect-square rounded-md text-[10px] sm:text-[9px] font-mono leading-none flex items-center justify-center transition-all cursor-pointer ${
                        isCurSelected
                          ? "bg-white border border-amber-400 text-amber-600 font-bold ring-2 ring-amber-100 shadow-sm"
                          : isCompleted
                            ? "bg-sage-600 hover:bg-sage-700 border border-sage-700 text-white font-medium"
                            : "bg-linen-100 hover:bg-stone-200/60 border border-stone-200 text-stone-500"
                      }`}
                      id={`matrix_day_btn_${dayIdx}`}
                      title={`${month.name} ${i + 1} (Day ${dayIdx}) - ${isCompleted ? 'Completed' : 'Not Complete'}`}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Columns Section: Selected Day Info + Reset options */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Selected Day Details Panel (line 208 reference) */}
        <div className="lg:col-span-2 bg-white border border-linen-200 rounded-2xl p-6 paper-shadow flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <span className="text-xs uppercase tracking-wider text-sage-600 font-mono font-bold">
                Portion Details
              </span>
              <h3 className="text-lg font-bold text-stone-900 mt-0.5">
                Day {selectedDay} Summary
              </h3>
            </div>
            {isSelectedCompleted ? (
              <span className="text-xs bg-sage-50 text-sage-600 border border-sage-200 px-3 py-1 rounded-full font-semibold flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" />
                Completed
              </span>
            ) : (
              <span className="text-xs bg-stone-50 text-stone-400 border border-stone-200 px-3 py-1 rounded-full font-medium">
                Not complete
              </span>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <span className="text-xs text-stone-400 block mb-0.5">Theme & Main Direction:</span>
              <div className="text-base font-serif italic font-bold text-stone-850">
                {selectedReading.theme}
              </div>
            </div>

            <div>
              <span className="text-xs text-stone-400 block mb-0.5">Thematic Title & Context:</span>
              <div className="text-sm font-semibold text-stone-800">
                {selectedReading.title}
              </div>
            </div>

            <div>
              <span className="text-xs text-stone-400 block mb-0.5">Daily Direct Message:</span>
              <p className="text-stone-600 text-xs leading-relaxed font-sans bg-stone-50/50 border border-stone-150 p-3 rounded-xl">
                {selectedReading.focusMessage}
              </p>
            </div>
            
            <button
              onClick={() => onSelectDay(selectedDay)}
              className="mt-2 py-2.5 px-4 bg-sage-600 hover:bg-sage-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer w-full"
              id="jump_to_devotion_btn"
            >
              <BookOpen className="w-4 h-4" />
              <span>Read Scripture & Reflect for Day {selectedDay}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Administration Controls Panel (line 249 reference) */}
        <div className="bg-white border border-linen-200 rounded-2xl p-6 paper-shadow flex flex-col gap-4 justify-between">
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-bold text-stone-900 font-sans uppercase tracking-wider text-stone-500 border-b border-stone-100 pb-2">
              Management & Controls
            </h4>
            <div className="text-xs text-stone-500 leading-relaxed font-sans flex flex-col gap-3 bg-stone-50/60 border border-stone-150 p-3.5 rounded-xl">
              <div className="flex gap-2.5 items-start">
                <HelpCircle className="w-4.5 h-4.5 text-stone-400 shrink-0 mt-0.5" />
                <p>
                  Completing a spiritual diary log automatically records a checkmark for that day and updates your daily completion matrix.
                </p>
              </div>
              <div className="flex gap-2.5 items-start">
                <Sparkles className="w-4.5 h-4.5 text-sage-600 shrink-0 mt-0.5" />
                <p>
                  Aim to read and complete standard consecutive days in the year to build a high devotional streak!
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-stone-150 pt-4 mt-2">
            {!showConfirmReset ? (
              <button
                onClick={() => setShowConfirmReset(true)}
                className="w-full py-2.5 px-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                id="reset_progress_trigger"
              >
                <Trash2 className="w-4 h-4" />
                <span>Reset All Path Progress</span>
              </button>
            ) : (
              <div className="bg-red-50/40 border border-red-250 p-4 rounded-xl flex flex-col gap-3">
                <div className="flex items-start gap-2.5 text-red-700 text-xs">
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
                  <div>
                    <strong className="block font-bold mb-0.5">Are you completely sure?</strong>
                    This will delete all completed days, streaks, and reset your reading path completely. This cannot be undone.
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    onClick={() => setShowConfirmReset(false)}
                    className="py-1.5 px-3 bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      onClearProgress();
                      setShowConfirmReset(false);
                    }}
                    className="py-1.5 px-3 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
