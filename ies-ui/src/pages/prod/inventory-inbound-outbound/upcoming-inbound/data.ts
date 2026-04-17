import type { SortOrder } from 'antd/es/table/interface';
import type {
  GoodsReceipt,
  GRActivity,
  GRDocumentChecklist,
  GRItem,
  InboundProcessState,
  POLinkStatus,
  PurchaseOrder,
  QcDecision,
} from './workflow';

export interface InboundPurchaseOrderSearch {
  searchValue?: string;
  sort?: {
    po_number?: SortOrder;
    expected_date?: SortOrder;
    createdDate?: SortOrder;
  };
  advanceSearch?: {
    type?: string | null;
    status?: string | null;
    expectedDate?: string | null;
  };
}

export interface InboundPurchaseOrderCountParams {
  status?: string | null;
}

export interface InboundGoodsReceiptSearch {
  searchValue?: string;
  sort?: {
    createdDate?: SortOrder;
    actual_receipt_date?: SortOrder;
  };
  status?: string | null;
  processState?: string | null;
}

export interface InboundGoodsReceiptCountParams {
  status?: string | null;
}

export type InboundDashboardSummaryRange = 'DAILY' | 'WEEKLY' | 'OVERALL';

export interface InboundDashboardSummaryParams {
  expectedDate?: string | null;
  range?: InboundDashboardSummaryRange | null;
  dateFrom?: string | null;
  dateTo?: string | null;
}

export interface InboundPoItemApi {
  code: string;
  name: string;
  poQty: number;
  receivedQty: number;
  remainingQty: number;
  uom: string;
  supplier: string;
}

export interface InboundPurchaseOrderApi {
  id?: number | null;
  po_number: string;
  supplier: string;
  expected_date: string;
  expected_time: string;
  delivery_note_number?: string | null;
  items: InboundPoItemApi[];
  total_items: number;
  total_qty: number;
  type: string;
  status: string;
}

export interface InboundGrPoReferenceApi {
  poNumber: string;
  supplier?: string | null;
  expectedDate?: string | null;
  expectedTime?: string | null;
}

export interface InboundGrItemApi {
  poNumber?: string | null;
  supplier?: string | null;
  code: string;
  name: string;
  poQty: number;
  receiveQty: number;
  uom: string;
  condition: string;
  binLocation: string;
  damagedQty?: number | null;
  rowNumber?: string | null;
  isMissing: boolean;
  missingRemark?: string | null;
  productDate?: string | null;
  manufacturingDate?: string | null;
  expiryDate?: string | null;
  bestBeforeDate?: string | null;
  batchNumber?: string | null;
  barcode?: string | null;
  qcDecision?: string | null;
  qcRemark?: string | null;
}

export interface InboundGrDocumentChecklistApi {
  vendorDN: boolean;
  goodsReceiptPOForm: boolean;
  pmrmLabelForm: boolean;
  pmrmStockCardForm: boolean;
  supportingDocs: SupportingDocReferenceApi[];
}

export interface SupportingDocReferenceApi {
  fileId?: string | null;
  fileName: string;
  source?: string | null;
}

export interface InboundPmrmLabelApi {
  itemCode: string;
  materialName: string;
  productionDate: string;
  expiryDate: string;
  batchNumber: string;
  quantity: number;
  receivingDate: string;
  receiverName: string;
  rowNumber: string;
}

export interface InboundGrActivityApi {
  grNumber: string;
  title: string;
  description?: string | null;
  performedBy?: string | null;
  timestamp?: string | null;
  state: string;
}

export interface InboundGoodsReceiptApi {
  id?: number | null;
  grNumber: string;
  receivingNumber: string;
  approvedGrNumber?: string | null;
  previousReceivingNumber?: string | null;
  previousApprovedGrNumber?: string | null;
  poNumber?: string | null;
  poReferences: InboundGrPoReferenceApi[];
  supplier: string;
  receiptType: string;
  receiptSourceType: string;
  poLinkStatus: string;
  tempReferenceNo?: string | null;
  pendingPoReason?: string | null;
  linkedPoNumber?: string | null;
  linkBlockReason?: string | null;
  receivedByUser?: string | null;
  onHoldWarehouseCode?: string | null;
  releaseWarehouseCode?: string | null;
  postingDate: string;
  actualReceiptDate: string;
  deliveryNoteNumber: string;
  items: InboundGrItemApi[];
  status: string;
  processState: string;
  displayStatus?: string | null;
  legacyStatus?: string | null;
  createdBy?: string | null;
  createdDate?: string | null;
  approvedBy?: string | null;
  approvedDate?: string | null;
  qcReviewedBy?: string | null;
  qcReviewedAt?: string | null;
  specMatch: boolean;
  qtyMatch: boolean;
  qualityCheckRequired: boolean;
  qcResult: string;
  exceptionReason?: string | null;
  workflowLabel: string;
  recordTypeLabel: string;
  isAppendable: boolean;
  documentChecklist: InboundGrDocumentChecklistApi;
  labelForms: InboundPmrmLabelApi[];
  activities: InboundGrActivityApi[];
}

