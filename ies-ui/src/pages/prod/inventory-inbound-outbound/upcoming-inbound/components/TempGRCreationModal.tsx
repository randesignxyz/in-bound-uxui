import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Col,
  DatePicker,
  Descriptions,
  Form,
  Input,
  InputNumber,
  Row,
  Space,
  Table,
  Tag,
  Typography,
  Upload,
  message,
} from 'antd';
import type { UploadFile, UploadProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { CloseCircleFilled, DeleteOutlined, InboxOutlined, PlusOutlined, WarningFilled } from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  buildReceiptExceptionReason,
  goodsReceiptSourceLabel,
  hasReceiptDiscrepancy,
} from '../workflow';
import type { GRItem } from '../workflow';
import type { UpcomingInboundGoodsReceipt } from '../data';
import {
  applyUploadedSupportingDocs,
  hasIncompleteAppFilesUpload,
  normalizeUploadFileList,
  previewSupportingUploadFile,
  stageSupportingDocBeforeUpload,
  supportingDocsToUploadFiles,
  uploadPendingSupportingDocs,
  uploadFilesToSupportingDocs,
} from '../supportingDocs';
import { FullscreenModal } from './FullscreenModal';
import { SupportingDocsList } from './SupportingDocsList';

const { Text } = Typography;

interface TempGRCreationModalProps {
  open: boolean;
  onClose: () => void;
  onSaveDraft: (data: Record<string, unknown>) => Promise<boolean> | boolean;
  onSubmit: (data: Record<string, unknown>) => Promise<boolean> | boolean;
  initialMissingPOHint?: string;
  initialReceipt?: UpcomingInboundGoodsReceipt | null;
  correctionMode?: boolean;
}

const receiverWarehouseName = 'warehouse.staff01';

function buildEmptyItem(): GRItem {
  return {
    code: '',
    name: '',
    poNumber: '',
    supplier: '',
    poQty: 0,
    receiveQty: 0,
    uom: '',
    productDate: '',
    expiryDate: '',
    batchNumber: '',
    barcode: '',
    isMissing: false,
    missingRemark: '',
  };
}

