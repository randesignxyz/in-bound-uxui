import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, Descriptions, Input, Space, Table, Tag, Typography } from 'antd';
import { SearchOutlined, LinkOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { summarizePOReferences } from '../workflow';
import type { GoodsReceipt, PurchaseOrder } from '../workflow';
import { FullscreenModal } from './FullscreenModal';

const { Text } = Typography;

interface LinkPOModalProps {
  open: boolean;
  receipt: GoodsReceipt | null;
  purchaseOrders: PurchaseOrder[];
  onClose: () => void;
  onLink: (receipt: GoodsReceipt, purchaseOrder: PurchaseOrder) => void;
  onValidationChange?: (receipt: GoodsReceipt, reason: string) => void;
}

interface ComparisonRow {
  key: string;
  code: string;
  name: string;
  tempReceivedQty: number;
  poRemainingQty: number;
  result: 'Matched' | 'Missing In PO' | 'Qty Exceeded';
}

function validateLink(receipt: GoodsReceipt, purchaseOrder: PurchaseOrder) {
  const normalizedReceiptSupplier = receipt.supplier.trim().toUpperCase();
  const normalizedPOSupplier = purchaseOrder.supplier.trim().toUpperCase();

  if (normalizedReceiptSupplier !== normalizedPOSupplier) {
    return 'Supplier does not match the selected PO.';
  }

  for (const item of receipt.items) {
    const matchedPOItem = purchaseOrder.items.find((poItem) => poItem.code === item.code);
    if (!matchedPOItem) {
      return `Item ${item.code} does not exist in the selected PO.`;
    }

    if (item.receiveQty > matchedPOItem.remainingQty) {
      return `Item ${item.code} exceeds the remaining PO quantity.`;
    }
  }

  return '';
}

export function LinkPOModal({
  open,
  receipt,
  purchaseOrders,
  onClose,
  onLink,
  onValidationChange,
}: LinkPOModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState<PurchaseOrder | null>(null);
  const [searchError, setSearchError] = useState('');

  useEffect(() => {
    if (!open) return;
    setSearchTerm('');
    setSearchResult(null);
    setSearchError('');
  }, [open, receipt?.grNumber]);

  const comparisonRows = useMemo<ComparisonRow[]>(() => {
    if (!searchResult || !receipt) return [];
    return receipt.items.map((item) => {
      const matchedPOItem = searchResult.items.find((poItem) => poItem.code === item.code);
      const result = !matchedPOItem
        ? 'Missing In PO'
        : item.receiveQty > matchedPOItem.remainingQty
          ? 'Qty Exceeded'
          : 'Matched';

      return {
        key: item.code,
        code: item.code,
        name: item.name,
        tempReceivedQty: item.receiveQty,
        poRemainingQty: matchedPOItem?.remainingQty || 0,
        result,
      };
    });
  }, [receipt?.items, searchResult]);

  const validationError = useMemo(
    () => (searchResult && receipt ? validateLink(receipt, searchResult) : ''),
    [receipt, searchResult],
  );

  useEffect(() => {
    if (!receipt || !onValidationChange) return;
    onValidationChange(receipt, validationError);
  }, [onValidationChange, receipt, validationError]);

  if (!receipt) return null;

  const handleSearch = () => {
    if (!searchTerm.trim()) return;

    const normalizedSearch = searchTerm.trim().toUpperCase();
    const found = purchaseOrders.find(
      (purchaseOrder) => purchaseOrder.poNumber.toUpperCase() === normalizedSearch,
    );

    if (!found) {
      setSearchResult(null);
      setSearchError('PO not found in SAP list.');
      return;
    }

    setSearchResult(found);
    setSearchError('');
  };

  const columns: ColumnsType<ComparisonRow> = [
    { title: 'Item Code', dataIndex: 'code', key: 'code', width: 120 },
    { title: 'Item Name', dataIndex: 'name', key: 'name' },
    {
      title: 'TGR Received',
      dataIndex: 'tempReceivedQty',
      key: 'tempReceivedQty',
      width: 120,
      align: 'right',
      render: (value: number) => value.toLocaleString(),
    },
    {
      title: 'PO Remaining',
      dataIndex: 'poRemainingQty',
      key: 'poRemainingQty',
      width: 120,
      align: 'right',
      render: (value: number) => value.toLocaleString(),
    },
    {
      title: 'Result',
      dataIndex: 'result',
      key: 'result',
      width: 140,
      render: (value: ComparisonRow['result']) => (
        <Tag color={value === 'Matched' ? 'success' : 'error'}>{value}</Tag>
      ),
    },
  ];

  return (
    <FullscreenModal
      title="Link Temporary Inbound Receiving to SAP PO"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 24px 0' }}>
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Descriptions column={2} size="small">
              <Descriptions.Item label="Temporary Receiving">
                {receipt.tempReferenceNo || receipt.grNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Current PO">{summarizePOReferences(receipt)}</Descriptions.Item>
              <Descriptions.Item label="Supplier">{receipt.supplier}</Descriptions.Item>
              <Descriptions.Item label="Delivery Note">{receipt.deliveryNoteNumber}</Descriptions.Item>
            </Descriptions>

            <Card size="small" title="Search SAP PO">
              <Space.Compact style={{ width: '100%' }}>
                <Input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Enter SAP PO number"
                  prefix={<SearchOutlined />}
                  onPressEnter={handleSearch}
                />
                <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                  Search
                </Button>
              </Space.Compact>

              {searchError && (
                <Alert type="error" showIcon style={{ marginTop: 12 }} message={searchError} />
              )}
            </Card>

            {searchResult && (
              <>
                <Card size="small" title="PO Match Summary">
                  <Descriptions column={2} size="small">
                    <Descriptions.Item label="PO Number">{searchResult.poNumber}</Descriptions.Item>
                    <Descriptions.Item label="Supplier">{searchResult.supplier}</Descriptions.Item>
                    <Descriptions.Item label="Type">
                      <Tag color={searchResult.type === 'Planned' ? 'green' : 'orange'}>
                        {searchResult.type}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Status">
                      <Tag color={searchResult.status === 'Fully Received' ? 'green' : 'blue'}>
                        {searchResult.status}
                      </Tag>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>

                <Table size="small" columns={columns} dataSource={comparisonRows} pagination={false} />

                {validationError ? (
                  <Alert type="error" showIcon message={validationError} />
                ) : (
                  <Alert
                    type="success"
                    showIcon
                    message="PO can be linked to this temporary inbound receiving."
                  />
                )}
              </>
            )}
          </Space>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid #f0f0f0',
            padding: '16px 24px',
            background: '#fff',
          }}
        >
          <Text type="secondary">Procurement creates the SAP PO outside this screen.</Text>
          <Space>
            <Button onClick={onClose}>Cancel</Button>
            <Button
              type="primary"
              icon={<LinkOutlined />}
              disabled={!searchResult || Boolean(validationError)}
              onClick={() => searchResult && onLink(receipt, searchResult)}
            >
              Link PO
            </Button>
          </Space>
        </div>
      </div>
    </FullscreenModal>
  );
}
