import { TableViewProps } from '@/components/DataCrud/TableView';
import { formatDate } from '@/pages/utils';
import { Paging } from '@/services/API';
import { StockControlLess } from '@/services/sale/data';
import { EditOutlined } from '@ant-design/icons';
import ProTable, { ActionType } from '@ant-design/pro-table';
import { useSetState } from 'ahooks';
import { Button, Input, Modal, Space, Table, Tag, Tooltip, Typography } from 'antd';
import { SortOrder } from 'antd/lib/table/interface';
import { useEffect, useRef } from 'react';
import { useAccess, useModel } from 'umi';
import { Model } from '../model';

const SuggestionListView111: React.FC<TableViewProps<StockControlLess>> = ({ actionHandlers }) => {
  const cacheList = useModel('dataList');
  const actionRef = useRef<ActionType>();
  const access = useAccess();
  const [force, setForce] = useSetState<{ update: number }>({ update: 0 });
  const { state, actions, modals } = Model();
  const { loading } = state;

  const { Text } = Typography;

  useEffect(() => {
    if (force) {
      actionRef.current?.reloadAndRest?.();
    }
  }, [force]);

  const onRequestHandler = (
    criteria?: { searchValue?: string },
    pagination?: {
      pageSize?: number;
      current?: number;
    },
    sort?: Record<string, SortOrder>,
  ) => {
    const status = access.canOpenStore
      ? 'approved'
      : access.canCreateEditStockControl
      ? 'pending'
      : '';
    return actions.loadListItem?.(status, criteria, pagination, sort).then((it) => {
      actionRef.current?.reload();
      return cacheList.cacheDataList({
        type: 'stock',
        //criteria: criteria?.advanceSearch || advanceSearchParams,
        data: it,
      });
    }) as Promise<Paging<StockControlLess>>;
  };

  const expandedRowRender = (parent: StockControlLess) => {
    return parent.items && parent.items.length > 0 ? (
      access.canCreateEditStockControl ? (
        <ProTable
          size={'small'}
          style={{ backgroundColor: '#EEE' }}
          key={'key'}
          rowKey={(r) => {
            return r.batchNo + '-' + r.itemCode;
          }}
          columns={[
            { title: '#', dataIndex: 'index', key: 'key' },
            {
              title: 'Batch No',
              dataIndex: 'batchNo',
            },
            {
              title: 'Description',
              render: (_, r) => {
                return `${r.itemCode} - ${r.itemName} (${r.description})`;
              },
            },
            { title: 'UOM', dataIndex: 'uom' },
            {
              title: 'Type',
              render: (_, r) => {
                return r.itemType === 131
                  ? 'Vital'
                  : r.itemType === 132
                  ? 'Mee Chiet'
                  : 'Merchandise';
              },
            },
            { title: 'Beginning Qty', align: 'right', dataIndex: 'beginningQty' },
            { title: 'Request Qty', align: 'right', dataIndex: 'quantity' },
            // {
            //   title: 'Total Qty',
            //   align: 'right',
            //   render: (_, r) => {
            //     return r.beginningQty + r.quantity;
            //   },
            // },
          ]}
          summary={(data) => {
            const beginningQty = data.reduce((acc, it) => (acc += it.beginningQty), 0);
            const requestQty = data.reduce((acc, it) => (acc += it.quantity), 0);

            return (
              <>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} align="right" colSpan={5}>
                    <Text type="success">Total</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} align="right">
                    <Text type="success">{beginningQty}</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2} align="right">
                    <Text type="success">{requestQty}</Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} align="right" colSpan={7}>
                    <Button
                      type="primary"
                      onClick={async () => {
                        Modal.confirm({
                          title: 'Accept Suggestion.',
                          content: 'Are you sure?',
                          onOk: async () => {
                            await actions.acceptRequest(parent);
                            setForce({ update: force.update + 1 });
                          },
                        });
                      }}
                    >
                      {/* <CheckOutlined /> */}
                      Accept
                    </Button>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </>
            );
          }}
          headerTitle={false}
          search={false}
          options={false}
          dataSource={parent.items}
          pagination={false}
        />
      ) : access.canOpenStore ? (
        <ProTable
          size={'small'}
          style={{ backgroundColor: '#EEE' }}
          key={'key'}
          rowKey={(r) => {
            return r.batchNo + '-' + r.itemCode;
          }}
          columns={[
            { title: '#', dataIndex: 'index', key: 'key' },
            {
              title: 'Batch No',
              render: (_, r) => {
                return r.batchNo ? r.batchNo : <Tag color={'red'}>Required</Tag>;
              },
            },
            {
              title: 'Expired Date',
              render: (_, r) => {
                return r.expiredDate || r.batchNo ? (
                  formatDate(r.expiredDate)
                ) : (
                  <Tag color={'red'}>Required</Tag>
                );
              },
            },
            {
              title: 'Description',
              render: (_, r) => {
                return `${r.itemCode} - ${r.itemName} (${r.description})`;
              },
            },
            { title: 'UOM', dataIndex: 'uom' },
            {
              title: 'Type',
              render: (_, r) => {
                return r.itemType === 131
                  ? 'Vital'
                  : r.itemType === 132
                  ? 'Mee Chiet'
                  : 'Merchandise';
              },
            },
            { title: 'Beginning Qty', align: 'right', dataIndex: 'beginningQty' },
            { title: 'Request Qty', align: 'right', dataIndex: 'quantity' },
            {
              title: 'Total Qty',
              align: 'right',
              render: (_, r) => {
                return r.beginningQty + r.quantity;
              },
            },
            {
              render: (_, r) => {
                return (
                  !r.batchNo && (
                    <Tooltip title="Edit" key={`${r.id}-EDIT`}>
                      <EditOutlined style={{ color: '#448DF7' }} onClick={() => {}} />
                    </Tooltip>
                  )
                );
              },
            },
          ]}
          summary={(data) => {
            const beginningQty = data.reduce((acc, it) => (acc += it.beginningQty), 0);
            const requestQty = data.reduce((acc, it) => (acc += it.quantity), 0);
            const disabled = data.some((it) => !it.batchNo || !it.expiredDate);
            return (
              <>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} align="right" colSpan={6}>
                    <Text type="success">Total</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} align="right">
                    <Text type="success">{beginningQty}</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2} align="right">
                    <Text type="success">{requestQty}</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={3} align="right">
                    <Text type="success">{requestQty + beginningQty}</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={4} align="right" />
                </Table.Summary.Row>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} align="right" colSpan={9}>
                    <Button
                      disabled={disabled}
                      type="primary"
                      onClick={async () => {
                        Modal.confirm({
                          title: 'Verify Suggestion.',
                          content: 'Are you sure?',
                          onOk: async () => {
                            await actions.acceptRequest(parent);
                            setForce({ update: force.update + 1 });
                          },
                        });
                      }}
                    >
                      Verify
                    </Button>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} align="right" />
                </Table.Summary.Row>
              </>
            );
          }}
          headerTitle={
            false
            // <Button
            //   type="primary"
            //   style={{ alignItems: 'flex-end' }}
            //   onClick={() => message.info('testing ')}
            // >
            //   Merge
            // </Button>
          }
          search={false}
          options={false}
          dataSource={parent.items}
          pagination={false}
        />
      ) : undefined
    ) : (
      <div key={parent.id} style={{ textAlign: 'center', fontWeight: 'bold', color: 'gray' }}>
        No Data
      </div>
    );
  };

  return (
    <>
      <ProTable<StockControlLess, { searchValue?: string }>
        actionRef={actionRef}
        key={'saleInvoice'}
        rowKey={'id'}
        //   toolBarRender={false}
        toolBarRender={() => [
          // <Button
          //   size="small"
          //   type="primary"
          //   disabled={state.loading}
          //   onClick={() => message.info('Hello')}
          //   icon={<PlusOutlined />}
          // />,
        ]}
        options={{
          density: false,
          setting: false,
          reload: false,
          // search: false,
          search: true ?? (
            <Space size={[1, 'small']}>
              <Input.Search allowClear />
            </Space>
          ),
        }}
        search={false}
        //displayOnly={!access.canCreateEditSo}
        // extraFilter={
        // <Space size="large">
        //   <Radio.Group
        //     value={advanceSearchParams?.active || -1}
        //     onChange={(e) => {
        //       setAdvanceSearchParams((v) => ({
        //         ...v,
        //         status: e.target.value,
        //       }));
        //       actionRef.current?.reloadAndRest?.();
        //     }}
        //   >
        //     <Radio.Button value="-1">All</Radio.Button>
        //     <Radio.Button value="1">Active</Radio.Button>
        //     <Radio.Button value="0">Inactive</Radio.Button>
        //   </Radio.Group>
        // </Space>
        // }
        // actionHandlers={{
        //   onSearchCriteria: (data: string) => {
        //     return { searchValue: data };
        //   },
        //   onAdd: actionHandlers?.onAdd,
        //   onFirstLoad: () =>
        //     cacheList.fetchDataList('sale-invoice').then((v) => {
        //       if (v) {
        //         // setAdvanceSearchParams(v.creteria);
        //         return v.dataList;
        //       } else return onSaleInvoiceRequestHandler();
        //     }) as Promise<Paging<SaleInvoiceLess>>,
        //   onRequest: onSaleInvoiceRequestHandler,
        //   // onAdvanceSearchClicked: () => modals.showModal('advanceSearch'),
        // }}
        request={async (
          params: {
            pageSize?: number;
            current?: number;
            keyword?: string;
          },
          sort: Record<string, SortOrder>,
        ) => {
          const searchParams = { searchValue: params.keyword };
          const data = await onRequestHandler(searchParams, params, sort);
          return {
            success: !!data,
            total: data?.total,
            data: data?.items.map((it: StockControlLess) => it).filter((it: any) => !!it),
          };
        }}
        expandable={{ expandedRowRender }}
        columns={[
          {
            title: 'Store Name',
            // sorter: 'poNo',
            // dataIndex: 'stockName',
            render: (_, r) => {
              return r.stockName ? r.stockName : '-';
              // return (
              //   <a onClick={() => actionHandlers?.onDetail && actionHandlers?.onDetail(r)}>
              //     {r.stockName}{' '}
              //   </a>
              // );
            },
          },
          {
            width: 120,
            title: 'Request Date',
            align: 'right',
            render: (_, r) => {
              return formatDate(r.requestedDate);
            },
          },
          {
            title: 'Serial Number',
            dataIndex: 'referenceNo',
          },

          {
            title: 'Number Plate',
            dataIndex: 'plateNumber',
          },
          // {
          //   title: 'Received By',
          //   dataIndex: 'receivedBy',
          // },

          {
            title: 'Status',
            // dataIndex: 'status',
            align: 'center',
            render: (_, r) => {
              const color =
                r.status === 'pending'
                  ? 'default'
                  : //: r.status === 'approved'
                  r.status === 'open'
                  ? 'success'
                  : r.status === 'canceled' || r.status === 'closed'
                  ? 'magenta'
                  : 'warning';
              return (
                <span>
                  <Tag color={color}>{r.status}</Tag>
                </span>
              );
            },
          },

          {
            title: 'Approved By',
            //   dataIndex: 'approvedBy',
            render: (_, r) => {
              return r.approvedBy ? r.approvedBy : '-';
            },
          },
          {
            width: 120,
            title: 'Approved Date',
            //dataIndex: 'approvedDate',
            align: 'right',
            render: (_, r) => {
              return r.approvedDate ? formatDate(r.approvedDate) : 'YYYY-MM-DD';
            },
          },
          access.canCreateEditStockControl
            ? {
                // title: '',
                // align: 'center',
                // render: (_, r) => {
                //   return !state.loading ? (
                //     <Tooltip title="Approve" key={`${r.id}-EDIT`}>
                //       {/* <EditOutlined style={{ color: '#448DF7' }} onClick={() => {}} /> */}
                //       {/* <CheckCircleOutlined style={{ color: '#448DF7' }} onClick={() => {}} /> */}
                //       <CheckOutlined
                //         style={{ color: '#448DF7' }}
                //         onClick={async () => {
                //           Modal.confirm({
                //             title: 'Approve Suggestion.',
                //             content: 'Are you sure?',
                //             onOk: async () => {
                //               await actions.acceptRequest(r);
                //               setForce({ update: force.update + 1 });
                //             },
                //           });
                //         }}
                //       />
                //     </Tooltip>
                //   ) : (
                //     <LoadingOutlined style={{ color: '#448DF7' }} />
                //   );
                //   // return <Checkbox defaultChecked={r.isActive ? true : false} disabled />;
                // },
              }
            : access.canOpenStore
            ? {
                // title: '',
                // align: 'center',
                // render: (_, r) => {
                //   return !state.loading ? (
                //     <Tooltip title="Accept" key={`${r.id}-EDIT`}>
                //       {/*  */}
                //       {/* <CheckCircleOutlined style={{ color: '#448DF7' }} onClick={() => {}} /> */}
                //       <CheckOutlined
                //         disabled={true}
                //         style={{ color: '#448DF7' }}
                //         onClick={async () => {
                //           await actions.acceptRequest(r);
                //         }}
                //       />
                //     </Tooltip>
                //   ) : (
                //     <LoadingOutlined style={{ color: '#448DF7' }} />
                //   );
                //   // return <Checkbox defaultChecked={r.isActive ? true : false} disabled />;
                // },
              }
            : {},
        ]}
      />
    </>
  );
};

export default SuggestionListView111;
