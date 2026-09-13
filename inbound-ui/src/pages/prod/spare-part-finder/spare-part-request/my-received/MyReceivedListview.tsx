import { SearchOutlined } from '@ant-design/icons';
import { useAccess } from '@umijs/max';
import { useRef, useState } from 'react';
import { Card, DatePicker, Input, Select, Space, Tabs, Typography } from 'antd';
import type { ActionType } from '@ant-design/pro-components';
import type { SortOrder } from 'antd/es/table/interface';
import type { MyReceivedItem, MyReceivedSearch, ReceivedStatus } from '../data';
import type { SparePartRequestServiceReturn } from '../service';
import BatchView from './BatchView';
import SummaryView from './SummaryView';

type ReceivedViewTab = 'batch' | 'summary';

const statusOptions: { label: string; value: 'ALL' | ReceivedStatus }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Completed', value: 'completed' },
  { label: 'Partial', value: 'partial' },
];

interface MyReceivedListviewProps {
  services: SparePartRequestServiceReturn;
}

const MyReceivedListview: React.FC<MyReceivedListviewProps> = ({ services }) => {
  const access = useAccess();
  const actionRef = useRef<ActionType>();

  const [viewTab, setViewTab] = useState<ReceivedViewTab>('batch');
  const [searchValue, setSearchValue] = useState<string>();
  const [filters, setFilters] = useState<{
    status: 'ALL' | ReceivedStatus;
    dateRange?: [string, string];
  }>({
    status: 'ALL',
  });

  const requestData = async (
    pagination: { current?: number; pageSize?: number },
    sort?: Record<string, SortOrder>,
  ) => {
    const params = {
      criteria: {
        searchValue,
        advanceSearch: {
          searchValue,
          status: filters.status,
          dateRange: filters.dateRange,
          sort,
        } as MyReceivedSearch,
        sort,
      },
      pagination,
    };

    const rs = await services.myReceivedPage(params);
    return {
      data: rs.items || [],
      total: rs.total || 0,
      success: true,
    };
  };

  if (!access.canSpfWarehouseStaff) {
    return (
      <Card>
        <Typography.Text type="danger">
          You do not have permission to access My Received.
        </Typography.Text>
      </Card>
    );
  }

  return (
    <>
      <Card size="small" style={{ marginBottom: 10 }}>
        <Space wrap size="middle">
          <Input.Search
            allowClear
            style={{ width: 280 }}
            placeholder="Search Spare Request ID"
            onSearch={(v) => {
              setSearchValue(v);
              actionRef.current?.reloadAndRest?.();
            }}
            enterButton={<SearchOutlined />}
          />

          <Select
            allowClear
            placeholder="Status"
            style={{ minWidth: 120 }}
            options={statusOptions.filter((o) => o.value !== 'ALL')}
            onChange={(v) => {
              setFilters((prev) => ({ ...prev, status: v || 'ALL' }));
              actionRef.current?.reloadAndRest?.();
            }}
          />

          <DatePicker.RangePicker
            placeholder={['Filter By Date', 'End date']}
            onChange={(dates) => {
              if (dates && dates[0] && dates[1]) {
                setFilters((prev) => ({
                  ...prev,
                  dateRange: [dates[0]!.toISOString(), dates[1]!.toISOString()],
                }));
              } else {
                setFilters((prev) => ({ ...prev, dateRange: undefined }));
              }
              actionRef.current?.reloadAndRest?.();
            }}
          />
        </Space>
      </Card>

      <Card size="small">
        <style>{`.spf-received-tabs .ant-tabs-nav-list { margin-left: auto; }`}</style>
        <Tabs
          className="spf-received-tabs"
          activeKey={viewTab}
          onChange={(key) => setViewTab(key as ReceivedViewTab)}
          tabBarStyle={{ marginBottom: 0 }}
          items={[
            {
              key: 'batch',
              label: 'Batch View',
              children: (
                <BatchView actionRef={actionRef} requestData={requestData} />
              ),
            },
            {
              key: 'summary',
              label: 'Summary View',
              children: (
                <SummaryView actionRef={actionRef} requestData={requestData} />
              ),
            },
          ]}
        />
      </Card>
    </>
  );
};

export default MyReceivedListview;