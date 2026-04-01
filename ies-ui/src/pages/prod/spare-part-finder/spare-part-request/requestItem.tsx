import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import {
  Button,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Table,
  Typography,
  message,
} from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import type { SparePartRequestItem } from './data';
import SparePartImage from './SparePartImage';

type PriorityLevel = 'normal' | 'high' | 'urgent';

interface RequestRowItem {
  key: number;
  item: SparePartRequestItem;
  quantity: number;
  purpose: string;
  uom: string;
  toWarehouseCode: string;
  forLine: string;
}

interface RequestItemModalProps {
  open: boolean;
  selectedItems: SparePartRequestItem[];
  initialRows?: {
    item: SparePartRequestItem;
    quantity: number;
    purpose: string;
    toWarehouseCode: string;
    forLine: string;
    uom: string;
  }[];
  onCancel: () => void;
  onSubmit: (payload: {
    items: {
      item: SparePartRequestItem;
      quantity: number;
      purpose: string;
      toWarehouseCode: string;
      forLine: string;
      uom: string;
    }[];
    remark: string;
    priority: PriorityLevel;
  }) => void;
  onAddMore?: () => void;
}

const priorityOptions: { label: string; value: PriorityLevel; color: string; borderColor: string }[] = [
  { label: 'Normal', value: 'normal', color: '#f5f5f5', borderColor: '#d9d9d9' },
  { label: 'High', value: 'high', color: '#fff7e6', borderColor: '#fa8c16' },
  { label: 'Urgent', value: 'urgent', color: '#fff1f0', borderColor: '#f5222d' },
];

const TABLE_MIN_WIDTH = '90vw';

const normalizeUomOptions = (value?: string | string[]) => {
  if (Array.isArray(value)) {
    return Array.from(new Set(value.map((item) => String(item || '').trim()).filter(Boolean)));
  }

  const normalized = String(value || '').trim();
  if (!normalized) return [];

  try {
    const parsed = JSON.parse(normalized);
    if (Array.isArray(parsed)) {
      return Array.from(new Set(parsed.map((item) => String(item || '').trim()).filter(Boolean)));
    }
  } catch (error) {
    // Keep fallback parsing below for non-JSON payloads such as "[PCS,BOX]".
  }

  const flattened = normalized
    .replace(/^\[/, '')
    .replace(/\]$/, '')
    .split(',')
    .map((item) => item.trim().replace(/^"+|"+$/g, ''))
    .filter(Boolean);

  return Array.from(new Set(flattened.length > 0 ? flattened : [normalized]));
};

const getItemUomOptions = (item: SparePartRequestItem) => {
  if (Array.isArray(item.uomOptions) && item.uomOptions.length > 0) {
    return item.uomOptions;
  }

  return normalizeUomOptions(item.uom);
};

