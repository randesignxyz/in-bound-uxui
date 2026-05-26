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
import { DeleteOutlined, DownOutlined, EditOutlined, RightOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { MyRequestItem, RequestPriority, RequestStatus } from './data';
import SpfDetails from './SpfDetails';
import { useAccess, useModel } from '@umijs/max';
import SparePartImage from './SparePartImage';
import { formatSpfDateTime } from '../shared/dateTime';
import ValidationPopup from './validatePopup';
import { SparePartRequestAPI } from './service.api';
import { simpleRequestActions } from '@/services/model';

const { Title, Text } = Typography;

const toDisplayText = (value: unknown): string | undefined => {
  if (value === null || value === undefined) return undefined;
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return toDisplayText(record.category_name ?? record.name ?? record.label ?? record.id);
  }
  return undefined;
};

const normalizeLineItem = (item: RequestDetailLineItem, index: number): RequestDetailLineItem => ({
  ...item,
  no: Number(item.no || index + 1),
  productId: toDisplayText(item.productId) || '',
  requestId: toDisplayText(item.requestId) || '',
  itemName: toDisplayText(item.itemName) || '',
  description: toDisplayText(item.description),
  fromWarehouse: toDisplayText(item.fromWarehouse),
  toWarehouse: toDisplayText(item.toWarehouse),
  productionLine: toDisplayText(item.productionLine),
  warehouse: toDisplayText(item.warehouse),
  zone: toDisplayText(item.zone),
  shelf: toDisplayText(item.shelf),
  level: toDisplayText(item.level),
  company: toDisplayText(item.company),
  category: toDisplayText(item.category),
  businessUnit: toDisplayText(item.businessUnit),
  uom: toDisplayText(item.uom),
});

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
  if (normalized === 'item rejected') return 2;
  if (normalized === 'approved') return 3;
  if (normalized === 'rejected') return 3;
  if (normalized === 'item edited') return 3;
  if (normalized === 'in progress') return 3;
  if (normalized === 'draft updated') return 4;
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

const isLocalPersistedActivity = (activity?: RequestDetailActivity | null): boolean => {
  const normalized = String(activity?.label || '').trim().toLowerCase();
  return (
    normalized === 'item edited' ||
    normalized === 'item deleted' ||
    normalized === 'item canceled' ||
    normalized === 'item rejected'
  );
};

interface PersistedRequestDrawerState {
  activityLogs?: RequestDetailActivity[];
  quantityOverrides?: Record<string, number>;
  itemMarks?: Record<string, 'deleted' | 'canceled' | 'rejected'>;
  itemRejectRemarks?: Record<string, string>;
  editedItems?: Record<string, boolean>;
  editedAtByRequestLineId?: Record<string, string>;
}

const getPersistedDrawerStateKey = (requestId?: string) =>
  requestId ? `spf-request-drawer:${requestId}` : null;

const readPersistedDrawerState = (requestId?: string): PersistedRequestDrawerState | null => {
  if (typeof window === 'undefined') return null;
  const key = getPersistedDrawerStateKey(requestId);
  if (!key) return null;

  try {
    const raw = window.localStorage.getItem(key) ?? window.sessionStorage.getItem(key);
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
    window.localStorage.setItem(key, JSON.stringify(value));
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
  fromWarehouse?: string;
  toWarehouse?: string;
  productionLine?: string;
  warehouse?: string;
  zone?: string;
  shelf?: string;
  level?: string;
  company?: string;
  category?: string;
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
  category?: string;
  totalItems: number;
  receivedItems?: number;
  remark?: string;
  approverRemark?: string;
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
    lines: Array<{ requestLineId: number; approvedQty: number; editedAt?: string; rejected?: boolean; rejectRemark?: string }>;
    remark?: string;
  }) => Promise<void>;
  onReject?: (payload: { id: number; remark?: string }) => Promise<void>;
  onConfirmPickup?: (id: number) => Promise<void>;
  onResubmitRequest?: (detail: RequestDetailData) => void;
}

