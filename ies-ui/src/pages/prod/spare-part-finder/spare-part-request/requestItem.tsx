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
import React, { useEffect, useState } from 'react';
import type { SparePartRequestItem } from './data';
import SparePartImage from './SparePartImage';

type PriorityLevel = 'normal' | 'high' | 'urgent';

interface RequestRowItem {
  key: number;
  item: SparePartRequestItem;
  quantity: number;
  purpose: string;
  Uom: string;
}

interface RequestItemModalProps {
  open: boolean;
  selectedItems: SparePartRequestItem[];
  onCancel: () => void;
  onSubmit: (payload: {
    items: { item: SparePartRequestItem; quantity: number; purpose: string }[];
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

const TABLE_MIN_WIDTH = 1280;

const RequestItemModal: React.FC<RequestItemModalProps> = ({
  open,
  selectedItems,
  onCancel,
  onSubmit,
  onAddMore,
}) => {
  const [rows, setRows] = useState<RequestRowItem[]>([]);
  const [remark, setRemark] = useState<string>('');
  const [priority, setPriority] = useState<PriorityLevel>('normal');
  const [confirmLoading, setConfirmLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setRows(
        selectedItems.map((item, idx) => ({
          key: idx,
          item,
          quantity: item.stock > 0 ? 1 : 0,
          purpose: '',
          Uom: 'pcs',
        })),
      );
      setRemark('');
      setPriority('normal');
    }
  }, [open, selectedItems]);

  const handleQuantityChange = (key: number, value: number) => {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, quantity: value } : r)));
  };

  const handlePurposeChange = (key: number, value: string) => {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, purpose: value } : r)));
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

    setConfirmLoading(true);
    try {
      onSubmit({
        items: rows.map((r) => ({ item: r.item, quantity: r.quantity, purpose: r.purpose })),
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
      width: 40,
      align: 'center' as const,
      render: (_: unknown, __: RequestRowItem, index: number) => index + 1,
    },
    {
      title: 'Product ID',
      dataIndex: ['item', 'productId'],
      width: 'auto',
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
      width: 'auto',
    },
    {
      title: 'Type',
      dataIndex: ['item', 'type'],
      width: 'auto',
      align: 'center' as const,
    },
    {
      title: 'Ware House',
      dataIndex: ['item', 'warehouse'],
      width: 'auto',
    },
     {
     title: 'To Warehouse',
     dataIndex: ['item', 'toWarehouse'],
     width: 'auto',
     render: (text: string) => (
      <Select
        defaultValue={'WH1'}
        options={
          [
            { value: 'WH1', label: 'Warehouse 1' },
            { value: 'WH2', label: 'Warehouse 2' },
            { value: 'WH3', label: 'Warehouse 3' },
          ]
        }
      />
     )
     },
     {
     title: 'For Line',
     dataIndex: ['item', 'productLine'],
     width: 260,
  
     render: (text: string) =>(
      <Input placeholder="machine ID" defaultValue={text} />
      )
    },

    {
      title: 'BU',
      dataIndex: ['item', 'businessUnit'],
      width: 'auto',
      align: 'center' as const,
    },
  {
    title: 'UoM',
    dataIndex: 'Uom',
    width: 140,
    render: (_: unknown, record: RequestRowItem) => (
      <Select
        placeholder="Please select"
        value={record.Uom}
        onChange={(value) => {
          setRows((prev) =>
            prev.map((r) =>
              r.key === record.key ? { ...r, Uom: value } : r
            )
          );
        }}
        style={{ width: '100%' , 
         paddingLeft: 8,
         paddingRight: 8,

        }}
      >
        <Select.Option value="pcs">PCS</Select.Option>
        <Select.Option value="box">BOX</Select.Option>
        <Select.Option value="set">SET</Select.Option>
        <Select.Option value="pack">PACK</Select.Option>
        <Select.Option value="ctn">CTN</Select.Option>
        <Select.Option value="l">L</Select.Option>
        <Select.Option value="kg">KG</Select.Option>
        <Select.Option value="rol">ROL</Select.Option>
      </Select>
    ),
  },
    {
      title: 'QTY to Request',
      width: 150,
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
      width: 'auto',
      height: '100%',
      render: (_: unknown, record: RequestRowItem) => (
        <Input.TextArea
          placeholder="write your purpose here"
          value={record.purpose}
          rows={1}
          onChange={(e) => handlePurposeChange(record.key, e.target.value)}
        style={
          { height  : 'auto'}
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
      destroyOnClose
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
