import { InboxOutlined } from '@ant-design/icons';
import { ProCard, ProTable } from '@ant-design/pro-components';
import { DrawerForm } from '@ant-design/pro-form';
import type { ProColumns } from '@ant-design/pro-table';
import {
  Alert,
  Button,
  Divider,
  Input,
  Modal,
  Select,
  Space,
  Spin,
  Tag,
  Timeline,
  Upload,
  message,
} from 'antd';
import type { UploadFile, UploadProps } from 'antd';
import { type ReactNode, useEffect, useMemo, useState } from 'react';
import {
  applyUploadedSupportingDocs,
  hasIncompleteAppFilesUpload,
  normalizeUploadFileList,
  previewSupportingUploadFile,
  stageSupportingDocBeforeUpload,
  supportingDocsToUploadFiles,
  uploadPendingSupportingDocs,
} from '../supportingDocs';
import {
  buildReceiptTimelineActivities,
  type GoodsReceipt,
  type GRItem,
  type InboundProcessState,
  type QcDecision,
  goodsReceiptSourceLabel,
  summarizePOReferences,
  summarizeSuppliers,
} from '../workflow';
import { SupportingDocsList } from './SupportingDocsList';

type EditableSidebarItem = GRItem & {
  index: number;
  key: string;
};

type ReceiptMetadataItem = {
  label: string;
  value: ReactNode;
  emphasize?: boolean;
};

interface QCReviewSubmitPayload {
  items: GRItem[];
  processState: InboundProcessState;
  qcResult: GoodsReceipt['qcResult'];
  exceptionReason?: string;
  stepTitle: string;
  documentChecklist: GoodsReceipt['documentChecklist'];
}

interface SupervisorReviewSubmitPayload {
  action: 'approve' | 'reject';
  note?: string;
}

type RemarkModalState =
  | {
      mode: 'qc';
      index: number;
      required: boolean;
      title: string;
      placeholder: string;
      submitAfterSave?: undefined;
    }
  | {
      mode: 'supervisor';
      required: boolean;
      title: string;
      placeholder: string;
      submitAfterSave?: 'reject';
    }
  | null;

interface GRDetailSidebarProps {
  open: boolean;
  onClose: () => void;
  receipt: GoodsReceipt | null;
  viewerRole: 'WAREHOUSE_STAFF' | 'QC' | 'WAREHOUSE_SUPERVISOR';
  onUpdateProcessState: (grNumber: string, newState: InboundProcessState, note?: string) => void;
  onOpenWarehouseCorrection: (receipt: GoodsReceipt) => void;
  onOpenLinkPO: (receipt: GoodsReceipt) => void;
  onSubmitQCVerification: (
    receipt: GoodsReceipt,
    payload: QCReviewSubmitPayload,
  ) => Promise<boolean> | boolean;
  onSubmitSupervisorReview: (
    receipt: GoodsReceipt,
    payload: SupervisorReviewSubmitPayload,
  ) => Promise<boolean> | boolean;
}

function summarizeQcRouting(items: GRItem[]) {
  const passedItems = items.filter((item) => item.qcDecision === 'Pass');
  const correctionItems = items.filter(
    (item) => item.qcDecision === 'Reject' || item.qcDecision === 'On-Hold',
  );

  if (passedItems.length > 0 && correctionItems.length > 0) {
    return {
      type: 'warning' as const,
      message:
        'Mixed QC result: passed items move to supervisor review, while rejected or on-hold items return for warehouse correction.',
    };
  }

  if (correctionItems.length > 0) {
    return {
      type: 'warning' as const,
      message: 'All reviewed items will return to warehouse correction after this QC submission.',
    };
  }

  return {
    type: 'success' as const,
    message:
      'All reviewed items and received quantities will move to supervisor review after this QC submission.',
  };
}

