import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Checkbox,
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
} from 'antd';
import type { UploadFile, UploadProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  CameraOutlined,
  InboxOutlined,
  MobileOutlined,
  QrcodeOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { buildReceiptExceptionReason, hasReceiptDiscrepancy } from '../workflow';
import type { GRItem, PurchaseOrder } from '../workflow';
import type { UpcomingInboundGoodsReceipt } from '../data';
import { FullscreenModal } from './FullscreenModal';

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
      receiveQty: item.remainingQty,
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
  const selectedPOReferences = purchaseOrders.map((purchaseOrder) => ({
    poNumber: purchaseOrder.poNumber,
    supplier: purchaseOrder.supplier,
    expectedDate: purchaseOrder.expectedDate,
    expectedTime: purchaseOrder.expectedTime,
  }));
  const supplierNames = Array.from(
    new Set(purchaseOrders.map((purchaseOrder) => purchaseOrder.supplier)),
  );
  const receiptType = deriveReceiptType(purchaseOrders);
  const firstPO = purchaseOrders[0];

  const [postingDate, setPostingDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [actualReceiptDate, setActualReceiptDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [deliveryNoteNumber, setDeliveryNoteNumber] = useState('');
  const [items, setItems] = useState<GRItem[]>(() => buildInitialItems(purchaseOrders));
  const [uploadedFiles, setUploadedFiles] = useState<UploadFile[]>([]);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [storedOnHoldConfirmed, setStoredOnHoldConfirmed] = useState(false);
  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [scannedValue, setScannedValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setUploadedFiles(info.fileList.slice(-10));
  };

  const removeFile = (uid: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.uid !== uid));
  };

  const validate = (): boolean => {
    const nextErrors: Record<string, boolean> = {};
    if (!deliveryNoteNumber.trim()) nextErrors.deliveryNote = true;
    if (!storedOnHoldConfirmed) nextErrors.onHoldConfirm = true;

    items.forEach((item, index) => {
      if (item.isMissing) {
        if (!item.missingRemark?.trim()) nextErrors[`missingRemark-${index}`] = true;
        return;
      }
      if (requiresTraceabilityFields(item)) {
        if (!item.productDate) nextErrors[`productDate-${index}`] = true;
        if (!item.expiryDate) nextErrors[`expiryDate-${index}`] = true;
        if (!item.batchNumber.trim()) nextErrors[`batchNumber-${index}`] = true;
      }
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const buildGRData = (submissionMode: 'draft' | 'submit') => {
    const hasDiscrepancy = hasReceiptDiscrepancy(items);
    const exceptionReason = buildReceiptExceptionReason(items);
    const nextProcessState =
      correctionMode || submissionMode === 'draft'
        ? 'GRPO_DRAFT'
        : 'QC_PENDING';

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
      poReferences: selectedPOReferences,
      supplierNames,
      receiptType,
      expectedDate: firstPO?.expectedDate,
      expectedTime: firstPO?.expectedTime,
      postingDate,
      actualReceiptDate,
      deliveryNoteNumber,
      receiverWarehouseName,
      items,
      uploadedFiles: uploadedFiles.map((file) => file.name),
      specMatch: true,
      qtyMatch: !hasDiscrepancy,
      qualityCheckRequired: true,
      qcResult: 'Pending',
      exceptionReason,
      processState: nextProcessState,
      documentChecklist: {
        vendorDN: deliveryNoteNumber.trim().length > 0,
        goodsReceiptPOForm: true,
        pmrmStockCardForm: false,
        supportingDocs: uploadedFiles.map((file) => file.name),
      },
      storedOnHoldConfirmed,
    };
  };

  const handleSaveDraft = async () => {
    setIsSubmitting(true);
    try {
      const shouldClose = await onSaveDraft(buildGRData('draft'));
      if (shouldClose) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const shouldClose = await onSubmit(buildGRData(correctionMode ? 'draft' : 'submit'));
      if (shouldClose) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const openScanModal = () => {
    setScanModalOpen(true);
    setScannedValue(
      `PO-SCAN-${purchaseOrders.map((purchaseOrder) => purchaseOrder.poNumber).join('-')}`,
    );
  };

  const closeScanModal = () => {
    setScanModalOpen(false);
    setScannedValue('');
  };

  const confirmScan = () => {
    const fallbackBarcode = `PO-SCAN-${purchaseOrders
      .map((purchaseOrder) => purchaseOrder.poNumber)
      .join('-')}`;
    const barcodeValue = scannedValue.trim() || fallbackBarcode;
    const autoProductDate = dayjs(actualReceiptDate || postingDate || undefined).format('YYYY-MM-DD');
    const autoExpiry = dayjs(autoProductDate || undefined)
      .add(12, 'month')
      .format('YYYY-MM-DD');

    setItems((prev) =>
      prev.map((item, index) =>
        item.isMissing
          ? item
          : {
              ...item,
              receiveQty: item.poQty,
              productDate: item.productDate || autoProductDate,
              expiryDate: item.expiryDate || autoExpiry,
              batchNumber:
                item.batchNumber ||
                `${item.poNumber.replace(/[^A-Z0-9]/gi, '')}-${String(index + 1).padStart(2, '0')}`,
              barcode: `${barcodeValue}-${String(index + 1).padStart(2, '0')}`,
            },
      ),
    );
    setErrors((prev) => {
      const next = { ...prev };
      items.forEach((_, index) => {
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
      setItems(
        initialReceipt.items.map((item) => ({
          ...item,
          qcDecision: undefined,
          qcRemark: '',
        })),
      );
      setUploadedFiles(
        (initialReceipt.documentChecklist.supportingDocs || []).map((fileName, index) => ({
          uid: `existing-${index}`,
          name: fileName,
          status: 'done',
        })),
      );
      setStoredOnHoldConfirmed(true);
      setErrors({});
      closeScanModal();
      return;
    }

    setPostingDate(dayjs().format('YYYY-MM-DD'));
    setActualReceiptDate(dayjs().format('YYYY-MM-DD'));
    setDeliveryNoteNumber('');
    setItems(buildInitialItems(purchaseOrders));
    setUploadedFiles([]);
    setErrors({});
    setStoredOnHoldConfirmed(false);
    closeScanModal();
  }, [initialReceipt, open, purchaseOrders]);

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
  const missingItemsCount = items.filter((item) => item.isMissing).length;
  const shortItemsCount = items.filter((item) => !item.isMissing && item.receiveQty < item.poQty)
    .length;
  const hasDiscrepancy = missingItemsCount > 0 || shortItemsCount > 0;

  const itemColumns: ColumnsType<GRItem & { index: number }> = [
    {
      title: 'Item',
      dataIndex: 'code',
      key: 'code',
      width: 124,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.code}</div>
          <div style={{ fontSize: 12, color: '#666' }}>{record.name}</div>
        </div>
      ),
    },
    {
      title: 'PO Qty',
      dataIndex: 'poQty',
      key: 'poQty',
      width: 76,
      align: 'right',
      render: (value: number) => (
        <span style={{ display: 'block', textAlign: 'right' }}>{value.toLocaleString()}</span>
      ),
    },
    {
      title: 'Receive Qty',
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
          disabled={record.isMissing}
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
          disabled={record.isMissing}
          status={errors[`expiryDate-${record.index}`] ? 'error' : undefined}
        />
      ),
    },
    {
      title: 'Batch Number',
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
      title: 'Receipt Status',
      key: 'receiptStatus',
      width: 150,
      render: (_, record) => {
        const receiptStatus = record.isMissing ? 'Missing' : 'Good';
        const isMissingStatus = receiptStatus === 'Missing';

        return (
          <div
            style={{
              width: '100%',
              padding: 2,
              borderRadius: 8,
              backgroundColor: isMissingStatus ? '#fff1f0' : '#f6ffed',
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
        );
      },
    },
    {
      title: 'Remark',
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
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px 24px 0' }}>
            <Descriptions column={4} size="small" style={{ marginTop: 10, marginBottom: 28 }}>
            <Descriptions.Item label="PO References">
              {selectedPOCount === 1 ? firstPO?.poNumber : `${selectedPOCount} selected`}
            </Descriptions.Item>
            <Descriptions.Item label="Suppliers">
              {supplierNames.length === 1 ? supplierNames[0] : `${supplierNames.length} suppliers`}
            </Descriptions.Item>
            <Descriptions.Item label="Receipt Type">
              <Tag color={receiptType === 'Planned' ? 'blue' : 'orange'}>
                {receiptType}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Expected Date">
              {firstPO?.expectedDate || 'N/A'}
            </Descriptions.Item>
          </Descriptions>

          <div style={{ marginBottom: 24 }}>
            <h4 style={{ marginBottom: 12 }}>Selected Purchase Orders</h4>
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

          <Form layout="vertical" style={{ marginBottom: 24 }}>
            <Row gutter={24}>
              <Col span={8}>
                <Form.Item label="Posting Date" required>
                  <DatePicker
                    value={postingDate ? dayjs(postingDate) : null}
                    onChange={(_, dateStr) => setPostingDate(dateStr as string)}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
                <div style={{ marginTop: -8 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Receiver
                  </Text>
                  <br />
                  <Text strong>{receiverWarehouseName}</Text>
                </div>
              </Col>
              <Col span={8}>
                <Form.Item label="Actual Receipt Date" required>
                  <DatePicker
                    value={actualReceiptDate ? dayjs(actualReceiptDate) : null}
                    onChange={(_, dateStr) => setActualReceiptDate(dateStr as string)}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="Delivery Note Number"
                  required
                  validateStatus={errors.deliveryNote ? 'error' : undefined}
                  help={errors.deliveryNote ? 'Required' : undefined}
                >
                  <Input
                    placeholder="From truck paperwork"
                    value={deliveryNoteNumber}
                    onChange={(event) => {
                      setDeliveryNoteNumber(event.target.value);
                      setErrors((prev) => ({ ...prev, deliveryNote: false }));
                    }}
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
              <Button icon={<QrcodeOutlined />} onClick={openScanModal}>
                Scan PO Barcode
              </Button>
            </div>
            {hasDiscrepancy && (
              <Alert
                type="warning"
                showIcon
                style={{ marginBottom: 16 }}
                message={`${missingItemsCount} missing and ${shortItemsCount} short item row${shortItemsCount !== 1 ? 's' : ''}.`}
                description="Missing rows require a remark."
              />
            )}
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              {groupedItems.map((group) => (
                <Card
                  key={group.poNumber}
                  size="small"
                  style={{ borderRadius: 12, overflow: 'hidden' }}
                  headStyle={{
                    background: '#fafafa',
                    borderBottom: '1px solid #f0f0f0',
                    padding: '14px 16px',
                  }}
                  bodyStyle={{ padding: 0 }}
                  title={
                    <div
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
                        <Tag bordered={false} color="processing" style={{ paddingInline: 10 }}>
                          {group.expectedDate
                            ? `${group.expectedDate}${group.expectedTime ? ` ${group.expectedTime}` : ''}`
                            : 'Unplanned arrival'}
                        </Tag>
                      </Space>
                    </div>
                  }
                >
                  <Table
                    size="small"
                    columns={itemColumns}
                    dataSource={group.rows}
                    pagination={false}
                    scroll={{ x: 1420 }}
                    tableLayout="auto"
                  />
                </Card>
              ))}
            </Space>
          </div>

          <div style={{ marginBottom: 24 }}>
            <h4 style={{ marginBottom: 12 }}>Documents</h4>
            <Upload
              multiple
              fileList={uploadedFiles}
              onChange={handleUploadChange}
              onRemove={(file) => removeFile(file.uid)}
              beforeUpload={() => false}
              accept=".pdf,.doc,.docx,image/*"
              listType="text"
            >
              <Button icon={<InboxOutlined />}>Upload Delivery Note / PDF / Photos</Button>
            </Upload>
            <div style={{ fontSize: 12, color: '#999', marginTop: 6 }}>
              PDF, Word (.doc, .docx), or images. Click to open file picker.
            </div>
          </div>

            <Form.Item
              validateStatus={errors.onHoldConfirm ? 'error' : undefined}
              help={errors.onHoldConfirm ? 'Required' : undefined}
            >
              <Checkbox
                checked={storedOnHoldConfirmed}
                onChange={(event) => {
                  setStoredOnHoldConfirmed(event.target.checked);
                  setErrors((prev) => ({ ...prev, onHoldConfirm: false }));
                }}
              >
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
                <Button
                  type="primary"
                  onClick={handleSubmit}
                  disabled={!storedOnHoldConfirmed || isSubmitting}
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
                <span>{selectedPOCount === 1 ? firstPO?.poNumber : `${selectedPOCount} POs`}</span>
                <span>{items.length} item rows</span>
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
                {selectedPOCount === 1 ? firstPO?.poNumber : `${selectedPOCount} selected`}
              </Descriptions.Item>
              <Descriptions.Item label="Supplier">
                {supplierNames.length === 1 ? supplierNames[0] : `${supplierNames.length} suppliers`}
              </Descriptions.Item>
              <Descriptions.Item label="Receipt Type">
                {receiptType}
              </Descriptions.Item>
              <Descriptions.Item label="Item Count">
                {items.length}
              </Descriptions.Item>
            </Descriptions>
            <Divider style={{ margin: '12px 0' }} />
            <Form layout="vertical">
              <Form.Item label="Scanned Barcode">
                <Input
                  value={scannedValue}
                  onChange={(event) => setScannedValue(event.target.value)}
                  prefix={<QrcodeOutlined />}
                  placeholder="Scan result for the PO barcode"
                />
              </Form.Item>
            </Form>
          </Card>

          <Alert
            type="info"
            showIcon
            message="Confirming the scan will fill quantities, product dates, expiry dates, batch numbers, and barcode values for non-missing rows."
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
