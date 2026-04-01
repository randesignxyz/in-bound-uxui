import { EllipsisOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import { Button, DatePicker, Input, Select, Space, Typography, message } from 'antd';
import type { Dayjs } from 'dayjs';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { simpleRequestActions } from '@/services/model';
import { buildSummaryColumns } from './RequestsListWarehouseSummary';
import {
  deriveWarehouseDisplayStatus,
  parseRequestDate,
  type WarehouseDisplayStatus,
  type WarehouseRequestRecord,
} from './requestsWarehouse.shared';
import RequestedBatchWareHouse, { type RequestDetailData } from './RequestedBatchWareHouse';
import { SparePartWarehouseService } from './service';

export default function RequestsListWarehouse() {
  const requestActions = simpleRequestActions();
  const services = SparePartWarehouseService(requestActions);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | WarehouseDisplayStatus>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [dateFilter, setDateFilter] = useState<Dayjs | null>(null);

  const [requestRows, setRequestRows] = useState<WarehouseRequestRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<WarehouseRequestRecord | null>(null);
  const [selectedRequestData, setSelectedRequestData] = useState<RequestDetailData | null>(null);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    try {
      const response = await services.pageRequests({
        searchValue: searchText,
        status: statusFilter,
        pagination: {
          current: 1,
          pageSize: 200,
        },
      });
      setRequestRows(response.items || []);
    } catch (error) {
      message.error('Failed to load warehouse requests.');
    } finally {
      setLoading(false);
    }
  }, [searchText, statusFilter]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const reloadRequests = useCallback(async () => {
    await loadRequests();
  }, [loadRequests]);

  const openDrawer = useCallback(async (record: WarehouseRequestRecord) => {
    setSelectedRequest(record);
    setSelectedRequestData(null);
    setDrawerOpen(true);

    try {
      const response = await services.getRequestDetail(record.id);
      setSelectedRequest(response.record);
      setSelectedRequestData(response.detail);
    } catch (error) {
      message.error('Failed to load request details.');
    }
  }, [services]);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    setSelectedRequest(null);
    setSelectedRequestData(null);
  }, []);

  const acceptRequest = useCallback(async (record: WarehouseRequestRecord) => {
    try {
      const response = await services.acceptRequest(record.id);
      setRequestRows((prev) => prev.map((row) => (row.id === record.id ? response.record : row)));
      if (selectedRequest?.id === record.id) {
        setSelectedRequest(response.record);
        setSelectedRequestData(response.detail);
      }
      message.success('Request accepted successfully.');
      await reloadRequests();
    } catch (error) {
      message.error('Failed to accept request.');
    }
  }, [reloadRequests, selectedRequest?.id, services]);

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
    () => buildSummaryColumns({ onViewRequest: openDrawer, onAcceptRequest: acceptRequest }) as unknown as any[],
    [acceptRequest, openDrawer],
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
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

          <Button icon={<ReloadOutlined />} onClick={reloadRequests}>
            Refresh
          </Button>
        </div>
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
          loading={loading}
          tableLayout="fixed"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50],
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
          }}
          search={false}
          options={false}
          onRow={(record) => ({
            onClick: (event) => {
              const target = event.target;
              if (
                target instanceof HTMLElement &&
                target.closest('a, button, input, textarea, .ant-select, .ant-picker')
              ) {
                return;
              }
              openDrawer(record as WarehouseRequestRecord);
            },
            style: { cursor: 'pointer' },
          })}
        />
      </div>

      <RequestedBatchWareHouse
        open={drawerOpen}
        request={selectedRequest}
        data={selectedRequestData || undefined}
        onClose={closeDrawer}
        onChange={(updated) => {
          setRequestRows((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
          setSelectedRequest(updated);
        }}
        onIssueRequest={async (payload) => {
          const response = await services.issueRequest(payload);
          setSelectedRequest(response.record);
          setSelectedRequestData(response.detail);
          await reloadRequests();
        }}
        onSaveDraft={async (payload) => {
          const response = await services.saveDraft(payload);
          setSelectedRequest(response.record);
          setSelectedRequestData(response.detail);
          await reloadRequests();
        }}
        onConfirmPickup={async (id) => {
          const response = await services.confirmPickup(id);
          setSelectedRequest(response.record);
          setSelectedRequestData(response.detail);
          await reloadRequests();
        }}
      />
    </>
  );
}
