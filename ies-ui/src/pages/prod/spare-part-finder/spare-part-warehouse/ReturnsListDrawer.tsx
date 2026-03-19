import { useAccess } from "@umijs/max";
import { ProTable } from "@ant-design/pro-components";
import { Button, Descriptions, Drawer, InputNumber, Space, Steps, Tag, Timeline, Typography } from "antd";
import { useMemo, useState } from "react";
import SparePartImage from "../spare-part-request/SparePartImage";

const { Title } = Typography;

// ─── Types ───────────────────────────────────────────────────────────────────

/**
 * Full lifecycle:
 *  return → approved | rejected
 *         ↓ (if approved)
 *     in_progress → completed | partially_returned
 */
export type ReturnStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'in_progress'
  | 'completed'
  | 'partially_returned';

interface ReturnItem {
  id: string | number;
  imageId?: string;      // used by SparePartImage to fetch from server
  image?: string;        // direct URL fallback
  productId: string;
  partName?: string;     // canonical part name field
  name: string;          // display name (alias)
  usedQty: number;
  qtyToReturn: number;
  status?: string;
}

interface ReturnData {
  id?: string;
  requestId?: string;
  type?: string;
  requestDate?: string;
  status?: ReturnStatus;
  totalItems?: number;
  approvedBy?: string;
  items?: ReturnItem[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

/**
 * Timeline steps shown in the drawer.
 * Step 0: Return (submitted)
 * Step 1: Approved / Rejected
 * Step 2: In Progress
 * Step 3: Completed / Partially Returned
 */
const STATUS_STEPS = ['Return', 'Approved', 'In Progress', 'Completed'];

/**
 * Maps each status to which step index it sits on.
 */
const STATUS_STEP_MAP: Record<ReturnStatus, number> = {
  pending: 0,
  approved: 1,
  rejected: 1,        // same step as approved, but shown as error
  in_progress: 2,
  completed: 3,
  partially_returned: 3,  // same final step as completed, shown as finish
};

const statusColorMap: Record<ReturnStatus, string> = {
  pending: 'blue',
  approved: 'success',
  rejected: 'error',
  in_progress: 'processing',
  completed: 'success',
  partially_returned: 'warning',
};

const statusLabelMap: Record<ReturnStatus, string> = {
  pending: 'Return',
  approved: 'Approved',
  rejected: 'Rejected',
  in_progress: 'In Progress',
  completed: 'Completed',
  partially_returned: 'Partially Returned',
};
interface ReturnDetailActivity {
  id: string | number;
  action?: 'submitted' | 'approved' | 'rejected' | 'completed' | 'partially_returned';
  label: string;
  description?: string;
  by?: string; // who performed the action
  date: string; // ISO date string
  dot?: 'pending' | 'done'
}
// ─── Helpers ──────────────────────────────────────────────────────────────────
const logs: ReturnDetailActivity[] = [
  {
    id: 1,
    action: "submitted",
    label: "Return request submitted",
    description: "User submitted return request",
    by: "John",
    date: "2026-03-16T08:00:00",
    dot: "done"
  },
  {
    id: 2,
    action: "approved",
    label: "Approved",
    description: "Manager approved the request",
    by: "Manager",
    date: "2026-03-16T08:20:00",
    dot: "done"
  }
];
const formatDateTime = (date?: string) => {
  if (!date) return '—';
  return new Date(date).toLocaleString();
};

/**
 * Determines the Ant Design Steps `status` for each step node.
 *
 * Special cases:
 *  - `rejected`          → step 1 shows as "error"
 *  - `partially_returned`→ step 3 shows as "finish" (not error, it's a partial success)
 *  - active step         → "process"
 *  - past steps          → "finish"
 *  - future steps        → "wait"
 */
const getStepStatus = (
  effectiveStatus: ReturnStatus,
  stepIndex: number,
  currentStep: number
): 'finish' | 'process' | 'wait' | 'error' => {
  if (effectiveStatus === 'rejected' && stepIndex === 1) return 'error';
  if (stepIndex < currentStep) return 'finish';
  if (stepIndex === currentStep) return 'process';
  return 'wait';
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface ReturnsListDrawerProps {
  open: boolean;
  onClose: () => void;
  data: ReturnData | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ReturnsListDrawer({
  open,
  onClose,
  data,
}: ReturnsListDrawerProps) {
  const access = useAccess();
  const [statusOverride, setStatusOverride] = useState<ReturnStatus | null>(null);
  const [activityLogs] = useState<ReturnDetailActivity[]>(logs);

  const effectiveStatus: ReturnStatus = useMemo(() => {
    if (statusOverride) return statusOverride;
    return data?.status ?? 'pending';
  }, [statusOverride, data?.status]);

  const currentStep = STATUS_STEP_MAP[effectiveStatus];

  const handleSave = () => {
    // TODO: Implement save logic
    console.log('Save clicked');
  };

  const handleSaveAndPickUp = () => {
    // TODO: Implement save and pick up logic
    console.log('Save and Pick Up clicked');
  };

  const columnsReturn = [
    {
      title: 'No',
      dataIndex: 'id',
      key: 'number_id',
      width: 40
    },
    {
      title: 'Image',
      dataIndex: 'image',
      key: 'image_key',
      render: (_: unknown, record: ReturnItem) => (
        <SparePartImage
          imageId={record.imageId}
          src={record.image}
          alt={record.partName || record.productId}
          size={48}
        />
      ),
      width: 'auto'
    },
    {
      title: 'Product ID',
      dataIndex: 'productId',
      key: 'product_id',
      width: 'auto',
      render: (_: unknown, entity: ReturnItem) => (
        <Typography.Link>
          {entity.productId}
        </Typography.Link>
      )
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name_product',
      ellipsis: true,
      width: 'auto'
    },
    {
      title: 'UoM',
      dataIndex: 'UoM',
      key: 'UoM',
      ellipsis: true,
      width: 'auto'
    },
    {
      title: 'Used QTY',
      dataIndex: 'usedQty',
      key: 'used_key',
      align: 'center' as const,
      width: 'auto'
    },
    {
      title: 'QTY to Return',
      dataIndex: 'qtyToReturn',
      key: 'qty_key_return',
      align: 'center' as const,
      render: (_: unknown, record: ReturnItem) => (
        <span style={{ fontWeight: 600, color: '#d4a574', fontSize: 16 }}>
          {record.qtyToReturn}
        </span>
      ),
      width: 'auto'
    },
    ...(access.canSpfWarehouseStaff
      ? [
          {
            title: 'Good',
            key: 'good_amount',
            fixed: 'right' as const,
            render: (_: unknown, record: ReturnItem) => {
              const goodQty = record.qtyToReturn - record.usedQty;
              return (
                <InputNumber
                  min={0}
                  max={record.qtyToReturn}
                  defaultValue={goodQty}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value: string | undefined) => {
                    const parsed = value ? value.replace(/\$\s?|(,*)/g, '') : '';
                    return parsed ? Number(parsed) : 0;
                  }}
                />
              );
            },
            width: 'auto'
          },
          {
            title: 'Damaged',
            key: 'damaged_amount',
            fixed: 'right' as const,
            render: (_: unknown, record: ReturnItem) => {
              const damagedQty = record.usedQty;
              return (
                <InputNumber
                  min={0}
                  max={record.qtyToReturn}
                  defaultValue={damagedQty}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value: string | undefined) => {
                    const parsed = value ? value.replace(/\$\s?|(,*)/g, '') : '';
                    return parsed ? Number(parsed) : 0;
                  }}
                />
              );
            },
            width: 'auto'
          }
        ]
      : []),

  ];

