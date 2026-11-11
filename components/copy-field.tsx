import { CopyButton } from "./copy-button";

type CopyFieldProps = {
  label: string;
  value: string;
  hint?: string;
};

export function CopyField({ label, value, hint }: CopyFieldProps) {
  return (
    <div className="group min-w-0">
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-ice-400/80">{label}</span>
        {hint ? <span className="text-[10px] text-ice-500">{hint}</span> : null}
      </div>
      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-ink-950/60 py-1 pl-3 pr-1 transition-colors group-hover:border-white/20">
        <span className="min-w-0 flex-1 truncate font-mono text-[11.5px] text-ice-200">{value}</span>
        <CopyButton value={value} label={`Copy ${label.toLowerCase()}`} />
      </div>
    </div>
  );
}
