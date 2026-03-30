import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { GRCreationModal } from './GRCreationModal';

describe('GRCreationModal', () => {
  it('submits a non-missing line with zero receive quantity as a shortage', async () => {
    const onClose = jest.fn();
    const onSaveDraft = jest.fn();
    const onSubmit = jest.fn().mockResolvedValue(false);

    render(
      <GRCreationModal
        open
        onClose={onClose}
        onSaveDraft={onSaveDraft}
        onSubmit={onSubmit}
        purchaseOrders={[
          {
            poNumber: 'PO-01',
            supplier: 'Supplier A',
            expectedDate: '2026-03-30',
            expectedTime: '08:00',
            items: [
              {
                code: 'ITEM-A',
                name: 'Item A',
                poQty: 5,
                receivedQty: 0,
                remainingQty: 5,
                uom: 'EA',
                supplier: 'Supplier A',
              },
            ],
            totalItems: 1,
            totalQty: 5,
            type: 'Planned',
            status: 'Expected',
          },
        ]}
      />,
    );

    const qtyInput = screen.getAllByRole('spinbutton')[0];

    act(() => {
      fireEvent.change(qtyInput, { target: { value: '0' } });
    });

    fireEvent.change(screen.getByPlaceholderText('From truck paperwork'), {
      target: { value: 'DN-001' },
    });
    fireEvent.click(screen.getByRole('checkbox'));

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Submit Exception' }));
    });

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        qtyMatch: false,
        exceptionReason: 'ITEM-A: short by 5 EA',
        items: [
          expect.objectContaining({
            code: 'ITEM-A',
            receiveQty: 0,
            isMissing: false,
            productDate: '',
            expiryDate: '',
            batchNumber: '',
          }),
        ],
      }),
    );
  });
});
