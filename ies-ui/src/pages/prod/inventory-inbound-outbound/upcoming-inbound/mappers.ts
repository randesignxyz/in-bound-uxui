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

const QC_DECISION_VALUES: QcDecision[] = ['Pass', 'On-Hold', 'Reject'];

const LEGACY_STATUS_VALUES: LegacyGRStatus[] = [
  'Draft',
  'Pending Approval',
  'Approved',
  'Posted',
  'Merged',
  'Correction Required',
];

export function mapInboundPurchaseOrder(api: InboundPurchaseOrderApi): UpcomingInboundPurchaseOrder {
  return {
    id: api.id,
    poNumber: api.po_number,
    supplier: api.supplier,
    expectedDate: api.expected_date,
    expectedTime: api.expected_time,
    deliveryNoteNumber: api.delivery_note_number ?? undefined,
    items: api.items.map(mapInboundPurchaseOrderItem),
    totalItems: api.total_items,
    totalQty: api.total_qty,
    type: normalizeEnum(api.type, PO_TYPE_VALUES, 'Planned'),
    status: normalizeEnum(api.status, PO_STATUS_VALUES, 'Expected'),
  };
}

export function mapInboundPurchaseOrders(orders: InboundPurchaseOrderApi[]): UpcomingInboundPurchaseOrder[] {
  return orders.map(mapInboundPurchaseOrder);
}

export function mapInboundGoodsReceipt(api: InboundGoodsReceiptApi): UpcomingInboundGoodsReceipt {
  const processState = normalizeEnum(api.processState, PROCESS_STATE_VALUES, 'GRPO_DRAFT');
  const createdDate = formatDisplayTimestamp(api.createdDate);
  const fallbackStepTitle = api.workflowLabel || api.recordTypeLabel || mapProcessStateToLegacyStatus(processState);
  const qcResult = normalizeQcResult(api.qcResult, processState);

  return {
    id: api.id,
    grNumber: api.grNumber,
    receivingNumber: api.receivingNumber,
    approvedGrNumber: api.approvedGrNumber ?? undefined,
    previousReceivingNumber: api.previousReceivingNumber ?? undefined,
    previousApprovedGrNumber: api.previousApprovedGrNumber ?? undefined,
    poNumber: api.poNumber ?? api.poReferences[0]?.poNumber ?? '',
    supplier: api.supplier,
    poReferences:
      api.poReferences.length > 0
        ? api.poReferences.map((reference) => ({
            poNumber: reference.poNumber,
            supplier: reference.supplier ?? api.supplier,
            expectedDate: reference.expectedDate ?? undefined,
            expectedTime: reference.expectedTime ?? undefined,
            deliveryNoteNumber: reference.deliveryNoteNumber ?? undefined,
          }))
        : buildFallbackPoReferences(api),
    supplierNames: uniqueStrings([
      api.supplier,
      ...api.poReferences.map((reference) => reference.supplier ?? ''),
    ]),
    receiptType: normalizeEnum(api.receiptType, RECEIPT_TYPE_VALUES, 'Planned'),
    receiptSourceType: normalizeEnum(api.receiptSourceType, RECEIPT_SOURCE_VALUES, 'PLANNED'),
    poLinkStatus: normalizeEnum(api.poLinkStatus, PO_LINK_STATUS_VALUES, 'NOT_REQUIRED'),
    tempReferenceNo: api.tempReferenceNo ?? undefined,
    pendingPOReason: api.pendingPoReason ?? undefined,
    linkedPoNumber: api.linkedPoNumber ?? undefined,
    linkBlockReason: api.linkBlockReason ?? undefined,
    expectedDate: api.poReferences[0]?.expectedDate ?? undefined,
    expectedTime: api.poReferences[0]?.expectedTime ?? undefined,
    postingDate: api.postingDate,
    actualReceiptDate: api.actualReceiptDate,
    deliveryNoteNumber: api.deliveryNoteNumber,
    receiverWarehouseName:
      api.onHoldWarehouseCode ?? api.releaseWarehouseCode ?? api.receivedByUser ?? 'On-Hold Warehouse',
    items: api.items.map(mapInboundGoodsReceiptItem),
    status: normalizeLegacyStatus(api.status, processState),
    processState,
    displayStatus: api.displayStatus ?? undefined,
    legacyStatus: normalizeLegacyStatus(api.legacyStatus, processState),
    createdBy: api.createdBy ?? '',
    createdDate,
    approvedBy: api.approvedBy ?? api.qcReviewedBy ?? undefined,
    approvedDate: formatDisplayTimestamp(api.approvedDate ?? api.qcReviewedAt),
    specMatch: api.specMatch,
    qtyMatch: api.qtyMatch,
    qualityCheckRequired: api.qualityCheckRequired,
    qcResult,
    exceptionReason: api.exceptionReason ?? undefined,
    workflowLabel: api.workflowLabel,
    recordTypeLabel: api.recordTypeLabel,
    isAppendable: api.isAppendable,
    documentChecklist: mapInboundDocumentChecklist(api.documentChecklist),
    scenario: buildInboundScenarioMeta(api, processState, fallbackStepTitle),
    activities:
      api.activities.length > 0
        ? api.activities.map(mapInboundActivity)
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
    code: item.code,
    name: item.name,
    poQty: item.poQty,
    receivedQty: item.receivedQty,
    remainingQty: item.remainingQty,
    uom: item.uom,
    supplier: item.supplier,
  };
}

