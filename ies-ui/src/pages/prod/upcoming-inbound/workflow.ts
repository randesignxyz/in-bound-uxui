/* eslint-disable @typescript-eslint/no-use-before-define */
export type InboundProcessState =
  | 'RECEIVED_CHECKING'
  | 'MISMATCH_EXCEPTION'
  | 'RECEIPT_CONFIRMED'
  | 'STORED_ON_HOLD'
  | 'GRPO_DRAFT'
  | 'QC_PENDING'
  | 'QC_PASSED'
  | 'PENDING_SUPERVISOR_REVIEW'
  | 'CORRECTION_REQUIRED'
  | 'MERGED_TO_SUPERVISOR_REVIEW'
  | 'SUPERVISOR_APPROVED'
  | 'TRANSFERRED_TO_PM_RM_WH'
  | 'FIN_SUBMITTED'
  | 'DAILY_CLOSED'
  | 'MONTHLY_SUMMARY_READY';

export type LegacyGRStatus =
  | 'Draft'
  | 'Pending Approval'
  | 'Approved'
  | 'Ready To Post SAP'
  | 'Posted'
  | 'Merged'
  | 'Correction Required';

export type InboundHistoryStatus =
  | 'Draft'
  | 'Pending'
  | 'Ready to Post SAP'
  | 'Complete'
  | 'Correction Required'
  | 'Rejected';

export type QcQueueStatus =
  | 'Pending'
  | 'Submitted'
  | 'Correction Required'
  | 'Rejected'
  | 'Complete';

export type GRScenarioPath =
  | 'NORMAL'
  | 'MISMATCH_CORRECTION'
  | 'UNPLANNED_ARRIVAL'
  | 'QC_REJECTED'
  | 'QC_PASS_TRANSFER'
  | 'CORRECTION_LOOP'
  | 'DAILY_CLOSE'
  | 'MONTHLY_SUMMARY';

export interface GRScenarioMeta {
  scenarioId: string;
  scenarioName: string;
  scenarioPath: GRScenarioPath;
  stepNumber: number;
  totalSteps: number;
  stepTitle: string;
}

export interface POItem {
  lineNumber?: number;
  lineStatus?: string;
  expectedDate?: string;
  code: string;
  name: string;
  poQty: number;
  receivedQty: number;
  remainingQty: number;
  uom: string;
  warehouseCode?: string;
  supplier: string;
}

export interface POPrLink {
  prNumber: string;
  prDocEntry?: string;
  prDocNum?: string;
  prUuid?: string;
}

export interface POReceiptLogItem {
  code: string;
  name: string;
  qty: number;
}

export interface POReceiptLog {
  receiptId?: number;
  receivingNumber: string;
  statusLabel: string;
  receivedBy?: string;
  receivedAt?: string;
  totalReceivedQty: number;
  receivedItems: POReceiptLogItem[];
  approvedItems: POReceiptLogItem[];
  rejectedItems: POReceiptLogItem[];
}

export interface PurchaseOrder {
  businessUnit?: string;
  poNumber: string;
  sapDocEntry?: number;
  sapDocNum?: string;
  supplier: string;
  expectedDate: string;
  expectedTime: string;
  deliveryNoteNumber?: string;
  items: POItem[];
  totalItems: number;
  totalQty: number;
  type: 'Planned' | 'Unplanned';
  docStatus?: string;
  prLinks?: POPrLink[];
  receiptLogs?: POReceiptLog[];
}

export function getCombinedPurchaseOrderVendor(purchaseOrders: PurchaseOrder[]) {
  const normalizedSuppliers = Array.from(
    new Set(
      purchaseOrders
        .map((purchaseOrder) => purchaseOrder.supplier?.trim())
        .filter((supplier): supplier is string => Boolean(supplier)),
    ),
  );

  return normalizedSuppliers.length === 1 ? normalizedSuppliers[0] : undefined;
}

export function getPurchaseOrderVendorOptions(purchaseOrders: PurchaseOrder[]) {
  return Array.from(
    new Set(
      purchaseOrders
        .map((purchaseOrder) => purchaseOrder.supplier?.trim())
        .filter((supplier): supplier is string => Boolean(supplier)),
    ),
  ).sort((left, right) => left.localeCompare(right));
}

export function canCombinePurchaseOrders(purchaseOrders: PurchaseOrder[]) {
  const businessUnits = Array.from(new Set(purchaseOrders.map((purchaseOrder) => purchaseOrder.businessUnit)));
  return (
    businessUnits.length <= 1 &&
    (purchaseOrders.length <= 1 || Boolean(getCombinedPurchaseOrderVendor(purchaseOrders)))
  );
}

export type GoodsReceiptSourceType = 'PLANNED' | 'UNPLANNED_WITH_PO' | 'TEMP_NO_PO';

export type POLinkStatus = 'NOT_REQUIRED' | 'WAITING_PO' | 'LINKED';

export interface GRItem {
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
  qcRemark?: string;
}

type ReceiptPoGroupedItemShape = Pick<
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

export type QcDecision = 'Pass' | 'Reject';

export type SupportingDocSource = 'WAREHOUSE' | 'QC' | 'SUPERVISOR';

