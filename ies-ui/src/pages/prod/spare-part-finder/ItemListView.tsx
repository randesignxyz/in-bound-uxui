import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import type { ActionType } from '@ant-design/pro-components';
import { useAccess } from '@umijs/max';
import { useEffect, useRef, useState } from 'react';
import { Button, Card, Input, Select, Space, Tag, Typography, message } from 'antd';
import type { SortOrder } from 'antd/es/table/interface';
import type {
  SparePartRequestItem,
  SparePartRequestSearch,
  SparePartStockStatus,
  SparePartTab,
} from './spare-part-request/data';
import { fetchSparePartCategories } from './spare-part-request/service.api';
import RequestItemModal from './spare-part-request/requestItem';
import type { SparePartRequestServiceReturn } from './spare-part-request/service';

interface ItemListViewProps {
  services: SparePartRequestServiceReturn;
  activeTab: SparePartTab;
  onSwitchToMyRequests: () => void;
}

const ItemListView: React.FC<ItemListViewProps> = ({ services, activeTab, onSwitchToMyRequests }) => {
  const access = useAccess();
  const actionRef = useRef<ActionType>();

  const [searchValue, setSearchValue] = useState<string>();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requestItems, setRequestItems] = useState<SparePartRequestItem[]>([]);
  const [currentRows, setCurrentRows] = useState<SparePartRequestItem[]>([]);
  const [knownCategories, setKnownCategories] = useState<string[]>([]);
  const [filters, setFilters] = useState<{
    category?: string;
    status?: 'ALL' | SparePartStockStatus;
  }>({});

  const categoryOptions = knownCategories.map((it) => ({ label: it, value: it }));

  useEffect(() => {
    fetchSparePartCategories()
      .then((items) => setKnownCategories(items.map((item) => item.category_name).filter(Boolean)))
      .catch(() => undefined);
  }, []);

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
          category: filters.category,
          status: filters.status,
        } as SparePartRequestSearch,
        sort,
      },
      pagination,
    };

    const rs = await services.page(params);
    const rows = rs.items || [];
    setCurrentRows(rows);
    return {
      data: rows,
      total: rs.total || 0,
      success: true,
    };
  };

  return (
    <>
      <Card size="small" style={{ marginBottom: 10 }}>
        <Space wrap size="middle">
          <Input.Search
            allowClear
            style={{ width: 360 }}
            placeholder="Search by name, product ID, category, status, business unit"
            onSearch={(v) => {
              setSearchValue(v);
              actionRef.current?.reloadAndRest?.();
            }}
            enterButton={<SearchOutlined />}
          />

          {/* hidden — field temporarily removed from backend */}

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
              {(access.canSpfRequester || access.canSpfApprover) && (
                <Button
                  type="primary"
                  disabled={selectedRowKeys.length === 0}
                  onClick={() => {
                    const items = currentRows.filter((it) => selectedRowKeys.includes(it.id));
                    setRequestItems(items);
                    setRequestModalOpen(true);
                  }}
                >
                  Request
                </Button>
              )}
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
              title: 'Category',
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
        onSubmit={async (payload) => {
          if (!(access.canSpfRequester || access.canSpfApprover)) {
            message.error('You are not allowed to submit spare part requests.');
            return;
          }
          try {
            const created = await services.createRequest(payload);
            message.success(
              `Request ${created.requestId} submitted (${payload.items.length} item(s), priority: ${payload.priority})`,
            );
            setRequestModalOpen(false);
            setSelectedRowKeys([]);
            onSwitchToMyRequests();
          } catch (err) {
            message.error('Failed to submit request.');
          }
        }}
        onAddMore={() => {
          setRequestModalOpen(false);
          message.info('Select more items from the list, then click Request again.');
        }}
      />
    </>
  );
};

export default ItemListView;
