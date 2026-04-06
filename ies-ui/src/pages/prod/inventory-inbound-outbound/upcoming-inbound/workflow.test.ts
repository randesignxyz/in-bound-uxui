import {
  buildReceiptTimelineActivities,
  getInboundHistoryStatus,
  getQcQueueStatus,
  getReceiptDisplayStatus,
  getReceiptDisplayStatusColor,
  type GoodsReceipt,
} from './workflow';

function buildReceipt(overrides: Partial<GoodsReceipt> = {}): GoodsReceipt {
  return {
    grNumber: 'IR-001',
    receivingNumber: 'IR-001',
    approvedGrNumber: undefined,
    previousReceivingNumber: undefined,
    previousApprovedGrNumber: undefined,
    poNumber: 'PO-001',
    supplier: 'Supplier A',
    poReferences: [
      {
        poNumber: 'PO-001',
        supplier: 'Supplier A',
      },
    ],
    supplierNames: ['Supplier A'],
    receiptType: 'Planned',
    receiptSourceType: 'PLANNED',
    poLinkStatus: 'NOT_REQUIRED',
    tempReferenceNo: undefined,
    pendingPOReason: undefined,
    linkedPoNumber: undefined,
    linkedPoLinkedAt: undefined,
    linkedPoLinkedBy: undefined,
    linkBlockReason: undefined,
    expectedDate: '2026-04-01',
    expectedTime: '08:00',
    postingDate: '2026-04-01',
    actualReceiptDate: '2026-04-01',
    deliveryNoteNumber: 'DN-001',
    receiverWarehouseName: 'Main Warehouse',
    items: [],
    status: 'Pending Approval',
    processState: 'QC_PENDING',
    displayStatus: undefined,
    legacyStatus: 'Pending Approval',
    createdBy: 'warehouse.user',
    createdDate: '2026-04-01 00:00:00',
    approvedBy: undefined,
    approvedDate: undefined,
    specMatch: true,
    qtyMatch: true,
    qualityCheckRequired: true,
    qcResult: 'Pending',
    exceptionReason: undefined,
    documentChecklist: {
      vendorDN: true,
      goodsReceiptPOForm: true,
      pmrmStockCardForm: false,
      supportingDocs: [],
    },
    scenario: {
      scenarioId: 'LIVE-IR-001',
      scenarioName: 'Inbound Receiving Flow',
      scenarioPath: 'NORMAL',
      stepNumber: 1,
      totalSteps: 4,
      stepTitle: 'Waiting QC review',
    },
    activities: [],
    ...overrides,
  };
}

