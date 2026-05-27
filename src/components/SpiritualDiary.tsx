import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Sparkles, Calendar, BookOpen, Clock, Heart, Edit3, Trash2, Tag, RefreshCw, Feather, Printer } from "lucide-react";
import { JournalEntry, UserProgress } from "../types";

interface SpiritualDiaryProps {
  entries: JournalEntry[];
  userProgress: UserProgress;
  onSelectDay: (dayIndex: number) => void;
  onUpdateEntry: (dayIndex: number, content: string) => void;
  onDeleteEntry?: (dayIndex: number) => void;
}

export default function SpiritualDiary({
  entries,
  userProgress,
  onSelectDay,
  onUpdateEntry,
  onDeleteEntry
}: SpiritualDiaryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  
  // Local state for inline record editing
  const [editingDayIndex, setEditingDayIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  // Spiritual synthesis state (soul growth summary)
  const [soulReport, setSoulReport] = useState("");
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  // Extract unique themes from logs
  const loggedThemes = Array.from(new Set(entries.map((e) => e.keyTheme)));

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (entry.aiReflection && entry.aiReflection.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesTheme = !selectedTheme || entry.keyTheme === selectedTheme;
    
    return matchesSearch && matchesTheme;
  });

  // Request the AI core Soul-Growth character review from Gemini
  const handleGenerateSoulReport = async () => {
    if (isSynthesizing || entries.length === 0) return;
    setIsSynthesizing(true);
    try {
      const response = await fetch("/api/gemini/soul-growth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logs: entries })
      });
      if (!response.ok) throw new Error("Synthesis failed.");
      const data = await response.json();
      setSoulReport(data.insights);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleStartEdit = (entry: JournalEntry) => {
    setEditingDayIndex(entry.dayIndex);
    setEditText(entry.content);
  };

  const handleSaveEdit = (dayIndex: number) => {
    onUpdateEntry(dayIndex, editText);
    setEditingDayIndex(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-7xl mx-auto px-4 md:px-0">
      
      {/* 1. LEFT PANE: Search / Theme Filter Tags / AI soul report (4 columns) */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        
        {/* Search Input Box */}
        <div className="bg-white border border-stone-100 rounded-2xl p-5 paper-shadow flex flex-col gap-3">
          <h3 className="font-bold text-stone-800 text-sm font-sans">Search Logbook</h3>
          <div className="relative">
            <Search className="w-4.5 h-4.5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search verses, phrases, notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-sage-600 transition-colors"
              id="diary_search_input"
            />
          </div>
        </div>

        {/* Theme Filters Tags Grid */}
        {loggedThemes.length > 0 && (
          <div className="bg-white border border-stone-100 rounded-2xl p-5 paper-shadow flex flex-col gap-3">
            <h3 className="font-bold text-stone-800 text-sm font-sans">Filter by Theme</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedTheme(null)}
                className={`py-1.5 px-3 rounded-lg text-xs font-semibold uppercase tracking-wide transition-colors ${
                  !selectedTheme 
                    ? "bg-sage-600 text-white" 
                    : "bg-stone-50 hover:bg-stone-100 text-stone-600 border border-stone-200"
                }`}
                id="btn_filter_all_themes"
              >
                All Themes
              </button>
              {loggedThemes.map((theme) => (
                <button
                  key={theme}
                  onClick={() => setSelectedTheme(theme)}
                  className={`py-1.5 px-3 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    selectedTheme === theme 
                      ? "bg-sage-600 text-white border border-sage-600" 
                      : "bg-stone-50 hover:bg-stone-100 text-stone-600 border border-stone-200"
                  }`}
                  id={`btn_filter_theme_${theme.replace(/\s+/g, '_')}`}
                >
                  <Tag className="w-3 h-3 opacity-60" />
                  {theme}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* AI Character-Growth Synthesis Box */}
        <div className="bg-white border border-linen-200 rounded-2xl p-5 md:p-6 paper-shadow flex flex-col gap-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-sage-600" />
          
          <div className="flex gap-2 items-center">
            <span className="p-1.5 bg-amber-50 text-amber-500 rounded-lg">
              <Sparkles className="w-5 h-5 fill-current" />
            </span>
            <h3 className="font-bold text-stone-850 text-sm font-sans">AI Soul-Growth Digest</h3>
          </div>
          
          <p className="text-xs text-stone-500 leading-snug">
            Compile and analyze all your past entries to generate an overarching diagnostic of your spiritual values, character trends, and areas of maturity.
          </p>

          <button
            onClick={handleGenerateSoulReport}
            disabled={isSynthesizing || entries.length === 0}
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              entries.length > 0
                ? "bg-stone-900 hover:bg-stone-800 text-white cursor-pointer shadow"
                : "bg-stone-100 border border-stone-200 text-stone-400 cursor-not-allowed"
            }`}
            id="btn_generate_soul_report"
          >
            {isSynthesizing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Reviewing logs...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-300" />
                Synthesize Spiritual Path
              </>
            )}
          </button>

          {entries.length === 0 && (
            <span className="text-[10px] text-center text-stone-405 font-medium">
              * Log at least 1 journal entry to process report.
            </span>
          )}
        </div>

      </div>

      {/* 2. RIGHT PANE: Chronological Diary Timeline / Soul report results (8 columns) */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        
        {/* Render Soul Report Result if requested */}
        <AnimatePresence>
          {soulReport && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-linen-50 border-2 border-amber-200 rounded-2xl p-6 md:p-8 paper-shadow overflow-hidden relative"
              id="soul_report_box"
            >
              <div className="flex justify-between items-center pb-4 border-b border-linen-200 mb-5">
                <span className="font-mono text-xs text-gold-600 font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 fill-amber-300 text-amber-500" />
                  Your Yearly Growth Audit
                </span>
                <button
                  onClick={() => setSoulReport("")}
                  className="text-stone-400 hover:text-stone-700 font-mono text-[10px] font-bold"
                >
                  CLEAR REPORT
                </button>
              </div>

              <div className="text-charcoal-800 leading-relaxed space-y-4 max-h-[450px] overflow-y-auto custom-scrollbar pr-3 scripture-text text-sm">
                {soulReport.split("\n\n").map((para, i) => {
                  if (para.startsWith("###")) {
                    return <h4 key={i} className="font-sans font-extrabold text-stone-800 text-base pt-2">{para.replace(/###/g, "").trim()}</h4>;
                  }
                  if (para.startsWith("-") || para.startsWith("*")) {
                    return (
                      <ul key={i} className="list-disc pl-5 space-y-1.5">
                        <li className="pl-1">{para.replace(/^[-*]\s*/, "")}</li>
                      </ul>
                    );
                  }
                  return <p key={i}>{para}</p>;
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PRINT SYSTEM HEADER (Only visible during PDF generation/browser print dialog) */}
        <div className="print-header">
          <div className="flex justify-between items-baseline mb-6">
            <div>
              <h1 className="text-3xl font-serif italic font-bold tracking-tight text-stone-880">
                Proverbs Path <span className="text-sage-600 font-light font-sans">/ Reflections Ledger</span>
              </h1>
              <p className="text-xs text-stone-500 font-mono mt-1">
                Generated 365-Day Devotional Journal & Spiritual Diary Logs
              </p>
            </div>
            <div className="text-right">
              <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-sage-600">
                Current Streak: {userProgress.streak} Days
              </div>
              <div className="font-mono text-[10px] font-bold text-stone-500 mt-1">
                Total Path Progress: {Math.round((userProgress.completedDays.length / 365) * 100)}% ({userProgress.completedDays.length} / 365 Days)
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs font-mono border-t border-b border-stone-200 py-3 mb-6 bg-stone-50/50">
            <div>
              <span className="font-bold text-stone-600">Total Recorded Entries:</span> {entries.length} Reflections
            </div>
            <div className="text-right">
              <span className="font-bold text-stone-600">Print Signature Date:</span> {new Date().toLocaleDateString(undefined, { dateStyle: "long" })}
            </div>
          </div>
        </div>

        {/* Diary List Headers */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-linen-200 pb-4 no-print">
          <h2 className="text-xl font-bold text-stone-850 tracking-tight flex items-center gap-2">
            <Calendar className="w-5 h-5 text-sage-600" />
            Spiritual Diary Logs ({filteredEntries.length})
          </h2>
          <div className="flex items-center gap-2.5 flex-wrap">
            {selectedTheme && (
              <span className="text-xs bg-sage-50 text-sage-600 border border-sage-200 px-2.5 py-1 rounded-full font-medium">
                Filtered: {selectedTheme}
              </span>
            )}
            
            <button
              onClick={() => window.print()}
              disabled={entries.length === 0}
              className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer shadow-sm border ${
                entries.length > 0
                  ? "bg-sage-600 hover:bg-sage-700 text-white border-sage-600"
                  : "bg-stone-50 text-stone-305 border-stone-150 cursor-not-allowed"
              }`}
              id="btn_download_diary_print"
              title="Download or Print PDF copy of reflections"
            >
              <Printer className="w-4 h-4" />
              <span>Download Ledger</span>
            </button>
          </div>
        </div>

        {/* Timeline List of Logs */}
        {filteredEntries.length === 0 ? (
          <div className="bg-white border border-stone-100 rounded-2xl py-16 text-center paper-shadow">
            <Feather className="w-12 h-12 text-stone-300 opacity-30 mx-auto mb-3" />
            <h3 className="text-stone-600 font-bold text-md">The ledger is silent.</h3>
            <p className="text-stone-400 text-xs mt-1 px-4 max-w-sm mx-auto">
              {entries.length === 0 
                ? "Begin writing your thoughts under Today's Wisdom panel to populate your logbook." 
                : "No logs found matching your query."}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredEntries.map((entry) => {
              const formattedDate = new Date(entry.date).toLocaleDateString(undefined, {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              });
              
              const isEditing = editingDayIndex === entry.dayIndex;

              return (
                <div
                  key={entry.id}
                  className="bg-white border border-linen-200 rounded-2xl p-6 paper-shadow relative overflow-hidden flex flex-col gap-4 group"
                  id={`diary_entry_card_${entry.dayIndex}`}
                >
                  {/* Category Accent Line */}
                  <div className="absolute top-0 bottom-0 left-0 w-1 bg-sage-600" />

                  {/* Log Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-linen-100 pb-3">
                    <div className="flex gap-2.5 items-center">
                      <span className="p-2 bg-stone-50 text-stone-600 rounded-lg">
                        <Clock className="w-4 h-4" />
                      </span>
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-mono font-bold text-stone-400 block">
                          Day {entry.dayIndex} Reflection
                        </span>
                        <h4 className="text-[11px] font-bold text-stone-800 leading-tight">
                          {formattedDate}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-sage-50 text-sage-600 border border-sage-100 px-3 py-1 rounded-full font-medium flex items-center gap-1.5">
                        <Tag className="w-3 h-3" />
                        {entry.keyTheme}
                      </span>
                      
                      <button
                        onClick={() => onSelectDay(entry.dayIndex)}
                        className="py-1 px-2.5 bg-stone-50 hover:bg-stone-150 border border-stone-200 text-stone-600 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                        title="Jump to read again"
                        id={`btn_diary_view_day_${entry.dayIndex}`}
                      >
                        Read Passage
                      </button>
                    </div>
                  </div>

                  {/* Devotional reference */}
                  <div className="flex items-center gap-2 text-xs font-bold text-stone-700">
                    <BookOpen className="w-4 h-4 text-sage-600" />
                    <span>Scripture Guide:</span>
                    <span 
                      onClick={() => onSelectDay(entry.dayIndex)}
                      className="text-sage-700 tracking-tight cursor-pointer hover:underline"
                    >
                      {entry.reference}
                    </span>
                  </div>

                  {/* Journal Input/Body Content */}
                  {isEditing ? (
                    <div className="flex flex-col gap-3">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full min-h-[140px] bg-stone-50 border border-stone-200 p-4 rounded-xl focus:outline-none scripture-text text-sm"
                        id={`edit_textarea_${entry.dayIndex}`}
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setEditingDayIndex(null)}
                          className="px-3.5 py-1.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-lg text-xs font-bold text-stone-600 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveEdit(entry.dayIndex)}
                          className="px-3.5 py-1.5 bg-sage-600 hover:bg-sage-700 rounded-lg text-xs font-bold text-white cursor-pointer"
                          id={`btn_save_edit_${entry.dayIndex}`}
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-stone-850 scripture-text text-[15px] italic leading-relaxed pl-1 whitespace-pre-wrap">
                      "{entry.content}"
                    </div>
                  )}

                  {/* AI Response Block, if exists for this entry */}
                  {entry.aiReflection && !isEditing && (
                    <div className="bg-linen-100/60 border border-linen-200 p-4 md:p-5 rounded-xl flex flex-col gap-2">
                      <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-gold-600 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-gold-500 fill-gold-500" />
                        AI Companion Feedback
                      </span>
                      <p className="text-xs text-stone-700 scripture-text leading-relaxed italic whitespace-pre-wrap pl-1">
                        {entry.aiReflection}
                      </p>
                    </div>
                  )}

                  {/* Card Controls Footer */}
                  {!isEditing && (
                    <div className="flex justify-between items-center pt-2 border-t border-linen-100/50 opacity-100 group-hover:opacity-100 transition-opacity">
                      <div className="text-[10px] text-stone-400 font-mono">
                        Prompt Focus: {entry.promptQuestion || "None"}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleStartEdit(entry)}
                          className="p-1.5 hover:bg-stone-50 text-stone-500 hover:text-stone-700 rounded transition-colors cursor-pointer"
                          title="Edit entry"
                          id={`btn_edit_entry_${entry.dayIndex}`}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        
                        {onDeleteEntry && (
                          <button
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this specific reflection entry?")) {
                                onDeleteEntry(entry.dayIndex);
                              }
                            }}
                            className="p-1.5 hover:bg-rose-50 text-stone-450 hover:text-rose-600 rounded transition-colors cursor-pointer"
                            title="Delete entry"
                            id={`btn_delete_entry_${entry.dayIndex}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
}
