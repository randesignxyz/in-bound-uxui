/**
 * Shared in-memory shipments store.
 * Warehouse writes shipments here; requester drawer reads from here.
 * In a real app this would be a backend API / global state (React Query / Zustand).
 */

export interface ShipmentLine {
  productId: string;
  itemName: string;
  quantity: number;
  uom?: string;
}

export type ShipmentStatus = 'ready_to_pickup' | 'confirmed_picked' | 'completed';

export interface Shipment {
  id: string;
  shipmentNo: number;
  createdAt: string;
  createdBy: string;
  lines: ShipmentLine[];
  /** Status of this individual shipment batch */
  status: ShipmentStatus;
  /** ISO timestamp when warehouse confirmed the requester picked this up */
  confirmedAt?: string;
  confirmedBy?: string;
}

export interface RequestShipmentState {
  /** Current overall status as set by warehouse */
  status: string;
  shipments: Shipment[];
  /** Quantities already confirmed picked up by requester, per productId */
  pickedUp: Record<string, number>;
  /** Current working draft (accumulated but not yet committed to a shipment) */
  draft: Record<string, number>;
}

type Listener = () => void;

const store = new Map<string, RequestShipmentState>();
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((l) => l());
}

export const shipmentsStore = {
  get(requestId: string): RequestShipmentState | undefined {
    return store.get(requestId);
  },

  setStatus(requestId: string, status: string) {
    const existing = store.get(requestId) ?? { status: '', shipments: [], pickedUp: {}, draft: {} };
    store.set(requestId, { ...existing, status });
    notify();
  },

  /** Update the in-progress draft quantities (not yet committed) */
  saveDraft(requestId: string, draft: Record<string, number>) {
    const existing = store.get(requestId) ?? { status: 'in-progress', shipments: [], pickedUp: {}, draft: {} };
    store.set(requestId, { ...existing, status: 'in-progress', draft });
    notify();
  },

  /** Commit the draft into a new shipment batch (Save & Pick up) */
  addShipment(requestId: string, shipment: Omit<Shipment, 'status'>, overallStatus: string) {
    const existing = store.get(requestId) ?? { status: '', shipments: [], pickedUp: {}, draft: {} };
    const newShipment: Shipment = { ...shipment, status: 'ready_to_pickup' };
    store.set(requestId, {
      ...existing,
      status: overallStatus,
      shipments: [...existing.shipments, newShipment],
      draft: {}, // clear draft after committing
    });
    notify();
  },

  /** Warehouse confirms requester has picked up a specific shipment */
  confirmShipmentPicked(requestId: string, shipmentId: string, confirmedBy: string) {
    const existing = store.get(requestId);
    if (!existing) return;

    const updatedShipments = existing.shipments.map((s) =>
      s.id === shipmentId
        ? { ...s, status: 'completed' as ShipmentStatus, confirmedAt: new Date().toISOString(), confirmedBy }
        : s,
    );

    // Calculate overall status: if ALL shipments are completed, mark request as completed
    const allCompleted = updatedShipments.length > 0 && updatedShipments.every((s) => s.status === 'completed');
    const newOverallStatus = allCompleted ? 'completed' : existing.status;

    store.set(requestId, { ...existing, shipments: updatedShipments, status: newOverallStatus });
    notify();
  },

  confirmPickup(requestId: string, productIds: string[], shipmentId: string, items: ShipmentLine[]) {
    const existing = store.get(requestId) ?? { status: '', shipments: [], pickedUp: {}, draft: {} };
    const nextPickedUp = { ...existing.pickedUp };
    items.forEach((it) => {
      if (productIds.includes(it.productId)) {
        nextPickedUp[it.productId] = (nextPickedUp[it.productId] || 0) + it.quantity;
      }
    });
    store.set(requestId, { ...existing, pickedUp: nextPickedUp });
    notify();
  },

  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
