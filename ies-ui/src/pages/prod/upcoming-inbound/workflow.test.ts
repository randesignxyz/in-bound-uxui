import {
  buildReceiptTimelineActivities,
  getExceptionQueueReceipts,
  getPurchaseOrderReceiptState,
  type GoodsReceipt,
  type GRItem,
  getPurchaseOrderVendorOptions,
  groupReceiptItemsByPO,
  type PurchaseOrder,
} from './workflow';

function createReceipt(overrides: Partial<GoodsReceipt> = {}): GoodsReceipt {
  return {
    grNumber: 'IR-001',
    receivingNumber: 'IR-001',
    approvedGrNumber: undefined,
    previousReceivingNumber: undefined,
    previousApprovedGrNumber: undefined,
    poNumber: 'PO-001',
    supplier: 'Vendor A',
    poReferences: [
      {
        poNumber: 'PO-001',
        supplier: 'Vendor A',
        expectedDate: '2026-04-01',
        expectedTime: '08:00',
      },
      {
        poNumber: 'PO-002',
        supplier: 'Vendor A',
        expectedDate: '2026-04-02',
        expectedTime: '09:00',
      },
    ],
    supplierNames: ['Vendor A'],
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
    receiverWarehouseName: 'warehouse.staff01',
    items: [],
    status: 'Draft',
    processState: 'GRPO_DRAFT',
    displayStatus: 'Draft',
    legacyStatus: 'Draft',
    createdBy: 'warehouse.user',
    createdDate: '2026-04-01 08:00:00',
    approvedBy: undefined,
    approvedDate: undefined,
    specMatch: true,
    qtyMatch: true,
    qualityCheckRequired: true,
    qcResult: 'Pending',
    exceptionReason: undefined,
    documentChecklist: {
      vendorDN: false,
      goodsReceiptPOForm: false,
      pmrmStockCardForm: false,
      supportingDocs: [],
    },
    scenario: {
      scenarioId: 'scenario-1',
      scenarioName: 'Scenario',
      scenarioPath: 'NORMAL',
      stepNumber: 1,
      totalSteps: 1,
      stepTitle: 'Draft',
    },
    activities: [],
    ...overrides,
  };
}

function createItem(overrides: Partial<GRItem> = {}): GRItem {
  return {
    code: 'ITEM-001',
    name: 'Item 001',
    poNumber: 'PO-001',
    supplier: 'Vendor A',
    poQty: 10,
    receiveQty: 10,
    uom: 'KG',
    productDate: '2026-04-01',
    expiryDate: '2027-04-01',
    batchNumber: 'BATCH-001',
    barcode: 'BARCODE-001',
    isMissing: false,
    missingRemark: '',
    qcDecision: undefined,
    qcRemark: undefined,
    ...overrides,
  };
}

function createPurchaseOrder(overrides: Partial<PurchaseOrder> = {}): PurchaseOrder {
  const supplier = overrides.supplier || 'Vendor A';

  return {
    poNumber: 'PO-001',
    supplier,
    expectedDate: '2026-04-01',
    expectedTime: '08:00',
    items: [],
    totalItems: 0,
    totalQty: 0,
    type: 'Planned',
    ...overrides,
  };
}

