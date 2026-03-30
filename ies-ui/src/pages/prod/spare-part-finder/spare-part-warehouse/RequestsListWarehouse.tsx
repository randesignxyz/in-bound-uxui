import { EllipsisOutlined, SearchOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import { Button, DatePicker, Input, Select, Space, Typography } from 'antd';
import type { Dayjs } from 'dayjs';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { buildSummaryColumns } from './RequestsListWarehouseSummary';
import {
  deriveWarehouseDisplayStatus,
  mockWarehouseRequests,
  parseRequestDate,
  type WarehouseDisplayStatus,
  type WarehouseRequestRecord,
} from './requestsWarehouse.shared';
import RequestedBatchWareHouse from './RequestedBatchWareHouse';

interface Props {
  requests?: WarehouseRequestRecord[];
}


export default function RequestsListWarehouse({ requests }: Props) {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | WarehouseDisplayStatus>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [dateFilter, setDateFilter] = useState<Dayjs | null>(null);

  const [requestRows, setRequestRows] = useState<WarehouseRequestRecord[]>(() =>
    requests && requests.length > 0 ? requests : mockWarehouseRequests,
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<WarehouseRequestRecord | null>(null);

  useEffect(() => {
    if (!requests || requests.length === 0) return;
    setRequestRows(requests);
  }, [requests]);

  const openDrawer = useCallback((record: WarehouseRequestRecord) => {
    setSelectedRequest(record);
    setDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    setSelectedRequest(null);
  }, []);

  const filteredRequests = useMemo(
    () =>
      requestRows.filter((request) => {
        const keyword = searchText.trim().toLowerCase();
        const matchesKeyword = !keyword || request.requestId.toLowerCase().includes(keyword);
        const displayStatus = deriveWarehouseDisplayStatus(request);
        return (
          matchesKeyword &&
          (statusFilter === 'All' || displayStatus === statusFilter) &&
          (priorityFilter === 'All' || request.priority === priorityFilter) &&
          (!dateFilter || parseRequestDate(request.requestDate).isSame(dateFilter, 'day'))
        );
      }),
    [dateFilter, priorityFilter, requestRows, searchText, statusFilter],
  );

  const summaryColumns = useMemo(
    () => buildSummaryColumns({ onViewRequest: openDrawer }) as unknown as any[],
    [openDrawer],
  );

  return (
    <>
      <div
        style={{
          marginBottom: 10,
          background: '#fff',
          borderRadius: 10,
          border: '1px solid #f0f0f0',
          padding: 12,
        }}
      >
        <Space wrap size="middle">
          <Input.Search
            allowClear
            enterButton={<SearchOutlined />}
            value={searchText}
            placeholder="Search Request ID"
            style={{ width: 280 }}
            onChange={(event) => setSearchText(event.target.value || '')}
          />
          <Select
            placeholder="All Status"
            value={statusFilter}
            onChange={(value) => setStatusFilter((value as 'All' | WarehouseDisplayStatus) || 'All')}
            style={{ width: 200 }}
            options={[
              { value: 'All', label: 'All Status' },
              { value: 'Pending', label: 'Pending' },
              { value: 'In Progress', label: 'In Progress' },
              { value: 'Ready To Pick Up', label: 'Ready To Pick Up' },
              { value: 'Partial', label: 'Partial' },
              { value: 'Completed', label: 'Completed' },
              { value: 'Rejected', label: 'Rejected' },
            ]}
          />
          <Select
            style={{ width: 160 }}
            value={priorityFilter}
            options={[
              { label: 'All Priority', value: 'All' },
              { label: 'Urgent', value: 'Urgent' },
              { label: 'High', value: 'High' },
              { label: 'Normal', value: 'Normal' },
              { label: 'Low', value: 'Low' },
            ]}
            onChange={(value) => setPriorityFilter(value || 'All')}
          />
          <DatePicker allowClear style={{ width: 180 }} value={dateFilter} onChange={(v) => setDateFilter(v)} />
        </Space>
      </div>

      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #f0f0f0', padding: 12 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: 24,
            marginBottom: 12,
          }}
        >
          <Button type="text" icon={<EllipsisOutlined />} />
        </div>
        <ProTable<any>
          rowKey="id"
          columns={summaryColumns}
          dataSource={filteredRequests}
          tableLayout="fixed"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50],
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
          }}
          search={false}
          options={false}
        />
      </div>

      <RequestedBatchWareHouse
        open={drawerOpen}
        request={selectedRequest}
        onClose={closeDrawer}
        onChange={(updated) => {
          setRequestRows((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
          setSelectedRequest(updated);
        }}
      />
    </>
  );
}
