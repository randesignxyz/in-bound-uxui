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
  | 'Posted'
  | 'Merged'
  | 'Correction Required';

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
  code: string;
  name: string;
  poQty: number;
  receivedQty: number;
  remainingQty: number;
  uom: string;
  supplier: string;
}

export interface PurchaseOrder {
  poNumber: string;
  supplier: string;
  expectedDate: string;
  expectedTime: string;
  items: POItem[];
  totalItems: number;
  totalQty: number;
  type: 'Planned' | 'Unplanned';
  status: 'Expected' | 'Partial' | 'Fully Received';
}

export type GoodsReceiptSourceType = 'PLANNED' | 'UNPLANNED_WITH_PO' | 'TEMP_NO_PO';

export type POLinkStatus = 'NOT_REQUIRED' | 'WAITING_PO' | 'LINKED';

export interface GRItem {
  code: string;
  name: string;
  poNumber: string;
  supplier: string;
  poQty: number;
  receiveQty: number;
  uom: string;
  productDate: string;
  expiryDate: string;
  batchNumber: string;
  barcode: string;
  isMissing?: boolean;
  missingRemark?: string;
  qcDecision?: QcDecision;
  qcRemark?: string;
}

export type QcDecision = 'Pass' | 'On-Hold' | 'Reject';

export type SupportingDocSource = 'WAREHOUSE' | 'QC' | 'SUPERVISOR';

export interface SupportingDocReference {
  fileId?: string | null;
  fileName: string;
  source?: SupportingDocSource | null;
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
  timestamp: string;
  state: 'done' | 'active' | 'locked';
  processState?: InboundProcessState;
}

export interface GoodsReceipt {
  grNumber: string;
  receivingNumber?: string;
  poNumber: string;
  supplier: string;
  poReferences: Array<{
    poNumber: string;
    supplier: string;
    expectedDate?: string;
    expectedTime?: string;
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
  legacyStatus?: LegacyGRStatus;
  createdBy: string;
  createdDate: string;
  approvedBy?: string;
  approvedDate?: string;
  specMatch: boolean;
  qtyMatch: boolean;
  qualityCheckRequired: boolean;
  qcResult: 'Pending' | 'Pass' | 'Rejected' | 'On Hold';
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

export function hasReceiptDiscrepancy(items: GRItem[]) {
  return items.some((item) => item.isMissing || item.receiveQty < item.poQty);
}

export function buildReceiptExceptionReason(items: GRItem[]) {
  return items
    .flatMap((item) => {
      if (item.isMissing) {
        return [
          `${item.code}: missing item${item.missingRemark?.trim() ? ` - ${item.missingRemark.trim()}` : ''}`,
        ];
      }

      if (item.receiveQty < item.poQty) {
        const shortage = item.poQty - item.receiveQty;
        return [`${item.code}: short by ${shortage.toLocaleString()} ${item.uom}`];
      }

      return [];
    })
    .join('; ');
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

export function mapProcessStateToLegacyStatus(state: InboundProcessState): LegacyGRStatus {
  switch (state) {
    case 'GRPO_DRAFT':
      return 'Draft';
    case 'QC_PENDING':
    case 'QC_PASSED':
    case 'PENDING_SUPERVISOR_REVIEW':
      return 'Pending Approval';
    case 'SUPERVISOR_APPROVED':
      return 'Approved';
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
  SUPERVISOR_APPROVED: 'Supervisor Approved',
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
): GRActivity[] {
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
        title: officialStateLabel.MISMATCH_EXCEPTION,
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
        title: officialStateLabel.CORRECTION_REQUIRED,
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
    title: officialStateLabel[state],
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

function appendTimelineState(
  items: Array<{
    processState: InboundProcessState;
    description: string;
    timestamp: string;
  }>,
  processState: InboundProcessState,
  description: string,
  timestamp: string,
) {
  const previous = items[items.length - 1];
  if (previous?.processState === processState) {
    items[items.length - 1] = {
      processState,
      description,
      timestamp: timestamp || previous.timestamp,
    };
    return;
  }

  items.push({ processState, description, timestamp });
}

function timelineEndsWithStates(
  items: Array<{
    processState: InboundProcessState;
    description: string;
    timestamp: string;
  }>,
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
    );
  }

  const timelineStates: Array<{
    processState: InboundProcessState;
    description: string;
    timestamp: string;
  }> = [];

  for (const baseState of ['RECEIVED_CHECKING', 'RECEIPT_CONFIRMED', 'STORED_ON_HOLD'] as InboundProcessState[]) {
    appendTimelineState(timelineStates, baseState, officialStateLabel[baseState], receipt.createdDate);
  }

  receipt.activities.forEach((activity) => {
    const expandedStates = mapActivityProcessStateToTimelineStates(activity.processState);
    if (!expandedStates.length) return;

    expandedStates.forEach((state, index) => {
      const isDerivedQcPassed = state === 'QC_PASSED' && activity.processState === 'PENDING_SUPERVISOR_REVIEW' && index === 0;
      appendTimelineState(
        timelineStates,
        state,
        isDerivedQcPassed ? officialStateLabel.QC_PASSED : activity.description || activity.title,
        activity.timestamp,
      );
    });
  });

  const currentTimelineStates = mapActivityProcessStateToTimelineStates(receipt.processState);
  const currentVisibleState =
    currentTimelineStates[currentTimelineStates.length - 1] || getVisibleWorkflowState(receipt.processState);

  const currentStateAlreadyRepresented = timelineEndsWithStates(timelineStates, currentTimelineStates);

  if (!currentStateAlreadyRepresented) {
    currentTimelineStates.forEach((state) => {
      appendTimelineState(
        timelineStates,
        state,
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
    appendTimelineState(timelineStates, state, officialStateLabel[state], '');
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
    title: officialStateLabel[item.processState],
    description: item.description || officialStateLabel[item.processState],
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
