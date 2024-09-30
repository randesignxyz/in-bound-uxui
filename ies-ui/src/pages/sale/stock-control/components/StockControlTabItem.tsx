import vital from '@/assets/logo.svg';
import mee from '@/assets/mee.png';
import posm from '@/assets/stock.png';
import type { DescriptionDisplayDataItem } from '@/components/Descriptions';
import DescriptionDisplay from '@/components/Descriptions';
import { formatDate, formatDateTime } from '@/pages/utils';
import type { LookupDataItem } from '@/services/data';
import type {
  StockAdjustmentItem,
  StockControlDetail,
  StockDetailItemLess,
  StockDetailLess,
} from '@/services/sale/data';
import { SyncOutlined, CheckCircleOutlined, ExclamationCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
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
    listStockDetailItem?: StockDetailLess[];
  };
  // actionHandlers?: {
  //   onTransferMoney?: () => void;
  //   onAddItem?: (id: number, name: string) => void;
  // };
};

const StockControlTabItem: React.FC<Props> = ({ data, forceUpdate }) => {
  const actionRef = useRef<ActionType>();
  const { Text } = Typography;

  useEffect(() => {
    if (forceUpdate) actionRef.current?.reloadAndRest?.();
  }, [forceUpdate]);

  return (
    <>
      <Flex vertical gap={24} >
        <Card size="small" title="General" >
          {/* <DescriptionDisplay data={generalInfo} /> */}
          <ProDescriptions<StockControlDetail>
            column={3}
            dataSource={data.details}
            loading={data ? false : true}
            contentStyle={{
              fontWeight: 500
            }}
            columns={[
              {
                title: "Store Name",
                dataIndex: "stockName"
              },
              {
                title: "Owner",
                dataIndex: "stockName",
                render: (_, r) => [r.owner?.salespersonCode, r.owner?.salespersonName].filter(o => o).join(" - ")
              },
              {
                title: "Description",
                dataIndex: "description",
              },
              {
                title: "Serial",
                dataIndex: "serialNumber",
              },

              {
                title: "PlateNumber",
                dataIndex: "plateNumber",
              },
              {
                title: "Status",
                dataIndex: "Status",
                render: (_, r) => <Tag
                  color={
                    r.status == "pending" ? "processing"
                      : r.status == "open" || r.status == "approved" ? "success"
                        : r.status == "settled" || r.status == "count stock" ? "magenta"
                          : "error"
                  }
                  icon={
                    r.status === "pending" ? <SyncOutlined spin />
                      : r.status === "open" ? <CheckCircleOutlined />
                        : r.status === "canceled" ? <CloseCircleOutlined />
                          : r.status == "closed" ? <CheckCircleOutlined />
                            : <ExclamationCircleOutlined />
                  }
                >{r.status}</Tag>
              },
              {
                title: "Received By",
                dataIndex: "",
                render: (_, r) => [r.receivedBy?.salespersonCode, r.receivedBy?.salespersonName].filter(o => o).join(" - ")
              },
              {
                title: "Approved By",
                dataIndex: "",
                render: (_, r) => [r.approvedBy?.salespersonCode, r.approvedBy?.salespersonName].filter(o => o).join(" - ")
              },
              {
                title: "Approved Date",
                render: (_, r) => formatDateTime(r.approvedDate)
              },

              {
                title: "Keep Forwarding",
                render: (_, r) => <Typography.Text type={r.isKeepForwarding ? "success" : "warning"}>{r.isKeepForwarding ? "YES" : "NO"}</Typography.Text>
              }
            ]}
          />
        </Card>

        {data?.listStockDetailItem && data?.listStockDetailItem.length > 0 && (
          <Card size="small" title="Stock Detail" >
            <Tabs>
              {data?.listStockDetailItem?.map((it) => {
                const objType = data.types?.find((it1) => it1.id === it.typeId);
                const tran = data.details?.transactions.find((it1) => it1.itemType === objType?.id);
                return (
                  objType && (
                    <Tabs.TabPane
                      tab={
                        <Space size={0}>
                          <Image
                            preview={false}
                            src={objType.id === 131 ? vital : objType.id === 132 ? mee : posm}
                            height={30}
                          />
                          <span>&nbsp;{objType.name}&nbsp;&nbsp;</span>
                          {tran && (
                            <Tag color={'processing'}>
                              {tran.quantity + (tran.beginningQty || 0) - (tran.soldQty || 0)}
                            </Tag>
                          )}
                        </Space>
                      }
                      key={`${objType.code}-product`}
                    >
                      <Tabs>
                        <Tabs.TabPane tab={<Text>Line Items</Text>} key={`line-items`}>
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
                            columns={
                              it.typeId === 132
                                ? [
                                  {
                                    title: 'Batch #',
                                    dataIndex: 'batchNo',
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
                                    render: (_, r) => {
                                      return r.expiredDate ? formatDate(r.expiredDate) : '-';
                                    },
                                  },
                                ]
                                : [
                                  {
                                    title: 'Code',
                                    dataIndex: 'itemCode',
                                  },
                                  {
                                    title: 'Description',
                                    dataIndex: 'itemName',
                                    key: 'itemId',
                                  },

                                  { title: 'SKU', dataIndex: 'description' },
                                  {
                                    title: 'Quantity',
                                    align: 'right',
                                    render: (_, r) => {
                                      return r.beginningQty + r.quantity;
                                    },
                                  },
                                  {
                                    title: 'Sold Quantity',
                                    align: 'right',
                                    render: (_, r) => {
                                      return r.soldQty;
                                    },
                                  },
                                  { title: 'UOM', dataIndex: 'uom' },
                                ]
                            }
                          />
                        </Tabs.TabPane>
                        (
                        {data.details?.pendingItems !== undefined &&
                          data.details?.pendingItems?.length > 0 && (
                            <Tabs.TabPane tab={<Text>Pending Items</Text>} key={`pending-items`}>
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
                               
                                dataSource={data.details.pendingItems.flatMap((e) => e.items)}
                                columns={[
                                  {
                                    title: 'Description',
                                    render: (_, r) => join([r.itemCode, r.itemName], ' - '),
                                    key: 'itemId',
                                  },
                                  {
                                    title: 'SKU',
                                    dataIndex: 'description',
                                    width: 80
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
                            </Tabs.TabPane>
                          )}
                        )
                      </Tabs>
                    </Tabs.TabPane>
                  )
                );
              })}
            </Tabs>
          </Card>
        )}
          {( data.details?.pendingItems?.length ||0 >0) && (data.details?.items?.length <=0) && (
            <Card title={"Pending Request"} size='small'>
              <ProTable<StockDetailItemLess>
                size="small"
                sortDirections={['ascend']}
                showSorterTooltip={false}
                key="id"
                actionRef={actionRef}
                rowKey={(r) => {
                  return [r.batchNo, r.itemId].filter(p => p).join(" - ");
                }}
                pagination={false}
                search={false}
                options={{
                  setting: false,
                  density: false,
                  fullScreen: false,
                  reload: false,
                }}
                dataSource={data?.details?.pendingItems.flatMap((e) => e.items)}
                columns={[
                  {
                    title: 'Description',
                    render: (_, r) => join([r.itemCode, r.itemName].filter(p => p), ' - '),
                    key: 'itemId',
                  },
                  {
                    title: 'SKU',
                    dataIndex: 'description',
                    width: 80
                  },
                  {
                    title: 'Request',
                    align: 'right',
                    dataIndex: 'quantity',
                    width: 100,
                    render:(_,r)=><Typography.Text type='success'>{r.quantity}</Typography.Text>
                  },
                  { title: 'UOM', dataIndex: 'uom', align: 'center' },
                ]}
              />
            </Card>
          )
        }
        {data.details?.settlement?.stockAdjusts && (
          <Card title={"Free of Charge"} size='small' styles={{body:{padding:0}}}>
            <ProTable<StockAdjustmentItem>
              size='small'
              dataSource={data.details?.settlement?.stockAdjusts.items || []}
              search={false}
              options={false}
              columns={[
                {
                  title: "Batch No",
                  dataIndex: "batchNo"
                },
                {
                  title: "Items Name",
                  dataIndex: "itemName"
                },
                {
                  title: "Quantity",
                  dataIndex: "quantity"
                },
                {
                  title: "UOM",
                  dataIndex: "uom"
                },
                {
                  title: "Remark",
                  dataIndex: "remark"
                }
              ]}
            />
          </Card>
        )}
      </Flex>
    </>
  );
};

export default StockControlTabItem;
