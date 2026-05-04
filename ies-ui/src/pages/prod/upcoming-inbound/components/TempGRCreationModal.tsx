import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Descriptions,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Upload,
  message,
} from 'antd';
import type { UploadFile, UploadProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { DeleteOutlined, InboxOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  buildReceiptExceptionReason,
  goodsReceiptSourceLabel,
  hasReceiptDiscrepancy,
} from '../workflow';
import type { GRItem } from '../workflow';
import type { InboundSupplierMasterApi, InboundUomMasterApi, UpcomingInboundGoodsReceipt } from '../data';
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

interface TempGRCreationModalProps {
  open: boolean;
  onClose: () => void;
  onSaveDraft: (data: Record<string, unknown>) => Promise<boolean> | boolean;
  onSubmit: (data: Record<string, unknown>) => Promise<boolean> | boolean;
  initialReceipt?: UpcomingInboundGoodsReceipt | null;
  correctionMode?: boolean;
  availableBusinessUnits?: string[];
  supplierOptions?: InboundSupplierMasterApi[];
  uomOptions?: InboundUomMasterApi[];
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

function hasInvalidDateOrder(productDate?: string, expiryDate?: string) {
  if (!productDate || !expiryDate) return false;

  return dayjs(productDate).isAfter(dayjs(expiryDate), 'day');
}

export function TempGRCreationModal({
  open,
  onClose,
  onSaveDraft,
  onSubmit,
  initialReceipt,
  correctionMode = false,
  availableBusinessUnits = [],
  supplierOptions = [],
  uomOptions = [],
}: TempGRCreationModalProps) {
  const [postingDate, setPostingDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [actualReceiptDate, setActualReceiptDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [supplier, setSupplier] = useState('');
  const [businessUnit, setBusinessUnit] = useState('');
  const [deliveryNoteNumber, setDeliveryNoteNumber] = useState('');
  const [items, setItems] = useState<GRItem[]>([buildEmptyItem()]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadFile[]>([]);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewState, setPreviewState] = useState<{
    fileName?: string;
    url?: string;
    revokeOnClose?: boolean;
  } | null>(null);

  useEffect(() => {
    if (!open) return;
    if (initialReceipt) {
      setPostingDate(initialReceipt.postingDate || dayjs().format('YYYY-MM-DD'));
      setActualReceiptDate(initialReceipt.actualReceiptDate || dayjs().format('YYYY-MM-DD'));
      setBusinessUnit(initialReceipt.businessUnit || availableBusinessUnits[0] || '');
      setSupplier(initialReceipt.supplier || '');
      setDeliveryNoteNumber(initialReceipt.deliveryNoteNumber || '');
      setItems(
        initialReceipt.items.map((item) => ({
          ...item,
          qcDecision: undefined,
          qcRemark: '',
        })),
      );
      setUploadedFiles(supportingDocsToUploadFiles(initialReceipt.documentChecklist.supportingDocs || []));
      setErrors({});
      return;
    }
    setPostingDate(dayjs().format('YYYY-MM-DD'));
    setActualReceiptDate(dayjs().format('YYYY-MM-DD'));
    setBusinessUnit(availableBusinessUnits.length === 1 ? availableBusinessUnits[0] : '');
    setSupplier('');
    setDeliveryNoteNumber('');
    setItems([buildEmptyItem()]);
    setUploadedFiles([]);
    setErrors({});
  }, [availableBusinessUnits, initialReceipt, open]);

  const visibleSupplierOptions = useMemo(
    () =>
      supplierOptions
        .filter((option) => !businessUnit || !option.business_unit || option.business_unit === businessUnit)
        .map((option) => ({
          label: `${option.supplier_name} (${option.supplier_code})`,
          value: option.supplier_name,
        })),
    [businessUnit, supplierOptions],
  );

  const visibleUomOptions = useMemo(
    () =>
      uomOptions.map((option) => ({
        label: `${option.uom_code} - ${option.uom_name}`,
        value: option.uom_code,
      })),
    [uomOptions],
  );

  const updateItem = useCallback((index: number, field: keyof GRItem, value: unknown) => {
    setItems((prev) =>
      prev.map((item, itemIndex) => {
        if (itemIndex !== index) return item;

        if (field === 'poQty' || field === 'receiveQty') {
          const nextValue = Math.max(0, Number(value) || 0);
          return { ...item, [field]: nextValue } as GRItem;
        }

        return { ...item, [field]: value } as GRItem;
      }),
    );

    setErrors((prev) => {
      const nextErrors = {
        ...prev,
        [`${String(field)}-${index}`]: false,
        [`duplicate-${index}`]: false,
      };

      if (field === 'productDate' || field === 'expiryDate') {
        delete nextErrors[`productDate-${index}`];
        delete nextErrors[`expiryDate-${index}`];
      }

      return nextErrors;
    });
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
    if (availableBusinessUnits.length > 1 && !businessUnit.trim()) nextErrors.businessUnit = true;
    if (!deliveryNoteNumber.trim()) nextErrors.deliveryNote = true;

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

      if (item.receiveQty <= 0) nextErrors[`receiveQty-${index}`] = true;
      if (!item.productDate) nextErrors[`productDate-${index}`] = true;
      if (!item.expiryDate) nextErrors[`expiryDate-${index}`] = true;
      if (hasInvalidDateOrder(item.productDate, item.expiryDate)) {
        nextErrors[`productDate-${index}`] = true;
        nextErrors[`expiryDate-${index}`] = true;
      }
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
      businessUnit: businessUnit.trim(),
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
    const currentHasDiscrepancy = items.some((item) => item.poQty > item.receiveQty);
    Modal.confirm({
      title: currentHasDiscrepancy ? 'Submit inbound exception?' : 'Submit to QC?',
      content: currentHasDiscrepancy
        ? 'This receipt has discrepancies and will be submitted with exception details.'
        : 'This will submit the inbound receiving to QC for review.',
      okText: 'Confirm',
      cancelText: 'Cancel',
      onOk: async () => {
        setIsSubmitting(true);
        try {
          const supportingDocs = await uploadPendingSupportingDocs(uploadedFiles, 'WAREHOUSE');
          setUploadedFiles((prev) => applyUploadedSupportingDocs(prev, supportingDocs));
          const shouldClose = await onSubmit(
            buildPayload(correctionMode ? 'draft' : 'submit', supportingDocs),
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

  const hasDiscrepancy = items.some((item) => item.poQty > item.receiveQty);

  const itemColumns: ColumnsType<GRItem & { index: number }> = useMemo(
    () => [
      {
        title: 'Item',
        key: 'item',
        width: 240,
        render: (_, record) => (
          <div
            data-testid={`temp-gr-item-identity-${record.index}`}
            style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}
          >
            <Input
              placeholder="Item code"
              value={record.code}
              onChange={(event) => updateItem(record.index, 'code', event.target.value)}
              status={
                errors[`code-${record.index}`] || errors[`duplicate-${record.index}`]
                  ? 'error'
                  : undefined
              }
              style={{ width: 120, flex: '0 0 120px' }}
            />
            <Input
              placeholder="Item name"
              value={record.name}
              onChange={(event) => updateItem(record.index, 'name', event.target.value)}
              status={errors[`name-${record.index}`] ? 'error' : undefined}
              style={{ flex: 1, minWidth: 0 }}
            />
          </div>
        ),
      },
      {
        title: 'Qty',
        key: 'poQty',
        width: 92,
        render: (_, record) => (
          <InputNumber
            min={0}
            value={record.poQty}
            onChange={(value) => updateItem(record.index, 'poQty', value ?? 0)}
            status={errors[`poQty-${record.index}`] ? 'error' : undefined}
            style={{ width: '100%' }}
          />
        ),
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
          />
        ),
      },
      {
        title: 'UoM',
        key: 'uom',
        width: 96,
        render: (_, record) => (
          <Select
            showSearch
            value={record.uom || undefined}
            onChange={(value) => updateItem(record.index, 'uom', value)}
            status={errors[`uom-${record.index}`] ? 'error' : undefined}
            placeholder="UoM"
            options={visibleUomOptions}
            optionFilterProp="label"
            notFoundContent="No UOM master data"
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
            disabledDate={(current) =>
              Boolean(record.expiryDate) && current.isAfter(dayjs(record.expiryDate), 'day')
            }
            status={errors[`productDate-${record.index}`] ? 'error' : undefined}
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
            disabledDate={(current) =>
              Boolean(record.productDate) && current.isBefore(dayjs(record.productDate), 'day')
            }
            status={errors[`expiryDate-${record.index}`] ? 'error' : undefined}
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
            placeholder="Batch"
          />
        ),
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
    [errors, items.length, updateItem, visibleUomOptions],
  );

  return (
    <FullscreenModal
      title={correctionMode ? 'Warehouse Recheck Temporary Inbound Receiving' : 'Receive without PO'}
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

          <Form layout="vertical" style={{ marginBottom: 10 }}>
            <Row gutter={24}>
              <Col span={8}>
                <Form.Item
                  label="Business Unit"
                  required={availableBusinessUnits.length > 1}
                  validateStatus={errors.businessUnit ? 'error' : undefined}
                  help={errors.businessUnit ? 'Required' : undefined}
                >
                  <Select
                    value={businessUnit || undefined}
                    onChange={setBusinessUnit}
                    disabled={availableBusinessUnits.length <= 1 || correctionMode}
                    placeholder="Select BU"
                    options={availableBusinessUnits.map((value) => ({ label: value, value }))}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="Supplier"
                  required
                  validateStatus={errors.supplier ? 'error' : undefined}
                  help={errors.supplier ? 'Required' : undefined}
                >
                  <Select
                    showSearch
                    value={supplier || undefined}
                    onChange={setSupplier}
                    placeholder="Supplier name"
                    options={visibleSupplierOptions}
                    optionFilterProp="label"
                    notFoundContent="No supplier master data"
                  />
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
                dataSource={items.map((item, index) => ({
                  ...item,
                  index,
                  key: `temp-row-${index}`,
                }))}
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
                    onPreview={(file) => void handlePreviewFile(file)}
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
      <SupportingDocPreviewModal
        open={Boolean(previewState)}
        fileName={previewState?.fileName}
        previewUrl={previewState?.url}
        revokeOnClose={previewState?.revokeOnClose}
        onClose={() => setPreviewState(null)}
      />
    </FullscreenModal>
  );
}
