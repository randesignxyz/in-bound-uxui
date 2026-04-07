import {
  type GoodsReceipt,
  type GRItem,
  groupReceiptItemsByPO,
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
});
