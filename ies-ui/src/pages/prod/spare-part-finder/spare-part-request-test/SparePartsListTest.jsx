import { FileImageOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { ActionType, ProTable } from '@ant-design/pro-components';
import { Avatar, Button, Card, Input, Select, Space, Tag, Typography, message } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { getUploadFileObjectUrlV2 } from '@/services/apiGateway';
import { simpleRequestActions } from '@/services/model';
import { SparePartRequestTestAPI } from './service';

const typeOptions = [
  { label: 'ALL', value: 'All' },
  { label: 'MRO-W', value: 'MRO-W' },
  { label: 'MRO-S', value: 'MRO-S' },
  { label: 'MRO-G', value: 'MRO-G' },
];

const statusOptions = [
  { label: 'All Status', value: 'All' },
  { label: 'Available', value: 'AVAILABLE' },
  { label: 'Low', value: 'LOW' },
  { label: 'No Stock', value: 'NO-STOCK' },
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

export default function SparePartListTest() {
  const actionRef = useRef();
  const requestActions = simpleRequestActions();
  const services = SparePartRequestTestAPI(requestActions);

  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [knownCategories, setKnownCategories] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [filters, setFilters] = useState({
    tag: '',
    status: 'All',
    category: '',
    type: 'All',
  });

  const categoryOptions = [
    { label: 'All Categories', value: '' },
    ...knownCategories.map((item) => ({ label: item, value: item })),
  ];

  const requestData = async (params) => {
    const response = await services.page({
      criteria: {
        searchValue,
        tag: filters.tag,
        status: filters.status,
        category: filters.category,
        type: filters.type,
      },
      pagination: {
        current: params.current,
        pageSize: params.pageSize,
      },
    });

    const rows = response.items || [];
    setKnownCategories((previous) => {
      const categories = rows.map((item) => item.category).filter(Boolean);
      return Array.from(new Set([...previous, ...categories])).sort();
    });

    return {
      data: rows,
      success: true,
      total: response.total || 0,
    };
  };

  return (
    <>
      <Card size="small" style={{ marginBottom: 10 }}>
        <Space wrap size="middle">
          <Input.Search
            allowClear
            enterButton={<SearchOutlined />}
            placeholder="Search by product ID, part name, description, or tag"
            style={{ width: 320 }}
            onSearch={(value) => {
              setSearchValue(value || '');
              setSelectedRowKeys([]);
              actionRef.current?.reloadAndRest?.();
            }}
          />

          <Select
            style={{ width: 120 }}
            value={filters.type}
            options={typeOptions}
            onChange={(value) => {
              setFilters((previous) => ({ ...previous, type: value }));
              setSelectedRowKeys([]);
              actionRef.current?.reloadAndRest?.();
            }}
          />

          <Select
            style={{ width: 160 }}
            value={filters.category}
            options={categoryOptions}
            onChange={(value) => {
              setFilters((previous) => ({ ...previous, category: value }));
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
          rowKey="id"
          size="small"
          bordered
          search={false}
          options={false}
          pagination={{
            defaultPageSize: 20,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50],
          }}
          request={requestData}
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys),
          }}
          toolBarRender={() => [
            <Space key="spare-part-request-actions" size="small">
              <Button icon={<ReloadOutlined />} onClick={() => actionRef.current?.reloadAndRest?.()}>
                Refresh
              </Button>
              <Button
                type="primary"
                disabled={selectedRowKeys.length === 0}
                onClick={() => {
                  message.info(`Selected ${selectedRowKeys.length} spare part(s).`);
                }}
              >
                Request Part ({selectedRowKeys.length})
              </Button>
            </Space>,
          ]}
          columns={[
            {
              title: 'Image',
              dataIndex: 'imageId',
              width: 90,
              align: 'center',
              render: (_, record) => (
                <SparePartImage imageId={record.imageId} alt={record.partName || record.productId} />
              ),
            },
            {
              title: 'Product ID',
              dataIndex: 'productId',
              render: (value) => <Typography.Link>{value}</Typography.Link>,
            },
            {
              title: 'Name',
              dataIndex: 'partName',
            },
            {
              title: 'Type',
              dataIndex: 'type',
              width: 100,
            },
            {
              title: 'Category',
              dataIndex: 'category',
            },
            {
              title: 'Stock',
              dataIndex: 'stock',
              width: 100,
            },
            {
              title: 'Status',
              dataIndex: 'status',
              width: 120,
              render: (value) => {
                if (!value) {
                  return <Typography.Text type="secondary">-</Typography.Text>;
                }

                const normalized = String(value).toUpperCase();
                if (normalized === 'AVAILABLE') {
                  return <Tag color="success">Available</Tag>;
                }
                if (normalized === 'LOW') {
                  return <Tag color="warning">Low</Tag>;
                }
                if (normalized === 'NO-STOCK') {
                  return <Tag color="error">No Stock</Tag>;
                }
                return <Tag>{value}</Tag>;
              },
            },
          ]}
        />
      </Card>
    </>
  );
}