export function TempGRCreationModal({
  open,
  onClose,
  onSaveDraft,
  onSubmit,
  initialMissingPOHint,
  initialReceipt,
  correctionMode = false,
}: TempGRCreationModalProps) {
  const [postingDate, setPostingDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [actualReceiptDate, setActualReceiptDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [supplier, setSupplier] = useState('');
  const [deliveryNoteNumber, setDeliveryNoteNumber] = useState('');
  const [pendingPOReason, setPendingPOReason] = useState('');
  const [items, setItems] = useState<GRItem[]>([buildEmptyItem()]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadFile[]>([]);
  const [storedOnHoldConfirmed, setStoredOnHoldConfirmed] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (initialReceipt) {
      setPostingDate(initialReceipt.postingDate || dayjs().format('YYYY-MM-DD'));
      setActualReceiptDate(initialReceipt.actualReceiptDate || dayjs().format('YYYY-MM-DD'));
      setSupplier(initialReceipt.supplier || '');
      setDeliveryNoteNumber(initialReceipt.deliveryNoteNumber || '');
      setPendingPOReason(initialReceipt.pendingPOReason || initialMissingPOHint || '');
      setItems(
        initialReceipt.items.map((item) => ({
          ...item,
          qcDecision: undefined,
          qcRemark: '',
        })),
      );
      setUploadedFiles(supportingDocsToUploadFiles(initialReceipt.documentChecklist.supportingDocs || []));
      setStoredOnHoldConfirmed(true);
      setErrors({});
      return;
    }
    setPostingDate(dayjs().format('YYYY-MM-DD'));
    setActualReceiptDate(dayjs().format('YYYY-MM-DD'));
    setSupplier('');
    setDeliveryNoteNumber('');
    setPendingPOReason(initialMissingPOHint || '');
    setItems([buildEmptyItem()]);
    setUploadedFiles([]);
    setStoredOnHoldConfirmed(false);
    setErrors({});
  }, [initialMissingPOHint, initialReceipt, open]);

  const updateItem = useCallback((index: number, field: keyof GRItem, value: unknown) => {
    setItems((prev) =>
      prev.map((item, itemIndex) => {
        if (itemIndex !== index) return item;

        if (field === 'poQty' || field === 'receiveQty') {
          const nextValue = Math.max(0, Number(value) || 0);
          if (field === 'receiveQty' && nextValue > 0 && item.isMissing) {
            return { ...item, receiveQty: nextValue, isMissing: false, missingRemark: '' };
          }
          return { ...item, [field]: nextValue } as GRItem;
        }

        return { ...item, [field]: value } as GRItem;
      }),
    );

    setErrors((prev) => ({
      ...prev,
      [`${String(field)}-${index}`]: false,
      [`duplicate-${index}`]: false,
    }));
  }, []);

  const toggleMissingItem = useCallback((index: number) => {
    setItems((prev) =>
      prev.map((item, itemIndex) => {
        if (itemIndex !== index) return item;
        if (item.isMissing) {
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

  const addItemRow = () => setItems((prev) => [...prev, buildEmptyItem()]);

  const removeItemRow = (index: number) => {
    setItems((prev) => (prev.length === 1 ? prev : prev.filter((_, itemIndex) => itemIndex !== index)));
    setErrors((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((key) => {
        if (key.endsWith(`-${index}`)) delete next[key];
      });
      return next;
    });
  };

  const handleUploadChange: UploadProps['onChange'] = (info) => {
    setUploadedFiles(normalizeUploadFileList(info.fileList, 10, 'WAREHOUSE'));
  };

  const removeFile = (uid: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.uid !== uid));
  };

  const validate = () => {
    const nextErrors: Record<string, boolean> = {};
    if (!supplier.trim()) nextErrors.supplier = true;
    if (!deliveryNoteNumber.trim()) nextErrors.deliveryNote = true;
    if (!pendingPOReason.trim()) nextErrors.pendingPOReason = true;
    if (!storedOnHoldConfirmed) nextErrors.onHoldConfirm = true;

    const itemCodes = new Set<string>();

    items.forEach((item, index) => {
      if (!item.code) nextErrors[`code-${index}`] = true;
      if (!item.name.trim()) nextErrors[`name-${index}`] = true;
      if (!item.uom.trim()) nextErrors[`uom-${index}`] = true;
      if (item.code) {
        if (itemCodes.has(item.code)) {
          nextErrors[`duplicate-${index}`] = true;
        } else {
          itemCodes.add(item.code);
        }
      }

      if (item.poQty <= 0) nextErrors[`poQty-${index}`] = true;

      if (item.isMissing) {
        if (!item.missingRemark?.trim()) nextErrors[`missingRemark-${index}`] = true;
        return;
      }

      if (item.receiveQty <= 0) nextErrors[`receiveQty-${index}`] = true;
      if (!item.productDate) nextErrors[`productDate-${index}`] = true;
      if (!item.expiryDate) nextErrors[`expiryDate-${index}`] = true;
      if (!item.batchNumber.trim()) nextErrors[`batchNumber-${index}`] = true;
    });

    if (hasIncompleteAppFilesUpload(uploadedFiles)) {
      nextErrors.supportingDocs = true;
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const buildPayload = (
    submissionMode: 'draft' | 'submit',
    supportingDocs = uploadFilesToSupportingDocs(uploadedFiles, 'WAREHOUSE'),
  ) => {
    const normalizedItems = items.map((item) => ({
      ...item,
      supplier: supplier.trim(),
    }));
    const hasDiscrepancy = hasReceiptDiscrepancy(normalizedItems);
    const supplierNames = initialReceipt?.supplierNames ?? [];

    return {
      id: initialReceipt?.id,
      grNumber: initialReceipt?.grNumber,
      receivingNumber: initialReceipt?.receivingNumber || initialReceipt?.grNumber,
      poNumber: '',
      supplier: supplier.trim(),
      poReferences: initialReceipt?.poReferences || [],
      supplierNames: supplierNames.length > 0 ? supplierNames : [supplier.trim()],
      receiptType: 'Unplanned',
      receiptSourceType: initialReceipt?.receiptSourceType || 'TEMP_NO_PO',
      poLinkStatus: initialReceipt?.poLinkStatus || 'WAITING_PO',
      linkedPoNumber: initialReceipt?.linkedPoNumber,
      tempReferenceNo: initialReceipt?.tempReferenceNo,
      expectedDate: '',
      expectedTime: '',
      postingDate,
      actualReceiptDate,
      deliveryNoteNumber,
      receiverWarehouseName,
      items: normalizedItems,
      uploadedFiles: supportingDocs,
      specMatch: true,
      qtyMatch: !hasDiscrepancy,
      qualityCheckRequired: true,
      qcResult: 'Pending',
      exceptionReason: buildReceiptExceptionReason(normalizedItems),
      processState:
        correctionMode || submissionMode === 'draft'
          ? 'GRPO_DRAFT'
          : hasDiscrepancy
            ? 'MISMATCH_EXCEPTION'
            : 'QC_PENDING',
      documentChecklist: {
        vendorDN: deliveryNoteNumber.trim().length > 0,
        goodsReceiptPOForm: true,
        pmrmStockCardForm: false,
        supportingDocs,
      },
      storedOnHoldConfirmed,
      pendingPOReason: pendingPOReason.trim(),
    };
  };

  const handleSaveDraft = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const supportingDocs = await uploadPendingSupportingDocs(uploadedFiles, 'WAREHOUSE');
      setUploadedFiles((prev) => applyUploadedSupportingDocs(prev, supportingDocs));
      const shouldClose = await onSaveDraft(buildPayload('draft', supportingDocs));
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
    setIsSubmitting(true);
    try {
      const supportingDocs = await uploadPendingSupportingDocs(uploadedFiles, 'WAREHOUSE');
      setUploadedFiles((prev) => applyUploadedSupportingDocs(prev, supportingDocs));
      const shouldClose = await onSubmit(buildPayload(correctionMode ? 'draft' : 'submit', supportingDocs));
      if (shouldClose) {
        onClose();
      }
    } catch (error: any) {
      message.error(error?.message || 'Failed to prepare supporting documents.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const missingItemsCount = items.filter((item) => item.isMissing).length;
  const shortItemsCount = items.filter((item) => !item.isMissing && item.poQty > item.receiveQty).length;
  const hasDiscrepancy = missingItemsCount > 0 || shortItemsCount > 0;

  const itemColumns: ColumnsType<GRItem & { index: number }> = useMemo(
    () => [
      {
        title: 'Item',
        key: 'item',
        width: 280,
        render: (_, record) => {
          const shortQty = Math.max(0, record.poQty - record.receiveQty);

          return (
            <Space direction="vertical" size={6} style={{ width: '100%' }}>
              <Input
                placeholder="Item code"
                value={record.code}
                onChange={(event) => updateItem(record.index, 'code', event.target.value.toUpperCase())}
                status={
                  errors[`code-${record.index}`] || errors[`duplicate-${record.index}`]
                    ? 'error'
                    : undefined
                }
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
                {record.isMissing ? (
                  <CloseCircleFilled style={{ color: '#ff4d4f', flex: 'none' }} />
                ) : shortQty > 0 ? (
                  <WarningFilled style={{ color: '#faad14', flex: 'none' }} />
                ) : null}
                <Input
                  placeholder="Item name"
                  value={record.name}
                  onChange={(event) => updateItem(record.index, 'name', event.target.value)}
                  status={errors[`name-${record.index}`] ? 'error' : undefined}
                  style={{ flex: 1 }}
                />
              </div>
            </Space>
          );
        },
      },
      {
        title: 'Doc Qty',
        key: 'poQty',
        width: 92,
        render: (_, record) => {
          const shortQty = Math.max(0, record.poQty - record.receiveQty);

          return (
            <Space direction="vertical" size={4} style={{ width: '100%' }}>
              <InputNumber
                min={0}
                value={record.poQty}
                onChange={(value) => updateItem(record.index, 'poQty', value ?? 0)}
                status={errors[`poQty-${record.index}`] ? 'error' : undefined}
                style={{ width: '100%' }}
              />
              {record.isMissing ? (
                <Text style={{ fontSize: 11, color: '#cf1322' }}>Missing item</Text>
              ) : shortQty > 0 ? (
                <Text style={{ fontSize: 11, color: '#ad6800' }}>Short by {shortQty}</Text>
              ) : null}
            </Space>
          );
        },
      },
      {
        title: 'Received',
        key: 'receiveQty',
        width: 92,
        render: (_, record) => (
          <InputNumber
            min={0}
            value={record.receiveQty}
            onChange={(value) => updateItem(record.index, 'receiveQty', value ?? 0)}
            status={errors[`receiveQty-${record.index}`] ? 'error' : undefined}
            style={{ width: '100%' }}
            disabled={record.isMissing}
          />
        ),
      },
      {
        title: 'UoM',
        key: 'uom',
        width: 96,
        render: (_, record) => (
          <Input
            value={record.uom}
            onChange={(event) => updateItem(record.index, 'uom', event.target.value.toUpperCase())}
            status={errors[`uom-${record.index}`] ? 'error' : undefined}
            placeholder="UoM"
          />
        ),
      },
      {
        title: 'Product Date',
        key: 'productDate',
        width: 132,
        render: (_, record) => (
          <DatePicker
            style={{ width: '100%' }}
            value={record.productDate ? dayjs(record.productDate) : null}
            onChange={(date) =>
              updateItem(record.index, 'productDate', date ? date.format('YYYY-MM-DD') : '')
            }
            status={errors[`productDate-${record.index}`] ? 'error' : undefined}
            disabled={record.isMissing}
          />
        ),
      },
      {
        title: 'Expiry',
        key: 'expiryDate',
        width: 132,
        render: (_, record) => (
          <DatePicker
            style={{ width: '100%' }}
            value={record.expiryDate ? dayjs(record.expiryDate) : null}
            onChange={(date) =>
              updateItem(record.index, 'expiryDate', date ? date.format('YYYY-MM-DD') : '')
            }
            status={errors[`expiryDate-${record.index}`] ? 'error' : undefined}
            disabled={record.isMissing}
          />
        ),
      },
      {
        title: 'Batch',
        key: 'batchNumber',
        width: 140,
        render: (_, record) => (
          <Input
            value={record.batchNumber}
            onChange={(event) => updateItem(record.index, 'batchNumber', event.target.value)}
            status={errors[`batchNumber-${record.index}`] ? 'error' : undefined}
            disabled={record.isMissing}
            placeholder="Batch"
          />
        ),
      },
      {
        title: 'Status',
        key: 'status',
        width: 170,
        render: (_, record) => {
          const shortQty = Math.max(0, record.poQty - record.receiveQty);
          return (
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
              <Space wrap>
                <Tag color={record.isMissing ? 'error' : shortQty > 0 ? 'warning' : 'success'}>
                  {record.isMissing ? 'Missing' : shortQty > 0 ? 'Short' : 'OK'}
                </Tag>
                <Button
                  size="small"
                  type={record.isMissing ? 'default' : 'dashed'}
                  danger={!record.isMissing}
                  onClick={() => toggleMissingItem(record.index)}
                >
                  {record.isMissing ? 'Undo' : 'Missing'}
                </Button>
              </Space>
              {record.isMissing ? (
                <Input.TextArea
                  autoSize={{ minRows: 1, maxRows: 3 }}
                  placeholder="Remark"
                  value={record.missingRemark}
                  onChange={(event) => updateItem(record.index, 'missingRemark', event.target.value)}
                  status={errors[`missingRemark-${record.index}`] ? 'error' : undefined}
                />
              ) : shortQty > 0 ? (
                <Text type="secondary">Received less than document qty.</Text>
              ) : (
                <Text type="secondary">Quantity matches document.</Text>
              )}
            </Space>
          );
        },
      },
      {
        title: '',
        key: 'action',
        width: 60,
        render: (_, record) => (
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            disabled={items.length === 1}
            onClick={() => removeItemRow(record.index)}
          />
        ),
      },
    ],
    [errors, items.length, toggleMissingItem, updateItem],
  );

  return (
    <FullscreenModal
      title={correctionMode ? 'Warehouse Recheck Temporary Inbound Receiving' : 'Create Temporary Inbound Receiving'}
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px 0' }}>
          <Descriptions column={4} size="small" style={{ marginBottom: 10 }}>
          <Descriptions.Item label="Source">
            <Tag color="purple">{goodsReceiptSourceLabel.TEMP_NO_PO}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Receipt Type">
            <Tag color="orange">Unplanned</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="PO Link">
            <Tag color="warning">Waiting PO</Tag>
          </Descriptions.Item>
        </Descriptions>

        <Alert
          showIcon
          type="info"
          style={{ marginBottom: 10 }}
          message={correctionMode ? 'Warehouse Correction Required' : 'Temporary Inbound Receiving'}
          description={
            correctionMode
              ? 'Warehouse must recheck the returned receipt, update item quantity and details, save the correction, and then submit it to QC again.'
              : 'Use this when goods arrive before the SAP PO exists. QC and approval can continue, but SAP PO linking is still required later.'
          }
        />

        <Form layout="vertical" style={{ marginBottom: 10 }}>
          <Row gutter={24}>
            <Col span={8}>
              <Form.Item
                label="Supplier"
                required
                validateStatus={errors.supplier ? 'error' : undefined}
                help={errors.supplier ? 'Required' : undefined}
              >
                <Input value={supplier} onChange={(event) => setSupplier(event.target.value)} placeholder="Supplier name" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Posting Date" required>
                <DatePicker
                  style={{ width: '100%' }}
                  value={postingDate ? dayjs(postingDate) : null}
                  onChange={(_, dateStr) => setPostingDate(dateStr as string)}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={8}>
              <Form.Item
                label="Delivery Note Number"
                required
                validateStatus={errors.deliveryNote ? 'error' : undefined}
                help={errors.deliveryNote ? 'Required' : undefined}
              >
                <Input
                  value={deliveryNoteNumber}
                  onChange={(event) => setDeliveryNoteNumber(event.target.value)}
                  placeholder="From vendor paperwork"
                />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item
                label="Why SAP PO Is Missing"
                required
                validateStatus={errors.pendingPOReason ? 'error' : undefined}
                help={errors.pendingPOReason ? 'Required' : undefined}
              >
                <Input
                  value={pendingPOReason}
                  onChange={(event) => setPendingPOReason(event.target.value)}
                  placeholder="Explain why procurement has not created the SAP PO yet"
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>

        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <h4 style={{ margin: 0 }}>Item Receipt</h4>
            <Button icon={<PlusOutlined />} onClick={addItemRow}>
              Add Item
            </Button>
          </div>
          <Card size="small" style={{ borderRadius: 12 }}>
            <Table
              size="small"
              columns={itemColumns}
              dataSource={items.map((item, index) => ({ ...item, index, key: `${item.code || 'row'}-${index}` }))}
              pagination={false}
              scroll={{ x: 1360 }}
            />
          </Card>
        </div>

        <div style={{ marginBottom: 24 }}>
          <h4 style={{ marginBottom: 12 }}>Documents</h4>
          <Form.Item
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
                  onRemove={(file) => {
                    removeFile(file.uid);
                    return true;
                  }}
                  onPreview={(file) => previewSupportingUploadFile(file)}
                  accept=".pdf,.doc,.docx,image/*"
                  listType="text"
                >
                  <Button icon={<InboxOutlined />} size="large" style={{ width: '100%', height: 44 }}>
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
        </div>

          <Form.Item
            validateStatus={errors.onHoldConfirm ? 'error' : undefined}
            help={errors.onHoldConfirm ? 'Required' : undefined}
          >
            <Checkbox checked={storedOnHoldConfirmed} onChange={(event) => setStoredOnHoldConfirmed(event.target.checked)}>
              I confirm received PM/RM is stored in On-Hold Warehouse before QC pass.
            </Checkbox>
          </Form.Item>
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
              <Button type="primary" onClick={handleSubmit} disabled={isSubmitting} loading={isSubmitting}>
                {hasDiscrepancy ? 'Submit Exception' : 'Submit for QC'}
              </Button>
            )}
          </Space>
        </div>
      </div>
    </FullscreenModal>
  );
}
