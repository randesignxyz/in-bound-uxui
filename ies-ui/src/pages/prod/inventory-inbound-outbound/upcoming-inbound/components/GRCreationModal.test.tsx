import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { GRCreationModal } from './GRCreationModal';
import type { POItem, PurchaseOrder } from '../workflow';

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
    items,
    totalItems: items.length,
    totalQty: items.reduce((sum, item) => sum + item.poQty, 0),
    type: 'Planned',
    status: 'Expected',
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
});
