import vital from '@/assets/logo.svg';
import mee from '@/assets/mee.png';
import posm from '@/assets/stock.png';
import type { DescriptionDisplayDataItem } from '@/components/Descriptions';
import DescriptionDisplay from '@/components/Descriptions';
import { formatDate, formatDateTime } from '@/pages/utils';
import type { LookupDataItem } from '@/services/data';
import type {
  MpuStockControlDetail,
  MpuStockControlItemLess
} from '@/services/sale/data';
import type { ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Card, Image, Space, Tabs, Tag } from 'antd';
import { useEffect, useRef } from 'react';

type Props = {
  forceUpdate: number;
  data: {
    id: number;
    isOpen?: boolean;
    details?: MpuStockControlDetail;
    types?: LookupDataItem[];
    loading: boolean | undefined;
    listMpuStockDetailItems?: MpuStockControlItemLess[];
  };
  // actionHandlers?: {
  //   onTransferMoney?: () => void;
  //   onAddItem?: (id: number, name: string) => void;
  // };
};  

const MpuRequestItem: React.FC<Props> = ({ data, forceUpdate }) => {
  const actionRef = useRef<ActionType>();

  useEffect(() => {
    if (forceUpdate) actionRef.current?.reloadAndRest?.();
  }, [forceUpdate]);

  // data.details?.transactions.find((it2) => console.log("TESTING HERE", it2.itemType));

  const generalInfo: (DescriptionDisplayDataItem | undefined)[] = [
    {
      label: 'Owner',
      //   onClick: () => {
      //     history.push(`${CrmPaths.customer}/detail/${soDetail?.associatedTo.customer.id}`);
      //   },
      value: `${data.details?.owner.salespersonCode} - ${data.details?.owner.salespersonName}`,
    },
    { label: 'Description', value: data.details?.description },
    { label: 'Reference No #', value: data.details?.referenceNo},
    {
      label: 'Number Plate',
      value: data.details?.plateNumber,
    },
    { label: 'Status', value: data.details?.status },

    // {
    //   label: 'Cash on hand',
    //   value: numeral(data.details?.cashOnHand).format('$ 0,0.00'),
    // },

    // { label: 'Action', value: state.data?.detail?.isActive },
    {
      label: 'Received By',
      value: data.details?.receivedBy
        ? `${data.details?.receivedBy?.salespersonCode} - ${data.details?.receivedBy?.salespersonName}`
        : 'N/A',
    },
    // {
    //   label: 'Approved By',
    //   value: data.details?.approvedBy
    //     ? `${data.details?.approvedBy?.salespersonCode} - ${data.details?.approvedBy?.salespersonName}`
    //     : 'N/A',
    // },
    // {
    //   label: 'Approved Date',
    //   value: data.details?.approvedDate ? formatDateTime(data.details?.approvedDate) : 'N/A',
    // },
  ];

  return (
    <>
      <Card size="small" title="General" style={{ marginBottom: 10 }}>
        <DescriptionDisplay data={generalInfo} />
      </Card>

      <Card size="small" title="Stock Detail" style={{ marginBottom: 10 }}>
        <Tabs>
          {data?.listMpuStockDetailItems?.map((it) => {
            const objType = data.types?.find((it1) => it1.id === it.typeId);
            const tran = data.details?.transactions.find((it2) => it2.itemType === objType?.id);
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

                      {/* <Badge
                        size="small"
                        offset={[5, -8]}
                        count={
                          data.details?.transactions.find((it1) => it1.itemType === objType.id)
                            ?.quantity
                        }
                      >
                        <span>&nbsp;{objType.name}</span>
                      </Badge> */}
                    </Space>
                  }
                  key={`${objType.code}-product`}
                >
                  <ProTable<MpuStockControlItemLess>
                    headerTitle="Line Items"
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
                    // toolBarRender={() => [
                    //   data.isOpen && (
                    //     <Button
                    //       size="small"
                    //       type="primary"
                    //       disabled={data.loading}
                    //       onClick={() => {
                    //         actionHandlers &&
                    //           actionHandlers.onAddItem &&
                    //           actionHandlers.onAddItem(objType.id, objType.name);
                    //       }}
                    //       icon={<PlusOutlined />}
                    //     />
                    //   ),
                    // ]}
                    dataSource={it.items}
                    columns={
                      it.typeId === 132
                        ? [
                            {
                              title: 'Batch #',
                              dataIndex: 'batchNo',
                            },
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
                              title: 'Begin Quantity',
                              align: 'right',
                              render: (_, r) => {
                                return r.beginningQty + r.quantity;
                              },
                              //dataIndex: 'quantity'
                            },
                            {
                              title: 'Sold Quantity',
                              align: 'right',
                              render: (_, r) => {
                                return r.soldQty;
                              },
                            },
                            {
                              title: 'Current Quantity',
                              align: 'right',
                              render: (_, r) => {
                                return r.beginningQty + r.quantity - r.soldQty;
                              },
                            },

                            { title: 'UOM', dataIndex: 'uom' },
                            {
                              title: 'Expired Date',
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
                                //return (r.beginningQty + r.quantity) - r.soldQty
                                return r.beginningQty + r.quantity;
                              },
                              //dataIndex: 'quantity'
                            },
                            {
                              title: 'Sold Quantity',
                              align: 'right',
                              render: (_, r) => {
                                return r.soldQty;
                              },
                            },
                            { title: 'UOM', dataIndex: 'uom' },
                            // { title: 'Pending Qty', align: 'right', dataIndex: 'pendingQty' },
                            // { title: 'Quantity', align: 'right', dataIndex: 'quantity' },
                          ]
                    }
                  />
                </Tabs.TabPane>
              )
            );
          })}
        </Tabs>
      </Card>
    </>
  );
};

export default MpuRequestItem;
