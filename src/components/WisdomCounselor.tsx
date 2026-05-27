import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Compass, HelpCircle, Search, Sparkles, RefreshCw, Feather, ArrowRight, Quote } from "lucide-react";

interface WisdomCounselorProps {
  apiKeyExists: boolean;
}

export default function WisdomCounselor({ apiKeyExists }: WisdomCounselorProps) {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [isQuerying, setIsQuerying] = useState(false);

  const sampleQuestions = [
    { text: "What does Proverbs teach about guarding our words and gossip?", label: "Control of Speech" },
    { text: "How should a wise spouse or parent manage family communication?", label: "Family and Home" },
    { text: "What defines the difference between diligence and laziness in business?", label: "Diligence & Money" },
    { text: "How can I handle severe anger and high-tension conflict peacefully?", label: "Peace Over Conflict" },
  ];

  const handleQuery = async (queryText: string) => {
    if (isQuerying || !queryText.trim()) return;
    setIsQuerying(true);
    setResponse("");
    try {
      const res = await fetch("/api/gemini/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference: "The Book of Proverbs (General Counsel)",
          question: queryText,
        })
      });
      if (!res.ok) throw new Error("Counselor failed to respond.");
      const data = await res.json();
      setResponse(data.explanation);
    } catch (err: any) {
      console.error(err);
      setResponse("Our spiritual counselor was unable to respond. Please check your network connection or try again later.");
    } finally {
      setIsQuerying(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-7xl mx-auto px-4 md:px-0">
      
      {/* LEFT PANEL: Advice Suggesters and core description (5 columns) */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        
        {/* Intro Card */}
        <div className="bg-white border border-stone-100 rounded-2xl p-5 md:p-6 paper-shadow flex flex-col gap-3 relative overflow-hidden">
          <div className="absolute top-0 bottom-0 left-0 w-1 bg-gold-500" />
          <span className="font-mono text-[9px] font-bold text-gold-600 uppercase tracking-widest flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-gold-500" />
            Spiritual Directory
          </span>
          <h2 className="text-lg font-extrabold text-stone-850 tracking-tight">
            Consult the Proverbs Counselor
          </h2>
          <p className="text-xs text-stone-500 leading-relaxed">
            Submit your personal, ethical, relational, or vocational questions here. The AI Counselor will comb through the verses of Solomon, Agur, and Lemuel to formulate an encouraging, biblically grounded synthesis of wisdom.
          </p>
        </div>

        {/* Suggestion Prompts list */}
        <div className="bg-white border border-stone-100 rounded-2xl p-5 paper-shadow flex flex-col gap-3">
          <h3 className="font-bold text-stone-850 text-sm font-sans flex items-center gap-1.5">
            <Feather className="w-4 h-4 text-sage-600" />
            Popular Research Areas
          </h3>
          <div className="flex flex-col gap-2">
            {sampleQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuestion(q.text);
                  handleQuery(q.text);
                }}
                className="w-full text-left p-3 bg-stone-50 hover:bg-stone-100/90 border border-stone-200 rounded-xl transition-all flex justify-between items-center group cursor-pointer text-xs"
                id={`btn_sample_query_${idx}`}
              >
                <div className="flex flex-col">
                  <span className="font-mono text-[9px] uppercase tracking-wider text-stone-400 font-bold mb-0.5">
                    {q.label}
                  </span>
                  <span className="text-stone-700 font-medium leading-normal pr-2">
                    "{q.text}"
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-gold-500 transition-colors shrink-0" />
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* RIGHT PANEL: Chat box + output presentation (8 columns) */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        
        {/* Ask input console */}
        <div className="bg-white border border-linen-200 rounded-2xl overflow-hidden p-5 md:p-6 paper-shadow flex flex-col gap-4">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-400 font-mono">
            Ask Solomon's Desk
          </span>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. How does Proverbs distinguish between planning for tomorrow versus trusting God's direction?"
              className="flex-grow bg-stone-50 border border-stone-200 px-4 py-3 rounded-xl text-stone-800 text-sm focus:outline-none focus:border-gold-500 transition-colors"
              id="counselor_question_input"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleQuery(question);
              }}
            />

            <button
              onClick={() => handleQuery(question)}
              disabled={isQuerying || !question.trim()}
              className={`py-3 px-5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                question.trim() && !isQuerying
                  ? "bg-stone-900 hover:bg-stone-800 text-white cursor-pointer shadow"
                  : "bg-stone-100 text-stone-400 border border-stone-250 cursor-not-allowed"
              }`}
              id="btn_submit_counsel_query"
            >
              {isQuerying ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Combing Scrolls...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-300" />
                  Request Counsel
                </>
              )}
            </button>
          </div>
        </div>

        {/* Output presentation */}
        <AnimatePresence mode="wait">
          {response ? (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-linen-100/70 border border-linen-200 rounded-2xl p-6 md:p-8 paper-shadow relative"
              id="counselor_response_box"
            >
              <div className="absolute top-6 right-8 text-stone-300 opacity-50">
                <Quote className="w-10 h-10 transform rotate-180" />
              </div>

              <div className="flex gap-2 items-center text-gold-600 font-bold text-xs uppercase tracking-wider mb-5 font-mono">
                <Sparkles className="w-4 h-4 text-gold-500 fill-gold-500" />
                Counsel of Scripture
              </div>

              <div className="text-charcoal-800 leading-relaxed space-y-4 text-sm scripture-text pr-2">
                {response.split("\n\n").map((para, i) => {
                  if (para.startsWith("####") || para.startsWith("###")) {
                    return (
                      <h4 key={i} className="font-sans font-extrabold text-stone-850 text-base pt-2">
                        {para.replace(/#/g, "").trim()}
                      </h4>
                    );
                  }
                  if (para.startsWith("-") || para.startsWith("*")) {
                    return (
                      <ul key={i} className="list-disc pl-5 space-y-1.5 font-sans font-medium text-xs text-stone-700">
                        <li className="pl-1">{para.replace(/^[-*]\s*/, "")}</li>
                      </ul>
                    );
                  }
                  return <p key={i}>{para}</p>;
                })}
              </div>
            </motion.div>
          ) : isQuerying ? (
            <div className="bg-white border border-stone-100 rounded-2xl p-8 text-center paper-shadow">
              <RefreshCw className="w-8 h-8 text-gold-500 animate-spin mx-auto mb-3" />
              <p className="text-sm font-semibold text-stone-700">Whispering with the Sages...</p>
              <p className="text-xs text-stone-400 mt-1">Summoning comparative Proverbs references and translations.</p>
            </div>
          ) : (
            <div className="bg-white border border-stone-150 rounded-2xl p-12 text-center paper-shadow">
              <HelpCircle className="w-12 h-12 text-stone-300 opacity-20 mx-auto mb-3" />
              <h3 className="text-stone-600 font-bold text-base">Silent Desk</h3>
              <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
                Select one of the topics on the left or type your unique inquiry to unlock targeted biblical guidance.
              </p>
            </div>
          )}
        </AnimatePresence>

      </div>

    </div>
  );
}
