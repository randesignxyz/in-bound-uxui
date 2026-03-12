import { FileImageOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import { useAccess } from '@umijs/max';
import { Avatar, Button, Card, Input, Select, Space, Tag, Typography, message } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { simpleRequestActions } from '@/services/model';
import RequestItemModal from './requestItem';
import { SparePartRequestAPI } from './service.api';

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
 
  function SparePartImage({ imageId, alt }) {
    const [imageUrl, setImageUrl] = useState();
  
    useEffect(() => {
      let active = true;
      let objectUrl;
  
      if (!imageId) {
        setImageUrl(undefined);
        return undefined;
      }
  
      getUploadFileObjectUrlV2()(imageId)
        .then((url) => {
          if (!active) {
            URL.revokeObjectURL(url);
            return;
          }
          objectUrl = url;
          setImageUrl(url);
        })
        .catch(() => setImageUrl(undefined));
  
      return () => {
        active = false;
        if (objectUrl) {
          URL.revokeObjectURL(objectUrl);
        }
      };
    }, [imageId]);
  
    return imageUrl ? (
      <Avatar src={imageUrl} alt={alt} size={48} shape="square" />
    ) : (
      <Avatar icon={<FileImageOutlined />} size={48} shape="square" />
    );
  }

export default function SparePartListView() {
  const access = useAccess();
  const actionRef = useRef();
  const requestActions = simpleRequestActions();
  const services = SparePartRequestAPI(requestActions);

  const [searchValue, setSearchValue] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requestItems, setRequestItems] = useState([]);
  const [currentRows, setCurrentRows] = useState([]);
  const [knownCategories, setKnownCategories] = useState([]);
  const [filters, setFilters] = useState({
    type: 'All',
    category: undefined,
    status: 'All',
  });

  const categoryOptions = [
    { label: 'All Categories', value: '' },
    ...knownCategories.map((item) => ({ label: item, value: item })),
  ];

  const requestData = async (params) => {
    const response = await services.page({
      criteria: {
        searchValue,
        type: filters.type,
        category: filters.category || '',
        status: filters.status,
        warehouse: '',
      },
      pagination: {
        current: params.current,
        pageSize: params.pageSize,
      },
    });

    const rows = response.items || [];
    setCurrentRows(rows);
    setKnownCategories((previous) => {
      const merged = new Set([...previous, ...rows.map((item) => item.category).filter(Boolean)]);
      return Array.from(merged).sort();
    });

    return {
      data: rows,
      total: response.total || 0,
      success: true,
    };
  };

  const openRequestModal = () => {
    const items = currentRows.filter((item) => selectedRowKeys.includes(item.id));
    if (items.length === 0) {
      message.warning('Please select at least one item.');
      return;
    }

    setRequestItems(items);
    setRequestModalOpen(true);
  };


  return (
    <>
      <Card size="small" style={{ marginBottom: 10 }}>
        <Space wrap size="middle">
          <Input.Search
            allowClear
            enterButton={<SearchOutlined />}
            placeholder="Search by product ID or part name"
            style={{ width: 320 }}
            onSearch={(value) => {
              setSearchValue(value || '');
              setSelectedRowKeys([]);
              actionRef.current?.reloadAndRest?.();
            }}
          />

          <Button.Group>
            {typeOptions.map((option) => (
              <Button
                key={option.value}
                type={filters.type === option.value ? 'primary' : 'default'}
                onClick={() => {
                  setFilters((previous) => ({ ...previous, type: option.value }));
                  setSelectedRowKeys([]);
                  actionRef.current?.reloadAndRest?.();
                }}
              >
                {option.label}
              </Button>
            ))}
          </Button.Group>
         

          <Select
            style={{ width: 180 }}
            value={filters.category || ''}
            options={categoryOptions}
            onChange={(value) => {
              setFilters((previous) => ({ ...previous, category: value || undefined }));
              setSelectedRowKeys([]);
              actionRef.current?.reloadAndRest?.();
            }}
          />

          <Select
            style={{ width: 140 }}
            value={filters.status}
            options={statusOptions}
            onChange={(value) => {
              setFilters((previous) => ({ ...previous, status: value }));
              setSelectedRowKeys([]);
              actionRef.current?.reloadAndRest?.();
            }}
          />
        </Space>
      </Card>

      <Card size="small">
        <ProTable
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
                <Button type="primary" disabled={selectedRowKeys.length === 0} onClick={openRequestModal}>
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
              render: (_, record) => (
                <SparePartImage imageId={record.imageId} alt={record.partName || record.productId} />
              ),
            },
            {
              title: 'Product ID',
              dataIndex: 'productId',
              render: (_, record) => <Typography.Link>{record.productId}</Typography.Link>,
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
            actionRef.current?.reloadAndRest?.();
          } catch (error) {
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
}