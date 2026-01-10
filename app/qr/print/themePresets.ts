export type QRThemePreset = {
  key: string;
  primary: string;
  secondary: string;
  background: string;
  border: string;
  text: string;
  mutedText: string;
};

const PRESETS: Record<string, QRThemePreset> = {
  orange: {
    key: 'orange',
    primary: '#f97316',
    secondary: '#fdba74',
    background: '#fff7ed',
    border: '#fed7aa',
    text: '#7c2d12',
    mutedText: '#9a3412',
  },
  blue: {
    key: 'blue',
    primary: '#2563eb',
    secondary: '#60a5fa',
    background: '#eff6ff',
    border: '#bfdbfe',
    text: '#0f172a',
    mutedText: '#1d4ed8',
  },
  green: {
    key: 'green',
    primary: '#059669',
    secondary: '#34d399',
    background: '#ecfdf5',
    border: '#a7f3d0',
    text: '#064e3b',
    mutedText: '#047857',
  },
  red: {
    key: 'red',
    primary: '#dc2626',
    secondary: '#f87171',
    background: '#fef2f2',
    border: '#fecaca',
    text: '#7f1d1d',
    mutedText: '#b91c1c',
  },
  purple: {
    key: 'purple',
    primary: '#9333ea',
    secondary: '#c084fc',
    background: '#faf5ff',
    border: '#e9d5ff',
    text: '#581c87',
    mutedText: '#7e22ce',
  },
  pink: {
    key: 'pink',
    primary: '#db2777',
    secondary: '#f472b6',
    background: '#fdf2f8',
    border: '#fbcfe8',
    text: '#831843',
    mutedText: '#be185d',
  },
  cyan: {
    key: 'cyan',
    primary: '#0891b2',
    secondary: '#22d3ee',
    background: '#ecfeff',
    border: '#a5f3fc',
    text: '#083344',
    mutedText: '#0e7490',
  },
  lime: {
    key: 'lime',
    primary: '#65a30d',
    secondary: '#bef264',
    background: '#f7fee7',
    border: '#d9f99d',
    text: '#365314',
    mutedText: '#4d7c0f',
  },
  amber: {
    key: 'amber',
    primary: '#d97706',
    secondary: '#fbbf24',
    background: '#fffbeb',
    border: '#fde68a',
    text: '#78350f',
    mutedText: '#b45309',
  },
  indigo: {
    key: 'indigo',
    primary: '#4338ca',
    secondary: '#818cf8',
    background: '#eef2ff',
    border: '#c7d2fe',
    text: '#312e81',
    mutedText: '#4338ca',
  },
  rose: {
    key: 'rose',
    primary: '#e11d48',
    secondary: '#fb7185',
    background: '#fff1f2',
    border: '#fecdd3',
    text: '#881337',
    mutedText: '#be123c',
  },
  teal: {
    key: 'teal',
    primary: '#0d9488',
    secondary: '#2dd4bf',
    background: '#f0fdfa',
    border: '#99f6e4',
    text: '#115e59',
    mutedText: '#0f766e',
  },
};

function clampChannel(value: number) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function lighten(color: string, ratio: number) {
  const hex = color.replace('#', '');
  if (hex.length !== 6) return color;
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  const blend = (channel: number) => clampChannel(channel + (255 - channel) * ratio);
  return `#${[r, g, b].map(blend).map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

export const getQRThemePreset = (theme?: string | null, customColor?: string | null): QRThemePreset => {
  if (theme === 'custom' && customColor) {
    const sanitized = customColor.startsWith('#') ? customColor : `#${customColor}`;
    return {
      key: 'custom',
      primary: sanitized,
      secondary: lighten(sanitized, 0.25),
      background: lighten(sanitized, 0.85),
      border: lighten(sanitized, 0.65),
      text: '#0f172a',
      mutedText: '#475569',
    };
  }

  if (theme && PRESETS[theme]) {
    return PRESETS[theme];
  }

  return PRESETS.orange;
};