function mapInboundGoodsReceiptItem(item: InboundGrItemApi): UpcomingInboundGoodsReceiptItem {
  return {
    code: item.code,
    name: item.name,
    poNumber: item.poNumber ?? '',
    supplier: item.supplier ?? '',
    poQty: item.poQty,
    receiveQty: item.receiveQty,
    uom: item.uom,
    productDate: item.productDate ?? item.manufacturingDate ?? '',
    expiryDate: item.expiryDate ?? item.bestBeforeDate ?? '',
    batchNumber: item.batchNumber ?? '',
    barcode: item.barcode ?? '',
    deliveryNoteNumber: item.deliveryNoteNumber ?? undefined,
    isMissing: item.isMissing,
    missingRemark: item.missingRemark ?? undefined,
    qcDecision: normalizeEnum(item.qcDecision, QC_DECISION_VALUES, undefined),
    qcRemark: item.qcRemark ?? undefined,
  };
}

function mapInboundDocumentChecklist(
  checklist: InboundGrDocumentChecklistApi,
): UpcomingInboundDocumentChecklist {
  return {
    vendorDN: checklist.vendorDN,
    goodsReceiptPOForm: checklist.goodsReceiptPOForm,
    pmrmStockCardForm: checklist.pmrmStockCardForm,
    supportingDocs: checklist.supportingDocs.map(mapSupportingDoc),
  };
}

function mapSupportingDoc(doc: SupportingDocReferenceApi): SupportingDocReference {
  return {
    fileId: doc.fileId ?? undefined,
    fileName: doc.fileName,
    source: normalizeSupportingDocSource(doc.source),
    poNumber: doc.poNumber ?? undefined,
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
    title: activity.title,
    description: activity.description ?? activity.title,
    performedBy: activity.performedBy ?? undefined,
    timestamp: formatDisplayTimestamp(activity.timestamp),
    state: normalizeActivityState(activity.state),
    processState: normalizeEnum(activity.state, PROCESS_STATE_VALUES, undefined),
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
    scenarioId: `LIVE-${api.receivingNumber}`,
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
  if (api.receiptSourceType === 'TEMP_NO_PO' || api.receiptType === 'Unplanned') return 'UNPLANNED_ARRIVAL';
  if (api.qcResult === 'Rejected') return 'QC_REJECTED';
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
  if (!api.poNumber) return [];

  return [
    {
      poNumber: api.poNumber,
      supplier: api.supplier,
      expectedDate: undefined,
      expectedTime: undefined,
      deliveryNoteNumber: api.deliveryNoteNumber ?? undefined,
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
      return 'Rejected';
    case 'On Hold':
    case 'On-Hold':
      return 'On Hold';
    case 'Pending':
      return 'Pending';
    default:
      return processState === 'SUPERVISOR_APPROVED' ? 'Pass' : 'Pending';
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
