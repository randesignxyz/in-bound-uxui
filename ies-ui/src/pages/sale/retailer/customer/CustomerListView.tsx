import type { TableViewSearchParams } from '@/components/DataCrud/TableView';
import TableView from '@/components/DataCrud/TableView';
import type { Paging } from '@/services/API';
import { simpleRequestActions } from '@/services/model';
import { ActionType } from '@ant-design/pro-components';
import { history, useAccess, useModel } from '@umijs/max';
import { Badge, Button, message, Modal, Radio, Row, Tag, Tooltip, Typography } from 'antd';
import Omit from 'omit.js';
import { useRef, useState } from 'react';
import { SalePaths } from '../..';
import AdvanceSearch from '../components/AdvanceSearch';
import BreadCrumbCom from '../components/BreadCrumbCom';

import { UndoOutlined, UserSwitchOutlined } from '@ant-design/icons';
import { startCase } from 'lodash';
import { RetailerPath } from '..';
import type { CustomerAdvanceSearchParams, CustomerDto } from './data';
import { CustomerServiceAPI } from './services';

interface Props {
  onAdd?: () => void;
  onDetail?: (id: string) => void;
  onEdit?: (id: string) => void;
  onCreate?: () => void;
}

export default ({ onAdd, onDetail }: Props) => {
  const requestActions = simpleRequestActions();
  const services = CustomerServiceAPI(requestActions);
  //const access = useAccess();
  const access = useAccess();
  const { Text } = Typography;
  // const [suggestionForm] = useForm<CustomerUpdateGroupIdParam>();
  // const [cancelRequest] = useForm<CancelRequest>();

  // const [requestCount, setRequestCount] = useState(0);
  const [advanceSearch, setAdvanceSearch] = useState<{ visible: boolean }>();
  const [advanceSearchParams, setAdvanceSearchParams] = useState<CustomerAdvanceSearchParams>({
    status: 'ALL',
  });
  const actionRef = useRef<ActionType>();

  // const [crmListApprove, setCRMListApprove] = useState<{
  //   visible?: { name: 'modal'; type: 'ADD' | 'Edit'; payload?: { data: CRMDTO } };
  // }>({});

  // const [customerData, setCustomerData] = useState<CustomerDto>();
  const cacheList = useModel('dataList');
  const onRequestHandler = async (params: TableViewSearchParams<CustomerAdvanceSearchParams>) => {
    try {
      return services.listCustomer(params).then((it) => {
        // setRequestCount(it.items[0]?.requestCount);
        return cacheList.cacheDataList({
          type: 'retailer-customer',
          criteria: params,
          data: it,
        });
      }) as Promise<Paging<CustomerDto>>;
    } catch (error: any) {
      message.error(error.message);
      return Promise.reject();
    }
  };

  // const items: MenuProps['items'] = [
  //   {
  //     label: 'Quick Check',
  //     key: 'quick',
  //   },
  //   {
  //     label: 'More Check',
  //     key: 'more',
  //   },
  // ];

  const routes = [
    {
      path: SalePaths.retailer,
      label: 'Retailer',
    },
    {
      path: '',
      label: 'Customer',
    },
  ];
  return (
    <>
      <Row justify="space-between">
        <BreadCrumbCom separator=">" routes={routes} />
      </Row>
      <TableView<CustomerDto, { searchValue?: string; advanceSearch: CustomerAdvanceSearchParams }>
        hasCriteria={Object.values(Omit(advanceSearchParams, ['status'])).some((v) => v)}
        cache
        displayOnly
        extraFilter={
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
            <Radio.Button value="ALL" style={{ borderRadius: 5 }}>
              All
            </Radio.Button>
            <Badge size="small" offset={[-20, 0]} count={0}>
              <Radio.Button value="active">Active</Radio.Button>
            </Badge>
            <Badge size="small" offset={[-20, 0]} count={0}>
              <Radio.Button value="inactive">Inactive</Radio.Button>
            </Badge>
            <Badge size="small" offset={[-20, 0]} count={0}>
              <Radio.Button value="unverified">Unverified</Radio.Button>
            </Badge>
          </Radio.Group>
          // <Space size="large">

          //   <Radio.Group
          //     value={advanceSearchParams.status}
          //     onChange={(e) => {
          //       setAdvanceSearchParams((v) => ({
          //         ...v,
          //         status: e.target.value,
          //       }));

          //       actionRef.current?.reloadAndRest?.();
          //     }}
          //   >
          //     <Badge count={requestCount} offset={[-15, 0]} color="#448DF7">
          //       <Radio.Button style={{ borderRadius: 5 }} value="request">
          //         Requesting
          //       </Radio.Button>
          //     </Badge>
          //   </Radio.Group>
          // </Space>
        }
        columns={[
          {
            title: 'No',
            dataIndex: 'index',
            valueType: 'index', //  'indexBorder'
            width: 48,
          },
          {
            title: 'Customer Name',
            render: (_, r) => {
              return (
                <Button
                  style={{ padding: 0 }}
                  type="link"
                  onClick={() => {
                    onDetail?.(r.id);
                  }}
                >
                  {r.firstName + ' ' + r.lastName}
                </Button>
              );
            },
          },

          {
            title: 'Group Type',
            render: (_, r) => {
              return (
                r.customerGroup && (
                  <Button
                    style={{ padding: 0 }}
                    type="link"
                    onClick={() =>
                      history.push(`${RetailerPath.customergroup}/detail/${r.customerGroup?.id}`)
                    }
                  >
                    {r.customerGroup?.name}
                  </Button>
                )
              );
            },
          },
          {
            title: 'Phone',
            dataIndex: 'phone',
          },
          {
            title: 'Status',
            render: (_, r) => {
              return (
                <Tag
                  color={
                    r.status === 'active' ? 'green' : r.status === 'inactive' ? 'red' : 'warning'
                  }
                >
                  {startCase(r.status)}
                </Tag>
              );
            },
          },
          {
            title: 'Sugguestion',
            render: (_, r) => {
              return (
                r.suggestion && (
                  <Button
                    style={{ padding: 0 }}
                    type="link"
                    onClick={() =>
                      history.push(`${RetailerPath.registration}/detail/${r.suggestion?.id}`)
                    }
                  >
                    {r.suggestion?.customerNo ?? r.suggestion?.businessName}
                  </Button>
                )
              );
            },
          },
          {
            title: 'Req. SMS Count',
            align: 'right',
            render: (_, r) => {
              const count = r.verifyCount;

              return (
                <Text type={count < 3 ? 'success' : count >= 3 && count < 6 ? 'warning' : 'danger'}>
                  {count}
                </Text>
              );
            },
          },
          {
            title: 'Last Modified Date',
            dataIndex: 'lastModifiedDate',
            valueType: 'date',
          },
          {
            title: '',
            hideInTable: !access.canCreateRetailer,
            render: (_, r) => {
              return (
                <>
                  <Tooltip title={r.status === 'active' ? 'Inactive User' : 'Active User'}>
                    <Button
                      type="link"
                      style={{ color: r.status === 'active' ? 'red' : 'green' }}
                      icon={<UserSwitchOutlined />}
                      onClick={() => {
                        Modal.confirm({
                          title: r.status === 'active' ? 'Inactive User' : 'Active User',
                          content: 'Are you sure?',

                          onOk: async () => {
                            try {
                              const response = await services.updateStatusCustomer({
                                id: r.id,
                                status: r.status === 'active' ? 'inactive' : 'active',
                              });
                              await actionRef.current?.reload();
                              message.info(response.message);
                            } catch (error: any) {
                              message.error('Failed to save.');
                            }
                          },
                        });
                      }}
                    />
                  </Tooltip>

                  <Tooltip title="Reset request SMS">
                    <Button
                      type="link"
                      icon={<UndoOutlined />}
                      onClick={() => {
                        Modal.confirm({
                          title: 'Reset request SMS count to default.',
                          content: 'Are you sure?',

                          onOk: async () => {
                            try {
                              const response = await services.resetVerificationCustomer({
                                id: r.id,
                              });
                              await actionRef.current?.reload();
                              message.info(response.message);
                            } catch (error: any) {
                              message.error('Failed to save.');
                            }
                          },
                        });
                      }}
                    />
                  </Tooltip>
                </>
              );
            },
          },
        ]}
        advanceSearch
        actionHandlers={{
          onAdd: onAdd,
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
            cacheList.fetchDataList('retailer-customer').then((v) => {
              if (v) {
                console.log(v.creteria);
                setAdvanceSearchParams({
                  ...v.creteria?.criteria,
                  status: v.creteria?.criteria?.advanceSearch?.status ?? 'ALL',
                  groupId: v.creteria?.criteria?.advanceSearch?.groupId ?? '',
                });
                return v.dataList;
              } else {
                return onRequestHandler({
                  criteria: {
                    advanceSearch: advanceSearchParams,
                  },
                });
              }
            }) as Promise<Paging<CustomerDto>>,
        }}
        tableProps={{
          actionRef: actionRef,
        }}
      />

      <AdvanceSearch
        title="Advance Search"
        closable
        open={advanceSearch?.visible}
        initData={advanceSearchParams}
        onClose={() => {
          setAdvanceSearch({ visible: false });
        }}
        onReset={() => {
          setAdvanceSearchParams({ ...advanceSearchParams, groupId: undefined });
          actionRef.current?.reloadAndRest?.();
        }}
        onSearch={(data) => {
          setAdvanceSearchParams({ ...advanceSearchParams, groupId: data.groupId });
          actionRef.current?.reloadAndRest?.();
        }}
      />

      {/* <CRMListModal
        data={customerData}
        open={crmListApprove.visible?.name === 'modal'}
        onCancel={() => setCRMListApprove((v) => ({ ...v, visible: undefined }))}
        onSave={() => {}}
      /> */}
    </>
  );
};