describe('workflow display status', () => {
  it('prefers backend displayStatus when provided', () => {
    const receipt = buildReceipt({
      displayStatus: 'Supervisor Rejected',
      processState: 'CORRECTION_REQUIRED',
      qcResult: 'On Hold',
    });

    expect(getReceiptDisplayStatus(receipt)).toBe('Supervisor Rejected');
  });

  it('falls back to supervisor rejected for correction records returned by supervisor', () => {
    const receipt = buildReceipt({
      processState: 'CORRECTION_REQUIRED',
      qcResult: 'On Hold',
      activities: [
        {
          title: 'Supervisor rejected inbound receiving and returned it for correction',
          description: 'Supervisor rejected and returned inbound receiving to warehouse for recheck',
          timestamp: '2026-04-01 10:00:00',
          state: 'done',
          processState: 'CORRECTION_REQUIRED',
        },
      ],
    });

    expect(getReceiptDisplayStatus(receipt)).toBe('Supervisor Rejected');
  });

  it('falls back to qc rejected for correction records rejected by qc', () => {
    const receipt = buildReceipt({
      processState: 'CORRECTION_REQUIRED',
      qcResult: 'Rejected',
      activities: [
        {
          title: 'QC rejected item(s) and returned receipt to warehouse for correction',
          description: 'ITEM-A: Rejected during QC',
          timestamp: '2026-04-01 09:00:00',
          state: 'done',
          processState: 'CORRECTION_REQUIRED',
        },
      ],
    });

    expect(getReceiptDisplayStatus(receipt)).toBe('QC Rejected');
  });

  it('falls back to correction required for on-hold qc outcomes', () => {
    const receipt = buildReceipt({
      processState: 'CORRECTION_REQUIRED',
      qcResult: 'On Hold',
      activities: [
        {
          title: 'QC placed item(s) on hold during inbound receiving review',
          description: 'ITEM-A: Marked on hold during QC',
          timestamp: '2026-04-01 09:00:00',
          state: 'done',
          processState: 'CORRECTION_REQUIRED',
        },
      ],
    });

    expect(getReceiptDisplayStatus(receipt)).toBe('Correction Required');
  });

  it('uses red for rejected display statuses', () => {
    expect(getReceiptDisplayStatusColor('QC Rejected')).toBe('red');
    expect(getReceiptDisplayStatusColor('Supervisor Rejected')).toBe('red');
  });

  it('shows the active timeline title as the resolved display status', () => {
    const receipt = buildReceipt({
      processState: 'CORRECTION_REQUIRED',
      qcResult: 'On Hold',
      activities: [
        {
          title: 'Supervisor rejected inbound receiving and returned it for correction',
          description: 'Supervisor rejected and returned inbound receiving to warehouse for recheck',
          timestamp: '2026-04-01 10:00:00',
          state: 'done',
          processState: 'CORRECTION_REQUIRED',
        },
      ],
    });

    const activeStep = buildReceiptTimelineActivities(receipt).find((item) => item.state === 'active');

    expect(activeStep?.title).toBe('Supervisor Rejected');
  });

  it('keeps qc rejected as a completed timeline step after warehouse correction returns the receipt to draft', () => {
    const receipt = buildReceipt({
      processState: 'GRPO_DRAFT',
      qcResult: 'Pending',
      activities: [
        {
          title: 'QC rejected item(s) and returned receipt to warehouse for correction',
          description: 'ITEM-A: Rejected during QC',
          timestamp: '2026-04-01 09:00:00',
          state: 'done',
          processState: 'CORRECTION_REQUIRED',
        },
        {
          title: 'Warehouse corrected inbound receiving and returned it to draft',
          description: '',
          timestamp: '2026-04-01 10:00:00',
          state: 'active',
          processState: 'GRPO_DRAFT',
        },
      ],
    });

    const timelineTitles = buildReceiptTimelineActivities(receipt).map((activity) => activity.title);

    expect(timelineTitles).toContain('QC Rejected');
    expect(timelineTitles).toContain('GRPO Draft');
    expect(timelineTitles).not.toContain('Correction Required');
  });

  it('keeps qc rejected in the completed timeline step even when the remark text is custom', () => {
    const receipt = buildReceipt({
      processState: 'GRPO_DRAFT',
      qcResult: 'Pending',
      activities: [
        {
          title: 'QC rejected item(s) and returned receipt to warehouse for correction',
          description: 'Batch seal broken',
          timestamp: '2026-04-01 09:00:00',
          state: 'done',
          processState: 'CORRECTION_REQUIRED',
        },
        {
          title: 'Warehouse corrected inbound receiving and returned it to draft',
          description: '',
          timestamp: '2026-04-01 10:00:00',
          state: 'active',
          processState: 'GRPO_DRAFT',
        },
      ],
    });

    const timelineTitles = buildReceiptTimelineActivities(receipt).map((activity) => activity.title);

    expect(timelineTitles).toContain('QC Rejected');
    expect(timelineTitles).not.toContain('Correction Required');
  });

  it('keeps supervisor rejected as a completed timeline step after warehouse correction returns the receipt to draft', () => {
    const receipt = buildReceipt({
      processState: 'GRPO_DRAFT',
      qcResult: 'Pending',
      activities: [
        {
          title: 'Supervisor rejected inbound receiving and returned it for correction',
          description: 'Supervisor rejected and returned inbound receiving to warehouse for recheck',
          timestamp: '2026-04-01 09:00:00',
          state: 'done',
          processState: 'CORRECTION_REQUIRED',
        },
        {
          title: 'Warehouse corrected inbound receiving and returned it to draft',
          description: '',
          timestamp: '2026-04-01 10:00:00',
          state: 'active',
          processState: 'GRPO_DRAFT',
        },
      ],
    });

    const timelineTitles = buildReceiptTimelineActivities(receipt).map((activity) => activity.title);

    expect(timelineTitles).toContain('Supervisor Rejected');
    expect(timelineTitles).toContain('GRPO Draft');
    expect(timelineTitles).not.toContain('Correction Required');
  });

  it('keeps supervisor rejected in the completed timeline step even when the remark text is custom', () => {
    const receipt = buildReceipt({
      processState: 'GRPO_DRAFT',
      qcResult: 'Pending',
      activities: [
        {
          title: 'Supervisor rejected inbound receiving and returned it for correction',
          description: 'Need recheck batch and quantity',
          timestamp: '2026-04-01 09:00:00',
          state: 'done',
          processState: 'CORRECTION_REQUIRED',
        },
        {
          title: 'Warehouse corrected inbound receiving and returned it to draft',
          description: '',
          timestamp: '2026-04-01 10:00:00',
          state: 'active',
          processState: 'GRPO_DRAFT',
        },
      ],
    });

    const timelineTitles = buildReceiptTimelineActivities(receipt).map((activity) => activity.title);

    expect(timelineTitles).toContain('Supervisor Rejected');
    expect(timelineTitles).not.toContain('Correction Required');
  });
});

