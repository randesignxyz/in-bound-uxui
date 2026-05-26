import { InboxOutlined } from '@ant-design/icons';
import { ProCard, ProTable } from '@ant-design/pro-components';
import { DrawerForm } from '@ant-design/pro-form';
import type { ProColumns } from '@ant-design/pro-table';
import {
  Alert,
  Badge,
  Button,
  Collapse,
  Divider,
  Input,
  Modal,
  Select,
  Space,
  Spin,
  Tag,
  Timeline,
  Typography,
  Upload,
  message,
} from 'antd';
import type { UploadFile, UploadProps } from 'antd';
import { type ReactNode, useEffect, useMemo, useState } from 'react';
import {
  applyUploadedSupportingDocs,
  getSupportingUploadFilePreview,
  hasIncompleteAppFilesUpload,
  normalizeUploadFileList,
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
  getReceiptDisplayStatus,
  getReceiptDisplayStatusColor,
  getReceiptApprovedGrNumber,
  getReceiptIrNumber,
  getReceiptPOReferences,
  getReceiptSapStatus,
  groupReceiptItemsByPO,
  // summarizePOReferences,
  summarizeSuppliers,
} from '../workflow';
import { SupportingDocPreviewModal } from './SupportingDocPreviewModal';
import { SupportingDocsList } from './SupportingDocsList';

const { Text } = Typography;

type EditableSidebarItem = GRItem & {
  index: number;
  key: string;
};

function splitDeliveryNotes(value?: string) {
  return value?.split(',').map((entry) => entry.trim()).filter(Boolean) ?? [];
}

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
  onUpdateProcessState: (
    grNumber: string,
    newState: InboundProcessState,
    note?: string,
    action?: string,
  ) => Promise<void> | void;
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
  onViewPODetails?: (poNumber: string, businessUnit?: string) => void;
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

function isRejectedActivityTitle(title: string) {
  return title === 'QC Rejected' || title === 'Supervisor Rejected';
}

