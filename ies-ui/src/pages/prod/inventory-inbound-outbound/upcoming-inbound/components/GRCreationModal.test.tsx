import * as React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { GRCreationModal } from './GRCreationModal';

type POItem = import('../workflow').POItem;
type PurchaseOrder = import('../workflow').PurchaseOrder;
type UpcomingInboundGoodsReceipt = import('../data').UpcomingInboundGoodsReceipt;

jest.mock('antd', () => {
  const actual = jest.requireActual('antd');
  const MockInput = ({ ...props }) => <input {...props} />;
  MockInput.TextArea = ({ autoSize: _autoSize, ...props }) => <textarea {...props} />;
  const MockForm = ({ children, onFinish: _onFinish, ...props }) => <form {...props}>{children}</form>;
  MockForm.Item = ({ children, label, help }) => (
    <div>
      {label ? <label>{label}</label> : null}
      {children}
      {help ? <div>{help}</div> : null}
    </div>
  );

  const MockTable = ({ columns = [], dataSource = [] }) => (
    <div data-testid="mock-table">
      {dataSource.map((record, rowIndex) => (
        <div key={record.key ?? rowIndex}>
          {columns.map((column, colIndex) => {
            const value = column.dataIndex ? record[column.dataIndex] : undefined;
            const rendered = column.render ? column.render(value, record, rowIndex) : value;
            const content =
              rendered && typeof rendered === 'object' && 'children' in rendered
                ? rendered.children
                : rendered;

            return <div key={column.key ?? column.dataIndex ?? colIndex}>{content}</div>;
          })}
        </div>
      ))}
    </div>
  );

  const MockCollapse = ({ items = [], activeKey, onChange }) => {
    const activeKeys = Array.isArray(activeKey)
      ? activeKey.map(String)
      : activeKey
        ? [String(activeKey)]
        : [];

    return (
      <div>
        {items.map((item) => {
          const isActive = activeKeys.includes(String(item.key));

          return (
            <div key={String(item.key)}>
              <div
                onClick={() => {
                  const nextKeys = isActive
                    ? activeKeys.filter((key) => key !== String(item.key))
                    : [...activeKeys, String(item.key)];
                  onChange?.(nextKeys);
                }}
              >
                {item.label}
              </div>
              {isActive ? item.children : null}
            </div>
          );
        })}
      </div>
    );
  };

  const MockModal = ({ open, children, title, footer }) =>
    open ? (
      <div data-testid="mock-modal">
        <div>{title}</div>
        <div>{children}</div>
        <div>{footer}</div>
      </div>
    ) : null;

  return {
    ...actual,
    Collapse: MockCollapse,
    Form: MockForm,
    Input: MockInput,
    Modal: MockModal,
    Table: MockTable,
  };
});

jest.mock('../supportingDocs', () => ({
  applyUploadedSupportingDocs: jest.fn((files) => files),
  hasIncompleteAppFilesUpload: jest.fn(() => false),
  normalizeUploadFileList: jest.fn((files) => files),
  previewSupportingUploadFile: jest.fn(async () => true),
  stageSupportingDocBeforeUpload: jest.fn(() => false),
  supportingDocsToUploadFiles: jest.fn(() => []),
  uploadPendingSupportingDocs: jest.fn(async () => []),
  uploadFilesToSupportingDocs: jest.fn(() => []),
}));

jest.mock('./SupportingDocsList', () => ({
  SupportingDocsList: () => null,
}));

jest.mock('./FullscreenModal', () => ({
  FullscreenModal: ({ open, children, title }) =>
    open ? (
      <div data-testid="fullscreen-modal">
        <div>{title}</div>
        {children}
      </div>
    ) : null,
}));

function createPoItem(overrides: Partial<POItem> = {}): POItem {
  return {
    code: 'ITEM-001',
    name: 'Item 001',
    poQty: 10,
    receivedQty: 0,
    remainingQty: 10,
    uom: 'KG',
    supplier: 'Vendor A',
    ...overrides,
  };
}

function createPurchaseOrder(overrides: Partial<PurchaseOrder> = {}): PurchaseOrder {
  const supplier = overrides.supplier || 'Vendor A';
  const items = overrides.items || [createPoItem({ supplier })];

  return {
    poNumber: 'PO-001',
    supplier,
    expectedDate: '2026-04-01',
    expectedTime: '08:00',
    deliveryNoteNumber: undefined,
    items,
    totalItems: items.length,
    totalQty: items.reduce((sum, item) => sum + item.poQty, 0),
    type: 'Planned',
    status: 'Expected',
    ...overrides,
  };
}

