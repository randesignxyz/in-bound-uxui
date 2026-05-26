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
import { fetchProductionLines, fetchSparePartWarehouses } from './service.api';
import SparePartImage from './SparePartImage';
import ValidationPopup from './validatePopup';

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

interface WarehouseOption {
  warehouseCode: string;
  warehouseName?: string;
}

interface LineOption {
  value: string;
  label: string;
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
  initialWarehousesByBusinessUnit?: Record<string, WarehouseOption[]>;
  initialRemark?: string;
  initialPriority?: PriorityLevel;
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
  }) => void | Promise<void>;
  onAddMore?: () => void;
  onItemsChange?: (items: SparePartRequestItem[]) => void;
  onViewProduct?: (item: SparePartRequestItem) => void | Promise<void>;
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

const normalizeBusinessUnit = (value?: string | null) =>
  String(value || '').trim().toUpperCase();

const getInventoryId = (item: SparePartRequestItem) =>
  item.locations?.[0]?.inventoryId ?? (item as any).inventoryId;

const getRequestItemKey = (item: SparePartRequestItem) =>
  `${item.productId || item.id || ''}::${item.warehouse || item.locations?.[0]?.warehouseCode || ''}::${getInventoryId(item) ?? 'no-inventory'}`;

const RequestItemModal: React.FC<RequestItemModalProps> = ({
  open,
  selectedItems,
  initialRows,
  initialWarehousesByBusinessUnit,
  initialRemark,
  initialPriority,
  onCancel,
  onSubmit,
  onAddMore,
  onItemsChange,
  onViewProduct,
}) => {
  const [rows, setRows] = useState<RequestRowItem[]>([]);
  const [remark, setRemark] = useState<string>('');
  const [priority, setPriority] = useState<PriorityLevel>('normal');
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [submitPopupOpen, setSubmitPopupOpen] = useState(false);
  const [warehousesByBusinessUnit, setWarehousesByBusinessUnit] = useState<Record<string, WarehouseOption[]>>({});
  const [loadingWarehouseUnits, setLoadingWarehouseUnits] = useState<Record<string, boolean>>({});
  const [lineOptions, setLineOptions] = useState<LineOption[]>([]);
  const [lineOptionsLoading, setLineOptionsLoading] = useState(false);
  const wasOpenRef = useRef(false);
  const loadingWarehouseUnitsRef = useRef<Record<string, boolean>>({});

  useEffect(() => {
    if (!open || !initialWarehousesByBusinessUnit) return;

    setWarehousesByBusinessUnit((previous) => ({
      ...previous,
      ...initialWarehousesByBusinessUnit,
    }));
  }, [initialWarehousesByBusinessUnit, open]);

  useEffect(() => {
    loadingWarehouseUnitsRef.current = loadingWarehouseUnits;
  }, [loadingWarehouseUnits]);

  useEffect(() => {
    if (!open) {
      wasOpenRef.current = false;
      return;
    }

    setRows((previous) => {
      const previousByItemKey = new Map(
        previous.map((row) => [getRequestItemKey(row.item), row]),
      );
      const initialRowsByItemKey = new Map(
        (initialRows || []).map((row) => [getRequestItemKey(row.item), row]),
      );

      return selectedItems.map((item, idx) => {
        const itemKey = getRequestItemKey(item);
        const previousRow = previousByItemKey.get(itemKey);
        const initialRow = initialRowsByItemKey.get(itemKey);
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
          quantity: initialRow?.quantity ?? 1,
          purpose: initialRow?.purpose || '',
          uom: initialRow?.uom || uomOptions[0] || '',
          toWarehouseCode: initialRow?.toWarehouseCode || '',
          forLine: initialRow?.forLine || '',
        };
      });
    });

    if (!wasOpenRef.current) {
      wasOpenRef.current = true;
    }
  }, [open, selectedItems, initialRows]);

  useEffect(() => {
    if (!open) return;
    setRemark(initialRemark || '');
    setPriority(initialPriority || 'normal');
  }, [initialPriority, initialRemark, open]);

  useEffect(() => {
    if (!open || lineOptions.length > 0) return;

    let cancelled = false;
    setLineOptionsLoading(true);
    fetchProductionLines()
      .then((lines) => {
        if (cancelled) return;
        setLineOptions(
          lines
            .map((line) => ({
              value: line.lineCode,
              label: line.lineCode,
            }))
            .filter((line) => line.value),
        );
      })
      .catch(() => {
        if (!cancelled) {
          setLineOptions([]);
          message.error('Failed to load production lines.');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLineOptionsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [lineOptions.length, open]);

  useEffect(() => {
    if (!open) return;

    const businessUnits = Array.from(
      new Set(
        [...selectedItems, ...rows.map((row) => row.item)]
          .map((item) => normalizeBusinessUnit(item.businessUnit))
          .filter((businessUnit) => businessUnit && businessUnit !== '-'),
      ),
    );
    const missingBusinessUnits = businessUnits.filter(
      (businessUnit) =>
        (initialWarehousesByBusinessUnit?.[businessUnit] || warehousesByBusinessUnit[businessUnit]) === undefined &&
        !loadingWarehouseUnitsRef.current[businessUnit],
    );

    if (missingBusinessUnits.length === 0) return;

    missingBusinessUnits.forEach((businessUnit) => {
      loadingWarehouseUnitsRef.current[businessUnit] = true;
    });

    setLoadingWarehouseUnits((previous) => ({
      ...previous,
      ...Object.fromEntries(missingBusinessUnits.map((businessUnit) => [businessUnit, true])),
    }));

    let cancelled = false;
    missingBusinessUnits.forEach((businessUnit) => {
      fetchSparePartWarehouses(businessUnit)
        .then((warehouses) => {
          if (cancelled) return;
          setWarehousesByBusinessUnit((previous) => ({
            ...previous,
            [businessUnit]: warehouses,
          }));
        })
        .catch(() => {
          if (cancelled) return;
          setWarehousesByBusinessUnit((previous) => ({
            ...previous,
            [businessUnit]: [],
          }));
          message.error(`Failed to load ${businessUnit} warehouses.`);
        })
        .finally(() => {
          loadingWarehouseUnitsRef.current[businessUnit] = false;
          if (cancelled) return;
          setLoadingWarehouseUnits((previous) => ({
            ...previous,
            [businessUnit]: false,
          }));
        });
    });

    return () => {
      cancelled = true;
    };
  }, [initialWarehousesByBusinessUnit, open, rows, selectedItems, warehousesByBusinessUnit]);

  useEffect(() => {
    if (!open || rows.length === 0) return;

    setRows((previous) =>
      previous.map((row) => {
        const businessUnit = normalizeBusinessUnit(row.item.businessUnit);
        const warehouseOptions = warehousesByBusinessUnit[businessUnit];

        if (!warehouseOptions || warehouseOptions.length === 0) {
          return row;
        }

        const currentWarehouseAllowed = warehouseOptions.some(
          (warehouse) => warehouse.warehouseCode === row.toWarehouseCode,
        );
        const nextWarehouseCode = currentWarehouseAllowed
          ? row.toWarehouseCode
          : warehouseOptions[0].warehouseCode;
        const nextLine = row.forLine || lineOptions[0]?.value || '';

        if (nextWarehouseCode === row.toWarehouseCode && nextLine === row.forLine) {
          return row;
        }

        return {
          ...row,
          toWarehouseCode: nextWarehouseCode,
          forLine: nextLine,
        };
      }),
    );
  }, [lineOptions, open, rows.length, warehousesByBusinessUnit]);

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
    onItemsChange?.(updated.map((row) => row.item));
  };

  const handleSubmit = async () => {
    const zeroQty = rows.some((r) => r.quantity <= 0);
    if (zeroQty) {
      message.warning('Quantity must be greater than 0 for all items.');
      return;
    }
    if (!remark.trim()) {
      message.warning('Please fill in the remark.');
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

    setSubmitPopupOpen(true);
  };

  const handleConfirmSubmit = async () => {
    setConfirmLoading(true);
    try {
      await onSubmit({
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
      setSubmitPopupOpen(false);
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
      render: (text: string, record: RequestRowItem) =>
        onViewProduct ? (
          <Typography.Link
            onClick={(event) => {
              event.preventDefault();
              onViewProduct(record.item);
            }}
          >
            {text}
          </Typography.Link>
        ) : (
          <Typography.Text>{text}</Typography.Text>
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
      title: 'Category',
      dataIndex: ['item', 'category'],
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
     width: 220,
     render: (_text: string, record: RequestRowItem) => {
      const businessUnit = normalizeBusinessUnit(record.item.businessUnit);
      const warehouseOptions = warehousesByBusinessUnit[businessUnit] || initialWarehousesByBusinessUnit?.[businessUnit] || [];
      const loading = warehouseOptions.length === 0 && Boolean(loadingWarehouseUnits[businessUnit]);

      return (
        <Space direction="vertical" size={2} style={{ width: '100%' }}>
          <Select
            showSearch
            placeholder="Select warehouse"
            optionFilterProp="label"
            style={{ width: '100%' }}
            loading={loading}
            value={record.toWarehouseCode || undefined}
            onChange={(value) => updateRow(record.key, { toWarehouseCode: value })}
            options={warehouseOptions.map((warehouse) => ({
              value: warehouse.warehouseCode,
              label: warehouse.warehouseCode,
            }))}
          />
        </Space>
      );
     }
     },
     {
     title: 'For Line',
     dataIndex: ['item', 'productLine'],
     width: 220,
     render: (_text: string, record: RequestRowItem) => (
      <Select
        showSearch
        placeholder="Select line"
        optionFilterProp="label"
        style={{ width: '100%' }}
        loading={lineOptionsLoading}
        value={record.forLine || undefined}
        onChange={(value) => updateRow(record.key, { forLine: value })}
        options={lineOptions}
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
        const availableStock = Number(record.item.stock || 0);
        const exceedsStock = availableStock > 0 && record.quantity > availableStock;
        const isOutOfStock = availableStock <= 0;
        return (
          <div style={{ width: '100%' }}>
            <InputNumber
              min={1}
              value={record.quantity}
              onChange={(val) => handleQuantityChange(record.key, val ?? 0)}
              style={{ width: '100%' }}
            />
            {isOutOfStock ? (
              <Typography.Text type="warning" style={{ fontSize: 12 }}>
                Currently out of stock
              </Typography.Text>
            ) : exceedsStock ? (
              <Typography.Text type="warning" style={{ fontSize: 12 }}>
                Quantity exceed
              </Typography.Text>
            ) : null}
          </div>
        );
      },
    },
    {
      title: 'Purpose',
      width: '15%',
      render: (_: unknown, record: RequestRowItem) => (
        <Input.TextArea
          placeholder="write your purpose here (optional)"
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

  const totalRequestedQty = rows.reduce((sum, row) => sum + Number(row.quantity || 0), 0);

  const modalTitle = (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: 24 }}>
      <Typography.Text strong style={{ fontSize: 16 }}>
        Spare part Request({totalRequestedQty} items)
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
    <>
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
          Remark <span style={{ color: '#ff4d4f' }}>*</span>
        </Typography.Text>
        <Input.TextArea
          rows={3}
          placeholder="write your remark here"
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
      <ValidationPopup
        open={submitPopupOpen}
        title="Submit Request"
        description={`Submit this spare part request with ${totalRequestedQty} item(s)?`}
        confirmText="Submit"
        loading={confirmLoading}
        onCancel={() => setSubmitPopupOpen(false)}
        onConfirm={handleConfirmSubmit}
      />
    </>
  );
};

export default RequestItemModal;
