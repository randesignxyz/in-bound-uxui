import dayjs from 'dayjs';
import type {
  InboundDashboardSummaryApi,
  InboundGoodsReceiptApi,
  InboundGrActivityApi,
  InboundGrDocumentChecklistApi,
  InboundGrItemApi,
  InboundPoItemApi,
  InboundPurchaseOrderApi,
  SupportingDocReferenceApi,
  UpcomingInboundActivity,
  UpcomingInboundDocumentChecklist,
  UpcomingInboundGoodsReceipt,
  UpcomingInboundGoodsReceiptItem,
  UpcomingInboundPoLinkStatus,
  UpcomingInboundProcessState,
  UpcomingInboundPurchaseOrder,
} from './data';
import {
  buildActivities,
  mapProcessStateToLegacyStatus,
  type GRScenarioMeta,
  type GRScenarioPath,
  type LegacyGRStatus,
  type QcDecision,
  type SupportingDocReference,
  type SupportingDocSource,
} from './workflow';

const PROCESS_STATE_VALUES: UpcomingInboundProcessState[] = [
  'RECEIVED_CHECKING',
  'MISMATCH_EXCEPTION',
  'RECEIPT_CONFIRMED',
  'STORED_ON_HOLD',
  'GRPO_DRAFT',
  'QC_PENDING',
  'QC_PASSED',
  'PENDING_SUPERVISOR_REVIEW',
  'CORRECTION_REQUIRED',
  'MERGED_TO_SUPERVISOR_REVIEW',
  'SUPERVISOR_APPROVED',
  'TRANSFERRED_TO_PM_RM_WH',
  'FIN_SUBMITTED',
  'DAILY_CLOSED',
  'MONTHLY_SUMMARY_READY',
];

const PO_STATUS_VALUES: UpcomingInboundPurchaseOrder['status'][] = [
  'Expected',
  'Partial',
  'Fully Received',
];

const PO_TYPE_VALUES: UpcomingInboundPurchaseOrder['type'][] = ['Planned', 'Unplanned'];

const RECEIPT_TYPE_VALUES: UpcomingInboundGoodsReceipt['receiptType'][] = ['Planned', 'Unplanned'];

const PO_LINK_STATUS_VALUES: UpcomingInboundPoLinkStatus[] = ['NOT_REQUIRED', 'WAITING_PO', 'LINKED'];

const RECEIPT_SOURCE_VALUES: UpcomingInboundGoodsReceipt['receiptSourceType'][] = [
  'PLANNED',
  'UNPLANNED_WITH_PO',
  'TEMP_NO_PO',
];

const QC_DECISION_VALUES: QcDecision[] = ['Pass', 'Reject'];

const LEGACY_STATUS_VALUES: LegacyGRStatus[] = [
  'Draft',
  'Pending Approval',
  'Approved',
  'Posted',
  'Merged',
  'Correction Required',
];

export function mapInboundPurchaseOrder(api: InboundPurchaseOrderApi): UpcomingInboundPurchaseOrder {
  const items = readArray<InboundPoItemApi>(api, 'items');

  return {
    id: readValue<number | null>(api, 'id') ?? undefined,
    businessUnit: readString(api, 'businessUnit', 'business_unit'),
    poNumber: readString(api, 'poNumber', 'po_number'),
    supplier: readString(api, 'supplier'),
    expectedDate: readString(api, 'expectedDate', 'expected_date'),
    expectedTime: readString(api, 'expectedTime', 'expected_time'),
    deliveryNoteNumber: readValue<string | null>(api, 'deliveryNoteNumber', 'delivery_note_number') ?? undefined,
    items: items.map(mapInboundPurchaseOrderItem),
    totalItems: readNumber(api, 'totalItems', 'total_items') ?? items.length,
    totalQty:
      readNumber(api, 'totalQty', 'total_qty') ??
      items.reduce((sum, item) => sum + (readNumber(item, 'poQty', 'po_qty') ?? 0), 0),
    type: normalizeEnum(readString(api, 'type'), PO_TYPE_VALUES, 'Planned'),
    status: normalizeEnum(readString(api, 'status'), PO_STATUS_VALUES, 'Expected'),
  };
}

