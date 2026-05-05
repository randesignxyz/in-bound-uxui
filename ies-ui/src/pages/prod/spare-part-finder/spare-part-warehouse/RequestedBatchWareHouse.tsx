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
  InputNumber,
  message,
  Badge,
  Modal,
  QRCode,
} from 'antd';
import { DownOutlined, RightOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useAccess, useModel } from '@umijs/max';
import SpfDetails from '../spare-part-request/SpfDetails';
import type { MyRequestItem, RequestPriority, RequestStatus } from '../spare-part-request/data';
import type { WarehouseRequestRecord } from './requestsWarehouse.shared';
import type { Shipment, ShipmentLine } from '../shipmentsStore';
import { formatSpfDateTime } from '../shared/dateTime';
import ValidationPopup from '../spare-part-request/validatePopup';
import { SparePartRequestAPI, uploadFilesToFileService } from '../spare-part-request/service.api';
import { simpleRequestActions } from '@/services/model';

const { Title, Text } = Typography;

const formatDateTime = (iso?: string) => {
  if (!iso) return '—';
  return formatSpfDateTime(iso);
};

const STATUS_STEPS = ['Requested', 'Approved', 'In Progress', 'Completed'] as const;

const normalizeWarehouseStatus = (status: unknown): RequestStatus => {
  const raw = String(status ?? '').trim().toLowerCase().replace(/\s+/g, '_');

  if (raw === 'ready_to_pick_up' || raw === 'ready_to_pickup') return 'ready_to_Pickup';
  if (raw === 'in_progress' || raw === 'in-progress') return 'in-progress';
  if (raw === 'partial') return 'partial';
  if (raw === 'completed') return 'completed';
  if (raw === 'rejected') return 'rejected';
  if (raw === 'approved') return 'approved';
  if (raw === 'pending') return 'pending';
  return 'pending';
};

const statusColorMap: Record<RequestStatus, string> = {
  // pending: 'default',
  pending: '#bfbfbf',
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
  requestedBy?: string;
  approvedBy?: string;
  rejectedBy?: string;
  warehouseBy?: string;
  items: RequestDetailLineItem[];
  activities: RequestDetailActivity[];
  draftItems?: Array<{ requestLineId: number; draftQty: number }>;
  shipments?: Shipment[];
  pickupStatus?: string;
  rawStatus?: string;
  pickupQrToken?: string;
  pickupQrGeneratedAt?: string;
  pickupQrExpiredAt?: string;
}

export interface DrawerBatchReturnItemsProps {
  open: boolean;
  request?: WarehouseRequestRecord | MyRequestItem | null;
  data?: RequestDetailData | null;
  onClose?: () => void;
  onChange?: (updated: any) => void;
  onIssueRequest?: (payload: {
    id: number;
    lines: Array<{ requestLineId: number; issueQty: number }>;
  }) => Promise<void>;
  onSaveDraft?: (payload: {
    id: number;
    lines: Array<{ requestLineId: number; issueQty: number }>;
  }) => Promise<void>;
  onDeleteDraft?: (id: number) => Promise<void>;
  onAcceptRequest?: (id: number) => Promise<void>;
  onConfirmPickup?: (payload: { id: number; fulfillmentId?: string }) => Promise<void>;
  onGeneratePickupQr?: (payload: { id: number; fulfillmentId?: string }) => Promise<void>;
}

type SendingMap = Record<string, number>;

const clampInt = (v: unknown) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.floor(n));
};