describe('getPurchaseOrderVendorOptions', () => {
  it('returns unique vendors from the purchase order list', () => {
    const purchaseOrders = [
      createPurchaseOrder({ poNumber: 'PO-001', supplier: 'Vendor C' }),
      createPurchaseOrder({ poNumber: 'PO-002', supplier: 'Vendor A' }),
      createPurchaseOrder({ poNumber: 'PO-003', supplier: 'Vendor B' }),
      createPurchaseOrder({ poNumber: 'PO-004', supplier: 'Vendor A' }),
      createPurchaseOrder({ poNumber: 'PO-005', supplier: 'Vendor C' }),
    ];

    expect(getPurchaseOrderVendorOptions(purchaseOrders)).toEqual([
      'Vendor A',
      'Vendor B',
      'Vendor C',
    ]);
  });

  it('trims vendor names, removes blanks, and keeps ordering stable', () => {
    const purchaseOrders = [
      createPurchaseOrder({ poNumber: 'PO-001', supplier: ' Vendor B ' }),
      createPurchaseOrder({ poNumber: 'PO-002', supplier: '' }),
      createPurchaseOrder({ poNumber: 'PO-003', supplier: 'Vendor A' }),
      createPurchaseOrder({ poNumber: 'PO-004', supplier: 'Vendor B' }),
      createPurchaseOrder({ poNumber: 'PO-005', supplier: 'Vendor C' }),
    ];

    expect(getPurchaseOrderVendorOptions(purchaseOrders)).toEqual([
      'Vendor A',
      'Vendor B',
      'Vendor C',
    ]);
  });
});

describe('groupReceiptItemsByPO', () => {
  it('groups receipt items by po number and keeps po order stable', () => {
    const receipt = createReceipt();
    const items = [
      createItem({ poNumber: 'PO-002', code: 'ITEM-002', poQty: 20, receiveQty: 18 }),
      createItem({ poNumber: 'PO-001', code: 'ITEM-001', poQty: 10, receiveQty: 10 }),
      createItem({ poNumber: 'PO-001', code: 'ITEM-003', poQty: 5, receiveQty: 5 }),
    ];

    const groups = groupReceiptItemsByPO(receipt, items);

    expect(groups.map((group) => group.displayPoNumber)).toEqual(['PO-001', 'PO-002']);
    expect(groups[0]).toMatchObject({
      poNumber: 'PO-001',
      supplier: 'Vendor A',
      expectedDate: '2026-04-01',
      expectedTime: '08:00',
      itemCount: 2,
      totalPoQty: 15,
      totalReceiveQty: 15,
    });
    expect(groups[1]).toMatchObject({
      poNumber: 'PO-002',
      itemCount: 1,
      totalPoQty: 20,
      totalReceiveQty: 18,
    });
  });

  it('falls back to the receipt po number when item po numbers are missing', () => {
    const receipt = createReceipt({ poNumber: 'PO-001' });
    const items = [createItem({ poNumber: '', code: 'ITEM-001' })];

    const groups = groupReceiptItemsByPO(receipt, items);

    expect(groups).toHaveLength(1);
    expect(groups[0]).toMatchObject({
      poNumber: 'PO-001',
      displayPoNumber: 'PO-001',
      supplier: 'Vendor A',
    });
  });

  it('shows waiting sap po when temporary receipt items have no linked po yet', () => {
    const receipt = createReceipt({
      poNumber: '',
      poReferences: [],
      receiptSourceType: 'TEMP_NO_PO',
      linkedPoNumber: undefined,
      supplier: 'Vendor Temp',
    });
    const items = [createItem({ poNumber: '', supplier: '', code: 'ITEM-TEMP' })];

    const groups = groupReceiptItemsByPO(receipt, items);

    expect(groups).toHaveLength(1);
    expect(groups[0]).toMatchObject({
      poNumber: undefined,
      displayPoNumber: 'Waiting SAP PO',
      supplier: 'Vendor Temp',
    });
  });

  it('does not double count po qty when one po item is split across multiple batch rows', () => {
    const receipt = createReceipt();
    const items = [
      createItem({ poNumber: 'PO-001', code: 'ITEM-001', poQty: 8000, receiveQty: 2000 }),
      createItem({ poNumber: 'PO-001', code: 'ITEM-001', poQty: 6000, receiveQty: 3000, batchNumber: 'BATCH-002' }),
    ];

    const groups = groupReceiptItemsByPO(receipt, items);

    expect(groups).toHaveLength(1);
    expect(groups[0]).toMatchObject({
      poNumber: 'PO-001',
      itemCount: 2,
      totalPoQty: 8000,
      totalReceiveQty: 5000,
    });
    expect(groups[0].items.map((item) => item.batchNumber)).toEqual(['BATCH-001', 'BATCH-002']);
  });
});

