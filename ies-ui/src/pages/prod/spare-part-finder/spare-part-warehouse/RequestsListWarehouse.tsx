import { EllipsisOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import { Button, DatePicker, Input, Select, Space, Typography, message } from 'antd';
import type { Dayjs } from 'dayjs';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { buildSummaryColumns } from './RequestsListWarehouseSummary';
import {
  deriveWarehouseDisplayStatus,
  parseRequestDate,
  type WarehouseDisplayStatus,
  type WarehouseRequestRecord,
} from './requestsWarehouse.shared';
import RequestedBatchWareHouse, { type RequestDetailData } from './RequestedBatchWareHouse';
import { SparePartWarehouseService } from './service';
import { emitWarehouseBadgeRefresh } from '../shared/badgeEvents';

export default function RequestsListWarehouse() {
  const services = useMemo(() => SparePartWarehouseService({}), []);
  const [searchInput, setSearchInput] = useState('');
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
  }, [searchText, services, statusFilter]);

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

  const applyResponseUpdate = useCallback(
    (response: { record: WarehouseRequestRecord; detail: RequestDetailData }) => {
      const normalizedRecord: WarehouseRequestRecord =
        response.detail.status === 'completed'
          ? {
              ...response.record,
              status: 'Completed',
              pickupStatus: 'confirmed',
            }
          : response.record;

      setRequestRows((prev) => prev.map((row) => (row.id === normalizedRecord.id ? normalizedRecord : row)));
      setSelectedRequest((prev) => (prev?.id === normalizedRecord.id ? normalizedRecord : prev));
      setSelectedRequestData((prev) => (prev?.id === response.detail.id ? response.detail : response.detail));
    },
    [],
  );

  const acceptRequest = useCallback(async (record: WarehouseRequestRecord) => {
    try {
      const response = await services.acceptRequest(record.id);
      applyResponseUpdate(response);
      emitWarehouseBadgeRefresh();
      message.success('Request accepted successfully.');
    } catch (error) {
      message.error('Failed to accept request.');
    }
  }, [applyResponseUpdate, services]);

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
              value={searchInput}
              placeholder="Search Request ID"
              style={{ width: 280 }}
              onChange={(event) => {
                const nextValue = event.target.value || '';
                setSearchInput(nextValue);
                if (!nextValue) {
                  setSearchText('');
                }
              }}
              onSearch={(value) => setSearchText(value || '')}
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

          {/* <Button icon={<ReloadOutlined />} onClick={reloadRequests}>
            Refresh
          </Button> */}
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
          <Button icon={<ReloadOutlined />} onClick={reloadRequests}>
            Refresh
          </Button>
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
          setSelectedRequestData((prev) =>
            prev
              ? {
                  ...prev,
                  status:
                    updated.rawRequestStatus === 'PARTIAL_ISSUE' && updated.pickupStatus !== 'confirmed'
                      ? 'ready_to_Pickup'
                      : prev.status,
                }
              : prev,
          );
        }}
        onIssueRequest={async (payload) => {
          const response = await services.issueRequest(payload);
          applyResponseUpdate(response);
          emitWarehouseBadgeRefresh();
        }}
        onSaveDraft={async (payload) => {
          const response = await services.saveDraft(payload);
          applyResponseUpdate(response);
        }}
        onDeleteDraft={async (id) => {
          const response = await services.deleteDraft(id);
          applyResponseUpdate(response);
        }}
        onConfirmPickup={async (payload) => {
          const response = await services.confirmPickup(payload);
          applyResponseUpdate(response);
        }}
        onGeneratePickupQr={async (payload) => {
          const response = await services.generatePickupQr(payload);
          applyResponseUpdate(response);
        }}
        onAcceptRequest={async (id) => {
          const response = await services.acceptRequest(id);
          applyResponseUpdate(response);
          emitWarehouseBadgeRefresh();
        }}
      />
    </>
  );
}