export function mapInboundPurchaseOrders(orders: InboundPurchaseOrderApi[]): UpcomingInboundPurchaseOrder[] {
  return orders.map(mapInboundPurchaseOrder);
}

export function mapInboundGoodsReceipt(api: InboundGoodsReceiptApi): UpcomingInboundGoodsReceipt {
  const poReferences = readArray<InboundGoodsReceiptApi['poReferences'][number]>(
    api,
    'poReferences',
    'po_references',
  );
  const items = readArray<InboundGrItemApi>(api, 'items');
  const activities = readArray<InboundGrActivityApi>(api, 'activities');
  const processState = normalizeEnum(readString(api, 'processState', 'process_state'), PROCESS_STATE_VALUES, 'GRPO_DRAFT');
  const createdDate = formatDisplayTimestamp(readValue<string | null>(api, 'createdDate', 'created_date'));
  const workflowLabel = readString(api, 'workflowLabel', 'workflow_label');
  const recordTypeLabel = readString(api, 'recordTypeLabel', 'record_type_label');
  const fallbackStepTitle = workflowLabel || recordTypeLabel || mapProcessStateToLegacyStatus(processState);
  const qcResult = normalizeQcResult(readString(api, 'qcResult', 'qc_result'), processState);

  return {
    id: readValue<number | null>(api, 'id') ?? undefined,
    grNumber: readString(api, 'grNumber', 'gr_number'),
    receivingNumber: readString(api, 'receivingNumber', 'receiving_number'),
    businessUnit: readString(api, 'businessUnit', 'business_unit'),
    approvedGrNumber: readValue<string | null>(api, 'approvedGrNumber', 'approved_gr_number') ?? undefined,
    previousReceivingNumber:
      readValue<string | null>(api, 'previousReceivingNumber', 'previous_receiving_number') ?? undefined,
    previousApprovedGrNumber:
      readValue<string | null>(api, 'previousApprovedGrNumber', 'previous_approved_gr_number') ?? undefined,
    poNumber: readString(api, 'poNumber', 'po_number') || readString(poReferences[0], 'poNumber', 'po_number'),
    supplier: readString(api, 'supplier'),
    poReferences:
      poReferences.length > 0
        ? poReferences.map((reference) => ({
            poNumber: readString(reference, 'poNumber', 'po_number'),
            businessUnit: readValue<string | null>(reference, 'businessUnit', 'business_unit') ?? undefined,
            supplier: readValue<string | null>(reference, 'supplier') ?? readString(api, 'supplier'),
            expectedDate: readValue<string | null>(reference, 'expectedDate', 'expected_date') ?? undefined,
            expectedTime: readValue<string | null>(reference, 'expectedTime', 'expected_time') ?? undefined,
            deliveryNoteNumber:
              readValue<string | null>(reference, 'deliveryNoteNumber', 'delivery_note_number') ?? undefined,
          }))
        : buildFallbackPoReferences(api),
    supplierNames: uniqueStrings([
      readString(api, 'supplier'),
      ...poReferences.map((reference) => readValue<string | null>(reference, 'supplier') ?? ''),
    ]),
    receiptType: normalizeEnum(readString(api, 'receiptType', 'receipt_type'), RECEIPT_TYPE_VALUES, 'Planned'),
    receiptSourceType: normalizeEnum(
      readString(api, 'receiptSourceType', 'receipt_source_type'),
      RECEIPT_SOURCE_VALUES,
      'PLANNED',
    ),
    poLinkStatus: normalizeEnum(readString(api, 'poLinkStatus', 'po_link_status'), PO_LINK_STATUS_VALUES, 'NOT_REQUIRED'),
    tempReferenceNo: readValue<string | null>(api, 'tempReferenceNo', 'temp_reference_no') ?? undefined,
    pendingPOReason: readValue<string | null>(api, 'pendingPoReason', 'pending_po_reason') ?? undefined,
    linkedPoNumber: readValue<string | null>(api, 'linkedPoNumber', 'linked_po_number') ?? undefined,
    linkBlockReason: readValue<string | null>(api, 'linkBlockReason', 'link_block_reason') ?? undefined,
    expectedDate: readValue<string | null>(poReferences[0], 'expectedDate', 'expected_date') ?? undefined,
    expectedTime: readValue<string | null>(poReferences[0], 'expectedTime', 'expected_time') ?? undefined,
    postingDate: readString(api, 'postingDate', 'posting_date'),
    actualReceiptDate: readString(api, 'actualReceiptDate', 'actual_receipt_date'),
    deliveryNoteNumber: readString(api, 'deliveryNoteNumber', 'delivery_note_number'),
    receiverWarehouseName:
      readValue<string | null>(api, 'onHoldWarehouseCode', 'on_hold_warehouse_code') ??
      readValue<string | null>(api, 'releaseWarehouseCode', 'release_warehouse_code') ??
      readValue<string | null>(api, 'receivedByUser', 'received_by_user') ??
      'On-Hold Warehouse',
    items: items.map(mapInboundGoodsReceiptItem),
    status: normalizeLegacyStatus(readValue<string | null>(api, 'status'), processState),
    processState,
    displayStatus: readValue<string | null>(api, 'displayStatus', 'display_status') ?? undefined,
    legacyStatus: normalizeLegacyStatus(readValue<string | null>(api, 'legacyStatus', 'legacy_status'), processState),
    createdBy: readValue<string | null>(api, 'createdBy', 'created_by') ?? '',
    createdDate,
    approvedBy:
      readValue<string | null>(api, 'approvedBy', 'approved_by') ??
      readValue<string | null>(api, 'qcReviewedBy', 'qc_reviewed_by') ??
      undefined,
    approvedDate: formatDisplayTimestamp(
      readValue<string | null>(api, 'approvedDate', 'approved_date') ??
        readValue<string | null>(api, 'qcReviewedAt', 'qc_reviewed_at'),
    ),
    qcSubmittedViewedBy:
      readValue<string | null>(api, 'qcSubmittedViewedBy', 'qc_submitted_viewed_by') ?? undefined,
    qcSubmittedViewedAt: formatDisplayTimestamp(
      readValue<string | null>(api, 'qcSubmittedViewedAt', 'qc_submitted_viewed_at'),
    ),
    qcRejectedViewedBy:
      readValue<string | null>(api, 'qcRejectedViewedBy', 'qc_rejected_viewed_by') ?? undefined,
    qcRejectedViewedAt: formatDisplayTimestamp(
      readValue<string | null>(api, 'qcRejectedViewedAt', 'qc_rejected_viewed_at'),
    ),
    specMatch: readBoolean(api, 'specMatch', 'spec_match'),
    qtyMatch: readBoolean(api, 'qtyMatch', 'qty_match'),
    qualityCheckRequired: readBoolean(api, 'qualityCheckRequired', 'quality_check_required'),
    qcResult,
    exceptionReason: readValue<string | null>(api, 'exceptionReason', 'exception_reason') ?? undefined,
    workflowLabel,
    recordTypeLabel,
    isAppendable: readBoolean(api, 'isAppendable', 'is_appendable'),
    documentChecklist: mapInboundDocumentChecklist(
      readValue<InboundGrDocumentChecklistApi | undefined>(api, 'documentChecklist', 'document_checklist'),
    ),
    scenario: buildInboundScenarioMeta(api, processState, fallbackStepTitle),
    activities:
      activities.length > 0
        ? activities.map(mapInboundActivity)
        : buildActivities(processState, createdDate, fallbackStepTitle),
  };
}

