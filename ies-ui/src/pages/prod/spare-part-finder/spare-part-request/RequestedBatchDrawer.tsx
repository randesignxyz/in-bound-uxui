import {
  Descriptions,
  Drawer,
  Steps,
  Table,
  Tag,
  Timeline,
  Typography,
  Card,
  Button,
  Space,
  message,
  Modal,
  InputNumber,
} from 'antd';
import { DownOutlined, RightOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { MyRequestItem, RequestPriority, RequestStatus, SparePartType } from './data';
import SpfDetails from './SpfDetails';
import { useAccess } from '@umijs/max';
import SparePartImage from './SparePartImage';

const { Title, Text } = Typography;

const formatDateTime = (iso?: string) => {
  if (!iso) return '—';
  const d = dayjs(iso);
  return d.isValid() ? d.format('YYYY-MMM-DD, h:mm A') : String(iso);
};

const STATUS_STEPS = ['Requested', 'Approved', 'In Progress', 'Completed'] as const;

const statusColorMap: Record<RequestStatus, string> = {
  pending: 'default',
  approved: 'warning',
  rejected: 'error',
  'in-progress': 'processing',
  partial: 'gold',
  'ready_to_Pickup': 'success',
  completed: 'success',
};

function statusToCurrentStep(status: RequestStatus): number {
  switch (status) {
    case 'pending':
      return 0;
    case 'approved':
    case 'rejected':
      return 1;
    case 'in-progress':
    case 'partial':
    case 'ready_to_Pickup':
      return 2;
    case 'completed':
      return 3;
    default:
      return 0;
  }
}

const statusLabelMap: Record<RequestStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  'in-progress': 'In Progress',
  partial: 'Partial',
  'ready_to_Pickup': 'Ready to Pick up',
  completed: 'Completed',
};

const parsePickupBatchNo = (label?: string): number | null => {
  const m = String(label || '').match(/(?:partial\s*)?pick\s*up\s*#\s*(\d+)/i);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) && n > 0 ? n : null;
};

const parsePickedItemsCount = (description?: string): number | null => {
  const m = String(description || '').match(/picked\s+(\d+)\s+item/i);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) && n >= 0 ? n : null;
};

export interface RequestDetailLineItem {
  no: number;
  requestLineId?: number;
  image?: string;
  imageId?: string;
  productId: string;
  requestId: string;
  itemName: string;
  quantityToReturn: number;
  usedQuantity: number;
  total: number;
  warehouseSentQuantity?: number;
  description?: string;
  stockQuantity?: number;
  warehouse?: string;
  zone?: string;
  shelf?: string;
  level?: string;
  company?: string;
  category?: string;
  sparePartType?: string;
  businessUnit?: string;
  uom?: string;
}

export interface RequestDetailActivity {
  label: string;
  description: string;
  date?: string;
  by?: string;
  dot?: 'pending' | 'done';
}

interface PickupBatch {
  batchNo: number;
  createdAt: string;
  pickedBy?: string;
  items: RequestDetailLineItem[];
  pickedItemsCount?: number;
}

export interface RequestDetailData {
  id?: number;
  requestId: string;
  requestDate: string;
  status: RequestStatus;
  priority?: RequestPriority;
  type?: SparePartType;
  totalItems: number;
  receivedItems?: number;
  remark?: string;
  requestedBy?: string;
  approvedBy?: string;
  rejectedBy?: string;
  warehouseBy?: string;
  items: RequestDetailLineItem[];
  activities: RequestDetailActivity[];
}

export interface DrawerBatchReturnItemsProps {
  open: boolean;
  request?: MyRequestItem | null;
  data?: RequestDetailData | null;
  onClose?: () => void;
  onApprove?: (payload: {
    id: number;
    lines: Array<{ requestLineId: number; approvedQty: number }>;
  }) => Promise<void>;
  onReject?: (payload: { id: number }) => Promise<void>;
  onConfirmPickup?: (id: number) => Promise<void>;
}

