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
  Popconfirm,
  Badge,
} from 'antd';
import { DownOutlined, RightOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useAccess, useModel } from '@umijs/max';
import SpfDetails from '../spare-part-request/SpfDetails';
import type { MyRequestItem, RequestPriority, RequestStatus, SparePartType } from '../spare-part-request/data';
import type { WarehouseRequestRecord } from './requestsWarehouse.shared';
import type { Shipment, ShipmentLine } from '../shipmentsStore';
import { formatSpfDateTime } from '../shared/dateTime';

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
  onConfirmPickup?: (id: number) => Promise<void>;
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
  if (normalized === 'confirmed') return 3;
  if (normalized === 'ready to pick up') return 4;
  if (normalized === 'confirm pick up') return 5;
  if (/^partial issue #\d+$/i.test(normalized)) return 6;
  if (normalized === 'completed') return 7;
  return 8;
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
  onConfirmPickup,
}: DrawerBatchReturnItemsProps) {
  const access = useAccess();
  const currentUser = useModel('@@initialState');
  const initKeyRef = useRef<string>('');

  const [spfOpen, setSpfOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<RequestDetailLineItem | null>(null);
  const [statusOverride, setStatusOverride] = useState<RequestStatus | null>(null);
  const [activityLogs, setActivityLogs] = useState<RequestDetailActivity[]>([]);
  // Current input quantities (what user is typing right now, not yet saved)
  const [sendingByProductId, setSendingByProductId] = useState<SendingMap>({});
  // Accumulated draft across multiple Save clicks (not yet committed to a shipment)
  const [draftByProductId, setDraftByProductId] = useState<SendingMap>({});
  const [workingItems, setWorkingItems] = useState<RequestDetailLineItem[]>([]);
  // Committed shipment batches (each one is a Save & Pick up result)
  const [shipmentBatches, setShipmentBatches] = useState<Shipment[]>([]);
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
      warehouse: it.toWarehouseCode ?? req?.type,
      zone: it.zone,
      shelf: it.shelf,
      level: it.level,
      company: it.company,
      category: it.category,
      sparePartType: it.sparePartType ?? it.type ?? req?.type,
      businessUnit: it.businessUnit ?? it.unit,
      uom: it.uom ?? it.unit,
    }));
    return {
      id: req?.id,
      requestId: req?.requestId ?? '',
      requestDate: req?.requestDate ?? '',
      status: normalizeWarehouseStatus(req?.requestStatus || req?.status || 'pending'),
      priority: req?.priority as RequestPriority,
      type: (req?.type || items.find((item) => item.sparePartType)?.sparePartType) as SparePartType,
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

  const effectiveStatus: RequestStatus = useMemo(() => {
    if (statusOverride) return statusOverride;

    const hasReadyToPickupShipment = shipmentBatches.some((s) => s.status !== 'completed');

    if (data.status === 'completed') return 'completed';
    if (data.status === 'ready_to_Pickup') return 'ready_to_Pickup';
    if (data.status === 'partial') return 'partial';
    if (data.status === 'in-progress') return 'in-progress';
    if (data.status === 'approved') return 'approved';
    if (data.status === 'rejected') return 'rejected';

    if (hasReadyToPickupShipment) return 'ready_to_Pickup';

    if (totals.totalRequested > 0 && totals.totalSent >= totals.totalRequested) return 'completed';
    if (totals.totalSent > 0 && totals.totalSent < totals.totalRequested) return 'partial';

    return 'pending';
  }, [data.status, shipmentBatches, statusOverride, totals.totalRequested, totals.totalSent]);

  const displayedStatusLabel =
    effectiveStatus === 'approved' ? 'Pending' : statusLabelMap[effectiveStatus];
  const displayedStatusColor =
    effectiveStatus === 'approved' ? statusColorMap.pending : statusColorMap[effectiveStatus];
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
      data.shipments?.length || 0,
      (data.draftItems || []).map((item) => `${item.requestLineId}:${item.draftQty}`).join(','),
      data.items.map((item) => `${item.requestLineId}:${item.warehouseSentQuantity || 0}`).join(','),
    ].join('|');
    if (initKeyRef.current === initKey) return;
    initKeyRef.current = initKey;

    setSpfOpen(false);
    setSelectedProduct(null);
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

  const handleClose = () => {
    initKeyRef.current = '';
    setSpfOpen(false);
    setSelectedProduct(null);
    setStatusOverride(null);
    setActivityLogs([]);
    setSendingByProductId({});
    setDraftByProductId({});
    setExpandedShipmentBatchNos([]);
    onClose?.();
  };

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
      requested_date: data.requestDate,
    };
  }, [data.requestDate, selectedProduct]);

  const displayActivityLogs = useMemo(() => {
    let readyCount = 0;
    let partialIssueCount = 0;

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
  }, [activityLogs, data.requestDate]);

  const canWarehouseOperate = access.canSpfWarehouseStaff || access.canAdmin;
  const isReadyForWarehouseWork = effectiveStatus !== 'rejected' && effectiveStatus !== 'completed';
  const showConfirmPickup = canWarehouseOperate && !!data.id && effectiveStatus === 'ready_to_Pickup';
  const showSaveDraft = canWarehouseOperate && isReadyForWarehouseWork && effectiveStatus !== 'ready_to_Pickup' && currentSelectionTotal > 0;
  const showSaveAndPickUp =
    canWarehouseOperate &&
    isReadyForWarehouseWork &&
    effectiveStatus !== 'ready_to_Pickup' &&
    (currentSelectionTotal > 0 || totalDraft > 0);

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

  const handleConfirmPickupRequest = () => {
    if (!canWarehouseOperate) {
      message.error('You are not allowed to confirm pickup.');
      return;
    }

    if (!onConfirmPickup || !data.id) {
      message.warning('Pickup confirmation is not available.');
      return;
    }

    onConfirmPickup(data.id)
      .then(() => {
        const confirmedBy =
          currentUser.initialState?.currentUser?.login || data.warehouseBy || 'Warehouse';
        const latestReadyShipment = [...shipmentBatches]
          .sort((left, right) => right.shipmentNo - left.shipmentNo)
          .find((shipment) => shipment.status !== 'completed');
        const confirmedShipmentNo = latestReadyShipment?.shipmentNo ?? shipmentBatches.length;
        const nextStatus =
          totals.totalRequested > 0 && totals.totalSent >= totals.totalRequested ? 'completed' : 'partial';

        setStatusOverride(nextStatus);
        setActivityLogs((prev) => [
          ...prev,
          {
            label: 'Confirm Pick up',
            description: `Shipment #${Math.max(1, confirmedShipmentNo)} pickup confirmed`,
            date: new Date().toISOString(),
            by: confirmedBy,
            dot: 'done',
          },
          ...(nextStatus === 'partial'
            ? [
                {
                  label: `Partial Issue #${Math.max(1, confirmedShipmentNo)}`,
                  description: `Shipment #${Math.max(1, confirmedShipmentNo)} was picked up, but the request is still partially issued.`,
                  date: new Date().toISOString(),
                  by: data.requestedBy ?? 'Requester',
                  dot: 'done' as const,
                },
              ]
            : [
                {
                  label: 'Completed',
                  description: 'All issued items have been picked up.',
                  date: new Date().toISOString(),
                  by: data.requestedBy ?? 'Requester',
                  dot: 'done' as const,
                },
              ]),
        ]);
        message.success('Pickup confirmed successfully.');
      })
      .catch(() => {
        message.error('Failed to confirm pickup.');
      });
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
    const lines = workingItems
      .map((item) => ({
        requestLineId: Number(item.requestLineId || 0),
        issueQty: clampInt(nextDraft[item.productId]),
      }))
      .filter((item) => item.requestLineId > 0 && item.issueQty > 0);

    if (!onSaveDraft || !data.id) {
      message.warning('Draft save is not available.');
      return;
    }

    onSaveDraft({ id: data.id, lines })
      .then(() => {
        setSendingByProductId((prev) => {
          const cleared = { ...prev };
          Object.keys(cleared).forEach((k) => (cleared[k] = 0));
          return cleared;
        });
        setStatusOverride('in-progress');
        message.success('Draft saved successfully.');
      })
      .catch(() => {
        message.error('Failed to save draft.');
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
    if (onIssueRequest && data.id) {
      const lines = workingItems
        .map((item) => ({
          requestLineId: Number(item.requestLineId || 0),
          issueQty: clampInt(mergedDraft[item.productId]),
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
            setSelectedProduct(record);
            setSpfOpen(true);
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
        const requested = clampInt(record.quantityToReturn);
        const sent = clampInt(record.warehouseSentQuantity);
        const draft = clampInt(draftByProductId[record.productId]);
        const remaining = Math.max(0, requested - sent - draft);
        const current = clampInt(sendingByProductId[record.productId]);
        return (
          <InputNumber
            style={{ width: '100%' }}
            value={Math.min(current, remaining)}
            min={0}
            max={remaining}
            disabled={!canWarehouseOperate || !isReadyForWarehouseWork || remaining <= 0}
            onChange={(v) =>
              setSendingByProductId((prev) => ({
                ...prev,
                [record.productId]: Math.min(clampInt(v), remaining),
              }))
            }
          />
        );
      },
    },
  ];

  // ─── Shipment Batch Cards ────────────────────────────────────────────────────
  const orderedShipmentBatches = useMemo(
    () => [...shipmentBatches].sort((left, right) => right.shipmentNo - left.shipmentNo),
    [shipmentBatches],
  );

  const shipmentCards = orderedShipmentBatches.map((shipment) => {
    const isCompleted = shipment.status === 'completed';
    const cardTitle = (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {isCompleted ? (
          <CheckCircleOutlined style={{ color: '#52c41a' }} />
        ) : (
          <ClockCircleOutlined style={{ color: '#faad14' }} />
        )}
        <span>Shipment #{shipment.shipmentNo}</span>
        <Tag
          color={isCompleted ? 'success' : 'warning'}
          bordered={false}
          style={{ marginLeft: 4 }}
        >
          {isCompleted ? 'Picked Up' : 'Ready to Pick up'}
        </Tag>
      </div>
    );

    const cardExtra = isCompleted ? (
      <Text type="secondary" style={{ fontSize: 12 }}>
        Confirmed: {formatSpfDateTime(shipment.confirmedAt)}
      </Text>
    ) : null;

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
          <Text type="secondary" style={{ fontSize: 12 }}>
            Click "Save & Pick up" to commit this draft as a shipment
          </Text>
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
        title="Request Details (Warehouse)"
        width="60%"
        placement="right"
        onClose={handleClose}
        open={open}
        bodyStyle={{ padding: 16, backgroundColor: '#fafafa' }}
        headerStyle={{ borderBottom: '1px solid #f0f0f0' }}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Space>
              {showConfirmPickup ? (
                <Popconfirm
                  title="Confirm Pick up"
                  description="Confirm that the requester has picked up the prepared spare parts?"
                  okText="Confirm"
                  cancelText="Cancel"
                  onConfirm={handleConfirmPickupRequest}
                >
        
                  <Button type="primary">
                    Confirm Pick up
                  </Button>
                </Popconfirm>
              ) : null}
              {showSaveDraft ? (
                <Button onClick={handleSave}>
                  Save (Draft)
                </Button>
              ) : null}
              {showSaveAndPickUp ? (
                <Button type="primary" onClick={handleSaveAndPickUp}>
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
          <Descriptions.Item label="No">{data.id ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="Request ID">{data.requestId}</Descriptions.Item>
          <Descriptions.Item label="Type">{data.type ?? '—'}</Descriptions.Item>         
          <Descriptions.Item label="Priority">{data.priority ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="Total Items">{data.totalItems}</Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={displayedStatusColor} bordered={false}>
              {displayedStatusLabel}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Sent Qty">
            {totals.totalSent} / {totals.totalRequested}
          </Descriptions.Item>
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

      <SpfDetails
        open={open && spfOpen}
        data={spfData}
        onClose={() => {
          setSpfOpen(false);
          setSelectedProduct(null);
        }}
      />
    </>
  );
}

