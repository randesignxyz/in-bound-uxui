// import { TableViewProps } from '@/components/DataCrud/TableView';
// import { formatDate } from '@/pages/utils';
// import { Paging } from '@/services/API';
// import { SettlementLess } from '@/services/sale/data';
// import ProTable, { ActionType } from '@ant-design/pro-table';
// import { useSetState } from 'ahooks';
// import { Input, Space, Typography } from 'antd';
// import { SortOrder } from 'antd/lib/table/interface';
// import numeral from 'numeral';
// import { useEffect, useRef } from 'react';
// import { useAccess, useModel } from 'umi';
// import { Model } from '../model';

// const SettlementListView: React.FC<TableViewProps<SettlementLess>> = ({ actionHandlers }) => {
//   const cacheList = useModel('dataList');
//   const actionRef = useRef<ActionType>();
//   const access = useAccess();
//   const [force, setForce] = useSetState<{ update: number }>({ update: 0 });
//   const { state, actions, modals } = Model();
//   const { loading } = state;

//   const [addNewModal, setAddNewModal] = useSetState<{
//     visible?: boolean;
//     record?: SettlementLess;
//   }>({});

//   const { Text } = Typography;

//   useEffect(() => {
//     if (force) {
//       actionRef.current?.reloadAndRest?.();
//     }
//   }, [force]);

//   const onRequestHandler = (
//     criteria?: { searchValue?: string },
//     pagination?: {
//       pageSize?: number;
//       current?: number;
//     },
//     sort?: Record<string, SortOrder>,
//   ) => {
//     return actions.loadListItem?.(criteria, pagination, sort).then((it) => {
//       return cacheList.cacheDataList({
//         type: 'settlement',
//         data: it,
//       });
//     }) as Promise<Paging<SettlementLess>>;
//   };

//   // const expandedRowRender = (parent: StockControlLess) => {
//   //   return parent.items && parent.items.length > 0 ? (
//   //     access.canCreateEditStockControl ? (
//   //       <ProTable
//   //         size={'small'}
//   //         style={{ backgroundColor: '#EEE' }}
//   //         key={'key'}
//   //         rowKey={(r) => {
//   //           return r.batchNo + '-' + r.itemCode;
//   //         }}
//   //         columns={[
//   //           { title: '#', dataIndex: 'index', key: 'key' },
//   //           {
//   //             title: 'Batch No',
//   //             dataIndex: 'batchNo',
//   //           },
//   //           {
//   //             title: 'Description',
//   //             render: (_, r) => {
//   //               return `${r.itemCode} - ${r.itemName} (${r.description})`;
//   //             },
//   //           },
//   //           { title: 'UOM', dataIndex: 'uom' },
//   //           {
//   //             title: 'Type',
//   //             render: (_, r) => {
//   //               return r.itemType === 131
//   //                 ? 'Vital'
//   //                 : r.itemType === 132
//   //                 ? 'Mee Chiet'
//   //                 : 'Merchandise';
//   //             },
//   //           },
//   //           { title: 'Beginning Qty', align: 'right', dataIndex: 'beginningQty' },
//   //           { title: 'Request Qty', align: 'right', dataIndex: 'quantity' },
//   //         ]}
//   //         summary={(data) => {
//   //           const beginningQty = data.reduce((acc, it) => (acc += it.beginningQty), 0);
//   //           const requestQty = data.reduce((acc, it) => (acc += it.quantity), 0);

