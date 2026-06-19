import React from 'react';
import { Button, Input, Radio, Badge, Space, Typography } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { GRQueueTable } from '../features/goods-receipt';
import { useInboundContext } from '../state';
import type { UpcomingInboundGoodsReceipt as GoodsReceipt } from '../core/type';

const { Text } = Typography;

export interface QCWorkspaceProps {
  filteredRoleQueue: GoodsReceipt[];
  qcStatusOptionsWithBadge: Array<{ label: string; value: string; badgeCount?: number }>;
  shouldShowQcReceiptNotificationBadge: (receipt: GoodsReceipt) => boolean;
  onOpenGRDetail: (gr: GoodsReceipt) => void;
  onRefresh: () => void;
  onQueuePageChange: (page: number, pageSize: number) => void;
}

export function QCWorkspace({
  filteredRoleQueue,
  qcStatusOptionsWithBadge,
  shouldShowQcReceiptNotificationBadge,
  onOpenGRDetail,
  onRefresh,
  onQueuePageChange,
}: QCWorkspaceProps) {
  const context = useInboundContext();
  const {
    queuePagination,
    setQueueSearchValue,
    queueTypeFilter,
    setQueueTypeFilter,
    qcStatusFilter,
    setQcStatusFilter,
  } = context;

  const queueTableToolbar = (
    <Space size={8} wrap>
      <Input.Search
        allowClear
        placeholder="Search IR / GR Doc Num / PO / PO Doc Num / Supplier"
        onSearch={(value) => setQueueSearchValue(value)}
        onChange={(event) => {
          if (!event.target.value) {
            setQueueSearchValue('');
          }
        }}
        style={{ width: 280 }}
      />
      <Radio.Group
        value={queueTypeFilter}
        onChange={(event) => setQueueTypeFilter(event.target.value)}
      >
        <Radio.Button value="ALL">All</Radio.Button>
        <Radio.Button value="Planned">Planned</Radio.Button>
        <Radio.Button value="Unplanned">Unplanned</Radio.Button>
      </Radio.Group>
      <Radio.Group
        value={qcStatusFilter}
        onChange={(event) => setQcStatusFilter(event.target.value as any)}
      >
        {qcStatusOptionsWithBadge.map((option) => {
          const isActive = qcStatusFilter === option.value;
          return (
            <Radio.Button key={option.value} value={option.value}>
              <Badge count={option.badgeCount ?? 0} size="small" offset={[8, -6]}>
                <span style={{ color: isActive ? '#B49900' : 'inherit' }}>
                  {option.label}
                </span>
              </Badge>
            </Radio.Button>
          );
        })}
      </Radio.Group>
      <Button icon={<ReloadOutlined />} onClick={onRefresh}>
        Refresh
      </Button>
    </Space>
  );

  return (
    <div>
      <GRQueueTable
        receipts={filteredRoleQueue}
        onViewDetail={onOpenGRDetail}
        statusMode="qc"
        shouldShowNotificationBadge={shouldShowQcReceiptNotificationBadge}
        headerTitle={
          <div style={{ paddingLeft: 8 }}>
            <Text strong>{`Inbound Receiving (${queuePagination.total})`}</Text>
          </div>
        }
        toolbarExtra={queueTableToolbar}
        pagination={{
          current: queuePagination.current,
          pageSize: queuePagination.pageSize,
          total: queuePagination.total,
          showSizeChanger: true,
          onChange: onQueuePageChange,
        }}
      />
    </div>
  );
}
