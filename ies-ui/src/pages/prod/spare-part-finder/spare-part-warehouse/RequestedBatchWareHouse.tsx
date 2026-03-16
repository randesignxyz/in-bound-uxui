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
import dayjs from 'dayjs';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useAccess } from '@umijs/max';
import SpfDetails from '../spare-part-request/SpfDetails';
import type { MyRequestItem, RequestPriority, RequestStatus, SparePartType } from '../spare-part-request/data';
import type { WarehouseRequestRecord } from './requestsWarehouse.shared';
import { shipmentsStore } from '../shipmentsStore';
import type { Shipment, ShipmentLine } from '../shipmentsStore';

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

export interface RequestDetailLineItem {
  no: number;
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
}

export interface DrawerBatchReturnItemsProps {
  open: boolean;
  request?: WarehouseRequestRecord | MyRequestItem | null;
  data?: RequestDetailData | null;
  onClose?: () => void;
  onChange?: (updated: any) => void;
}

type SendingMap = Record<string, number>;

const clampInt = (v: unknown) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.floor(n));
};

export default function RequestedBatchWareHouse({ open, request, data: propData, onClose, onChange }: DrawerBatchReturnItemsProps) {
  const access = useAccess();
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
    const fallbackRequest = {
      id: req?.id ?? 0,
      requestId: req?.requestId ?? '-',
      priority: req?.priority ?? 'normal',
      requestDate: req?.requestDate ?? new Date().toISOString(),
      totalItems: req?.totalItems ?? (req?.items?.length || 0),
      receivedItems: req?.receivedItems ?? 0,
      requestStatus: (req?.requestStatus || req?.status || 'pending').toLowerCase().replace(/\s+/g, '_') as RequestStatus,
      remark: req?.remark ?? '',
      type: req?.type ?? 'MRO-W',
    };

    const realItems: any[] = req?.items ?? [];
    let items: RequestDetailLineItem[];

    if (realItems.length > 0) {
      items = realItems.map((it: any, i: number) => ({
        no: i + 1,
        productId: it.productId ?? `PRD-${String(fallbackRequest.id).padStart(3, '0')}-${String(i + 1).padStart(3, '0')}`,
        requestId: fallbackRequest.requestId,
        itemName: it.itemName ?? `Spare Part ${i + 1}`,
        quantityToReturn: Number(it.quantity) || 1,
        usedQuantity: 0,
        total: Number(it.quantity) || 1,
        warehouseSentQuantity: Number(it.receivedQuantity) || 0,
        stockQuantity: it.stockQuantity ?? 0,
        warehouse: fallbackRequest.type,
        zone: it.zone ?? '—',
        shelf: it.shelf ?? '—',
        level: it.level ?? '—',
        company: it.company ?? '—',
        category: it.category ?? '—',
        sparePartType: it.sparePartType ?? '—',
        businessUnit: it.businessUnit ?? '—',
      }));
    } else {
      items = Array.from(
        { length: Math.max(0, fallbackRequest.totalItems || 0) },
        (_, i) => {
          const no = i + 1;
          const productId = `PRD-${String(fallbackRequest.id).padStart(3, '0')}-${String(no).padStart(3, '0')}`;
          const quantityToReturn = 1;
          return {
            no,
            productId,
            requestId: fallbackRequest.requestId,
            itemName: `Spare Part ${no}`,
            quantityToReturn,
            usedQuantity: 0,
            total: quantityToReturn,
            warehouseSentQuantity: 0,
            stockQuantity: Math.max(0, Math.floor(Math.random() * 30)),
            warehouse: fallbackRequest.type,
            zone: 'A-307',
            shelf: '12',
            level: '02',
            company: 'Isobaric Valve Co.',
            category: 'Hydraulic',
            sparePartType: 'Control Valve',
            businessUnit: 'BU-001',
          };
        },
      );
    }

    return {
      id: fallbackRequest.id,
      requestId: fallbackRequest.requestId,
      requestDate: fallbackRequest.requestDate,
      status: fallbackRequest.requestStatus,
      priority: fallbackRequest.priority as RequestPriority,
      type: fallbackRequest.type as SparePartType,
      totalItems: items.length,
      receivedItems: fallbackRequest.receivedItems,
      remark: fallbackRequest.remark,
      requestedBy: req?.requester ?? req?.requestedBy ?? 'Requester',
      approvedBy: req?.approvedBy ?? 'Approver',
      warehouseBy: req?.warehouseBy ?? 'Warehouse',
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

  const effectiveStatus: RequestStatus = useMemo(() => {
    if (statusOverride) return statusOverride;
    if (totals.totalRequested > 0 && totals.totalSent >= totals.totalRequested) return 'completed';
    return data.status;
  }, [data.status, statusOverride, totals.totalRequested, totals.totalSent]);

  const currentStep = statusToCurrentStep(effectiveStatus);

  useEffect(() => {
    if (!open) {
      initKeyRef.current = '';
      return;
    }

    const initKey = `${data.requestId}`;
    if (initKeyRef.current === initKey) return;
    initKeyRef.current = initKey;

    setSpfOpen(false);
    setSelectedProduct(null);
    setStatusOverride(null);
    setShipmentBatches([]);
    setExpandedShipmentBatchNos([]);

    const nextSending: SendingMap = {};
    setWorkingItems(data.items);
    data.items.forEach((it) => {
      nextSending[it.productId] = 0;
    });
    setSendingByProductId(nextSending);
    setDraftByProductId({ ...nextSending });

    const baseLogs: RequestDetailActivity[] = [
      {
        label: 'Requested',
        description: 'Requester sent request (waiting for approval)',
        date: data.requestDate,
        by: data.requestedBy ?? 'Requester',
        dot: 'done',
      },
    ];
    if (data.status !== 'pending' && data.status !== 'rejected') {
      baseLogs.push({
        label: 'Approved',
        description: 'Request approved',
        date: data.requestDate,
        by: data.approvedBy ?? 'Approver',
        dot: 'done',
      });
    }

    const existingShipments = (data as any).shipments || [];
    setShipmentBatches(existingShipments);

    setActivityLogs(baseLogs);
  }, [data.approvedBy, data.items, data.requestDate, data.requestId, data.requestedBy, data.status, open]);

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

  const canWarehouseOperate = access.canSpfWarehouseStaff || access.canAdmin;

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

    // Merge current inputs into draft accumulator
    const nextDraft = { ...draftByProductId };
    Object.entries(sendingByProductId).forEach(([pid, qty]) => {
      nextDraft[pid] = (nextDraft[pid] || 0) + qty;
    });
    setDraftByProductId(nextDraft);

    // Clear the input row
    setSendingByProductId((prev) => {
      const cleared = { ...prev };
      Object.keys(cleared).forEach((k) => (cleared[k] = 0));
      return cleared;
    });

    setStatusOverride('in-progress');

    const addedCount = Object.values(sendingByProductId).filter((v) => v > 0).length;
    setActivityLogs((prev) => [
      ...prev,
      {
        label: 'Saved Draft',
        description: `Draft updated — ${addedCount} item type(s) staged (not yet ready for pick up)`,
        date: new Date().toISOString(),
        by: data.warehouseBy ?? 'Warehouse',
        dot: 'done',
      },
    ]);
    message.success('Draft saved. You can continue editing or click "Save & Pick up" when ready.');

    shipmentsStore.saveDraft(data.requestId, nextDraft);

    const updatedData = {
      ...data,
      status: 'In Progress' as any,
      items: workingItems.map((it) => ({
        ...it,
        draftQuantity: nextDraft[it.productId] || 0,
      })),
    };
    onChange?.(updatedData);
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

    // Merge current input with existing draft
    const mergedDraft = { ...draftByProductId };
    Object.entries(sendingByProductId).forEach(([pid, qty]) => {
      mergedDraft[pid] = (mergedDraft[pid] || 0) + qty;
    });

    const shipmentLines: ShipmentLine[] = workingItems
      .map((it) => ({
        productId: it.productId,
        itemName: it.itemName,
        quantity: clampInt(mergedDraft[it.productId]),
      }))
      .filter((l) => l.quantity > 0);

    if (shipmentLines.length === 0) {
      message.warning('Please save or enter amounts for at least one item before saving for pick up.');
      return;
    }

    // Update the sent quantities on working items
    const nextItems = workingItems.map((it) => {
      const toAdd = clampInt(mergedDraft[it.productId]);
      const requested = clampInt(it.quantityToReturn);
      const sent = clampInt(it.warehouseSentQuantity);
      return { ...it, warehouseSentQuantity: Math.min(requested, sent + toAdd) };
    });

    const shipmentNo = shipmentBatches.length + 1;
    const newShipment: Shipment = {
      id: `SHP-${Date.now()}`,
      shipmentNo,
      createdAt: new Date().toISOString(),
      createdBy: data.warehouseBy ?? 'Warehouse',
      lines: shipmentLines,
      status: 'ready_to_pickup',
    };

    const nextShipments = [...shipmentBatches, newShipment];
    setShipmentBatches(nextShipments);
    setWorkingItems(nextItems);

    // Clear draft and inputs
    setDraftByProductId({});
    setSendingByProductId((prev) => {
      const cleared = { ...prev };
      Object.keys(cleared).forEach((k) => (cleared[k] = 0));
      return cleared;
    });

    const nextTotalRequested = nextItems.reduce((sum, it) => sum + clampInt(it.quantityToReturn), 0);
    const nextTotalSent = nextItems.reduce((sum, it) => sum + clampInt(it.warehouseSentQuantity), 0);
    const allSent = nextTotalRequested > 0 && nextTotalSent >= nextTotalRequested;

    // Overall status: if all qty sent → ready_to_Pickup (will become completed after confirm picked)
    // Otherwise still ready_to_Pickup for this batch, overall stays ready_to_Pickup
    const nextStatus: RequestStatus = 'ready_to_Pickup';
    setStatusOverride(nextStatus);

    setActivityLogs((prev) => [
      ...prev,
      {
        label: `Ready to Pick up (Shipment #${shipmentNo})`,
        description: `Shipment #${shipmentNo} is ready for pick up — waiting for requester to collect`,
        date: new Date().toISOString(),
        by: data.warehouseBy ?? 'Warehouse',
        dot: 'pending', // pending = waiting for requester
      },
    ]);
    message.success(`Shipment #${shipmentNo} is now ready for pick up. Requester can come to collect.`);

    // Write to shared store
    shipmentsStore.addShipment(
      data.requestId,
      { id: newShipment.id, shipmentNo, createdAt: newShipment.createdAt, createdBy: newShipment.createdBy, lines: shipmentLines },
      allSent ? 'ready_to_Pickup' : 'ready_to_Pickup',
    );

    const updatedData = {
      ...data,
      status: 'Ready To Pick Up' as any,
      items: nextItems,
      shipments: nextShipments,
    };
    onChange?.(updatedData);
  };

  // ─── CONFIRM PICKED (per shipment card) ─────────────────────────────────────
  // Warehouse clicks this after requester comes and physically picks up.
  // Sets that shipment → completed. If all shipments completed → request completed.
  const handleConfirmPicked = (shipmentId: string) => {
    if (!canWarehouseOperate) {
      message.error('You are not allowed to confirm.');
      return;
    }

    const shipment = shipmentBatches.find((s) => s.id === shipmentId);
    if (!shipment) return;

    const updatedShipments = shipmentBatches.map((s) =>
      s.id === shipmentId
        ? { ...s, status: 'completed' as const, confirmedAt: new Date().toISOString(), confirmedBy: data.warehouseBy ?? 'Warehouse' }
        : s,
    );
    setShipmentBatches(updatedShipments);

    // Check if all shipments are now completed AND all requested qty was sent
    const allShipmentsCompleted = updatedShipments.every((s) => s.status === 'completed');
    const nextTotalRequested = workingItems.reduce((sum, it) => sum + clampInt(it.quantityToReturn), 0);
    const nextTotalSent = workingItems.reduce((sum, it) => sum + clampInt(it.warehouseSentQuantity), 0);
    const allQtySent = nextTotalRequested > 0 && nextTotalSent >= nextTotalRequested;

    const nextOverallStatus: RequestStatus = allShipmentsCompleted && allQtySent ? 'completed' : 'ready_to_Pickup';
    setStatusOverride(nextOverallStatus);

    // Update activity log for this shipment
    setActivityLogs((prev) =>
      prev.map((a) => {
        const m = String(a.label || '').match(/shipment\s*#\s*(\d+)/i);
        if (m && Number(m[1]) === shipment.shipmentNo) {
          return {
            ...a,
            label: `Picked up (Shipment #${shipment.shipmentNo})`,
            description: `Requester picked up Shipment #${shipment.shipmentNo}`,
            dot: 'done' as const,
          };
        }
        return a;
      }),
    );

    if (nextOverallStatus === 'completed') {
      setActivityLogs((prev) => [
        ...prev,
        {
          label: 'Completed',
          description: 'All items have been picked up — request completed',
          date: new Date().toISOString(),
          by: data.warehouseBy ?? 'Warehouse',
          dot: 'done',
        },
      ]);
      message.success('All items picked up! Request is now completed.');
    } else {
      message.success(`Shipment #${shipment.shipmentNo} confirmed as picked up.`);
    }

    shipmentsStore.confirmShipmentPicked(data.requestId, shipmentId, data.warehouseBy ?? 'Warehouse');

    const updatedData = {
      ...data,
      status: nextOverallStatus === 'completed' ? ('Completed' as any) : ('Ready To Pick Up' as any),
      items: workingItems,
      shipments: updatedShipments,
    };
    onChange?.(updatedData);
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
            disabled={!canWarehouseOperate || remaining <= 0 || effectiveStatus === 'completed'}
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
  const shipmentCards = shipmentBatches.map((shipment) => {
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
        Confirmed: {formatDateTime(shipment.confirmedAt)}
      </Text>
    ) : (
      canWarehouseOperate && (
        <Popconfirm
          title="Confirm Pick up"
          description="Has the requester come and picked up this shipment?"
          okText="Yes, Confirm Picked"
          cancelText="Not yet"
          onConfirm={() => handleConfirmPicked(shipment.id)}
        >
          <Button type="primary" size="small" icon={<CheckCircleOutlined />}>
            Confirm Picked
          </Button>
        </Popconfirm>
      )
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
            Created by {shipment.createdBy} · {formatDateTime(shipment.createdAt)}
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
              <Button
                onClick={handleSave}
                disabled={!canWarehouseOperate || effectiveStatus === 'completed'}
              >
                Save (Draft)
              </Button>
              <Button
                type="primary"
                onClick={handleSaveAndPickUp}
                disabled={!canWarehouseOperate || effectiveStatus === 'completed'}
              >
                Save &amp; Pick up
              </Button>
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
          <Descriptions.Item label="Request Date">{formatDateTime(data.requestDate)}</Descriptions.Item>
          <Descriptions.Item label="Priority">{data.priority ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={statusColorMap[effectiveStatus]} bordered={false}>
              {statusLabelMap[effectiveStatus]}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Total Items">{data.totalItems}</Descriptions.Item>
          <Descriptions.Item label="Sent Qty">
            {totals.totalSent} / {totals.totalRequested}
          </Descriptions.Item>
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
          dataSource={workingItems}
          scroll={{ x: 900 }}
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
          items={activityLogs.map((a) => {
            // Match 'Ready to Pick up (Shipment #N)' or 'Picked up (Shipment #N)' labels
            const shipmentMatch = String(a.label || '').match(/shipment\s*#\s*(\d+)/i);
            const shipmentNo = shipmentMatch ? Number(shipmentMatch[1]) : -1;
            const shipmentIdx = shipmentNo > 0 ? shipmentNo - 1 : -1;
            const matchedBatch = shipmentIdx >= 0 ? shipmentBatches[shipmentIdx] : undefined;
            const batchLines: ShipmentLine[] = (matchedBatch?.lines ?? []) as ShipmentLine[];
            const isExpandable = batchLines.length > 0;
            const isExpanded = isExpandable && expandedShipmentBatchNos.includes(shipmentIdx);

            const toggleExpanded = () => {
              if (!isExpandable) return;
              setExpandedShipmentBatchNos((prev: number[]) =>
                prev.includes(shipmentIdx)
                  ? prev.filter((n: number) => n !== shipmentIdx)
                  : [...prev, shipmentIdx].sort((x, y) => x - y),
              );
            };

            const shipmentItems = batchLines.map((l) => ({
              productId: l.productId,
              itemName: l.itemName,
              quantity: l.quantity,
            }));

            const expandedTable =
              isExpandable && isExpanded ? (
                <div style={{ marginTop: 8 }}>
                  <Table
                    size="small"
                    rowKey="productId"
                    pagination={false}
                    dataSource={shipmentItems}
                    columns={[
                      { title: 'Product ID', dataIndex: 'productId' },
                      { title: 'Item Name', dataIndex: 'itemName', ellipsis: true },
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
                      <Text type="secondary">By: {a.by || 'System'}</Text>
                    </div>
                    <Text type="secondary">{formatDateTime(a.date)}</Text>
                  </div>
                  {expandedTable}
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
    </>
  );
}
