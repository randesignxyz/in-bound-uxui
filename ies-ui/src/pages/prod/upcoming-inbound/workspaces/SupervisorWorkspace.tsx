import React from 'react';
import { Card, Typography, Button, Input, Select, Radio, Space } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { GRQueueTable, InboundGRTable } from '../features/goods-receipt';
import { useInboundContext } from '../state';
import type { UpcomingInboundGoodsReceipt as GoodsReceipt } from '../core/type';

const { Text } = Typography;

export interface SupervisorWorkspaceProps {
  filteredRoleQueue: GoodsReceipt[];
  historyReceipts: GoodsReceipt[];
  onOpenGRDetail: (gr: GoodsReceipt) => void;
  onRefresh: () => void;
  onQueuePageChange: (page: number, pageSize: number) => void;
  onHistoryPageChange: (page: number, pageSize: number) => void;
}

const supervisorHistoryStatusOptions = [
  { label: 'All Status', value: 'ALL' },
  { label: 'Pending Approval', value: 'SUPERVISOR_PENDING' },
  { label: 'Ready to Post SAP', value: 'Ready to Post SAP' },
  { label: 'QC Pending', value: 'QC_PENDING' },
  { label: 'QC Rejected', value: 'QC_REJECTED' },
  { label: 'Complete', value: 'Complete' },
  { label: 'Rejected', value: 'Rejected' },
];

export function SupervisorWorkspace({
  filteredRoleQueue,
  historyReceipts,
  onOpenGRDetail,
  onRefresh,
  onQueuePageChange,
  onHistoryPageChange,
}: SupervisorWorkspaceProps) {
  const context = useInboundContext();
  const {
    effectiveInboundView,
    queuePagination,
    queueSearchValue,
    setQueueSearchValue,
    queueTypeFilter,
    setQueueTypeFilter,
    queueSourceFilter,
    setQueueSourceFilter,
    historyPagination,
    historyTypeFilter,
    setHistoryTypeFilter,
    historyStatusFilter,
    setHistoryStatusFilter,
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
        value={queueSourceFilter}
        onChange={(event) => setQueueSourceFilter(event.target.value)}
      >
        <Radio.Button value="ALL">All Source</Radio.Button>
        <Radio.Button value="STANDARD">Standard</Radio.Button>
        <Radio.Button value="TEMP">Temporary</Radio.Button>
      </Radio.Group>
      <Select<string>
        value={historyStatusFilter}
        onChange={(value) => setHistoryStatusFilter(value)}
        options={supervisorHistoryStatusOptions}
        style={{ width: 170 }}
      />
      <Button icon={<ReloadOutlined />} onClick={onRefresh}>
        Refresh
      </Button>
    </Space>
  );

  const inboundReceivingHeaderTitle = (
    <div style={{ paddingLeft: 8 }}>
      <Text strong>{`Inbound Receiving (${historyPagination.total})`}</Text>
    </div>
  );

  const historyTableToolbar = (
    <Space size={8} wrap>
      <Input.Search
        allowClear
        placeholder="Search IR / GR Doc Num / PO / PO Doc Num / Supplier"
        onSearch={(value) => setQueueSearchValue(value)}
        onChange={(event) => {
          setQueueSearchValue(event.target.value);
        }}
        value={queueSearchValue}
        style={{ width: 280 }}
      />
      <Radio.Group value={historyTypeFilter} onChange={(e) => setHistoryTypeFilter(e.target.value)}>
        <Radio.Button value="ALL">All</Radio.Button>
        <Radio.Button value="Planned">Planned</Radio.Button>
        <Radio.Button value="Unplanned">Unplanned</Radio.Button>
      </Radio.Group>
      <Select<string>
        value={historyStatusFilter}
        onChange={(value) => setHistoryStatusFilter(value)}
        options={supervisorHistoryStatusOptions}
        style={{ width: 190 }}
      />
      <Button icon={<ReloadOutlined />} onClick={onRefresh}>
        Refresh
      </Button>
    </Space>
  );

  return (
    <div>
      {effectiveInboundView === 'operations' ? (
        <GRQueueTable
          receipts={filteredRoleQueue}
          onViewDetail={onOpenGRDetail}
          statusMode="legacy"
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
      ) : (
        <Card size="small" style={{ marginBottom: 16 }} bodyStyle={{ padding: 0 }}>
          <InboundGRTable
            receipts={historyReceipts}
            onViewDetail={onOpenGRDetail}
            headerTitle={inboundReceivingHeaderTitle}
            toolbarExtra={historyTableToolbar}
            hideSourceAndPoLink={true}
            showNotificationBadge={false}
            pagination={{
              current: historyPagination.current,
              pageSize: historyPagination.pageSize,
              total: historyPagination.total,
              showSizeChanger: true,
              onChange: onHistoryPageChange,
            }}
          />
        </Card>
      )}
    </div>
  );
}
