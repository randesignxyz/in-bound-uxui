import TableView, { TableViewSearchParams } from '@/components/DataCrud/TableView';
import { Paging } from '@/services/API';
import { simpleRequestActions } from '@/services/model';
import { BlockOutlined, DeleteOutlined, EllipsisOutlined } from '@ant-design/icons';
import {
  ActionType,
  ProForm,
  ProFormDatePicker,
  ProFormRadio,
  ProTable,
} from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import {
  Col,
  Drawer,
  DrawerProps,
  Dropdown,
  MenuProps,
  message,
  Modal,
  Row,
  Space,
  Statistic,
  Tag,
} from 'antd';
import { useForm } from 'antd/lib/form/Form';
import Omit from 'omit.js';
import { useEffect, useRef, useState } from 'react';
import { FuelTransactionSearch, TankDTO, TankMonthlyEndingDTO, TankTransactionDTO } from './data';
import { TankFuelServiceAPI } from './service';
interface Props extends DrawerProps {
  open: boolean;
  onClose: () => void;
  data?: TankDTO;
}

export default ({ data, ...props }: Props) => {
  const requestActions = simpleRequestActions();
  const services = TankFuelServiceAPI(requestActions);
  const actionRef = useRef<ActionType>();
  const [form] = useForm();
  const [statusState, setStatusState] = useState<string>();
  const [quantityState, setQuantityState] = useState<{
    withdraw?: number | 0;
    plus?: number | 0;
  }>();

  useEffect(() => {
    props.open && actionRef.current?.reload?.();
  }, [props.open]);
  const cacheList = useModel('dataList');
  const [advanceSearch, setAdvanceSearch] = useState<{ visible: boolean }>();
  const [advanceSearchParams, setAdvanceSearchParams] = useState<FuelTransactionSearch>({
    status: 'ALL',
    tankId: 0,
    date: undefined,
  });

  const onRequestHandler = async (params: TableViewSearchParams<FuelTransactionSearch>) => {
    try {
      return services
        .pageFuelTransaction({
          ...params,
          criteria: {
            advanceSearch: {
              tankId: data?.id,
              status: params.criteria?.advanceSearch?.status,
              date: params.criteria?.advanceSearch?.date,
            },
            searchValue: params.criteria?.searchValue,
            sort: params.criteria?.sort,
          },
        })
        .then((it) => {
          const withdraw = (it.items as TankTransactionDTO[])
            .filter((it) => it.transactionType == 'MINUS')
            .reduce(
              (pre, item) => {
                return { quantity: pre.quantity + item.quantity };
              },
              { quantity: 0 },
            );
          const enter = (it.items as TankTransactionDTO[])
            .filter((it) => it.transactionType == 'PLUS')
            .reduce(
              (pre, item) => {
                return { quantity: pre.quantity + item.quantity };
              },
              { quantity: 0 },
            );
          setQuantityState((v) => ({ ...v, withdraw: withdraw.quantity, plus: enter.quantity }));

          return cacheList.cacheDataList({
            type: 'fleet-fuel-transaction',
            criteria: params,
            data: it,
          });
        }) as Promise<Paging<TankTransactionDTO>>;
    } catch (error: any) {
      message.error(error.message);
      return Promise.reject();
    }
  };

  const items = (row: TankTransactionDTO): MenuProps['items'] => {
    return [
      {
        key: '2',
        label: row.status == '' ? 'Void' : 'Unvoid',
        itemIcon: <BlockOutlined />,
        onClick: () => {
          Modal.confirm({
            title: 'Confirm Deduction Entry Void',
            content: 'Are you sure you want to void this fuel entry?',
            onOk: async () => {
              const entry = {
                ...row,
                status: row.status == '' ? 'void' : '',
              };
              await services.voidTransaction(entry);
              message.success('Success'), actionRef.current?.reloadAndRest?.();
            },
          });
        },
      },
      {
        type: 'divider',
      },
      {
        key: '3',
        label: 'Delete',
        itemIcon: <DeleteOutlined />,
        danger: true,
        onClick: () => {
          Modal.confirm({
            title: 'Confirm Deduction Entry Void',
            content: 'Are you sure you want to void this fuel entry?',
            onOk: async () => {
              await services.deleteTransaction(row);
              message.success('Success'), actionRef.current?.reloadAndRest?.();
            },
          });
        },
      },
    ];
  };
  const expandedRowRender = (e?: any) => {
    return (
      <ProTable<TankTransactionDTO>
        columns={[
          {
            title: 'Transection Date',
            dataIndex: 'dateRefill',
            sorter: 'dateRefill',
            valueType: 'date',
            key: 'dateRefill',
          },

          {
            title: 'Before Balance',
            dataIndex: 'beforeBalance',
            key: 'beforeBalance',
            sorter: 'beforeBalance',
            valueType: "digit",
            render: (_, r) => r.beforeBalance?.toFixed(2)
          },

          {
            title: 'Quantity',
            dataIndex: 'quantity',
            key: 'quantity',
            sorter: 'quantity',
            render: (_, r) => {
              return (
                <span style={{ color: r.transactionType == 'PLUS' ? 'green' : 'red' }}>
                  {r.transactionType == 'PLUS' ? '+' : '-'} {r.quantity?.toFixed(2)}
                </span>
              );
            },
          },
          {
            title: 'After Balance',
            dataIndex: 'afterBalance',
            key: 'afterBalance',
            sorter: 'afterBalance',
            render: (_, r) => r.afterBalance?.toFixed(2)
          },
          {
            title: 'Beginning Balance',
            dataIndex: 'beginningBalance',
            key: 'beginningBalance',
            sorter: 'beginningBalance',
            render: (_, r) => r.beginningBalance?.toFixed(2)
          },

          {
            title: 'Transaction Name',
            dataIndex: 'transactionName',
            key: 'transactionName',
            sorter: 'source',
          },
          {
            title: 'Status',
            dataIndex: 'status',
            sorter: 'status',
          },
          {
            title: 'remark',
            dataIndex: 'remark',
            sorter: 'remark',
          },
        ]}
        request={async () => {
          const items = await services.pageFuelTransaction({
            criteria: {
              searchValue: '',
              advanceSearch: { tankId: data?.id, endingDate: e.endingDate },
            },
          });
          return Promise.resolve({
            data: items.items,
            success: true,
          });
        }}
        headerTitle={false}
        search={false}
        options={false}
        pagination={false}
      />
    );
  };

  return (
    <>
      <Drawer
        width={1000}
        {...props}
        styles={{
          body: {
            padding: 0, margin: 0, backgroundColor: '#fafafa'
          }
        }}
      >
        <ProForm
          form={form}
          layout="horizontal"
          onValuesChange={async (e) => {
            setAdvanceSearchParams((v) => ({
              ...v,
              ...form.getFieldsValue(),
            }));
            setStatusState(e?.status);
            actionRef.current?.reloadAndRest?.();
          }}
          submitter={false}
        >
          <Space size="large" style={{ paddingLeft: 20, paddingRight: 20 }}>
            <ProFormRadio.Group
              name="status"
              initialValue={'ALL'}
              radioType="button"
              options={[
                {
                  label: 'ALL',
                  value: 'ALL',
                },
                {
                  label: 'TANK REFUEL',
                  value: 'TANKFUEL',
                },
                {
                  label: 'DEDUCTION',
                  value: 'DEDUCTION',
                },
                {
                  label: 'TRUCK FUEL',
                  value: 'TRUCKFUEL',
                },
                {
                  label: 'MONTHLY',
                  value: 'MONTHLY',
                },
              ]}
            />
            <ProFormDatePicker.Month name={'date'} />
          </Space>
        </ProForm>

        <Row gutter={12} style={{ padding: '0 20px' }}>
          <Col span={6}>
            <Statistic
              title={'Current Balance'}
              value={data?.currentInventory?.toFixed(2)}
              style={{ backgroundColor: '#e8e2bd', borderRadius: 5, padding: 5 }}
              valueStyle={{ color: '#3f8600' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title={'Withdraw'}
              style={{ backgroundColor: '#e8e2bd', borderRadius: 5, padding: 5 }}
              value={quantityState?.withdraw?.toFixed(2)}
              valueStyle={{ color: 'red' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title={'Enter'}
              value={quantityState?.plus?.toFixed(2)}
              style={{ backgroundColor: '#e8e2bd', borderRadius: 5, padding: 5 }}
              valueStyle={{ color: '#3f8600' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title={'Beginning'}
              value={data?.beginningInventory?.toFixed(2)}
              style={{ backgroundColor: '#e8e2bd', borderRadius: 5, padding: 5 }}
              precision={2}
              valueStyle={{ color: '#3f8600' }}
            />
          </Col>
        </Row>

        {statusState != 'MONTHLY' ? (
          <TableView<TankTransactionDTO, { searchValue?: string }>
            hasCriteria={Object.values(Omit(advanceSearchParams, ['status'])).some((v) => v)}
            cache
            displayOnly
            tableProps={{
              actionRef: actionRef,
            }}
            columns={[
              {
                title: 'Transection Date',
                dataIndex: 'dateRefill',
                sorter: 'dateRefill',
                valueType: 'date',
              },

              {
                title: 'Before Balance',
                dataIndex: 'beforeBalance',
                sorter: 'beforeBalance',
                render: (_, r) => r.beforeBalance?.toFixed(2)
              },

              {
                title: 'Quantity',
                dataIndex: 'quantity',
                sorter: 'quantity',
                render: (_, r) => {
                  return (
                    <span style={{ color: r.transactionType == 'PLUS' ? 'green' : 'red' }}>
                      {r.transactionType == 'PLUS' ? '+' : '-'} {r.quantity?.toFixed(2)}
                    </span>
                  );
                },
              },
              {
                title: 'After Balance',
                dataIndex: 'afterBalance',
                sorter: 'afterBalance',
                render: (_, r) => r.afterBalance?.toFixed(2)
              },
              {
                title: 'Beginning Balance',
                dataIndex: 'beginningBalance',
                sorter: 'beginningBalance',
                render: (_, r) => r.beginningBalance?.toFixed(2)
              },

              {
                title: 'Transaction Name',
                dataIndex: 'transactionName',
                sorter: 'source',
              },
              {
                title: 'Status',
                dataIndex: 'status',
                sorter: 'status',
                render: (_, r) =>
                  r.status == 'void' ? (
                    <Tag bordered={false} color="error">
                      {r.status}
                    </Tag>
                  ) : (
                    '-'
                  ),
              },
              {
                title: 'remark',
                dataIndex: 'remark',
                sorter: 'remark',
              },
              {
                title: 'action',
                render: (_, r) => {
                  r.source;
                  return (
                    r.source == 'DEDUCTION' && (
                      <Dropdown menu={{ items: items(r), style: { width: 200 } }}>
                        <a>
                          <EllipsisOutlined />
                        </a>
                      </Dropdown>
                    )
                  );
                },
              },
            ]}
            actionHandlers={{
              onAdvanceSearchClicked: () => setAdvanceSearch({ visible: true }),
              onRequest: (criteria, pagination, sort) =>
                onRequestHandler({
                  criteria: {
                    ...criteria,
                    advanceSearch: advanceSearchParams,

                    sort,
                  },
                  pagination,
                }),
              onFirstLoad: () =>
                cacheList.fetchDataList('fleet-fuel-transaction').then((v) => {
                  if (v) {
                    setAdvanceSearchParams({
                      ...v.creteria?.criteria,
                      status: v.creteria?.criteria?.advanceSearch?.status ?? 'ALL',
                    });
                    return v.dataList;
                  } else {
                    return onRequestHandler({
                      criteria: {
                        advanceSearch: advanceSearchParams,
                      },
                    });
                  }
                }) as Promise<Paging<TankTransactionDTO>>,
            }}
          />
        ) : (
          <ProTable<TankMonthlyEndingDTO>
            search={false}
            rowKey={'id'}
            expandable={{
              expandedRowRender,
            }}
            columns={[
              {
                title: 'Closing Date',
                dataIndex: 'endingDate',
                valueType: 'date',
              },
              {
                title: 'Current Balance',
                dataIndex: 'currentBalance',
                valueType: "digit",
                render: (_, r) => r.currentBalance?.toFixed(2)
              },
              {
                title: 'Actualt Balance',
                dataIndex: 'actualBalance',
                valueType: "digit",
                render: (_, r) => r.actualBalance?.toFixed(2)
              },
              {
                title: 'Ajustment',
                dataIndex: 'adjustment',
                valueType: "digit",
                render: (_, r) => r.adjustment?.toFixed(2)
              },
              {
                title: 'Closing By',
                dataIndex: 'createdBy',
              },
              {
                title: 'Status',
                dataIndex: 'status',
                sorter: 'status',
              },
              {
                title: 'remark',
                dataIndex: 'remark',
              },
            ]}
            headerTitle={false}
            options={false}
            pagination={false}
            request={async () => {
              const items = await services.pageTankMonthlyEnding({
                criteria: { searchValue: '', advanceSearch: { tankId: data?.id } },
              });
              return Promise.resolve({
                data: items.items,
                success: true,
              });
            }}
          />
        )}
      </Drawer>
    </>
  );
};
