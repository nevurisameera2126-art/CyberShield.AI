import React from 'react';
import { ShieldCheck, AlertTriangle, ShieldAlert } from 'lucide-react';

interface RiskMeterProps {
  score: number;
  verdictLabel: string;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskMeter: React.FC<RiskMeterProps> = ({ score, verdictLabel, size = 'md' }) => {
  const isHigh = score >= 65;
  const isMedium = score >= 30 && score < 65;
  const isLow = score < 30;

  const colorConfig = isHigh
    ? {
        text: 'text-rose-400',
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/30',
        bar: 'bg-gradient-to-r from-rose-500 to-red-600',
        badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        icon: ShieldAlert,
        glow: 'shadow-[0_0_20px_rgba(244,63,94,0.25)]'
      }
    : isMedium
    ? {
        text: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        bar: 'bg-gradient-to-r from-amber-500 to-orange-500',
        badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        icon: AlertTriangle,
        glow: 'shadow-[0_0_20px_rgba(245,158,11,0.25)]'
      }
    : {
        text: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        bar: 'bg-gradient-to-r from-emerald-500 to-teal-400',
        badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        icon: ShieldCheck,
        glow: 'shadow-[0_0_20px_rgba(16,185,129,0.25)]'
      };

  const Icon = colorConfig.icon;

  return (
    <div className={`rounded-xl border ${colorConfig.border} ${colorConfig.bg} ${colorConfig.glow} p-4 sm:p-5 transition-all`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-lg border ${colorConfig.border} ${colorConfig.bg}`}>
            <Icon className={`w-6 h-6 ${colorConfig.text}`} />
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-400 font-medium">Assessed Verdict</div>
            <div className={`text-lg sm:text-xl font-bold ${colorConfig.text}`}>
              {verdictLabel}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-slate-400">Risk Score:</span>
          <span className={`text-2xl font-black font-mono px-3 py-0.5 rounded-lg border ${colorConfig.badgeBg}`}>
            {score}<span className="text-xs font-normal opacity-70">/100</span>
          </span>
        </div>
      </div>

      {/* Progress Track */}
      <div className="space-y-1.5">
        <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${colorConfig.bar}`}
            style={{ width: `${Math.max(5, score)}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] text-slate-500 font-mono">
          <span>0 (Low Risk)</span>
          <span>35 (Suspicious)</span>
          <span>65 (High Risk)</span>
          <span>100</span>
        </div>
      </div>
    </div>
  );
};
