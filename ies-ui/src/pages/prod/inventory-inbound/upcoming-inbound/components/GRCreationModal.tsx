import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Collapse,
  DatePicker,
  Divider,
  Descriptions,
  Form,
  Input,
  InputNumber,
  Modal,
  Progress,
  Row,
  Col,
  Select,
  Space,
  Steps,
  Table,
  Tag,
  Typography,
  Upload,
  message,
} from 'antd';
import type { UploadFile, UploadProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  CameraOutlined,
  CloseCircleFilled,
  InboxOutlined,
  MobileOutlined,
  QrcodeOutlined,
  WarningFilled,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  buildReceiptExceptionReason,
  hasReceiptDiscrepancy,
} from '../workflow';
import type { GRItem, PurchaseOrder } from '../workflow';
import type { UpcomingInboundGoodsReceipt } from '../data';
import {
  applyUploadedSupportingDocs,
  getSupportingUploadFilePreview,
  hasIncompleteAppFilesUpload,
  normalizeUploadFileList,
  stageSupportingDocBeforeUpload,
  supportingDocsToUploadFiles,
  uploadPendingSupportingDocs,
  uploadFilesToSupportingDocs,
} from '../supportingDocs';
import { FullscreenModal } from './FullscreenModal';
import { SupportingDocPreviewModal } from './SupportingDocPreviewModal';
import { SupportingDocsList } from './SupportingDocsList';

const { Text } = Typography;

interface GRCreationModalProps {
  open: boolean;
  onClose: () => void;
  purchaseOrders: PurchaseOrder[];
  onSaveDraft: (data: Record<string, unknown>) => Promise<boolean> | boolean;
  onSubmit: (data: Record<string, unknown>) => Promise<boolean> | boolean;
  initialReceipt?: UpcomingInboundGoodsReceipt | null;
  correctionMode?: boolean;
}

const receiverWarehouseName = 'warehouse.staff01';

function buildInitialItems(purchaseOrders: PurchaseOrder[]): GRItem[] {
  return purchaseOrders.flatMap((purchaseOrder) =>
    purchaseOrder.items.map((item) => ({
      code: item.code,
      name: item.name,
      poNumber: purchaseOrder.poNumber,
      supplier: purchaseOrder.supplier,
      poQty: item.remainingQty,
      receiveQty: 0,
      uom: item.uom,
      productDate: '',
      expiryDate: '',
      batchNumber: '',
      barcode: '',
      isMissing: false,
      missingRemark: '',
    })),
  );
}

function deriveReceiptType(purchaseOrders: PurchaseOrder[]) {
  return purchaseOrders.every((purchaseOrder) => purchaseOrder.type === 'Planned')
    ? 'Planned'
    : 'Unplanned';
}

function requiresTraceabilityFields(item: GRItem) {
  return !item.isMissing && item.receiveQty > 0;
}

function hasInvalidDateOrder(productDate?: string, expiryDate?: string) {
  if (!productDate || !expiryDate) return false;

  return dayjs(productDate).isAfter(dayjs(expiryDate), 'day');
}

function renderRequiredLabel(label: string) {
  return (
    <span>
      <span style={{ color: '#ff4d4f', marginInlineEnd: 4 }}>*</span>
      {label}
    </span>
  );
}

function buildInitialPoDeliveryNotes(
  purchaseOrders: PurchaseOrder[],
  initialReceipt?: UpcomingInboundGoodsReceipt | null,
) {
  const receiptPoReferences = new Map(
    (initialReceipt?.poReferences || []).map((reference) => [reference.poNumber, reference]),
  );

  return purchaseOrders.reduce<Record<string, string>>((result, purchaseOrder) => {
    result[purchaseOrder.poNumber] =
      receiptPoReferences.get(purchaseOrder.poNumber)?.deliveryNoteNumber || '';
    return result;
  }, {});
}

function buildInitialPoUploadFiles(
  purchaseOrders: PurchaseOrder[],
  initialReceipt?: UpcomingInboundGoodsReceipt | null,
) {
  return purchaseOrders.reduce<Record<string, UploadFile[]>>((result, purchaseOrder) => {
    const poNumber = purchaseOrder.poNumber;
    const poDocs =
      initialReceipt?.documentChecklist.supportingDocs.filter((doc) => doc.poNumber === poNumber) || [];
    result[poNumber] = supportingDocsToUploadFiles(poDocs);
    return result;
  }, {});
}

function summarizeDeliveryNotes(deliveryNotes: string[]) {
  const normalizedDeliveryNotes = Array.from(
    new Set(deliveryNotes.map((deliveryNote) => deliveryNote.trim()).filter(Boolean)),
  );

  if (normalizedDeliveryNotes.length === 0) {
    return '';
  }
  if (normalizedDeliveryNotes.length === 1) {
    return normalizedDeliveryNotes[0];
  }
  return `${normalizedDeliveryNotes.length} DNs`;
}