describe('getPurchaseOrderReceiptState', () => {
  it('marks a PO as fully received only when approved qty covers every item', () => {
    const purchaseOrder = createPurchaseOrder({
      items: [
        {
          code: 'ITEM-001',
          name: 'Item 001',
          poQty: 5,
          receivedQty: 5,
          remainingQty: 0,
          uom: 'EA',
          supplier: 'Vendor A',
        },
      ],
      totalItems: 1,
      totalQty: 5,
      receiptLogs: [
        {
          receiptId: 1,
          receivingNumber: 'IR-001',
          statusLabel: 'Approved',
          totalReceivedQty: 5,
          receivedItems: [{ code: 'ITEM-001', name: 'Item 001', qty: 5 }],
          approvedItems: [{ code: 'ITEM-001', name: 'Item 001', qty: 5 }],
          rejectedItems: [],
        },
      ],
    });

    expect(getPurchaseOrderReceiptState(purchaseOrder)).toMatchObject({
      isFullyReceived: true,
      canCreateInboundReceiving: false,
      displayStatus: 'Fully Received',
    });
  });

  it('keeps a fully received-but-rejected PO in progress and blocks creating a new IR', () => {
    const purchaseOrder = createPurchaseOrder({
      items: [
        {
          code: 'ITEM-001',
          name: 'Item 001',
          poQty: 5,
          receivedQty: 5,
          remainingQty: 0,
          uom: 'EA',
          supplier: 'Vendor A',
        },
      ],
      totalItems: 1,
      totalQty: 5,
      receiptLogs: [
        {
          receiptId: 1,
          receivingNumber: 'IR-001',
          statusLabel: 'QC Rejected',
          totalReceivedQty: 5,
          receivedItems: [{ code: 'ITEM-001', name: 'Item 001', qty: 5 }],
          approvedItems: [],
          rejectedItems: [{ code: 'ITEM-001', name: 'Item 001', qty: 5 }],
        },
      ],
    });
    const receipt = createReceipt({
      grNumber: 'IR-001',
      receivingNumber: 'IR-001',
      poNumber: 'PO-001',
      items: [createItem({ poNumber: 'PO-001', code: 'ITEM-001', poQty: 5, receiveQty: 5 })],
      processState: 'CORRECTION_REQUIRED',
      qcResult: 'Rejected',
    });

    expect(getPurchaseOrderReceiptState(purchaseOrder, [receipt])).toMatchObject({
      hasOutstandingQty: true,
      hasBlockingReceipt: true,
      isFullyReceived: false,
      canCreateInboundReceiving: false,
      displayStatus: 'In Progress',
    });
  });

  it('shows in progress when approved qty is fully covered but the linked IR is still in rejected correction flow', () => {
    const purchaseOrder = createPurchaseOrder({
      items: [
        {
          code: 'ITEM-001',
          name: 'Item 001',
          poQty: 2,
          receivedQty: 2,
          remainingQty: 0,
          uom: 'EA',
          supplier: 'Vendor A',
        },
      ],
      totalItems: 1,
      totalQty: 2,
      receiptLogs: [
        {
          receiptId: 2,
          receivingNumber: 'IR-002',
          statusLabel: 'Approved',
          totalReceivedQty: 2,
          receivedItems: [{ code: 'ITEM-001', name: 'Item 001', qty: 2 }],
          approvedItems: [{ code: 'ITEM-001', name: 'Item 001', qty: 2 }],
          rejectedItems: [],
        },
      ],
    });
    const rejectedCorrectionReceipt = createReceipt({
      grNumber: 'IR-002',
      receivingNumber: 'IR-002',
      poNumber: 'PO-001',
      items: [createItem({ poNumber: 'PO-001', code: 'ITEM-001', poQty: 2, receiveQty: 2 })],
      processState: 'CORRECTION_REQUIRED',
      qcResult: 'Rejected',
      activities: [
        {
          title: 'Supervisor Rejected',
          description: 'Supervisor rejected correction and returned it for recheck',
          timestamp: '2026-04-02 10:00:00',
          state: 'active',
          processState: 'CORRECTION_REQUIRED',
        },
      ],
    });

    expect(getPurchaseOrderReceiptState(purchaseOrder, [rejectedCorrectionReceipt])).toMatchObject({
      hasOutstandingQty: false,
      hasBlockingReceipt: true,
      isFullyReceived: false,
      canCreateInboundReceiving: false,
      displayStatus: 'In Progress',
    });
  });

  it('allows creating the next IR when an earlier linked receipt is completed and qty is still outstanding', () => {
    const purchaseOrder = createPurchaseOrder({
      items: [
        {
          code: 'ITEM-001',
          name: 'Item 001',
          poQty: 10,
          receivedQty: 4,
          remainingQty: 6,
          uom: 'EA',
          supplier: 'Vendor A',
        },
      ],
      totalItems: 1,
      totalQty: 10,
      receiptLogs: [
        {
          receiptId: 1,
          receivingNumber: 'IR-001',
          statusLabel: 'Approved',
          totalReceivedQty: 4,
          receivedItems: [{ code: 'ITEM-001', name: 'Item 001', qty: 4 }],
          approvedItems: [{ code: 'ITEM-001', name: 'Item 001', qty: 4 }],
          rejectedItems: [],
        },
      ],
    });
    const completedReceipt = createReceipt({
      grNumber: 'IR-001',
      receivingNumber: 'IR-001',
      poNumber: 'PO-001',
      items: [createItem({ poNumber: 'PO-001', code: 'ITEM-001', poQty: 10, receiveQty: 4 })],
      processState: 'SAP_SYNCED',
      qcResult: 'Pass',
    });

    expect(getPurchaseOrderReceiptState(purchaseOrder, [completedReceipt])).toMatchObject({
      hasOutstandingQty: true,
      hasBlockingReceipt: false,
      canCreateInboundReceiving: true,
      displayStatus: 'Ready to Receive',
    });
  });

  it('allows creating the next IR when an earlier linked receipt is still in supervisor flow and qty is still outstanding', () => {
    const purchaseOrder = createPurchaseOrder({
      items: [
        {
          code: 'ITEM-001',
          name: 'Item 001',
          poQty: 500,
          receivedQty: 100,
          remainingQty: 400,
          uom: 'EA',
          supplier: 'Supplier A',
        },
      ],
      receiptLogs: [
        {
          receiptId: 1,
          receivingNumber: 'IR-001',
          statusLabel: 'Pending Supervisor Review',
          totalReceivedQty: 100,
          receivedItems: [{ code: 'ITEM-001', name: 'Item 001', qty: 100 }],
          approvedItems: [{ code: 'ITEM-001', name: 'Item 001', qty: 100 }],
          rejectedItems: [],
        },
      ],
    });
    const pendingSupervisorReceipt = createReceipt({
      grNumber: 'IR-001',
      receivingNumber: 'IR-001',
      poNumber: 'PO-001',
      items: [createItem({ poNumber: 'PO-001', code: 'ITEM-001', poQty: 500, receiveQty: 100 })],
      processState: 'PENDING_SUPERVISOR_REVIEW',
      qcResult: 'Pass',
    });

    expect(getPurchaseOrderReceiptState(purchaseOrder, [pendingSupervisorReceipt])).toMatchObject({
      hasOutstandingQty: true,
      hasBlockingReceipt: false,
      canCreateInboundReceiving: true,
      displayStatus: 'Ready to Receive',
    });
  });
});

