import TableView, { colLink, TableViewSearchParams } from '@/components/DataCrud/TableView';
import { formatDateTime } from '@/pages/utils';
import { MultiRequest } from '@/services/apiGateway';
import { Company, Driver, DriverListItem, SaveDriver, Truck } from '@/services/delivery/data';
import { DeliveryParams } from '@/services/delivery/delivery-params';
import { DeliveryServiceAPI } from '@/services/delivery/services';
import { simpleRequestActions } from '@/services/model';
import { ActionType } from '@ant-design/pro-table';
import { Checkbox, DatePicker, message, Modal, Radio, Space, Spin } from 'antd';
import { useRef, useState } from 'react';
import TruckEntryModal from './EntryForm';

export default () => {
  const requestActions = simpleRequestActions();
  const services = DeliveryServiceAPI(requestActions);
  const actionRef = useRef<ActionType>();
  const [advanceSearchParams, setAdvanceSearchParams] = useState({
    filter: 'SO',
    so_status: 'ALL',
    dn_status: 'ALL'
  });
  // const [state, setSate] = useState<{
  //   visible?: { name: 'modal'; type: 'ADD' | 'Edit'; payload?: Driver };
  //   initData?: {
  //     companyList: Company[];
  //     truckList: Truck[];
  //   };
  // }>({});


  return (
    // <Spin spinning={requestActions.request?.loading}>
    <TableView<DriverListItem, { searchValue?: string }>
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
            <Radio.Button value="SO">SO</Radio.Button>
            <Radio.Button value="DN">Delivery Note</Radio.Button>
            {/* <Radio.Button value="FG">FG</Radio.Button> */}
          </Radio.Group>
          {advanceSearchParams.filter == 'DN' ?
            <>
              <Radio.Group
                value={advanceSearchParams.dn_status}
                onChange={(e) => {
                  setAdvanceSearchParams((v) => ({
                    ...v,
                    dn_status: e.target.value,
                  }));
                  actionRef.current?.reloadAndRest?.();
                }}
              >
                <Radio.Button value="ALL">ALL</Radio.Button>
                <Radio.Button value="peding">Pending</Radio.Button>
                <Radio.Button value="in-progress">In Progress</Radio.Button>
                <Radio.Button value="cancel">Cancel</Radio.Button>
              </Radio.Group>
              <DatePicker
                style={{ width: 165 }}
                onChange={(v => {
                  const dateWithoutTime = v?.format("YYYY-MM-DD")
                  setAdvanceSearchParams((v) => ({
                    ...v,
                    dnDate: dateWithoutTime,
                  }));
                  actionRef.current?.reloadAndRest?.();
                })}
                placeholder='Delivery Note Date'
              />
            </>
            : advanceSearchParams.filter == 'SO' ?
              <Radio.Group
                value={advanceSearchParams.so_status}
                onChange={(e) => {
                  setAdvanceSearchParams((v) => ({
                    ...v,
                    so_status: e.target.value,
                  }));
                  actionRef.current?.reloadAndRest?.();
                }}
              >
                <Radio.Button value="ALL">ALL</Radio.Button>
                <Radio.Button value="peding">Pending</Radio.Button>
                <Radio.Button value="in-progress">In Progress</Radio.Button>
                <Radio.Button value="cancel">Cancel</Radio.Button>
              </Radio.Group>
              : <></>}


        </Space>
      }
      columns={[
        // {
        //   title: 'Name',
        //   render: colLink(
        //     (r) => onEditHandler(r),
        //     (r) => [r.firstName, r.lastName].join(' '),
        //   ),
        // },
        { title: 'Date', render: (_, r) => r.company?.name },
        { title: 'SO', render: (_, r) => r.company?.name },
        { title: 'Plan', dataIndex: 'idCard' },
        // { title: 'Driver License', dataIndex: 'driverLicense' },
        // { title: 'Driver License Type', dataIndex: 'driverLicenseType' },
        // { title: 'Delivery Tracking', render: (_, r) => <Checkbox checked={r.deliveryTracking == undefined ? true : r.deliveryTracking} /> },
        // { title: 'Driver License Expired Date', dataIndex: 'driverLicenseExpiredDate' },
        { title: 'Created By', dataIndex: 'createdBy' },
        {
          title: 'Created Date',
          // width: 150,
          // align: 'right',
          render: (_, r) => formatDateTime(r.createdDate),
        },
      ]}
      tableProps={{
        actionRef: actionRef,
      }}
      actionHandlers={{
        onRequest: (criteria, pagination, sort) => { { } }
        // onRequestHandler({
        //   criteria,
        //   pagination,
        //   // sort
        // }),
      }}
    />
    // </Spin>
  );
};
