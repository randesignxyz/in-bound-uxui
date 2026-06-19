import type {
  InboundProcessState,
  LegacyGRStatus,
  QcDecision,
  GRDocumentChecklist,
  GRScenarioMeta,
  GRActivity,
} from './workflow';

export type GoodsReceiptSourceType = 'PLANNED' | 'UNPLANNED_WITH_PO' | 'TEMP_NO_PO';

export type POLinkStatus = 'NOT_REQUIRED' | 'WAITING_PO' | 'LINKED';

export interface GRItem {
  id?: number;             // DB primary key — echo back as `itemId` in QC review for exact matching
  poLineNumber?: number;
  code: string;
  name: string;
  poNumber: string;
  expectedDate?: string;
  supplier: string;
  poQty: number;
  receiveQty: number;
  uom: string;
  productDate: string;
  expiryDate: string;
  batchNumber: string;
  barcode: string;
  deliveryNoteNumber?: string;
  isDeferred?: boolean;
  isMissing?: boolean;
  missingRemark?: string;
  qcDecision?: QcDecision;
  qcRejectedQty?: number;
  qcRemark?: string;
}

export type ReceiptPoGroupedItemShape = Pick<
  GRItem,
  'poNumber' | 'supplier' | 'poQty' | 'receiveQty' | 'code'
>;

export interface ReceiptPoItemGroup<TItem extends ReceiptPoGroupedItemShape = GRItem> {
  key: string;
  poNumber?: string;
  displayPoNumber: string;
  supplier: string;
  expectedDate?: string;
  expectedTime?: string;
  itemCount: number;
  totalPoQty: number;
  totalReceiveQty: number;
  items: TItem[];
}

export interface GoodsReceipt {
  id?: number;
  grNumber: string;
  receivingNumber?: string;
  businessUnit?: string;
  approvedGrNumber?: string;
  sapDocEntry?: number;
  sapDocNum?: string;
  sapGrNumber?: string;
  sapGrStatus?: string;
  previousReceivingNumber?: string;
  previousApprovedGrNumber?: string;
  poNumber: string;
  supplier: string;
  poReferences: Array<{
    poNumber: string;
    businessUnit?: string;
    supplier: string;
    expectedDate?: string;
    expectedTime?: string;
    deliveryNoteNumber?: string;
  }>;
  supplierNames: string[];
  receiptType: 'Planned' | 'Unplanned';
  receiptSourceType: GoodsReceiptSourceType;
  poLinkStatus: POLinkStatus;
  tempReferenceNo?: string;
  pendingPOReason?: string;
  linkedPoNumber?: string;
  linkedPoLinkedAt?: string;
  linkedPoLinkedBy?: string;
  linkBlockReason?: string;
  expectedDate?: string;
  expectedTime?: string;
  postingDate: string;
  actualReceiptDate: string;
  deliveryNoteNumber: string;
  receiverWarehouseName: string;
  items: GRItem[];
  status: LegacyGRStatus;
  processState: InboundProcessState;
  displayStatus?: string;
  legacyStatus?: LegacyGRStatus;
  createdBy: string;
  createdDate: string;
  approvedBy?: string;
  approvedDate?: string;
  qcSubmittedViewedBy?: string;
  qcSubmittedViewedAt?: string;
  qcRejectedViewedBy?: string;
  qcRejectedViewedAt?: string;
  specMatch: boolean;
  qtyMatch: boolean;
  qualityCheckRequired: boolean;
  qcResult: 'Pending' | 'Pass' | 'Rejected';
  exceptionReason?: string;
  documentChecklist: GRDocumentChecklist;
  scenario: GRScenarioMeta;
  activities: GRActivity[];
}
