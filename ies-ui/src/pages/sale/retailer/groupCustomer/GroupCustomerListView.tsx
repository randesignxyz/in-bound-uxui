import TableView, { TableViewSearchParams } from '@/components/DataCrud/TableView';
import { SalePaths } from '@/pages/sale';
import { Paging } from '@/services/API';
import { simpleRequestActions } from '@/services/model';
import { EditOutlined } from '@ant-design/icons';
// import { EllipsisOutlined } from "@ant-design/icons";
import { ActionType } from '@ant-design/pro-components';
import { useAccess, useModel } from '@umijs/max';
import { Button, Switch, Tag, Tooltip, message } from 'antd';
// import { useForm } from "antd/es/form/Form";
import { startCase } from 'lodash';
import { useRef } from 'react';
import BreadCrumbCom from '../components/BreadCrumbCom';
import { CustomerServiceAPI } from '../customer/services';
import { CustomerGroupDetail, GroupCustomerAdvanceSearchParams } from './data';
//import GroupCustomerModal from './GroupCustomerModal';

export type Status = {
  color: string;
  text: string;
};

interface Props {
  onAdd?: () => void;
  onDetail?: (id: string) => void;
  onEdit?: (id: string) => void;
}

export default ({ onDetail, onAdd, onEdit }: Props) => {
  const requestActions = simpleRequestActions();
  const services = CustomerServiceAPI(requestActions);
  const actionRef = useRef<ActionType>();

  const access = useAccess();
  const cacheList = useModel('dataList');
  const onRequestHandler = async (
    params: TableViewSearchParams<GroupCustomerAdvanceSearchParams>,
  ) => {
    try {
      return services.listGroupCustomer(params).then((it) => {
        return cacheList.cacheDataList({
          type: 'retailer-group-customer',
          criteria: params,
          data: it,
        });
      }) as Promise<Paging<CustomerGroupDetail>>;
    } catch (error: any) {
      message.error(error.message);
      return Promise.reject();
    }
  };

  //   const onSaveActionHandler = (data: GroupCustomer) => {
  //     Modal.confirm({
  //       title: 'Save Group Customer',
  //       content: 'Are you sure?',
  //       onOk: async () => {
  //         try {
  //           (await services.saveGroupCustomer(data)) as {
  //             data: string;
  //             message: string;
  //           };
  //           setSate((v) => ({ ...v, visible: undefined }));
  //           actionRef.current?.reloadAndRest?.();
  //           message.success('Saved successfully.');
  //         } catch (error: any) {
  //           message.error(error.message || 'Failed to driver.');
  //         }
  //       },
  //     });
  //   };

  const routes = [
    {
      path: SalePaths.retailer,
      label: 'Retailer',
    },
    {
      path: '',
      label: 'Customer Group',
    },
  ];

  return (
    <>
      <BreadCrumbCom separator=">" routes={routes} />
      <TableView<
        CustomerGroupDetail,
        { searchValue?: string; advanceSearch: GroupCustomerAdvanceSearchParams }
      >
        displayOnly={access.canAccessRetailerSalesperons}
        rowKey="id"
        columns={[
          {
            title: 'Customer Group Name',
            render: (_, r) => {
              return (
                <Tooltip title="Detail">
                  <Button
                    type="link"
                    onClick={() => {
                      onDetail?.(r.id);
                    }}
                  >
                    {r.name}
                  </Button>
                </Tooltip>
              );
            },
          },
          {
            title: 'Code',
            dataIndex: 'code',
          },
          {
            title: 'Description',
            dataIndex: 'description',
          },
          {
            title: 'Status',
            dataIndex: 'status',
            render: (_, r) => {
              return (
                <Tag color={r.status === 'active' ? 'green' : 'red'}>{startCase(r.status)}</Tag>
              );
            },
          },
          {
            title: 'Is Default',
            dataIndex: 'isDefault',
            // valueType: 'checkbox',
            // width: 100,
            render: (_, r) => <Switch disabled defaultChecked={r.isDefault} />,
          },
          // r.isDefault ? 'true' : 'false'
          {
            title: 'Last Modified Date',
            dataIndex: 'lastModifiedDate',
            valueType: 'date',
          },
          {
            title: 'Action',
            render: (_, r) => {
              return (
                <EditOutlined
                  style={{ color: '#448DF7' }}
                  onClick={() => {
                    onEdit?.(r.id);
                  }}
                />
              );
            },
          },
        ]}
        tableProps={{
          actionRef: actionRef,
        }}
        actionHandlers={{
          onAdd: onAdd,
          onRequest: (criteria, pagination, sort) =>
            onRequestHandler({
              criteria: {
                ...criteria,
                // advanceSearch: advanceSearchParams,
                sort,
              },
              pagination,
            }),
        }}
      />

      {/* <GroupCustomerModal
                    open={state.visible?.name == 'modal'}
                    onCancel={() => setSate((v) => ({ ...v, visible: undefined }))}
                    data={state.visible?.payload?.vehicle}
                    onSave={onSaveActionHandler}
                /> */}
    </>
  );
};