const getActivityRank = (label?: string): number => {
  const normalized = String(label || '').trim().toLowerCase();

  if (normalized === 'requested') return 1;
  if (normalized === 'approved') return 2;
  if (normalized === 'rejected') return 2;
  if (normalized === 'in progress' || normalized === 'confirmed') return 3;
  if (normalized === 'draft saved') return 4;
  if (normalized === 'draft updated') return 4;
  if (normalized === 'draft deleted') return 4;
  if (normalized === 'ready to pick up') return 4;
  if (normalized === 'confirm pick up') return 5;
  if (/^partial issue #\d+$/i.test(normalized)) return 6;
  if (normalized === 'completed') return 7;
  return 8;
};

const getMaxVisibleActivityRank = (status: RequestStatus): number => {
  switch (status) {
    case 'pending':
      return 1;
    case 'approved':
    case 'in-progress':
    case 'rejected':
      return 2;
    case 'ready_to_Pickup':
      return 4;
    case 'partial':
      return 6;
    case 'completed':
      return 7;
    default:
      return 8;
  }
};

const parseActivityShipmentNo = (label?: string, description?: string): number | undefined => {
  const text = `${String(label || '')} ${String(description || '')}`;
  const partialMatch = text.match(/partial\s+issue\s*#\s*(\d+)/i);
  if (partialMatch) {
    const value = Number(partialMatch[1]);
    if (Number.isFinite(value) && value > 0) return value;
  }

  const shipmentMatch = text.match(/shipment\s*#\s*(\d+)/i);
  if (shipmentMatch) {
    const value = Number(shipmentMatch[1]);
    if (Number.isFinite(value) && value > 0) return value;
  }

  return undefined;
};

const mergeActivities = (
  base: RequestDetailActivity[],
  extra: RequestDetailActivity[] = [],
): RequestDetailActivity[] => {
  const seen = new Set<string>();
  const merged: RequestDetailActivity[] = [];
  const singletonLabels = new Set(['requested', 'approved', 'rejected', 'confirmed', 'completed']);

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

export default function RequestedBatchWareHouse({
  open,
  request,
  data: propData,
  onClose,
  onChange,
  onIssueRequest,
  onSaveDraft,
  onDeleteDraft,
  onAcceptRequest,
  onConfirmPickup,
  onGeneratePickupQr,
}: DrawerBatchReturnItemsProps) {
  const access = useAccess();
  const currentUser = useModel('@@initialState');
  const detailRequestActions = simpleRequestActions();
  const sparePartServices = SparePartRequestAPI(detailRequestActions);
  const initKeyRef = useRef<string>('');
  const productDetailRequestRef = useRef(0);

  const [spfOpen, setSpfOpen] = useState(false);
  const [selectedProductDetail, setSelectedProductDetail] = useState<any>(null);
  const [spfLoading, setSpfLoading] = useState(false);
  const [spfError, setSpfError] = useState<string | null>(null);
  const [itemDetailMap, setItemDetailMap] = useState<Record<string, any>>({});
  const [statusOverride, setStatusOverride] = useState<RequestStatus | null>(null);
  const [activityLogs, setActivityLogs] = useState<RequestDetailActivity[]>([]);
  // Current input quantities (what user is typing right now, not yet saved)
  const [sendingByProductId, setSendingByProductId] = useState<SendingMap>({});
  // Accumulated draft across multiple Save clicks (not yet committed to a shipment)
  const [draftByProductId, setDraftByProductId] = useState<SendingMap>({});
  const [workingItems, setWorkingItems] = useState<RequestDetailLineItem[]>([]);
  // Committed shipment batches (each one is a Save & Pick up result)
  const [shipmentBatches, setShipmentBatches] = useState<Shipment[]>([]);
  const [confirmPickupPopupOpen, setConfirmPickupPopupOpen] = useState(false);
  const [confirmPickupLoading, setConfirmPickupLoading] = useState(false);
  const [confirmPickupShipmentId, setConfirmPickupShipmentId] = useState<string | null>(null);
  const [pickupQrModalOpen, setPickupQrModalOpen] = useState(false);
  const [pickupQrLoading, setPickupQrLoading] = useState(false);
  const [pickupQrShipmentId, setPickupQrShipmentId] = useState<string | null>(null);
  const [acceptLoading, setAcceptLoading] = useState(false);
  const [draftDeleteLoading, setDraftDeleteLoading] = useState(false);
  const [expandedShipmentBatchNos, setExpandedShipmentBatchNos] = useState<number[]>([]);

  const data: RequestDetailData = useMemo(() => {
    if (propData) return propData;
    const req = request as any;
    const realItems: any[] = req?.items ?? [];
    const items: RequestDetailLineItem[] = realItems.map((it: any, i: number) => ({
      no: i + 1,
      requestLineId: Number(it.requestLineId || it.id || 0) || undefined,
      imageId: Array.isArray(it.imageId) ? it.imageId[0] : it.imageId,
      productId: it.productId ?? it.sparePartId ?? it.sparePartCode ?? '',
      requestId: req?.requestId ?? '',
      itemName: it.itemName ?? it.sparePartName ?? '',
      quantityToReturn: Number(it.quantity ?? it.approvedQty ?? 0),
      usedQuantity: 0,
      total: Number(it.quantity ?? it.approvedQty ?? 0),
      warehouseSentQuantity: Number(it.receivedQuantity ?? it.issuedQty ?? 0),
      description: it.remark ?? it.description ?? undefined,
      stockQuantity: it.stockQuantity,
      warehouse: it.toWarehouseCode ?? req?.category,
      zone: it.zone,
      shelf: it.shelf,
      level: it.level,
      company: it.company,
      category: it.category,
      businessUnit: it.businessUnit ?? it.unit,
      uom: it.uom ?? it.unit,
    }));
    return {
      id: req?.id,
      requestId: req?.requestId ?? '',
      requestDate: req?.requestDate ?? '',
      status: normalizeWarehouseStatus(req?.requestStatus || req?.status || 'pending'),
      priority: req?.priority as RequestPriority,
      category: req?.category || items.find((item) => item.category)?.category,
      totalItems: req?.totalItems ?? items.length,
      receivedItems: req?.receivedItems,
      remark: req?.remark,
      requestedBy: req?.requester ?? req?.requestedBy,
      approvedBy: req?.approvedBy ?? req?.approver ?? req?.approved_by,
      warehouseBy: req?.warehouseBy,
      items,
      activities: req?.activities ?? [],
    };
  }, [propData, request]);

  // Total qty sent across all committed shipments (warehouseSentQuantity on workingItems)
  const totals = useMemo(() => {
    const totalRequested = workingItems.reduce((sum, it) => sum + clampInt(it.quantityToReturn), 0);
    const totalSent = workingItems.reduce((sum, it) => sum + clampInt(it.warehouseSentQuantity), 0);
    return { totalRequested, totalSent };
  }, [workingItems]);

  // Total draft (accumulated across multiple Save clicks)
  const totalDraft = useMemo(
    () => Object.values(draftByProductId).reduce((sum, v) => sum + clampInt(v), 0),
    [draftByProductId],
  );
  const currentSelectionTotal = useMemo(
    () => Object.values(sendingByProductId).reduce((sum, v) => sum + clampInt(v), 0),
    [sendingByProductId],
  );

  const hasWarehouseAcceptedSignal = useMemo(() => {
    const rawStatus = String(data.rawStatus || '').trim().toUpperCase();
    if (rawStatus === 'IN_PROGRESS') return true;

    return (data.activities || []).some((activity) => {
      const normalizedLabel = String(activity.label || '').trim().toLowerCase();
      return normalizedLabel === 'confirmed' || normalizedLabel === 'in progress';
    });
  }, [data.activities, data.rawStatus]);

  const effectiveStatus: RequestStatus = useMemo(() => {
    if (statusOverride) return statusOverride;

    const hasReadyToPickupShipment = shipmentBatches.some((s) => s.status !== 'completed');

    if (data.status === 'completed') {
      return hasReadyToPickupShipment ? 'ready_to_Pickup' : 'completed';
    }
    if (data.status === 'ready_to_Pickup') return 'ready_to_Pickup';
    if (data.status === 'partial') return 'partial';
    if (data.status === 'in-progress') return 'in-progress';
    if (data.status === 'approved' && hasWarehouseAcceptedSignal) return 'in-progress';
    if (data.status === 'approved') return 'approved';
    if (data.status === 'rejected') return 'rejected';

    if (hasReadyToPickupShipment) return 'ready_to_Pickup';

    if (totals.totalSent > 0 && totals.totalSent < totals.totalRequested) return 'partial';

    return 'pending';
  }, [data.status, hasWarehouseAcceptedSignal, shipmentBatches, statusOverride, totals.totalRequested, totals.totalSent]);

  const displayedStatusForTag: RequestStatus =
    effectiveStatus === 'approved' ? 'pending' : effectiveStatus;
  const displayedStatusLabel = statusLabelMap[displayedStatusForTag];
  const displayedStatusColor = statusColorMap[displayedStatusForTag];
  const currentActor =
    currentUser.initialState?.currentUser?.login || data.warehouseBy || 'Warehouse';

  const currentStep = statusToCurrentStep(effectiveStatus);

  useEffect(() => {
    if (!open) {
      initKeyRef.current = '';
      return;
    }

    const initKey = [
      data.requestId,
      data.status,
      data.pickupStatus || '',
      (data.shipments || [])
        .map((shipment) =>
          [
            shipment.id,
            shipment.status,
            shipment.pickupQrToken || '',
            shipment.pickupQrGeneratedAt || '',
            shipment.pickupQrExpiredAt || '',
            shipment.confirmedAt || '',
            shipment.lines.map((line) => `${line.productId}:${line.quantity}`).join(';'),
          ].join(':'),
        )
        .join('|'),
      (data.activities || [])
        .map((activity) => `${activity.label}:${activity.date || ''}:${activity.description}:${activity.by || ''}`)
        .join('|'),
      (data.draftItems || []).map((item) => `${item.requestLineId}:${item.draftQty}`).join(','),
      data.items.map((item) => `${item.requestLineId}:${item.warehouseSentQuantity || 0}`).join(','),
    ].join('|');
    if (initKeyRef.current === initKey) return;
    initKeyRef.current = initKey;

    setSpfOpen(false);
    setSpfLoading(false);
    setSpfError(null);
    setStatusOverride(null);
    setShipmentBatches([]);
    setExpandedShipmentBatchNos([]);

    const nextSending: SendingMap = {};
    const nextDraft: SendingMap = {};
    setWorkingItems(data.items);
    data.items.forEach((it) => {
      nextSending[it.productId] = 0;
      const savedDraft = data.draftItems?.find((draft) => draft.requestLineId === it.requestLineId)?.draftQty ?? 0;
      nextDraft[it.productId] = clampInt(savedDraft);
    });
    setSendingByProductId(nextSending);
    setDraftByProductId(nextDraft);

    const baseLogs: RequestDetailActivity[] =
      (data.activities || []).length > 0
        ? data.activities
        : [
            {
              label: 'Requested',
              description: `Requested by ${data.requestedBy || '-'}`,
              date: data.requestDate,
              by: data.requestedBy || undefined,
              dot: 'done',
            },
            ...(data.approvedBy || data.status !== 'pending'
              ? [
                  {
                    label: 'Approved',
                    description: 'Request approved',
                    date: data.requestDate,
                    by: data.approvedBy ?? undefined,
                    dot: 'done' as const,
                  },
                ]
              : []),
            ...(data.status === 'in-progress'
              ? [
                  {
                    label: 'Accepted',
                    description: 'Warehouse accepted and started processing this request',
                    date: data.requestDate,
                    by: currentActor,
                    dot: 'done' as const,
                  },
                ]
              : []),
          ];

    const existingShipments = (data as any).shipments || [];
    setShipmentBatches(existingShipments);

    setActivityLogs(baseLogs);
  }, [data.activities, data.approvedBy, data.draftItems, data.items, data.requestDate, data.requestId, data.requestedBy, data.shipments, data.status, open]);

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

    Promise.allSettled(productIds.map((productId) => sparePartServices.detail({ productId }))).then((results) => {
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
    productDetailRequestRef.current += 1;
    initKeyRef.current = '';
    setSpfOpen(false);
    setSelectedProductDetail(null);
    setSpfLoading(false);
    setSpfError(null);
    setStatusOverride(null);
    setActivityLogs([]);
    setSendingByProductId({});
    setDraftByProductId({});
    setExpandedShipmentBatchNos([]);
    setPickupQrModalOpen(false);
    setPickupQrShipmentId(null);
    setConfirmPickupShipmentId(null);
    onClose?.();
  };

  const spfData = useMemo(() => {
    const detail = selectedProductDetail;
    if (!detail) return undefined;
    return {
      id: detail.id,
      productId: detail.productId,
      partName: detail.partName,
      description: detail.description,
      stock: detail.stock,
      warehouse: detail.warehouse || '',
      category: detail.category,
      businessUnit: detail.businessUnit || '',
      uom: detail.uom,
      uomOptions: detail.uom ? [detail.uom] : [],
      status: detail.status || 'available',
      isActive: detail.isActive ?? true,
      image: detail.image,
      imageId: detail.imageId ? (Array.isArray(detail.imageId) ? detail.imageId : [detail.imageId]) : [],
      locations: detail.locations || [],
      createdDate: detail.createdDate,
      updatedDate: detail.updatedDate,
    } as any;
  }, [selectedProductDetail]);

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

  const handleUploadProductImages = async (files: File[]) => {
    if (!selectedProductDetail?.productId) return;
    const uploadedImageIds = await uploadFilesToFileService(files);
    if (uploadedImageIds.length === 0) {
      throw new Error('No image uploaded');
    }

    const updatedDetail = await sparePartServices.updateImages(selectedProductDetail.productId, uploadedImageIds);
    setSelectedProductDetail(updatedDetail);
    setItemDetailMap((prev) => ({
      ...prev,
      [selectedProductDetail.productId]: updatedDetail,
    }));
  };

  const handleDeleteProductImage = async (imageId: string) => {
    if (!selectedProductDetail?.productId) return;

    const updatedDetail = await sparePartServices.deleteImages(selectedProductDetail.productId, [imageId]);
    setSelectedProductDetail(updatedDetail);
    setItemDetailMap((prev) => ({
      ...prev,
      [selectedProductDetail.productId]: updatedDetail,
    }));
  };

  const displayActivityLogs = useMemo(() => {
    let readyCount = 0;
    let partialIssueCount = 0;
    const dynamicVisibleRank = activityLogs.reduce((maxRank, activity) => {
      const activityRank = getActivityRank(activity.label);
      if (effectiveStatus !== 'completed' && activityRank >= 7) {
        return maxRank;
      }
      return Math.max(maxRank, activityRank);
    }, getMaxVisibleActivityRank(effectiveStatus));

    return [...activityLogs]
      .sort((left, right) => {
        const leftTime = new Date(left.date || data.requestDate).getTime();
        const rightTime = new Date(right.date || data.requestDate).getTime();

        if (leftTime !== rightTime) return leftTime - rightTime;
        return getActivityRank(left.label) - getActivityRank(right.label);
      })
      .filter((activity) => getActivityRank(activity.label) <= dynamicVisibleRank)
      .map((activity) => {
        const rawLabel = String(activity.label || '').trim();
        const normalizedLabel = rawLabel.toLowerCase();
        const shipmentNo = parseActivityShipmentNo(rawLabel, activity.description);

        if (normalizedLabel.includes('ready to pick')) {
          readyCount += 1;
          return {
            ...activity,
            label: 'Ready to Pick up',
            description: activity.description?.trim() || `Shipment #${shipmentNo ?? readyCount} is ready to pick up`,
          };
        }

        if (normalizedLabel.includes('partial issue')) {
          partialIssueCount += 1;
          return {
            ...activity,
            label: `Partial Issue #${shipmentNo ?? partialIssueCount}`,
          };
        }

        if (normalizedLabel.includes('confirm pick')) {
          return {
            ...activity,
            label: 'Confirm Pick up',
          };
        }

        return activity;
      });
  }, [activityLogs, data.requestDate, effectiveStatus]);

  const canWarehouseOperate = access.canSpfWarehouseStaff || access.canAdmin;
  const isReadyForWarehouseWork = effectiveStatus !== 'rejected' && effectiveStatus !== 'completed';
  const canSelectAmount =
    canWarehouseOperate &&
    isReadyForWarehouseWork &&
    effectiveStatus !== 'pending' &&
    effectiveStatus !== 'approved';
  const showSaveDraft =
    canWarehouseOperate &&
    isReadyForWarehouseWork &&
    effectiveStatus !== 'pending' &&
    effectiveStatus !== 'approved' &&
    currentSelectionTotal > 0;
  const showSaveAndPickUp =
    canWarehouseOperate &&
    isReadyForWarehouseWork &&
    effectiveStatus !== 'pending' &&
    effectiveStatus !== 'approved' &&
    (currentSelectionTotal > 0 || totalDraft > 0);
  const showAcceptRequest =
    canWarehouseOperate &&
    !!data.id &&
    (effectiveStatus === 'pending' || effectiveStatus === 'approved');

  const mapToWarehouseItems = (items: RequestDetailLineItem[]) =>
    items.map((it) => ({
      id: it.no,
      productId: it.productId,
      itemName: it.itemName,
      quantity: clampInt(it.quantityToReturn),
      receivedQuantity: clampInt(it.warehouseSentQuantity),
      businessUnit: it.businessUnit,
      uom: it.uom,
    }));

  const getMaxSelectableQty = (item: RequestDetailLineItem, currentDraftQty = clampInt(draftByProductId[item.productId])) => {
    const requested = clampInt(item.quantityToReturn);
    const sent = clampInt(item.warehouseSentQuantity);
    const remaining = Math.max(0, requested - sent - currentDraftQty);
    const stock = Number(itemDetailMap[item.productId]?.stock);
    const hasKnownStock = Number.isFinite(stock);

    if (hasKnownStock) {
      return Math.max(0, Math.min(remaining, stock));
    }

    return remaining;
  };

  const emitWarehouseUpdate = (next: {
    status: 'Pending' | 'Approved' | 'In Progress' | 'Partial' | 'Completed' | 'Ready To Pick Up' | 'Rejected';
    items: RequestDetailLineItem[];
    shipments?: Shipment[];
  }) => {
    onChange?.({
      id: data.id,
      requestId: data.requestId,
      requestDate: data.requestDate,
      requester: data.requestedBy ?? (request as any)?.requester ?? 'Requester',
      priority: String(data.priority || 'normal').replace(/^./, (s) => s.toUpperCase()),
      status: next.status,
      items: mapToWarehouseItems(next.items),
      shipments: next.shipments,
      pickupDate: next.status === 'Completed' ? new Date().toISOString() : (request as any)?.pickupDate,
      pickedUpBy: next.status === 'Completed' ? data.warehouseBy ?? 'Warehouse' : (request as any)?.pickedUpBy,
    });
  };

  const handleConfirmPickupRequest = async () => {
    if (!canWarehouseOperate) {
      message.error('You are not allowed to confirm pickup.');
      return;
    }

    if (!onConfirmPickup || !data.id || !confirmPickupShipmentId) {
      message.warning('Pickup confirmation is not available.');
      return;
    }

    setConfirmPickupLoading(true);
    try {
      await onConfirmPickup({ id: data.id, fulfillmentId: confirmPickupShipmentId });
      setConfirmPickupPopupOpen(false);
      setConfirmPickupShipmentId(null);
      message.success('Pickup confirmed successfully.');
    } catch (_error) {
      message.error('Failed to confirm pickup.');
    } finally {
      setConfirmPickupLoading(false);
    }
  };

  const handleGeneratePickupQr = async (shipment: Shipment) => {
    if (!canWarehouseOperate) {
      message.error('You are not allowed to generate pickup QR.');
      return;
    }

    if (!data.id) {
      message.warning('Pickup QR is not available.');
      return;
    }

    if (!onGeneratePickupQr) {
      if (shipment.pickupQrToken) {
        setPickupQrShipmentId(shipment.id);
        setPickupQrModalOpen(true);
      } else {
        message.warning('Pickup QR generation is not available.');
      }
      return;
    }

    setPickupQrLoading(true);
    try {
      await onGeneratePickupQr({ id: data.id, fulfillmentId: shipment.id });
      setPickupQrShipmentId(shipment.id);
      setPickupQrModalOpen(true);
      message.success('Pickup QR generated successfully.');
    } catch (_error) {
      message.error('Failed to generate pickup QR.');
    } finally {
      setPickupQrLoading(false);
    }
  };

  const handleAcceptRequest = async () => {
    if (!canWarehouseOperate) {
      message.error('You are not allowed to accept request.');
      return;
    }

    if (!data.id || !onAcceptRequest) {
      message.warning('Accept request is not available.');
      return;
    }

    setAcceptLoading(true);
    try {
      await onAcceptRequest(data.id);
      emitWarehouseUpdate({
        status: 'In Progress',
        items: workingItems,
        shipments: shipmentBatches,
      });
      message.success('Request accepted successfully.');
    } catch (_error) {
      message.error('Failed to accept request.');
    } finally {
      setAcceptLoading(false);
    }
  };

  const handleConfirmRequester = () => {
    if (!canWarehouseOperate) {
      message.error('You are not allowed to confirm requester.');
      return;
    }

    const nextDraftStatus: RequestStatus = totals.totalSent > 0 ? 'partial' : 'in-progress';
    setStatusOverride(nextDraftStatus);
    setActivityLogs((prev) => [
      ...prev,
      {
        label: 'Confirmed',
        description: 'Warehouse confirmed requester and started processing',
        date: new Date().toISOString(),
        by: currentActor,
        dot: 'done',
      },
    ]);

    emitWarehouseUpdate({
      status: 'In Progress',
      items: workingItems,
      shipments: shipmentBatches,
    });
    message.success('Requester confirmed. Status is now In Progress.');
  };

  // ─── SAVE (Draft) ───────────────────────────────────────────────────────────
  // Accumulates current "Select Amount" inputs into the running draft.
  // Does NOT create a shipment card. Can be called many times.
  const handleSave = () => {
    if (!canWarehouseOperate) {
      message.error('You are not allowed to save.');
      return;
    }

    const hasAnyChange = Object.values(sendingByProductId).some((v) => v > 0);
    if (!hasAnyChange) {
      message.warning('No new amounts to save. Please enter a quantity first.');
      return;
    }

    const nextDraft = { ...draftByProductId };
    Object.entries(sendingByProductId).forEach(([pid, qty]) => {
      nextDraft[pid] = (nextDraft[pid] || 0) + qty;
    });
    const hasUnavailableQty = workingItems.some((item) => {
      const stock = Number(itemDetailMap[item.productId]?.stock);
      const hasKnownStock = Number.isFinite(stock);
      return hasKnownStock && clampInt(nextDraft[item.productId]) > Math.max(0, stock);
    });
    if (hasUnavailableQty) {
      message.error('Unavailable quantity. Please keep Select Amount within available stock.');
      return;
    }
    const lines = workingItems
      .map((item) => ({
        requestLineId: Number(item.requestLineId || 0),
        issueQty: Math.min(clampInt(nextDraft[item.productId]), getMaxSelectableQty(item, 0)),
      }))
      .filter((item) => item.requestLineId > 0 && item.issueQty > 0);

    if (!onSaveDraft || !data.id) {
      message.warning('Draft save is not available.');
      return;
    }

    onSaveDraft({ id: data.id, lines })
      .then(() => {
        setDraftByProductId(nextDraft);
        setSendingByProductId((prev) => {
          const cleared = { ...prev };
          Object.keys(cleared).forEach((k) => (cleared[k] = 0));
          return cleared;
        });
        const nextDraftStatus: RequestStatus =
          shipmentBatches.length > 0 || totals.totalSent > 0 || data.status === 'partial'
            ? 'partial'
            : 'in-progress';
        setStatusOverride(nextDraftStatus);
        emitWarehouseUpdate({
          status: nextDraftStatus === 'partial' ? 'Partial' : 'In Progress',
          items: workingItems,
          shipments: shipmentBatches,
        });
        message.success('Draft saved successfully.');
      })
      .catch(() => {
        message.error('Failed to save draft.');
      });
  };

  const handleDeleteDraft = () => {
    if (!totalDraft || !data.id) return;

    Modal.confirm({
      title: 'Delete draft',
      content: 'Are you sure you want to delete this draft?',
      okText: 'Confirm',
      cancelText: 'Cancel',
      okButtonProps: { danger: true, loading: draftDeleteLoading },
      onOk: async () => {
        setDraftDeleteLoading(true);
        try {
          if (onDeleteDraft && typeof data.id === 'number') {
            await onDeleteDraft(data.id);
          }
          setStatusOverride(null);
          setDraftByProductId({});
          setSendingByProductId((prev) => {
            const cleared = { ...prev };
            Object.keys(cleared).forEach((key) => {
              cleared[key] = 0;
            });
            return cleared;
          });
          message.success('Draft deleted successfully.');
        } catch (_error) {
          message.error('Failed to delete draft.');
          throw _error;
        } finally {
          setDraftDeleteLoading(false);
        }
      },
    });
  };

  // ─── SAVE & PICK UP ─────────────────────────────────────────────────────────
  // Commits current draft (+ any new inputs) into a shipment batch card.
  // The card will show a "Confirm Picked" button for warehouse to press
  // after the requester physically comes to pick up.
  const handleSaveAndPickUp = () => {
    if (!canWarehouseOperate) {
      message.error('You are not allowed to operate.');
      return;
    }
    const mergedDraft = { ...draftByProductId };
    Object.entries(sendingByProductId).forEach(([pid, qty]) => {
      mergedDraft[pid] = (mergedDraft[pid] || 0) + qty;
    });
    const hasUnavailableQty = workingItems.some((item) => {
      const stock = Number(itemDetailMap[item.productId]?.stock);
      const hasKnownStock = Number.isFinite(stock);
      return hasKnownStock && clampInt(mergedDraft[item.productId]) > Math.max(0, stock);
    });
    if (hasUnavailableQty) {
      message.error('Unavailable quantity. Please keep Select Amount within available stock.');
      return;
    }
    if (onIssueRequest && data.id) {
      const lines = workingItems
        .map((item) => ({
          requestLineId: Number(item.requestLineId || 0),
          issueQty: Math.min(clampInt(mergedDraft[item.productId]), getMaxSelectableQty(item, 0)),
        }))
        .filter((item) => item.requestLineId > 0 && item.issueQty > 0);
      if (lines.length === 0) {
        message.warning('No valid request lines were found to issue.');
        return;
      }
      onIssueRequest({ id: data.id, lines })
        .then(() => {
          setDraftByProductId({});
          setSendingByProductId((prev) => {
            const cleared = { ...prev };
            Object.keys(cleared).forEach((k) => (cleared[k] = 0));
            return cleared;
          });
          emitWarehouseUpdate({
            status: 'Ready To Pick Up',
            items: workingItems,
            shipments: shipmentBatches,
          });
          message.success('Request issued successfully.');
        })
        .catch(() => {
          message.error('Failed to issue request.');
        });
      return;
    }
    message.warning('Issue action is not available for this request.');
  };

  const columns: ColumnsType<RequestDetailLineItem> = [
    { title: 'No', dataIndex: 'no', key: 'no', width: 40 },
    {
      title: 'Product ID',
      dataIndex: 'productId',
      width: 'auto',
      render: (_: unknown, record) => (
        <Typography.Link
          onClick={(event) => {
            event.preventDefault();
            openProductDetails(record);
          }}
        >
          {record.productId}
        </Typography.Link>
      ),
    },
    { title: 'Item Name', dataIndex: 'itemName', ellipsis: true },
    { title: 'Qty Requested', dataIndex: 'quantityToReturn', width: 'auto', align: 'right' as const },
    {
      title: 'Qty Sent',
      key: 'sent',
      width: 'auto',
      align: 'right' as const,
      render: (_: unknown, record) => clampInt(record.warehouseSentQuantity),
    },
    {
      title: 'Draft',
      key: 'draft',
      width: 'auto',
      align: 'right' as const,
      render: (_: unknown, record) => {
        const d = clampInt(draftByProductId[record.productId]);
        return d > 0 ? <Text type="warning">{d}</Text> : <Text type="secondary">0</Text>;
      },
    },
     {
      title: 'UoM',
      dataIndex: 'uom',
      key: 'uom',
      ellipsis: true,
      width: 'auto'
    },
    {
      title: 'Select Amount',
      key: 'selectAmount',
      width: 'auto',
      render: (_: unknown, record) => {
        const current = clampInt(sendingByProductId[record.productId]);
        const stock = Number(itemDetailMap[record.productId]?.stock);
        const hasKnownStock = Number.isFinite(stock);
        const maxSelectableQty = getMaxSelectableQty(record);
        const isFullySent = maxSelectableQty <= 0;
        const isOutOfStock = hasKnownStock && stock <= 0;
        const exceedsAvailableQty = hasKnownStock && current > Math.max(0, stock);
        const requestedQty = clampInt(record.quantityToReturn);
        const sentQty = clampInt(record.warehouseSentQuantity);
        const draftedQty = clampInt(draftByProductId[record.productId]);
        const remainingRequestQty = Math.max(0, requestedQty - sentQty - draftedQty);
        const exceedsRemainingRequestQty = current > remainingRequestQty;
        return (
          <div style={{ width: '100%', maxWidth: 140 }}>
            <InputNumber
              style={{ width: '100%' }}
              status={exceedsRemainingRequestQty || exceedsAvailableQty || isOutOfStock ? 'error' : undefined}
              value={current}
              min={1}
              max={hasKnownStock ? Math.max(0, stock) : undefined}
              disabled={!canSelectAmount || draftDeleteLoading || isFullySent}
              onChange={(v) =>
                setSendingByProductId((prev) => ({
                  ...prev,
                  [record.productId]: clampInt(v),
                }))
              }
            />
            {exceedsRemainingRequestQty ? (
              <Text
                type="danger"
                style={{ display: 'block', width: '100%', fontSize: 12, whiteSpace: 'normal', wordBreak: 'break-word' }}
              >
                Unavailable. Remaining qty is {remainingRequestQty}.
              </Text>
            ) : isOutOfStock ? (
              <Text
                type="danger"
                style={{ display: 'block', width: '100%', fontSize: 12, whiteSpace: 'normal', wordBreak: 'break-word' }}
              >
                Unavailable. Available qty is 0.
              </Text>
            ) : exceedsAvailableQty ? (
              <Text
                type="danger"
                style={{ display: 'block', width: '100%', fontSize: 12, whiteSpace: 'normal', wordBreak: 'break-word' }}
              >
                Unavailable. Max available qty is {stock}.
              </Text>
            ) : null}
          </div>
        );
      },
    },
  ];

  // ─── Shipment Batch Cards ────────────────────────────────────────────────────
  const orderedShipmentBatches = useMemo(
    () => [...shipmentBatches].sort((left, right) => right.shipmentNo - left.shipmentNo),
    [shipmentBatches],
  );
  const selectedPickupQrShipment = pickupQrShipmentId
    ? shipmentBatches.find((shipment) => shipment.id === pickupQrShipmentId)
    : undefined;
  const confirmPickupShipment = confirmPickupShipmentId
    ? shipmentBatches.find((shipment) => shipment.id === confirmPickupShipmentId)
    : undefined;

  const shipmentCards = orderedShipmentBatches.map((shipment) => {
    const isCompleted = shipment.status === 'completed';
    const isQrGenerated = shipment.status === 'qr_generated';
    const cardTitle = (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {isCompleted ? (
          <CheckCircleOutlined style={{ color: '#52c41a' }} />
        ) : (
          <ClockCircleOutlined style={{ color: '#faad14' }} />
        )}
        <span>Shipment #{shipment.shipmentNo}</span>
        <Tag
          color={isCompleted ? 'success' : isQrGenerated ? 'processing' : 'warning'}
          bordered={false}
          style={{ marginLeft: 4 }}
        >
          {isCompleted ? 'Picked Up' : isQrGenerated ? 'QR Generated' : 'Pending'}
        </Tag>
      </div>
    );

    const cardExtra = isCompleted ? (
      <Text type="secondary" style={{ fontSize: 12 }}>
        Confirmed: {formatSpfDateTime(shipment.confirmedAt)}
      </Text>
    ) : (
      <div style={{ padding: '8px 0' }}>
        <Space>
          <Button
            loading={pickupQrLoading && pickupQrShipmentId === shipment.id}
            onClick={() => handleGeneratePickupQr(shipment)}
          >
            {isQrGenerated ? 'Re-generate QR' : 'Generate QR'}
          </Button>
          <Button
            type="primary"
            onClick={() => {
              setConfirmPickupShipmentId(shipment.id);
              setConfirmPickupPopupOpen(true);
            }}
          >
            Confirm Pick up
          </Button>
        </Space>
      </div>
    );

    return (
      <Card
        key={shipment.id}
        size="small"
        style={{
          marginBottom: 12,
          borderColor: isCompleted ? '#b7eb8f' : '#ffd591',
          background: isCompleted ? '#f6ffed' : '#fffbe6',
        }}
        title={cardTitle}
        extra={cardExtra}
      >
        <div style={{ marginBottom: 6 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Created by {shipment.createdBy} · {formatSpfDateTime(shipment.createdAt)}
          </Text>
        </div>
        <Table
          size="small"
          rowKey="productId"
          pagination={false}
          dataSource={shipment.lines}
          columns={[
            { title: 'Product ID', dataIndex: 'productId', width: 140 },
            { title: 'Item Name', dataIndex: 'itemName', ellipsis: true },
            { title: 'UoM', dataIndex: 'uom', width: 90 },
            { title: 'Qty Sent', dataIndex: 'quantity', width: 90, align: 'right' as const },
          ]}
        />
      </Card>
    );
  });

  // ─── Draft Preview Card ──────────────────────────────────────────────────────
  // Shows when there are accumulated draft quantities not yet committed
  const draftLines = workingItems
    .map((it) => ({ ...it, draftQty: clampInt(draftByProductId[it.productId]) }))
    .filter((it) => it.draftQty > 0);

  const draftPreviewCard =
    draftLines.length > 0 ? (
      <Card
        size="small"
        style={{ marginBottom: 12, borderColor: '#91caff', background: '#e6f4ff', borderStyle: 'dashed' }}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Badge status="processing" />
            <span>Current Draft (not yet committed)</span>
            <Tag color="blue" bordered={false}>
              {totalDraft} item(s) staged
            </Tag>
          </div>
        }
        extra={
          showSaveAndPickUp ? (
            <div style={{ padding: '8px 0' }}>
              <Space>
                <Button danger onClick={handleDeleteDraft} loading={draftDeleteLoading}>
                  Delete
                </Button>
                <Button type="primary" onClick={handleSaveAndPickUp} disabled={draftDeleteLoading}>
                  Save &amp; Pick up
                </Button>
              </Space>
            </div>
          ) : null
        }
      >
        <Table
          size="small"
          rowKey="productId"
          pagination={false}
          dataSource={draftLines}
          columns={[
            { title: 'Product ID', dataIndex: 'productId', width: 140 },
            { title: 'Item Name', dataIndex: 'itemName', ellipsis: true },
            { title: 'UoM', dataIndex: 'uom', width: 90 },
            { title: 'Draft Qty', dataIndex: 'draftQty', width: 90, align: 'right' as const },
          ]}
        />
      </Card>
    ) : null;

  return (
    <>
      <Drawer
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
            <span>Request Details</span>
            {showAcceptRequest ? (
              <Button type="primary" loading={acceptLoading} onClick={handleAcceptRequest}>
                Accept
              </Button>
            ) : null}
          </div>
        }
        width="60%"
        placement="right"
        onClose={handleClose}
        open={open}
        bodyStyle={{ padding: 16, backgroundColor: '#fafafa' }}
        headerStyle={{ borderBottom: '1px solid #f0f0f0' }}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Space>
              {showSaveDraft ? (
                <Button onClick={handleSave} disabled={draftDeleteLoading}>
                  Save (Draft)
                </Button>
              ) : null}
            </Space>
            <Space>
              {showSaveAndPickUp ? (
                <Button type="primary" onClick={handleSaveAndPickUp} disabled={draftDeleteLoading}>
                  Save &amp; Pick up
                </Button>
              ) : null}
            </Space>
          </div>
        }
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
            <Tag color={displayedStatusColor} bordered={false}>
              {displayedStatusLabel}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Request ID">{data.requestId}</Descriptions.Item>
          <Descriptions.Item label="Category">{data.category ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="Priority">{data.priority ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="Total Items">{data.totalItems}</Descriptions.Item>
          <Descriptions.Item label="Sent Qty">
            {totals.totalSent} / {totals.totalRequested}
          </Descriptions.Item>
          {/* <Descriptions.Item label="Request Date">{formatSpfDateTime(data.requestDate)}</Descriptions.Item> */}
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
                : effectiveStatus === 'completed' && index === STATUS_STEPS.length - 1
                  ? 'finish'
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
    tableLayout="auto"
    pagination={false}
    columns={columns}
    dataSource={workingItems}
          style={{ marginBottom: 24 }}
        />

        {/* Draft preview card — shows staged-but-not-committed quantities */}
        {draftPreviewCard}

        {/* Committed shipment batch cards */}
        {shipmentBatches.length > 0 && (
          <>
            <Title level={5} style={{ marginBottom: 12 }}>
              Shipment Batches
            </Title>
            {shipmentCards}
          </>
        )}

        <Title level={5} style={{ marginBottom: 16, marginTop: 24 }}>
          Recent Activities
        </Title>
        <Timeline
          style={{ marginBottom: 24 }}
          items={displayActivityLogs.map((a) => {
            const shipmentNo = parseActivityShipmentNo(a.label, a.description) ?? -1;
            const matchedBatch = shipmentNo > 0
              ? orderedShipmentBatches.find((shipment) => shipment.shipmentNo === shipmentNo)
              : undefined;
            const batchLines: ShipmentLine[] = (matchedBatch?.lines ?? []) as ShipmentLine[];
            const isPartialIssueEntry = /^partial issue #\d+$/i.test(String(a.label || '').trim());
            const isExpandable = batchLines.length > 0 && isPartialIssueEntry;
            const isExpanded = isExpandable && expandedShipmentBatchNos.includes(shipmentNo);

            const toggleExpanded = () => {
              if (!isExpandable) return;
              setExpandedShipmentBatchNos((prev: number[]) =>
                prev.includes(shipmentNo)
                  ? prev.filter((n: number) => n !== shipmentNo)
                  : [...prev, shipmentNo].sort((x, y) => x - y),
              );
            };

            const shipmentItems = batchLines.map((l) => ({
              productId: l.productId,
              itemName: l.itemName,
              uom: l.uom,
              quantity: l.quantity,
            }));

            const expandedTable =
              isExpandable && isExpanded ? (
                <div style={{ marginTop: 8 }}>
          <Table
            size="small"
            rowKey="productId"
            tableLayout="auto"
            pagination={false}
            dataSource={shipmentItems}
                    columns={[
                      { title: 'Product ID', dataIndex: 'productId' },
                      { title: 'Item Name', dataIndex: 'itemName', ellipsis: true },
                      { title: 'UoM', dataIndex: 'uom', width: 90 },
                      { title: 'Qty Sent', dataIndex: 'quantity', align: 'right' as const },
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
                  {expandedTable}
                </div>
              ),
            };
          })}
        />

        
      </Drawer>

      <ValidationPopup
        open={confirmPickupPopupOpen}
        title="Confirm Pick up"
        description={
          confirmPickupShipment
            ? `Confirm that the requester has picked up Shipment #${confirmPickupShipment.shipmentNo}?`
            : 'Confirm that the requester has picked up the prepared spare parts?'
        }
        confirmText="Confirm"
        loading={confirmPickupLoading}
        onCancel={() => {
          setConfirmPickupPopupOpen(false);
          setConfirmPickupShipmentId(null);
        }}
        onConfirm={() => handleConfirmPickupRequest()}
      />

      <Modal
        title="Pickup QR Code"
        open={pickupQrModalOpen}
        centered
        footer={null}
        maskClosable={false}
        keyboard={false}
        onCancel={() => {
          setPickupQrModalOpen(false);
          setPickupQrShipmentId(null);
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          {selectedPickupQrShipment?.pickupQrToken ? (
            <QRCode value={selectedPickupQrShipment.pickupQrToken} size={220} />
          ) : (
            <Text type="secondary">No pickup QR code is available yet.</Text>
          )}
          <Text strong>{data.requestId}</Text>
          {selectedPickupQrShipment?.pickupQrToken ? (
            <Text copyable style={{ textAlign: 'center', wordBreak: 'break-all' }}>
              {selectedPickupQrShipment.pickupQrToken}
            </Text>
          ) : null}
          <Text type="secondary">
            Generated: {formatDateTime(selectedPickupQrShipment?.pickupQrGeneratedAt)}
          </Text>
          <Text type="secondary">
            Expires: {formatDateTime(selectedPickupQrShipment?.pickupQrExpiredAt)}
          </Text>
        </div>
      </Modal>

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
        canManageImages={canWarehouseOperate}
        onUploadImages={handleUploadProductImages}
        onDeleteImage={handleDeleteProductImage}
      />
    </>
  );
}

