import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BookOpen, Sparkles, Save, Heart, ChevronLeft, ChevronRight, HelpCircle, RefreshCw, Feather, AlertCircle, Volume2, VolumeX } from "lucide-react";
import { ReadingPortion, JournalEntry, UserProgress, ScriptureResponse } from "../types";

interface TodayWisdomProps {
  portion: ReadingPortion;
  userProgress: UserProgress;
  onSaveEntry: (content: string, aiReflection?: string) => void;
  onToggleFavorite: (ref: string) => void;
  onNavigateDay: (direction: "prev" | "next") => void;
  existingEntry?: JournalEntry;
}

export default function TodayWisdom({
  portion,
  userProgress,
  onSaveEntry,
  onToggleFavorite,
  onNavigateDay,
  existingEntry,
}: TodayWisdomProps) {
  const [scriptureText, setScriptureText] = useState("");
  const [verses, setVerses] = useState<any[]>([]);
  const [isLoadingScripture, setIsLoadingScripture] = useState(false);
  const [scriptureError, setScriptureError] = useState("");
  
  const [journalContent, setJournalContent] = useState("");
  const [aiReflection, setAiReflection] = useState("");
  const [isGeneratingReflection, setIsGeneratingReflection] = useState(false);
  
  const [showExplanation, setShowExplanation] = useState(false);
  const [explanationText, setExplanationText] = useState("");
  const [isGeneratingExplanation, setIsGeneratingExplanation] = useState(false);

  const [isSpeaking, setIsSpeaking] = useState(false);

  // Cancel any speech active when portion changes
  useEffect(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, [portion]);

  // Cleanup speech synthesis on component unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSpeak = () => {
    if (!window.speechSynthesis) {
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    let textToSpeak = `${portion.reference}. `;
    if (verses.length > 0) {
      textToSpeak += verses.map(v => v.text).join(" ");
    } else {
      textToSpeak += scriptureText || "No scripture loaded.";
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    if (window.speechSynthesis.getVoices) {
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => v.lang.startsWith("en") && v.name.includes("Google")) || voices.find(v => v.lang.startsWith("en"));
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
    }

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = (e) => {
      console.error("Speech Synthesis error:", e);
      setIsSpeaking(false);
    };

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };
  
  const getOrdinalSuffix = (num: number): string => {
    if (num > 3 && num < 21) return "th";
    switch (num % 10) {
      case 1:  return "st";
      case 2:  return "nd";
      case 3:  return "rd";
      default: return "th";
    }
  };

  const getCalendarDateForDayIndex = (dayIndex: number): string => {
    const year = 2026;
    const date = new Date(year, 0, 1);
    date.setDate(dayIndex);
    const month = date.toLocaleDateString("en-US", { month: "long" });
    const day = date.getDate();
    return `${month} ${day}${getOrdinalSuffix(day)}`;
  };

  const isFavorited = userProgress.favoriteVerses.includes(portion.reference);

  // Sync existing entries if the user browses back/forth
  useEffect(() => {
    if (existingEntry) {
      setJournalContent(existingEntry.content);
      setAiReflection(existingEntry.aiReflection || "");
    } else {
      setJournalContent("");
      setAiReflection("");
    }
    setShowExplanation(false);
    setExplanationText("");
  }, [existingEntry, portion]);

  // Fetch real-time scripture text
  useEffect(() => {
    let active = true;
    const fetchScripture = async () => {
      setIsLoadingScripture(true);
      setScriptureError("");
      try {
        const response = await fetch(`/api/scripture?reference=${encodeURIComponent(portion.reference)}`);
        if (!response.ok) throw new Error("Could not fetch Bible verse.");
        const data: ScriptureResponse = await response.json();
        if (active) {
          setScriptureText(data.text);
          setVerses(data.verses || []);
        }
      } catch (err: any) {
        if (active) {
          setScriptureError("Could not retrieve scripture text automatically. Please read from your personal physical Bible.");
          setScriptureText("");
          setVerses([]);
        }
      } finally {
        if (active) setIsLoadingScripture(false);
      }
    };

    fetchScripture();
    return () => {
      active = false;
    };
  }, [portion.reference]);

  // Handle saving the core journal entry
  const handleSave = () => {
    onSaveEntry(journalContent, aiReflection || undefined);
  };

  // Request digital counselor commentary on current verses
  const handleGetExplanation = async () => {
    if (isGeneratingExplanation) return;
    setIsGeneratingExplanation(true);
    try {
      const response = await fetch("/api/gemini/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference: portion.reference,
          scriptureText: scriptureText || verses.map(v => v.text).join(" "),
          question: `Please explain the historical meaning and practical application of ${portion.reference}.`
        })
      });
      if (!response.ok) throw new Error("Commentary request failed.");
      const data = await response.json();
      setExplanationText(data.explanation);
      setShowExplanation(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingExplanation(false);
    }
  };

  // Ask Gemini for encouraging spiritual character reflection on their personal journal entry
  const handleGetAiReflection = async () => {
    if (!journalContent.trim() || isGeneratingReflection) return;
    setIsGeneratingReflection(true);
    try {
      const response = await fetch("/api/gemini/reflect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference: portion.reference,
          theme: portion.theme,
          journalContent: journalContent,
          promptQuestion: portion.defaultPrompt
        })
      });
      if (!response.ok) throw new Error("AI reflection failed.");
      const data = await response.json();
      setAiReflection(data.reflection);
      // Auto-save the entry with the newly generated AI Reflection
      onSaveEntry(journalContent, data.reflection);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingReflection(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-7xl mx-auto px-4 md:px-0">
      
      {/* LEFT PANEL: Daily Scripture & Custom Guidance Tools (5 columns) */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        
        {/* Navigation header */}
        <div className="flex items-center justify-between bg-white border border-stone-100 rounded-xl px-4 py-3 paper-shadow">
          <button 
            onClick={() => onNavigateDay("prev")}
            className="flex items-center justify-center p-2 rounded-lg hover:bg-stone-50 transition-colors text-stone-600 disabled:opacity-40"
            disabled={portion.dayIndex <= 1}
            id="btn_prev_day"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="text-center">
            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.15em] text-sage-600 block mb-0.5">
              Devotional Journey
            </span>
            <h2 className="text-xs font-bold text-stone-850 tracking-tight flex items-center justify-center gap-1.5 flex-wrap">
              <span>Day {portion.dayIndex} of 365</span>
              <span className="text-stone-300">•</span>
              <span className="text-sage-700 italic">{getCalendarDateForDayIndex(portion.dayIndex)}</span>
            </h2>
          </div>

          <button 
            onClick={() => onNavigateDay("next")}
            className="flex items-center justify-center p-2 rounded-lg hover:bg-stone-50 transition-colors text-stone-600 disabled:opacity-40"
            disabled={portion.dayIndex >= 365}
            id="btn_next_day"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Beautiful Scripture Card */}
        <div className="bg-white border border-linen-200 rounded-2xl p-6 md:p-8 paper-shadow relative overflow-hidden flex flex-col gap-5 min-h-[350px]">
          {/* Accent decoration */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-sage-600" />
          
          <div className="flex justify-between items-start">
            <div className="flex gap-2.5 items-center">
              <span className="p-2 bg-sage-50 text-sage-600 rounded-lg">
                <BookOpen className="w-5 h-5" />
              </span>
              <div>
                <span className="font-mono text-xs text-stone-400 capitalize tracking-wide">
                  {portion.theme}
                </span>
                <h3 className="text-lg font-bold text-charcoal-800 leading-tight">
                  {portion.reference}
                </h3>
              </div>
            </div>
            
            <div className="flex gap-1.5 items-center">
              <button
                onClick={handleSpeak}
                disabled={isLoadingScripture || !!scriptureError}
                className={`p-2.5 rounded-xl border transition-all duration-300 cursor-pointer flex items-center justify-center ${
                  isSpeaking
                    ? "bg-sage-600 border-sage-600 text-white hover:bg-sage-700 hover:border-sage-700 animate-pulse"
                    : "bg-stone-50 border-stone-200 text-stone-400 hover:text-stone-600 hover:bg-stone-100 disabled:opacity-40"
                }`}
                id="btn_listen_scripture"
                title={isSpeaking ? "Stop listening to passage" : "Listen to passage read aloud (Text-to-Speech)"}
              >
                {isSpeaking ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>

              <button
                onClick={() => onToggleFavorite(portion.reference)}
                className={`p-2.5 rounded-xl border transition-all duration-300 flex items-center justify-center cursor-pointer ${
                  isFavorited 
                    ? "bg-amber-50 border-amber-200 text-amber-500 hover:bg-amber-100" 
                    : "bg-stone-50 border-stone-200 text-stone-400 hover:text-stone-600 hover:bg-stone-100"
                }`}
                id="btn_favorite"
                title={isFavorited ? "Remove from favorite verses" : "Save as favorite verse"}
              >
                <Heart className="w-4 h-4 fill-current" />
              </button>
            </div>
          </div>

          {/* Scripture Passage text */}
          <div className="flex-grow flex flex-col justify-center">
            {isLoadingScripture ? (
              <div className="space-y-3.5 my-4">
                <div className="h-4 bg-stone-100 rounded-md w-full animate-pulse" />
                <div className="h-4 bg-stone-100 rounded-md w-11/12 animate-pulse" />
                <div className="h-4 bg-stone-100 rounded-md w-10/12 animate-pulse" />
                <div className="h-4 bg-stone-100 rounded-md w-9/12 animate-pulse" />
              </div>
            ) : scriptureError ? (
              <div className="text-center py-6 px-4 bg-amber-50/50 rounded-xl border border-amber-100/70 text-stone-600">
                <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                <p className="text-sm scripture-text italic leading-relaxed">{scriptureError}</p>
              </div>
            ) : verses.length > 0 ? (
              <div className="scripture-text text-stone-800 text-lg italic pr-1 max-h-[250px] overflow-y-auto custom-scrollbar">
                {verses.map((v, i) => (
                  <span key={i} className="inline mr-2">
                    <sup className="text-sage-600 font-sans font-semibold mr-1 text-[10px] select-none">
                      {v.verse}
                    </sup>
                    {v.text.trim()}
                  </span>
                ))}
              </div>
            ) : (
              <p className="scripture-text text-stone-700 text-lg italic leading-relaxed">
                {scriptureText || "No scripture found."}
              </p>
            )}
          </div>

          <div className="border-t border-linen-100 pt-4 flex gap-3">
            <button
              onClick={handleGetExplanation}
              disabled={isGeneratingExplanation}
              className="flex-1 flex gap-2 items-center justify-center py-2 px-4 bg-stone-50 hover:bg-stone-100 disabled:opacity-60 text-stone-700 text-xs font-semibold rounded-xl border border-stone-200 transition-colors cursor-pointer"
              id="btn_explain_verses"
            >
              {isGeneratingExplanation ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Drawing Context...
                </>
              ) : (
                <>
                  <HelpCircle className="w-3.5 h-3.5" />
                  Commentary & Meaning
                </>
              )}
            </button>
          </div>
        </div>

        {/* Dynamic AI Verse Commentary Box */}
        <AnimatePresence>
          {showExplanation && explanationText && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-[#FAF8F5] border border-sage-200 rounded-2xl p-6 paper-shadow relative"
              id="commentary_box"
            >
              <div className="flex items-center gap-2 text-sage-700 font-bold text-xs uppercase tracking-wider mb-2.5">
                <Sparkles className="w-4 h-4 text-sage-600" />
                Spiritual Context
              </div>
              <div className="text-stone-700 text-xs leading-relaxed space-y-2.5 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                {explanationText.split("\n\n").map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
              <button 
                onClick={() => setShowExplanation(false)}
                className="mt-3.5 text-[11px] font-semibold text-stone-400 hover:text-stone-600 block transition-colors"
              >
                Hide commentary
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* RIGHT PANEL: Reflection Journal Workspace (7 columns) */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        
        {/* Title Group */}
        <div className="flex flex-col gap-2">
          <span className="font-mono text-xs text-sage-600 font-bold uppercase tracking-widest flex items-center gap-1.5">
            <Feather className="w-3.5 h-3.5" />
            Character Focus Theme
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-stone-850 tracking-tight">
            {portion.title.replace(` (${portion.reference})`, "")}
          </h1>
          <p className="text-sm text-stone-600">
            {portion.focusMessage}
          </p>
        </div>

        {/* Prompt Card */}
        <div className="bg-sage-50 border border-sage-200 rounded-2xl p-5 md:p-6 flex flex-col gap-3">
          <div className="flex gap-2 items-center text-sage-700 text-xs font-bold uppercase tracking-wider">
            <HelpCircle className="w-4.5 h-4.5" />
            Journaling Reflection Suggestion
          </div>
          <p className="text-charcoal-800 text-sm italic font-sans font-medium leading-relaxed bg-white/60 p-3.5 rounded-xl border border-sage-100">
            "{portion.defaultPrompt}"
          </p>
        </div>

        {/* Editor Unit */}
        <div className="bg-white border border-linen-200 rounded-2xl overflow-hidden p-5 md:p-6 paper-shadow flex flex-col gap-4">
          <div className="flex justify-between items-center pb-2 border-b border-linen-100">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400 font-mono">
              The Writing Desk
            </span>
            <span className="text-[10px] text-stone-400 font-mono">
              {journalContent.trim().length} characters • {journalContent.split(/\s+/).filter(Boolean).length} words
            </span>
          </div>

          <textarea
            value={journalContent}
            onChange={(e) => setJournalContent(e.target.value)}
            placeholder="Quiet your thoughts, read the verses once more, and write down your sincere reflection, prayers, or action plan to cultivate wisdom here..."
            className="w-full min-h-[220px] max-h-[400px] text-charcoal-800 focus:outline-none focus:ring-0 resize-y scripture-text text-[15px] placeholder-stone-300"
            id="journal_textarea"
          />

          <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-linen-100">
            {/* Ask AI Companion */}
            <button
              onClick={handleGetAiReflection}
              disabled={isGeneratingReflection || !journalContent.trim()}
              className={`flex-1 sm:flex-initial flex gap-2 items-center justify-center py-2.5 px-5 rounded-xl text-xs font-bold transition-all ${
                journalContent.trim() 
                  ? "bg-stone-800 hover:bg-stone-900 text-white cursor-pointer" 
                  : "bg-stone-100 border border-stone-200 text-stone-400 cursor-not-allowed"
              }`}
              id="btn_ai_reflection"
              title="Submit your entry to Gemini for personal encouraging spiritual response"
            >
              {isGeneratingReflection ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                  Synthesizing Wisdom...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-450 fill-amber-300" />
                  Reflect with Spirit Guide
                </>
              )}
            </button>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={!journalContent.trim()}
              className={`flex-grow sm:flex-initial flex gap-2 items-center justify-center py-2.5 px-5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                journalContent.trim()
                  ? "bg-sage-600 hover:bg-sage-700 text-white cursor-pointer"
                  : "bg-sage-100 text-sage-400 cursor-not-allowed"
              }`}
              id="btn_save_entry"
            >
              <Save className="w-4 h-4" />
              Save to Diary
            </button>
          </div>
        </div>

        {/* Dynamic Gemini Spiritual Companionship Output */}
        <AnimatePresence>
          {aiReflection && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-linen-100 border border-linen-200 rounded-2xl p-6 md:p-8 relative paper-shadow relative"
              id="ai_reflection_box"
            >
              {/* Corner quotation symbol */}
              <div className="absolute top-4 right-6 text-6xl text-linen-300 pointer-events-none font-serif font-bold italic select-none">
                “
              </div>

              <div className="flex items-center gap-2 text-gold-600 font-bold text-xs uppercase tracking-wider mb-4 font-mono">
                <Sparkles className="w-4 h-4 text-gold-500 fill-gold-500" />
                Spiritual Mentor Guidance
              </div>

              <div className="text-charcoal-800 leading-relaxed space-y-4 text-sm font-medium pr-1">
                {aiReflection.split("\n\n").map((para, i) => (
                  <p key={i} className="scripture-text">
                    {para}
                  </p>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