export function mapInboundGoodsReceipts(receipts: InboundGoodsReceiptApi[]): UpcomingInboundGoodsReceipt[] {
  return receipts.map(mapInboundGoodsReceipt);
}

export function mapInboundDashboardSummary(summary: InboundDashboardSummaryApi): InboundDashboardSummaryApi {
  return {
    expectedToday: summary.expectedToday,
    qcPending: summary.qcPending,
    supervisorPending: summary.supervisorPending,
    approved: summary.approved,
    completed: summary.completed,
    exceptions: summary.exceptions,
    returnedForCorrection: summary.returnedForCorrection,
    awaitingPOLink: summary.awaitingPOLink,
    totalGRs: summary.totalGRs,
    totalIrGrs: summary.totalIrGrs ?? summary.totalGRs,
  };
}

function mapInboundPurchaseOrderItem(item: InboundPoItemApi): UpcomingInboundPurchaseOrder['items'][number] {
  return {
    code: readString(item, 'code'),
    name: readString(item, 'name'),
    poQty: readNumber(item, 'poQty', 'po_qty') ?? 0,
    receivedQty: readNumber(item, 'receivedQty', 'received_qty') ?? 0,
    remainingQty: readNumber(item, 'remainingQty', 'remaining_qty') ?? 0,
    uom: readString(item, 'uom'),
    supplier: readString(item, 'supplier'),
  };
}

