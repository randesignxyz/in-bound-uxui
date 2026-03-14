import { EllipsisOutlined, SearchOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import { Button, DatePicker, Input, Select, Space, Typography } from 'antd';
import type { Dayjs } from 'dayjs';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { buildItemizedColumns, buildItemizedData } from './RequestsListWarehouseItemized';
import { buildSummaryColumns } from './RequestsListWarehouseSummary';
import { mockWarehouseRequests, parseRequestDate, type WarehouseRequestRecord } from './requestsWarehouse.shared';
import RequestedBatchWareHouse from './RequestedBatchWareHouse';

interface Props {
  requests?: WarehouseRequestRecord[];
}

type RequestViewMode = 'summary' | 'itemized';

export default function RequestsListWarehouse({ requests }: Props) {
  const [viewMode, setViewMode] = useState<RequestViewMode>('summary');
  const [searchText, setSearchText] = useState('');
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
        if (request.status === 'Rejected') return false;
        const keyword = searchText.trim().toLowerCase();
        const matchesKeyword = !keyword || request.requestId.toLowerCase().includes(keyword);
        return (
          matchesKeyword &&
          (priorityFilter === 'All' || request.priority === priorityFilter) &&
          (!dateFilter || parseRequestDate(request.requestDate).isSame(dateFilter, 'day'))
        );
      }),
    [dateFilter, priorityFilter, requestRows, searchText],
  );

  const summaryColumns = useMemo(
    () => buildSummaryColumns({ onViewRequest: openDrawer }) as unknown as any[],
    [openDrawer],
  );
  const itemizedData = useMemo(() => buildItemizedData(filteredRequests), [filteredRequests]);
  const itemizedColumns = useMemo(
    () => buildItemizedColumns({ requests: filteredRequests, onViewRequest: openDrawer }) as unknown as any[],
    [filteredRequests, openDrawer],
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
          <Typography.Text
            style={{ color: viewMode === 'summary' ? '#ad8b00' : '#8c8c8c', cursor: 'pointer' }}
            onClick={() => setViewMode('summary')}
          >
            Summary View
          </Typography.Text>
          <Typography.Text
            style={{ color: viewMode === 'itemized' ? '#ad8b00' : '#8c8c8c', cursor: 'pointer' }}
            onClick={() => setViewMode('itemized')}
          >
            Itemized View
          </Typography.Text>
          <Button type="text" icon={<EllipsisOutlined />} />
        </div>
        <ProTable<any>
          rowKey="id"
          columns={viewMode === 'summary' ? summaryColumns : itemizedColumns}
          dataSource={viewMode === 'summary' ? filteredRequests : itemizedData}
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
