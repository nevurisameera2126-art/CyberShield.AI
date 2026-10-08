import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Search, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Award, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  BookOpen,
  Fish,
  ShieldAlert,
  Database,
  KeyRound,
  Users,
  Lock,
  Wifi,
  Globe,
  EyeOff
} from 'lucide-react';
import { LEARNING_MODULES } from '../data/learningModules';
import { LearningModule } from '../types';

interface QuizState {
  selectedOption: number | null;
  isSubmitted: boolean;
  isCorrect: boolean;
}

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Fish,
  ShieldAlert,
  Database,
  KeyRound,
  Users,
  Lock,
  Wifi,
  Globe,
  EyeOff
};

export const LearningCenter: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedCardId, setExpandedCardId] = useState<string | null>(LEARNING_MODULES[0].id);
  
  // Track quiz state per question ID
  const [quizAnswers, setQuizAnswers] = useState<Record<string, QuizState>>({});
  
  // Overall quiz performance
  const [stats, setStats] = useState({ answered: 0, correct: 0 });

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('cybershield_quiz_stats');
      if (saved) {
        setStats(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  const updateQuizStats = (newAnswered: number, newCorrect: number) => {
    const updated = { answered: newAnswered, correct: newCorrect };
    setStats(updated);
    try {
      sessionStorage.setItem('cybershield_quiz_stats', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    const current = quizAnswers[questionId];
    if (current?.isSubmitted) return; // Prevent change after submit

    setQuizAnswers(prev => ({
      ...prev,
      [questionId]: {
        selectedOption: optionIndex,
        isSubmitted: false,
        isCorrect: false
      }
    }));
  };

  const handleSubmitQuiz = (module: LearningModule, questionId: string) => {
    const question = module.quiz.find(q => q.id === questionId);
    const answer = quizAnswers[questionId];

    if (!question || answer?.selectedOption === null || answer?.selectedOption === undefined) {
      return;
    }

    const isCorrect = answer.selectedOption === question.correctIndex;

    setQuizAnswers(prev => ({
      ...prev,
      [questionId]: {
        selectedOption: answer.selectedOption,
        isSubmitted: true,
        isCorrect
      }
    }));

    // Update session score
    const newAnswered = stats.answered + 1;
    const newCorrect = stats.correct + (isCorrect ? 1 : 0);
    updateQuizStats(newAnswered, newCorrect);
  };

  const categories = ['All', 'General', 'Web Security', 'Identity', 'Network', 'Data Protection'];

  const filteredModules = LEARNING_MODULES.filter(m => {
    const matchesCategory = selectedCategory === 'All' || m.category === selectedCategory;
    const matchesSearch = 
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.definition.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Interactive Knowledge Base</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Cybersecurity Learning Center
            </h1>
            <p className="mt-1 text-slate-400 text-sm max-w-2xl">
              Master essential cyber hygiene and attack vectors with beginner-friendly definitions, realistic scenarios, practical defense checklists, and interactive knowledge checks.
            </p>
          </div>

          {/* Quiz score badge */}
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Interactive Mastery</div>
              <div className="text-lg font-bold font-mono text-white">
                {stats.correct} / {stats.answered} <span className="text-xs text-emerald-400 font-sans font-normal">correct</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search concepts (e.g. ransomware, MFA, SQLi)..."
            className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>

      {/* Modules List */}
      <div className="space-y-4">
        {filteredModules.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/50 rounded-2xl border border-slate-800 text-slate-400">
            <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No topics matched your search filter "{searchQuery}".</p>
          </div>
        ) : (
          filteredModules.map((module) => {
            const isExpanded = expandedCardId === module.id;
            const IconComponent = ICON_MAP[module.iconName] || ShieldAlert;

            return (
              <div
                key={module.id}
                className={`rounded-2xl border transition-all duration-200 ${
                  isExpanded
                    ? 'bg-slate-900 border-slate-700/80 shadow-2xl'
                    : 'bg-slate-900/70 hover:bg-slate-900 border-slate-800 hover:border-slate-700/60'
                }`}
              >
                {/* Module Header / Toggle */}
                <button
                  onClick={() => setExpandedCardId(isExpanded ? null : module.id)}
                  className="w-full p-5 sm:p-6 text-left flex items-start sm:items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shrink-0">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="text-base sm:text-lg font-bold text-white">
                          {module.title}
                        </h3>
                        <span className="text-[10px] uppercase font-semibold font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                          {module.category}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-400 line-clamp-2">
                        {module.summary}
                      </p>
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-800 text-slate-400 shrink-0">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {/* Expanded Detailed Content */}
                {isExpanded && (
                  <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-slate-800/80 space-y-6 animate-in slide-in-from-top-2 duration-300">
                    
                    {/* Definition */}
                    <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-1">
                      <div className="text-xs uppercase tracking-wider font-semibold text-cyan-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Core Definition</span>
                      </div>
                      <p className="text-sm text-slate-200 leading-relaxed">
                        {module.definition}
                      </p>
                    </div>

                    {/* Real-World Scenario */}
                    <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-1">
                      <div className="text-xs uppercase tracking-wider font-semibold text-amber-400 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Real-World Scenario</span>
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed italic">
                        "{module.realWorldScenario}"
                      </p>
                    </div>

                    {/* Prevention Tips */}
                    <div>
                      <div className="text-xs uppercase tracking-wider font-semibold text-emerald-400 flex items-center gap-1.5 mb-2.5">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Prevention & Defense Checklist</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {module.preventionTips.map((tip, i) => (
                          <div
                            key={i}
                            className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-2.5"
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <span className="text-xs sm:text-sm text-slate-300 leading-relaxed">{tip}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Interactive Quiz Section */}
                    <div className="pt-2 border-t border-slate-800/80">
                      <div className="text-sm font-bold text-white flex items-center gap-2 mb-3">
                        <HelpCircle className="w-4 h-4 text-cyan-400" />
                        <span>Knowledge Check Quiz</span>
                      </div>

                      <div className="space-y-4">
                        {module.quiz.map((q) => {
                          const state = quizAnswers[q.id];
                          const hasSelected = state?.selectedOption !== null && state?.selectedOption !== undefined;

                          return (
                            <div key={q.id} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                              <p className="text-sm font-medium text-slate-100">
                                {q.question}
                              </p>

                              <div className="space-y-2">
                                {q.options.map((opt, optIdx) => {
                                  const isSelected = state?.selectedOption === optIdx;
                                  const isCorrectAnswer = optIdx === q.correctIndex;
                                  
                                  let buttonStyle = 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800/80';
                                  
                                  if (state?.isSubmitted) {
                                    if (isCorrectAnswer) {
                                      buttonStyle = 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200';
                                    } else if (isSelected && !state.isCorrect) {
                                      buttonStyle = 'bg-rose-500/20 border-rose-500/50 text-rose-200';
                                    } else {
                                      buttonStyle = 'bg-slate-900/50 border-slate-800/50 text-slate-500 opacity-60';
                                    }
                                  } else if (isSelected) {
                                    buttonStyle = 'bg-cyan-500/20 border-cyan-500/50 text-cyan-200';
                                  }

                                  return (
                                    <button
                                      key={optIdx}
                                      onClick={() => handleSelectOption(q.id, optIdx)}
                                      disabled={state?.isSubmitted}
                                      className={`w-full text-left p-3 rounded-lg border text-xs sm:text-sm font-medium transition-all flex items-center justify-between gap-3 ${buttonStyle}`}
                                    >
                                      <span>{opt}</span>
                                      {state?.isSubmitted && isCorrectAnswer && (
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                      )}
                                      {state?.isSubmitted && isSelected && !isCorrectAnswer && (
                                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                                      )}
                                    </button>
                                  );
                                })}
                              </div>

                              {/* Submit Button or Explanation */}
                              {!state?.isSubmitted ? (
                                <button
                                  onClick={() => handleSubmitQuiz(module, q.id)}
                                  disabled={!hasSelected}
                                  className="mt-2 px-4 py-2 rounded-lg text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                >
                                  Submit Answer
                                </button>
                              ) : (
                                <div className={`p-3 rounded-lg border text-xs leading-relaxed mt-2 ${
                                  state.isCorrect
                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                                }`}>
                                  <strong className="block mb-0.5">
                                    {state.isCorrect ? 'Correct!' : 'Incorrect.'}
                                  </strong>
                                  <span>{q.explanation}</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
