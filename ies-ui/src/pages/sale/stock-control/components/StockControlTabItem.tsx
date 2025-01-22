import vital from '@/assets/logo.svg';
import mee from '@/assets/mee.png';
import posm from '@/assets/stock.png';
import { formatDate, formatDateTime } from '@/pages/utils';
import type { LookupDataItem } from '@/services/data';
import type { StockControlDetail, StockDetailItemLess } from '@/services/sale/data';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { ProDescriptions } from '@ant-design/pro-components';
import type { ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Card, Flex, Image, Space, Tabs, Tag, Typography } from 'antd';
import { join } from 'lodash';
import { useEffect, useRef } from 'react';

type Props = {
  forceUpdate: number;
  data: {
    id: number;
    isOpen?: boolean;
    details?: StockControlDetail;
    types?: LookupDataItem[];
    // loading: boolean | undefined;
  };
  // actionHandlers?: {
  //   onTransferMoney?: () => void;
  //   onAddItem?: (id: number, name: string) => void;
  // };
};

const StockControlTabItem: React.FC<Props> = ({ data, forceUpdate }) => {
  const actionRef = useRef<ActionType>();
  const { Text } = Typography;

  const stockCategoryItems = data.details?.items ?? [];
  const pendingStockCategroyItems = data.details?.pendingItems ?? [];
  const itemTypeIds = stockCategoryItems
    .concat(...pendingStockCategroyItems)
    .map((e) => e.typeId)
    .filter((value, index, array) => array.indexOf(value) === index);

  // new Set<number>(
  //   stockCategoryItems.concat(pendingStockCategroyItems).map((e) => e.typeId),
  // );
  useEffect(() => {
    if (forceUpdate) actionRef.current?.reloadAndRest?.();
  }, [forceUpdate]);

  return (
    <>
      <Flex vertical gap={24}>
        <Card size="small" title="General">
          {/* <DescriptionDisplay data={generalInfo} /> */}
          <ProDescriptions<StockControlDetail>
            column={3}
            dataSource={data.details}
            loading={data ? false : true}
            contentStyle={{
              fontWeight: 500,
            }}
            columns={[
              {
                title: 'Store Name',
                dataIndex: 'stockName',
              },
              {
                title: 'Requested Date',
                //dataIndex: 'stockName',
                render: (_, r) => formatDateTime(r.approvedDate),
              },
              {
                title: 'Owner',
                dataIndex: 'stockName',
                render: (_, r) =>
                  [r.owner?.salespersonCode, r.owner?.salespersonName].filter((o) => o).join(' - '),
              },
              {
                title: 'Description',
                dataIndex: 'description',
              },
              // {
              //   title: 'Serial',
              //   dataIndex: 'serialNumber',
              // },

              {
                title: 'PlateNumber',
                dataIndex: 'plateNumber',
              },
              {
                title: 'Approved By',
                dataIndex: '',
                render: (_, r) =>
                  [r.approvedBy?.salespersonCode, r.approvedBy?.salespersonName]
                    .filter((o) => o)
                    .join(' - '),
              },
              {
                title: 'Received By',
                dataIndex: '',
                render: (_, r) =>
                  [r.receivedBy?.salespersonCode, r.receivedBy?.salespersonName]
                    .filter((o) => o)
                    .join(' - '),
              },
              {
                title: 'Status',
                dataIndex: 'Status',
                render: (_, r) => (
                  <Tag
                    // bordered={false}
                    color={
                      r.status === 'pending'
                        ? 'processing'
                        : r.status === 'open' || r.status === 'approved'
                        ? 'success'
                        : r.status === 'settled' || r.status === 'count stock'
                        ? 'magenta'
                        : 'error'
                    }
                    icon={
                      r.status === 'pending' ? (
                        <SyncOutlined spin />
                      ) : r.status === 'open' ? (
                        <CheckCircleOutlined />
                      ) : r.status === 'canceled' ? (
                        <CloseCircleOutlined />
                      ) : r.status === 'closed' ? (
                        <CheckCircleOutlined />
                      ) : (
                        <ExclamationCircleOutlined />
                      )
                    }
                  >
                    {r.status}
                  </Tag>
                ),
              },

              // {
              //   title: 'Approved By',
              //   dataIndex: '',
              //   render: (_, r) =>
              //     [r.approvedBy?.salespersonCode, r.approvedBy?.salespersonName]
              //       .filter((o) => o)
              //       .join(' - '),
              // },
              {
                title: 'Approved Date',
                render: (_, r) => formatDateTime(r.approvedDate),
              },

              {
                title: 'Keep Forwarding',
                render: (_, r) => (
                  <Typography.Text type={r.isKeepForwarding ? 'success' : 'warning'}>
                    {r.isKeepForwarding ? 'YES' : 'NO'}
                  </Typography.Text>
                ),
              },
            ]}
          />
        </Card>

        {data.types && data.types.length > 0 && (
          <Card size="small" title="Stock Detail">
            <Tabs
              items={data.types
                .filter((e) => itemTypeIds.indexOf(e.id) > -1)
                .map((category) => {
                  const id = category.id;
                  const it = stockCategoryItems.find((e) => e.typeId === id);
                  const tran = data.details?.transactions.find((it1) => it1.itemType === id);
                  const pendingItem = pendingStockCategroyItems.find((e) => e.typeId === id);
                  const itemTabs = [];
                  if (it)
                    itemTabs.push({
                      key: 'line-items',
                      label: <Text>Line Items</Text>,
                      children: (
                        <ProTable<StockDetailItemLess>
                          size="small"
                          sortDirections={['ascend']}
                          showSorterTooltip={false}
                          key="id"
                          actionRef={actionRef}
                          rowKey={(r) => {
                            return r.batchNo + '-' + r.itemId;
                          }}
                          pagination={false}
                          search={false}
                          options={{
                            setting: false,
                            density: false,
                            fullScreen: false,
                            reload: false,
                          }}
                          dataSource={it.items}
                          columns={[
                            {
                              title: 'Batch #',
                              dataIndex: 'batchNo',
                              hideInTable: category.id !== 132,
                            },
                            {
                              title: 'Description',
                              render: (_, r) => join([r.itemCode, r.itemName], ' - '),
                              key: 'itemId',
                            },

                            { title: 'SKU', dataIndex: 'description', width: 80 },

                            {
                              title: 'Begin',
                              align: 'right',
                              dataIndex: 'beginningQty',
                              width: 100,
                            },
                            {
                              title: 'Request',
                              align: 'right',
                              dataIndex: 'quantity',
                              width: 100,
                            },
                            {
                              title: 'Current',
                              align: 'right',
                              render: (_, r) => {
                                return r.beginningQty + r.quantity;
                              },
                              width: 100,
                            },
                            {
                              title: 'Sold',
                              align: 'right',
                              render: (_, r) => {
                                return <Text type="danger">{`( ${r.soldQty} )`}</Text>;
                              },
                              width: 100,
                            },
                            {
                              title: 'End',
                              align: 'right',
                              render: (_, r) => {
                                return r.beginningQty + r.quantity - r.soldQty;
                              },
                              width: 100,
                            },

                            { title: 'UOM', dataIndex: 'uom', align: 'center' },
                            {
                              title: 'Expired Date',
                              align: 'right',
                              hideInTable: category.id !== 132,
                              render: (_, r) => {
                                return r.expiredDate ? formatDate(r.expiredDate) : '-';
                              },
                            },
                          ]}
                        />
                      ),
                    });
                  if (pendingItem)
                    itemTabs.push({
                      key: 'pending-items',
                      label: <Text>Pending Items</Text>,
                      children: (
                        <ProTable<StockDetailItemLess>
                          size="small"
                          sortDirections={['ascend']}
                          showSorterTooltip={false}
                          key="id"
                          actionRef={actionRef}
                          rowKey={(r) => {
                            return r.batchNo + '-' + r.itemId;
                          }}
                          pagination={false}
                          search={false}
                          options={{
                            setting: false,
                            density: false,
                            fullScreen: false,
                            reload: false,
                          }}
                          dataSource={pendingItem.items}
                          columns={[
                            {
                              title: 'Description',
                              render: (_, r) => join([r.itemCode, r.itemName], ' - '),
                              key: 'itemId',
                            },
                            {
                              title: 'SKU',
                              dataIndex: 'description',
                              width: 80,
                            },
                            {
                              title: 'Request',
                              align: 'right',
                              dataIndex: 'quantity',
                              width: 100,
                            },

                            { title: 'UOM', dataIndex: 'uom', align: 'center' },
                          ]}
                        />
                      ),
                    });
                  return {
                    key: `${category.code}-product`,
                    label: (
                      <Space size={0}>
                        <Image
                          preview={false}
                          src={id === 131 ? vital : id === 132 ? mee : posm}
                          height={30}
                        />
                        <span>&nbsp;{category.name}&nbsp;&nbsp;</span>
                        {tran && (
                          <Tag color={'processing'}>
                            {tran.quantity + (tran.beginningQty || 0) - (tran.soldQty || 0)}
                          </Tag>
                        )}
                      </Space>
                    ),
                    children: <Tabs items={itemTabs} />,
                  };
                })}
            />
          </Card>
        )}
      </Flex>
    </>
  );
};

export default StockControlTabItem;