describe('workflow status classification', () => {
  it('treats mismatch exception receipts as rejected in history and qc queue', () => {
    const receipt = buildReceipt({
      processState: 'MISMATCH_EXCEPTION',
      qcResult: 'Rejected',
    });

    expect(getInboundHistoryStatus(receipt)).toBe('Rejected');
    expect(getQcQueueStatus(receipt)).toBe('Rejected');
  });

  it('treats qc rejected correction receipts as rejected in history and qc queue', () => {
    const receipt = buildReceipt({
      processState: 'CORRECTION_REQUIRED',
      qcResult: 'Rejected',
      activities: [
        {
          title: 'QC rejected item(s) and returned receipt to warehouse for correction',
          description: 'ITEM-A: Rejected during QC',
          timestamp: '2026-04-01 09:00:00',
          state: 'done',
          processState: 'CORRECTION_REQUIRED',
        },
      ],
    });

    expect(getInboundHistoryStatus(receipt)).toBe('Rejected');
    expect(getQcQueueStatus(receipt)).toBe('Rejected');
  });

  it('treats supervisor rejected correction receipts as rejected in history and qc queue', () => {
    const receipt = buildReceipt({
      processState: 'CORRECTION_REQUIRED',
      qcResult: 'On Hold',
      activities: [
        {
          title: 'Supervisor rejected inbound receiving and returned it for correction',
          description: 'Supervisor rejected and returned inbound receiving to warehouse for recheck',
          timestamp: '2026-04-01 10:00:00',
          state: 'done',
          processState: 'CORRECTION_REQUIRED',
        },
      ],
    });

    expect(getInboundHistoryStatus(receipt)).toBe('Rejected');
    expect(getQcQueueStatus(receipt)).toBe('Rejected');
  });

  it('keeps non-rejected correction loops as correction required in history and qc queue', () => {
    const receipt = buildReceipt({
      processState: 'CORRECTION_REQUIRED',
      qcResult: 'On Hold',
      activities: [
        {
          title: 'QC placed item(s) on hold during inbound receiving review',
          description: 'ITEM-A: Marked on hold during QC',
          timestamp: '2026-04-01 09:00:00',
          state: 'done',
          processState: 'CORRECTION_REQUIRED',
        },
      ],
    });

    expect(getInboundHistoryStatus(receipt)).toBe('Correction Required');
    expect(getQcQueueStatus(receipt)).toBe('Correction Required');
  });

  it('keeps qc rejected receipts visible as rejected in history after warehouse saves the correction draft', () => {
    const receipt = buildReceipt({
      processState: 'GRPO_DRAFT',
      qcResult: 'Pending',
      activities: [
        {
          title: 'QC rejected item(s) and returned receipt to warehouse for correction',
          description: 'ITEM-A: Rejected during QC',
          timestamp: '2026-04-01 09:00:00',
          state: 'done',
          processState: 'CORRECTION_REQUIRED',
        },
        {
          title: 'Warehouse corrected inbound receiving and returned it to draft',
          description: '',
          timestamp: '2026-04-01 10:00:00',
          state: 'active',
          processState: 'GRPO_DRAFT',
        },
      ],
    });

    expect(getInboundHistoryStatus(receipt)).toBe('Rejected');
    expect(getQcQueueStatus(receipt)).toBeNull();
  });

  it('keeps supervisor rejected receipts visible as rejected in history after warehouse saves the correction draft', () => {
    const receipt = buildReceipt({
      processState: 'GRPO_DRAFT',
      qcResult: 'Pending',
      activities: [
        {
          title: 'Supervisor rejected inbound receiving and returned it for correction',
          description: 'Supervisor rejected and returned inbound receiving to warehouse for recheck',
          timestamp: '2026-04-01 09:00:00',
          state: 'done',
          processState: 'CORRECTION_REQUIRED',
        },
        {
          title: 'Warehouse corrected inbound receiving and returned it to draft',
          description: '',
          timestamp: '2026-04-01 10:00:00',
          state: 'active',
          processState: 'GRPO_DRAFT',
        },
      ],
    });

    expect(getInboundHistoryStatus(receipt)).toBe('Rejected');
    expect(getQcQueueStatus(receipt)).toBeNull();
  });
});
