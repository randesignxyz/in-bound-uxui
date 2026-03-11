import { EyeFilled, EyeOutlined, MoreOutlined, ReloadOutlined } from '@ant-design/icons';
import { ActionType, ProTable } from '@ant-design/pro-components';
import { Avatar, Button, Card, DatePicker, Dropdown, Input, Radio, Select, Space, Tooltip } from 'antd';
import { useRef, useState } from 'react';
import { useNavigate } from '@umijs/max';
import FormModalSelectItems from './FormModalSelectItems';
import DrawerViewItem from './DrawerViewItem';
import type { SparePartReturnListItem } from './data';
import { SPARE_PART_CATEGORY_OPTIONS, SPARE_PART_RETURN_RADIO_OPTIONS } from './data';
import { getSparePartReturnMockPage } from './service';
import idID from '@/locales/id-ID';

export default function MySparePartList() {
  const actionRef = useRef<ActionType>();
  const navigate = useNavigate();
  const [radioValue, setRadioValue] = useState('All');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedItems, setSelectedItems] = useState<SparePartReturnListItem[]>([]);
  const [modalOpen, setModalOpen] = useState<{ visible: boolean; data?: SparePartReturnListItem[] }>({ visible: false });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SparePartReturnListItem | null>(null);
  const radioOptions = SPARE_PART_RETURN_RADIO_OPTIONS;
  const onDetailhandler = (data: SparePartReturnListItem) => {
    setDrawerOpen(true);
    setSelectedItem(data);
  };

  const handleReturnPart = () => {
    if (selectedItems.length > 0) {
      setModalOpen({ visible: true, data: selectedItems });
    }
  };

  const handleModalSubmit = (items: SparePartReturnListItem[]) => {
    console.log('Submitting return for items:', items);
    setModalOpen({ visible: false });
    setSelectedItems([]);
    setSelectedRowKeys([]);
  };

  const handleAddMore = (items: SparePartReturnListItem[]) => {
    setSelectedItems(items);
    setModalOpen({ visible: false });
  };

  const handleModalCancel = () => {
    setModalOpen((prev) => ({ ...prev, visible: false }));
  };

  return (
    <>
      <Card size="small" style={{ marginBottom: 10 }}
      >
        <Space wrap size="middle">
        <Input.Search
          placeholder="Search spare parts..."
          allowClear
          onSearch={(value: string) => {
            console.log('Searching for:', value);
            actionRef.current?.reload();
          }}
          style={{ width: 250 }}
        />
          {/* Desktop: Radio Group */}
          <div className="radio-group-desktop">
            <Radio.Group
              value={radioValue}
              onChange={(e) => {
                setRadioValue(e.target.value);
                setSelectedRowKeys([]);
                setSelectedItems([]);
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
                    setSelectedItems([]);
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
            defaultValue="category"
            style={{ width: 125 }}
            options={[...SPARE_PART_CATEGORY_OPTIONS]}
            onChange={() => {
              setSelectedRowKeys([]);
              setSelectedItems([]);
              actionRef.current?.reloadAndRest?.();
            }}
          />
          <DatePicker />
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
          request={async (params) => {
            const result = await getSparePartReturnMockPage({
              current: params.current,
              pageSize: params.pageSize,
            });
            return {
              data: result.items,
              success: true,
              total: result.total ?? result.items.length,
            };
          }}
          rowSelection={{
            selectedRowKeys,
            onChange: (keys, rows) => {
              setSelectedRowKeys(keys);
              setSelectedItems(rows);
            },
          }}
          toolBarRender={() => [
            <Space key="spr-return-bar" size="small">
              <Button icon={<ReloadOutlined />} onClick={() => actionRef.current?.reloadAndRest?.()}>
                Refresh
              </Button>
              <Button>My Requests</Button>
              <Button>Import Excel</Button>
              <Button
                type={selectedItems.length > 0 ? 'primary' : 'default'}
                disabled={selectedItems.length === 0}
                onClick={handleReturnPart}
              >
                Return Part ({selectedItems.length})
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
                    <Button
                       icon={<EyeOutlined style={{ color: '#999' }} />}
                      type="text"
                      size="small"
                      onClick={() => onDetailhandler(record)}
                    />
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
              title: 'Product Number',
              dataIndex: 'part_number',
              render: (value, id) => (
                <a onClick={() =>  onDetailhandler(id)}>
                  {value}
                </a>
              ),
            },
            { key: 'spare_part_name', title: 'Name', dataIndex: 'spare_part_name' },
            { key: 'spare_part_type', title: 'Type', dataIndex: 'spare_part_type' },
            { key: 'category', title: 'Category', dataIndex: 'category' },
            { key: 'Warehouse', title: 'Warehouse', dataIndex: 'receiving_from_warehouse' },
            { key: 'BU', title: 'BU', dataIndex: 'business_unit' },
            { key: 'Requested_Date', title: 'Requested Date', dataIndex: 'requested_date' },
            { key: 'Requested_Pickup_Date', title: 'Requested Pickup Date', dataIndex: 'requested_pickup_date' },
          ]}
        />
      </Card>

      <FormModalSelectItems
        open={modalOpen.visible}
        onCancel={handleModalCancel}
        onSubmit={handleModalSubmit}
        data={modalOpen.data}
      />
      <DrawerViewItem
        open={drawerOpen}
        data={selectedItem}
        onClose={() => setDrawerOpen(false)}
      />
    </>
  );
}