export default function RequestedBatchDrawer({
  open,
  request,
  data: propData,
  onClose,
  onApprove,
  onReject,
  onConfirmPickup,
}: DrawerBatchReturnItemsProps) {
  const [spfOpen, setSpfOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<RequestDetailLineItem | null>(null);
  const [pickedItems, setPickedItems] = useState<RequestDetailLineItem[]>([]);
  const [pickupSelection, setPickupSelection] = useState<string[]>([]);
  const [statusOverride, setStatusOverride] = useState<RequestStatus | null>(null);
  const [pickupBatches, setPickupBatches] = useState<PickupBatch[]>([]);
  const [expandedPickupBatchNos, setExpandedPickupBatchNos] = useState<number[]>([]);
  const [activityLogs, setActivityLogs] = useState<RequestDetailActivity[]>([]);
  const [quantityOverrides, setQuantityOverrides] = useState<Record<string, number>>({});
  const [itemMarks, setItemMarks] = useState<Record<string, 'deleted' | 'canceled'>>({});
  const [editedItems, setEditedItems] = useState<Record<string, boolean>>({});
  const [editingItem, setEditingItem] = useState<RequestDetailLineItem | null>(null);
  const [editingQuantity, setEditingQuantity] = useState<number>(1);
  const lastServerStatusRef = useRef<RequestStatus | null>(null);
  const lastShipmentNoticeRef = useRef<number>(0);
  const initKeyRef = useRef<string>('');
  const access = useAccess();
  const data: RequestDetailData = useMemo(() => {
    if (propData) return propData;

    const fallbackRequest: MyRequestItem = request ?? {
      id: 0,
      requestId: '-',
      priority: 'normal',
      requestDate: new Date().toISOString(),
      totalItems: 0,
      receivedItems: 0,
      requestStatus: 'pending',
      remark: '',
      type: 'MRO-W',
    };

    const items: RequestDetailLineItem[] =
      fallbackRequest.items?.map((item, index) => ({
        no: index + 1,
        requestLineId: item.requestLineId,
        imageId: Array.isArray(item.imageId) ? item.imageId[0] : item.imageId,
        productId: item.sparePartId || item.sparePartCode,
        requestId: fallbackRequest.requestId,
        itemName: item.sparePartName,
        quantityToReturn: Number(item.approvedQty || item.requestedQty || 0),
        usedQuantity: 0,
        total: Number(item.requestedQty || 0),
        warehouseSentQuantity: 0,
        warehouse: item.toWarehouseCode || fallbackRequest.type,
        sparePartType: fallbackRequest.type,
        businessUnit: item.unit,
        uom: item.unit,
        description: item.remark,
      })) ||
      [];

    return {
      id: fallbackRequest.id,
      requestId: fallbackRequest.requestId,
      requestDate: fallbackRequest.requestDate,
      status: fallbackRequest.requestStatus,
      priority: fallbackRequest.priority,
      type: fallbackRequest.type,
      totalItems: fallbackRequest.totalItems,
      receivedItems: fallbackRequest.receivedItems,
      remark: fallbackRequest.remark,
      requestedBy: fallbackRequest.requestedBy,
      items,
      activities: [],
    };
  }, [propData, request]);

  const effectiveStatus: RequestStatus = useMemo(() => {
    if (statusOverride) return statusOverride;

    const total = Number(data.totalItems ?? 0);
    const received = Number(data.receivedItems ?? 0);
    if (total > 0 && received >= total) return 'completed';

    return data.status;
  }, [data.receivedItems, data.status, data.totalItems, statusOverride]);
  const currentStep = statusToCurrentStep(effectiveStatus);

  useEffect(() => {
    if (!open) {
      initKeyRef.current = '';
      return;
    }

    const initKey = `${open ? '1' : '0'}|${data.requestId}`;
    if (initKeyRef.current === initKey) return;
    initKeyRef.current = initKey;

    setSpfOpen(false);
    setSelectedProduct(null);
    setPickupSelection([]);
    setStatusOverride(null);
    setExpandedPickupBatchNos([]);
    setQuantityOverrides({});
    setItemMarks({});
    setEditedItems({});
    setEditingItem(null);
    setEditingQuantity(1);

    const prePickedCount = typeof data.receivedItems === 'number' ? data.receivedItems : 0;
    const seededPicked =
      prePickedCount > 0 ? data.items.slice(0, Math.min(data.items.length, prePickedCount)) : [];

    const allowHistorySeed =
      data.status === 'ready_to_Pickup' || data.status === 'partial' || data.status === 'completed';

    let nextPickedItems: RequestDetailLineItem[] = [];
    let nextPickupBatches: PickupBatch[] = [];

    if (data.status === 'completed') {
      nextPickedItems = data.items;
      nextPickupBatches = [
        {
          batchNo: 1,
          createdAt: data.requestDate,
          pickedBy: data.requestedBy ?? 'Requester',
          items: data.items,
        },
      ];
    } else {
      nextPickedItems = allowHistorySeed && seededPicked.length > 0 ? seededPicked : [];

      if (allowHistorySeed) {
        const byBatchNo = new Map<number, PickupBatch>();
        (data.activities || []).forEach((a) => {
          const batchNo = parsePickupBatchNo(a?.label);
          if (!batchNo) return;
          if (byBatchNo.has(batchNo)) return;
          const pickedItemsCount = parsePickedItemsCount(a?.description);
          byBatchNo.set(batchNo, {
            batchNo,
            createdAt: a.date ?? data.requestDate,
            pickedBy: a.by ?? data.requestedBy ?? 'Requester',
            items: [],
            pickedItemsCount: pickedItemsCount ?? undefined,
          });
        });

        nextPickupBatches = Array.from(byBatchNo.values()).sort((a, b) => a.batchNo - b.batchNo);
      }

      if (nextPickupBatches.length === 0 && allowHistorySeed && seededPicked.length > 0) {
        nextPickupBatches = [
          {
            batchNo: 1,
            createdAt: data.requestDate,
            pickedBy: data.requestedBy ?? 'Requester',
            items: seededPicked,
            pickedItemsCount: seededPicked.length,
          },
        ];
      }

      if (nextPickupBatches.length === 0 && data.status === 'partial') {
        nextPickupBatches = [
          {
            batchNo: 1,
            createdAt: data.requestDate,
            pickedBy: data.requestedBy ?? 'Requester',
            items: seededPicked,
            pickedItemsCount: seededPicked.length || undefined,
          },
        ];
      }

      if (seededPicked.length > 0) {
        nextPickupBatches = nextPickupBatches.map((b) =>
          b.batchNo === 1 && b.items.length === 0
            ? { ...b, items: seededPicked, pickedItemsCount: seededPicked.length }
            : b,
        );
      }
    }

    setPickedItems(nextPickedItems);
    setPickupBatches(nextPickupBatches);

    const seen = new Set<string>();
    const logs: RequestDetailActivity[] = [];
    const pushOnce = (next: RequestDetailActivity) => {
      const normalized: RequestDetailActivity = {
        ...next,
        date: next.date ?? data.requestDate,
        by: next.by ?? 'System',
      };

      const k = `${normalized.label}|${normalized.description}|${normalized.date ?? ''}|${normalized.by ?? ''}`;
      if (seen.has(k)) return;
      seen.add(k);
      logs.push(normalized);
    };

    pushOnce({
      label: 'Requested',
      description: 'Requester sent request (waiting for approval)',
      date: data.requestDate,
      by: data.requestedBy ?? 'Requester',
      dot: 'done',
    });

    if (data.status === 'rejected') {
      pushOnce({
        label: 'Rejected',
        description: 'Request rejected',
        date: data.requestDate,
        by: data.rejectedBy ?? data.approvedBy ?? 'Approver',
        dot: 'done',
      });
    } else {
      if (data.status !== 'pending') {
        pushOnce({
          label: 'Approved',
          description: 'Request approved',
          date: data.requestDate,
          by: data.approvedBy ?? 'Approver',
          dot: 'done',
        });
      }

      if (
        data.status === 'in-progress' ||
        data.status === 'ready_to_Pickup' ||
        data.status === 'partial' ||
        data.status === 'completed'
      ) {
        pushOnce({
          label: 'In Progress',
          description: 'Warehouse processing request',
          date: data.requestDate,
          by: data.warehouseBy ?? 'Warehouse',
          dot: data.status === 'in-progress' ? 'pending' : 'done',
        });
      }

      if (data.status === 'ready_to_Pickup' || data.status === 'partial' || data.status === 'completed') {
        pushOnce({
          label: 'Ready to Pick up',
          description: 'Shipment #1 is ready for pick up',
          date: data.requestDate,
          by: data.warehouseBy ?? 'Warehouse',
          dot: data.status === 'ready_to_Pickup' ? 'pending' : 'done',
        });
      }

      if (seededPicked.length > 0 && (data.status === 'partial' || data.status === 'ready_to_Pickup' || data.status === 'completed')) {
        pushOnce({
          label: 'Partial Pick up #1',
          description: `Picked ${seededPicked.length} item(s)`,
          date: data.requestDate,
          by: data.requestedBy ?? 'Requester',
          dot: 'done',
        });

        if (data.status === 'ready_to_Pickup') {
          pushOnce({
            label: 'Ready to Pick up',
            description: 'Shipment #2 is ready for pick up',
            date: data.requestDate,
            by: data.warehouseBy ?? 'Warehouse',
            dot: 'pending',
          });
        }
      }

      if (data.status === 'completed') {
        pushOnce({
          label: 'Completed',
          description: 'Picked up all requested items',
          date: data.requestDate,
          by: data.requestedBy ?? 'Requester',
          dot: 'done',
        });
      }
    }

    // append backend/activity logs that aren't already in our generated list
    (data.activities || []).forEach((a) => {
      const label = String(a?.label || '').toLowerCase();
      const description = String(a?.description || '');

      // avoid confusing generic logs that duplicate our status timeline
      if (label === 'processing' && /status updated/i.test(description)) return;
      if (label === 'requested' && /request created/i.test(description)) return;

      const byFallback =
        label.includes('approve')
          ? data.approvedBy ?? 'Approver'
          : label.includes('reject')
            ? data.rejectedBy ?? 'Approver'
            : label.includes('ready') || label.includes('warehouse') || label.includes('progress')
              ? data.warehouseBy ?? 'Warehouse'
              : label.includes('pick')
                ? data.requestedBy ?? 'Requester'
                : data.requestedBy ?? 'System';

      pushOnce({
        ...a,
        by: a.by ?? byFallback,
        date: a.date ?? data.requestDate,
      });
    });

    setActivityLogs(logs);
    lastServerStatusRef.current = data.status;
    lastShipmentNoticeRef.current = data.status === 'ready_to_Pickup' && seededPicked.length > 0 ? 2 : 1;
  }, [data.activities, data.items, data.receivedItems, data.requestDate, data.status, data.requestId, open]);

  const handleClose = () => {
    setSpfOpen(false);
    setSelectedProduct(null);
    setPickupSelection([]);
    setStatusOverride(null);
    setPickedItems([]);
    setPickupBatches([]);
    setExpandedPickupBatchNos([]);
    setActivityLogs([]);
    setQuantityOverrides({});
    setItemMarks({});
    setEditedItems({});
    setEditingItem(null);
    setEditingQuantity(1);
    lastServerStatusRef.current = null;
    lastShipmentNoticeRef.current = 0;
    initKeyRef.current = '';
    onClose?.();
  };

  const canEditOrDelete = effectiveStatus === 'pending';
  const canCancel =
    effectiveStatus === 'approved' ||
    effectiveStatus === 'ready_to_Pickup' ||
    effectiveStatus === 'partial';

  const requestItems = useMemo(
    () =>
      data.items.map((it) => ({
        ...it,
        quantityToReturn: quantityOverrides[it.productId] ?? it.quantityToReturn,
      })),
    [data.items, quantityOverrides],
  );

  const activeRequestItems = useMemo(
    () => requestItems.filter((it) => !itemMarks[it.productId]),
    [itemMarks, requestItems],
  );

  const availablePickupQty = (record: RequestDetailLineItem, status: RequestStatus): number => {
    if (typeof record.warehouseSentQuantity === 'number') return record.warehouseSentQuantity;
    if (status === 'in-progress') return 0;
    return Number(record.quantityToReturn) || 0;
  };

  const hasAnyPickupAvailable = useMemo(() => {
    if (effectiveStatus === 'ready_to_Pickup') return true;
    if (effectiveStatus !== 'in-progress') return false;
    return activeRequestItems.some((it) => availablePickupQty(it, effectiveStatus) > 0);
  }, [activeRequestItems, effectiveStatus]);

  const pickedProductIds = useMemo(() => new Set(pickedItems.map((it) => it.productId)), [pickedItems]);
  const remainingItems = useMemo(
    () => activeRequestItems.filter((it) => !pickedProductIds.has(it.productId)),
    [activeRequestItems, pickedProductIds],
  );

  const requestedQtyTotal = useMemo(
    () => activeRequestItems.reduce((sum, it) => sum + (Number(it.quantityToReturn) || 0), 0),
    [activeRequestItems],
  );

  const receivedQtyTotal = useMemo(
    () => pickedItems.reduce((sum, it) => sum + (Number(it.quantityToReturn) || 0), 0),
    [pickedItems],
  );

  const openEditQuantity = (record: RequestDetailLineItem) => {
    setEditingItem(record);
    setEditingQuantity(Math.max(1, Number(record.quantityToReturn) || 1));
  };

  const confirmEditQuantity = () => {
    if (!editingItem) return;
    const productId = editingItem.productId;
    const nextQty = Math.max(1, Number(editingQuantity) || 1);

    setQuantityOverrides((prev) => ({
      ...prev,
      [productId]: nextQty,
    }));
    setEditedItems((prev) => ({
      ...prev,
      [productId]: true,
    }));
    setActivityLogs((prev) => [
      ...prev,
      {
        label: 'Item Edited',
        description: `${productId} requested quantity updated to ${nextQty}`,
        date: new Date().toISOString(),
        by: data.requestedBy ?? 'Requester',
        dot: 'done',
      },
    ]);
    setEditingItem(null);
    message.success(`Updated requested quantity for ${productId} to ${nextQty}.`);
  };

  const confirmDeleteItem = (record: RequestDetailLineItem) => {
    Modal.confirm({
      title: 'Delete this item?',
      content: `Are you sure to delete ${record.productId}? This will mark the item as deleted.`,
      okText: 'Yes, Delete',
      cancelText: 'No',
      okButtonProps: { danger: true },
      onOk: () => {
        markItem(record, 'deleted');
      },
    });
  };

  const confirmCancelItem = (record: RequestDetailLineItem) => {
    Modal.confirm({
      title: 'Cancel this item?',
      content: `Are you sure to cancel ${record.productId}? This will mark the item as canceled.`,
      okText: 'Yes, Cancel',
      cancelText: 'No',
      onOk: () => {
        markItem(record, 'canceled');
      },
    });
  };

  const markItem = (record: RequestDetailLineItem, mark: 'deleted' | 'canceled') => {
    if (itemMarks[record.productId]) return;

    setItemMarks((prev) => ({
      ...prev,
      [record.productId]: mark,
    }));

    // Keep pickup selection and picked state consistent when an item is marked.
    setPickupSelection((prev) => prev.filter((id) => id !== record.productId));
    setPickedItems((prev) => prev.filter((it) => it.productId !== record.productId));

    setActivityLogs((prev) => [
      ...prev,
      {
        label: mark === 'deleted' ? 'Item Deleted' : 'Item Canceled',
        description: `${record.productId} (${record.itemName}) was ${mark}`,
        date: new Date().toISOString(),
        by: data.requestedBy ?? 'Requester',
        dot: 'done',
      },
    ]);

    message.success(
      mark === 'deleted'
        ? `${record.productId} marked as deleted.`
        : `${record.productId} marked as canceled.`,
    );
  };

  const columns: ColumnsType<RequestDetailLineItem> = [
    { title: 'No', dataIndex: 'no', key: 'no', width: 56 },
    {
      title: 'Image',
      dataIndex: 'image',
      key: 'image',
      width: 80,
      render: (_, record) => (
        <SparePartImage
          imageId={record.imageId}
          src={record.image}
          alt={record.itemName || record.productId}
        />
      ),
    },
    {
      title: 'Product ID',
      dataIndex: 'productId',
      render: (_: unknown, record) => {
        const mark = itemMarks[record.productId];
        const isEdited = Boolean(editedItems[record.productId]);
        const content = mark ? (
          <Text delete={mark === 'deleted'} type={mark === 'deleted' ? 'danger' : 'secondary'}>
            {record.productId}
          </Text>
        ) : (
          <Typography.Link
            onClick={(event) => {
              event.preventDefault();
              setSelectedProduct(record);
              setSpfOpen(true);
            }}
          >
            {record.productId}
          </Typography.Link>
        );

        return (
          <Space size={6}>
            {content}
            {mark ? (
              <Tag color={mark === 'deleted' ? 'red' : 'gold'} bordered={false}>
                {mark === 'deleted' ? 'Deleted' : 'Canceled'}
              </Tag>
            ) : isEdited ? (
              <Tag color="blue" bordered={false}>
                Edited
              </Tag>
            ) : null}
          </Space>
        );
      },
    },
    {
      title: 'Item Name',
      dataIndex: 'itemName',
      ellipsis: true,
      render: (_: unknown, record) => {
        const mark = itemMarks[record.productId];
        const isEdited = Boolean(editedItems[record.productId]);
        return (
          <Text
            delete={mark === 'deleted'}
            type={mark === 'deleted' ? 'danger' : mark === 'canceled' ? 'secondary' : isEdited ? 'warning' : undefined}
          >
            {record.itemName}
          </Text>
        );
      },
    },
    {  
       title: 'UoM',
        dataIndex: 'uom',
        key: 'UoM',
        ellipsis: true,
        width: '10%',
    },
    {
      title: 'Qty Requested',
      dataIndex: 'quantityToReturn',
      align: 'center',
      width: '10%',
    },
    {
      title: 'Qty Sent',
      align: 'center',
      width: '10%',
      render: (_: unknown, record) =>
        effectiveStatus === 'ready_to_Pickup' || effectiveStatus === 'partial' || effectiveStatus === 'completed'
          ? record.warehouseSentQuantity ?? record.quantityToReturn
          : effectiveStatus === 'in-progress'
            ? record.warehouseSentQuantity ?? 0
            : 0,
    },
    {
      title: 'Qty Received',
      align: 'center',
      width: '10%',
      render: (_: unknown, record) => (pickedProductIds.has(record.productId) ? record.quantityToReturn : 0),
    },
     ...(access.canSpfApprover ? [
          {
            title: 'Action',
            key: 'approver_action',
            fixed: 'right' as const,
            render: (_: unknown, record: RequestDetailLineItem) => {
              const marked = itemMarks[record.productId];
              const isPicked = pickedProductIds.has(record.productId);

              if (marked) {
                return <Text type="secondary">{marked === 'deleted' ? 'Deleted' : 'Canceled'}</Text>;
              }

              if (canEditOrDelete) {
                return (
                  <Space size="small">
                    <Button type="link" onClick={() => openEditQuantity(record)}>
                      Edit Amount
                    </Button>
                    <Button
                      danger
                      type="link"
                      onClick={() => {
                        confirmDeleteItem(record);
                      }}
                    >
                      Delete
                    </Button>
                  </Space>
                );
              }

              if (canCancel) {
                return (
                  <Button
                    type="link"
                    disabled={isPicked}
                    onClick={() => {
                      confirmCancelItem(record);
                    }}
                  >
                    Cancel
                  </Button>
                );
              }

              return <Text type="secondary">-</Text>;
            },
          }
      ]:[])
  ];

  const displayedTotalItems = activeRequestItems.length;

  const displayedReceivedItems = useMemo(
    () => pickedItems.filter((it) => !itemMarks[it.productId]).length,
    [itemMarks, pickedItems],
  );

  const columnsForPickupTable: ColumnsType<RequestDetailLineItem> = [
    { title: 'Product ID', dataIndex: 'productId' },
    { title: 'Item Name', dataIndex: 'itemName', ellipsis: true },
    {
      title: 'Qty Sent',
      align: 'right' as const,
      render: (_: unknown, record) => availablePickupQty(record, effectiveStatus),
    },
    {
      title: 'Qty Received',
      align: 'right' as const,
      render: (_: unknown, record) =>
        pickedProductIds.has(record.productId) ? record.quantityToReturn : 0,
    },
  ];

  const spfData = useMemo(() => {
    if (!selectedProduct) return undefined;
    return {
      image: selectedProduct.image,
      imageId: selectedProduct.imageId,
      spare_part_name: selectedProduct.itemName,
      part_number: selectedProduct.productId,
      description: selectedProduct.description,
      stock_quantity: selectedProduct.stockQuantity,
      receiving_from_warehouse: selectedProduct.warehouse,
      zone: selectedProduct.zone,
      shelf: selectedProduct.shelf,
      level: selectedProduct.level,
      company: selectedProduct.company,
      category: selectedProduct.category,
      spare_part_type: selectedProduct.sparePartType,
      business_unit: selectedProduct.businessUnit,
      requested_date: formatDateTime(data.requestDate),
    };
  }, [data.requestDate, selectedProduct]);

  // const receivedItemsDisplay = useMemo(() => {
  //   if (pickedItems.length > 0 || statusOverride) return `${receivedQtyTotal} / ${requestedQtyTotal}`;
  //   return formatDateTime(data.receivedItems) ?? '—';
  // }, [data.receivedItems, pickedItems.length, receivedQtyTotal, requestedQtyTotal, statusOverride]);

  const confirmPickup = () => {
    if (onConfirmPickup && data.id) {
      onConfirmPickup(data.id)
        .then(() => {
          setStatusOverride(effectiveStatus === 'partial' ? 'partial' : 'completed');
          setActivityLogs((prev) => [
            ...prev,
            {
              label: effectiveStatus === 'partial' ? 'Partial Pick up' : 'Completed',
              description:
                effectiveStatus === 'partial'
                  ? 'Pickup confirmed for the latest shipment'
                  : 'Pickup confirmed for all issued items',
              date: new Date().toISOString(),
              by: data.requestedBy ?? 'Requester',
              dot: 'done',
            },
          ]);
          message.success('Pickup confirmed successfully.');
        })
        .catch(() => {
          message.error('Failed to confirm pickup.');
        });
      return;
    }

    if (!pickupSelection.length) return;

    const selected = new Set(pickupSelection);
    const newlyPicked = remainingItems.filter((it) => selected.has(it.productId));
    if (newlyPicked.length === 0) return;
    const nextPicked = [...pickedItems, ...newlyPicked];
    const nextPickedIds = new Set(nextPicked.map((it) => it.productId));

    setPickedItems(nextPicked);
    setPickupSelection([]);

    const nextBatchNo = pickupBatches.length + 1;
    setPickupBatches((prev) => [
      ...prev,
      {
        batchNo: nextBatchNo,
        createdAt: new Date().toISOString(),
        pickedBy: data.requestedBy ?? 'Requester',
        items: newlyPicked,
      },
    ]);

    const nextReceivedQtyTotal = nextPicked.reduce((sum, it) => sum + (Number(it.quantityToReturn) || 0), 0);
    const hasMorePickableNow = activeRequestItems.some(
      (it) => !nextPickedIds.has(it.productId) && availablePickupQty(it, effectiveStatus) > 0,
    );

    if (nextReceivedQtyTotal >= requestedQtyTotal && requestedQtyTotal > 0) {
      setStatusOverride('completed');
      setActivityLogs((prev) => [
        ...prev,
        {
          label: `Pick up #${nextBatchNo}`,
          description: `Picked ${newlyPicked.length} item(s)`,
          date: new Date().toISOString(),
          by: data.requestedBy ?? 'Requester',
          dot: 'done',
        },
        {
          label: 'Completed',
          description: 'Picked up all requested items',
          date: new Date().toISOString(),
          by: data.requestedBy ?? 'Requester',
          dot: 'done',
        },
      ]);
    } else {
      setStatusOverride(hasMorePickableNow ? 'ready_to_Pickup' : 'partial');
      setActivityLogs((prev) => [
        ...prev,
        {
          label: `${hasMorePickableNow ? 'Pick up' : 'Partial Pick up'} #${nextBatchNo}`,
          description: `Picked ${newlyPicked.length} item(s)`,
          date: new Date().toISOString(),
          by: data.requestedBy ?? 'Requester',
          dot: 'done',
        },
      ]);
    }
  };

  useEffect(() => {
    if (!open) return;

    const prev = lastServerStatusRef.current;
    if (prev === data.status) return;
    lastServerStatusRef.current = data.status;

    const hasHistory = pickupBatches.length > 0;
    if (data.status === 'ready_to_Pickup' && hasHistory) {
      const shipmentNo = pickupBatches.length + 1;
      if (lastShipmentNoticeRef.current !== shipmentNo) {
        lastShipmentNoticeRef.current = shipmentNo;
        message.info(`New items are ready to pick up (Shipment #${shipmentNo}).`);
        setActivityLogs((logs) => [
          ...logs,
          {
            label: 'Ready to Pick up',
            description: `Shipment #${shipmentNo} is ready for pick up`,
            date: new Date().toISOString(),
            by: data.warehouseBy ?? 'Warehouse',
            dot: 'pending',
          },
        ]);
      }
    }
  }, [data.status, open, pickupBatches.length]);

  const shipmentNoForReady = pickupBatches.length > 0 ? pickupBatches.length + 1 : 1;

  const pickupCard =
    hasAnyPickupAvailable ? (
      <Card
        size="small"
        style={{ marginBottom: 24 }}
        title={`Ready to Pick up (Shipment #${shipmentNoForReady})`}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <Text type="secondary">
              Warehouse sent items ({remainingItems.length} remaining / {activeRequestItems.length} total)
            </Text>
            <Table<RequestDetailLineItem>
              size="small"
              rowKey="productId"
              pagination={false}
              style={{ marginTop: 8 }}
              rowSelection={{
                selectedRowKeys: pickupSelection,
                onChange: (keys) => setPickupSelection((keys || []).map((k) => String(k))),
                getCheckboxProps: (record) => ({
                  disabled:
                    pickedProductIds.has(record.productId) ||
                    Boolean(itemMarks[record.productId]) ||
                    availablePickupQty(record, effectiveStatus) <= 0,
                }),
              }}
              dataSource={activeRequestItems}
              columns={columnsForPickupTable}
            />
          </div>

          <Button
            type="primary"
            disabled={pickupSelection.length === 0}
            onClick={confirmPickup}
            style={{ alignSelf: 'flex-end' }}
          >
            Confirm Pick up
          </Button>
        </Space>
      </Card>
    ) : null;

  const partialWaitingCard =
    effectiveStatus === 'partial' ? (
      <Card
        size="small"
        style={{ marginBottom: 24 }}
        title="Partial (waiting next shipment)"
        extra={
          <Tag color={statusColorMap['in-progress']} bordered={false}>
            In Progress
          </Tag>
        }
      >
        <Text type="secondary">
          Warehouse has sent some items, but the next batch is not ready for pick up yet. Please wait until status changes to{' '}
          <Text strong>Ready to Pick up</Text>.
        </Text>
      </Card>
    ) : null;

  return (
    <>
      <Drawer
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Request Details</span>
          </div>
        }
        width="80%"
        placement="right"
        onClose={handleClose}
        open={open}
        bodyStyle={{ padding: 16, backgroundColor: '#fafafa' }}
        headerStyle={{ borderBottom: '1px solid #f0f0f0' }}
      >
        {
          access.canSpfApprover && effectiveStatus === 'pending' && (
            <div style={{ marginBottom: 24, textAlign: 'right' }}>
              <Space>
                <Button
                  danger
                  onClick={() => {
                    if (!onReject || !data.id) {
                      setStatusOverride('rejected');
                      setActivityLogs((prev) => [
                        ...prev,
                        {
                          label: 'Rejected',
                          description: 'Request rejected',
                          date: new Date().toISOString(),
                          by: data.approvedBy ?? 'Approver',
                          dot: 'done',
                        },
                      ]);
                      return;
                    }

                    onReject({ id: data.id })
                      .then(() => {
                        setStatusOverride('rejected');
                        setActivityLogs((prev) => [
                          ...prev,
                          {
                            label: 'Rejected',
                            description: 'Request rejected',
                            date: new Date().toISOString(),
                            by: data.approvedBy ?? 'Approver',
                            dot: 'done',
                          },
                        ]);
                        message.success('Request rejected successfully.');
                      })
                      .catch(() => {
                        message.error('Failed to reject request.');
                      });
                  }}
                >
                  Reject
                </Button>
                <Button
                  type="primary"
                  onClick={() => {
                    const lines = activeRequestItems
                      .filter((item) => typeof item.requestLineId === 'number')
                      .map((item) => ({
                        requestLineId: Number(item.requestLineId),
                        approvedQty: Number(item.quantityToReturn || 0),
                      }));

                    if (!onApprove || !data.id) {
                      setStatusOverride('approved');
                      setActivityLogs((prev) => [
                        ...prev,
                        {
                          label: 'Approved',
                          description: 'Request approved',
                          date: new Date().toISOString(),
                          by: data.approvedBy ?? 'Approver',
                          dot: 'done',
                        },
                      ]);
                      return;
                    }

                    onApprove({ id: data.id, lines })
                      .then(() => {
                        setStatusOverride('approved');
                        setActivityLogs((prev) => [
                          ...prev,
                          {
                            label: 'Approved',
                            description: 'Request approved',
                            date: new Date().toISOString(),
                            by: data.approvedBy ?? 'Approver',
                            dot: 'done',
                          },
                        ]);
                        message.success('Request approved successfully.');
                      })
                      .catch(() => {
                        message.error('Failed to approve request.');
                      });
                  }}
                >
                  Approve
                </Button>
              </Space>
            </div>
          )
        }
        <Descriptions
          column={3}
          size="small"
          style={{ marginBottom: 24 }}
          labelStyle={{ textAlign: 'center', fontWeight: 'bolder' }}
          contentStyle={{ textAlign: 'center' }}
        >
          <Descriptions.Item label="No">{data.id ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="Request ID">{data.requestId}</Descriptions.Item>
          <Descriptions.Item label="Type">{data.type ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="Request Date">{formatDateTime(data.requestDate)}</Descriptions.Item>
          <Descriptions.Item label="Priority">{data.priority ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={statusColorMap[effectiveStatus]} bordered={false}
            >
              {statusLabelMap[effectiveStatus]}
              
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Total Items">{displayedTotalItems}</Descriptions.Item>
          <Descriptions.Item label="Received Items">{displayedReceivedItems}</Descriptions.Item>
        </Descriptions>

        <Title level={5} style={{ marginBottom: 16 }}>
          Status Timeline
        </Title>
        <Steps
          current={currentStep}
          size="default"
          style={{ marginBottom: 32 }}
          items={STATUS_STEPS.map((title, index) => ({
            title,
            status:
              effectiveStatus === 'rejected' && index === 1
                ? 'error'
                : index < currentStep
                  ? 'finish'
                  : index === currentStep
                    ? 'process'
                    : 'wait',
          }))}
        />

        <Title level={5} style={{ marginBottom: 16 }}>
          Items
        </Title>
        <Table<RequestDetailLineItem>
          size="small"
          rowKey="no"
          pagination={false}
          columns={columns}
          dataSource={requestItems}
          onRow={(record) => {
            const mark = itemMarks[record.productId];
            const isEdited = Boolean(editedItems[record.productId]);
            if (mark === 'deleted') {
              return { style: { backgroundColor: '#fff1f0' } };
            }
            if (mark === 'canceled') {
              return { style: { backgroundColor: '#fffbe6' } };
            }
            if (isEdited) {
              return { style: { backgroundColor: '#e6f7ff' } };
            }
            return {};
          }}
          scroll={{ x: 700 }}
          style={{ marginBottom: 32 }}
        />

        {pickupCard}
        {partialWaitingCard}

        <Title level={5} style={{ marginBottom: 16 }}>
          Recent Activities
        </Title>
        <Timeline
          style={{ marginBottom: 32 }}
          items={activityLogs.map((a: RequestDetailActivity) => {
            const pickupBatchNo = parsePickupBatchNo(a.label);
            const pickupBatch =
              typeof pickupBatchNo === 'number'
                ? pickupBatches.find((b) => b.batchNo === pickupBatchNo)
                : undefined;

            const isExpandable = Boolean(pickupBatchNo && pickupBatch && pickupBatch.items.length > 0);
            const isExpanded = Boolean(pickupBatchNo) && expandedPickupBatchNos.includes(Number(pickupBatchNo));

            const toggleExpanded = () => {
              if (!pickupBatchNo) return;
              const batchNo = Number(pickupBatchNo);
              setExpandedPickupBatchNos((prev) => {
                if (prev.includes(batchNo)) return prev.filter((n) => n !== batchNo);
                return [...prev, batchNo].sort((x, y) => x - y);
              });
            };

            const pickupItemsTable =
              isExpandable && isExpanded && pickupBatch ? (
                <div style={{ marginTop: 8 }}>
                  <Table<RequestDetailLineItem>
                    size="small"
                    rowKey="productId"
                    pagination={false}
                    dataSource={pickupBatch.items}
                    columns={[
                      { title: 'Product ID', dataIndex: 'productId' },
                      { title: 'Item Name', dataIndex: 'itemName', ellipsis: true },
                      { title: 'Qty', dataIndex: 'quantityToReturn', align: 'right' as const },
                    ]}
                  />
                </div>
              ) : null;

            return {
              color: a.dot === 'pending' ? 'gray' : 'blue',
              children: (
                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 8,
                      cursor: isExpandable ? 'pointer' : undefined,
                    }}
                    onClick={isExpandable ? toggleExpanded : undefined}
                    role={isExpandable ? 'button' : undefined}
                    aria-expanded={isExpandable ? isExpanded : undefined}
                  >
                    <div>
                      <Text strong>
                        {isExpandable ? (
                          <span style={{ marginRight: 6, color: '#8c8c8c' }}>
                            {isExpanded ? <DownOutlined /> : <RightOutlined />}
                          </span>
                        ) : null}
                        {a.label}
                      </Text>
                      <br />
                      <Text type="secondary">{a.description}</Text>
                      <br />
                      <Text type="secondary">By: {a.by || 'System'}</Text>
                    </div>
                    <Text type="secondary">{formatDateTime(a.date)}</Text>
                  </div>
                  {pickupItemsTable}
                </div>
              ),
            };
          })}
        />

        <Title level={5} style={{ marginBottom: 8 }}>
          Message
        </Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
          {data.remark?.trim() ? data.remark : '—'}
        </Text>
      </Drawer>

      <SpfDetails
        open={open && spfOpen}
        data={spfData}
        onClose={() => {
          setSpfOpen(false);
          setSelectedProduct(null);
        }}
      />

      <Modal
        title="Edit Requested Amount"
        open={Boolean(editingItem)}
        onCancel={() => setEditingItem(null)}
        onOk={confirmEditQuantity}
        okText="Save"
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text>
            Product: <Text strong>{editingItem?.productId}</Text>
          </Text>
          <InputNumber
            min={1}
            style={{ width: '100%' }}
            value={editingQuantity}
            onChange={(value) => setEditingQuantity(Math.max(1, Number(value) || 1))}
          />
        </Space>
      </Modal>
    </>
  );
}