export interface SupportingDocReference {
  fileId?: string | null;
  fileName: string;
  source?: SupportingDocSource | null;
  poNumber?: string | null;
}

export interface GRDocumentChecklist {
  vendorDN: boolean;
  goodsReceiptPOForm: boolean;
  pmrmStockCardForm: boolean;
  supportingDocs: SupportingDocReference[];
}

export interface GRActivity {
  title: string;
  description: string;
  performedBy?: string;
  secondaryText?: string;
  timestamp: string;
  state: 'done' | 'active' | 'locked';
  processState?: InboundProcessState;
}

export interface GoodsReceipt {
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

export function getReceiptPOReferences(receipt: GoodsReceipt) {
  if (receipt.receiptSourceType === 'TEMP_NO_PO') {
    if (receipt.linkedPoNumber) {
      return [
        {
          poNumber: receipt.linkedPoNumber,
          businessUnit: receipt.businessUnit,
          supplier: receipt.supplier,
          expectedDate: receipt.expectedDate,
          expectedTime: receipt.expectedTime,
        },
      ];
    }

    return [];
  }

  return receipt.poReferences?.length
    ? receipt.poReferences
    : [
        {
          poNumber: receipt.poNumber,
          businessUnit: receipt.businessUnit,
          supplier: receipt.supplier,
          expectedDate: receipt.expectedDate,
          expectedTime: receipt.expectedTime,
        },
      ];
}

export function summarizePOReferences(receipt: GoodsReceipt) {
  const references = getReceiptPOReferences(receipt);
  if (receipt.receiptSourceType === 'TEMP_NO_PO' && references.length === 0) {
    return 'Waiting SAP PO';
  }
  if (references.length === 1) return references[0].poNumber;
  return `${references.length} POs`;
}

export function summarizeSuppliers(receipt: GoodsReceipt) {
  const suppliers = receipt.supplierNames?.length
    ? receipt.supplierNames
    : Array.from(new Set(getReceiptPOReferences(receipt).map((reference) => reference.supplier)));
  if (suppliers.length === 1) return suppliers[0];
  return `${suppliers.length} suppliers`;
}

export function groupReceiptItemsByPO<TItem extends ReceiptPoGroupedItemShape>(
  receipt: GoodsReceipt,
  items: TItem[],
): ReceiptPoItemGroup<TItem>[] {
  const poReferencesByNumber = new Map(
    getReceiptPOReferences(receipt).map((reference) => [reference.poNumber, reference]),
  );
  const groupedItems = new Map<string, ReceiptPoItemGroup<TItem>>();
  const poQtyByGroupAndItem = new Map<string, Map<string, number>>();

  items.forEach((item) => {
    const poNumber = normalizeReceiptItemPoNumber(receipt, item);
    const groupKey = poNumber || '__UNASSIGNED_PO__';
    const itemKey = item.code.trim();
    const existingGroup = groupedItems.get(groupKey);
    const poReference = poNumber ? poReferencesByNumber.get(poNumber) : undefined;
    const groupPoQtyByItem = poQtyByGroupAndItem.get(groupKey) ?? new Map<string, number>();
    const previousPoQty = groupPoQtyByItem.get(itemKey) ?? 0;
    const nextPoQty = Math.max(previousPoQty, item.poQty);

    groupPoQtyByItem.set(itemKey, nextPoQty);
    poQtyByGroupAndItem.set(groupKey, groupPoQtyByItem);

    if (existingGroup) {
      existingGroup.items.push(item);
      existingGroup.itemCount += 1;
      existingGroup.totalPoQty += nextPoQty - previousPoQty;
      existingGroup.totalReceiveQty += item.receiveQty;
      return;
    }

    groupedItems.set(groupKey, {
      key: groupKey,
      poNumber,
      displayPoNumber:
        poNumber ||
        (receipt.receiptSourceType === 'TEMP_NO_PO' ? 'Waiting SAP PO' : 'PO Unassigned'),
      supplier: item.supplier || poReference?.supplier || receipt.supplier,
      expectedDate: poReference?.expectedDate || undefined,
      expectedTime: poReference?.expectedTime || undefined,
      itemCount: 1,
      totalPoQty: item.poQty,
      totalReceiveQty: item.receiveQty,
      items: [item],
    });
  });

  return Array.from(groupedItems.values()).sort((left, right) => {
    if (!left.poNumber && !right.poNumber) return 0;
    if (!left.poNumber) return 1;
    if (!right.poNumber) return -1;
    return left.poNumber.localeCompare(right.poNumber);
  });
}

export function getReceiptIrNumber(
  receipt: Pick<GoodsReceipt, 'receivingNumber' | 'grNumber'>,
) {
  return receipt.receivingNumber?.trim() || receipt.grNumber;
}

export function getReceiptApprovedGrNumber(
  receipt: Pick<GoodsReceipt, 'approvedGrNumber' | 'sapGrNumber'>,
) {
  return receipt.sapGrNumber?.trim() || receipt.approvedGrNumber?.trim() || undefined;
}

export function getReceiptSapStatus(receipt: Pick<GoodsReceipt, 'sapGrStatus' | 'processState'>) {
  const sapStatus = receipt.sapGrStatus?.trim();
  if (sapStatus) {
    return sapStatus;
  }

  return receipt.processState === 'SUPERVISOR_APPROVED' ? 'Pending SAP' : undefined;
}

export function hasReceiptDiscrepancy(items: GRItem[]) {
  return items.some((item) => !item.isDeferred && (item.isMissing || item.receiveQty < item.poQty));
}

function normalizeReceiptItemPoNumber(
  receipt: GoodsReceipt,
  item: ReceiptPoGroupedItemShape,
) {
  return (
    item.poNumber?.trim() ||
    receipt.linkedPoNumber?.trim() ||
    receipt.poNumber?.trim() ||
    undefined
  );
}

export function buildReceiptExceptionReason(items: GRItem[]) {
  return items
    .flatMap((item) => {
      if (item.isMissing) {
        return [
          `${item.code}: missing item${item.missingRemark?.trim() ? ` - ${item.missingRemark.trim()}` : ''}`,
        ];
      }

      if (item.isDeferred) {
        return [];
      }

      if (item.receiveQty < item.poQty) {
        const shortage = item.poQty - item.receiveQty;
        return [`${item.code}: short by ${shortage.toLocaleString()} ${item.uom}`];
      }

      return [];
    })
    .join('; ');
}

const QTY_EXCEPTION_COVERAGE_STATES = new Set<InboundProcessState>([
  'RECEIVED_CHECKING',
  'MISMATCH_EXCEPTION',
  'RECEIPT_CONFIRMED',
  'STORED_ON_HOLD',
  'QC_PENDING',
  'QC_PASSED',
  'PENDING_SUPERVISOR_REVIEW',
  'CORRECTION_REQUIRED',
  'SUPERVISOR_APPROVED',
  'TRANSFERRED_TO_PM_RM_WH',
  'FIN_SUBMITTED',
  'DAILY_CLOSED',
  'MONTHLY_SUMMARY_READY',
]);

type ReceiptQtyCoverage = {
  expectedQty: number;
  receiveQty: number;
};

export function getExceptionQueueReceipts(receipts: GoodsReceipt[]) {
  const qtyCoverageByItem = buildReceiptQtyCoverage(receipts);

  return receipts.filter((receipt) => isReceiptVisibleInExceptionQueue(receipt, qtyCoverageByItem));
}

function buildReceiptQtyCoverage(receipts: GoodsReceipt[]) {
  const coverageByItem = new Map<string, ReceiptQtyCoverage>();

  receipts.filter(isReceiptEligibleForQtyCoverage).forEach((receipt) => {
    receipt.items.forEach((item) => {
      const itemKey = buildReceiptItemKey(receipt, item);
      if (!itemKey) return;

      const currentCoverage = coverageByItem.get(itemKey) || { expectedQty: 0, receiveQty: 0 };
      currentCoverage.expectedQty = Math.max(currentCoverage.expectedQty, item.poQty);
      currentCoverage.receiveQty += Math.max(item.receiveQty, 0);
      coverageByItem.set(itemKey, currentCoverage);
    });
  });

  return coverageByItem;
}

function isReceiptEligibleForQtyCoverage(receipt: GoodsReceipt) {
  if (!QTY_EXCEPTION_COVERAGE_STATES.has(receipt.processState)) {
    return false;
  }

  if (!receipt.specMatch) {
    return false;
  }

  return !isRejectedReceipt(receipt);
}

function isReceiptVisibleInExceptionQueue(
  receipt: GoodsReceipt,
  qtyCoverageByItem: Map<string, ReceiptQtyCoverage>,
) {
  if (!receipt.specMatch || isQcRejectedReceipt(receipt)) {
    return true;
  }

  const quantityExceptionKeys = collectQuantityExceptionItemKeys(receipt);
  if (quantityExceptionKeys.length > 0) {
    return quantityExceptionKeys.some((itemKey) => {
      const coverage = qtyCoverageByItem.get(itemKey);
      return !coverage || coverage.receiveQty < coverage.expectedQty;
    });
  }

  return !receipt.qtyMatch;
}

function collectQuantityExceptionItemKeys(receipt: GoodsReceipt) {
  return Array.from(
    new Set(
      receipt.items
        .filter((item) => item.isMissing || item.receiveQty < item.poQty)
        .map((item) => buildReceiptItemKey(receipt, item))
        .filter((itemKey): itemKey is string => Boolean(itemKey)),
    ),
  );
}

function buildReceiptItemKey(receipt: GoodsReceipt, item: ReceiptPoGroupedItemShape) {
  const poNumber = normalizeReceiptItemPoNumber(receipt, item)?.trim().toUpperCase();
  const itemCode = item.code?.trim().toUpperCase();

  if (!poNumber || !itemCode) {
    return undefined;
  }

  return `${poNumber}::${itemCode}`;
}

export const goodsReceiptSourceLabel: Record<GoodsReceiptSourceType, string> = {
  PLANNED: 'Planned',
  UNPLANNED_WITH_PO: 'Unplanned',
  TEMP_NO_PO: 'Temporary Receiving',
};

export const poLinkStatusLabel: Record<POLinkStatus, string> = {
  NOT_REQUIRED: 'Not Required',
  WAITING_PO: 'Waiting PO',
  LINKED: 'Linked',
};

export const supportingDocSourceLabel: Record<SupportingDocSource, string> = {
  WAREHOUSE: 'Warehouse',
  QC: 'QC',
  SUPERVISOR: 'Supervisor',
};

export function getGoodsReceiptSourceColor(sourceType: GoodsReceiptSourceType) {
  switch (sourceType) {
    case 'PLANNED':
      return 'green';
    case 'UNPLANNED_WITH_PO':
      return 'orange';
    case 'TEMP_NO_PO':
      return 'purple';
    default:
      return 'default';
  }
}

export function getPOLinkStatusColor(status: POLinkStatus) {
  switch (status) {
    case 'NOT_REQUIRED':
      return 'default';
    case 'WAITING_PO':
      return 'warning';
    case 'LINKED':
      return 'success';
    default:
      return 'default';
  }
}

export function getSupportingDocSourceColor(source?: SupportingDocSource | null) {
  switch (source) {
    case 'WAREHOUSE':
      return 'blue';
    case 'QC':
      return 'gold';
    case 'SUPERVISOR':
      return 'green';
    default:
      return 'default';
  }
}

export function getReceiptDisplayStatus(receipt: GoodsReceipt) {
  const explicitDisplayStatus = receipt.displayStatus?.trim();
  if (explicitDisplayStatus) {
    return explicitDisplayStatus;
  }

  switch (receipt.processState) {
    case 'RECEIVED_CHECKING':
      return 'Received Checking';
    case 'RECEIPT_CONFIRMED':
      return 'Receipt Confirmed';
    case 'STORED_ON_HOLD':
      return 'Stored On-Hold';
    case 'GRPO_DRAFT':
      return 'GRPO Draft';
    case 'QC_PENDING':
      return 'QC Pending';
    case 'QC_PASSED':
      return 'QC Passed';
    case 'PENDING_SUPERVISOR_REVIEW':
    case 'MERGED_TO_SUPERVISOR_REVIEW':
      return 'Pending Supervisor Review';
    case 'SUPERVISOR_APPROVED':
      return 'Ready to Post SAP';
    case 'TRANSFERRED_TO_PM_RM_WH':
    case 'FIN_SUBMITTED':
    case 'DAILY_CLOSED':
    case 'MONTHLY_SUMMARY_READY':
      return 'Supervisor Approved';
    case 'MISMATCH_EXCEPTION':
      return 'QC Rejected';
    case 'CORRECTION_REQUIRED':
      if (isSupervisorRejectedCorrection(receipt)) {
        return 'Supervisor Rejected';
      }
      if (isQcRejectedReceipt(receipt)) {
        return 'QC Rejected';
      }
      return 'Correction Required';
    default:
      return officialStateLabel[receipt.processState];
  }
}

export function getReceiptDisplayStatusColor(displayStatus: string) {
  switch (displayStatus) {
    case 'Received Checking':
      return 'geekblue';
    case 'Receipt Confirmed':
      return 'cyan';
    case 'Stored On-Hold':
    case 'Correction Required':
      return 'orange';
    case 'QC Pending':
    case 'Pending Supervisor Review':
    case 'Ready to Post SAP':
    case 'Pending SAP':
      return 'gold';
    case 'QC Passed':
      return 'blue';
    case 'Supervisor Approved':
    case 'Open':
    case 'OPEN':
      return 'processing';
    case 'Close':
    case 'Closed':
    case 'CLOSED':
      return 'green';
    case 'QC Rejected':
    case 'Supervisor Rejected':
      return 'red';
    case 'GRPO Draft':
      return 'default';
    default:
      return 'default';
  }
}

export function getInboundHistoryStatus(receipt: GoodsReceipt): InboundHistoryStatus {
  const rejectedHistory = hasRejectedHistory(receipt);

  switch (receipt.processState) {
    case 'GRPO_DRAFT':
      return rejectedHistory ? 'Rejected' : 'Draft';
    case 'QC_PENDING':
    case 'QC_PASSED':
    case 'PENDING_SUPERVISOR_REVIEW':
      return 'Pending';
    case 'SUPERVISOR_APPROVED':
      return 'Ready to Post SAP';
    case 'TRANSFERRED_TO_PM_RM_WH':
    case 'FIN_SUBMITTED':
    case 'DAILY_CLOSED':
    case 'MONTHLY_SUMMARY_READY':
      return 'Complete';
    case 'MISMATCH_EXCEPTION':
    case 'CORRECTION_REQUIRED':
      return rejectedHistory ? 'Rejected' : 'Correction Required';
    default:
      return 'Draft';
  }
}

export function getQcQueueStatus(receipt: GoodsReceipt): QcQueueStatus | null {
  switch (receipt.processState) {
    case 'QC_PENDING':
      return 'Pending';
    case 'QC_PASSED':
    case 'PENDING_SUPERVISOR_REVIEW':
    case 'MERGED_TO_SUPERVISOR_REVIEW':
      return 'Submitted';
    case 'SUPERVISOR_APPROVED':
    case 'TRANSFERRED_TO_PM_RM_WH':
    case 'FIN_SUBMITTED':
    case 'DAILY_CLOSED':
    case 'MONTHLY_SUMMARY_READY':
      return 'Complete';
    case 'MISMATCH_EXCEPTION':
      return 'Rejected';
    case 'CORRECTION_REQUIRED':
      return isRejectedReceipt(receipt) ? 'Rejected' : 'Correction Required';
    default:
      return null;
  }
}

export function getQcQueueStatusColor(status: QcQueueStatus) {
  switch (status) {
    case 'Pending':
      return 'gold';
    case 'Submitted':
      return 'blue';
    case 'Correction Required':
      return 'orange';
    case 'Rejected':
      return 'red';
    case 'Complete':
      return 'green';
    default:
      return 'default';
  }
}

export function getInboundHistoryStatusColor(status: InboundHistoryStatus) {
  switch (status) {
    case 'Draft':
      return 'default';
    case 'Pending':
      return 'gold';
    case 'Complete':
      return 'green';
    case 'Rejected':
      return 'red';
    case 'Correction Required':
      return 'orange';
    default:
      return 'default';
  }
}

export function mapProcessStateToLegacyStatus(state: InboundProcessState): LegacyGRStatus {
  switch (state) {
    case 'GRPO_DRAFT':
      return 'Draft';
    case 'QC_PENDING':
    case 'QC_PASSED':
    case 'PENDING_SUPERVISOR_REVIEW':
      return 'Pending Approval';
    case 'SUPERVISOR_APPROVED':
      return 'Ready To Post SAP';
    case 'MERGED_TO_SUPERVISOR_REVIEW':
      return 'Merged';
    case 'TRANSFERRED_TO_PM_RM_WH':
    case 'FIN_SUBMITTED':
    case 'DAILY_CLOSED':
    case 'MONTHLY_SUMMARY_READY':
      return 'Posted';
    case 'CORRECTION_REQUIRED':
    case 'MISMATCH_EXCEPTION':
      return 'Correction Required';
    default:
      return 'Draft';
  }
}

function getLatestCorrectionActivityText(receipt: GoodsReceipt) {
  const latestCorrectionActivity =
    [...receipt.activities].reverse().find((activity) => activity.processState === receipt.processState) ??
    [...receipt.activities]
      .reverse()
      .find((activity) => getActivityText(activity).length > 0);

  return getActivityText(latestCorrectionActivity).toLowerCase();
}

function getActivityText(activity?: Pick<GRActivity, 'title' | 'description'>) {
  return `${activity?.title || ''} ${activity?.description || ''}`.trim();
}

function getActivitySecondaryText(performedBy?: string) {
  const normalizedActor = performedBy?.trim();
  return normalizedActor ? `by ${normalizedActor}` : undefined;
}

function isSkipQcActivityText(activityText: string) {
  const normalizedText = activityText.toLowerCase();
  return normalizedText.includes('skip qc') || normalizedText.includes('skipped qc');
}

function isMergeActivityText(activityText: string) {
  const normalizedText = activityText.toLowerCase();
  return normalizedText.includes('merged');
}

function hasActivityMatch(receipt: GoodsReceipt, text: string) {
  return receipt.activities.some((activity) => getActivityText(activity).toLowerCase().includes(text));
}

function hasRejectedHistory(receipt: GoodsReceipt) {
  return hasSupervisorRejectedHistory(receipt) || hasQcRejectedHistory(receipt);
}

function isRejectedReceipt(receipt: GoodsReceipt) {
  return isSupervisorRejectedCorrection(receipt) || isQcRejectedReceipt(receipt);
}

export function isQcRejectedReceipt(receipt: GoodsReceipt) {
  return receipt.processState === 'MISMATCH_EXCEPTION' || receipt.qcResult === 'Rejected' || isQcRejectedCorrection(receipt);
}

function isSupervisorRejectedCorrection(receipt: GoodsReceipt) {
  return getLatestCorrectionActivityText(receipt).includes('supervisor rejected');
}

function isQcRejectedCorrection(receipt: GoodsReceipt) {
  return getLatestCorrectionActivityText(receipt).includes('qc rejected');
}

function hasSupervisorRejectedHistory(receipt: GoodsReceipt) {
  return hasActivityMatch(receipt, 'supervisor rejected');
}

function hasQcRejectedHistory(receipt: GoodsReceipt) {
  return receipt.processState === 'MISMATCH_EXCEPTION' || receipt.qcResult === 'Rejected' || hasActivityMatch(receipt, 'qc rejected');
}

function resolveHistoricalTimelineTitle(
  processState: InboundProcessState,
  description: string,
) {
  const normalizedDescription = description.toLowerCase();

  if (processState === 'CORRECTION_REQUIRED') {
    if (normalizedDescription.includes('supervisor rejected')) {
      return 'Supervisor Rejected';
    }

    if (
      normalizedDescription.includes('qc rejected') ||
      normalizedDescription.includes('rejected during qc')
    ) {
      return 'QC Rejected';
    }
  }

  return officialStateLabel[processState];
}

export const officialStateLabel: Record<InboundProcessState, string> = {
  RECEIVED_CHECKING: 'Received Checking',
  MISMATCH_EXCEPTION: 'Mismatch Exception',
  RECEIPT_CONFIRMED: 'Receipt Confirmed',
  STORED_ON_HOLD: 'Stored On-Hold',
  GRPO_DRAFT: 'GRPO Draft',
  QC_PENDING: 'QC Pending',
  QC_PASSED: 'QC Passed',
  PENDING_SUPERVISOR_REVIEW: 'Pending Supervisor Review',
  CORRECTION_REQUIRED: 'Correction Required',
  MERGED_TO_SUPERVISOR_REVIEW: 'Merged To Supervisor Review',
  SUPERVISOR_APPROVED: 'Ready to Post SAP',
  TRANSFERRED_TO_PM_RM_WH: 'Supervisor Approved',
  FIN_SUBMITTED: 'Supervisor Approved',
  DAILY_CLOSED: 'Supervisor Approved',
  MONTHLY_SUMMARY_READY: 'Supervisor Approved',
};

export function getGoodsReceiptWorkflowProgress(receipt: GoodsReceipt) {
  const workflowProgressByState: Partial<Record<InboundProcessState, number>> = {
    GRPO_DRAFT: 25,
    QC_PENDING: 50,
    CORRECTION_REQUIRED: 50,
    MISMATCH_EXCEPTION: 50,
    QC_PASSED: 75,
    PENDING_SUPERVISOR_REVIEW: 75,
    MERGED_TO_SUPERVISOR_REVIEW: 75,
    SUPERVISOR_APPROVED: 100,
    TRANSFERRED_TO_PM_RM_WH: 100,
    FIN_SUBMITTED: 100,
    DAILY_CLOSED: 100,
    MONTHLY_SUMMARY_READY: 100,
  };

  return workflowProgressByState[receipt.processState] ?? 0;
}

export const scenarioPathLabel: Record<GRScenarioPath, string> = {
  NORMAL: 'Normal',
  MISMATCH_CORRECTION: 'Mismatch + Correction',
  UNPLANNED_ARRIVAL: 'Unplanned Arrival',
  QC_REJECTED: 'QC Rejected',
  QC_PASS_TRANSFER: 'QC Pass + Transfer',
  CORRECTION_LOOP: 'Correction Loop',
  DAILY_CLOSE: 'Daily Closing',
  MONTHLY_SUMMARY: 'Monthly Summary',
};

export const grScenarioOptions: Array<{ value: 'All' | GRScenarioPath; label: string }> = [
  { value: 'All', label: 'All' },
  { value: 'NORMAL', label: scenarioPathLabel.NORMAL },
  { value: 'MISMATCH_CORRECTION', label: scenarioPathLabel.MISMATCH_CORRECTION },
  { value: 'UNPLANNED_ARRIVAL', label: scenarioPathLabel.UNPLANNED_ARRIVAL },
  { value: 'QC_REJECTED', label: scenarioPathLabel.QC_REJECTED },
  { value: 'QC_PASS_TRANSFER', label: scenarioPathLabel.QC_PASS_TRANSFER },
  { value: 'CORRECTION_LOOP', label: scenarioPathLabel.CORRECTION_LOOP },
  { value: 'DAILY_CLOSE', label: scenarioPathLabel.DAILY_CLOSE },
  { value: 'MONTHLY_SUMMARY', label: scenarioPathLabel.MONTHLY_SUMMARY },
];

const workflowPath: InboundProcessState[] = [
  'RECEIVED_CHECKING',
  'RECEIPT_CONFIRMED',
  'STORED_ON_HOLD',
  'GRPO_DRAFT',
  'QC_PENDING',
  'QC_PASSED',
  'PENDING_SUPERVISOR_REVIEW',
  'SUPERVISOR_APPROVED',
];

function getVisibleWorkflowState(processState: InboundProcessState): InboundProcessState {
  switch (processState) {
    case 'TRANSFERRED_TO_PM_RM_WH':
    case 'FIN_SUBMITTED':
    case 'DAILY_CLOSED':
    case 'MONTHLY_SUMMARY_READY':
      return 'SUPERVISOR_APPROVED';
    case 'MERGED_TO_SUPERVISOR_REVIEW':
      return 'PENDING_SUPERVISOR_REVIEW';
    default:
      return processState;
  }
}

export function buildActivities(
  processState: InboundProcessState,
  createdDate: string,
  stepTitle: string,
  displayStatus?: string,
): GRActivity[] {
  const currentDisplayStatus = displayStatus?.trim() || officialStateLabel[getVisibleWorkflowState(processState)];

  if (processState === 'MISMATCH_EXCEPTION') {
    return [
      {
        title: officialStateLabel.GRPO_DRAFT,
        description: officialStateLabel.GRPO_DRAFT,
        timestamp: createdDate,
        state: 'done',
        processState: 'GRPO_DRAFT',
      },
      {
        title: currentDisplayStatus,
        description: stepTitle,
        timestamp: createdDate,
        state: 'active',
        processState: 'MISMATCH_EXCEPTION',
      },
      {
        title: officialStateLabel.QC_PENDING,
        description: 'Blocked until corrected',
        timestamp: '',
        state: 'locked',
        processState: 'QC_PENDING',
      },
      {
        title: officialStateLabel.PENDING_SUPERVISOR_REVIEW,
        description: 'Blocked until QC is completed',
        timestamp: '',
        state: 'locked',
        processState: 'PENDING_SUPERVISOR_REVIEW',
      },
    ];
  }

  if (processState === 'CORRECTION_REQUIRED') {
    return [
      {
        title: officialStateLabel.QC_PENDING,
        description: 'Submitted to QC',
        timestamp: createdDate,
        state: 'done',
        processState: 'QC_PENDING',
      },
      {
        title: currentDisplayStatus,
        description: stepTitle,
        timestamp: createdDate,
        state: 'active',
        processState: 'CORRECTION_REQUIRED',
      },
      {
        title: officialStateLabel.QC_PENDING,
        description: 'Waiting for resubmission',
        timestamp: '',
        state: 'locked',
        processState: 'QC_PENDING',
      },
      {
        title: officialStateLabel.PENDING_SUPERVISOR_REVIEW,
        description: 'Pending QC pass',
        timestamp: '',
        state: 'locked',
        processState: 'PENDING_SUPERVISOR_REVIEW',
      },
    ];
  }

  const visibleState = getVisibleWorkflowState(processState);
  const currentIndex = workflowPath.indexOf(visibleState);
  const lastIndex = workflowPath.length - 1;
  const currentDescription = visibleState === processState ? stepTitle : officialStateLabel[visibleState];

  return workflowPath.map((state, index) => ({
    title: index === currentIndex ? currentDisplayStatus : officialStateLabel[state],
    description: index === currentIndex ? currentDescription : officialStateLabel[state],
    timestamp: index <= currentIndex ? createdDate : '',
    processState: state,
    state:
      index < currentIndex || (currentIndex === lastIndex && index === currentIndex)
        ? 'done'
        : index === currentIndex
          ? 'active'
          : 'locked',
  }));
}

function mapActivityProcessStateToTimelineStates(
  processState: InboundProcessState | undefined,
): InboundProcessState[] {
  if (!processState) return [];

  switch (processState) {
    case 'PENDING_SUPERVISOR_REVIEW':
      return ['QC_PASSED', 'PENDING_SUPERVISOR_REVIEW'];
    case 'MERGED_TO_SUPERVISOR_REVIEW':
      return ['QC_PASSED', 'PENDING_SUPERVISOR_REVIEW'];
    case 'MISMATCH_EXCEPTION':
      return ['CORRECTION_REQUIRED'];
    case 'TRANSFERRED_TO_PM_RM_WH':
    case 'FIN_SUBMITTED':
    case 'DAILY_CLOSED':
    case 'MONTHLY_SUMMARY_READY':
      return ['SUPERVISOR_APPROVED'];
    default:
      return [processState];
  }
}

type TimelineState = {
  processState: InboundProcessState;
  title: string;
  description: string;
  performedBy?: string;
  timestamp: string;
};

function appendTimelineState(
  items: TimelineState[],
  processState: InboundProcessState,
  title: string,
  description: string,
  timestamp: string,
  replacePrevious = true,
) {
  const previous = items[items.length - 1];
  if (replacePrevious && previous?.processState === processState) {
    items[items.length - 1] = {
      processState,
      title,
      description,
      timestamp: timestamp || previous.timestamp,
    };
    return;
  }

  items.push({ processState, title, description, timestamp });
}

function appendSkipQcTimelineStates(items: TimelineState[], activity: GRActivity) {
  appendTimelineState(
    items,
    'MERGED_TO_SUPERVISOR_REVIEW',
    activity.title || 'Skip QC',
    activity.description || activity.title || 'Skip QC',
    '',
    false,
  );

  const skipQcActivity = items[items.length - 1];
  if (skipQcActivity?.processState === 'MERGED_TO_SUPERVISOR_REVIEW') {
    skipQcActivity.performedBy = activity.performedBy;
  }

  appendTimelineState(
    items,
    'PENDING_SUPERVISOR_REVIEW',
    'Supervisor Pending',
    officialStateLabel.PENDING_SUPERVISOR_REVIEW,
    activity.timestamp,
  );
}

function timelineEndsWithStates(
  items: TimelineState[],
  states: InboundProcessState[],
): boolean {
  if (states.length === 0 || items.length < states.length) return false;

  const offset = items.length - states.length;
  return states.every((state, index) => items[offset + index]?.processState === state);
}

export function buildReceiptTimelineActivities(receipt: GoodsReceipt): GRActivity[] {
  if (!receipt.activities?.length) {
    return buildActivities(
      receipt.processState,
      receipt.createdDate,
      receipt.scenario.stepTitle || officialStateLabel[getVisibleWorkflowState(receipt.processState)],
      getReceiptDisplayStatus(receipt),
    );
  }

  const timelineStates: TimelineState[] = [];

  for (const baseState of ['RECEIVED_CHECKING', 'RECEIPT_CONFIRMED', 'STORED_ON_HOLD'] as InboundProcessState[]) {
    appendTimelineState(
      timelineStates,
      baseState,
      officialStateLabel[baseState],
      officialStateLabel[baseState],
      receipt.createdDate,
    );
  }

  receipt.activities.forEach((activity) => {
    const activityText = getActivityText(activity);
    const isSkipQcActivity =
      activity.processState === 'PENDING_SUPERVISOR_REVIEW' && isSkipQcActivityText(activityText);
    if (isSkipQcActivity) {
      appendSkipQcTimelineStates(timelineStates, activity);
      return;
    }

    const isWarehouseMergeActivity =
      (activity.processState === 'PENDING_SUPERVISOR_REVIEW' ||
        activity.processState === 'MERGED_TO_SUPERVISOR_REVIEW') &&
      (isSkipQcActivity || isMergeActivityText(activityText));
    const expandedStates: InboundProcessState[] = isWarehouseMergeActivity
      ? activity.processState
        ? [activity.processState]
        : []
      : mapActivityProcessStateToTimelineStates(activity.processState);
    if (!expandedStates.length) return;

    expandedStates.forEach((state, index) => {
      const isDerivedQcPassed =
        state === 'QC_PASSED' && activity.processState === 'PENDING_SUPERVISOR_REVIEW' && index === 0;
      const shouldUseActivityTextForTimelineState =
        isWarehouseMergeActivity ||
        ((state === 'PENDING_SUPERVISOR_REVIEW' || state === 'MERGED_TO_SUPERVISOR_REVIEW') &&
          (isSkipQcActivityText(activityText) || isMergeActivityText(activityText)));
      const title = shouldUseActivityTextForTimelineState
        ? activity.title || officialStateLabel[state]
        : isDerivedQcPassed
        ? isSkipQcActivity
          ? activity.title || 'Skip QC'
          : officialStateLabel.QC_PASSED
        : resolveHistoricalTimelineTitle(state, activityText);
      const description = shouldUseActivityTextForTimelineState
        ? activity.description || activity.title || officialStateLabel[state]
        : isDerivedQcPassed
        ? isSkipQcActivity
          ? activity.description || activity.title || 'Skip QC'
          : officialStateLabel.QC_PASSED
        : activity.description || activity.title;

      appendTimelineState(
        timelineStates,
        state,
        title,
        description,
        activity.timestamp,
      );

      const latestTimelineState = timelineStates[timelineStates.length - 1];
      if (latestTimelineState?.processState === state) {
        latestTimelineState.performedBy = activity.performedBy;
      }
    });
  });

  const hasSkipQcMergeHistory = receipt.activities.some((activity) => {
    const activityText = getActivityText(activity);
    return (
      (activity.processState === 'PENDING_SUPERVISOR_REVIEW' ||
        activity.processState === 'MERGED_TO_SUPERVISOR_REVIEW') &&
      (isSkipQcActivityText(activityText) || isMergeActivityText(activityText))
    );
  });
  const currentTimelineStates =
    receipt.processState === 'PENDING_SUPERVISOR_REVIEW' && hasSkipQcMergeHistory
      ? (['PENDING_SUPERVISOR_REVIEW'] as InboundProcessState[])
      : mapActivityProcessStateToTimelineStates(receipt.processState);
  const currentVisibleState =
    currentTimelineStates[currentTimelineStates.length - 1] || getVisibleWorkflowState(receipt.processState);

  const currentStateAlreadyRepresented = timelineEndsWithStates(timelineStates, currentTimelineStates);

  if (!currentStateAlreadyRepresented) {
    currentTimelineStates.forEach((state) => {
      appendTimelineState(
        timelineStates,
        state,
        state === currentVisibleState
          ? getReceiptDisplayStatus(receipt)
          : officialStateLabel[state],
        state === currentVisibleState
          ? receipt.scenario.stepTitle || officialStateLabel[state]
          : officialStateLabel[state],
        receipt.createdDate,
      );
    });
  }

  const futureStates =
    currentVisibleState === 'CORRECTION_REQUIRED'
      ? (['GRPO_DRAFT', 'QC_PENDING', 'QC_PASSED', 'PENDING_SUPERVISOR_REVIEW', 'SUPERVISOR_APPROVED'] as InboundProcessState[])
      : workflowPath.slice(Math.max(workflowPath.indexOf(currentVisibleState) + 1, 0));

  futureStates.forEach((state) => {
    appendTimelineState(
      timelineStates,
      state,
      officialStateLabel[state],
      officialStateLabel[state],
      '',
    );
  });

  let activeIndex = -1;
  for (let index = timelineStates.length - 1; index >= 0; index -= 1) {
    if (timelineStates[index].processState === currentVisibleState) {
      activeIndex = index;
      break;
    }
  }
  const finalWorkflowState = workflowPath[workflowPath.length - 1];

  return timelineStates.map((item, index) => ({
    title:
      index === activeIndex
        ? item.title &&
          item.title !== officialStateLabel[item.processState] &&
          item.title !== getReceiptDisplayStatus(receipt)
          ? item.title
          : getReceiptDisplayStatus(receipt)
        : item.title || resolveHistoricalTimelineTitle(item.processState, item.description || ''),
    description: item.description || officialStateLabel[item.processState],
    performedBy: item.performedBy,
    secondaryText: getActivitySecondaryText(item.performedBy),
    timestamp: item.timestamp,
    processState: item.processState,
    state:
      index < activeIndex || (item.processState === finalWorkflowState && currentVisibleState === finalWorkflowState)
        ? 'done'
        : index === activeIndex
          ? 'active'
          : 'locked',
  }));
}
