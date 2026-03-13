import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import { useAccess } from '@umijs/max';
import { Button, Card, DatePicker, Input, Select, Space, Tag, Typography, message } from 'antd';
import dayjs from 'dayjs';
import { useRef, useState } from 'react';
import { simpleRequestActions } from '@/services/model';
import RequestItemModal from './requestItem';
import { SparePartRequestAPI } from './service.api';
import SparePartImage from './SparePartImage';
import SpfDetails from './SpfDetails';

const typeOptions = [
  { label: 'All Type', value: 'All' },
  { label: 'MRO-W', value: 'MRO-W' },
  { label: 'MRO-S', value: 'MRO-S' },
  { label: 'MRO-G', value: 'MRO-G' },
];

const statusOptions = [
  { label: 'All Status', value: 'All' },
  { label: 'Available', value: 'available' },
  { label: 'Low', value: 'low' },
  { label: 'No Stock', value: 'no-stock' },
];

export default function SparePartListView() {
  const access = useAccess();
  const actionRef = useRef();
  const requestActions = simpleRequestActions();
  const services = SparePartRequestAPI(requestActions);
  const { RangePicker } = DatePicker;
  const canSeeWarehouseLocation = access.canSpfWarehouseStaff || access.canAdmin;

  const [searchValue, setSearchValue] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedItemsById, setSelectedItemsById] = useState({});
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requestItems, setRequestItems] = useState([]);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsItem, setDetailsItem] = useState(null);
  const [currentRows, setCurrentRows] = useState([]);
  const [knownCategories, setKnownCategories] = useState([]);
  const [knownWarehouses, setKnownWarehouses] = useState([]);
  const [filters, setFilters] = useState({
    type: 'All',
    category: undefined,
    status: 'All',
    warehouse: '',
    createdDateRange: undefined,
  });

  const categoryOptions = [
    { label: 'All Categories', value: '' },
    ...knownCategories.map((item) => ({ label: item, value: item })),
  ];

  const warehouseOptions = [
    { label: 'All Warehouses', value: '' },
    ...knownWarehouses.map((wh) => ({ label: wh, value: wh })),
  ];

  const reloadTable = (resetPage = false) => {
    if (resetPage) {
      actionRef.current?.setPageInfo?.({ current: 1 });
    }
    actionRef.current?.reload?.();
  };

  const requestData = async (params) => {
    const response = await services.page({
      criteria: {
        searchValue,
        type: filters.type,
        category: filters.category || '',
        status: filters.status,
        warehouse: filters.warehouse || '',
      },
      pagination: {
        current: params.current,
        pageSize: params.pageSize,
      },
    });

    let rows = response.items || [];

    if (filters.createdDateRange?.length === 2) {
      const [startIso, endIso] = filters.createdDateRange;
      const startAt = dayjs(startIso).startOf('day');
      const endAt = dayjs(endIso).endOf('day');
      rows = rows.filter((item) => {
        if (!item.createdDate) return false;
        const d = dayjs(item.createdDate);
        return !d.isBefore(startAt) && !d.isAfter(endAt);
      });
    }

    setCurrentRows(rows);
    setSelectedItemsById((previous) => {
      if (!selectedRowKeys?.length) return previous;
      const next = { ...previous };
      rows.forEach((row) => {
        if (selectedRowKeys.includes(String(row.id))) {
          next[String(row.id)] = row;
        }
      });
      return next;
    });
    setKnownCategories((previous) => {
      const merged = new Set([...previous, ...rows.map((item) => item.category).filter(Boolean)]);
      return Array.from(merged).sort();
    });
    setKnownWarehouses((previous) => {
      const merged = new Set([...previous, ...rows.map((item) => item.warehouse).filter(Boolean)]);
      return Array.from(merged).sort();
    });

    return {
      data: rows,
      total:
        filters.createdDateRange?.length === 2
          ? rows.length
          : response.total || 0,
      success: true,
    };
  };

  const openRequestModal = () => {
    const items = selectedRowKeys.map((key) => selectedItemsById[String(key)]).filter(Boolean);
    if (items.length === 0) {
      message.warning('Please select at least one item.');
      return;
    }

    setRequestItems(items);
    setRequestModalOpen(true);
  };

  const openDetails = (item) => {
    setDetailsItem(item || null);
    setDetailsOpen(true);
  };

  const closeDetails = () => {
    setDetailsOpen(false);
    setDetailsItem(null);
  };

  const handleRequestPartsFromDetails = () => {
    if (!detailsItem) return;
    setRequestItems([detailsItem]);
    setRequestModalOpen(true);
    closeDetails();
  };


  return (
    <>
      <Card size="small" style={{ marginBottom: 10 }}>
        <Space wrap size="middle">
          <Input.Search
            allowClear
            enterButton={<SearchOutlined />}
            value={searchValue}
            placeholder="Search by product ID or part name"
            style={{ width: 320 }}
            onChange={(event) => {
              setSearchValue(event.target.value || '');
              reloadTable(true);
            }}
          />

          <Button.Group>
            {typeOptions.map((option) => (
              <Button
                key={option.value}
                type={filters.type === option.value ? 'primary' : 'default'}
                onClick={() => {
                  setFilters((previous) => ({ ...previous, type: option.value }));
                  reloadTable(true);
                }}
              >
                {option.label}
              </Button>
            ))}
          </Button.Group>

          {/* {canSeeWarehouseLocation && ( */}
            <Select
              style={{ width: 180 }}
              value={filters.warehouse}
              options={warehouseOptions}
              onChange={(value) => {
                setFilters((previous) => ({ ...previous, warehouse: value || '' }));
                reloadTable(true);
              }}
            />
          {/* )} */}

          <Select
            style={{ width: 180 }}
            value={filters.category || ''}
            options={categoryOptions}
            onChange={(value) => {
              setFilters((previous) => ({ ...previous, category: value || undefined }));
              reloadTable(true);
            }}
          />

          <Select
            style={{ width: 140 }}
            value={filters.status}
            options={statusOptions}
            onChange={(value) => {
              setFilters((previous) => ({ ...previous, status: value }));
              reloadTable(true);
            }}
          />

          {/* <RangePicker
            allowClear
            style={{ width: 260 }}
            placeholder={['Created from', 'Created to']}
            onChange={(dates) => {
              if (dates && dates[0] && dates[1]) {
                setFilters((previous) => ({
                  ...previous,
                  createdDateRange: [dates[0].toISOString(), dates[1].toISOString()],
                }));
              } else {
                setFilters((previous) => ({ ...previous, createdDateRange: undefined }));
              }
              reloadTable(true);
            }}
          /> */}
        </Space>
      </Card>

      <Card size="small">
        <ProTable
          actionRef={actionRef}
          size="small"
          rowKey={(record) => String(record.id)}
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
            preserveSelectedRowKeys: true,
            onChange: (keys, rows) => {
              const normalizedKeys = (keys || []).map((k) => String(k));
              setSelectedRowKeys(normalizedKeys);

              setSelectedItemsById((previous) => {
                const next = {};
                const keySet = new Set(normalizedKeys);

                Object.keys(previous || {}).forEach((k) => {
                  if (keySet.has(k)) {
                    next[k] = previous[k];
                  }
                });

                (rows || []).forEach((r) => {
                  if (r?.id != null) {
                    next[String(r.id)] = r;
                  }
                });

                return next;
              });
            },
          }}
          toolBarRender={() => [
            <Space key="spr-action-bar" size="small">
              <Button icon={<ReloadOutlined />} onClick={() => reloadTable(false)}>
                Refresh
              </Button>
              {(access.canSpfRequester || access.canSpfApprover) &&(
                <Button onClick={() => message.info('Import Excel action is not wired yet.')}>
                Import Excel
              </Button>
              )}
              {(access.canSpfRequester || access.canSpfApprover) && (
                <Button type="primary" disabled={selectedRowKeys.length === 0} onClick={openRequestModal}>
                  Request{selectedRowKeys.length ? ` (${selectedRowKeys.length})` : ''}
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
              render: (_, record) => (
                <SparePartImage
                  imageId={record.imageId}
                  src={record.image}
                  alt={record.partName || record.productId}
                  size={48}
                />
              ),
            },
            {
              title: 'Product ID',
              dataIndex: 'productId',
              render: (_, record) => (
                <Typography.Link
                  onClick={(event) => {
                    event.preventDefault();
                    openDetails(record);
                  }}
                >
                  {record.productId}
                </Typography.Link>
              ),
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
            ...(canSeeWarehouseLocation
              ? [
                  {
                    title: 'Warehouse',
                    dataIndex: 'warehouse',
                    width: 120,
                    render: (v) => v || '—',
                  },
                  {
                    title: 'Line',
                    dataIndex: 'line',
                    width: 120,
                    render: (v) => v || '—',
                  },
                  {
                    title: 'Shift',
                    dataIndex: 'shift',
                    width: 120,
                    render: (v) => v || '—',
                  },
                  {
                    title: 'Bin',
                    dataIndex: 'bin',
                    width: 120,
                    render: (v) => v || '—',
                  },
                  // {
                  //   title: 'Level',
                  //   dataIndex: 'level',
                  //   width: 120,
                  //   render: (v) => v || '—',
                  // },
                ]
              : []),
            {
              title: 'Categories',
              dataIndex: 'category',
            },
            {
              title: 'Stock',
              dataIndex: 'stock',
              width: 90,
              render: (_, record) => {
                if (record.stock <= 0) {
                  return <Typography.Text type="danger">00</Typography.Text>;
                }
                if (record.stock <= 2) {
                  return <Typography.Text type="warning">{record.stock}</Typography.Text>;
                }
                return record.stock;
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
              render: (_, record) => {
                if (record.status === 'available') return <Tag color="success">Available</Tag>;
                if (record.status === 'low') return <Tag color="warning">Low</Tag>;
                return <Tag color="error">No Stock</Tag>;
              },
            },
          ]}
          request={requestData}
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

          if (typeof services.createRequest !== 'function') {
            message.info('Request submission API is not wired yet.');
            return;
          }

          try {
            const created = await services.createRequest(payload);
            message.success(`Request ${created.requestId} submitted successfully.`);
            setRequestModalOpen(false);
            setSelectedRowKeys([]);
            setSelectedItemsById({});
            reloadTable(true);
          } catch (error) {
            message.error('Failed to submit request.');
          }
        }}
        onAddMore={() => {
          setRequestModalOpen(false);
          message.info('Select more items from the list, then click Request again.');
        }}
      />

      <SpfDetails
        open={detailsOpen}
        data={
          detailsItem
            ? {
                image: detailsItem.image,
                imageId: detailsItem.imageId,
                spare_part_name: detailsItem.partName,
                part_number: detailsItem.productId,
                description: detailsItem.description,
                stock_quantity: detailsItem.stock,
                receiving_from_warehouse: detailsItem.warehouse,
                zone: detailsItem.line,
                shelf: detailsItem.level,
                level: detailsItem.bin,
                company: detailsItem.company,
                category: detailsItem.category,
                spare_part_type: detailsItem.type,
                business_unit: detailsItem.businessUnit,
                requested_date: detailsItem.createdDate,
              }
            : undefined
        }
        onClose={closeDetails}
        onRequestParts={handleRequestPartsFromDetails}
      />

    </>
  );
}
