import { EyeFilled, MoreOutlined, ReloadOutlined } from '@ant-design/icons';
import { ActionType, ProTable } from '@ant-design/pro-components';
import { Avatar, Button, Card, Dropdown, Radio, Select, Space, Tooltip } from 'antd';
import { useRef, useState } from 'react';
import { useNavigate } from '@umijs/max';

export default function SparePartListingview() {
  const actionRef = useRef<ActionType>();
  const navigate = useNavigate();
  const [radioValue, setRadioValue] = useState('All');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const getDataSparePart = async () => {
    const response = await fetch('https://6818806f5a4b07b9d1cf68de.mockapi.io/spare-parts');
    const data = await response.json();
    return data;
  };

  const radioOptions = [
    { value: 'All', label: 'ALL' },
    { value: 'MRO-W', label: 'MRO-W' },
    { value: 'MRO-S', label: 'MRO-S' },
    { value: 'MRO-G', label: 'MRO-G' },
  ];

  const onDetailhandler = (data: any) => {
    console.log(data);
  };

  return (
    <>
      <Card size="small" style={{ marginBottom: 10 }}>
        <Space wrap size="middle">
          {/* Desktop: Radio Group */}
          <div className="radio-group-desktop">
            <Radio.Group
              value={radioValue}
              onChange={(e) => {
                setRadioValue(e.target.value);
                setSelectedRowKeys([]);
                actionRef.current?.reloadAndRest?.();
              }}
            >
              {radioOptions.map((opt) => (
                <Radio.Button key={opt.value} value={opt.value}>
                  {opt.label}
                </Radio.Button>
              ))}
            </Radio.Group>
          </div>

          {/* Mobile: Dropdown */}
          <div className="radio-group-mobile">
            <Dropdown
              menu={{
                items: radioOptions.map((opt) => ({
                  key: opt.value,
                  label: opt.label,
                  onClick: () => {
                    setRadioValue(opt.value);
                    setSelectedRowKeys([]);
                    actionRef.current?.reloadAndRest?.();
                  },
                })),
                selectedKeys: [radioValue],
              }}
              trigger={['click']}
            >
              <Button>
                {radioOptions.find((opt) => opt.value === radioValue)?.label} <MoreOutlined />
              </Button>
            </Dropdown>
          </div>

          <Select
            defaultValue="ALL_WH"
            style={{ width: 125 }}
            options={[
              { value: 'All_WH', label: 'All WH' },
              { value: 'W-1', label: 'WH1' },
              { value: 'W-2', label: 'WH2' },
              { value: 'W-3', label: 'WH3' },
            ]}
            onChange={() => {
              setSelectedRowKeys([]);
              actionRef.current?.reloadAndRest?.();
            }}
          />
          <Select
            defaultValue="All"
            style={{ width: 125 }}
            options={[
              { value: 'All', label: 'All Categories' },
              { value: 'Mechanical', label: 'Mechanical' },
              { value: 'Electrical', label: 'Electrical' },
              { value: 'Hydraulic', label: 'Hydraulic' },
              { value: 'Tools', label: 'Tools' },
            ]}
            onChange={() => {
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
            defaultPageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50],
          }}
          request={async () => {
            const data = await getDataSparePart();
            return { data, success: true, total: data.length };
          }}
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys),
          }}
          toolBarRender={() => [
            <Space key="spl-action-bar" size="small">
              <Button icon={<ReloadOutlined />} onClick={() => actionRef.current?.reloadAndRest?.()}>
                Refresh
              </Button>
              <Button>Import Excel</Button>
              <Button
                type="primary"
                disabled={selectedRowKeys.length === 0}
              >
                Request Part
              </Button>
            </Space>,
          ]}
          columns={[
            {
              title: '',
              width: 48,
              render: (_, record) => (
                <Space size={1}>
                  <Tooltip title="View Details">
                    <Button icon={<EyeFilled />} onClick={() => onDetailhandler(record)} />
                  </Tooltip>
                </Space>
              ),
            },
            {
              key: 'image',
              title: 'Image',
              dataIndex: 'image',
              render: (image) => <Avatar src={image} size={48} shape="square" />,
            },
            {
              key: 'part_number',
              title: 'Part Number',
              dataIndex: 'part_number',
              render: (value, r) => (
                <a onClick={() => navigate(`/prod/spare-part-request/view/${r.id}`, { state: { id: r.id } })}>
                  {value}
                </a>
              ),
            },
            { key: 'spare_part_name', title: 'Name', dataIndex: 'spare_part_name' },
            { key: 'spare_part_type', title: 'Type', dataIndex: 'spare_part_type' },
            { key: 'category', title: 'Category', dataIndex: 'category' },
            { key: 'stock', title: 'Stock', dataIndex: 'stock' },
            { key: 'BU', title: 'BU', dataIndex: 'business_unit' },
            { key: 'Status', title: 'Status', dataIndex: 'status' },
          ]}
        />
      </Card>
    </>
  );
}
