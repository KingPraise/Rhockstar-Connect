export interface ThemeConfig {
  cover: string;
  avatar: string;
  button: string;
  accent: string;
  glow: string;
  border: string;
  badge: string;
  appBg: string;
  radialGlow: string;
}

export const getThemeClasses = (theme?: string): ThemeConfig => {
  switch (theme) {
    case 'ocean':
      return {
        cover: 'from-blue-600 via-sky-500 to-blue-600',
        avatar: 'from-blue-600 to-sky-500',
        button: 'from-sky-500 to-blue-600',
        accent: 'bg-sky-500',
        glow: 'from-sky-500/25 via-blue-600/10 to-transparent',
        border: 'border-sky-500/30',
        badge: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
        appBg: 'bg-[#031329]',
        radialGlow: 'bg-[radial-gradient(circle_at_20%_20%,rgba(14,165,233,0.18),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.18),transparent_50%)]'
      };
    case 'emerald':
      return {
        cover: 'from-emerald-600 via-teal-500 to-emerald-600',
        avatar: 'from-emerald-600 to-teal-500',
        button: 'from-teal-500 to-emerald-600',
        accent: 'bg-emerald-500',
        glow: 'from-emerald-500/25 via-teal-600/10 to-transparent',
        border: 'border-emerald-500/30',
        badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        appBg: 'bg-[#021c13]',
        radialGlow: 'bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.18),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(20,184,166,0.18),transparent_50%)]'
      };
    case 'rose':
      return {
        cover: 'from-rose-600 via-pink-500 to-rose-600',
        avatar: 'from-rose-600 to-pink-500',
        button: 'from-pink-500 to-rose-600',
        accent: 'bg-rose-500',
        glow: 'from-rose-500/25 via-pink-600/10 to-transparent',
        border: 'border-rose-500/30',
        badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
        appBg: 'bg-[#1f0614]',
        radialGlow: 'bg-[radial-gradient(circle_at_20%_20%,rgba(244,63,94,0.18),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(236,72,153,0.18),transparent_50%)]'
      };
    case 'amber':
      return {
        cover: 'from-amber-600 via-yellow-500 to-amber-600',
        avatar: 'from-amber-600 to-yellow-500',
        button: 'from-yellow-500 to-amber-600',
        accent: 'bg-amber-500',
        glow: 'from-amber-500/25 via-yellow-600/10 to-transparent',
        border: 'border-amber-500/30',
        badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        appBg: 'bg-[#1c1303]',
        radialGlow: 'bg-[radial-gradient(circle_at_20%_20%,rgba(245,158,11,0.22),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(234,179,8,0.22),transparent_50%)]'
      };
    default:
      return {
        cover: 'from-brand-purple via-brand to-brand-purple',
        avatar: 'from-brand-purple to-brand',
        button: 'from-brand to-brand-purple',
        accent: 'bg-brand',
        glow: 'from-brand/25 via-brand-purple/10 to-transparent',
        border: 'border-brand/30',
        badge: 'bg-brand/10 text-brand border-brand/20',
        appBg: 'bg-[#020617]',
        radialGlow: 'bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.08),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(139,92,246,0.08),transparent_50%)]'
      };
  }
};
