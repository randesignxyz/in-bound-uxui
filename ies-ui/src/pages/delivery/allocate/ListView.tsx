import TableView, { colLink, TableViewSearchParams } from '@/components/DataCrud/TableView';
import { formatDateTime } from '@/pages/utils';
import { MultiRequest } from '@/services/apiGateway';
import { Company, Driver, DriverListItem, SaveDriver, Truck } from '@/services/delivery/data';
import { simpleRequestActions } from '@/services/model';
import { ActionType, ProColumns } from '@ant-design/pro-table';
import { Card, Checkbox, DatePicker, message, Modal, Progress, Radio, Space, Spin, Tag } from 'antd';
import { useRef, useState } from 'react';
import { AllocateServiceAPI } from './service';
import { Allocate, AllocateSOAdvanceParams, DeliveryList, DNItemParams, SOList } from './data';
import { useModel } from '@umijs/max';
import { Paging } from '@/services/API';
import { FaCarSide } from "react-icons/fa6";
import DrawerForm from './DrawerForm';
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'

dayjs.extend(customParseFormat)

export default () => {
  const requestActions = simpleRequestActions();
  const services = AllocateServiceAPI(requestActions);
  const actionRef = useRef<ActionType>();
  const [drawerOpen, setDrawerOpen] = useState<{ visible: boolean; id: string, status?: string, po?: string,deliveres?:DeliveryList[] }>({
    visible: false,
    id: '',
  });
  const [advanceSearchParams, setAdvanceSearchParams] = useState({
    filter: 'SO',
    status: 'pending',
  });
  // const [state, setSate] = useState<{
  //   visible?: { name: 'modal'; type: 'ADD' | 'Edit'; payload?: Driver };
  //   initData?: {
  //     companyList: Company[];
  //     truckList: Truck[];
  //   };
  // }>({});
  const cacheList = useModel('dataList');

  const onRequestHandler = async (params: TableViewSearchParams<AllocateSOAdvanceParams>) => {
    try {
      return services.pageSO(params).then((it) => {
        return cacheList.cacheDataList({
          type: 'alocate-list',
          criteria: params,
          data: it,
        });
      }) as Promise<Paging<Allocate>>;
    } catch (error: any) {
      message.error(error.message);
      return Promise.reject();
    }
  };

  const onRequestDNHandler = async (params: TableViewSearchParams<AllocateSOAdvanceParams>) => {
    try {
      return services.page(params).then((it) => {
        return cacheList.cacheDataList({
          type: 'alocate-list',
          criteria: params,
          data: it,
        });
      }) as Promise<Paging<Allocate>>;
    } catch (error: any) {
      message.error(error.message);
      return Promise.reject();
    }
  };

  const soColums: ProColumns<SOList>[] = [
    { title: 'PO No', dataIndex: 'poNo' },
    { title: 'SO No', dataIndex: 'soNo' },
    { title: 'Customer', dataIndex: 'customerName' },
    {
      title: 'Ordered Date',
      dataIndex: 'orderedDate',
      renderText: (value: string) => {
        const date = dayjs(value)
        return date.isValid() ? date.format('DD-MMM-YYYY') : '-'
      }
    },
    {
      title: 'Total',
      dataIndex: 'totalItemQty',
    },
    {
      title: 'DN Total',
      dataIndex: 'dnCount',
    },
    {
      title: 'Status',
      width: 250,
      dataIndex: 'status',
      render: (_, entity) => {
        const status = entity.status;
        let color = 'default';

        switch (status) {
          case 'Pending':
            color = 'orange';
            break;
          case 'Posted':
            color = 'green';
            break;
          case 'Failed':
            color = 'red';
            break;
          default:
            color = 'gray';
            break;
        }

        return (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ alignItems: 'flex-start', width: '35%' }}>
              <Tag color={color}>{status}</Tag>
            </div>
            {/* <Progress
              percent={entity.percentage || 0}
              size="small"
              strokeColor={{ from: '#108ee9', to: '#87d068' }}
              // status={entity.dn_completion_percent === 100 ? 'success' : 'active'}
              style={{ width: '50%' }}
              format={(percent) => `${Math.round(percent ?? 0)}%`} /> */}
          </div>
        )
      },
    },
    {
      title: 'Action', dataIndex: 'idCard',
      width: 20,
      align: 'center',
      render: (_, r) =>
      (<a onClick={() => setDrawerOpen({ visible: true, id: r.id, status: r.status, po: r.poNo,deliveres:r.deliveries })}>
        <FaCarSide />
      </a>),
    },
  ]

  const dnColums: ProColumns<SOList>[] = [
    {
      title: 'SO Number',
      dataIndex: 'so_num',
      render: (text: string, record: DNItemParams) => (
        <Card
          title={`SO Number: ${record.so_num}`}
          size="small"
          style={{ width: 300 }}
        >
          <p>Item Name: {record.item_name}</p>
          <p>Quantity: {record.order_qty}</p>
          {/* Add more fields if needed */}
        </Card>
      ),
    },
  ];

  return (
    <>
      <Spin spinning={requestActions.request?.loading}>
        <TableView<SOList, { searchValue?: string }>
          displayOnly
          extraFilter={

            <Space size="large" style={{ flexDirection: 'row' }}>
              <Radio.Group
                value={advanceSearchParams.filter}
                onChange={(e) => {
                  setAdvanceSearchParams((v) => ({
                    ...v,
                    filter: e.target.value,
                  }));
                  actionRef.current?.reloadAndRest?.();
                }}
              >
                <Radio.Button value="SO">Sales Order</Radio.Button>
                <Radio.Button value="DN">Delivery Note</Radio.Button>
                {/* <Radio.Button value="FG">FG</Radio.Button> */}
              </Radio.Group>
              <Radio.Group
                value={advanceSearchParams.status}
                onChange={(e) => {
                  setAdvanceSearchParams((v) => ({
                    ...v,
                    status: e.target.value,
                  }));
                  actionRef.current?.reloadAndRest?.();
                }}
              >
                <Radio.Button value="ALL">ALL</Radio.Button>
                <Radio.Button value="pending">Pending</Radio.Button>
                <Radio.Button value="posted">Posted</Radio.Button>
                <Radio.Button value="failed">Failed</Radio.Button>
                <Radio.Button value="canceled">Canceled</Radio.Button>
              </Radio.Group>
              <DatePicker
                style={{ width: 165 }}
                onChange={(v => {
                  const dateWithoutTime = v?.format("MMM DD YYYY")
                  setAdvanceSearchParams((v) => ({
                    ...v,
                    ordered_date: dateWithoutTime,
                  }));
                  actionRef.current?.reloadAndRest?.();
                })}
                placeholder='Select Date'
              />
            </Space>
          }
          columns={advanceSearchParams.filter == 'SO' ? soColums : advanceSearchParams.filter == 'DN' ? dnColums : []}
          tableProps={{
            actionRef: actionRef,
          }}
          actionHandlers={{
            onRequest: (criteria, pagination, sort) =>
              advanceSearchParams.filter === 'SO'
                ? onRequestHandler({
                  criteria: {
                    ...criteria,
                    advanceSearch: advanceSearchParams,
                    sort,
                  },
                  pagination,
                })
                : advanceSearchParams.filter == 'DN' ? onRequestDNHandler({
                  criteria: {
                    ...criteria,
                    advanceSearch: advanceSearchParams,
                    sort,
                  },
                  pagination,
                }) : Promise.resolve({}),
          }}

        />
      </Spin>
      <DrawerForm
        open={drawerOpen.visible}
        id={drawerOpen.id}
        status={drawerOpen.status}
        po={drawerOpen.po}
        deliveres={drawerOpen.deliveres}
        onVisibleChange={(v) => v === false && setDrawerOpen({ visible: false, id: '', status: '',  po: '' })}

      />
    </>
  );
};