//   //           return (
//   //             <>
//   //               <Table.Summary.Row>
//   //                 <Table.Summary.Cell index={0} align="right" colSpan={5}>
//   //                   <Text type="success">Total</Text>
//   //                 </Table.Summary.Cell>
//   //                 <Table.Summary.Cell index={1} align="right">
//   //                   <Text type="success">{beginningQty}</Text>
//   //                 </Table.Summary.Cell>
//   //                 <Table.Summary.Cell index={2} align="right">
//   //                   <Text type="success">{requestQty}</Text>
//   //                 </Table.Summary.Cell>
//   //               </Table.Summary.Row>
//   //               <Table.Summary.Row>
//   //                 <Table.Summary.Cell index={0} align="right" colSpan={7}>
//   //                   <Button
//   //                     type="primary"
//   //                     onClick={async () => {
//   //                       Modal.confirm({
//   //                         title: 'Accept Suggestion.',
//   //                         content: 'Are you sure?',
//   //                         onOk: async () => {
//   //                           // await actions.acceptRequest(parent);
//   //                           setForce({ update: force.update + 1 });
//   //                         },
//   //                       });
//   //                     }}
//   //                   >
//   //                     {/* <CheckOutlined /> */}
//   //                     Accept
//   //                   </Button>
//   //                 </Table.Summary.Cell>
//   //               </Table.Summary.Row>
//   //             </>
//   //           );
//   //         }}
//   //         headerTitle={false}
//   //         search={false}
//   //         options={false}
//   //         dataSource={parent.items}
//   //         pagination={false}
//   //       />
//   //     ) : access.canOpenStore ? (
//   //       <ProTable
//   //         size={'small'}
//   //         style={{ backgroundColor: '#EEE' }}
//   //         key={'key'}
//   //         rowKey={(r) => {
//   //           return r.batchNo + '-' + r.itemCode;
//   //         }}
//   //         columns={[
//   //           { title: '#', dataIndex: 'index', key: 'key' },
//   //           {
//   //             title: 'Batch No',
//   //             render: (_, r) => {
//   //               return r.batchNo ? r.batchNo : <Tag color={'red'}>Required</Tag>;
//   //             },
//   //           },
//   //           {
//   //             title: 'Expired Date',
//   //             render: (_, r) => {
//   //               return r.expiredDate || r.batchNo ? (
//   //                 formatDate(r.expiredDate)
//   //               ) : (
//   //                 <Tag color={'red'}>Required</Tag>
//   //               );
//   //             },
//   //           },
//   //           {
//   //             title: 'Description',
//   //             render: (_, r) => {
//   //               return `${r.itemCode} - ${r.itemName} (${r.description})`;
//   //             },
//   //           },
//   //           { title: 'UOM', dataIndex: 'uom' },
//   //           {
//   //             title: 'Type',
//   //             render: (_, r) => {
//   //               return r.itemType === 131
//   //                 ? 'Vital'
//   //                 : r.itemType === 132
//   //                 ? 'Mee Chiet'
//   //                 : 'Merchandise';
//   //             },
//   //           },
//   //           { title: 'Beginning Qty', align: 'right', dataIndex: 'beginningQty' },
//   //           { title: 'Request Qty', align: 'right', dataIndex: 'quantity' },
//   //           {
//   //             title: 'Total Qty',
//   //             align: 'right',
//   //             render: (_, r) => {
//   //               return r.beginningQty + r.quantity;
//   //             },
//   //           },
//   //         ]}
//   //         summary={(data) => {
//   //           const beginningQty = data.reduce((acc, it) => (acc += it.beginningQty), 0);
//   //           const requestQty = data.reduce((acc, it) => (acc += it.quantity), 0);
//   //           // const disabled = data.some((it) => !it.batchNo || !it.expiredDate);
//   //           return (
//   //             <>
//   //               <Table.Summary.Row>
//   //                 <Table.Summary.Cell index={0} align="right" colSpan={6}>
//   //                   <Text type="success">Total</Text>
//   //                 </Table.Summary.Cell>
//   //                 <Table.Summary.Cell index={1} align="right">
//   //                   <Text type="success">{beginningQty}</Text>
//   //                 </Table.Summary.Cell>
//   //                 <Table.Summary.Cell index={2} align="right">
//   //                   <Text type="success">{requestQty}</Text>
//   //                 </Table.Summary.Cell>
//   //                 <Table.Summary.Cell index={3} align="right">
//   //                   <Text type="success">{requestQty + beginningQty}</Text>
//   //                 </Table.Summary.Cell>
//   //               </Table.Summary.Row>
//   //               <Table.Summary.Row>
//   //                 <Table.Summary.Cell index={0} align="right" colSpan={9}>
//   //                   <Button
//   //                     type="primary"
//   //                     onClick={() => setAddNewModal({ visible: true, record: parent })}
//   //                   >
//   //                     Edit
//   //                   </Button>
//   //                 </Table.Summary.Cell>
//   //               </Table.Summary.Row>
//   //             </>
//   //           );
//   //         }}
//   //         headerTitle={
//   //           false
//   //           // <Button
//   //           //   type="primary"
//   //           //   style={{ alignItems: 'flex-end' }}
//   //           //   onClick={() => message.info('testing ')}
//   //           // >
//   //           //   Merge
//   //           // </Button>
//   //         }
//   //         search={false}
//   //         options={false}
//   //         dataSource={parent.items}
//   //         pagination={false}
//   //       />
//   //     ) : undefined
//   //   ) : (
//   //     <div key={parent.id} style={{ textAlign: 'center', fontWeight: 'bold', color: 'gray' }}>
//   //       No Data
//   //     </div>
//   //   );
//   // };