describe('buildReceiptTimelineActivities', () => {
  it('shows timeline actor as the secondary line when available', () => {
    const receipt = createReceipt({
      processState: 'PENDING_SUPERVISOR_REVIEW',
      displayStatus: 'Pending Supervisor Review',
      activities: [
        {
          title: 'QC approved inbound receiving and forwarded it to supervisor review',
          description: 'QC forwarded passed items to supervisor',
          performedBy: 'qc.user',
          timestamp: '2026-04-01 09:15:00',
          state: 'done',
          processState: 'PENDING_SUPERVISOR_REVIEW',
        },
      ],
    });

    const activities = buildReceiptTimelineActivities(receipt);
    const qcPendingActivity = activities.find((activity) => activity.title === 'QC Passed');

    expect(qcPendingActivity?.secondaryText).toBe('by qc.user');
  });

  it('hides the timeline secondary line when no actor is available', () => {
    const receipt = createReceipt({
      processState: 'PENDING_SUPERVISOR_REVIEW',
      displayStatus: 'Pending Supervisor Review',
      activities: [
        {
          title: 'QC approved inbound receiving and forwarded it to supervisor review',
          description: 'QC forwarded passed items to supervisor',
          timestamp: '2026-04-01 09:15:00',
          state: 'done',
          processState: 'PENDING_SUPERVISOR_REVIEW',
        },
      ],
    });

    const activities = buildReceiptTimelineActivities(receipt);
    const qcPendingActivity = activities.find((activity) => activity.title === 'QC Passed');

    expect(qcPendingActivity?.secondaryText).toBeUndefined();
  });

  it('keeps skip qc merge activities as warehouse actions instead of deriving qc passed states', () => {
    const receipt = createReceipt({
      processState: 'PENDING_SUPERVISOR_REVIEW',
      displayStatus: 'Pending Supervisor Review',
      activities: [
        {
          title: 'Skip QC by warehouse',
          description: 'Warehouse skipped QC and merged the inbound receiving into IR-SUP while supervisor review was still pending',
          performedBy: 'warehouse',
          timestamp: '2026-04-20 03:12:20',
          state: 'done',
          processState: 'MERGED_TO_SUPERVISOR_REVIEW',
        },
        {
          title: 'Warehouse skipped QC and merged item(s) into this supervisor receipt',
          description: 'Item(s) from IR-001 merged after QC was skipped',
          performedBy: 'warehouse',
          timestamp: '2026-04-20 03:12:20',
          state: 'done',
          processState: 'PENDING_SUPERVISOR_REVIEW',
        },
      ],
    });

    const activities = buildReceiptTimelineActivities(receipt);

    expect(activities.some((activity) => activity.title === 'QC Passed')).toBe(false);
    expect(activities).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ title: 'Skip QC by warehouse' }),
        expect.objectContaining({
          title: 'Warehouse skipped QC and merged item(s) into this supervisor receipt',
        }),
      ]),
    );
  });

  it('shows skip qc as a warehouse action before the supervisor pending milestone', () => {
    const receipt = createReceipt({
      processState: 'PENDING_SUPERVISOR_REVIEW',
      displayStatus: 'Pending Supervisor Review',
      createdDate: '2026-04-22 01:50:47',
      activities: [
        {
          title: 'QC Pending',
          description: 'Submitted to QC',
          performedBy: 'warehouse',
          timestamp: '2026-04-22 01:50:47',
          state: 'done',
          processState: 'QC_PENDING',
        },
        {
          title: 'Skip QC by warehouse',
          description: 'Warehouse skipped QC and sent receipt to supervisor review',
          performedBy: 'warehouse',
          timestamp: '2026-04-22 01:50:53',
          state: 'done',
          processState: 'PENDING_SUPERVISOR_REVIEW',
        },
      ],
    });

    const activities = buildReceiptTimelineActivities(receipt);
    const skipQcIndex = activities.findIndex((activity) => activity.title === 'Skip QC by warehouse');
    const supervisorPendingIndex = activities.findIndex(
      (activity) => activity.title === 'Supervisor Pending',
    );

    expect(skipQcIndex).toBeGreaterThan(-1);
    expect(supervisorPendingIndex).toBe(skipQcIndex + 1);
    expect(activities[skipQcIndex]).toMatchObject({
      secondaryText: 'by warehouse',
      timestamp: '',
    });
    expect(activities[supervisorPendingIndex]).toMatchObject({
      timestamp: '2026-04-22 01:50:53',
      processState: 'PENDING_SUPERVISOR_REVIEW',
    });
  });
});

