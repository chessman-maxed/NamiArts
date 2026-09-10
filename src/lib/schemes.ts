export interface SchemeItem {
  id: string;
  badge: string;
  title: string;
  description: string;
  validity?: string;
  discount: string;
  ctaText?: string;
  ctaLink?: string;
  active: boolean;
  highlight?: boolean;
  expiresAt?: string | null; // ISO String or null
  durationDays?: number | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createdAt?: any;
}

export const DEFAULT_SCHEMES: SchemeItem[] = [];