function deriveQcOutcome(
  items: GRItem[],
): Pick<QCReviewSubmitPayload, 'processState' | 'qcResult' | 'exceptionReason' | 'stepTitle'> {
  const passedCount = items.filter((item) => item.qcDecision === 'Pass').length;
  const rejected = items.filter((item) => item.qcDecision === 'Reject');

  if (rejected.length > 0) {
    return {
      processState: 'CORRECTION_REQUIRED',
      qcResult: 'Rejected',
      exceptionReason: rejected
        .map((item) => `${item.code}: ${item.qcRemark?.trim() || 'Rejected during QC'}`)
        .join('; '),
      stepTitle:
        passedCount > 0
          ? 'QC forwarded passed item(s) to supervisor and returned rejected item(s) for correction'
          : 'QC rejected item(s) and returned receipt to warehouse for correction',
    };
  }

  const onHold = items.filter((item) => item.qcDecision === 'On-Hold');

  if (onHold.length > 0) {
    return {
      processState: 'CORRECTION_REQUIRED',
      qcResult: 'On Hold',
      exceptionReason: onHold
        .map((item) => `${item.code}: ${item.qcRemark?.trim() || 'Marked on hold during QC'}`)
        .join('; '),
      stepTitle:
        passedCount > 0
          ? 'QC forwarded passed item(s) to supervisor and returned on-hold item(s) for correction'
          : 'QC placed item(s) on hold and returned receipt to warehouse for correction',
    };
  }

  return {
    processState: 'PENDING_SUPERVISOR_REVIEW',
    qcResult: 'Pass',
    exceptionReason: '',
    stepTitle: 'QC approved and forwarded to warehouse supervisor',
  };
}

function renderMetadataValue(value: ReactNode) {
  if (value === null || value === undefined || value === '') {
    return '-';
  }

  return value;
}

