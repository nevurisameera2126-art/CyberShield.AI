import React, { useState } from 'react';
import { 
  AlertOctagon, 
  ShieldAlert, 
  CheckCircle2, 
  Lock, 
  CreditCard, 
  FileX, 
  Ban, 
  KeyRound, 
  HelpCircle, 
  Languages, 
  ArrowRight
} from 'lucide-react';
import { ActionableSafetyStep } from '../types';

interface ActionableSuggestionsProps {
  steps: ActionableSafetyStep[];
  riskScore: number;
}

export const ActionableSuggestions: React.FC<ActionableSuggestionsProps> = ({ steps, riskScore }) => {
  const [lang, setLang] = useState<'en' | 'te'>('en');

  if (!steps || steps.length === 0) return null;

  const isHighRisk = riskScore >= 65;
  const isMediumRisk = riskScore >= 30 && riskScore < 65;

  const headerBorder = isHighRisk
    ? 'border-rose-500/40 from-rose-950/40 via-slate-900 to-slate-950'
    : isMediumRisk
    ? 'border-amber-500/40 from-amber-950/40 via-slate-900 to-slate-950'
    : 'border-emerald-500/40 from-emerald-950/40 via-slate-900 to-slate-950';

  const getStepIcon = (actionType: ActionableSafetyStep['actionType']) => {
    switch (actionType) {
      case 'password_reset':
        return <KeyRound className="w-5 h-5 text-amber-400" />;
      case 'bank_freeze':
        return <CreditCard className="w-5 h-5 text-rose-400" />;
      case 'file_delete':
        return <FileX className="w-5 h-5 text-rose-400" />;
      case 'block_sender':
        return <Ban className="w-5 h-5 text-orange-400" />;
      case 'enable_mfa':
        return <Lock className="w-5 h-5 text-cyan-400" />;
      case 'low_risk_caution':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      default:
        return <ShieldAlert className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <div className={`rounded-2xl border ${headerBorder} bg-gradient-to-br p-6 sm:p-7 shadow-2xl space-y-6 transition-all animate-in fade-in duration-300`}>
      
      {/* Header with Title and Language Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>{lang === 'en' ? 'What Should You Do Next?' : 'మీరు తర్వాత ఏమి చేయాలి?'}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {lang === 'en' 
                ? 'Practical, prioritised steps tailored specifically to this detection'
                : 'ఈ ప్రమాదాన్ని బట్టి మీరు వెంటనే చేయాల్సిన ముఖ్యమైన పనులు'}
            </p>
          </div>
        </div>

        {/* Language Switcher */}
        <button
          onClick={() => setLang(lang === 'en' ? 'te' : 'en')}
          className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition-all cursor-pointer shadow-sm"
          title="Toggle English / Telugu guidance"
        >
          <Languages className="w-4 h-4 text-cyan-400" />
          <span>{lang === 'en' ? 'తెలుగులో చూడండి (Telugu)' : 'View in English'}</span>
        </button>
      </div>

      {/* Prioritised Steps List */}
      <div className="space-y-3.5">
        {steps.map((step, idx) => {
          const isCritical = step.priority === 'critical';
          const isHigh = step.priority === 'high';

          const cardBorder = isCritical
            ? 'border-rose-500/40 bg-slate-950/80'
            : isHigh
            ? 'border-amber-500/30 bg-slate-950/70'
            : 'border-slate-800 bg-slate-950/60';

          const badgeBg = isCritical
            ? 'bg-rose-500/20 text-rose-300 border-rose-500/30 font-bold'
            : isHigh
            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
            : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';

          return (
            <div
              key={step.id || idx}
              className={`p-4 sm:p-5 rounded-xl border ${cardBorder} transition-all space-y-2`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 shrink-0">
                    {getStepIcon(step.actionType)}
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-white">
                    {lang === 'en' ? step.titleEn : step.titleTe}
                  </h4>
                </div>

                <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full border ${badgeBg}`}>
                  {lang === 'en' ? step.badgeEn : step.badgeTe}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-9">
                {lang === 'en' ? step.descriptionEn : step.descriptionTe}
              </p>
            </div>
          );
        })}
      </div>

      {/* Quick reassurance footer */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <span>
          {lang === 'en'
            ? 'Showing highest priority actions first for your safety.'
            : 'మీ భద్రత కొరకు అత్యంత ముఖ్యమైన సూచనలు మొదట చూపబడ్డాయి.'}
        </span>
        <span className="font-mono text-cyan-400">CyberShield Defense Engine</span>
      </div>

    </div>
  );
};
