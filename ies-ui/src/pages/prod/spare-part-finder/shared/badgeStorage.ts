const BADGE_STORAGE_PREFIX = 'spf:badge-seen';

const normalizeCount = (value: unknown) => {
  const count = Number(value);
  if (!Number.isFinite(count)) return 0;
  return Math.max(0, Math.floor(count));
};

const buildStorageKey = (badgeKey: string, userLogin?: string) =>
  `${BADGE_STORAGE_PREFIX}:${userLogin || 'anonymous'}:${badgeKey}`;

export const readSeenBadgeCount = (badgeKey: string, userLogin?: string) => {
  if (typeof window === 'undefined') return 0;

  try {
    const raw = window.localStorage.getItem(buildStorageKey(badgeKey, userLogin));
    return normalizeCount(raw);
  } catch {
    return 0;
  }
};

export const markBadgeSeen = (badgeKey: string, currentCount: number, userLogin?: string) => {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(
      buildStorageKey(badgeKey, userLogin),
      String(normalizeCount(currentCount)),
    );
  } catch {
    // Ignore localStorage errors and keep badge non-persistent.
  }
};

export const getUnreadBadgeCount = (badgeKey: string, currentCount: number, userLogin?: string) => {
  const current = normalizeCount(currentCount);
  const seen = readSeenBadgeCount(badgeKey, userLogin);
  return Math.max(0, current - seen);
};