export default function RequestedBatchDrawer({
  open,
  request,
  data: propData,
  onClose,
  onApprove,
  onReject,
  onResubmitRequest,
}: DrawerBatchReturnItemsProps) {
  const currentUser = useModel('@@initialState');
  const detailRequestActions = simpleRequestActions();
  const sparePartServices = SparePartRequestAPI(detailRequestActions);
  const [spfOpen, setSpfOpen] = useState(false);
  const [selectedProductDetail, setSelectedProductDetail] = useState<any>(null);
  const [spfLoading, setSpfLoading] = useState(false);
  const [spfError, setSpfError] = useState<string | null>(null);
  const [itemDetailMap, setItemDetailMap] = useState<Record<string, any>>({});
  const [pickedItems, setPickedItems] = useState<RequestDetailLineItem[]>([]);
  const [pickupSelection, setPickupSelection] = useState<string[]>([]);
  const [statusOverride, setStatusOverride] = useState<RequestStatus | null>(null);
  const [pickupBatches, setPickupBatches] = useState<PickupBatch[]>([]);
  const [expandedPickupBatchNos, setExpandedPickupBatchNos] = useState<number[]>([]);
  const [activityLogs, setActivityLogs] = useState<RequestDetailActivity[]>([]);
  const [actionPopup, setActionPopup] = useState<null | 'approve' | 'reject' | 'confirm-pickup'>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [quantityOverrides, setQuantityOverrides] = useState<Record<string, number>>({});
  const [itemMarks, setItemMarks] = useState<Record<string, 'deleted' | 'canceled' | 'rejected'>>({});
  const [itemRejectRemarks, setItemRejectRemarks] = useState<Record<string, string>>({});
  const [editedItems, setEditedItems] = useState<Record<string, boolean>>({});
  const [editedAtByRequestLineId, setEditedAtByRequestLineId] = useState<Record<string, string>>({});
  const [editingItem, setEditingItem] = useState<RequestDetailLineItem | null>(null);
  const [editingQuantity, setEditingQuantity] = useState<number>(1);
  const [rejectingItem, setRejectingItem] = useState<RequestDetailLineItem | null>(null);
  const lastServerStatusRef = useRef<RequestStatus | null>(null);
  const lastShipmentNoticeRef = useRef<number>(0);
  const initKeyRef = useRef<string>('');
  const productDetailRequestRef = useRef(0);
  const resetPersistRef = useRef(false);
  const access = useAccess();
  const data: RequestDetailData = useMemo(() => {
    if (propData) {
      const items = Array.isArray(propData.items)
        ? propData.items.map((item, index) => normalizeLineItem(item, index))
        : [];
      const activities = Array.isArray(propData.activities) ? propData.activities : [];
      const pickupBatches = Array.isArray(propData.pickupBatches)
        ? propData.pickupBatches.map((batch, index) => ({
          ...batch,
          batchNo: Number(batch.batchNo || index + 1),
          items: Array.isArray(batch.items)
            ? batch.items.map((item, itemIndex) => normalizeLineItem(item, itemIndex))
            : [],
        }))
        : [];

      return {
        ...propData,
        items,
        activities,
        pickupBatches,
        category: toDisplayText(propData.category),
        totalItems: Number(propData.totalItems ?? items.length),
        receivedItems: Number(propData.receivedItems ?? 0),
        status: propData.status || 'pending',
      };
    }

    const fallbackRequest: MyRequestItem = request ?? {
      id: 0,
      requestId: '-',
      priority: 'normal',
      requestDate: new Date().toISOString(),
      totalItems: 0,
      receivedItems: 0,
      requestStatus: 'pending',
      remark: '',
      category: '-',
    };

    const items: RequestDetailLineItem[] =
      fallbackRequest.items?.map((item, index) => normalizeLineItem({
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
        fromWarehouse: undefined,
        toWarehouse: item.toWarehouseCode || undefined,
        productionLine: item.forLine || undefined,
        warehouse: toDisplayText(item.toWarehouseCode) || toDisplayText(fallbackRequest.category),
        category: toDisplayText(item.category) || toDisplayText(fallbackRequest.category),
        businessUnit: item.unit,
        uom: item.unit,
        description: item.remark,
      }, index)) ||
      [];

    return {
      id: fallbackRequest.id,
      requestId: fallbackRequest.requestId,
      requestDate: fallbackRequest.requestDate,
      status: fallbackRequest.requestStatus,
      priority: fallbackRequest.priority,
      category: toDisplayText(fallbackRequest.category),
      totalItems: fallbackRequest.totalItems,
      receivedItems: fallbackRequest.receivedItems,
      remark: fallbackRequest.remark,
      approverRemark: fallbackRequest.approverRemark,
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
    currentUser?.initialState?.currentUser?.login ||
    (access.canSpfApprover ? data.approvedBy : data.requestedBy) ||
    (access.canSpfApprover ? 'Approver' : 'Requester');

  const resolveRequestLineSourceWarehouse = useCallback(
    (item: RequestDetailLineItem) => {
      if (item.fromWarehouse) return item.fromWarehouse;

      const detail = itemDetailMap[item.productId];
      const locations = Array.isArray(detail?.locations) ? detail.locations : [];
      const locationWithStock = locations.find((location: any) => Number(location?.availableQty ?? 0) > 0);
      const firstLocation = locations.find((location: any) => String(location?.warehouseCode || '').trim());
      return (
        String(
          locationWithStock?.warehouseCode ||
            firstLocation?.warehouseCode ||
            detail?.warehouse ||
            '',
        ).trim() || undefined
      );
    },
    [itemDetailMap],
  );

  useEffect(() => {
    if (!open) {
      initKeyRef.current = '';
      resetPersistRef.current = false;
      return;
    }

    const initKey = [
      open ? '1' : '0',
      data.requestId,
      data.status,
      data.receivedItems ?? '',
      data.activities
        .map((activity) => `${activity.label}|${activity.date ?? ''}|${activity.by ?? ''}`)
        .join(','),
      (data.pickupBatches || [])
        .map((batch) => `${batch.batchNo}|${batch.createdAt}|${batch.items.length}`)
        .join(','),
    ].join('|');
    if (initKeyRef.current === initKey) return;
    initKeyRef.current = initKey;

    setSpfOpen(false);
    setSpfLoading(false);
    setSpfError(null);
    setPickupSelection([]);
    setStatusOverride(null);
    setExpandedPickupBatchNos([]);
    setEditingItem(null);
    setEditingQuantity(1);

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
    setItemRejectRemarks(persistedState?.itemRejectRemarks || {});
    setEditedItems(persistedState?.editedItems || {});
    setEditedAtByRequestLineId(persistedState?.editedAtByRequestLineId || {});

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
        ? (data.activities || [])
            .map((activity) => ({
              ...activity,
              date: activity.date ?? data.requestDate,
              by: activity.by?.trim() ? activity.by.trim() : undefined,
            }))
            .filter((activity) => {
              if (!access.canSpfApprover) return true;
              const normalizedLabel = String(activity.label || '').trim().toLowerCase();
              const normalizedDescription = String(activity.description || '').trim().toLowerCase();
              return !(
                normalizedLabel === 'item edited' &&
                normalizedDescription === 'approver adjusted one or more approved quantities.'
              );
            })
        : fallbackLogs;

    setActivityLogs(
      mergeActivities(
        serverLogs,
        (persistedState?.activityLogs || []).filter((activity) => isLocalPersistedActivity(activity)),
      ),
    );
    lastServerStatusRef.current = data.status;
    lastShipmentNoticeRef.current = data.status === 'ready_to_Pickup' && seededPicked.length > 0 ? 1 : 0;
  }, [access.canSpfApprover, data.activities, data.items, data.pickupBatches, data.receivedItems, data.requestDate, data.status, data.requestId, open]);

  useEffect(() => {
    if (!open || !data.requestId || resetPersistRef.current) return;

    writePersistedDrawerState(data.requestId, {
      activityLogs: activityLogs.filter((activity) => isLocalPersistedActivity(activity)),
      quantityOverrides,
      itemMarks,
      itemRejectRemarks,
      editedItems,
      editedAtByRequestLineId,
    });
  }, [activityLogs, data.requestId, editedAtByRequestLineId, editedItems, itemMarks, itemRejectRemarks, open, quantityOverrides]);

  useEffect(() => {
    if (!open) {
      setItemDetailMap({});
      return;
    }

    const productIds = Array.from(new Set((data.items || []).map((item) => item.productId).filter(Boolean)));
    if (!productIds.length) {
      setItemDetailMap({});
      return;
    }

    let active = true;

    Promise.allSettled(
      productIds.map((productId) => {
        return sparePartServices.detail({
          productId,
        });
      }),
    ).then((results) => {
      if (!active) return;

      const nextMap: Record<string, any> = {};
      results.forEach((result, index) => {
        if (result.status !== 'fulfilled') return;
        nextMap[productIds[index]] = result.value;
      });
      setItemDetailMap(nextMap);
    });

    return () => {
      active = false;
    };
  }, [data.items, open]);

  const handleClose = () => {
    resetPersistRef.current = true;
    writePersistedDrawerState(data.requestId, {
      activityLogs: activityLogs.filter((activity) => isLocalPersistedActivity(activity)),
      quantityOverrides,
      itemMarks,
      itemRejectRemarks,
      editedItems,
      editedAtByRequestLineId,
    });
    setSpfOpen(false);
    setSelectedProductDetail(null);
    setSpfLoading(false);
    setSpfError(null);
    setPickupSelection([]);
    setStatusOverride(null);
    setPickedItems([]);
    setPickupBatches([]);
    setExpandedPickupBatchNos([]);
    setActivityLogs([]);
    setQuantityOverrides({});
    setItemMarks({});
    setItemRejectRemarks({});
    setEditedItems({});
    setEditingItem(null);
    setRejectingItem(null);
    setEditingQuantity(1);
    lastServerStatusRef.current = null;
    lastShipmentNoticeRef.current = 0;
    initKeyRef.current = '';
    onClose?.();
  };

  const canEditOrDelete = effectiveStatus === 'pending';
  // const canCancel =
  //   effectiveStatus === 'approved' ||
  //   effectiveStatus === 'ready_to_Pickup' ||
  //   effectiveStatus === 'partial';
  const canCancel = false;

  const getRequestLineKey = (record: RequestDetailLineItem) => String(record.requestLineId || record.productId);

  const requestItems = useMemo(
    () =>
      data.items.map((it) => ({
        ...it,
        quantityToReturn: quantityOverrides[getRequestLineKey(it)] ?? it.quantityToReturn,
      })),
    [data.items, quantityOverrides],
  );

  const activeRequestItems = useMemo(
    () => requestItems.filter((it) => !itemMarks[getRequestLineKey(it)]),
    [itemMarks, requestItems],
  );
  const hasEditedAmount = useMemo(
    () => Object.values(editedItems).some(Boolean),
    [editedItems],
  );
  const hasAllRequestItemsRejected = useMemo(
    () =>
      requestItems.length > 0 &&
      requestItems.every((item) => itemMarks[getRequestLineKey(item)] === 'rejected'),
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
    const requestedQty = Number(record.requestedQty ?? record.total ?? 0);
    const currentQty = Math.max(1, Number(record.quantityToReturn) || 1);
    setEditingItem(record);
    setEditingQuantity(requestedQty > 0 ? Math.min(currentQty, requestedQty) : currentQty);
  };

  const openProductDetails = async (record: RequestDetailLineItem) => {
    const requestId = productDetailRequestRef.current + 1;
    productDetailRequestRef.current = requestId;
    setSelectedProductDetail(null);
    setSpfError(null);
    setSpfLoading(true);
    setSpfOpen(true);
    try {
      const detail = await sparePartServices.detail({ productId: record.productId });
      if (productDetailRequestRef.current !== requestId) return;
      setSelectedProductDetail(detail);
    } catch (_error) {
      if (productDetailRequestRef.current !== requestId) return;
      setSpfError('Unable to load the latest product details.');
    } finally {
      if (productDetailRequestRef.current === requestId) {
        setSpfLoading(false);
      }
    }
  };

  const confirmEditQuantity = () => {
    if (!editingItem) return;
    const productId = editingItem.productId;
    const lineKey = getRequestLineKey(editingItem);
    const requestedQty = Number(editingItem.requestedQty ?? editingItem.total ?? 0);
    const nextQty = Math.max(1, Number(editingQuantity) || 1);
    if (requestedQty > 0 && nextQty > requestedQty) {
      message.warning('Approved quantity cannot be higher than requested quantity.');
      return;
    }
    const originalQty = Number(data.items.find((item) => getRequestLineKey(item) === lineKey)?.quantityToReturn || 0);
    const isEdited = nextQty !== originalQty;
    const editedAt = new Date().toISOString();

    setQuantityOverrides((prev) => {
      const next = { ...prev };
      if (isEdited) {
        next[lineKey] = nextQty;
      } else {
        delete next[lineKey];
      }
      return next;
    });
    setEditedItems((prev) => {
      const next = { ...prev };
      if (isEdited) {
        next[lineKey] = true;
      } else {
        delete next[lineKey];
      }
      return next;
    });
    setEditedAtByRequestLineId((prev) => {
      const next = { ...prev };
      const requestLineKey = String(editingItem.requestLineId || '');
      if (!requestLineKey) return next;
      if (isEdited) {
        next[requestLineKey] = editedAt;
      } else {
        delete next[requestLineKey];
      }
      return next;
    });
    // Dynamic audit stays backend-driven; this drawer only stores editedAt for the later approve payload.
    setEditingItem(null);
    message.success(
      isEdited
        ? `Updated requested quantity for ${productId} to ${nextQty}.`
        : `Reset requested quantity for ${productId}.`,
    );
  };

  function markItem(record: RequestDetailLineItem, mark: 'deleted' | 'canceled') {
    const lineKey = getRequestLineKey(record);
    if (itemMarks[lineKey]) return;

    setItemMarks((prev) => ({
      ...prev,
      [lineKey]: mark,
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
  }

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

  const rejectItem = async (record: RequestDetailLineItem, remark?: string) => {
    const normalizedRemark = remark?.trim();
    if (!normalizedRemark) {
      message.warning('Reject remark is required.');
      return;
    }
    const lineKey = getRequestLineKey(record);
    const nextItemMarks = {
      ...itemMarks,
      [lineKey]: 'rejected' as const,
    };
    const nextItemRejectRemarks = {
      ...itemRejectRemarks,
      [lineKey]: normalizedRemark,
    };
    const shouldRejectWholeRequest =
      requestItems.length > 0 &&
      requestItems.every((item) => nextItemMarks[getRequestLineKey(item)] === 'rejected') &&
      typeof record.requestLineId === 'number';
    const rejectRequestRemark = requestItems
      .filter((item) => nextItemMarks[getRequestLineKey(item)] === 'rejected')
      .map((item) => {
        const itemRemark = nextItemRejectRemarks[getRequestLineKey(item)]?.trim();
        return `${item.productId}: ${itemRemark || 'Rejected by approver'}`;
      })
      .join('; ');

    setItemMarks(nextItemMarks);
    setItemRejectRemarks(nextItemRejectRemarks);
    setQuantityOverrides((prev) => ({
      ...prev,
      [lineKey]: 0,
    }));
    setEditedItems((prev) => ({
      ...prev,
      [lineKey]: true,
    }));
    setRejectingItem(null);

    if (!shouldRejectWholeRequest) {
      setActivityLogs((prev) => [
        ...prev,
        {
          label: 'Item Rejected',
          description: `${record.productId} rejected: ${normalizedRemark}`,
          date: new Date().toISOString(),
          by: currentActor,
          dot: 'done',
        },
      ]);
      message.success(`${record.productId} marked as rejected.`);
      return;
    }

    setActionLoading(true);
    try {
      if (onReject && data.id) {
        await onReject({
          id: data.id,
          remark: rejectRequestRemark || normalizedRemark,
        });
      }
      setStatusOverride('rejected');
      setActivityLogs((prev) => [
        ...prev,
        {
          label: 'Item Rejected',
          description: `${record.productId} rejected: ${normalizedRemark}`,
          date: new Date().toISOString(),
          by: currentActor,
          dot: 'done',
        },
        {
          label: 'Rejected',
          description: 'All request items rejected',
          date: new Date().toISOString(),
          by: currentActor,
          dot: 'done',
        },
      ]);
      message.success('Request rejected successfully.');
    } catch (_error) {
      setItemMarks((prev) => {
        const next = { ...prev };
        delete next[lineKey];
        return next;
      });
      setItemRejectRemarks((prev) => {
        const next = { ...prev };
        delete next[lineKey];
        return next;
      });
      setQuantityOverrides((prev) => {
        const next = { ...prev };
        delete next[lineKey];
        return next;
      });
      setEditedItems((prev) => {
        const next = { ...prev };
        delete next[lineKey];
        return next;
      });
      message.error('Failed to reject request.');
    } finally {
      setActionLoading(false);
    }
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
      width: 160,
      ellipsis: true,
      render: (_: unknown, record) => {
        const mark = itemMarks[getRequestLineKey(record)];
        const isEdited = Boolean(editedItems[getRequestLineKey(record)]);
        const content = mark ? (
          <Text delete={mark === 'deleted'} type={mark === 'deleted' ? 'danger' : 'secondary'}>
            {record.productId}
          </Text>
        ) : (
          <Typography.Link
            onClick={(event) => {
              event.preventDefault();
              openProductDetails(record);
            }}
          >
            {record.productId || '—'}
          </Typography.Link>
        );

        return (
          <Space size={6}>
            {content}
            {mark ? (
              <Tag color={mark === 'canceled' ? 'gold' : 'red'} bordered={false}>
                {mark === 'canceled' ? 'Canceled' : mark === 'rejected' ? 'Rejected' : 'Deleted'}
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
      width: 220,
      ellipsis: true,
      render: (_: unknown, record) => {
        const mark = itemMarks[getRequestLineKey(record)];
        const isEdited = Boolean(editedItems[getRequestLineKey(record)]);
        return (
          <Text
            delete={mark === 'deleted'}
            type={mark === 'deleted' || mark === 'rejected' ? 'danger' : mark === 'canceled' ? 'secondary' : isEdited ? 'warning' : undefined}
          >
            {record.itemName || '—'}
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
      title: 'From WH',
      dataIndex: 'fromWarehouse',
      width: '12%',
      render: (_: unknown, record) => resolveRequestLineSourceWarehouse(record) || '—',
    },
    {
      title: 'To WH',
      dataIndex: 'toWarehouse',
      width: '12%',
      render: (_: unknown, record) => record.toWarehouse || record.warehouse || '—',
    },
    {
      title: 'Line',
      dataIndex: 'productionLine',
      width: '14%',
      render: (_: unknown, record) => record.productionLine || '—',
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
            width: 56,
            ellipsis: true,
            render: (_: unknown, record: RequestDetailLineItem) => {
              const marked = itemMarks[getRequestLineKey(record)];
              const isPicked = pickedProductIds.has(record.productId);

              if (marked) {
                return <Text type="secondary">{marked === 'canceled' ? 'Canceled' : marked === 'rejected' ? 'Rejected' : 'Deleted'}</Text>;
              }

              if (canEditOrDelete) {
                return (
                  <Space size="small">
                    <Button
                      type="text"
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => openEditQuantity(record)}
                      title="Edit Amount"
                    >
                    </Button>
                    <Button
                      danger
                      type="text"
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => setRejectingItem(record)}
                      title="Reject Item"
                    />
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
    if (!selectedProductDetail) return undefined;

    const stock = Number(selectedProductDetail.stock ?? 0);
    return {
      id: Number(selectedProductDetail.id || 0),
      image: selectedProductDetail.image,
      imageId: Array.isArray(selectedProductDetail.imageId)
        ? selectedProductDetail.imageId
        : selectedProductDetail.imageId
          ? [selectedProductDetail.imageId]
          : [],
      locations: selectedProductDetail.locations,
      productId: selectedProductDetail.productId || '',
      partName: selectedProductDetail.partName || selectedProductDetail.productId || '',
      category: selectedProductDetail.category || '',
      stock,
      businessUnit: selectedProductDetail.businessUnit || '',
      status: stock > 0 ? ('available' as const) : ('no-stock' as const),
      warehouse: selectedProductDetail.warehouse || '',
      tab: 'spare-list' as const,
      uom: selectedProductDetail.uom,
      createdDate: selectedProductDetail.createdDate,
      updatedDate: selectedProductDetail.updatedDate,
      spare_part_name: selectedProductDetail.partName,
      part_number: selectedProductDetail.productId,
      description: selectedProductDetail.description,
      stock_quantity: selectedProductDetail.stock,
      receiving_from_warehouse: selectedProductDetail.warehouse,
      company: selectedProductDetail.company,
      business_unit: selectedProductDetail.businessUnit,
      requested_date: selectedProductDetail.createdDate,
      updated_date: selectedProductDetail.updatedDate,
    };
  }, [selectedProductDetail]);

  // const receivedItemsDisplay = useMemo(() => {
  //   if (pickedItems.length > 0 || statusOverride) return `${receivedQtyTotal} / ${requestedQtyTotal}`;
  //   return formatDateTime(data.receivedItems) ?? '—';
  // }, [data.receivedItems, pickedItems.length, receivedQtyTotal, requestedQtyTotal, statusOverride]);

  const handleApproveRequest = async (remark?: string) => {
    const lines = requestItems
      .filter((item) => typeof item.requestLineId === 'number')
      .map((item) => {
        const isRejected = itemMarks[getRequestLineKey(item)] === 'rejected';
        return {
          requestLineId: Number(item.requestLineId),
          approvedQty: isRejected ? 0 : Number(item.quantityToReturn || 0),
          editedAt: editedAtByRequestLineId[String(item.requestLineId)] || undefined,
          rejected: isRejected || undefined,
          rejectRemark: isRejected ? itemRejectRemarks[getRequestLineKey(item)] : undefined,
        };
      });
    const hasAnyApprovedQty = lines.some((item) => item.approvedQty > 0);
    const allLinesRejected = lines.length > 0 && lines.every((item) => item.rejected);

    if (!hasAnyApprovedQty && !allLinesRejected) {
      message.warning('At least one item must have approved quantity greater than 0. Otherwise, reject the request.');
      return;
    }
    const nextStatus = allLinesRejected ? 'rejected' : 'approved';
    const nextLabel = allLinesRejected ? 'Rejected' : 'Approved';
    const nextDescription = allLinesRejected ? 'All request items rejected' : 'Request approved';
    const rejectRemark =
      remark?.trim() ||
      requestItems
        .filter((item) => itemMarks[getRequestLineKey(item)] === 'rejected')
        .map((item) => {
          const lineRemark = itemRejectRemarks[getRequestLineKey(item)]?.trim();
          return `${item.productId}: ${lineRemark || 'Rejected by approver'}`;
        })
        .join('; ');

    setActionLoading(true);
    try {
      if (!onApprove || !data.id) {
        setStatusOverride(nextStatus);
        setActivityLogs((prev) => [
          ...prev,
          {
            label: nextLabel,
            description: nextDescription,
            date: new Date().toISOString(),
            by: currentActor,
            dot: 'done',
          },
        ]);
      } else {
        if (allLinesRejected && onReject) {
          await onReject({ id: data.id, remark: rejectRemark || 'All request items rejected' });
        } else {
          await onApprove({ id: data.id, lines, remark });
        }
        setStatusOverride(nextStatus);
        setActivityLogs((prev) => [
          ...prev,
          {
            label: nextLabel,
            description: nextDescription,
            date: new Date().toISOString(),
            by: currentActor,
            dot: 'done',
          },
        ]);
        message.success(allLinesRejected ? 'Request rejected successfully.' : 'Request approved successfully.');
      }
      setActionPopup(null);
    } catch (_error) {
      message.error('Failed to approve request.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectRequest = async (remark?: string) => {
    setActionLoading(true);
    try {
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
      } else {
        await onReject({ id: data.id, remark });
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
      }
      setActionPopup(null);
    } catch (_error) {
      message.error('Failed to reject request.');
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    if ((data.activities || []).length > 0 || (data.pickupBatches || []).length > 0) return;

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
  }, [data.activities, data.pickupBatches, data.status, open, pickupBatches.length]);

  const shipmentNoForReady = pickupBatches.length > 0 ? pickupBatches.length + 1 : 1;

  const displayActivityLogs = useMemo(() => {
    let readyCount = 0;
    let partialPickupCount = 0;

    return [...activityLogs]
      .filter((activity) => {
        const normalizedLabel = String(activity.label || '').trim().toLowerCase();
        return !normalizedLabel.includes('confirm pick');
      })
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

        if (normalizedLabel.includes('processing') || normalizedLabel === 'in progress') {
          return {
            ...activity,
            label: 'In Progress',
          };
        }

        if (normalizedLabel === 'draft updated') {
          return {
            ...activity,
            label: 'Draft Updated',
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
              // rowSelection={{
              //   selectedRowKeys: pickupSelection,
              //   onChange: (keys) => setPickupSelection((keys || []).map((k) => String(k))),
              //   getCheckboxProps: (record) => ({
              //     disabled:
              //       pickedProductIds.has(record.productId) ||
              //       Boolean(itemMarks[record.productId]) ||
              //       availablePickupQty(record, effectiveStatus) <= 0,
              //   }),
              // }}
              dataSource={activeRequestItems}
              columns={columnsForPickupTable}
            />
          </div>
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

  const headerActions =
    access.canSpfApprover && effectiveStatus === 'pending' ? (
      <Space>
        <Button danger onClick={() => setActionPopup('reject')}>
          Reject
        </Button>
        <Button type="primary" onClick={() => setActionPopup('approve')}>
          Approve
        </Button>
      </Space>
    ) : access.canSpfRequester && effectiveStatus === 'rejected' ? (
      <Button type="primary" onClick={() => onResubmitRequest?.(data)}>
        Re-Request
      </Button>
    ) : null;

  return (
    <>
      <Drawer
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
            <span>Request Details</span>
            {headerActions}
          </div>
        }
          width="60%"
          placement="right"
          onClose={handleClose}
          open={open}
          bodyStyle={{ padding: 16, backgroundColor: '#fafafa' }}
          headerStyle={{ borderBottom: '1px solid #f0f0f0' }}
        >
        <Descriptions
          column={3}
          size="small"
          style={{ marginBottom: 24 }}
          labelStyle={{ textAlign: 'center', fontWeight: 'bolder' }}
          contentStyle={{ textAlign: 'center' }}
        >
          {/* <Descriptions.Item label="No">{data.id ?? '—'}</Descriptions.Item> */}
          <Descriptions.Item label="Status">
            <Tag color={statusColorMap[effectiveStatus]} bordered={false}
            >
              {statusLabelMap[effectiveStatus]}
              
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Request ID">{data.requestId}</Descriptions.Item>
          <Descriptions.Item label="Category">{data.category ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="Priority">{data.priority ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="Total Items">{displayedTotalItems}</Descriptions.Item>
          <Descriptions.Item label="Received Items">{displayedReceivedItems}</Descriptions.Item>
          {/* <Descriptions.Item label="Request Date">{formatSpfDateTime(data.requestDate)}</Descriptions.Item> */}
        </Descriptions>

        {data.approverRemark?.trim() ? (
          <>
            <Title level={5} style={{ marginBottom: 8 }}>
              Manager Remark
            </Title>
            <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
              {data.approverRemark.trim()}
            </Text>
          </>
        ) : null}
        <Text style={{ display: 'none' }}>
          {data.remark?.trim() ? data.remark : '—'}
        </Text>

        <Title level={5} style={{ marginBottom: 8 }}>
          Remark
        </Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
          {data.remark?.trim() ? data.remark : '—'}
        </Text>

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
                : effectiveStatus === 'completed' && index === STATUS_STEPS.length - 1
                  ? 'finish'
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
          rowKey={getRequestLineKey}
          tableLayout="auto"
          pagination={false}
          columns={columns}
          dataSource={requestItems}
          onRow={(record) => {
            const mark = itemMarks[getRequestLineKey(record)];
            const isEdited = Boolean(editedItems[getRequestLineKey(record)]);
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
                    <Text type="secondary">{formatDateTime(a.date)}</Text>
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
        loading={spfLoading}
        error={spfError}
        onClose={() => {
          productDetailRequestRef.current += 1;
          setSpfOpen(false);
          setSelectedProductDetail(null);
          setSpfLoading(false);
          setSpfError(null);
        }}
      />

      <ValidationPopup
        open={actionPopup === 'approve'}
        title={hasAllRequestItemsRejected ? 'Reject Request' : 'Approve Request'}
        description={
          hasAllRequestItemsRejected
            ? 'All request items are rejected. Reject this spare part request?'
            : 'Approve this spare part request?'
        }
        confirmText={hasAllRequestItemsRejected ? 'Reject' : 'Approve'}
        danger={hasAllRequestItemsRejected}
        showRemark
        requireRemark={hasEditedAmount}
        remarkLabel="Remark"
        remarkPlaceholder="Please enter approval remark"
        remarkRequiredMessage="Remark is required when amount has been modified."
        loading={actionLoading}
        onCancel={() => setActionPopup(null)}
        onConfirm={(payload) => handleApproveRequest(payload?.remark)}
      />

      <ValidationPopup
        open={actionPopup === 'reject'}
        title="Reject Request"
        description="Reject this spare part request?"
        confirmText="Reject"
        danger
        showRemark
        requireRemark
        remarkLabel="Remark"
        remarkPlaceholder="Please enter rejection remark"
        remarkRequiredMessage="Remark is required when rejecting a request."
        loading={actionLoading}
        onCancel={() => setActionPopup(null)}
        onConfirm={(payload) => handleRejectRequest(payload?.remark)}
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
          <Text type="secondary">
            Requested quantity: {Number(editingItem?.requestedQty ?? editingItem?.total ?? 0)}
          </Text>
          <InputNumber
            min={1}
            max={Number(editingItem?.requestedQty ?? editingItem?.total ?? 0) || undefined}
            style={{ width: '100%' }}
            value={editingQuantity}
            onChange={(value) => {
              const requestedQty = Number(editingItem?.requestedQty ?? editingItem?.total ?? 0);
              const nextValue = Math.max(1, Number(value) || 1);
              setEditingQuantity(requestedQty > 0 ? Math.min(nextValue, requestedQty) : nextValue);
            }}
          />
        </Space>
      </Modal>

      <ValidationPopup
        open={Boolean(rejectingItem)}
        title="Reject Item"
        description={`Reject ${rejectingItem?.productId || 'this item'} from this request?`}
        confirmText="Reject Item"
        danger
        showRemark
        requireRemark
        remarkLabel="Reject Remark"
        remarkPlaceholder="Please enter item rejection remark"
        remarkRequiredMessage="Remark is required when rejecting an item."
        loading={actionLoading}
        onCancel={() => setRejectingItem(null)}
        onConfirm={async (payload) => {
          if (rejectingItem) {
            await rejectItem(rejectingItem, payload?.remark);
          }
        }}
      />
    </>
  );
}