function mapInboundGoodsReceiptItem(item: InboundGrItemApi): UpcomingInboundGoodsReceiptItem {
  return {
    code: readString(item, 'code'),
    name: readString(item, 'name'),
    poNumber: readValue<string | null>(item, 'poNumber', 'po_number') ?? '',
    supplier: readValue<string | null>(item, 'supplier') ?? '',
    poQty: readNumber(item, 'poQty', 'po_qty') ?? 0,
    receiveQty: readNumber(item, 'receiveQty', 'receive_qty') ?? 0,
    uom: readString(item, 'uom'),
    productDate:
      readValue<string | null>(item, 'productDate', 'product_date') ??
      readValue<string | null>(item, 'manufacturingDate', 'manufacturing_date') ??
      '',
    expiryDate:
      readValue<string | null>(item, 'expiryDate', 'expiry_date') ??
      readValue<string | null>(item, 'bestBeforeDate', 'best_before_date') ??
      '',
    batchNumber: readValue<string | null>(item, 'batchNumber', 'batch_number') ?? '',
    barcode: readValue<string | null>(item, 'barcode') ?? '',
    deliveryNoteNumber: readValue<string | null>(item, 'deliveryNoteNumber', 'delivery_note_number') ?? undefined,
    isMissing: readBoolean(item, 'isMissing', 'is_missing'),
    missingRemark: readValue<string | null>(item, 'missingRemark', 'missing_remark') ?? undefined,
    qcDecision: normalizeQcDecision(readValue<string | null>(item, 'qcDecision', 'qc_decision')),
    qcRemark: readValue<string | null>(item, 'qcRemark', 'qc_remark') ?? undefined,
  };
}

function mapInboundDocumentChecklist(
  checklist?: InboundGrDocumentChecklistApi,
): UpcomingInboundDocumentChecklist {
  return {
    vendorDN: readBoolean(checklist, 'vendorDN', 'vendor_dn'),
    goodsReceiptPOForm: readBoolean(checklist, 'goodsReceiptPOForm', 'goods_receipt_po_form'),
    pmrmStockCardForm: readBoolean(checklist, 'pmrmStockCardForm', 'pmrm_stock_card_form'),
    supportingDocs: readArray<SupportingDocReferenceApi>(checklist, 'supportingDocs', 'supporting_docs').map(mapSupportingDoc),
  };
}

