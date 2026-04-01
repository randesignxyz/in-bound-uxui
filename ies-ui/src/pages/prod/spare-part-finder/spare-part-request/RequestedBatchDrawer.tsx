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
import { useEffect, useMemo, useRef, useState } from 'react';
import type { MyRequestItem, RequestPriority, RequestStatus, SparePartType } from './data';
import SpfDetails from './SpfDetails';
import { useAccess, useModel } from '@umijs/max';
import SparePartImage from './SparePartImage';
import { formatSpfDateTime } from '../shared/dateTime';

const { Title, Text } = Typography;

const formatDateTime = (iso?: string) => {
  if (!iso) return '—';
  return formatSpfDateTime(iso);
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

const getActivityRank = (label?: string): number => {
  const normalized = String(label || '').trim().toLowerCase();

  if (normalized === 'requested') return 1;
  if (normalized === 'approved') return 2;
  if (normalized === 'rejected') return 2;
  if (normalized === 'in progress') return 3;
  if (normalized === 'ready to pick up') return 4;
  if (normalized === 'confirm pick up') return 5;
  if (/^partial pick up #\d+$/i.test(normalized)) return 6;
  if (normalized === 'completed') return 7;
  return 8;
};

const mergeActivities = (
  base: RequestDetailActivity[],
  extra: RequestDetailActivity[] = [],
): RequestDetailActivity[] => {
  const seen = new Set<string>();
  const merged: RequestDetailActivity[] = [];
  const singletonLabels = new Set(['requested', 'approved', 'rejected', 'in progress', 'completed']);

  [...base, ...extra].forEach((activity) => {
    const normalized: RequestDetailActivity = {
      ...activity,
      label: String(activity.label || '').trim(),
      description: String(activity.description || '').trim(),
    };
    const normalizedLabel = normalized.label.toLowerCase();

    if (
      singletonLabels.has(normalizedLabel) &&
      merged.some((item) => String(item.label || '').trim().toLowerCase() === normalizedLabel)
    ) {
      return;
    }

    const key = `${normalized.label}|${normalized.description}|${normalized.date ?? ''}|${normalized.by ?? ''}`;
    if (seen.has(key)) return;
    seen.add(key);
    merged.push(normalized);
  });

  return merged;
};

interface PersistedRequestDrawerState {
  activityLogs?: RequestDetailActivity[];
  quantityOverrides?: Record<string, number>;
  itemMarks?: Record<string, 'deleted' | 'canceled'>;
  editedItems?: Record<string, boolean>;
}

const getPersistedDrawerStateKey = (requestId?: string) =>
  requestId ? `spf-request-drawer:${requestId}` : null;

const readPersistedDrawerState = (requestId?: string): PersistedRequestDrawerState | null => {
  if (typeof window === 'undefined') return null;
  const key = getPersistedDrawerStateKey(requestId);
  if (!key) return null;

  try {
    const raw = window.sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as PersistedRequestDrawerState) : null;
  } catch {
    return null;
  }
};

const writePersistedDrawerState = (
  requestId: string | undefined,
  value: PersistedRequestDrawerState,
) => {
  if (typeof window === 'undefined') return;
  const key = getPersistedDrawerStateKey(requestId);
  if (!key) return;

  try {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage errors
  }
};

export interface RequestDetailLineItem {
  no: number;
  requestLineId?: number;
  image?: string;
  imageId?: string;
  productId: string;
  requestId: string;
  itemName: string;
  requestedQty?: number;
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
  pickupBatches?: PickupBatch[];
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
  const currentUser = useModel('@@initialState');
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
  const resetPersistRef = useRef(false);
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
  const currentActor =
    currentUser.initialState?.currentUser?.login ||
    (access.canSpfApprover ? data.approvedBy : data.requestedBy) ||
    (access.canSpfApprover ? 'Approver' : 'Requester');

  useEffect(() => {
    if (!open) {
      initKeyRef.current = '';
      resetPersistRef.current = false;
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
    setEditingItem(null);
    setEditingQuantity(1);

    const prePickedCount = typeof data.receivedItems === 'number' ? data.receivedItems : 0;
    const seededPicked =
      data.pickupBatches?.flatMap((batch) => batch.items).filter((item) => Number(item.usedQuantity || item.quantityToReturn || 0) > 0) ||
      [];

    const allowHistorySeed =
      data.status === 'ready_to_Pickup' || data.status === 'partial' || data.status === 'completed';

    let nextPickedItems: RequestDetailLineItem[] = [];
    let nextPickupBatches: PickupBatch[] = [];

    if (data.pickupBatches && data.pickupBatches.length > 0) {
      nextPickedItems = seededPicked;
      nextPickupBatches = [...data.pickupBatches].sort((a, b) => a.batchNo - b.batchNo);
    } else if (data.status === 'completed') {
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

    const persistedState = readPersistedDrawerState(data.requestId);

    setPickedItems(nextPickedItems);
    setPickupBatches(nextPickupBatches);
    setQuantityOverrides(persistedState?.quantityOverrides || {});
    setItemMarks(persistedState?.itemMarks || {});
    setEditedItems(persistedState?.editedItems || {});

    const seen = new Set<string>();
    const fallbackLogs: RequestDetailActivity[] = [];
    const pushOnce = (next: RequestDetailActivity) => {
      const normalized: RequestDetailActivity = {
        ...next,
        date: next.date ?? data.requestDate,
        by: next.by?.trim() ? next.by.trim() : undefined,
      };

      const k = `${normalized.label}|${normalized.description}|${normalized.date ?? ''}|${normalized.by ?? ''}`;
      if (seen.has(k)) return;
      seen.add(k);
      fallbackLogs.push(normalized);
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

      if (data.status === 'in-progress') {
        pushOnce({
          label: 'In Progress',
          description: 'Warehouse processing request',
          date: data.requestDate,
          by: data.warehouseBy,
          dot: data.status === 'in-progress' ? 'pending' : 'done',
        });
      }

      if (data.status === 'ready_to_Pickup') {
        pushOnce({
          label: 'Ready to Pick up',
          description: 'Shipment #1 is ready for pick up',
          date: data.requestDate,
          by: data.warehouseBy,
          dot: 'pending',
        });
      }

      if (data.status === 'partial') {
        pushOnce({
          label: 'Confirm Pick up',
          description: 'Requester confirmed pickup',
          date: data.requestDate,
          by: data.requestedBy,
          dot: 'done',
        });
        pushOnce({
          label: 'Partial Pick up #1',
          description: `Picked ${seededPicked.length || data.receivedItems || 0} item(s)`,
          date: data.requestDate,
          by: data.requestedBy,
          dot: 'done',
        });
      }

      if (data.status === 'completed') {
        pushOnce({
          label: 'Confirm Pick up',
          description: 'Requester confirmed pickup',
          date: data.requestDate,
          by: data.requestedBy,
          dot: 'done',
        });
        pushOnce({
          label: 'Completed',
          description: 'Picked up all requested items',
          date: data.requestDate,
          by: data.requestedBy,
          dot: 'done',
        });
      }
    }

    const serverLogs =
      (data.activities || []).length > 0
        ? (data.activities || []).map((activity) => ({
            ...activity,
            date: activity.date ?? data.requestDate,
            by: activity.by?.trim() ? activity.by.trim() : undefined,
          }))
        : fallbackLogs;

    setActivityLogs(mergeActivities(serverLogs, persistedState?.activityLogs || []));
    lastServerStatusRef.current = data.status;
    lastShipmentNoticeRef.current = data.status === 'ready_to_Pickup' && seededPicked.length > 0 ? 1 : 0;
  }, [data.activities, data.items, data.receivedItems, data.requestDate, data.status, data.requestId, open]);

  useEffect(() => {
    if (!open || !data.requestId || resetPersistRef.current) return;

    writePersistedDrawerState(data.requestId, {
      activityLogs,
      quantityOverrides,
      itemMarks,
      editedItems,
    });
  }, [activityLogs, data.requestId, editedItems, itemMarks, open, quantityOverrides]);

  const handleClose = () => {
    resetPersistRef.current = true;
    writePersistedDrawerState(data.requestId, {
      activityLogs,
      quantityOverrides,
      itemMarks,
      editedItems,
    });
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
        by: currentActor,
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
        by: currentActor,
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
      ellipsis: true,
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
      title: 'Requested',
      dataIndex: 'requestedQty',
      align: 'center',
      width: '10%',
      render: (_: unknown, record) => Number(record.requestedQty ?? record.total ?? 0),
    },
    {
      title: 'Approved',
      dataIndex: 'quantityToReturn',
      align: 'center',
      width: '10%',
    },
    {
      title: 'Sent',
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
      title: 'Received',
      align: 'center',
      width: '10%',
      render: (_: unknown, record) => Number(record.usedQuantity || 0),
    },
     ...(access.canSpfApprover ? [
          {
            title: 'Action',
            key: 'approver_action',
            ellipsis: true,
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
    () => activeRequestItems.reduce((sum, item) => sum + (Number(item.usedQuantity) || 0), 0),
    [activeRequestItems],
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
      render: (_: unknown, record) => Number(record.usedQuantity || 0),
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
      requested_date: formatSpfDateTime(data.requestDate),
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
          const nextStatus =
            requestedQtyTotal > 0 && receivedQtyTotal >= requestedQtyTotal ? 'completed' : 'partial';
          setStatusOverride(nextStatus);
          setActivityLogs((prev) => [
            ...prev,
            {
              label: 'Confirm Pick up',
              description: 'Requester confirmed pickup',
              date: new Date().toISOString(),
              by: currentActor,
              dot: 'done',
            },
            {
              label:
                nextStatus === 'partial'
                  ? `Partial Pick up #${Math.max(1, pickupBatches.length)}`
                  : 'Completed',
              description:
                nextStatus === 'partial'
                  ? 'Pickup confirmed for the latest shipment'
                  : 'Pickup confirmed for all issued items',
              date: new Date().toISOString(),
              by: currentActor,
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
          label: 'Completed',
          description: 'Picked up all requested items',
          date: new Date().toISOString(),
          by: currentActor,
          dot: 'done',
        },
      ]);
    } else {
      setStatusOverride(hasMorePickableNow ? 'ready_to_Pickup' : 'partial');
      setActivityLogs((prev) => [
        ...prev,
        {
          label: `Partial Pick up #${nextBatchNo}`,
          description: `Picked ${newlyPicked.length} item(s)`,
          date: new Date().toISOString(),
          by: currentActor,
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
            by: data.warehouseBy,
            dot: 'pending',
          },
        ]);
      }
    }
  }, [data.status, open, pickupBatches.length]);

  const shipmentNoForReady = pickupBatches.length > 0 ? pickupBatches.length + 1 : 1;

  const displayActivityLogs = useMemo(() => {
    let readyCount = 0;
    let partialPickupCount = 0;

    return [...activityLogs]
      .sort((left, right) => {
        const leftTime = new Date(left.date || data.requestDate).getTime();
        const rightTime = new Date(right.date || data.requestDate).getTime();

        if (leftTime !== rightTime) return leftTime - rightTime;
        return getActivityRank(left.label) - getActivityRank(right.label);
      })
      .map((activity) => {
        const rawLabel = String(activity.label || '').trim();
        const normalizedLabel = rawLabel.toLowerCase();
        const parsedBatchNo = parsePickupBatchNo(rawLabel);

        if (normalizedLabel.includes('partial issue')) {
          partialPickupCount += 1;
          return {
            ...activity,
            label: `Partial Pick up #${parsedBatchNo ?? partialPickupCount}`,
          };
        }

        if (normalizedLabel.includes('ready to pick')) {
          readyCount += 1;
          return {
            ...activity,
            label: 'Ready to Pick up',
            description:
              activity.description?.trim() || `Shipment #${readyCount} is ready to pick up`,
          };
        }

        if (normalizedLabel.includes('partial pick up') || /^pick up #\d+$/i.test(rawLabel)) {
          partialPickupCount += 1;
          return {
            ...activity,
            label: `Partial Pick up #${parsedBatchNo ?? partialPickupCount}`,
          };
        }

        if (normalizedLabel.includes('confirm pick')) {
          return {
            ...activity,
            label: 'Confirm Pick up',
          };
        }

        if (normalizedLabel.includes('processing') || normalizedLabel === 'in progress') {
          return {
            ...activity,
            label: 'In Progress',
          };
        }

        if (normalizedLabel === 'completed') {
          return {
            ...activity,
            label: 'Completed',
          };
        }

        if (normalizedLabel === 'requested' || normalizedLabel === 'approved' || normalizedLabel === 'rejected') {
          return activity;
        }

        return activity;
      });
  }, [activityLogs, data.requestDate]);

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
              tableLayout="fixed"
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
        width="60%"
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
                          by: currentActor,
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
                            by: currentActor,
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
                    const hasAnyApprovedQty = lines.some((item) => item.approvedQty > 0);

                    if (!hasAnyApprovedQty) {
                      message.warning('At least one item must have approved quantity greater than 0. Otherwise, reject the request.');
                      return;
                    }

                    if (!onApprove || !data.id) {
                      setStatusOverride('approved');
                      setActivityLogs((prev) => [
                        ...prev,
                        {
                          label: 'Approved',
                          description: 'Request approved',
                          date: new Date().toISOString(),
                          by: currentActor,
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
                            by: currentActor,
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
          <Descriptions.Item label="Priority">{data.priority ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="Total Items">{displayedTotalItems}</Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={statusColorMap[effectiveStatus]} bordered={false}
            >
              {statusLabelMap[effectiveStatus]}
              
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Received Items">{displayedReceivedItems}</Descriptions.Item>
          <Descriptions.Item label="Request Date">{formatSpfDateTime(data.requestDate)}</Descriptions.Item>
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

        <Title level={5} style={{ marginBottom: 8 }}>
          Message
        </Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
          {data.remark?.trim() ? data.remark : '—'}
        </Text>

        <Title level={5} style={{ marginBottom: 16 }}>
          Items
        </Title>
        <Table<RequestDetailLineItem>
          size="small"
          rowKey="no"
          tableLayout="fixed"
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
          style={{ marginBottom: 32 }}
        />

        {pickupCard}
        {partialWaitingCard}

        <Title level={5} style={{ marginBottom: 16 }}>
          Recent Activities
        </Title>
        <Timeline
          style={{ marginBottom: 32 }}
          items={displayActivityLogs.map((a: RequestDetailActivity) => {
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
                    tableLayout="fixed"
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
                      <Text type="secondary">By: {a.by || '-'}</Text>
                    </div>
                    <Text type="secondary">{formatSpfDateTime(a.date)}</Text>
                  </div>
                  {pickupItemsTable}
                </div>
              ),
            };
          })}
        />

        
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
