export const SPF_WAREHOUSE_BADGE_REFRESH_EVENT = 'spf:warehouse-badge-refresh';

export function emitWarehouseBadgeRefresh() {
  window.dispatchEvent(new CustomEvent(SPF_WAREHOUSE_BADGE_REFRESH_EVENT));
}

export function subscribeWarehouseBadgeRefresh(handler: () => void) {
  window.addEventListener(SPF_WAREHOUSE_BADGE_REFRESH_EVENT, handler);

  return () => {
    window.removeEventListener(SPF_WAREHOUSE_BADGE_REFRESH_EVENT, handler);
  };
}