function mapSupportingDoc(doc: SupportingDocReferenceApi): SupportingDocReference {
  return {
    fileId: readValue<string | null>(doc, 'fileId', 'file_id') ?? undefined,
    fileName: readString(doc, 'fileName', 'file_name'),
    source: normalizeSupportingDocSource(readValue<string | null>(doc, 'source')),
    poNumber: readValue<string | null>(doc, 'poNumber', 'po_number') ?? undefined,
  };
}

function normalizeSupportingDocSource(value?: string | null): SupportingDocSource | null | undefined {
  switch (value) {
    case 'WAREHOUSE':
    case 'QC':
    case 'SUPERVISOR':
      return value;
    case null:
      return null;
    default:
      return undefined;
  }
}

export function mapInboundActivity(activity: InboundGrActivityApi): UpcomingInboundActivity {
  return {
    title: readString(activity, 'title'),
    description: readValue<string | null>(activity, 'description') ?? readString(activity, 'title'),
    performedBy: readValue<string | null>(activity, 'performedBy', 'performed_by') ?? undefined,
    timestamp: formatDisplayTimestamp(readValue<string | null>(activity, 'timestamp')),
    state: normalizeActivityState(readString(activity, 'state')),
    processState: normalizeEnum(readString(activity, 'state'), PROCESS_STATE_VALUES, undefined),
  };
}

function formatDisplayTimestamp(value?: string | null): string {
  if (!value) return '';
  const parsed = dayjs(value);
  if (!parsed.isValid()) return value;
  return parsed.format('YYYY-MM-DD HH:mm:ss');
}

function buildInboundScenarioMeta(
  api: InboundGoodsReceiptApi,
  processState: UpcomingInboundProcessState,
  stepTitle: string,
): GRScenarioMeta {
  const scenarioPath = inferScenarioPath(api, processState);

  return {
    scenarioId: `LIVE-${readString(api, 'receivingNumber', 'receiving_number')}`,
    scenarioName: scenarioNameByPath(scenarioPath),
    scenarioPath,
    stepNumber: scenarioStepNumber(processState),
    totalSteps: 4,
    stepTitle,
  };
}

function inferScenarioPath(
  api: InboundGoodsReceiptApi,
  processState: UpcomingInboundProcessState,
): GRScenarioPath {
  if (processState === 'MISMATCH_EXCEPTION') return 'MISMATCH_CORRECTION';
  if (processState === 'CORRECTION_REQUIRED') return 'CORRECTION_LOOP';
  if (readString(api, 'receiptSourceType', 'receipt_source_type') === 'TEMP_NO_PO' || readString(api, 'receiptType', 'receipt_type') === 'Unplanned') return 'UNPLANNED_ARRIVAL';
  if (readString(api, 'qcResult', 'qc_result') === 'Rejected') return 'QC_REJECTED';
  if (
    processState === 'TRANSFERRED_TO_PM_RM_WH' ||
    processState === 'FIN_SUBMITTED' ||
    processState === 'DAILY_CLOSED' ||
    processState === 'MONTHLY_SUMMARY_READY'
  ) {
    return 'QC_PASS_TRANSFER';
  }
  return 'NORMAL';
}

function scenarioNameByPath(path: GRScenarioPath): string {
  switch (path) {
    case 'MISMATCH_CORRECTION':
      return 'Mismatch Correction Flow';
    case 'UNPLANNED_ARRIVAL':
      return 'Unplanned Inbound Receiving Flow';
    case 'QC_REJECTED':
      return 'QC Rejected Flow';
    case 'QC_PASS_TRANSFER':
      return 'QC Pass To Transfer Flow';
    case 'CORRECTION_LOOP':
      return 'Correction Loop Flow';
    case 'DAILY_CLOSE':
      return 'Daily Close Flow';
    case 'MONTHLY_SUMMARY':
      return 'Monthly Summary Flow';
    default:
      return 'Inbound Receiving Flow';
  }
}

