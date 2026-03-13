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
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { MyRequestItem, RequestPriority, RequestStatus, SparePartType } from './data';
import SpfDetails from './SpfDetails';
import { useAccess } from '@umijs/max';

const { Title, Text } = Typography;

const formatDateTime = (iso?: string) => {
  if (!iso) return '—';
  const d = dayjs(iso);
  return d.isValid() ? d.format('YYYY-MMM-DD, h:mm A') : String(iso);
};

const STATUS_STEPS = ['Requested', 'Approved', 'In Progress', 'Ready to pick up', 'Completed'] as const;

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
      return 2;
    case 'ready_to_Pickup':
      return 3;
    case 'completed':
      return 4;
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
}

export default function RequestedBatchDrawer({
  open,
  request,
  data: propData,
  onClose,
}: DrawerBatchReturnItemsProps) {
  const [spfOpen, setSpfOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<RequestDetailLineItem | null>(null);
  const [pickedItems, setPickedItems] = useState<RequestDetailLineItem[]>([]);
  const [pickupSelection, setPickupSelection] = useState<string[]>([]);
  const [statusOverride, setStatusOverride] = useState<RequestStatus | null>(null);
  const [pickupBatches, setPickupBatches] = useState<PickupBatch[]>([]);
  const [activityLogs, setActivityLogs] = useState<RequestDetailActivity[]>([]);
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

    const items: RequestDetailLineItem[] = Array.from(
      { length: Math.max(0, fallbackRequest.totalItems || 0) },
      (_, i) => {
        const no = i + 1;
        const productId = `PRD-${String(fallbackRequest.id).padStart(3, '0')}-${String(no).padStart(3, '0')}`;
        const quantityToReturn = Math.max(1, Math.floor(Math.random() * 3) + 1);
        const usedQuantity = Math.max(0, Math.floor(Math.random() * (quantityToReturn + 1)));
        const total = Math.max(0, quantityToReturn - usedQuantity);

        return {
          no,
          productId,
          requestId: fallbackRequest.requestId,
          itemName: `Spare Part ${no}`,
          imageId: undefined,
          quantityToReturn,
          usedQuantity,
          total,
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
    setActivityLogs([]);
    lastServerStatusRef.current = null;
    lastShipmentNoticeRef.current = 0;
    initKeyRef.current = '';
    onClose?.();
  };

  const availablePickupQty = (record: RequestDetailLineItem, status: RequestStatus): number => {
    if (typeof record.warehouseSentQuantity === 'number') return record.warehouseSentQuantity;
    if (status === 'in-progress') return 0;
    return Number(record.quantityToReturn) || 0;
  };

  const hasAnyPickupAvailable = useMemo(() => {
    if (effectiveStatus === 'ready_to_Pickup') return true;
    if (effectiveStatus !== 'in-progress') return false;
    return data.items.some((it) => availablePickupQty(it, effectiveStatus) > 0);
  }, [data.items, effectiveStatus]);

  const pickedProductIds = useMemo(() => new Set(pickedItems.map((it) => it.productId)), [pickedItems]);
  const remainingItems = useMemo(
    () => data.items.filter((it) => !pickedProductIds.has(it.productId)),
    [data.items, pickedProductIds],
  );

  const requestedQtyTotal = useMemo(
    () => data.items.reduce((sum, it) => sum + (Number(it.quantityToReturn) || 0), 0),
    [data.items],
  );

  const receivedQtyTotal = useMemo(
    () => pickedItems.reduce((sum, it) => sum + (Number(it.quantityToReturn) || 0), 0),
    [pickedItems],
  );

  const columns: ColumnsType<RequestDetailLineItem> = [
    { title: 'No', dataIndex: 'no', key: 'no', width: 56 },
    {
      title: 'Image',
      dataIndex: 'image',
      key: 'image',
      width: 72,
      render: (src?: string) => (
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            overflow: 'hidden',
            backgroundColor: '#f0f0f0',
          }}
        >
          <img
            src={src || 'https://via.placeholder.com/40?text=No'}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      ),
    },
    {
      title: 'Product ID',
      dataIndex: 'productId',
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
    {
      title: 'Item Name',
      dataIndex: 'itemName',
      ellipsis: true,
    },
    {
      title: 'Qty Requested',
      dataIndex: 'quantityToReturn',
      align: 'right',
    },
    {
      title: 'Qty Sent',
      align: 'right',
      render: (_: unknown, record) =>
        effectiveStatus === 'ready_to_Pickup' || effectiveStatus === 'partial' || effectiveStatus === 'completed'
          ? record.warehouseSentQuantity ?? record.quantityToReturn
          : effectiveStatus === 'in-progress'
            ? record.warehouseSentQuantity ?? 0
            : 0,
    },
    {
      title: 'Qty Received',
      align: 'right',
      render: (_: unknown, record) => (pickedProductIds.has(record.productId) ? record.quantityToReturn : 0),
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
      requested_date: data.requestDate,
    };
  }, [data.requestDate, selectedProduct]);

  const receivedItemsDisplay = useMemo(() => {
    if (pickedItems.length > 0 || statusOverride) return `${receivedQtyTotal} / ${requestedQtyTotal}`;
    return data.receivedItems ?? '—';
  }, [data.receivedItems, pickedItems.length, receivedQtyTotal, requestedQtyTotal, statusOverride]);

  const confirmPickup = () => {
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
    const hasMorePickableNow = data.items.some(
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
              Warehouse sent items ({remainingItems.length} remaining / {data.items.length} total)
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
                    availablePickupQty(record, effectiveStatus) <= 0,
                }),
              }}
              dataSource={data.items}
              columns={[
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
              ]}
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

  const historyCard =
    pickupBatches.length > 0 &&
    (effectiveStatus === 'ready_to_Pickup' || effectiveStatus === 'partial' || effectiveStatus === 'completed') ? (
      <Card size="small" style={{ marginBottom: 24 }} title="Pick up History">
	        <Table<PickupBatch>
	          size="small"
	          rowKey={(r) => String(r.batchNo)}
	          pagination={false}
	          dataSource={pickupBatches}
          expandable={{
            rowExpandable: (batch) => batch.items.length > 0,
            expandedRowRender: (batch) => (
              <Table<RequestDetailLineItem>
                size="small"
                rowKey="productId"
                pagination={false}
                dataSource={batch.items}
                columns={[
                  { title: 'Product ID', dataIndex: 'productId' },
                  { title: 'Item Name', dataIndex: 'itemName', ellipsis: true },
                  { title: 'Qty', dataIndex: 'quantityToReturn', align: 'right' as const },
                ]}
              />
            ),
          }}
	          columns={[
	            { title: 'Pick up #', dataIndex: 'batchNo', width: 90 },
	            { title: 'Picked By', dataIndex: 'pickedBy', width: 160 },
	            {
	              title: 'Picked Items',
	              align: 'right',
	              render: (_: unknown, r) => r.items.length || r.pickedItemsCount || 0,
	            },
            {
              title: 'Picked Qty',
              align: 'right',
              render: (_: unknown, r) =>
                r.items.length > 0
                  ? r.items.reduce((sum, it) => sum + (Number(it.quantityToReturn) || 0), 0)
                  : r.pickedItemsCount || 0,
            },
	            {
	              title: 'Date',
	              dataIndex: 'createdAt',
	              render: (v: string) => formatDateTime(v),
	            },
	          ]}
	        />
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
        width="50%"
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
              }}
            >
              Reject
            </Button>
            <Button
              type="primary"
              onClick={() => {
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
          <Descriptions.Item label="Request Date">{data.requestDate}</Descriptions.Item>
          <Descriptions.Item label="Priority">{data.priority ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={statusColorMap[effectiveStatus]} bordered={false}>
              {statusLabelMap[effectiveStatus]}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Total Items">{data.totalItems}</Descriptions.Item>
          <Descriptions.Item label="Received Items">{receivedItemsDisplay}</Descriptions.Item>
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
          dataSource={data.items}
          scroll={{ x: 700 }}
          style={{ marginBottom: 32 }}
        />

        {pickupCard}
        {partialWaitingCard}
        {historyCard}

        <Title level={5} style={{ marginBottom: 16 }}>
          Recent Activities
        </Title>
        <Timeline
          style={{ marginBottom: 32 }}
          items={activityLogs.map((a: RequestDetailActivity) => ({
            color: a.dot === 'pending' ? 'gray' : 'blue',
            children: (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 8,
                }}
              >
	                <div>
	                  <Text strong>{a.label}</Text>
	                  <br />
	                  <Text type="secondary">{a.description}</Text>
	                  <br />
	                  <Text type="secondary">By: {a.by || 'System'}</Text>
	                </div>
	                <Text type="secondary">{formatDateTime(a.date)}</Text>
	              </div>
	            ),
	          }))}
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
