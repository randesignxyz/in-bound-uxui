import { RequestActions } from '@/services/apiGateway';
import { EyeOutlined, InfoCircleOutlined, MoreOutlined, ReloadOutlined } from '@ant-design/icons';
import { ActionType, ProTable } from '@ant-design/pro-components';
import type { Dayjs } from 'dayjs';
import {
  Button,
  Card,
  DatePicker,
  Dropdown,
  Input,
  message,
  Popconfirm,
  Select,
  Space,
  Switch,
  Tooltip,
  Typography,
} from 'antd';
import { useRef, useState } from 'react';
import DrawerViewItem from './DrawerViewItem';
import FormModalSelectItems from './FormModalSelectItems';
import type { SparePartReturnListItem } from './data';
import {
  SPARE_PART_CATEGORY_OPTIONS,
  SPARE_PART_PICKED_ITEM_STATE_OPTIONS,
  SPARE_PART_RETURN_RADIO_OPTIONS,
} from './data';
import { SparePartReturnAPI } from './service';
import SparePartImage from '../spare-part-request/SparePartImage';

export default function MySparePartList() {
  const actionRef = useRef<ActionType>();
  const [radioValue, setRadioValue] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(
    SPARE_PART_CATEGORY_OPTIONS[0].value,
  );
  const [pickedItemState, setPickedItemState] = useState<string>(
    SPARE_PART_PICKED_ITEM_STATE_OPTIONS[0].value,
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
  const [updatingFulfillmentLineId, setUpdatingFulfillmentLineId] = useState<string | null>(null);
  const radioOptions = SPARE_PART_RETURN_RADIO_OPTIONS;
  const selectedWarehouseLabel =
    radioValue.length === 0
      ? 'Select warehouses...'
      : radioOptions
          .filter((opt) => radioValue.includes(opt.value))
          .map((opt) => opt.label)
          .join(', ');

  const handleWarehousesChange = (values: string[]) => {
    setRadioValue(values);
    setSelectedRowKeys([]);
    setSelectedItems([]);
    actionRef.current?.reloadAndRest?.();
  };

  const requestAction: RequestActions = {
    start: (serviceName) => console.log(`Loading: ${serviceName}`),
    end: (status, reason) => console.log(status, reason),
  };
  const onDetailHandler = (data: SparePartReturnListItem) => {
    setSelectedItem(data);
    setDrawerOpen(true);
  };

  const parseSingleFulfillmentLineId = (value: unknown): number | null => {
    const rawValue = String(value ?? '').trim();
    if (!rawValue || rawValue.includes(',')) {
      return null;
    }
    const lineId = Number(rawValue);
    return Number.isInteger(lineId) && lineId > 0 ? lineId : null;
  };

  const handleTogglePickedItemState = async (record: SparePartReturnListItem) => {
    const fulfillmentLineId = parseSingleFulfillmentLineId(record.fulfillmentLineId);
    if (!fulfillmentLineId) {
      message.error('Fulfillment line id is missing');
      return;
    }

    setUpdatingFulfillmentLineId(String(record.fulfillmentLineId));
    try {
      if (record.isClosed) {
        await SparePartReturnAPI(requestAction).open_picked_item([fulfillmentLineId]);
        message.success('Picked item opened successfully');
      } else {
        await SparePartReturnAPI(requestAction).close_picked_item([fulfillmentLineId]);
        message.success('Picked item closed successfully');
      }

      setSelectedRowKeys((prev) => prev.filter((key) => key !== record.id));
      setSelectedItems((prev) => prev.filter((item) => item.id !== record.id));
      actionRef.current?.reload();
    } catch (error) {
      console.error('Failed to update picked item state', error);
      message.error('Failed to update picked item state');
    } finally {
      setUpdatingFulfillmentLineId(null);
    }
  };

  const handleReturnPart = () => {
    if (selectedItems.length > 0) {
      setModalOpen({ visible: true, data: selectedItems });
    }
  };

  const notifyReturnUpdated = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('spare-part-return-updated'));
    }
  };

  const handleModalSubmit = async (payload: {
    remark: string;
    items: SparePartReturnListItem[];
  }) => {
    const toSafeInt = (value: unknown) => {
      const num = Number(value);
      if (!Number.isFinite(num)) return 0;
      return Math.max(0, Math.trunc(num));
    };

    const normalizedItems = payload.items.map((item) => {
      const quantity = toSafeInt(item.return_quantity);
      const quantityUsed = toSafeInt(item.used_quantity);
      const availableQty = toSafeInt(item.availableQty);
      return {
        source: item,
        quantity,
        quantityUsed,
        availableQty,
      };
    });

    const seenFulfillmentLineIds = new Set<string>();
    for (const item of normalizedItems) {
      const fulfillmentLineIdStr = String(item.source.fulfillmentLineId ?? '').trim();
      const fulfillmentLineId = parseSingleFulfillmentLineId(fulfillmentLineIdStr);
      const totalHandled = item.quantity + item.quantityUsed;

      if (!fulfillmentLineId) {
        message.error('Invalid fulfillment line id in selected items. Please refresh and select the picked line again.');
        return;
      }

      if (seenFulfillmentLineIds.has(fulfillmentLineIdStr)) {
        message.error(`Duplicate fulfillment line selected: ${fulfillmentLineIdStr}`);
        return;
      }
      seenFulfillmentLineIds.add(fulfillmentLineIdStr);

      if (totalHandled <= 0) {
        message.error(`Please enter quantity for ${item.source.part_number || item.source.itemId || 'selected item'}`);
        return;
      }

      if (totalHandled > item.availableQty) {
        message.error(
          `Quantity for ${item.source.part_number || item.source.itemId || 'selected item'} exceeds available (${item.availableQty})`,
        );
        return;
      }
    }

    const requestPayload = {
      remark: payload.remark,
      items: normalizedItems.map((item) => {
        const fulfillmentLineId = parseSingleFulfillmentLineId(item.source.fulfillmentLineId);
        if (!fulfillmentLineId) {
          throw new Error('Invalid fulfillment line id in selected items');
        }
        return {
          productId: item.source.itemId ?? item.source.part_number,
          originalRequestId: item.source.requestId,
          originalRequestLineId: item.source.requestLineId,
          fulfillmentLineId: fulfillmentLineId,
          quantity: item.quantity,
          uom: item.source.UoM,
          quantityUsed: item.quantityUsed,
          conditionOnReturn: item.quantityUsed > 0 ? 'DAMAGED' : 'USABLE',
          remark: item.source.reason ?? '',
        };
      }),
    };

    const hideLoading = message.loading('Submitting return request...', 0);

    try {
      await SparePartReturnAPI(requestAction).submit_Return_Request(requestPayload);
      message.success('Return request submitted successfully');
      setModalOpen({ visible: false });
      setSelectedItems([]);
      setSelectedRowKeys([]);
      actionRef.current?.reloadAndRest?.();
      notifyReturnUpdated();
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

  const selectedWarehouseFilterValue =
    radioValue.length > 0 && !radioValue.includes('All') ? radioValue.join(',') : undefined;

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
          {/* <div className="radio-group-desktop">
          <Select
            mode="multiple"
            allowClear
            style={{ minWidth: 250 }}
            placeholder="Select warehouses..."
            value={radioValue}
            onChange={(values: string[]) => handleWarehousesChange(values)}
            options={radioOptions.map((opt) => ({
              label: opt.label,
              value: opt.value,
            }))}
          />
        </div> */}

          {/* Mobile: Dropdown */}
          {/* <div className="radio-group-mobile">
            <Dropdown
              menu={{
                items: radioOptions.map((opt) => ({
                  key: opt.value,
                  label: opt.label,
                  onClick: () => {
                    const nextValues = radioValue.includes(opt.value)
                      ? radioValue.filter((value) => value !== opt.value)
                      : [...radioValue, opt.value];
                    handleWarehousesChange(nextValues);
                  },
                })),
                selectable: true,
                multiple: true,
                selectedKeys: radioValue,
              }}
              trigger={['click']}
            >
              <Button>
                {selectedWarehouseLabel} <MoreOutlined />
              </Button>
            </Dropdown>
          </div> */}

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
          <Select
            value={pickedItemState}
            style={{ width: 120 }}
            options={[...SPARE_PART_PICKED_ITEM_STATE_OPTIONS]}
            onChange={(value) => {
              setPickedItemState(value);
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
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} lines`,
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
                  warehouse: selectedWarehouseFilterValue,
                  warehouseCode: selectedWarehouseFilterValue,
                  pickedItemState,
                  dateRange,
                },
              },
            });
            return {
              data: result.items,
              success: true,
              total: result.total,
            };
          }}
          rowSelection={{
            selectedRowKeys,
            onChange: (keys, rows) => {
              setSelectedRowKeys(keys);
              setSelectedItems(rows);
            },
            getCheckboxProps: (record) => ({
              disabled: !!record.isClosed || (record.availableQty ?? 0) <= 0,
            }),
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
            {
              key: 'part_number',
              title: 'Product Number',
              dataIndex: 'part_number',
              render: (value, record) => (
                <a onClick={() => console.log('Clicked part number:', value, 'with id:', record.id)}>
                  {value}
                </a>
              ),
            },
            {
              key: 'request_id',
              title: 'Request ID',
              dataIndex: 'request_id',
              render: (_, record) => (
                <Typography.Link onClick={(e) => e.preventDefault()}>
                  {record.request_id}
                </Typography.Link>
              ),
            },
            {
              key: 'item_condition',
              title: 'Condition',
              dataIndex: 'item_condition',
              render: (_, record) => record.item_condition || record.itemCondition || '-',
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
              { key: 'category', title: 'Category', dataIndex: 'category' },
            { key: 'Warehouse', title: 'Warehouse', dataIndex: 'receiving_from_warehouse' },
            { key: 'BU', title: 'BU', dataIndex: 'businessUnit' },
            { key: 'Requested_Date', title: 'Requested Date', dataIndex: 'requested_date' },
            {
              key: 'Requested_Pickup_Date',
              title: 'Requested Pickup Date',
              dataIndex: 'requested_pickup_date',
            },
            {
              key: 'close',
              title: 'State',
              width: 90,
              align: 'center' as const,
              render: (_, record) => (
                <Popconfirm
                  title={record.isClosed ? 'Open this picked item?' : 'Close this picked item?'}
                  okText="Yes"
                  cancelText="No"
                  onConfirm={() => handleTogglePickedItemState(record)}
                >
                    <Tooltip title={record.isClosed ? 'Closed' : 'Open'}>
                      <Switch
                        checked={!record.isClosed}
                        checkedChildren="Open"
                        unCheckedChildren="Closed"
                        loading={updatingFulfillmentLineId === String(record.fulfillmentLineId)}
                        disabled={updatingFulfillmentLineId === String(record.fulfillmentLineId)}
                      />
                    </Tooltip>
                  </Popconfirm>
                ),
            }
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
      <DrawerViewItem
        open={drawerOpen}
        data={selectedItem}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedItem(null);
        }}
      />
    </>
  );
}
