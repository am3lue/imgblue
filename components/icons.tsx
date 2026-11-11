import type { ReactNode } from "react";

type IconProps = {
  className?: string;
};

function base(className: string | undefined, children: ReactNode) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className ?? "size-4"}
    >
      {children}
    </svg>
  );
}

export function CopyIcon({ className }: IconProps) {
  return base(
    className,
    <>
      <rect x="9" y="9" width="11" height="11" rx="2.5" />
      <path d="M6.5 15H5.5A2.5 2.5 0 0 1 3 12.5v-7A2.5 2.5 0 0 1 5.5 3h7A2.5 2.5 0 0 1 15 5.5v1" />
    </>,
  );
}

export function CheckIcon({ className }: IconProps) {
  return base(className, <path d="m4.5 12.5 4.5 4.5L19.5 6.5" />);
}

export function DownloadIcon({ className }: IconProps) {
  return base(
    className,
    <>
      <path d="M12 3v12" />
      <path d="m7 11 5 5 5-5" />
      <path d="M4.5 20.5h15" />
    </>,
  );
}

export function ExternalLinkIcon({ className }: IconProps) {
  return base(
    className,
    <>
      <path d="M14 4h6v6" />
      <path d="M20 4 10.5 13.5" />
      <path d="M18 14.5V18a2.5 2.5 0 0 1-2.5 2.5H6A2.5 2.5 0 0 1 3.5 18V8.5A2.5 2.5 0 0 1 6 6h3.5" />
    </>,
  );
}

export function LinkIcon({ className }: IconProps) {
  return base(
    className,
    <>
      <path d="M10.5 13.5a4.5 4.5 0 0 0 6.4.4l2.4-2.4a4.5 4.5 0 1 0-6.4-6.4l-1.2 1.2" />
      <path d="M13.5 10.5a4.5 4.5 0 0 0-6.4-.4l-2.4 2.4a4.5 4.5 0 1 0 6.4 6.4l1.2-1.2" />
    </>,
  );
}

export function UploadIcon({ className }: IconProps) {
  return base(
    className,
    <>
      <path d="M12 15V4" />
      <path d="m7.5 8.5 4.5-4.5 4.5 4.5" />
      <path d="M4 15v3.5A2.5 2.5 0 0 0 6.5 21h11a2.5 2.5 0 0 0 2.5-2.5V15" />
    </>,
  );
}

export function SparklesIcon({ className }: IconProps) {
  return base(
    className,
    <>
      <path d="M12 3.5 13.6 8l4.4 1.6-4.4 1.6L12 15.6l-1.6-4.4L6 9.6 10.4 8 12 3.5Z" />
      <path d="M18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2Z" />
    </>,
  );
}

export function ArrowRightIcon({ className }: IconProps) {
  return base(
    className,
    <>
      <path d="M4 12h16" />
      <path d="m14 6 6 6-6 6" />
    </>,
  );
}

export function ImageIcon({ className }: IconProps) {
  return base(
    className,
    <>
      <rect x="3" y="4" width="18" height="16" rx="3" />
      <circle cx="8.5" cy="9.5" r="1.5" />
      <path d="m4 17 4.8-4.8a2 2 0 0 1 2.8 0L21 21" />
    </>,
  );
}

export function CodeIcon({ className }: IconProps) {
  return base(
    className,
    <>
      <path d="m8.5 8-4.5 4 4.5 4" />
      <path d="m15.5 8 4.5 4-4.5 4" />
      <path d="m13.5 5-3 14" />
    </>,
  );
}

export function KeyIcon({ className }: IconProps) {
  return base(
    className,
    <>
      <circle cx="8" cy="14" r="4" />
      <path d="m11 11 8-8" />
      <path d="m17 5 2.5 2.5" />
      <path d="m14.5 7.5 2 2" />
    </>,
  );
}

export function EyeIcon({ className }: IconProps) {
  return base(
    className,
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.8" />
    </>,
  );
}

export function CalendarIcon({ className }: IconProps) {
  return base(
    className,
    <>
      <rect x="3.5" y="5" width="17" height="16" rx="3" />
      <path d="M8 3v4M16 3v4M3.5 10h17" />
    </>,
  );
}

