import BreadCrumbCom from '@/pages/sale/retailer/components/BreadCrumbCom';
import { simpleRequestActions } from '@/services/model';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import type { ActionType } from '@ant-design/pro-components';
import { useRef, useState } from 'react';
import { Button, Card, Input, Select, Space, Tabs, Tag, Typography, message } from 'antd';
import type { SortOrder } from 'antd/es/table/interface';
import { ProdPaths } from '../..';
import { SparePartRequestServiceAPI } from './service';
import { sparePartRequestMockData } from './MockData/itemList';
import type {
  SparePartRequestItem,
  SparePartRequestSearch,
  SparePartStockStatus,
  SparePartTab,
  SparePartType,
} from './data';
import RequestItemModal from './requestItem';

const typeOptions: { label: string; value: 'ALL' | SparePartType }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'MRO-W', value: 'MRO-W' },
  { label: 'MRO-S', value: 'MRO-S' },
  { label: 'MRO-G', value: 'MRO-G' },
];

export default () => {
  const actionRef = useRef<ActionType>();
  const requestActions = simpleRequestActions();
  const services = SparePartRequestServiceAPI(requestActions);

  const [searchValue, setSearchValue] = useState<string>();
  const [activeTab, setActiveTab] = useState<SparePartTab>('spare-list');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requestItems, setRequestItems] = useState<SparePartRequestItem[]>([]);
  const [filters, setFilters] = useState<{
    type: 'ALL' | SparePartType;
    category?: string;
    status?: 'ALL' | SparePartStockStatus;
  }>({
    type: 'ALL',
  });

  const routes = [
    { path: ProdPaths.prod, label: 'Prod' },
    { path: '', label: 'Spare Part Request' },
  ];

  const categoryOptions = [...new Set(sparePartRequestMockData.map((it) => it.category))].map((it) => ({
    label: it,
    value: it,
  }));

  const requestData = async (
    pagination: { current?: number; pageSize?: number },
    sort?: Record<string, SortOrder>,
  ) => {
    const params = {
      criteria: {
        searchValue,
        advanceSearch: {
          searchValue,
          tab: activeTab,
          type: filters.type,
          category: filters.category,
          status: filters.status,
        } as SparePartRequestSearch,
        sort,
      },
      pagination,
    };

    const rs = await services.page(params);
    return {
      data: rs.items || [],
      total: rs.total || 0,
      success: true,
    };
  };

  return (
    <>
      <BreadCrumbCom separator=">" routes={routes} />

      <Tabs
        style={{ marginBottom: 12 }}
        activeKey={activeTab}
        onChange={(key) => {
          setActiveTab(key as SparePartTab);
          setSelectedRowKeys([]);
          actionRef.current?.reloadAndRest?.();
        }}
        items={[
          { key: 'spare-list', label: 'Spare Part List' },
          { key: 'my-requests', label: 'My Requests' },
          { key: 'my-received', label: 'My Received' },
        ]}
      />

      <Card size="small" style={{ marginBottom: 10 }}>
        <Space wrap size="middle">
          <Input.Search
            allowClear
            style={{ width: 360 }}
            placeholder="Search by name, product ID, category, type, status, business unit"
            onSearch={(v) => {
              setSearchValue(v);
              actionRef.current?.reloadAndRest?.();
            }}
            enterButton={<SearchOutlined />}
          />

          <Button.Group>
            {typeOptions.map((it) => (
              <Button
                key={it.value}
                type={filters.type === it.value ? 'primary' : 'default'}
                onClick={() => {
                  setFilters((prev) => ({ ...prev, type: it.value }));
                  setSelectedRowKeys([]);
                  actionRef.current?.reloadAndRest?.();
                }}
              >
                {it.label}
              </Button>
            ))}
          </Button.Group>

          <Select
            allowClear
            placeholder="Category"
            style={{ minWidth: 160 }}
            options={categoryOptions}
            onChange={(v) => {
              setFilters((prev) => ({ ...prev, category: v }));
              setSelectedRowKeys([]);
              actionRef.current?.reloadAndRest?.();
            }}
          />
          <Select
            allowClear
            placeholder="Status"
            style={{ minWidth: 140 }}
            options={[
              { label: 'Available', value: 'available' },
              { label: 'Low', value: 'low' },
              { label: 'No Stock', value: 'no-stock' },
            ]}
            onChange={(v) => {
              setFilters((prev) => ({ ...prev, status: v }));
              setSelectedRowKeys([]);
              actionRef.current?.reloadAndRest?.();
            }}
          />
        </Space>
      </Card>

      <Card size="small">
        <ProTable<SparePartRequestItem>
          actionRef={actionRef}
          size="small"
          rowKey="id"
          search={false}
          options={false}
          bordered
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50],
          }}
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys),
          }}
          toolBarRender={() => [
            <Space key="spr-action-bar" size="small">
              <Button icon={<ReloadOutlined />} onClick={() => actionRef.current?.reloadAndRest?.()}>
                Refresh
              </Button>
              <Button onClick={() => message.info('Import Excel action is not wired yet.')}>
                Import Excel
              </Button>
              <Button
                type="primary"
                disabled={selectedRowKeys.length === 0}
                onClick={() => {
                  const items = sparePartRequestMockData.filter((it) =>
                    selectedRowKeys.includes(it.id),
                  );
                  setRequestItems(items);
                  setRequestModalOpen(true);
                }}
              >
                Request
              </Button>
            </Space>,
          ]}
          columns={[
            {
              title: 'Image',
              dataIndex: 'image',
              width: 80,
              align: 'center',
              render: (_, r) =>
                r.image ? (
                  <img
                    src={r.image}
                    alt={r.partName}
                    style={{ width: 48, height: 48, objectFit: 'contain' }}
                  />
                ) : (
                  <Typography.Text type="secondary">-</Typography.Text>
                ),
            },
            {
              title: 'Product ID',
              dataIndex: 'productId',
              render: (_, r) => <a>{r.productId}</a>,
            },
            {
              title: 'Part Name',
              dataIndex: 'partName',
            },
            {
              title: 'Type',
              dataIndex: 'type',
              width: 100,
            },
            {
              title: 'Categories',
              dataIndex: 'category',
            },
            {
              title: 'Stock',
              dataIndex: 'stock',
              width: 90,
              render: (_, r) => {
                if (r.stock <= 0) return <Typography.Text type="danger">00</Typography.Text>;
                if (r.stock <= 2) return <Typography.Text type="warning">{r.stock}</Typography.Text>;
                return <>{r.stock}</>;
              },
            },
            {
              title: 'Business Unit',
              dataIndex: 'businessUnit',
              width: 120,
            },
            {
              title: 'Status',
              dataIndex: 'status',
              width: 120,
              render: (_, r) => {
                if (r.status === 'available') return <Tag color="success">Available</Tag>;
                if (r.status === 'low') return <Tag color="warning">Low</Tag>;
                return <Tag color="error">No Stock</Tag>;
              },
            },
          ]}
          request={async (params, sort) => requestData(params, sort)}
        />
      </Card>

      <RequestItemModal
        open={requestModalOpen}
        selectedItems={requestItems}
        onCancel={() => setRequestModalOpen(false)}
        onSubmit={(payload) => {
          console.log('Submit payload:', payload);
          message.success(`Submitted ${payload.items.length} item(s) with priority: ${payload.priority}`);
          setRequestModalOpen(false);
          setSelectedRowKeys([]);
        }}
        onAddMore={() => {
          setRequestModalOpen(false);
          message.info('Select more items from the list, then click Request again.');
        }}
      />
    </>
  );
};
