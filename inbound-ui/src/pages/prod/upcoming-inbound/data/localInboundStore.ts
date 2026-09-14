import type { GoodsReceipt, IRPlan, PurchaseOrder } from '../core/type';
import {
  SAMPLE_GOODS_RECEIPTS,
  SAMPLE_IR_PLANS,
  SAMPLE_PURCHASE_ORDERS,
} from './inboundMockStore';

const STORAGE_KEY = 'ies.inbound.demo.v1';

export interface LocalInboundSnapshot {
  irPlans: IRPlan[];
  purchaseOrders: PurchaseOrder[];
  receipts: GoodsReceipt[];
}

const defaultSnapshot = (): LocalInboundSnapshot => ({
  irPlans: SAMPLE_IR_PLANS,
  purchaseOrders: SAMPLE_PURCHASE_ORDERS,
  receipts: SAMPLE_GOODS_RECEIPTS,
});

export const loadLocalInboundSnapshot = (): LocalInboundSnapshot => {
  if (typeof window === 'undefined') {
    return defaultSnapshot();
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return defaultSnapshot();
    }

    const parsed = JSON.parse(stored) as Partial<LocalInboundSnapshot>;
    if (
      !Array.isArray(parsed.irPlans) ||
      !Array.isArray(parsed.purchaseOrders) ||
      !Array.isArray(parsed.receipts)
    ) {
      return defaultSnapshot();
    }

    return {
      irPlans: parsed.irPlans,
      purchaseOrders: parsed.purchaseOrders,
      receipts: parsed.receipts,
    };
  } catch {
    return defaultSnapshot();
  }
};

export const saveLocalInboundSnapshot = (snapshot: LocalInboundSnapshot): void => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // The prototype remains usable if browser storage is unavailable or full.
  }
};

export const resetLocalInboundSnapshot = (): LocalInboundSnapshot => {
  const snapshot = defaultSnapshot();
  saveLocalInboundSnapshot(snapshot);
  return snapshot;
};