describe('getExceptionQueueReceipts', () => {
  it('hides a qty-only exception after another submitted receipt covers the same PO item', () => {
    const originalException = createReceipt({
      grNumber: 'IR-EX-001',
      receivingNumber: 'IR-EX-001',
      processState: 'MISMATCH_EXCEPTION',
      qtyMatch: false,
      items: [
        createItem({
          code: 'ITEM-001',
          poNumber: 'PO-001',
          poQty: 10,
          receiveQty: 8,
        }),
      ],
    });
    const correctionReceipt = createReceipt({
      grNumber: 'IR-FIX-001',
      receivingNumber: 'IR-FIX-001',
      processState: 'QC_PENDING',
      qtyMatch: false,
      items: [
        createItem({
          code: 'ITEM-001',
          poNumber: 'PO-001',
          poQty: 10,
          receiveQty: 2,
          batchNumber: 'BATCH-002',
        }),
      ],
    });

    expect(getExceptionQueueReceipts([originalException, correctionReceipt])).toEqual([]);
  });

  it('keeps a qty exception visible while the follow-up correction is still a draft', () => {
    const originalException = createReceipt({
      grNumber: 'IR-EX-001',
      receivingNumber: 'IR-EX-001',
      processState: 'MISMATCH_EXCEPTION',
      qtyMatch: false,
      items: [
        createItem({
          code: 'ITEM-001',
          poNumber: 'PO-001',
          poQty: 10,
          receiveQty: 8,
        }),
      ],
    });
    const draftCorrection = createReceipt({
      grNumber: 'IR-FIX-DRAFT',
      receivingNumber: 'IR-FIX-DRAFT',
      processState: 'GRPO_DRAFT',
      qtyMatch: false,
      items: [
        createItem({
          code: 'ITEM-001',
          poNumber: 'PO-001',
          poQty: 10,
          receiveQty: 2,
          batchNumber: 'BATCH-003',
        }),
      ],
    });

    expect(getExceptionQueueReceipts([originalException, draftCorrection])).toEqual([
      originalException,
      draftCorrection,
    ]);
  });

  it('keeps QC-rejected receipts in the exception queue even when later receipts cover the same quantity', () => {
    const qcRejectedReceipt = createReceipt({
      grNumber: 'IR-QC-REJECT',
      receivingNumber: 'IR-QC-REJECT',
      processState: 'MISMATCH_EXCEPTION',
      qtyMatch: true,
      qcResult: 'Rejected',
      activities: [
        {
          title: 'QC rejected inbound receiving',
          description: 'Rejected during QC review',
          timestamp: '2026-04-01 09:00:00',
          state: 'done',
          processState: 'MISMATCH_EXCEPTION',
        },
      ],
      items: [
        createItem({
          code: 'ITEM-001',
          poNumber: 'PO-001',
          poQty: 10,
          receiveQty: 10,
        }),
      ],
    });
    const followUpReceipt = createReceipt({
      grNumber: 'IR-QC-FOLLOWUP',
      receivingNumber: 'IR-QC-FOLLOWUP',
      processState: 'QC_PENDING',
      items: [
        createItem({
          code: 'ITEM-001',
          poNumber: 'PO-001',
          poQty: 10,
          receiveQty: 10,
          batchNumber: 'BATCH-004',
        }),
      ],
    });

    expect(getExceptionQueueReceipts([qcRejectedReceipt, followUpReceipt])).toEqual([qcRejectedReceipt]);
  });
});
