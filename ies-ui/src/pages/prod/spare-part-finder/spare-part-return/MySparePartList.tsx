import { RequestActions } from '@/services/apiGateway';
import { EyeOutlined, InfoCircleOutlined, MoreOutlined, ReloadOutlined } from '@ant-design/icons';
import { ActionType, ProTable } from '@ant-design/pro-components';
import type { Dayjs } from 'dayjs';
import {
  Avatar,
  Button,
  Card,
  DatePicker,
  Dropdown,
  Input,
  message,
  Radio,
  Select,
  Space,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import { useRef, useState } from 'react';
import DrawerViewItem from './DrawerViewItem';
import FormModalSelectItems from './FormModalSelectItems';
import type { SparePartReturnListItem } from './data';
import { SPARE_PART_CATEGORY_OPTIONS, SPARE_PART_RETURN_RADIO_OPTIONS } from './data';
import { SparePartReturnAPI } from './service';
import SparePartImage from '../spare-part-request/SparePartImage';

export default function MySparePartList() {
  const actionRef = useRef<ActionType>();
  const [radioValue, setRadioValue] = useState('All');
  const [searchValue, setSearchValue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(
    SPARE_PART_CATEGORY_OPTIONS[0].value,
  );
  const [selectedDateRange, setSelectedDateRange] = useState<[Dayjs, Dayjs] | undefined>();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedItems, setSelectedItems] = useState<SparePartReturnListItem[]>([]);
  const [modalOpen, setModalOpen] = useState<{
    visible: boolean;
    data?: SparePartReturnListItem[];
  }>({ visible: false });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SparePartReturnListItem | null>(null);
  const radioOptions = SPARE_PART_RETURN_RADIO_OPTIONS;

  const requestAction: RequestActions = {
    start: (serviceName) => console.log(`Loading: ${serviceName}`),
    end: (status, reason) => console.log(status, reason),
  };

  const onDetailHandler = (data: SparePartReturnListItem) => {
    setDrawerOpen(true);
    setSelectedItem(data);
  };

  const handleReturnPart = () => {
    if (selectedItems.length > 0) {
      setModalOpen({ visible: true, data: selectedItems });
    }
  };

  const handleModalSubmit = async (payload: {
    remark: string;
    items: SparePartReturnListItem[];
  }) => {
    const requestPayload = {
      remark: payload.remark,
      items: payload.items.map((item) => ({
        productId: item.itemId ?? item.part_number,
        originalRequestId: item.requestId,
        originalRequestLineId: item.requestLineId,
        fulfillmentLineId: item.fulfillmentLineId,
        quantity: item.return_quantity ?? 0,
        uom: item.UoM ,
        quantityUsed: item.used_quantity ?? 0,
        conditionOnReturn: 'USABLE',
        remark: item.reason ?? '',
      })),
    };

    const hideLoading = message.loading('Submitting return request...', 0);

    try {
      await SparePartReturnAPI(requestAction).submit_Return_Request(requestPayload);
      message.success('Return request submitted successfully');
      setModalOpen({ visible: false });
      setSelectedItems([]);
      setSelectedRowKeys([]);
      actionRef.current?.reloadAndRest?.();
    } catch (error) {
      console.error('Failed to submit return request:', error);
      const errorMessage =
        (error as any)?.response?.data?.message ||
        (error as any)?.data?.message ||
        (error as any)?.message ||
        'Failed to submit return request';
      message.error(errorMessage);
    } finally {
      hideLoading();
    }
  };

  const handleModalItemsChange = (items: SparePartReturnListItem[]) => {
    setSelectedItems(items);
    setSelectedRowKeys(items.map((item) => item.id));
  };

  const handleModalCancel = () => {
    setModalOpen((prev) => ({ ...prev, visible: false }));
  };

  return (
    <>
      <Card size="small" style={{ marginBottom: 10 }}>
        <Space wrap size="middle">
          <Input.Search
            placeholder="Search spare parts..."
            allowClear
            onSearch={(value: string) => {
              setSearchValue(value);
              actionRef.current?.reloadAndRest?.();
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
            value={selectedCategory}
            style={{ width: 125 }}
            options={[...SPARE_PART_CATEGORY_OPTIONS]}
            onChange={(value) => {
              setSelectedCategory(value);
              setSelectedRowKeys([]);
              setSelectedItems([]);
              actionRef.current?.reloadAndRest?.();
            }}
          />
          <DatePicker.RangePicker
            onChange={(dates) => {
              setSelectedDateRange(dates ? ([dates[0], dates[1]] as [Dayjs, Dayjs]) : undefined);
              setSelectedRowKeys([]);
              setSelectedItems([]);
              actionRef.current?.reloadAndRest?.();
            }}
          />
        </Space>
      </Card>

      <Card size="small">
        <ProTable<SparePartReturnListItem>
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
            const dateRange = selectedDateRange
              ? ([
                  selectedDateRange[0].startOf('day').toISOString(),
                  selectedDateRange[1].endOf('day').toISOString(),
                ] as [string, string])
              : undefined;

            const result = await SparePartReturnAPI(requestAction).page_my_spare_list({
              pagination: {
                current: params.current,
                pageSize: params.pageSize,
              },
              criteria: {
                searchValue,
                advanceSearch: {
                  searchValue: searchValue || undefined,
                  category:
                    selectedCategory !== SPARE_PART_CATEGORY_OPTIONS[0].value
                      ? selectedCategory
                      : undefined,
                  warehouse: radioValue !== 'All' ? radioValue : undefined,
                  warehouseCode: radioValue !== 'All' ? radioValue : undefined,
                  dateRange,
                },
              },
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
            getCheckboxProps: (record) => {
              return {
                disabled: (record.availableQty ?? 0) <= 0,
              };
            },
          }}
          toolBarRender={() => [
            <Space key="spr-return-bar" size="small">
              <Button
                icon={<ReloadOutlined />}
                onClick={() => actionRef.current?.reloadAndRest?.()}
              >
                Refresh
              </Button>
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
                      onClick={() => onDetailHandler(record)}
                    />
                  </Tooltip>
                </Space>
              ),
            },
            {
              key: 'image',
              title: 'Image',
              dataIndex: 'imageId',
              render: (_, record) => (
                <SparePartImage
                imageId={record.imageId}
                src={record.imageId}
                alt={record.part_number || record.itemId}
                size={48}
              />
             ),
            },
            // {
            //   key: 'fulfillmentLineId',
            //   title: 'Fulfillment Line ID',
            //   dataIndex: 'fulfillmentLineId',
            // },
            {
              key: 'part_number',
              title: 'Product Number',
              dataIndex: 'part_number',
              render: (value, record) => (
                <a
                  onClick={() => console.log('Clicked part number:', value, 'with id:', record.id)}
                >
                  {value}
                </a>
              ),
            },
            {
              key: 'request_id',
              title: 'Request ID',
              dataIndex: 'request_id',
              render: (_, record) => (
                <Typography.Link
                  onClick={(event) => {
                    event.preventDefault();
                  }}
                >
                  {record.request_id}
                </Typography.Link>
              ),
            },
            { key: 'spare_part_name', title: 'Name', dataIndex: 'spare_part_name' },
            {
              key: 'quantity',
              title: 'Quantity',
              align: 'center',
              render: (_, record: SparePartReturnListItem) => {
                const returning = record.pendingReturnQty ?? 0;
                const returned = record.returnedQty ?? 0;
                const available = record.availableQty ?? 0;

                return (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <span style={{ fontWeight: 500 }}>{available}</span>
                    {(returning > 0 || returned > 0) && (
                      <Tooltip title={`Returning: ${returning} | Returned: ${returned}`}>
                        <InfoCircleOutlined style={{ color: '#1890ff', fontSize: 13, cursor: 'pointer' }} />
                      </Tooltip>
                    )}
                  </div>
                );
              },
            },
            { key: 'UoM', title: 'UoM', dataIndex: 'UoM' },
            { key: 'spare_part_type', title: 'Type', dataIndex: 'type' },
            { key: 'category', title: 'Category', dataIndex: 'category' },
            { key: 'Warehouse', title: 'Warehouse', dataIndex: 'receiving_from_warehouse' },
            { key: 'BU', title: 'BU', dataIndex: 'businessUnit' },
            { key: 'Requested_Date', title: 'Requested Date', dataIndex: 'requested_date' },
            {
              key: 'Requested_Pickup_Date',
              title: 'Requested Pickup Date',
              dataIndex: 'requested_pickup_date',
            },
          ]}
        />
      </Card>

      <FormModalSelectItems
        open={modalOpen.visible}
        onCancel={handleModalCancel}
        onSubmit={handleModalSubmit}
        onItemsChange={handleModalItemsChange}
        data={modalOpen.data}
      />
      <DrawerViewItem open={drawerOpen} data={selectedItem} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