  return (
    <Drawer
      title={
        <span
          style={{
            fontSize: 16,
            letterSpacing: '0.5px',
          }}
        >
          Return Request Details
        </span>
      }
      width={'60%'}
      open={open}
      onClose={onClose}
      styles={{ body: { backgroundColor: '#fafafa', padding: '24px' } }}
       footer={
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Space>
                    <Button
                      onClick={handleSave}
                    >
                      Edit
                    </Button>
                    <Button
                      type="primary"
                      onClick={handleSaveAndPickUp}
                    >
                      Save
                    </Button>
                  </Space>
                </div>
              }
    >
      {/* ── Approver Action Buttons (only when status = return / pending) ── */}
      {access.canSpfApprover && effectiveStatus === 'pending' && (
        <div style={{ textAlign: 'right', marginBottom: 16 }}>
          <Space>
            <Button
              danger
              onClick={() => setStatusOverride('rejected')}
            >
              Reject
            </Button>
            <Button
              type="primary"
              onClick={() => setStatusOverride('approved')}
            >
              Approve
            </Button>
          </Space>
        </div>
      )}

      {/* ── Info Descriptions ── */}
      <div style={{ marginBottom: 24 }}>
        <Descriptions
          column={3}
          size="small"
          labelStyle={{
            fontWeight: 600,
            color: '#595959',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            fontSize: 12,
          }}
          contentStyle={{ fontWeight: 500, color: '#262626' }}
        >
          <Descriptions.Item label="No">{data?.id ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="Return ID">{data?.requestId ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="Type">{data?.type ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="Return Date">
            {formatDateTime(data?.requestDate)}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag
              color={statusColorMap[effectiveStatus]}
              
            >
              {statusLabelMap[effectiveStatus]}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Total Items">
            {data?.totalItems ?? 0}
          </Descriptions.Item>
        </Descriptions>
      </div>

      {/* ── Status Timeline ── */}
      <div
        style={{

        }}
      >
        <Title level={5} style={{ marginBottom: 16 }}>
          Status Timeline
        </Title>

        <Steps
          current={currentStep}
          size="default"
          items={STATUS_STEPS.map((title, index) => {
            const stepStatus = getStepStatus(effectiveStatus, index, currentStep);

            // For the last step (index 3), show the precise label
            const label =
              index === STATUS_STEPS.length - 1 && currentStep === index
                ? statusLabelMap[effectiveStatus]   // "Completed" or "Partially Returned"
                : title;

            // Description hint shown below each step node
            const description =
              index === 1 && effectiveStatus === 'rejected'
                ? 'Rejected'
                : index === STATUS_STEPS.length - 1 && effectiveStatus === 'partially_returned'
                  ? 'Some items were not returned'
                  : undefined;

            return {
              title: (
                <span style={{ fontSize: 13, fontWeight: 500 }}>{label}</span>
              ),
              description: description ? (
                <span style={{ fontSize: 12, color: '#8c8c8c' }}>{description}</span>
              ) : undefined,
              status: stepStatus,
            };
          })}
        />
      </div>

      {/* ── Items Table ── */}
      <div
        style={{

        }}
      >
        <Title level={5} style={{ marginBottom: 16, marginTop: 24 }}>
          Return Items
        </Title>
        <ProTable<ReturnItem>
          columns={columnsReturn}
          dataSource={data?.items || []}
          rowKey="id"
          pagination={false}
          search={false}
          options={false}
          style={{ backgroundColor: 'transparent' }}
          rowClassName={() => 'custom-row'}
        />
      </div>
      {/* _____ Timeline */}
      {/* - return (submitted)
      - approved / rejected
      - in progress if partially returned this status when warehousse checked items and fount some items not returned, if all items returned then status will be completed
       so this status until warehouse mark as completed 
       so in timetime has a table store logs + items return and completed items when ? 
       and there are many cases: that return like 1 request : 5 items but only 3 items returned and 2 items not returned , so status will be partially returned until requester return 2 items 
       then status will be completed, so in timeline status will be in progress until all items returned then status will be completed
      - completed until all items returned  */}
    <Title level={5} style={{ marginBottom: 16 }}>
          Recent Activities
    </Title>
     <Timeline
  style={{ marginBottom: 24 }}
  items={activityLogs.map((log) => ({
    color:
      log.action === "approved"
        ? ""
        : log.action === "rejected"
        ? "red"
        : log.action === "completed"
        ? "green"
        : "blue",
    children: (
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <Typography.Text strong>{log.label}</Typography.Text>
          <br />
          <Typography.Text type="secondary">
            {log.description}
          </Typography.Text>
          <br />
          <Typography.Text type="secondary">
            By: {log.by || "System"}
          </Typography.Text>
        </div>

        <Typography.Text type="secondary">
          {formatDateTime(log.date)}
        </Typography.Text>
      </div>
    ),
  }))}
/>
    </Drawer>
  );
}