export interface InboundStatusCountApi {
  status: string;
  count: number;
}

export interface InboundDashboardSummaryApi {
  expectedToday: number;
  qcPending: number;
  supervisorPending: number;
  approved: number;
  completed: number;
  exceptions: number;
  returnedForCorrection: number;
  awaitingPOLink: number;
  totalGRs: number;
}

export interface InboundSuccessPayloadResponse<T> {
  message: string;
  data: T;
}

export interface InboundSaveGoodsReceiptItemInput {
  poNumber?: string | null;
  supplier?: string | null;
  code: string;
  name: string;
  poQty: number;
  receiveQty: number;
  uom: string;
  condition: string;
  binLocation: string;
  damagedQty?: number | null;
  rowNumber?: string | null;
  isMissing?: boolean;
  missingRemark?: string | null;
  productDate?: string | null;
  manufacturingDate?: string | null;
  expiryDate?: string | null;
  bestBeforeDate?: string | null;
  batchNumber?: string | null;
  barcode?: string | null;
  qcDecision?: QcDecision | null;
  qcRemark?: string | null;
}

export interface InboundSaveGoodsReceiptInput {
  id?: number | null;
  gr_number?: string | null;
  receiving_number?: string | null;
  process_state?: string | null;
  po_number?: string | null;
  supplier: string;
  receipt_type: string;
  append_to_open_receiving?: boolean;
  receipt_source_type?: string;
  po_link_status?: string;
  temp_reference_no?: string | null;
  pending_po_reason?: string | null;
  linked_po_number?: string | null;
  received_by_user?: string | null;
  on_hold_warehouse_code?: string | null;
  release_warehouse_code?: string | null;
  posting_date: string;
  actual_receipt_date: string;
  delivery_note_number: string;
  poReferences?: InboundGrPoReferenceApi[];
  items: InboundSaveGoodsReceiptItemInput[];
  spec_match?: boolean;
  qty_match?: boolean;
  quality_check_required?: boolean;
  qc_result?: string;
  exception_reason?: string | null;
  documentChecklist?: InboundGrDocumentChecklistApi;
  labelForms?: InboundPmrmLabelApi[];
}

export interface InboundSaveActivityInput {
  gr_number: string;
  title: string;
  description?: string | null;
}

export interface InboundGoodsReceiptStatusChangeInput {
  id: number;
  statusChange: string;
  remark?: string | null;
  state: string;
  action?: string | null;
}

export interface InboundLinkPoInput {
  id: number;
  poNumber: string;
  note?: string | null;
}

export interface InboundQcReviewItemInput {
  code: string;
  poNumber?: string | null;
  qcDecision: QcDecision;
  qcRemark?: string | null;
}

export interface InboundSubmitQcReviewInput {
  id: number;
  items: InboundQcReviewItemInput[];
  documentChecklist?: InboundGrDocumentChecklistApi;
}

export interface InboundSubmitSupervisorReviewInput {
  id: number;
  action: string;
  note?: string | null;
}

export type UpcomingInboundPurchaseOrder = PurchaseOrder & {
  id?: number | null;
};
export type UpcomingInboundGoodsReceipt = GoodsReceipt & {
  id?: number | null;
  receivingNumber?: string;
  approvedGrNumber?: string | null;
  previousReceivingNumber?: string | null;
  previousApprovedGrNumber?: string | null;
  workflowLabel?: string;
  recordTypeLabel?: string;
  isAppendable?: boolean;
};
export type UpcomingInboundGoodsReceiptItem = GRItem;
export type UpcomingInboundActivity = GRActivity;
export type UpcomingInboundDocumentChecklist = GRDocumentChecklist;
export type UpcomingInboundProcessState = InboundProcessState;
export type UpcomingInboundPoLinkStatus = POLinkStatus;
