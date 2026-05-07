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
    businessUnit?: string | null;
    business_unit?: string | null;
    supplier?: string | null;
    type?: string | null;
    expectedDate?: string | null;
    dateFrom?: string | null;
    dateTo?: string | null;
  };
}

export interface InboundPurchaseOrderCountParams {
  businessUnit?: string | null;
  business_unit?: string | null;
}

export interface InboundSupplierMasterListParams {
  businessUnit?: string | null;
  business_unit?: string | null;
  searchValue?: string | null;
  status?: string | null;
}

export interface InboundUomMasterListParams {
  searchValue?: string | null;
  status?: string | null;
}

export interface InboundWarehouseMasterListParams {
  businessUnit?: string | null;
  business_unit?: string | null;
  searchValue?: string | null;
  status?: string | null;
}

export interface InboundSupplierMasterApi {
  id?: number | null;
  business_unit: string;
  supplier_code: string;
  supplier_name: string;
  status: string;
}

export interface InboundUomMasterApi {
  id?: number | null;
  uom_code: string;
  uom_name: string;
  status: string;
}

export interface InboundWarehouseMasterApi {
  id?: number | null;
  business_unit: string;
  warehouse_code: string;
  warehouse_name: string;
  status: string;
}

export interface InboundGoodsReceiptSearch {
  searchValue?: string;
  sort?: {
    createdDate?: SortOrder;
    actual_receipt_date?: SortOrder;
  };
  businessUnit?: string | null;
  business_unit?: string | null;
  status?: string | null;
  processState?: string | null;
  processStates?: string[] | null;
  receiptType?: string | null;
  receiptSourceType?: string | null;
  receiptSourceGroup?: 'STANDARD' | 'TEMP' | null;
  poLinkStatus?: string | null;
  dateFrom?: string | null;
  dateTo?: string | null;
}

export interface InboundGoodsReceiptCountParams {
  businessUnit?: string | null;
  business_unit?: string | null;
  status?: string | null;
}

export type InboundDashboardSummaryRange = 'DAILY' | 'WEEKLY' | 'OVERALL';

export interface InboundDashboardSummaryParams {
  businessUnit?: string | null;
  business_unit?: string | null;
  expectedDate?: string | null;
  range?: InboundDashboardSummaryRange | null;
  dateFrom?: string | null;
  dateTo?: string | null;
}

export type InboundExportReportKey =
  | 'PO_LIST'
  | 'WAREHOUSE_IR_RECEIVING'
  | 'QC_REVIEW'
  | 'SUPERVISOR_APPROVAL'
  | 'RECEIVING_STATUS_SUMMARY';

export interface InboundExportReportParams {
  reportKey: InboundExportReportKey;
  businessUnit?: string | null;
  dateFrom?: string | null;
  dateTo?: string | null;
  searchValue?: string | null;
  withoutPoOnly?: boolean | null;
  agingOnly?: boolean | null;
  qcPendingOnly?: boolean | null;
  supervisorPendingOnly?: boolean | null;
  issueOnly?: boolean | null;
}

export interface InboundReportParamData {
  key: string;
  type?: 'int' | 'double' | 'float' | 'string' | 'boolean' | 'date' | 'dateTime';
  value?: any;
}

export interface InboundGenericReportApi {
  reportName: string;
  reportPath: string;
  fileName: string;
  data: InboundReportParamData[];
}

export interface InboundPoItemApi {
  lineNumber?: number | null;
  lineStatus?: string | null;
  expectedDate?: string | null;
  isAging?: boolean | null;
  aging?: boolean | null;
  is_aging?: boolean | null;
  code: string;
  name: string;
  poQty: number;
  receivedQty: number;
  remainingQty: number;
  uom: string;
  warehouseCode?: string | null;
  supplier: string;
}

export interface InboundPoPrLinkApi {
  pr_number: string;
  pr_doc_entry?: string | null;
  pr_doc_num?: string | null;
  pr_uuid?: string | null;
}

export interface InboundPoReceiptLogItemApi {
  code: string;
  name: string;
  qty: number;
}

export interface InboundPoReceiptLogApi {
  receipt_id?: number | null;
  receiving_number: string;
  status_label: string;
  received_by?: string | null;
  received_at?: string | null;
  total_received_qty: number;
  received_items: InboundPoReceiptLogItemApi[];
  approved_items: InboundPoReceiptLogItemApi[];
  rejected_items: InboundPoReceiptLogItemApi[];
}

export interface InboundPurchaseOrderApi {
  id?: number | null;
  business_unit: string;
  po_number: string;
  sap_doc_entry?: number | null;
  sap_doc_num?: string | null;
  supplier: string;
  expected_date: string;
  expected_time: string;
  delivery_note_number?: string | null;
  items: InboundPoItemApi[];
  total_items: number;
  total_qty: number;
  type: string;
  doc_status?: string | null;
  pr_links?: InboundPoPrLinkApi[];
  receipt_logs?: InboundPoReceiptLogApi[];
}

export interface InboundGrPoReferenceApi {
  poNumber: string;
  businessUnit?: string | null;
  supplier?: string | null;
  expectedDate?: string | null;
  expectedTime?: string | null;
  deliveryNoteNumber?: string | null;
}

export interface InboundGrItemApi {
  poNumber?: string | null;
  poLineNumber?: number | null;
  supplier?: string | null;
  code: string;
  name: string;
  poQty: number;
  receiveQty: number;
  uom: string;
  condition: string;
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
  deliveryNoteNumber?: string | null;
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
  poNumber?: string | null;
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
  businessUnit: string;
  approvedGrNumber?: string | null;
  sapDocEntry?: number | null;
  sapDocNum?: string | null;
  sapGrNumber?: string | null;
  sapGrStatus?: string | null;
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
  qcSubmittedViewedBy?: string | null;
  qcSubmittedViewedAt?: string | null;
  qcRejectedViewedBy?: string | null;
  qcRejectedViewedAt?: string | null;
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
  agingPoItems: number;
  totalGRs: number;
  totalIrGrs: number;
}

export interface InboundSuccessPayloadResponse<T> {
  message: string;
  data: T;
}

export interface InboundSaveGoodsReceiptItemInput {
  poNumber?: string | null;
  poLineNumber?: number | null;
  supplier?: string | null;
  code: string;
  name: string;
  poQty: number;
  receiveQty: number;
  uom: string;
  condition: string;
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
  business_unit?: string | null;
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
  docNum?: string | null;
  sapDocNum?: string | null;
  poNumber?: string | null;
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

export interface InboundMarkQcBadgeViewedInput {
  id: number;
  status: 'Submitted' | 'Rejected';
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