function scenarioStepNumber(processState: UpcomingInboundProcessState): number {
  switch (processState) {
    case 'GRPO_DRAFT':
    case 'QC_PENDING':
      return 1;
    case 'QC_PASSED':
    case 'PENDING_SUPERVISOR_REVIEW':
      return 2;
    case 'SUPERVISOR_APPROVED':
      return 3;
    case 'TRANSFERRED_TO_PM_RM_WH':
    case 'FIN_SUBMITTED':
    case 'DAILY_CLOSED':
    case 'MONTHLY_SUMMARY_READY':
      return 4;
    default:
      return 1;
  }
}

function buildFallbackPoReferences(api: InboundGoodsReceiptApi): UpcomingInboundGoodsReceipt['poReferences'] {
  const poNumber = readValue<string | null>(api, 'poNumber', 'po_number');
  if (!poNumber) return [];

  return [
    {
      poNumber,
      businessUnit: readString(api, 'businessUnit', 'business_unit'),
      supplier: readString(api, 'supplier'),
      expectedDate: undefined,
      expectedTime: undefined,
      deliveryNoteNumber: readValue<string | null>(api, 'deliveryNoteNumber', 'delivery_note_number') ?? undefined,
    },
  ];
}

function normalizeLegacyStatus(value: string | null | undefined, processState: UpcomingInboundProcessState): LegacyGRStatus {
  return normalizeEnum(value, LEGACY_STATUS_VALUES, mapProcessStateToLegacyStatus(processState));
}

function normalizeQcResult(value: string, processState: UpcomingInboundProcessState): UpcomingInboundGoodsReceipt['qcResult'] {
  switch (value) {
    case 'Pass':
      return 'Pass';
    case 'Rejected':
    case 'On Hold':
    case 'On-Hold':
      return 'Rejected';
    case 'Pending':
      return 'Pending';
    default:
      return processState === 'SUPERVISOR_APPROVED' ? 'Pass' : 'Pending';
  }
}

function normalizeQcDecision(value?: string | null): QcDecision | undefined {
  switch ((value || '').trim().toLowerCase()) {
    case 'pass':
      return 'Pass';
    case 'reject':
    case 'rejected':
    case 'on hold':
    case 'on-hold':
    case 'on_hold':
      return 'Reject';
    default:
      return normalizeEnum(value, QC_DECISION_VALUES, undefined);
  }
}

function normalizeActivityState(value: string): UpcomingInboundActivity['state'] {
  switch (value) {
    case 'active':
    case 'locked':
      return value;
    default:
      return 'done';
  }
}

function uniqueStrings(values: string[]): string[] {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function readValue<T = unknown>(source: unknown, ...keys: string[]): T | undefined {
  if (!source || typeof source !== 'object') return undefined;
  const record = source as Record<string, unknown>;
  for (const key of keys) {
    if (record[key] !== undefined) return record[key] as T;
  }
  return undefined;
}

function readString(source: unknown, ...keys: string[]): string {
  const value = readValue<unknown>(source, ...keys);
  return value == null ? '' : String(value);
}

function readNumber(source: unknown, ...keys: string[]): number | undefined {
  const value = readValue<unknown>(source, ...keys);
  if (value == null || value === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function readBoolean(source: unknown, ...keys: string[]): boolean {
  const value = readValue<unknown>(source, ...keys);
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.toLowerCase() === 'true';
  return Boolean(value);
}

function readArray<T>(source: unknown, ...keys: string[]): T[] {
  const value = readValue<unknown>(source, ...keys);
  return Array.isArray(value) ? value as T[] : [];
}

function normalizeEnum<T extends string>(
  value: string | null | undefined,
  allowedValues: readonly T[],
  fallback: T,
): T;
function normalizeEnum<T extends string>(
  value: string | null | undefined,
  allowedValues: readonly T[],
  fallback: T | undefined,
): T | undefined;
function normalizeEnum<T extends string>(
  value: string | null | undefined,
  allowedValues: readonly T[],
  fallback: T | undefined,
): T | undefined {
  if (!value) return fallback;
  return allowedValues.find((allowedValue) => allowedValue === value) ?? fallback;
}
