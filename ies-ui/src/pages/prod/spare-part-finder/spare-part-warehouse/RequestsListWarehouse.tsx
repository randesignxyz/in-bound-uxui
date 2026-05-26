import { downloadGenericReport } from '@/services/apiGateway';
import { simpleRequestActions } from '@/services/model';
import { FileExcelOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import { useAccess } from '@umijs/max';
import { Button, DatePicker, Input, Select, Space, message } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fetchSparePartBusinessUnits } from '../spare-part-request/service.api';
import RequestedBatchWareHouse, { type RequestDetailData } from './RequestedBatchWareHouse';
import { buildSummaryColumns } from './RequestsListWarehouseSummary';
import {
  deriveWarehouseDisplayStatus,
  parseRequestDate,
  type WarehouseDisplayStatus,
  type WarehouseRequestRecord,
} from './requestsWarehouse.shared';
import RequestsWarehouseExportExcel, {
  type RequestsWarehouseExportValues,
} from './RequestsWarehouseExportExcel';
import { SparePartWarehouseService } from './service';
import { getUrlReporting } from '@/pages/ReportUrl';

interface RequestsListWarehouseProps {
  onDataChanged?: () => void;
}

export default function RequestsListWarehouse({ onDataChanged }: RequestsListWarehouseProps) {
  const { RangePicker } = DatePicker;
  const access = useAccess();
  const requestActions = simpleRequestActions();
  const services = SparePartWarehouseService(requestActions);
  const canExportExcel = access.canSpfWarehouseStaff || access.canAdmin;
  const [searchInput, setSearchInput] = useState('');
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | WarehouseDisplayStatus>('Pending');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [dateRangeFilter, setDateRangeFilter] = useState<[Dayjs, Dayjs] | null>(null);
  const [businessUnitFilters, setBusinessUnitFilters] = useState<string[]>([]);
  const [knownBusinessUnits, setKnownBusinessUnits] = useState<string[]>([]);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const exportInFlightRef = useRef(false);
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
        priority: priorityFilter,
        dateRange: dateRangeFilter ? [dateRangeFilter[0].toISOString(), dateRangeFilter[1].toISOString()] : null,
        pagination: {
          current: 0,
          pageSize: 20,
        },
      });
      setRequestRows(response.items || []);
    } catch (error) {
      message.error('Failed to load warehouse requests.');
    } finally {
      setLoading(false);
    }
  }, [searchText, statusFilter, priorityFilter, dateRangeFilter]);

  const loadBusinessUnits = useCallback(async () => {
    try {
      const response = await fetchSparePartBusinessUnits();
      const businessUnits = response
        .map((item) => item.businessUnit)
        .filter(Boolean)
        .sort();
      setKnownBusinessUnits(businessUnits);
    } catch (error) {
      message.error('Failed to load business units.');
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  useEffect(() => {
    loadBusinessUnits();
  }, [loadBusinessUnits]);

  const reloadRequests = useCallback(async () => {
    await loadRequests();
  }, [loadRequests]);

  const openDrawer = useCallback(
    async (record: WarehouseRequestRecord) => {
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
    },
    [services],
  );

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

      setRequestRows((prev) =>
        prev.map((row) => (row.id === normalizedRecord.id ? normalizedRecord : row)),
      );
      setSelectedRequest((prev) => (prev?.id === normalizedRecord.id ? normalizedRecord : prev));
      setSelectedRequestData((prev) =>
        prev?.id === response.detail.id ? response.detail : response.detail,
      );
    },
    [],
  );

  const acceptRequest = useCallback(
    async (record: WarehouseRequestRecord) => {
      try {
        const response = await services.acceptRequest(record.id);
        applyResponseUpdate(response);
        message.success('Request accepted successfully.');
      } catch (error) {
        message.error('Failed to accept request.');
      }
    },
    [applyResponseUpdate, services],
  );

  const updateBusinessUnitFilters = useCallback((nextBusinessUnits: string[]) => {
    setBusinessUnitFilters(nextBusinessUnits);
  }, []);

  const toggleBusinessUnitFilter = useCallback((businessUnit: string) => {
    setBusinessUnitFilters((previous) =>
      previous.includes(businessUnit)
        ? previous.filter((item) => item !== businessUnit)
        : [...previous, businessUnit],
    );
  }, []);

  const exportRequests = useCallback(
    async ({ dateRange, businessUnits }: RequestsWarehouseExportValues) => {
      if (exportInFlightRef.current) return;
        if (!dateRange?.[0] || !dateRange?.[1]) {
        message.error('Please select a date range.');
        return;
      }
      exportInFlightRef.current = true;
      setExportLoading(true);
      try {
        await downloadGenericReport(requestActions)({
          fileName: `spare-part-requests-${dayjs().format('YYYY-MM-DD-HH-mm-ss')}`,
          type: 'EXCELOPENXML',
          data: {
            reportName: 'spare_parts_requests',
            reportPath: getUrlReporting('prod'),
            data: [
              {
                key: 'StartDate',
                value: dateRange[0].startOf('day').toISOString(),
                type: 'dateTime',
              },
              {
                key: 'EndDate',
                value: dateRange[1].endOf('day').toISOString(),
                type: 'dateTime',
              },
              {
                key: 'BusinessUnit',
                value: businessUnits.length > 0 ? businessUnits.join(',') : 'All',
                type: 'string',
              },
            ],
          },
        });
        setExportModalOpen(false);
      } catch (error) {
        message.error('Failed to export XLSX. Please confirm the report service allows SSRS EXCELOPENXML rendering.');
      } finally {
        exportInFlightRef.current = false;
        setExportLoading(false);
      }
    },
    [requestActions],
  );

  const filteredRequests = useMemo(
    () =>
      requestRows.filter((request) => {
        const keyword = searchText.trim().toLowerCase();
        const matchesKeyword = !keyword || request.requestId.toLowerCase().includes(keyword);
        const displayStatus = deriveWarehouseDisplayStatus(request);
        const requestDate = parseRequestDate(request.requestDate);
        const matchesDateRange =
          !dateRangeFilter ||
          (requestDate.isValid() &&
            !requestDate.isBefore(dateRangeFilter[0].startOf('day')) &&
            !requestDate.isAfter(dateRangeFilter[1].endOf('day')));
        const matchesBusinessUnit =
          businessUnitFilters.length === 0 ||
          request.items.some(
            (item) => item.businessUnit && businessUnitFilters.includes(item.businessUnit),
          );

        return (
          matchesKeyword &&
          (statusFilter === 'All' || displayStatus === statusFilter) &&
          matchesDateRange &&
          matchesBusinessUnit
        );
      }),
    [businessUnitFilters, dateRangeFilter, requestRows, searchText, statusFilter],
  );

  const summaryColumns = useMemo(
    () =>
      buildSummaryColumns({
        onViewRequest: openDrawer,
        onAcceptRequest: acceptRequest,
      }) as unknown as any[],
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
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
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
              onChange={(value) =>
                setStatusFilter((value as 'All' | WarehouseDisplayStatus) || 'All')
              }
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
            <RangePicker
              allowClear
              style={{ width: 260 }}
              value={dateRangeFilter}
              placeholder={['Requested from', 'Requested to']}
              onChange={(dates: null | [Dayjs | null, Dayjs | null]) => {
                setDateRangeFilter(dates?.[0] && dates?.[1] ? [dates[0], dates[1]] : null);
              }}
            />
            {/* <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  display: 'flex',
                  maxWidth: 420,
                  overflowX: 'auto',
                  paddingBottom: 2,
                }}
              >
                <Button
                  type={businessUnitFilters.length === 0 ? 'primary' : 'default'}
                  onClick={() => updateBusinessUnitFilters([])}
                  style={{
                    borderRadius: '6px 0 0 6px',
                    flexShrink: 0,
                  }}
                >
                  All
                </Button> 
              {knownBusinessUnits.map((businessUnit, index) => (
                  <Button
                    key={businessUnit}
                    type={businessUnitFilters.includes(businessUnit) ? 'primary' : 'default'}
                    onClick={() => toggleBusinessUnitFilter(businessUnit)}
                    style={{
                      borderLeftWidth: index === 0 ? undefined : 0,
                      borderRadius: index === knownBusinessUnits.length - 1 ? '0 6px 6px 0' : 0,
                      flexShrink: 0,
                    }}
                  >
                    {businessUnit}
                  </Button>
                ))} 
              </div>
            </div> */}
            {canExportExcel ? (
              <Button icon={<FileExcelOutlined />} onClick={() => setExportModalOpen(true)}>
                Export Excel
              </Button>
            ) : null}
          </Space>

          {/* <Button icon={<ReloadOutlined />} onClick={reloadRequests}>
            Refresh
          </Button> */}
        </div>
      </div>

      <div
        style={{ background: '#fff', borderRadius: 10, border: '1px solid #f0f0f0', padding: 12 }}
      >
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
          tableLayout="auto"
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
                    updated.rawRequestStatus === 'PARTIAL_ISSUE' &&
                    updated.pickupStatus !== 'confirmed'
                      ? 'ready_to_Pickup'
                      : prev.status,
                }
              : prev,
          );
        }}
        onIssueRequest={async (payload) => {
          const response = await services.issueRequest(payload);
          applyResponseUpdate(response);
          await reloadRequests();
          onDataChanged?.();
        }}
        onSaveDraft={async (payload) => {
          const response = await services.saveDraft(payload);
          applyResponseUpdate(response);
          onDataChanged?.();
        }}
        onDeleteDraft={async (id) => {
          const response = await services.deleteDraft(id);
          applyResponseUpdate(response);
          onDataChanged?.();
        }}
        onConfirmPickup={async (payload) => {
          const response = await services.confirmPickup(payload);
          applyResponseUpdate(response);
          onDataChanged?.();
        }}
        onGeneratePickupQr={async (payload) => {
          const response = await services.generatePickupQr(payload);
          applyResponseUpdate(response);
          onDataChanged?.();
        }}
        onAcceptRequest={async (id) => {
          const response = await services.acceptRequest(id);
          applyResponseUpdate(response);
          onDataChanged?.();
        }}
      />
      {canExportExcel ? (
        <RequestsWarehouseExportExcel
          open={exportModalOpen}
          loading={exportLoading}
          businessUnitOptions={knownBusinessUnits}
          reportName="prod_spf_requests"
          onCancel={() => setExportModalOpen(false)}
          onSave={exportRequests}
        />
      ) : null}
    </>
  );
}