function createInitialReceipt(
  overrides: Partial<UpcomingInboundGoodsReceipt> = {},
): UpcomingInboundGoodsReceipt {
  return {
    id: 1,
    grNumber: 'IR-001',
    receivingNumber: 'IR-001',
    approvedGrNumber: null,
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
    ],
    supplierNames: ['Vendor A'],
    receiptType: 'Planned',
    receiptSourceType: 'PLANNED',
    poLinkStatus: 'NOT_REQUIRED',
    tempReferenceNo: undefined,
    pendingPOReason: undefined,
    linkedPoNumber: undefined,
    linkBlockReason: undefined,
    postingDate: '2026-04-01',
    actualReceiptDate: '2026-04-01',
    deliveryNoteNumber: 'DN-001',
    receiverWarehouseName: 'warehouse.staff01',
    items: [
      {
        code: 'ITEM-001',
        name: 'Item 001',
        poNumber: 'PO-001',
        supplier: 'Vendor A',
        poQty: 10,
        receiveQty: 10,
        uom: 'KG',
        productDate: '2027-04-02',
        expiryDate: '2027-04-01',
        batchNumber: 'BATCH-001',
        barcode: 'BARCODE-001',
        isMissing: false,
        missingRemark: '',
      },
    ],
    status: 'Draft',
    processState: 'GRPO_DRAFT',
    displayStatus: 'GRPO Draft',
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
    workflowLabel: 'Warehouse receiving draft',
    recordTypeLabel: 'Inbound Receiving',
    isAppendable: true,
    documentChecklist: {
      vendorDN: true,
      goodsReceiptPOForm: true,
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

describe('GRCreationModal', () => {
  const onClose = jest.fn();
  const onSaveDraft = jest.fn();
  const onSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders one expanded item-receipt panel per purchase order by default', async () => {
    render(
      <GRCreationModal
        open
        onClose={onClose}
        purchaseOrders={[
          createPurchaseOrder({ poNumber: 'PO-001' }),
          createPurchaseOrder({
            poNumber: 'PO-002',
            items: [createPoItem({ code: 'ITEM-002', supplier: 'Vendor A' })],
          }),
        ]}
        onSaveDraft={onSaveDraft}
        onSubmit={onSubmit}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('item-receipt-panel-body-PO-001')).not.toBeNull();
      expect(screen.getByTestId('item-receipt-panel-body-PO-002')).not.toBeNull();
    });
  });

  it('collapses one purchase-order panel without hiding the others', async () => {
    render(
      <GRCreationModal
        open
        onClose={onClose}
        purchaseOrders={[
          createPurchaseOrder({ poNumber: 'PO-001' }),
          createPurchaseOrder({
            poNumber: 'PO-002',
            items: [createPoItem({ code: 'ITEM-002', supplier: 'Vendor A' })],
          }),
        ]}
        onSaveDraft={onSaveDraft}
        onSubmit={onSubmit}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('item-receipt-panel-body-PO-001')).not.toBeNull();
      expect(screen.getByTestId('item-receipt-panel-body-PO-002')).not.toBeNull();
    });

    fireEvent.click(screen.getByTestId('item-receipt-panel-header-PO-001'));

    await waitFor(() => {
      expect(screen.queryByTestId('item-receipt-panel-body-PO-001')).toBeNull();
    });

    expect(screen.getByTestId('item-receipt-panel-body-PO-002')).not.toBeNull();
  });

  it('scans one purchase order without changing the others', async () => {
    render(
      <GRCreationModal
        open
        onClose={onClose}
        purchaseOrders={[
          createPurchaseOrder({ poNumber: 'PO-001' }),
          createPurchaseOrder({
            poNumber: 'PO-002',
            items: [createPoItem({ code: 'ITEM-002', supplier: 'Vendor A' })],
          }),
        ]}
        onSaveDraft={onSaveDraft}
        onSubmit={onSubmit}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('scan-po-button-PO-001')).not.toBeNull();
      expect(screen.getByTestId('scan-po-button-PO-002')).not.toBeNull();
    });

    const poOnePanel = screen.getByTestId('item-receipt-panel-body-PO-001');
    const poTwoPanel = screen.getByTestId('item-receipt-panel-body-PO-002');
    const poOneBatchInput = within(poOnePanel).getByPlaceholderText('Batch no.') as HTMLInputElement;
    const poTwoBatchInput = within(poTwoPanel).getByPlaceholderText('Batch no.') as HTMLInputElement;

    expect(poOneBatchInput.value).toBe('');
    expect(poTwoBatchInput.value).toBe('');

    fireEvent.click(screen.getByTestId('scan-po-button-PO-001'));

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Scan result for PO-001')).not.toBeNull();
    });

    fireEvent.click(screen.getByText('Confirm PO Scan'));

    await waitFor(() => {
      expect(poOneBatchInput.value).toBe('PO001-01');
    });

    expect(poTwoBatchInput.value).toBe('');
  });

  it('still renders correctly for a single purchase order', async () => {
    render(
      <GRCreationModal
        open
        onClose={onClose}
        purchaseOrders={[createPurchaseOrder({ poNumber: 'PO-001' })]}
        onSaveDraft={onSaveDraft}
        onSubmit={onSubmit}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('item-receipt-panel-header-PO-001')).not.toBeNull();
      expect(screen.getByTestId('item-receipt-panel-body-PO-001')).not.toBeNull();
    });

    expect(screen.queryByTestId('item-receipt-panel-header-PO-002')).toBeNull();
  });

  it('blocks submit when product date is later than expiry date', async () => {
    render(
      <GRCreationModal
        open
        onClose={onClose}
        purchaseOrders={[createPurchaseOrder({ poNumber: 'PO-001' })]}
        onSaveDraft={onSaveDraft}
        onSubmit={onSubmit}
        initialReceipt={createInitialReceipt()}
      />,
    );

    fireEvent.click(screen.getByText('Submit for QC'));

    await waitFor(() => {
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  it('inherits and locks the delivery note when the selected po already has one from a previous approved receiving', async () => {
    render(
      <GRCreationModal
        open
        onClose={onClose}
        purchaseOrders={[createPurchaseOrder({ deliveryNoteNumber: 'DN-LOCKED-001' })]}
        onSaveDraft={onSaveDraft}
        onSubmit={onSubmit}
      />,
    );

    const deliveryNoteInput = screen.getByDisplayValue('DN-LOCKED-001') as HTMLInputElement;

    expect(deliveryNoteInput.disabled).toBe(true);
  });
});