//   return (
//     <>
//       <ProTable<SettlementLess, { searchValue?: string }>
//         actionRef={actionRef}
//         key={'settlement'}
//         rowKey={'id'}
//         // toolBarRender={() => []}
//         toolBarRender={() =>
//           access.canAccessSuggestion
//             ? [
//                 // <Button
//                 //   size="small"
//                 //   type="primary"
//                 //   disabled={state.loading}
//                 //   onClick={actionHandlers?.onAdd}
//                 //   icon={<PlusOutlined />}
//                 // />,
//               ]
//             : []
//         }
//         options={{
//           density: false,
//           setting: false,
//           reload: true,
//           search: true ?? (
//             <Space size={[1, 'small']}>
//               <Input.Search allowClear />
//             </Space>
//           ),
//         }}
//         search={false}
//         request={async (
//           params: {
//             pageSize?: number;
//             current?: number;
//             keyword?: string;
//           },
//           sort: Record<string, SortOrder>,
//         ) => {
//           const searchParams = { searchValue: params.keyword };
//           const data = await onRequestHandler(searchParams, params, sort);
//           return {
//             success: !!data,
//             total: data?.total,
//             data: data?.items.map((it: SettlementLess) => it).filter((it: any) => !!it),
//           };
//         }}
//         //expandable={{ expandedRowRender }}
//         columns={[
//           {
//             title: 'Settlement Date',
//             render: (_, r) => {
//               return (
//                 <a onClick={() => actionHandlers?.onDetail && actionHandlers?.onDetail(r)}>
//                   {formatDate(r.settlementDate)}
//                 </a>
//               );
//             },
//           },
//           {
//             title: 'Salesperson',
//             dataIndex: 'salespersonCode',
//           },
//           {
//             title: 'Cashier',
//             dataIndex: 'cashierName',
//           },
//           {
//             title: 'Bank Amount',
//             align: 'right',
//             render: (_, r) => {
//               return numeral(r.bankAmount).format('$ 0,0.00');
//             },
//           },
//           {
//             title: 'Amount USD',
//             align: 'right',
//             render: (_, r) => {
//               return numeral(r.amount).format('$ 0,0.00');
//             },
//           },
//           {
//             title: 'Amount KHR',
//             align: 'right',
//             render: (_, r) => {
//               return numeral(r.amountKH).format('0,0');
//             },
//           },

//           {
//             title: 'Exchange Rate',
//             align: 'right',
//             render: (_, r) => {
//               return numeral(r.exchangeRate).format('0,0');
//             },
//           },
//           {
//             title: 'Settle Amount',
//             align: 'right',
//             render: (_, r) => {
//               const settleAmount = r.amountKH / r.exchangeRate + r.amount + (r.bankAmount || 0.0);
//               return numeral(settleAmount).format('$ 0,0.00');
//             },
//           },
//           {
//             title: 'Sold Amount',
//             align: 'right',
//             render: (_, r) => {
//               return numeral(r.soldAmount).format('$ 0,0.00');
//             },
//           },

//           // access.canOpenStore
//           //   ? {
//           //       render: (_, r) => {
//           //         return (
//           //           <Tooltip title="Edit" key="edit">
//           //             <EditOutlined
//           //               style={{ color: '#448DF7' }}
//           //               onClick={() => setAddNewModal({ visible: true, record: r })}
//           //             />
//           //           </Tooltip>
//           //         );
//           //       },
//           //     }
//           //   : {},
//         ]}
//       />
//     </>
//   );
// };

// export default SettlementListView;