export function GRDetailSidebar({
  open,
  onClose,
  receipt: selectedReceipt,
  viewerRole,
  onUpdateProcessState,
  onOpenWarehouseCorrection,
  onOpenLinkPO,
  onSubmitQCVerification,
  onSubmitSupervisorReview,
  onViewPODetails,
}: GRDetailSidebarProps) {
  const [items, setItems] = useState<GRItem[]>([]);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [uploadedFiles, setUploadedFiles] = useState<UploadFile[]>([]);
  const [remarkModalState, setRemarkModalState] = useState<RemarkModalState>(null);
  const [draftRemark, setDraftRemark] = useState('');
  const [supervisorNote, setSupervisorNote] = useState('');
  const [activePoPanels, setActivePoPanels] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(open);
  const [renderedReceipt, setRenderedReceipt] = useState<GoodsReceipt | null>(selectedReceipt);
  const [previewState, setPreviewState] = useState<{
    fileName?: string;
    url?: string;
    revokeOnClose?: boolean;
  } | null>(null);
  const receipt = selectedReceipt || renderedReceipt;

  useEffect(() => {
    if (selectedReceipt) {
      setRenderedReceipt(selectedReceipt);
    }
    setDrawerOpen(open);
  }, [open, selectedReceipt]);

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
    setActivePoPanels([]);
    setIsSubmitting(false);
  }, [open, receipt]);

  const supportingDocs = receipt?.documentChecklist.supportingDocs || [];
  const warehouseSupportingDocs = supportingDocs.filter((doc) => doc.source !== 'QC');
  const receiptLevelSupportingDocs = supportingDocs.filter((doc) => !doc.poNumber);
  const qcSupportingDocs = supportingDocs.filter((doc) => doc.source === 'QC');
  const timelineActivities = useMemo(
    () => (receipt ? buildReceiptTimelineActivities(receipt) : []),
    [receipt],
  );
  const editableItems = useMemo(
    () =>
      receipt
        ? items.map((item, index) => ({
            ...item,
            index,
            key: `${item.poNumber || receipt.linkedPoNumber || receipt.poNumber || 'TEMP'}-${item.code}-${item.batchNumber || index}`,
          }))
        : [],
    [items, receipt?.linkedPoNumber, receipt?.poNumber],
  );
  const groupedReceiptItems = useMemo(
    () => (receipt ? groupReceiptItemsByPO(receipt, editableItems) : []),
    [editableItems, receipt],
  );
  const isMultiPOReceipt = groupedReceiptItems.length > 1;
  const shouldShowPoDocumentBlock = isMultiPOReceipt;
  const warehouseReceiptLevelDocs = receiptLevelSupportingDocs.filter((doc) => doc.source !== 'QC');
  const readonlySupportingDocs = isMultiPOReceipt ? qcSupportingDocs : receiptLevelSupportingDocs;

  useEffect(() => {
    if (!open || !receipt) {
      return;
    }

    setActivePoPanels(groupedReceiptItems.length === 1 ? [groupedReceiptItems[0].key] : []);
  }, [groupedReceiptItems.length, groupedReceiptItems[0]?.key, open, receipt?.grNumber]);

  if (!receipt) return null;

  const canSubmitForQC = viewerRole === 'WAREHOUSE_STAFF' && receipt.processState === 'GRPO_DRAFT';
  const canSkipQc = viewerRole === 'WAREHOUSE_STAFF' && receipt.processState === 'QC_PENDING';
  const canOpenWarehouseCorrection =
    viewerRole === 'WAREHOUSE_STAFF' &&
    ['CORRECTION_REQUIRED', 'MISMATCH_EXCEPTION'].includes(receipt.processState);
  const canLinkPO =
    viewerRole === 'WAREHOUSE_STAFF' &&
    receipt.receiptSourceType === 'TEMP_NO_PO' &&
    receipt.poLinkStatus === 'WAITING_PO';
  const isSupervisorBlockedByMissingPo =
    receipt.receiptSourceType === 'TEMP_NO_PO' &&
    receipt.poLinkStatus === 'WAITING_PO' &&
    !receipt.linkedPoNumber;
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
  const displayedStatus = getReceiptSapStatus(receipt) || getReceiptDisplayStatus(receipt);
  const approvedGrNumber = getReceiptApprovedGrNumber(receipt);
  const poReferences = getReceiptPOReferences(receipt);
  const poReferenceValue =
    poReferences.length > 0 ? (
      <Space size={[4, 4]} wrap>
        {poReferences.map((ref, idx) => (
          <span key={ref.poNumber}>
            <a
              onClick={() => {
                if (onViewPODetails) {
                  onViewPODetails(ref.poNumber, ref.businessUnit);
                }
              }}
              style={{
                color: '#1890ff',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {ref.poNumber}
            </a>
            {idx < poReferences.length - 1 && <span style={{ color: '#8c8c8c' }}>, </span>}
          </span>
        ))}
      </Space>
    ) : receipt.receiptSourceType === 'TEMP_NO_PO' ? (
      <Text type="secondary">Waiting SAP PO</Text>
    ) : (
      <Text style={{ color: '#ff4d4f', fontWeight: 600 }}>No PO</Text>
    );
  const shortMetadataItems: ReceiptMetadataItem[] = [
    { label: 'IR Number', value: getReceiptIrNumber(receipt), emphasize: true },
    ...(approvedGrNumber ? [{ label: 'GR Number', value: approvedGrNumber, emphasize: true }] : []),
    { label: 'PO Reference', value: poReferenceValue, emphasize: true },
    { label: 'Supplier', value: summarizeSuppliers(receipt) },
    { label: 'Type', value: receipt.receiptType },
    {
      label: 'Status',
      value: (
        <Tag color={getReceiptDisplayStatusColor(displayedStatus)} bordered={false}>
          {displayedStatus}
        </Tag>
      ),
    },
    { label: 'Posting Date', value: receipt.postingDate },
    { label: 'Actual Receipt Date', value: receipt.actualReceiptDate },
    { label: 'Receiver Warehouse', value: receipt.receiverWarehouseName },
    { label: 'Created By', value: receipt.createdBy },
    { label: 'Created Date', value: receipt.createdDate },
    ...(receipt.approvedBy ? [{ label: reviewerLabel, value: receipt.approvedBy }] : []),
    ...(receipt.approvedDate ? [{ label: reviewerDateLabel, value: receipt.approvedDate }] : []),
    ...(receipt.linkedPoLinkedAt ? [{ label: 'Linked At', value: receipt.linkedPoLinkedAt }] : []),
    ...(receipt.linkedPoLinkedBy ? [{ label: 'Linked By', value: receipt.linkedPoLinkedBy }] : []),
  ];
  const noteMetadataItems: ReceiptMetadataItem[] = [
    ...(receipt.pendingPOReason ? [{ label: 'Pending PO Note', value: receipt.pendingPOReason }] : []),
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
    let hasMissingDecision = false;
    let firstMissingRemarkIndex: number | null = null;

    items.forEach((item, index) => {
      if (!item.qcDecision) {
        nextErrors[`decision-${index}`] = true;
        hasMissingDecision = true;
      }
      if (
        item.qcDecision === 'Reject' &&
        !item.qcRemark?.trim()
      ) {
        nextErrors[`remark-${index}`] = true;
        if (firstMissingRemarkIndex === null) {
          firstMissingRemarkIndex = index;
        }
      }
    });

    setErrors(nextErrors);
    if (hasMissingDecision) {
      message.error('Please select a decision for every item before submitting.');
    }
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

    Modal.confirm({
      title: 'Submit QC review?',
      content: 'This will submit the QC review for this inbound receiving.',
      okText: 'Submit Review',
      cancelText: 'Cancel',
      onOk: async () => {
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
      },
    });
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

    if (action === 'approve') {
      Modal.confirm({
        title: 'Approve inbound receiving?',
        content: 'This will approve the inbound receiving and continue the workflow.',
        okText: 'Approve',
        cancelText: 'Cancel',
        onOk: async () => {
          setIsSubmitting(true);
          try {
            await onSubmitSupervisorReview(receipt, {
              action,
              note: nextNote?.trim() || undefined,
            });
            setSupervisorNote('');
          } finally {
            setIsSubmitting(false);
          }
        },
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmitSupervisorReview(receipt, {
        action,
        note: nextNote?.trim() || undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkipQc = () => {
    if (!canSkipQc) return;

    Modal.confirm({
      title: 'Skip QC?',
      content:
        'This will bypass QC review for this receipt and send it directly to supervisor review.',
      okText: 'Skip QC',
      cancelText: 'Cancel',
      onOk: () =>
        onUpdateProcessState(
          receipt.grNumber,
          'PENDING_SUPERVISOR_REVIEW',
          'Warehouse skipped QC and forwarded the receipt directly to supervisor review',
          'SKIP_QC',
        ),
    });
  };

  const handlePreviewFile = async (file: UploadFile) => {
    const preview = await getSupportingUploadFilePreview(file);
    if (preview) {
      setPreviewState({
        fileName: file.name,
        url: preview.url,
        revokeOnClose: preview.revokeOnClose,
      });
      return;
    }

    message.error('Preview is not available for this file.');
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
        onClick={() =>
          Modal.confirm({
            title: 'Submit to QC?',
            content: 'This will submit the inbound receiving to QC for review.',
            okText: 'Confirm',
            cancelText: 'Cancel',
            onOk: () => onUpdateProcessState(receipt.grNumber, 'QC_PENDING', 'Submitted for QC'),
          })
        }
      >
        Submit for QC
      </Button>,
    );
  } else if (canSkipQc) {
    headerActions.push(
      <Button key="skip-qc" onClick={handleSkipQc}>
        Skip QC
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
        disabled={isSupervisorBlockedByMissingPo}
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
        disabled={isSupervisorBlockedByMissingPo}
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
          <Badge dot={isQcEditable && !row.qcDecision} color="#faad14" offset={[4, 2]}>
            <div style={{ fontWeight: 500, display: 'inline-block' }}>{row.code}</div>
          </Badge>
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
      title: 'Delivery Note',
      dataIndex: 'deliveryNoteNumber',
      width: 140,
      render: (_: unknown, row: EditableSidebarItem) => (
        <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', fontSize: 12 }}>
          {row.deliveryNoteNumber || '-'}
        </div>
      ),
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
        render: (_: unknown, row: EditableSidebarItem) => {
          const decision = row.qcDecision;
          return (
            <Tag color={decision === 'Reject' ? 'red' : decision === 'Pass' ? 'green' : 'default'}>
              {decision || 'Pending'}
            </Tag>
          );
        },
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
          <Space size={12}>
            {canSupervisorReview && isSupervisorBlockedByMissingPo && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                Waiting for PO link
              </Text>
            )}
            <Space>{headerActions}</Space>
          </Space>
        </div>
      }
      open={drawerOpen}
      onOpenChange={(visible: boolean) => setDrawerOpen(visible)}
      submitter={false}
      width="calc(100vw - 32px)"
      drawerProps={{
        destroyOnClose: false,
        afterOpenChange: (visible) => {
          if (!visible) {
            onClose();
            setRenderedReceipt(null);
          }
        },
        bodyStyle: { paddingInline: 16, paddingTop: 16, paddingBottom: 16 },
      }}
    >
      <Spin spinning={isSubmitting}>
        <ProCard bodyStyle={{ paddingInline: 8, paddingTop: 8, paddingBottom: 8 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 16,
            }}
          >
            {shortMetadataItems.map((item) => (
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

          <Divider />
          <div style={{ fontWeight: 600, marginBottom: 16 }}>Receipt Items</div>
          {groupedReceiptItems.length > 0 ? (
            <Collapse
              activeKey={activePoPanels}
              onChange={(keys) =>
                setActivePoPanels(
                  Array.isArray(keys)
                    ? keys.map((key) => String(key))
                    : keys
                      ? [String(keys)]
                      : [],
                )
              }
              items={groupedReceiptItems.map((group) => ({
                key: group.key,
                // Surface DN at the PO header level so users can immediately see
                // which delivery note set belongs to this PO before opening item rows.
                label: (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: 16,
                      width: '100%',
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>{group.displayPoNumber}</div>
                      <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 2 }}>{group.supplier}</div>
                      <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                        {group.expectedDate
                          ? `${group.expectedDate}${group.expectedTime ? ` ${group.expectedTime}` : ''}`
                          : 'Expected date not available'}
                      </div>
                    </div>
                    <Space size={8} wrap>
                      <Tag bordered={false} color="default">
                        {group.itemCount} item{group.itemCount !== 1 ? 's' : ''}
                      </Tag>
                      <Tag
                        bordered={false}
                        color={
                          group.items.some((item) => item.isMissing) || group.totalReceiveQty < group.totalPoQty
                            ? 'warning'
                            : 'success'
                        }
                      >
                        {`${group.totalReceiveQty.toLocaleString()} / ${group.totalPoQty.toLocaleString()}`}
                      </Tag>
                    </Space>
                  </div>
                ),
                children: (
                  <div style={{ marginInline: -8 }}>
                    <div
                      style={{
                        margin: '0 8px 16px',
                        padding: '12px 16px',
                        border: '1px solid #f0f0f0',
                        borderRadius: 12,
                        background: '#fafafa',
                      }}
                    >
                      <Space direction="vertical" size={12} style={{ width: '100%' }}>
                        <div>
                          <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4 }}>
                            Delivery Notes For {group.displayPoNumber}
                          </div>
                          {splitDeliveryNotes(
                            receipt.poReferences.find((reference) => reference.poNumber === group.poNumber)
                              ?.deliveryNoteNumber || receipt.deliveryNoteNumber,
                          ).length > 0 ? (
                            <Space size={[8, 8]} wrap>
                              {splitDeliveryNotes(
                                receipt.poReferences.find((reference) => reference.poNumber === group.poNumber)
                                  ?.deliveryNoteNumber || receipt.deliveryNoteNumber,
                              ).map((deliveryNote) => (
                                <Tag key={`${group.key}-detail-${deliveryNote}`} color="processing" bordered={false}>
                                  {deliveryNote}
                                </Tag>
                              ))}
                            </Space>
                          ) : (
                            <Text strong>-</Text>
                          )}
                        </div>
                        {shouldShowPoDocumentBlock && (
                          <div>
                            <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 8 }}>
                              PO Documents
                            </div>
                            <div style={{ maxWidth: 900, maxHeight: 200 }}>
                              <SupportingDocsList
                                docs={warehouseSupportingDocs.filter((doc) => doc.poNumber === group.poNumber)}
                                emptyText="No PO-specific documents attached."
                                displayMode="grid"
                                collapsedLimit={4}
                              />
                            </div>
                          </div>
                        )}
                      </Space>
                    </div>
                    <ProTable<EditableSidebarItem>
                      size="small"
                      search={false}
                      rowKey="key"
                      dataSource={group.items}
                      options={{ density: false, fullScreen: false, reload: false, setting: false }}
                      pagination={false}
                      tableLayout="fixed"
                      columns={columns}
                    />
                  </div>
                ),
              }))}
            />
          ) : (
            <Alert
              type="info"
              showIcon
              message="No receipt items are available for this inbound receiving."
            />
          )}

          <Divider />
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 600, marginBottom: 12 }}>Supporting Documents</div>
            {isQcEditable ? (
              <>
                {!isMultiPOReceipt && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontWeight: 500, marginBottom: 8 }}>Warehouse Documents</div>
                    <SupportingDocsList
                      docs={warehouseReceiptLevelDocs}
                      emptyText="No receipt-level warehouse documents attached."
                      displayMode="grid"
                      collapsedLimit={5}
                    />
                  </div>
                )}
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
                    onPreview={(file) => void handlePreviewFile(file)}
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
              <SupportingDocsList
                docs={readonlySupportingDocs}
                emptyText={isMultiPOReceipt ? 'No QC documents attached.' : 'No receipt-level documents attached.'}
                displayMode="grid"
                collapsedLimit={5}
              />
            )}
          </div>

          <Divider />
          <div style={{ fontWeight: 600, marginBottom: 16 }}>Activities</div>
          <Timeline
            items={timelineActivities.map((activity) => ({
              color:
                isRejectedActivityTitle(activity.title)
                  ? 'red'
                  : activity.state === 'done'
                  ? 'green'
                  : activity.state === 'active'
                    ? 'orange'
                    : 'gray',
              children: (
                <div>
                  <div
                    style={{
                      fontWeight: 600,
                      color: isRejectedActivityTitle(activity.title) ? '#cf1322' : undefined,
                    }}
                  >
                    {activity.title}
                  </div>
                  {activity.secondaryText && (
                    <div style={{ fontSize: 12, color: '#666' }}>{activity.secondaryText}</div>
                  )}
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
      <SupportingDocPreviewModal
        open={Boolean(previewState)}
        fileName={previewState?.fileName}
        previewUrl={previewState?.url}
        revokeOnClose={previewState?.revokeOnClose}
        onClose={() => setPreviewState(null)}
      />
    </DrawerForm>
  );
}