export function DatabaseIcon({ className }: IconProps) {
  return base(
    className,
    <>
      <ellipse cx="12" cy="5.5" rx="7.5" ry="2.8" />
      <path d="M4.5 5.5v6c0 1.55 3.36 2.8 7.5 2.8s7.5-1.25 7.5-2.8v-6" />
      <path d="M4.5 11.5v6c0 1.55 3.36 2.8 7.5 2.8s7.5-1.25 7.5-2.8v-6" />
    </>,
  );
}

export function ZapIcon({ className }: IconProps) {
  return base(className, <path d="M13 2.5 4.5 13.5H11l-1 8 8.5-11H12l1-8Z" />);
}

export function ShieldIcon({ className }: IconProps) {
  return base(
    className,
    <>
      <path d="M12 2.8 4.5 5.8v5.6c0 4.4 3 8.2 7.5 9.8 4.5-1.6 7.5-5.4 7.5-9.8V5.8L12 2.8Z" />
      <path d="m8.8 12 2.2 2.2 4.2-4.4" />
    </>,
  );
}

export function GithubIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className ?? "size-4"}>
      <path d="M12 .8a11.2 11.2 0 0 0-3.54 21.83c.56.1.77-.24.77-.54v-2.1c-3.13.68-3.79-1.33-3.79-1.33-.51-1.3-1.25-1.65-1.25-1.65-1.02-.7.08-.68.08-.68 1.13.08 1.72 1.16 1.72 1.16 1 1.72 2.63 1.22 3.27.93.1-.73.39-1.22.71-1.5-2.5-.28-5.12-1.25-5.12-5.57 0-1.23.44-2.23 1.16-3.02-.12-.28-.5-1.43.11-2.98 0 0 .94-.3 3.08 1.15a10.7 10.7 0 0 1 5.6 0c2.14-1.45 3.08-1.15 3.08-1.15.61 1.55.23 2.7.11 2.98.72.79 1.16 1.79 1.16 3.02 0 4.33-2.63 5.28-5.14 5.56.4.35.76 1.03.76 2.08v3.08c0 .3.2.65.78.54A11.2 11.2 0 0 0 12 .8Z" />
    </svg>
  );
}

export function LoaderIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className ?? "size-4 animate-spin"}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2.5" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function CloseIcon({ className }: IconProps) {
  return base(className, <path d="m6 6 12 12M18 6 6 18" />);
}

export function ShareIcon({ className }: IconProps) {
  return base(
    className,
    <>
      <circle cx="18" cy="5.5" r="2.5" />
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="18.5" r="2.5" />
      <path d="m8.2 10.8 7.6-4M8.2 13.2l7.6 4" />
    </>,
  );
}

export function TerminalIcon({ className }: IconProps) {
  return base(
    className,
    <>
      <rect x="3" y="4" width="18" height="16" rx="3" />
      <path d="m7.5 9 3 3-3 3" />
      <path d="M12.5 15h4" />
    </>,
  );
}

export function TrashIcon({ className }: IconProps) {
  return base(
    className,
    <>
      <path d="M4 6.5h16" />
      <path d="M9 6.5V4.8A1.8 1.8 0 0 1 10.8 3h2.4A1.8 1.8 0 0 1 15 4.8v1.7" />
      <path d="m6 6.5.8 12.1A2.5 2.5 0 0 0 9.3 21h5.4a2.5 2.5 0 0 0 2.5-2.4L18 6.5" />
      <path d="M10 10.5v6M14 10.5v6" />
    </>,
  );
}

export function LockIcon({ className }: IconProps) {
  return base(
    className,
    <>
      <rect x="4.5" y="10" width="15" height="10.5" rx="2.5" />
      <path d="M8 10V7.5a4 4 0 0 1 8 0V10" />
      <path d="M12 14v2.5" />
    </>,
  );
}

export function PlusIcon({ className }: IconProps) {
  return base(className, <path d="M12 5v14M5 12h14" />);
}

export function LogOutIcon({ className }: IconProps) {
  return base(
    className,
    <>
      <path d="M14.5 4H18a2.5 2.5 0 0 1 2.5 2.5v11A2.5 2.5 0 0 1 18 20h-3.5" />
      <path d="M10 8.5 6.5 12l3.5 3.5" />
      <path d="M6.5 12H16" />
    </>,
  );
}

export function SaveIcon({ className }: IconProps) {
  return base(
    className,
    <>
      <path d="M5 3.5h11L19.5 7v13.5H5V3.5Z" />
      <path d="M8.5 3.5v5h6v-5" />
      <path d="M8.5 20.5v-6h7v6" />
    </>,
  );
}