export function GRDetailSidebar({
  open,
  onClose,
  receipt,
  viewerRole,
  onUpdateProcessState,
  onOpenWarehouseCorrection,
  onOpenLinkPO,
  onSubmitQCVerification,
  onSubmitSupervisorReview,
}: GRDetailSidebarProps) {
  const [items, setItems] = useState<GRItem[]>([]);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [uploadedFiles, setUploadedFiles] = useState<UploadFile[]>([]);
  const [remarkModalState, setRemarkModalState] = useState<RemarkModalState>(null);
  const [draftRemark, setDraftRemark] = useState('');
  const [supervisorNote, setSupervisorNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const routingSummary = useMemo(() => summarizeQcRouting(items), [items]);

  useEffect(() => {
    if (!open || !receipt) return;
    const qcSupportingDocs = (receipt.documentChecklist.supportingDocs || []).filter(
      (doc) => doc.source === 'QC',
    );

    setItems(
      receipt.items.map((item) => ({
        ...item,
        qcDecision: item.qcDecision,
        qcRemark: item.qcRemark || '',
      })),
    );
    setErrors({});
    setUploadedFiles(supportingDocsToUploadFiles(qcSupportingDocs));
    setRemarkModalState(null);
    setDraftRemark('');
    setSupervisorNote('');
    setIsSubmitting(false);
  }, [open, receipt]);

  if (!receipt) return null;

  const supportingDocs = receipt.documentChecklist.supportingDocs || [];
  const warehouseSupportingDocs = supportingDocs.filter((doc) => doc.source !== 'QC');
  const timelineActivities = buildReceiptTimelineActivities(receipt);
  const canSubmitForQC = viewerRole === 'WAREHOUSE_STAFF' && receipt.processState === 'GRPO_DRAFT';
  const canOpenWarehouseCorrection =
    viewerRole === 'WAREHOUSE_STAFF' &&
    ['CORRECTION_REQUIRED', 'MISMATCH_EXCEPTION'].includes(receipt.processState);
  const canLinkPO =
    viewerRole === 'WAREHOUSE_STAFF' &&
    receipt.receiptSourceType === 'TEMP_NO_PO' &&
    receipt.poLinkStatus === 'WAITING_PO';
  const isQcEditable = viewerRole === 'QC' && receipt.processState === 'QC_PENDING';
  const canSupervisorReview =
    viewerRole === 'WAREHOUSE_SUPERVISOR' &&
    receipt.processState === 'PENDING_SUPERVISOR_REVIEW';
  const showQcReadOnly = viewerRole !== 'WAREHOUSE_STAFF' && !isQcEditable;
  const reviewerLabel =
    receipt.approvedBy === 'qam.inspector' ||
    ['QC_PASSED', 'CORRECTION_REQUIRED', 'MISMATCH_EXCEPTION'].includes(receipt.processState)
      ? 'QC Reviewed By'
      : 'Approved By';
  const reviewerDateLabel = reviewerLabel === 'QC Reviewed By' ? 'QC Reviewed Date' : 'Approved Date';
  const shortMetadataItems: ReceiptMetadataItem[] = [
    { label: 'Receiving / GR Number', value: receipt.grNumber, emphasize: true },
    { label: 'PO Reference', value: summarizePOReferences(receipt), emphasize: true },
    { label: 'Supplier', value: summarizeSuppliers(receipt) },
    { label: 'Type', value: receipt.receiptType },
    { label: 'Source', value: goodsReceiptSourceLabel[receipt.receiptSourceType] },
    { label: 'Status', value: receipt.status },
    { label: 'Posting Date', value: receipt.postingDate },
    { label: 'Actual Receipt Date', value: receipt.actualReceiptDate },
    { label: 'Receiver Warehouse', value: receipt.receiverWarehouseName },
    { label: 'Delivery Note', value: receipt.deliveryNoteNumber },
    { label: 'Created By', value: receipt.createdBy },
    { label: 'Created Date', value: receipt.createdDate },
    ...(receipt.approvedBy ? [{ label: reviewerLabel, value: receipt.approvedBy }] : []),
    ...(receipt.approvedDate ? [{ label: reviewerDateLabel, value: receipt.approvedDate }] : []),
    ...(receipt.linkedPoNumber ? [{ label: 'Linked PO', value: receipt.linkedPoNumber }] : []),
    ...(receipt.linkedPoLinkedAt ? [{ label: 'Linked At', value: receipt.linkedPoLinkedAt }] : []),
    ...(receipt.linkedPoLinkedBy ? [{ label: 'Linked By', value: receipt.linkedPoLinkedBy }] : []),
  ];
  const primaryMetadataItems = shortMetadataItems.slice(0, 15);
  const primaryMetadataColumns = Array.from({ length: 3 }, (_value, columnIndex) =>
    primaryMetadataItems.slice(columnIndex * 5, (columnIndex + 1) * 5),
  );
  const overflowMetadataItems = shortMetadataItems.slice(15);
  const noteMetadataItems: ReceiptMetadataItem[] = [
    ...(receipt.pendingPOReason ? [{ label: 'Pending PO Note', value: receipt.pendingPOReason }] : []),
    ...(receipt.linkBlockReason ? [{ label: 'Link Check', value: receipt.linkBlockReason }] : []),
  ];
  const updateItem = (index: number, field: 'qcDecision' | 'qcRemark', value: string) => {
    setItems((prev) =>
      prev.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item)),
    );
    setErrors((prev) => ({
      ...prev,
      [`decision-${index}`]: false,
      [`remark-${index}`]: false,
    }));
  };

  const openQcRemarkEditor = (index: number, required = false) => {
    setRemarkModalState({
      mode: 'qc',
      index,
      required,
      title: 'QC Remark',
      placeholder: 'Add inspection note or reason for this item',
    });
    setDraftRemark(items[index]?.qcRemark || '');
  };

  const openSupervisorRemarkEditor = (required = false, submitAfterSave?: 'reject') => {
    setRemarkModalState({
      mode: 'supervisor',
      required,
      title: 'Supervisor Remark',
      placeholder: 'Add supervisor note for this receipt',
      submitAfterSave,
    });
    setDraftRemark(supervisorNote);
  };

  const handleDecisionChange = (index: number, value: QcDecision) => {
    updateItem(index, 'qcDecision', value);
    if (value === 'Reject' && !items[index]?.qcRemark?.trim()) {
      openQcRemarkEditor(index, true);
    }
  };

  const isRemarkModalCancelDisabled =
    remarkModalState?.required === true && !draftRemark.trim();

  const closeRemarkModal = () => {
    if (isRemarkModalCancelDisabled) return;
    setRemarkModalState(null);
    setDraftRemark('');
  };

  const handleUploadChange: UploadProps['onChange'] = (info) => {
    setUploadedFiles(normalizeUploadFileList(info.fileList, 10, 'QC'));
  };

  const removeFile = (uid: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.uid !== uid));
  };

  const validateQcReview = () => {
    const nextErrors: Record<string, boolean> = {};
    let firstMissingRemarkIndex: number | null = null;

    items.forEach((item, index) => {
      if (!item.qcDecision) {
        nextErrors[`decision-${index}`] = true;
      }
      if (
        (item.qcDecision === 'On-Hold' || item.qcDecision === 'Reject') &&
        !item.qcRemark?.trim()
      ) {
        nextErrors[`remark-${index}`] = true;
        if (firstMissingRemarkIndex === null) {
          firstMissingRemarkIndex = index;
        }
      }
    });

    setErrors(nextErrors);
    if (firstMissingRemarkIndex !== null) {
      openQcRemarkEditor(
        firstMissingRemarkIndex,
        items[firstMissingRemarkIndex]?.qcDecision === 'Reject',
      );
    }
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmitQcReview = async () => {
    if (!isQcEditable) return;
    if (!validateQcReview()) return;
    if (hasIncompleteAppFilesUpload(uploadedFiles)) {
      message.error('Remove failed files before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      const uploadedDocs = await uploadPendingSupportingDocs(uploadedFiles, 'QC');
      setUploadedFiles((prev) => applyUploadedSupportingDocs(prev, uploadedDocs));
      const outcome = deriveQcOutcome(items);
      await onSubmitQCVerification(receipt, {
        items,
        ...outcome,
        documentChecklist: {
          ...receipt.documentChecklist,
          supportingDocs: [...warehouseSupportingDocs, ...uploadedDocs],
        },
      });
    } catch (error: any) {
      message.error(error?.message || 'Failed to prepare supporting documents.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitSupervisorAction = async (
    action: 'approve' | 'reject',
    noteOverride?: string,
  ) => {
    if (!canSupervisorReview) return;

    const nextNote = noteOverride ?? supervisorNote;
    if (action === 'reject' && !nextNote?.trim()) {
      openSupervisorRemarkEditor(true, 'reject');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmitSupervisorReview(receipt, {
        action,
        note: nextNote?.trim() || undefined,
      });
      if (action === 'approve') {
        setSupervisorNote('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveRemark = async () => {
    if (!remarkModalState) return;

    if (remarkModalState.mode === 'qc') {
      updateItem(remarkModalState.index, 'qcRemark', draftRemark);
      setRemarkModalState(null);
      setDraftRemark('');
      return;
    }

    const nextRemark = draftRemark;
    const submitAfterSave = remarkModalState.submitAfterSave;
    setSupervisorNote(nextRemark);
    setRemarkModalState(null);
    setDraftRemark('');

    if (submitAfterSave === 'reject') {
      await handleSubmitSupervisorAction('reject', nextRemark);
    }
  };

  const headerActions: ReactNode[] = [];

  if (canOpenWarehouseCorrection) {
    headerActions.push(
      <Button
        key="warehouse-recheck"
        type="primary"
        onClick={() => onOpenWarehouseCorrection(receipt)}
      >
        Recheck & Correct
      </Button>,
    );
  } else if (canSubmitForQC) {
    headerActions.push(
      <Button
        key="submit-qc"
        type="primary"
        onClick={() => onUpdateProcessState(receipt.grNumber, 'QC_PENDING', 'Submitted for QC')}
      >
        Submit for QC
      </Button>,
    );
  } else if (isQcEditable) {
    headerActions.push(
      <Button
        key="submit-qc-review"
        type="primary"
        onClick={() => void handleSubmitQcReview()}
        loading={isSubmitting}
      >
        Submit Review
      </Button>,
    );
  } else if (receipt.processState === 'QC_PASSED' && viewerRole === 'WAREHOUSE_STAFF') {
    headerActions.push(
      <Button
        key="submit-supervisor"
        type="primary"
        onClick={() =>
          onUpdateProcessState(
            receipt.grNumber,
            'PENDING_SUPERVISOR_REVIEW',
            'Submitted to warehouse supervisor after QC pass',
          )
        }
      >
        Submit for Supervisor Review
      </Button>,
    );
  } else if (
    canSupervisorReview
  ) {
    headerActions.push(
      <Button key="supervisor-remark" onClick={() => openSupervisorRemarkEditor()}>
        Add Remark
      </Button>,
    );
    headerActions.push(
      <Button
        key="supervisor-reject"
        danger
        onClick={() => void handleSubmitSupervisorAction('reject')}
        loading={isSubmitting}
      >
        Reject
      </Button>,
    );
    headerActions.push(
      <Button
        key="supervisor-approve"
        type="primary"
        onClick={() => void handleSubmitSupervisorAction('approve')}
        loading={isSubmitting}
      >
        Approve
      </Button>,
    );
  }

  if (canLinkPO) {
    headerActions.push(
      <Button key="link-po" onClick={() => onOpenLinkPO(receipt)}>
        Link PO
      </Button>,
    );
  }

  const columns: ProColumns<EditableSidebarItem>[] = [
    {
      title: 'No',
      width: 48,
      render: (_: unknown, _row: EditableSidebarItem, index: number) => index + 1,
    },
    {
      title: 'Item',
      key: 'item',
      width: 180,
      render: (_: unknown, row: EditableSidebarItem) => (
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 500 }}>{row.code}</div>
          <div
            style={{
              fontSize: 12,
              color: '#666',
              whiteSpace: 'normal',
              wordBreak: 'break-word',
            }}
          >
            {row.name}
          </div>
        </div>
      ),
    },
    {
      title: 'PO Qty',
      dataIndex: 'poQty',
      valueType: 'digit',
      width: 70,
    },
    {
      title: 'Received',
      dataIndex: 'receiveQty',
      valueType: 'digit',
      width: 80,
    },
    { title: 'UoM', dataIndex: 'uom', width: 60 },
    {
      title: 'Product Date',
      dataIndex: 'productDate',
      width: 100,
      render: (_: unknown, row: EditableSidebarItem) => row.productDate || '-',
    },
    {
      title: 'Expiry',
      dataIndex: 'expiryDate',
      width: 100,
      render: (_: unknown, row: EditableSidebarItem) => row.expiryDate || '-',
    },
    {
      title: 'Batch Number',
      dataIndex: 'batchNumber',
      width: 120,
      render: (_: unknown, row: EditableSidebarItem) => (
        <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', fontSize: 12 }}>
          {row.batchNumber || '-'}
        </div>
      ),
    },
    {
      title: 'Receipt Status',
      key: 'receiptStatus',
      width: 110,
      render: (_: unknown, row: EditableSidebarItem) => {
        if (row.isMissing) return <Tag color="error">Missing</Tag>;
        if (row.receiveQty < row.poQty) return <Tag color="warning">Short</Tag>;
        return <Tag color="success">Matched</Tag>;
      },
    },
    {
      title: 'Receipt Remark',
      key: 'missingRemark',
      width: 160,
      render: (_: unknown, row: EditableSidebarItem) => (
        <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', fontSize: 12 }}>
          {row.missingRemark?.trim() || '-'}
        </div>
      ),
    },
  ];

  if (isQcEditable) {
    columns.push(
      {
        title: 'QC Remark',
        key: 'qcRemark',
        width: 180,
        render: (_: unknown, row: EditableSidebarItem) => (
          <Input.TextArea
            autoSize={{ minRows: 1, maxRows: 3 }}
            placeholder="Add QC inspection note"
            value={row.qcRemark}
            onChange={(event) => updateItem(row.index, 'qcRemark', event.target.value)}
            status={errors[`remark-${row.index}`] ? 'error' : undefined}
          />
        ),
      },
      {
        title: 'Decision',
        key: 'qcDecision',
        width: 130,
        render: (_: unknown, row: EditableSidebarItem) => (
          <Select<QcDecision>
            style={{ width: '100%' }}
            placeholder="Select"
            value={row.qcDecision}
            onChange={(value) => handleDecisionChange(row.index, value)}
            status={errors[`decision-${row.index}`] ? 'error' : undefined}
            options={[
              { value: 'Pass', label: 'Pass' },
              { value: 'On-Hold', label: 'On-Hold' },
              { value: 'Reject', label: 'Reject' },
            ]}
          />
        ),
      },
    );
  } else if (showQcReadOnly) {
    columns.push(
      {
        title: 'QC Remark',
        key: 'qcRemark',
        width: 160,
        render: (_: unknown, row: EditableSidebarItem) => (
          <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', fontSize: 12 }}>
            {row.qcRemark?.trim() || '-'}
          </div>
        ),
      },
      {
        title: 'QC Decision',
        key: 'qcDecision',
        width: 120,
        render: (_: unknown, row: EditableSidebarItem) => (
          <Tag
            color={
              row.qcDecision === 'Reject'
                ? 'red'
                : row.qcDecision === 'On-Hold'
                  ? 'gold'
                  : 'green'
            }
          >
            {row.qcDecision || 'Pass'}
          </Tag>
        ),
      },
    );
  }

  return (
    <DrawerForm
      title={
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            width: '100%',
            paddingRight: 12,
          }}
        >
          <span>Inbound Receiving Detail</span>
          <Space>{headerActions}</Space>
        </div>
      }
      open={open}
      onOpenChange={(value: boolean) => !value && onClose()}
      submitter={false}
      width="calc(100vw - 32px)"
      drawerProps={{
        destroyOnClose: true,
        bodyStyle: { paddingInline: 16, paddingTop: 16, paddingBottom: 16 },
      }}
    >
      <Spin spinning={isSubmitting}>
        <ProCard bodyStyle={{ paddingInline: 8, paddingTop: 8, paddingBottom: 8 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              gap: 16,
            }}
          >
            {primaryMetadataColumns.map((columnItems, columnIndex) => (
              <div
                key={`primary-column-${columnIndex}`}
                style={{
                  display: 'grid',
                  gap: 12,
                  alignContent: 'start',
                }}
              >
                {columnItems.map((item) => (
                  <div key={item.label} style={{ minWidth: 0 }}>
                    <div
                      style={{
                        marginBottom: 4,
                        fontSize: 12,
                        lineHeight: '18px',
                        color: '#8c8c8c',
                      }}
                    >
                      {item.label}
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: item.emphasize ? 600 : 400,
                        color: '#262626',
                        whiteSpace: 'normal',
                        wordBreak: 'break-word',
                      }}
                    >
                      {renderMetadataValue(item.value)}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {overflowMetadataItems.length > 0 && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gap: '12px 16px',
                marginTop: 12,
                paddingTop: 12,
                borderTop: '1px solid #f0f0f0',
              }}
            >
              {overflowMetadataItems.map((item) => (
                <div key={item.label} style={{ minWidth: 0 }}>
                  <div
                    style={{
                      marginBottom: 4,
                      fontSize: 12,
                      lineHeight: '18px',
                      color: '#8c8c8c',
                    }}
                  >
                    {item.label}
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      color: '#262626',
                      whiteSpace: 'normal',
                      wordBreak: 'break-word',
                    }}
                  >
                    {renderMetadataValue(item.value)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {noteMetadataItems.length > 0 && (
            <div
              style={{
                display: 'grid',
                gap: 12,
                marginTop: 12,
                paddingTop: 12,
                borderTop: '1px solid #f0f0f0',
              }}
            >
              {noteMetadataItems.map((item) => (
                <div key={item.label} style={{ minWidth: 0 }}>
                  <div
                    style={{
                      marginBottom: 4,
                      fontSize: 12,
                      lineHeight: '18px',
                      color: '#8c8c8c',
                    }}
                  >
                    {item.label}
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      color: '#262626',
                      whiteSpace: 'normal',
                      wordBreak: 'break-word',
                    }}
                  >
                    {renderMetadataValue(item.value)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {(!receipt.specMatch ||
            !receipt.qtyMatch ||
            receipt.processState === 'MISMATCH_EXCEPTION') && (
            <>
              <Divider style={{ margin: '12px 0' }} />
              <Alert
                type="error"
                showIcon
                message={
                  <span>
                    <strong>Exception:</strong> Receipt requires follow-up before it can proceed.
                    {receipt.exceptionReason ? ` ${receipt.exceptionReason}` : ''}
                  </span>
                }
              />
            </>
          )}

          {isQcEditable && (
            <>
              <Divider style={{ margin: '12px 0' }} />
              <Alert type={routingSummary.type} showIcon message={routingSummary.message} />
            </>
          )}

          <Divider />
          <div style={{ marginInline: -8 }}>
            <ProTable<EditableSidebarItem>
              headerTitle="Receipt Items"
              size="small"
              search={false}
              rowKey="key"
              dataSource={items.map((item, index) => ({
                ...item,
                index,
                key: `${item.poNumber}-${item.code}-${item.batchNumber || index}`,
              }))}
              options={{ density: false, fullScreen: false, reload: false, setting: false }}
              pagination={false}
              tableLayout="fixed"
              columns={columns}
            />
          </div>

          <Divider />
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 600, marginBottom: 12 }}>Supporting Documents</div>
            {isQcEditable ? (
              <>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontWeight: 500, marginBottom: 8 }}>Warehouse Documents</div>
                  <SupportingDocsList
                    docs={warehouseSupportingDocs}
                    emptyText="No warehouse documents attached."
                    displayMode="grid"
                    collapsedLimit={5}
                  />
                </div>
                <div>
                  <div style={{ fontWeight: 500, marginBottom: 8 }}>QC Documents</div>
                  <Upload
                    multiple
                    beforeUpload={stageSupportingDocBeforeUpload}
                    fileList={uploadedFiles}
                    showUploadList={false}
                    onChange={handleUploadChange}
                    onRemove={(file) => {
                      removeFile(file.uid);
                      return true;
                    }}
                    onPreview={(file) => previewSupportingUploadFile(file)}
                    accept=".pdf,.doc,.docx,image/*"
                    listType="text"
                  >
                    <Button icon={<InboxOutlined />}>Upload Files</Button>
                  </Upload>
                  <div style={{ marginTop: 12 }}>
                    <SupportingDocsList
                      files={uploadedFiles}
                      fallbackSource="QC"
                      onRemoveFile={removeFile}
                      emptyText="No QC documents attached."
                      displayMode="grid"
                      collapsedLimit={5}
                    />
                  </div>
                </div>
              </>
            ) : (
              <SupportingDocsList docs={supportingDocs} />
            )}
          </div>

          <Divider />
          <div style={{ fontWeight: 600, marginBottom: 16 }}>Activities</div>
          <Timeline
            items={timelineActivities.map((activity) => ({
              color:
                activity.state === 'done'
                  ? 'green'
                  : activity.state === 'active'
                    ? 'orange'
                    : 'gray',
              children: (
                <div>
                  <div style={{ fontWeight: 600 }}>{activity.title}</div>
                  <div style={{ fontSize: 12, color: '#666' }}>{activity.description}</div>
                  {activity.timestamp && (
                    <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>
                      {activity.timestamp}
                    </div>
                  )}
                </div>
              ),
            }))}
          />
        </ProCard>
      </Spin>

      <Modal
        title={remarkModalState?.title}
        open={remarkModalState !== null}
        onCancel={closeRemarkModal}
        onOk={handleSaveRemark}
        okText="Save"
        cancelButtonProps={{ disabled: isRemarkModalCancelDisabled }}
        closable={!isRemarkModalCancelDisabled}
        keyboard={!isRemarkModalCancelDisabled}
        maskClosable={!isRemarkModalCancelDisabled}
        width={640}
        destroyOnClose
      >
        <Input.TextArea
          rows={10}
          placeholder={remarkModalState?.placeholder}
          value={draftRemark}
          onChange={(event) => setDraftRemark(event.target.value)}
        />
      </Modal>
    </DrawerForm>
  );
}
