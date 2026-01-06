const DEFAULT_ASSET_BASE = (process.env.NEXT_PUBLIC_ASSETS_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://scanela.com').replace(/\/$/, '');

const isAbsoluteUrl = (value: string) => /^(https?:|data:|blob:)/i.test(value);

export const resolvePublicAssetUrl = (value?: string | null): string => {
  if (!value) return '';

  if (isAbsoluteUrl(value)) {
    return value;
  }

  if (value.startsWith('/')) {
    return `${DEFAULT_ASSET_BASE}${value}`;
  }

  return value;
};
