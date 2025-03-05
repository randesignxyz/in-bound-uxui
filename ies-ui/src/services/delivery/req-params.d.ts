import { Moment } from "moment";

export type QueueTicketAdvanceSearchParams = {
  activeOnly?: true,
  status: 'ALL' | 'QUEUED' | 'SERVING' | 'SERVED' | 'HOLD' | 'CANCELED';
};

export type LoadingAdvanceSearchParams = {
  status: 'ALL' | 'PENDING' | 'LOADING' | 'LOADED' | 'CANCELED';
};

export type DeliveryAdvanceSearchParams = {
  status: 'ALL' | 'PENDING' | 'IN_PROGRESS' | 'DELIVERED' | 'CANCELED';
  settlementStatus: 'All' | 'UN_SETTLED' | 'SETTLED';
};

export type DeliveryCashCollectionParams = {
  status: 'ALL' | 'UN_SETTLED' | 'SETTLED';
};

export type ReviewerParams = {
  status: 'ALL' | 'PENDING' | 'VERIFIED'
}

export type ReviewParams = {
  status: 'ALL' | 'PENDING' | 'VERIFIED'
}

export type SaveLoadedParam = {
  id: number;
  loadingTeamId?: number;
  loadedRemarks?: string;
  items: SaveLoadedItemParam[];
  transferZeroLoaded?: boolean
};

export type startLoadingParam = {
  id: number;
  loadingTeamId?: number;
  remarks?: string;
  loadingType?:number | null
};

export type ChangeRequestParam = {
  loadingId: number;
  approved: boolean;
  remarks?: string;
};

export type SaveLoadedItemParam = {
  id: number;
  loadedQty: number;
};

export type SaveSettlementParams = {
  deliveryId: number;
  settledInvoices: SettledInvoice[];
  remarks?: string;
};

export type SettledInvoice = {
  id: number;
  settledAmount: number;
  refDoc?: String;
  validDate?: Moment;
};