export function GRCreationModal({
  open,
  onClose,
  purchaseOrders,
  onSaveDraft,
  onSubmit,
  initialReceipt,
  correctionMode = false,
}: GRCreationModalProps) {
  const selectedPOCount = purchaseOrders.length;
  const selectedPOReferences = [...purchaseOrders]
    .sort((left, right) => left.poNumber.localeCompare(right.poNumber))
    .map((purchaseOrder) => ({
      poNumber: purchaseOrder.poNumber,
      businessUnit: purchaseOrder.businessUnit,
      supplier: purchaseOrder.supplier,
      expectedDate: purchaseOrder.expectedDate,
      expectedTime: purchaseOrder.expectedTime,
    }));
  const supplierNames = Array.from(
    new Set(purchaseOrders.map((purchaseOrder) => purchaseOrder.supplier)),
  );
  const receiptType = deriveReceiptType(purchaseOrders);
  const firstPO = purchaseOrders[0];
  const isMultiPOReceipt = selectedPOCount > 1;

  const [postingDate, setPostingDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [actualReceiptDate, setActualReceiptDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [deliveryNoteNumber, setDeliveryNoteNumber] = useState('');
  const [poDeliveryNotes, setPoDeliveryNotes] = useState<Record<string, string>>({});
  const [items, setItems] = useState<GRItem[]>(() => buildInitialItems(purchaseOrders));
  const [uploadedFiles, setUploadedFiles] = useState<UploadFile[]>([]);
  const [poUploadedFiles, setPoUploadedFiles] = useState<Record<string, UploadFile[]>>({});
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [scanTargetPoNumber, setScanTargetPoNumber] = useState<string | null>(null);
  const [scannedValue, setScannedValue] = useState('');
  const [previewState, setPreviewState] = useState<{
    fileName?: string;
    url?: string;
    revokeOnClose?: boolean;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeItemPanels, setActiveItemPanels] = useState<string[]>([]);

  const updateItem = useCallback((index: number, field: keyof GRItem, value: unknown) => {
    let nextItem: GRItem | null = null;
    setItems((prev) =>
      prev.map((item, itemIndex) => {
        if (itemIndex !== index) return item;
        if (field === 'receiveQty') {
          const nextQty = Math.min(Math.max(0, Number(value) || 0), item.poQty);
          nextItem =
            nextQty > 0 && item.isMissing
              ? { ...item, receiveQty: nextQty, isMissing: false, missingRemark: '' }
              : { ...item, receiveQty: nextQty };
          return nextItem;
        }
        nextItem = { ...item, [field]: value } as GRItem;
        return nextItem;
      }),
    );
    setErrors((prev) => {
      const nextErrors = {
        ...prev,
        [`${String(field)}-${index}`]: false,
      };

      if (field === 'productDate' || field === 'expiryDate') {
        delete nextErrors[`productDate-${index}`];
        delete nextErrors[`expiryDate-${index}`];
      }

      if (field === 'receiveQty' && nextItem && !requiresTraceabilityFields(nextItem)) {
        delete nextErrors[`productDate-${index}`];
        delete nextErrors[`expiryDate-${index}`];
        delete nextErrors[`batchNumber-${index}`];
      }

      return nextErrors;
    });
  }, []);

  const setReceiptStatus = useCallback((index: number, status: 'Good' | 'Missing') => {
    setItems((prev) =>
      prev.map((item, itemIndex) => {
        if (itemIndex !== index) return item;

        if (status === 'Good') {
          return {
            ...item,
            isMissing: false,
            missingRemark: '',
            receiveQty: item.receiveQty > 0 ? item.receiveQty : item.poQty,
          };
        }

        return {
          ...item,
          isMissing: true,
          receiveQty: 0,
          productDate: '',
          expiryDate: '',
          batchNumber: '',
          barcode: '',
        };
      }),
    );
    setErrors((prev) => ({
      ...prev,
      [`receiveQty-${index}`]: false,
      [`productDate-${index}`]: false,
      [`expiryDate-${index}`]: false,
      [`batchNumber-${index}`]: false,
      [`missingRemark-${index}`]: false,
    }));
  }, []);

  const handleUploadChange: UploadProps['onChange'] = (info) => {
    setUploadedFiles(normalizeUploadFileList(info.fileList, 10, 'WAREHOUSE'));
  };

  const removeFile = (uid: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.uid !== uid));
  };

  const handlePoUploadChange = (poNumber: string): UploadProps['onChange'] => (info) => {
    setPoUploadedFiles((prev) => ({
      ...prev,
      [poNumber]: normalizeUploadFileList(
        info.fileList.map((file) => ({
          ...file,
          poNumber,
        })),
        10,
        'WAREHOUSE',
      ),
    }));
    setErrors((prev) => ({ ...prev, [`supportingDocs-${poNumber}`]: false }));
  };

  const removePoFile = (poNumber: string, uid: string) => {
    setPoUploadedFiles((prev) => ({
      ...prev,
      [poNumber]: (prev[poNumber] || []).filter((file) => file.uid !== uid),
    }));
  };

  const validate = (): boolean => {
    const nextErrors: Record<string, boolean> = {};
    if (!postingDate) nextErrors.postingDate = true;
    if (isMultiPOReceipt) {
      purchaseOrders.forEach((purchaseOrder) => {
        const poNumber = purchaseOrder.poNumber;
        if (!poDeliveryNotes[poNumber]?.trim()) {
          nextErrors[`deliveryNote-${poNumber}`] = true;
        }
        if (hasIncompleteAppFilesUpload(poUploadedFiles[poNumber] || [])) {
          nextErrors[`supportingDocs-${poNumber}`] = true;
        }
      });
    } else if (!deliveryNoteNumber.trim()) {
      nextErrors.deliveryNote = true;
    }
    items.forEach((item, index) => {
      if (item.isMissing) {
        if (!item.missingRemark?.trim()) nextErrors[`missingRemark-${index}`] = true;
        return;
      }
      if (item.receiveQty <= 0) nextErrors[`receiveQty-${index}`] = true;
      if (requiresTraceabilityFields(item)) {
        if (!item.productDate) nextErrors[`productDate-${index}`] = true;
        if (!item.expiryDate) nextErrors[`expiryDate-${index}`] = true;
        if (hasInvalidDateOrder(item.productDate, item.expiryDate)) {
          nextErrors[`productDate-${index}`] = true;
          nextErrors[`expiryDate-${index}`] = true;
        }
        if (!item.batchNumber.trim()) nextErrors[`batchNumber-${index}`] = true;
      }
    });

    if (!isMultiPOReceipt && hasIncompleteAppFilesUpload(uploadedFiles)) {
      nextErrors.supportingDocs = true;
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateDraftDateOrder = () => {
    const nextDateErrors: Record<string, boolean> = {};

    items.forEach((item, index) => {
      if (!requiresTraceabilityFields(item)) {
        return;
      }

      if (hasInvalidDateOrder(item.productDate, item.expiryDate)) {
        nextDateErrors[`productDate-${index}`] = true;
        nextDateErrors[`expiryDate-${index}`] = true;
      }
    });

    setErrors((prev) => {
      const next = { ...prev };

      items.forEach((_, index) => {
        delete next[`productDate-${index}`];
        delete next[`expiryDate-${index}`];
      });

      return {
        ...next,
        ...nextDateErrors,
      };
    });

    return Object.keys(nextDateErrors).length === 0;
  };

  const buildGRData = (
    submissionMode: 'draft' | 'submit',
    supportingDocs = uploadFilesToSupportingDocs(uploadedFiles, 'WAREHOUSE'),
    poSupportingDocs: Record<string, UploadFile[]> = poUploadedFiles,
  ) => {
    const hasDiscrepancy = hasReceiptDiscrepancy(items);
    const exceptionReason = buildReceiptExceptionReason(items);
    const nextProcessState =
      correctionMode || submissionMode === 'draft'
        ? 'GRPO_DRAFT'
        : 'QC_PENDING';
    const poReferences = selectedPOReferences.map((reference) => ({
      ...reference,
      deliveryNoteNumber:
        isMultiPOReceipt
          ? poDeliveryNotes[reference.poNumber] || ''
          : deliveryNoteNumber,
    }));
    const normalizedSupportingDocs = isMultiPOReceipt
      ? purchaseOrders.flatMap((purchaseOrder) =>
          uploadFilesToSupportingDocs(poSupportingDocs[purchaseOrder.poNumber] || [], 'WAREHOUSE').map((doc) => ({
            ...doc,
            poNumber: purchaseOrder.poNumber,
          })),
        )
      : supportingDocs;
    const summarizedDeliveryNote = isMultiPOReceipt
      ? summarizeDeliveryNotes(Object.values(poDeliveryNotes))
      : deliveryNoteNumber;

    return {
      id: initialReceipt?.id,
      grNumber: initialReceipt?.grNumber,
      receivingNumber: initialReceipt?.receivingNumber || initialReceipt?.grNumber,
      receiptSourceType: initialReceipt?.receiptSourceType || 'PLANNED',
      poLinkStatus: initialReceipt?.poLinkStatus || 'NOT_REQUIRED',
      linkedPoNumber: initialReceipt?.linkedPoNumber,
      tempReferenceNo: initialReceipt?.tempReferenceNo,
      pendingPOReason: initialReceipt?.pendingPOReason,
      poNumber:
        selectedPOCount === 1
          ? firstPO?.poNumber || ''
          : `${selectedPOCount} POs`,
      supplier:
        supplierNames.length === 1 ? supplierNames[0] : `${supplierNames.length} suppliers`,
      poReferences,
      supplierNames,
      receiptType,
      expectedDate: firstPO?.expectedDate,
      expectedTime: firstPO?.expectedTime,
      postingDate,
      actualReceiptDate,
      deliveryNoteNumber: summarizedDeliveryNote,
      receiverWarehouseName,
      items,
      uploadedFiles: normalizedSupportingDocs,
      specMatch: true,
      qtyMatch: !hasDiscrepancy,
      qualityCheckRequired: true,
      qcResult: 'Pending',
      exceptionReason,
      processState: nextProcessState,
      documentChecklist: {
        vendorDN: isMultiPOReceipt
          ? Object.values(poDeliveryNotes).some((value) => value.trim().length > 0)
          : deliveryNoteNumber.trim().length > 0,
        goodsReceiptPOForm: true,
        pmrmStockCardForm: false,
        supportingDocs: normalizedSupportingDocs,
      },
    };
  };

  const handleSaveDraft = async () => {
    if (!validateDraftDateOrder()) return;
    setIsSubmitting(true);
    try {
      const supportingDocs = isMultiPOReceipt
        ? []
        : await uploadPendingSupportingDocs(uploadedFiles, 'WAREHOUSE');
      const uploadedPoSupportingDocs = isMultiPOReceipt
        ? await Promise.all(
            purchaseOrders.map(
              async (purchaseOrder): Promise<[string, UploadFile[]]> => [
                purchaseOrder.poNumber,
                applyUploadedSupportingDocs(
                  poUploadedFiles[purchaseOrder.poNumber] || [],
                  await uploadPendingSupportingDocs(
                    poUploadedFiles[purchaseOrder.poNumber] || [],
                    'WAREHOUSE',
                  ),
                ),
              ],
            ),
          )
        : [];
      if (!isMultiPOReceipt) {
        setUploadedFiles((prev) => applyUploadedSupportingDocs(prev, supportingDocs));
      } else {
        setPoUploadedFiles((prev) =>
          uploadedPoSupportingDocs.reduce<Record<string, UploadFile[]>>((next, [poNumber, docs]) => {
            next[poNumber] = docs;
            return next;
          }, { ...prev }),
        );
      }
      const shouldClose = await onSaveDraft(
        buildGRData(
          'draft',
          supportingDocs,
          Object.fromEntries(uploadedPoSupportingDocs) as Record<string, UploadFile[]>,
        ),
      );
      if (shouldClose) {
        onClose();
      }
    } catch (error: any) {
      message.error(error?.message || 'Failed to prepare supporting documents.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    Modal.confirm({
      title: 'Submit to QC?',
      content: 'This will submit the inbound receiving to QC for review.',
      okText: 'Confirm',
      cancelText: 'Cancel',
      onOk: async () => {
        setIsSubmitting(true);
        try {
          const supportingDocs = isMultiPOReceipt
            ? []
            : await uploadPendingSupportingDocs(uploadedFiles, 'WAREHOUSE');
          const uploadedPoSupportingDocs = isMultiPOReceipt
            ? await Promise.all(
                purchaseOrders.map(
                  async (purchaseOrder): Promise<[string, UploadFile[]]> => [
                    purchaseOrder.poNumber,
                    applyUploadedSupportingDocs(
                      poUploadedFiles[purchaseOrder.poNumber] || [],
                      await uploadPendingSupportingDocs(
                        poUploadedFiles[purchaseOrder.poNumber] || [],
                        'WAREHOUSE',
                      ),
                    ),
                  ],
                ),
              )
            : [];
          if (!isMultiPOReceipt) {
            setUploadedFiles((prev) => applyUploadedSupportingDocs(prev, supportingDocs));
          } else {
            setPoUploadedFiles((prev) =>
              uploadedPoSupportingDocs.reduce<Record<string, UploadFile[]>>((next, [poNumber, docs]) => {
                next[poNumber] = docs;
                return next;
              }, { ...prev }),
            );
          }
          const shouldClose = await onSubmit(
            buildGRData(
              correctionMode ? 'draft' : 'submit',
              supportingDocs,
              Object.fromEntries(uploadedPoSupportingDocs) as Record<string, UploadFile[]>,
            ),
          );
          if (shouldClose) {
            onClose();
          }
        } catch (error: any) {
          message.error(error?.message || 'Failed to prepare supporting documents.');
        } finally {
          setIsSubmitting(false);
        }
      },
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

  const openScanModal = (poNumber: string) => {
    setScanTargetPoNumber(poNumber);
    setScanModalOpen(true);
    setScannedValue(`PO-SCAN-${poNumber}`);
  };

  const closeScanModal = () => {
    setScanModalOpen(false);
    setScanTargetPoNumber(null);
    setScannedValue('');
  };

  const confirmScan = () => {
    if (!scanTargetPoNumber) {
      return;
    }

    const fallbackBarcode = `PO-SCAN-${scanTargetPoNumber}`;
    const barcodeValue = scannedValue.trim() || fallbackBarcode;
    const autoProductDate = dayjs(postingDate || undefined).format('YYYY-MM-DD');
    const autoExpiry = dayjs(autoProductDate || undefined)
      .add(12, 'month')
      .format('YYYY-MM-DD');

    let targetRowIndex = 0;
    setItems((prev) =>
      prev.map((item) => {
        if (item.poNumber !== scanTargetPoNumber || item.isMissing) {
          return item;
        }

        targetRowIndex += 1;
        const poScanPrefix = scanTargetPoNumber.replace(/[^A-Z0-9]/gi, '');
        const poSequence = String(targetRowIndex).padStart(2, '0');

        return {
          ...item,
          receiveQty: item.poQty,
          productDate: item.productDate || autoProductDate,
          expiryDate: item.expiryDate || autoExpiry,
          batchNumber: item.batchNumber || `${poScanPrefix}-${poSequence}`,
          barcode: item.barcode || `${barcodeValue}-${poSequence}`,
        };
      }),
    );
    setErrors((prev) => {
      const next = { ...prev };
      items.forEach((item, index) => {
        if (item.poNumber !== scanTargetPoNumber) {
          return;
        }
        delete next[`receiveQty-${index}`];
        delete next[`productDate-${index}`];
        delete next[`expiryDate-${index}`];
        delete next[`batchNumber-${index}`];
        delete next[`missingRemark-${index}`];
      });
      return next;
    });
    closeScanModal();
  };

  useEffect(() => {
    if (!open) return;
    if (initialReceipt) {
      setPostingDate(initialReceipt.postingDate || dayjs().format('YYYY-MM-DD'));
      setActualReceiptDate(initialReceipt.actualReceiptDate || dayjs().format('YYYY-MM-DD'));
      setDeliveryNoteNumber(initialReceipt.deliveryNoteNumber || '');
      setPoDeliveryNotes(buildInitialPoDeliveryNotes(purchaseOrders, initialReceipt));
      setItems(
        initialReceipt.items.map((item) => ({
          ...item,
          qcDecision: undefined,
          qcRemark: '',
        })),
      );
      setUploadedFiles(supportingDocsToUploadFiles(initialReceipt.documentChecklist.supportingDocs || []));
      setPoUploadedFiles(buildInitialPoUploadFiles(purchaseOrders, initialReceipt));
      setErrors({});
      setActiveItemPanels(purchaseOrders.map((purchaseOrder) => purchaseOrder.poNumber));
      closeScanModal();
      return;
    }

    setPostingDate(dayjs().format('YYYY-MM-DD'));
    setActualReceiptDate(dayjs().format('YYYY-MM-DD'));
    setDeliveryNoteNumber('');
    setPoDeliveryNotes(buildInitialPoDeliveryNotes(purchaseOrders));
    setItems(buildInitialItems(purchaseOrders));
    setUploadedFiles([]);
    setPoUploadedFiles(buildInitialPoUploadFiles(purchaseOrders));
    setErrors({});
    setActiveItemPanels(purchaseOrders.map((purchaseOrder) => purchaseOrder.poNumber));
    closeScanModal();
  }, [correctionMode, initialReceipt, open, purchaseOrders]);

  const groupedItems = purchaseOrders.map((purchaseOrder) => ({
    poNumber: purchaseOrder.poNumber,
    supplier: purchaseOrder.supplier,
    expectedDate: purchaseOrder.expectedDate,
    expectedTime: purchaseOrder.expectedTime,
    type: purchaseOrder.type,
    missingCount: items.filter((item) => item.poNumber === purchaseOrder.poNumber && item.isMissing)
      .length,
    shortCount: items.filter(
      (item) => item.poNumber === purchaseOrder.poNumber && !item.isMissing && item.receiveQty < item.poQty,
    ).length,
    rows: items
      .map((item, index) => ({
        ...item,
        index,
        key: `${item.poNumber}-${item.code}-${index}`,
      }))
      .filter((item) => item.poNumber === purchaseOrder.poNumber),
  }));
  const scanTargetPurchaseOrder =
    purchaseOrders.find((purchaseOrder) => purchaseOrder.poNumber === scanTargetPoNumber) || null;
  const scanTargetGroup =
    groupedItems.find((group) => group.poNumber === scanTargetPoNumber) || null;
  const missingItemsCount = items.filter((item) => item.isMissing).length;
  const shortItemsCount = items.filter((item) => !item.isMissing && item.receiveQty < item.poQty)
    .length;
  const hasDiscrepancy = missingItemsCount > 0 || shortItemsCount > 0;
  const hasMissingItems = items.some((item) => item.isMissing);
  const hasAvailableItems = items.some((item) => !item.isMissing);

  const itemColumns: ColumnsType<GRItem & { index: number }> = [
    {
      title: 'Item',
      dataIndex: 'code',
      key: 'code',
      width: 124,
      render: (_, record) => {
        const shortQty = Math.max(0, record.poQty - record.receiveQty);

        return (
          <div>
            <div style={{ fontWeight: 500 }}>{record.code}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
              {record.isMissing ? (
                <CloseCircleFilled style={{ color: '#ff4d4f', flex: 'none' }} />
              ) : shortQty > 0 ? (
                <WarningFilled style={{ color: '#faad14', flex: 'none' }} />
              ) : null}
              <div style={{ fontSize: 12, color: '#666' }}>{record.name}</div>
            </div>
          </div>
        );
      },
    },
    {
      title: 'PO Qty',
      dataIndex: 'poQty',
      key: 'poQty',
      width: 76,
      align: 'right',
      render: (value: number, record) => {
        const shortQty = Math.max(0, record.poQty - record.receiveQty);

        return (
          <div style={{ textAlign: 'right' }}>
            <span style={{ display: 'block' }}>{value.toLocaleString()}</span>
            {record.isMissing ? (
              <span style={{ display: 'block', fontSize: 11, color: '#cf1322' }}>Missing item</span>
            ) : shortQty > 0 ? (
              <span style={{ display: 'block', fontSize: 11, color: '#ad6800' }}>Short by {shortQty}</span>
            ) : null}
          </div>
        );
      },
    },
    {
      title: hasAvailableItems ? renderRequiredLabel('Receive Qty') : 'Receive Qty',
      key: 'receiveQty',
      width: 104,
      render: (_, record) => (
        <InputNumber
          min={0}
          max={record.poQty}
          value={record.receiveQty}
          onChange={(value) => updateItem(record.index, 'receiveQty', value ?? 0)}
          style={{ width: '100%' }}
          controls
          disabled={record.isMissing}
          status={errors[`receiveQty-${record.index}`] ? 'error' : undefined}
        />
      ),
    },
    { title: 'UoM', dataIndex: 'uom', key: 'uom', width: 48 },
    {
      title: hasAvailableItems ? renderRequiredLabel('Product Date') : 'Product Date',
      key: 'productDate',
      width: 132,
      render: (_, record) => (
        <DatePicker
          style={{ width: '100%' }}
          value={record.productDate ? dayjs(record.productDate) : null}
          onChange={(date) =>
            updateItem(record.index, 'productDate', date ? date.format('YYYY-MM-DD') : '')
          }
          disabledDate={(current) =>
            Boolean(record.expiryDate) && current.isAfter(dayjs(record.expiryDate), 'day')
          }
          disabled={record.isMissing}
          status={errors[`productDate-${record.index}`] ? 'error' : undefined}
        />
      ),
    },
    {
      title: hasAvailableItems ? renderRequiredLabel('Expiry') : 'Expiry',
      key: 'expiryDate',
      width: 132,
      render: (_, record) => (
        <DatePicker
          style={{ width: '100%' }}
          value={record.expiryDate ? dayjs(record.expiryDate) : null}
          onChange={(date) =>
            updateItem(record.index, 'expiryDate', date ? date.format('YYYY-MM-DD') : '')
          }
          disabledDate={(current) =>
            Boolean(record.productDate) && current.isBefore(dayjs(record.productDate), 'day')
          }
          disabled={record.isMissing}
          status={errors[`expiryDate-${record.index}`] ? 'error' : undefined}
        />
      ),
    },
    {
      title: hasAvailableItems ? renderRequiredLabel('Batch Number') : 'Batch Number',
      key: 'batchNumber',
      width: 136,
      render: (_, record) => (
        <Input
          value={record.batchNumber}
          onChange={(event) => updateItem(record.index, 'batchNumber', event.target.value)}
          disabled={record.isMissing}
          status={errors[`batchNumber-${record.index}`] ? 'error' : undefined}
          placeholder="Batch no."
        />
      ),
    },
    {
      title: hasAvailableItems ? renderRequiredLabel('Receipt Status') : 'Receipt Status',
      key: 'receiptStatus',
      width: 150,
      render: (_, record) => {
        const shortQty = Math.max(0, record.poQty - record.receiveQty);
        const hasShortQty = !record.isMissing && shortQty > 0;
        const receiptStatus = record.isMissing ? 'Missing' : 'Good';
        const isMissingStatus = receiptStatus === 'Missing';

        return (
          <Space direction="vertical" size={6} style={{ width: '100%' }}>
            <div
              style={{
                width: '100%',
                padding: 2,
                borderRadius: 8,
                backgroundColor: isMissingStatus ? '#fff1f0' : hasShortQty ? '#fffbe6' : '#f6ffed',
              }}
            >
              <Select
                value={receiptStatus}
                style={{ width: '100%' }}
                onChange={(value: 'Good' | 'Missing') => setReceiptStatus(record.index, value)}
                options={[
                  { value: 'Good', label: 'Good' },
                  { value: 'Missing', label: 'Missing' },
                ]}
              />
            </div>
          </Space>
        );
      },
    },
    {
      title: hasMissingItems ? renderRequiredLabel('Remark') : 'Remark',
      key: 'remark',
      width: 180,
      render: (_, record) => (
        <Input.TextArea
          autoSize={{ minRows: 1, maxRows: 3 }}
          placeholder={record.isMissing ? 'Add remark' : 'Remark not required for Good status'}
          value={record.missingRemark}
          onChange={(event) => updateItem(record.index, 'missingRemark', event.target.value)}
          disabled={!record.isMissing}
          status={errors[`missingRemark-${record.index}`] ? 'error' : undefined}
        />
      ),
    },
  ];

  const scanProgress = scannedValue.trim() ? 100 : 68;
  const scanStep = scannedValue.trim() ? 2 : 1;

  return (
    <>
      <FullscreenModal
        title={correctionMode ? 'Warehouse Recheck Inbound Receiving' : 'Create Inbound Receiving'}
        open={open}
        onCancel={onClose}
        footer={null}
        destroyOnClose
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 24px 0' }}>
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ marginBottom: 8 }}>Selected Purchase Orders</h4>
              <Table
                size="small"
                rowKey="poNumber"
                pagination={false}
                tableLayout="fixed"
                dataSource={purchaseOrders}
                columns={[
                  { title: 'PO Number', dataIndex: 'poNumber', key: 'poNumber', width: 140 },
                  {
                    title: 'Supplier',
                    dataIndex: 'supplier',
                    key: 'supplier',
                    width: 220,
                    ellipsis: true,
                  },
                  {
                    title: 'Expected Date',
                    key: 'expectedDate',
                    width: 170,
                    render: (_, record: PurchaseOrder) =>
                      record.expectedDate
                        ? `${record.expectedDate} ${record.expectedTime || ''}`.trim()
                        : 'Unplanned',
                  },
                  {
                    title: renderRequiredLabel('Posting Date'),
                    key: 'postingDate',
                    width: 150,
                    render: (_: unknown, __: PurchaseOrder, index: number) => ({
                      children:
                        index === 0 ? (
                          <DatePicker
                            value={postingDate ? dayjs(postingDate) : null}
                            onChange={(_, dateStr) => {
                              setPostingDate(dateStr as string);
                              setErrors((prev) => ({ ...prev, postingDate: false }));
                            }}
                            style={{ width: 128 }}
                            status={errors.postingDate ? 'error' : undefined}
                          />
                        ) : null,
                      props: {
                        rowSpan: index === 0 ? purchaseOrders.length : 0,
                      },
                    }),
                  },
                  { title: 'Items', dataIndex: 'totalItems', key: 'totalItems', width: 72 },
                  {
                    title: 'Total Qty',
                    dataIndex: 'totalQty',
                    key: 'totalQty',
                    width: 96,
                    render: (value: number) => value.toLocaleString(),
                  },
                ]}
              />
            </div>

          {!isMultiPOReceipt && (
            <Form layout="vertical" style={{ marginBottom: 6 }}>
              <Row gutter={24}>
                <Col span={6}>
                  <Form.Item
                    label="Delivery Note Number"
                    required
                    validateStatus={errors.deliveryNote ? 'error' : undefined}
                    help={errors.deliveryNote ? 'Required' : undefined}
                  >
                    <Input
                      placeholder="From truck paperwork"
                      size="middle"
                      style={{ minHeight: 38 }}
                      value={deliveryNoteNumber}
                      onChange={(event) => {
                        setDeliveryNoteNumber(event.target.value);
                        setErrors((prev) => ({ ...prev, deliveryNote: false }));
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={18}>
                  <Form.Item
                    label="Documents"
                    validateStatus={errors.supportingDocs ? 'error' : undefined}
                    help={errors.supportingDocs ? 'Remove failed files before continuing.' : undefined}
                    style={{ marginBottom: 8 }}
                  >
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '140px minmax(0, 1fr)',
                        gap: 12,
                        alignItems: 'start',
                      }}
                    >
                      <div>
                        <Upload
                          multiple
                          beforeUpload={stageSupportingDocBeforeUpload}
                          fileList={uploadedFiles}
                          showUploadList={false}
                          onChange={handleUploadChange}
                          onRemove={(file) => removeFile(file.uid)}
                          onPreview={(file) => void handlePreviewFile(file)}
                          accept=".pdf,.doc,.docx,image/*"
                          listType="text"
                        >
                          <Button icon={<InboxOutlined />} size="middle" style={{ width: '100%', height: 38 }}>
                            Upload Files
                          </Button>
                        </Upload>
                      </div>
                      <div>
                        <SupportingDocsList
                          files={uploadedFiles}
                          fallbackSource="WAREHOUSE"
                          onRemoveFile={removeFile}
                          displayMode="grid"
                          collapsedLimit={5}
                        />
                      </div>
                    </div>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          )}

          <div style={{ marginBottom: 14 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: 8,
              }}
            >
              <h4 style={{ margin: 0 }}>Item Receipt</h4>
            </div>
            <Collapse
              activeKey={activeItemPanels}
              destroyInactivePanel
              onChange={(keys) =>
                setActiveItemPanels(
                  Array.isArray(keys)
                    ? keys.map((key) => String(key))
                    : keys
                      ? [String(keys)]
                      : [],
                )
              }
              items={groupedItems.map((group) => ({
                key: group.poNumber,
                style: {
                  marginBottom: 16,
                  borderRadius: 12,
                  overflow: 'hidden',
                  background: '#fff',
                },
                label: (
                  <div
                    data-testid={`item-receipt-panel-header-${group.poNumber}`}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: 16,
                      width: '100%',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 11, color: '#8c8c8c', marginBottom: 4 }}>
                        Purchase Order
                      </div>
                      <Space size={8} wrap style={{ marginBottom: 2 }}>
                        <Text strong style={{ fontSize: 16 }}>
                          {group.poNumber}
                        </Text>
                        <Tag color={group.type === 'Planned' ? 'blue' : 'orange'}>
                          {group.type}
                        </Tag>
                      </Space>
                      <Text type="secondary" style={{ fontSize: 13 }}>
                        {group.supplier}
                      </Text>
                    </div>
                    <Space size={8} wrap style={{ justifyContent: 'flex-end' }}>
                      <Tag bordered={false} color="default" style={{ paddingInline: 10 }}>
                        {group.rows.length} item{group.rows.length !== 1 ? 's' : ''}
                      </Tag>
                      {group.missingCount > 0 && (
                        <Tag bordered={false} color="error" style={{ paddingInline: 10 }}>
                          {group.missingCount} missing
                        </Tag>
                      )}
                      {group.shortCount > 0 && (
                        <Tag bordered={false} color="warning" style={{ paddingInline: 10 }}>
                          {group.shortCount} short
                        </Tag>
                      )}
                      <Button
                        size="small"
                        icon={<QrcodeOutlined />}
                        data-testid={`scan-po-button-${group.poNumber}`}
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          openScanModal(group.poNumber);
                        }}
                      >
                        Scan PO Barcode
                      </Button>
                    </Space>
                  </div>
                ),
                children: (
                  <div data-testid={`item-receipt-panel-body-${group.poNumber}`}>
                    {isMultiPOReceipt && (
                      <Card
                        size="small"
                        bordered={false}
                        style={{ marginBottom: 16, background: '#fafafa' }}
                        bodyStyle={{ padding: 16 }}
                      >
                        <Row gutter={16}>
                          <Col span={8}>
                            <Form.Item
                              label="Delivery Note Number"
                              required
                              validateStatus={errors[`deliveryNote-${group.poNumber}`] ? 'error' : undefined}
                              help={errors[`deliveryNote-${group.poNumber}`] ? 'Required' : undefined}
                              style={{ marginBottom: 0 }}
                            >
                              <Input
                                placeholder={`DN for ${group.poNumber}`}
                                value={poDeliveryNotes[group.poNumber] || ''}
                                onChange={(event) => {
                                  const value = event.target.value;
                                  setPoDeliveryNotes((prev) => ({
                                    ...prev,
                                    [group.poNumber]: value,
                                  }));
                                  setErrors((prev) => ({
                                    ...prev,
                                    [`deliveryNote-${group.poNumber}`]: false,
                                  }));
                                }}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={16}>
                            <Form.Item
                              label="Documents"
                              validateStatus={errors[`supportingDocs-${group.poNumber}`] ? 'error' : undefined}
                              help={
                                errors[`supportingDocs-${group.poNumber}`]
                                  ? 'Remove failed files before continuing.'
                                  : undefined
                              }
                              style={{ marginBottom: 0 }}
                            >
                              <div
                                style={{
                                  display: 'grid',
                                  gridTemplateColumns: '140px minmax(0, 1fr)',
                                  gap: 12,
                                  alignItems: 'start',
                                }}
                              >
                                <div>
                                  <Upload
                                    multiple
                                    beforeUpload={stageSupportingDocBeforeUpload}
                                    fileList={poUploadedFiles[group.poNumber] || []}
                                    showUploadList={false}
                                    onChange={handlePoUploadChange(group.poNumber)}
                                    onRemove={(file) => removePoFile(group.poNumber, file.uid)}
                                    onPreview={(file) => void handlePreviewFile(file)}
                                    accept=".pdf,.doc,.docx,image/*"
                                    listType="text"
                                  >
                                    <Button
                                      icon={<InboxOutlined />}
                                      size="middle"
                                      style={{ width: '100%', height: 38 }}
                                    >
                                      Upload Files
                                    </Button>
                                  </Upload>
                                </div>
                                <div>
                                  <SupportingDocsList
                                    files={poUploadedFiles[group.poNumber] || []}
                                    fallbackSource="WAREHOUSE"
                                    onRemoveFile={(uid) => removePoFile(group.poNumber, uid)}
                                    displayMode="grid"
                                    collapsedLimit={5}
                                  />
        </div>
        <SupportingDocPreviewModal
          open={Boolean(previewState)}
          fileName={previewState?.fileName}
          previewUrl={previewState?.url}
          revokeOnClose={previewState?.revokeOnClose}
          onClose={() => setPreviewState(null)}
        />
      </div>
                            </Form.Item>
                          </Col>
                        </Row>
                      </Card>
                    )}
                    <Table
                      size="small"
                      columns={itemColumns}
                      dataSource={group.rows}
                      pagination={false}
                      scroll={{ x: 1420 }}
                      tableLayout="auto"
                    />
                  </div>
                ),
              }))}
            />
          </div>

          </div>

          <div
            style={{
              textAlign: 'right',
              borderTop: '1px solid #f0f0f0',
              padding: '16px 24px',
              background: '#fff',
            }}
          >
            <Space>
              <Button onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button onClick={handleSaveDraft} loading={isSubmitting}>
                {correctionMode ? 'Save Correction' : 'Save Draft'}
              </Button>
              {!correctionMode && (
                <Button
                  type="primary"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  loading={isSubmitting}
                >
                  {hasDiscrepancy ? 'Submit Exception' : 'Submit for QC'}
                </Button>
              )}
            </Space>
          </div>
        </div>
      </FullscreenModal>

      <Modal
        open={scanModalOpen}
        onCancel={closeScanModal}
        footer={null}
        width={460}
        centered
        destroyOnClose
        title={
          <Space>
            <MobileOutlined />
            <span>Receipt Barcode Scanner</span>
          </Space>
        }
      >
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <Card
            size="small"
            title={
              <Space>
                <CameraOutlined />
                <span>Live Camera Preview</span>
              </Space>
            }
            extra={<Tag color="processing">Rear Camera</Tag>}
            bodyStyle={{ padding: 12 }}
          >
            <div
              style={{
                height: 280,
                borderRadius: 12,
                position: 'relative',
                overflow: 'hidden',
                background: 'linear-gradient(180deg, #1f2937 0%, #111827 100%)',
                border: '1px solid #d9d9d9',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'repeating-linear-gradient(90deg, rgba(255,255,255,0.02), rgba(255,255,255,0.02) 4px, transparent 4px, transparent 14px)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: 38,
                  right: 38,
                  top: 52,
                  bottom: 52,
                  border: '2px solid rgba(255,255,255,0.85)',
                  borderRadius: 16,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: 56,
                  right: 56,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  height: 3,
                  background: '#52c41a',
                  boxShadow: '0 0 10px rgba(82,196,26,0.75)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: 16,
                  left: 16,
                  right: 16,
                  display: 'flex',
                  justifyContent: 'space-between',
                  color: 'rgba(255,255,255,0.85)',
                  fontSize: 12,
                }}
              >
                <span>{scanTargetPurchaseOrder?.poNumber || '-'}</span>
                <span>{scanTargetGroup?.rows.length || 0} item rows</span>
              </div>
              <div
                style={{
                  position: 'absolute',
                  left: 16,
                  right: 16,
                  bottom: 16,
                  color: 'rgba(255,255,255,0.85)',
                  fontSize: 12,
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span>Align PO barcode inside frame</span>
                <span>{scanProgress}% match</span>
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <Progress percent={scanProgress} status="active" showInfo={false} />
            </div>
          </Card>

          <Steps
            size="small"
            current={scanStep}
            items={[
              { title: 'Detect' },
              { title: 'Decode' },
              { title: 'Fill Items' },
            ]}
          />

          <Card size="small" title="Decoded PO Data">
            <Descriptions size="small" column={2}>
              <Descriptions.Item label="PO Reference">
                {scanTargetPurchaseOrder?.poNumber || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Supplier">
                {scanTargetPurchaseOrder?.supplier || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Receipt Type">
                {scanTargetPurchaseOrder?.type || receiptType}
              </Descriptions.Item>
              <Descriptions.Item label="Item Count">
                {scanTargetGroup?.rows.length || 0}
              </Descriptions.Item>
            </Descriptions>
            <Divider style={{ margin: '12px 0' }} />
            <Form layout="vertical">
              <Form.Item label="Scanned Barcode">
                <Input
                  value={scannedValue}
                  onChange={(event) => setScannedValue(event.target.value)}
                  prefix={<QrcodeOutlined />}
                  placeholder={
                    scanTargetPurchaseOrder
                      ? `Scan result for ${scanTargetPurchaseOrder.poNumber}`
                      : 'Scan result for the PO barcode'
                  }
                />
              </Form.Item>
            </Form>
          </Card>

          <Alert
            type="info"
            showIcon
            message="Confirming the scan will fill quantities, product dates, expiry dates, batch numbers, and barcode values for this PO's non-missing rows."
          />

          <Space direction="vertical" style={{ width: '100%' }}>
            <Button type="primary" block icon={<QrcodeOutlined />} onClick={confirmScan}>
              Confirm PO Scan
            </Button>
            <Button block onClick={closeScanModal}>
              Cancel
            </Button>
          </Space>
        </Space>
      </Modal>
    </>
  );
}