const RequestItemModal: React.FC<RequestItemModalProps> = ({
  open,
  selectedItems,
  initialRows,
  onCancel,
  onSubmit,
  onAddMore,
}) => {
  const [rows, setRows] = useState<RequestRowItem[]>([]);
  const [remark, setRemark] = useState<string>('');
  const [priority, setPriority] = useState<PriorityLevel>('normal');
  const [confirmLoading, setConfirmLoading] = useState(false);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (!open) {
      wasOpenRef.current = false;
      return;
    }

    setRows((previous) => {
      const previousByProductId = new Map(
        previous.map((row) => [String(row.item.productId), row]),
      );
      const initialRowsByProductId = new Map(
        (initialRows || []).map((row) => [String(row.item.productId), row]),
      );

      return selectedItems.map((item, idx) => {
        const previousRow = previousByProductId.get(String(item.productId));
        const initialRow = initialRowsByProductId.get(String(item.productId));
        const uomOptions = getItemUomOptions(item);

        if (previousRow) {
          return {
            ...previousRow,
            key: idx,
            item,
            uom: previousRow.uom || uomOptions[0] || '',
          };
        }

        return {
          key: idx,
          item: initialRow?.item || item,
          quantity: initialRow?.quantity ?? (item.stock > 0 ? 1 : 0),
          purpose: initialRow?.purpose || '',
          uom: initialRow?.uom || uomOptions[0] || '',
          toWarehouseCode: initialRow?.toWarehouseCode || item.warehouse || 'WH1',
          forLine: initialRow?.forLine || 'Line1',
        };
      });
    });

    if (!wasOpenRef.current) {
      wasOpenRef.current = true;
    }
  }, [open, selectedItems, initialRows]);

  const handleQuantityChange = (key: number, value: number) => {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, quantity: value } : r)));
  };

  const handlePurposeChange = (key: number, value: string) => {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, purpose: value } : r)));
  };

  const updateRow = (key: number, patch: Partial<RequestRowItem>) => {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  };

  const handleDeleteRow = (key: number) => {
    const updated = rows.filter((r) => r.key !== key);
    if (updated.length === 0) {
      message.warning('At least one item is required.');
      return;
    }
    setRows(updated);
  };

  const handleSubmit = async () => {
    const emptyPurpose = rows.some((r) => !r.purpose.trim());
    if (emptyPurpose) {
      message.warning('Please fill in the purpose for all items.');
      return;
    }
    const zeroQty = rows.some((r) => r.quantity <= 0);
    if (zeroQty) {
      message.warning('Quantity must be greater than 0 for all items.');
      return;
    }
    const missingWarehouse = rows.some((r) => !r.toWarehouseCode.trim());
    if (missingWarehouse) {
      message.warning('Please select a destination warehouse for all items.');
      return;
    }
    const missingLine = rows.some((r) => !r.forLine.trim());
    if (missingLine) {
      message.warning('Please select a line for all items.');
      return;
    }
    const missingUom = rows.some((r) => !r.uom.trim());
    if (missingUom) {
      message.warning('Please select a UOM for all items.');
      return;
    }

    setConfirmLoading(true);
    try {
      onSubmit({
        items: rows.map((r) => ({
          item: r.item,
          quantity: r.quantity,
          purpose: r.purpose,
          toWarehouseCode: r.toWarehouseCode,
          forLine: r.forLine,
          uom: r.uom,
        })),
        remark,
        priority,
      });
    } finally {
      setConfirmLoading(false);
    }
  };

  const columns = [
    {
      title: 'No',
      width: '6%',
      align: 'center' as const,
      render: (_: unknown, __: RequestRowItem, index: number) => index + 1,
    },
    {
      title: 'Product ID',
      dataIndex: ['item', 'productId'],
      width: '120px',
      render: (text: string) => (
        <Typography.Link>{text}</Typography.Link>
      ),
    },
    {
      title: 'Image',
      width: 80,
      align: 'center' as const,
      render: (_: unknown, record: RequestRowItem) => (
        <SparePartImage
          imageId={record.item.imageId}
          src={record.item.image}
          alt={record.item.partName || record.item.productId}
          size={44}
        />
      ),
    },
    {
      title: 'Part Name',
      dataIndex: ['item', 'partName'],
      ellipsis: true,
      width: '10%',
    },
    {
      title: 'Type',
      dataIndex: ['item', 'type'],
      width: '6%',
      align: 'center' as const,
    },
    {
      title: 'BU',
      dataIndex: ['item', 'businessUnit'],
      width: '4%',
      align: 'center' as const,
    },
    {
      title: 'Warehouse',
      dataIndex: ['item', 'warehouse'],
      width: '7%',
    },
     {
     title: 'To Warehouse',
     dataIndex: ['item', 'toWarehouse'],
     width: '4%',
     render: (_text: string, record: RequestRowItem) => (
      <Select
      style={{ width: '100%' }}
        value={record.toWarehouseCode}
        onChange={(value) => updateRow(record.key, { toWarehouseCode: value })}
        options={
          [
            { value: 'WH1', label: 'WH 1' },
            { value: 'WH2', label: 'WH 2' },
            { value: 'WH3', label: 'WH 3' },
          ]
        }
      />
     )
     },
     {
     title: 'For Line',
     dataIndex: ['item', 'productLine'],
     width: '10%',
     render: (_text: string, record: RequestRowItem) => (
      <Select
      style={{ width: '100%' }}
        value={record.forLine}
        onChange={(value) => updateRow(record.key, { forLine: value })}
        options={
          [
            { value: 'Line1', label: 'Line 1' },
            { value: 'Line2', label: 'Line 2' },
            { value: 'Line3', label: 'Line 3' },
          ]
        }
      />
     )
    },

    
  {
    title: 'UoM',
    dataIndex: 'uom',
    width: '6%',
    render: (_: unknown, record: RequestRowItem) => {
      const uomOptions = getItemUomOptions(record.item);
      const selectedUom = record.uom || uomOptions[0] || '';

      if (uomOptions.length <= 1) {
        return <Typography.Text>{selectedUom || '-'}</Typography.Text>;
      }

      return (
        <Select
          placeholder="Please select"
          value={selectedUom || undefined}
          onChange={(value) => {
            updateRow(record.key, { uom: value });
          }}
          options={uomOptions.map((item) => ({ value: item, label: item }))}
          style={{
            width: '100%',
            paddingLeft: 8,
            paddingRight: 8,
          }}
        />
      );
    },
  },
    {
      title: 'QTY to Request',
      width: 120,
      render: (_: unknown, record: RequestRowItem) => {
        const max = record.item.stock > 0 ? record.item.stock : 100;
        return (
          <Space size={4}>
            <InputNumber
              min={0}
              max={max}
              value={record.quantity}
              onChange={(val) => handleQuantityChange(record.key, val ?? 0)}
              style={{ width: '100%' }}
            />
          </Space>
        );
      },
    },
    {
      title: 'Purpose',
      width: '15%',
      render: (_: unknown, record: RequestRowItem) => (
        <Input.TextArea
          placeholder="write your purpose here"
          value={record.purpose}
          rows={1}
          onChange={(e) => handlePurposeChange(record.key, e.target.value)}
        style={
          { height  : 'auto', width: '100%' 
          }
        }
        />
      ),
    },
    {
      title: '',
      width: 56,
      align: 'center' as const,
      render: (_: unknown, record: RequestRowItem) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteRow(record.key)}
        />
      ),
    },
  ];

  const modalTitle = (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: 24 }}>
      <Typography.Text strong style={{ fontSize: 16 }}>
        Spare part Request({rows.length} items)
      </Typography.Text>
      {onAddMore && (
        <Button type="link" icon={<PlusOutlined />} onClick={onAddMore}>
          More Item
        </Button>
      )}
    </div>
  );

  const modalFooter = (
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
      <Button onClick={onCancel}>Cancel</Button>
      <Button
        type="primary"
        loading={confirmLoading}
        onClick={handleSubmit}
        style={{ backgroundColor: '#d4a844', borderColor: '#d4a844' }}
      >
        Submit
      </Button>
    </div>
  );

  return (
    <Modal
      title={modalTitle}
      open={open}
      onCancel={onCancel}
      confirmLoading={confirmLoading}
      width="fit-content"
      style={{ maxWidth: 'calc(100vw - 48px)' }}
      footer={modalFooter}
      maskClosable={false}
      centered
      styles={{
        body: {
          background: '#fafafa',
          paddingTop: 16,
        },
      }}
    >
      <div
        style={{
          maxHeight: '45vh',
          overflowX: 'auto',
          overflowY: 'auto',
          marginBottom: 16,
          border: '1px solid #f0f0f0',
          borderRadius: 8,
          background: '#fff',
        }}
      >
        <Table<RequestRowItem>
          dataSource={rows}
          columns={columns}
          rowKey="key"
          size="small"
          bordered
          pagination={false}
          scroll={{ x: 'max-content' }}
          style={{ minWidth: TABLE_MIN_WIDTH }}
        />
      </div>

      {/* Remark */}
      <div style={{ marginBottom: 16 }}>
        <Typography.Text strong style={{ display: 'block', marginBottom: 6 }}>
          Remark
        </Typography.Text>
        <Input.TextArea
          rows={3}
          placeholder="write your purpose here"
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
        />
      </div>

      {/* Priority Level */}
      <div>
        <Typography.Text strong style={{ display: 'block', marginBottom: 6 }}>
          Priority Level
        </Typography.Text>
        <Space size="small">
          {priorityOptions.map((opt) => (
            <Button
              key={opt.value}
              type={priority === opt.value ? 'primary' : 'default'}
              onClick={() => setPriority(opt.value)}
              style={
                priority === opt.value
                  ? {
                      backgroundColor: opt.value === 'normal' ? '#f5f5f5' : opt.color,
                      borderColor: opt.borderColor,
                      color: opt.value === 'normal' ? '#000' : opt.borderColor,
                    }
                  : {
                      borderColor: opt.borderColor,
                      color: opt.value === 'normal' ? '#000' : opt.borderColor,
                    }
              }
            >
              {opt.label}
            </Button>
          ))}
        </Space>
      </div>
    </Modal>
  );
};

export default RequestItemModal;
