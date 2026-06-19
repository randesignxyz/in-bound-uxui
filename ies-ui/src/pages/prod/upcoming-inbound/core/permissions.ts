import type { GoodsReceipt } from './type';

export function canSubmitForQC(viewerRole: string, receipt: GoodsReceipt): boolean {
  return viewerRole === 'WAREHOUSE_STAFF' && receipt.processState === 'GRPO_DRAFT';
}

export function canSkipQc(viewerRole: string, receipt: GoodsReceipt): boolean {
  return viewerRole === 'WAREHOUSE_STAFF' && receipt.processState === 'QC_PENDING';
}

export function canOpenWarehouseCorrection(viewerRole: string, receipt: GoodsReceipt): boolean {
  return viewerRole === 'WAREHOUSE_STAFF' && receipt.processState === 'CORRECTION_REQUIRED';
}

export function canLinkPO(viewerRole: string, receipt: GoodsReceipt): boolean {
  return (
    viewerRole === 'WAREHOUSE_STAFF' &&
    receipt.receiptSourceType === 'TEMP_NO_PO' &&
    receipt.poLinkStatus === 'WAITING_PO'
  );
}

export function canSupervisorReview(viewerRole: string, receipt: GoodsReceipt): boolean {
  return (
    viewerRole === 'SUPERVISOR' &&
    (receipt.processState === 'PENDING_SUPERVISOR_REVIEW' ||
      receipt.processState === 'MERGED_TO_SUPERVISOR_REVIEW')
  );
}
