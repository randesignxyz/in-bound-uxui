import type { TableViewSearchParams } from '@/components/DataCrud/TableView';
import TableView from '@/components/DataCrud/TableView';
import type { Paging } from '@/services/API';
import { MultiRequest } from '@/services/apiGateway';
import { LookupData } from '@/services/data';
import { simpleRequestActions } from '@/services/model';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { ActionType } from '@ant-design/pro-components';
import { history, useModel } from '@umijs/max';
import { Badge, Button, message, Radio, Row, Space, Tag, Tooltip, Typography } from 'antd';
import { startCase } from 'lodash';
import Omit from 'omit.js';
import { useEffect, useRef, useState } from 'react';
import { RetailerPath } from '..';
import { SalePaths } from '../..';
import ApproveFormModal from '../components/ApproveFormModal';
import BreadCrumbCom from '../components/BreadCrumbCom';
import RemarkFormModal from '../components/RemarkFormModal';
import { RegistrationAdvanceSearchParams, RegistrationForm } from './data';
import RegistrationAdvanceSearch from './RegistrationAdvanceSearch';
import { RegistrationFormAPI } from './services';

interface Props {
  onAdd?: () => void;
  onDetail?: (id: string) => void;
  onEdit?: (id: string) => void;
  onCreate?: () => void;
}

export default ({ onAdd, onDetail }: Props) => {
  const requestActions = simpleRequestActions();
  const services = RegistrationFormAPI(requestActions);

  const [advanceSearch, setAdvanceSearch] = useState<{ visible: boolean }>();
  const [advanceSearchParams, setAdvanceSearchParams] = useState<RegistrationAdvanceSearchParams>({
    status: 'ALL',
  });
  const actionRef = useRef<ActionType>();

  const [customerTypes, setCustomerTypes] = useState<LookupData[]>([]);

  const [commentModal, setCommentModal] = useState<{ visible: boolean; id?: string }>({
    visible: false,
    id: undefined,
  });
  const { Text } = Typography;

  useEffect(() => {
    (async () => {
      const rs = await MultiRequest<{
        customerTypes: LookupData[];
      }>([services.listLookupData.queryParams])(requestActions);
      const result = rs.customerTypes.filter((it) => it.code.toLowerCase() !== 'other');
      const it = {
        id: -1,
        code: 'ALL',
        name: 'All',
        type: 'CUSTOMER_TYPE',
      } as LookupData;
      result.unshift(it);
      setCustomerTypes(result);
    })();
  }, []);

  const [approveModal, setApproveModal] = useState<{
    visible: boolean;
    id?: string | undefined;
  }>({
    visible: false,
    id: undefined,
  });

  const cacheList = useModel('dataList');
  const onRequestHandler = async (
    params: TableViewSearchParams<RegistrationAdvanceSearchParams>,
  ) => {
    try {
      return services.listRegistrationForm(params).then((it) => {
        // setRequestCount(it.items[0]?.requestCount);
        return cacheList.cacheDataList({
          type: 'registration-form',
          criteria: params,
          data: it,
        });
      }) as Promise<Paging<RegistrationForm>>;
    } catch (error: any) {
      message.error(error.message);
      return Promise.reject();
    }
  };

  const routes = [
    {
      path: SalePaths.retailer,
      label: 'Retailer',
    },
    {
      path: '',
      label: 'Registrations',
    },
  ];

  return (
    <>
      <Row justify="space-between">
        <BreadCrumbCom separator=">" routes={routes} />
      </Row>
      <TableView<
        RegistrationForm,
        { searchValue?: string; advanceSearch: RegistrationAdvanceSearchParams }
      >
        hasCriteria={Object.values(Omit(advanceSearchParams, ['status'])).some((v) => v)}
        cache
        displayOnly
        extraFilter={
          <Radio.Group
            value={advanceSearchParams.status}
            style={{ padding: 4 }}
            onChange={(e) => {
              console.log(e);
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
              <Radio.Button value="pending">Pending</Radio.Button>
            </Badge>
            <Badge size="small" offset={[-20, 0]} count={0}>
              <Radio.Button value="approved">Approve</Radio.Button>
            </Badge>
            <Badge size="small" offset={[-20, 0]} count={0}>
              <Radio.Button value="reject">Rejected</Radio.Button>
            </Badge>
          </Radio.Group>
        }
        columns={[
          {
            title: 'Business Name',
            render: (_, r) => {
              if (['pending', 'approved', 'reject'].indexOf(r.status) !== -1)
                return (
                  <Button
                    style={{ padding: 0 }}
                    type="link"
                    onClick={() => {
                      onDetail?.(r.id);
                    }}
                  >
                    {r.businessName}
                  </Button>
                );
              else return <Text>{r.businessName}</Text>;
            },
          },
          {
            title: 'Owner Name',
            render: (_, r) => {
              if (r.customer !== null)
                return (
                  <Button
                    style={{ padding: 0 }}
                    type="link"
                    onClick={() => {
                      history.push(`${RetailerPath.customer}/detail/${r.customer?.id}`);
                    }}
                  >
                    {r.customer?.firstName + ' ' + r.customer?.lastName}
                  </Button>
                );
              else return '-';
            },
          },
          {
            title: 'Customer No',
            dataIndex: 'customerNo',
          },
          {
            title: 'Phone',
            dataIndex: 'phone',
          },

          {
            title: 'Address',
            dataIndex: 'address',
          },

          {
            title: 'Status',
            dataIndex: 'status',
            render: (_, r) => {
              return (
                <Tag
                  color={
                    r.status === 'pending' ? 'default' : r.status === 'reject' ? 'red' : 'green'
                  }
                >
                  {startCase(r.status)}
                </Tag>
              );
            },
          },
          {
            title: 'Remark',
            dataIndex: 'remark',
          },
          {
            title: 'Last Modified Date',
            dataIndex: 'lastModifiedDate',
            valueType: 'dateTime',
          },
          {
            title: 'Action',
            align: 'right',
            render: (_, r) => {
              return (
                <Space>
                  {['pending', 'reject'].indexOf(r.status) !== -1 && (
                    <Tooltip placement="top" title="Approved">
                      <CheckCircleOutlined
                        style={{ color: '#448DF7' }}
                        onClick={() => {
                          setApproveModal({
                            visible: true,
                            id: r.id,
                          });
                        }}
                      />
                    </Tooltip>
                  )}

                  {['pending', 'approved'].indexOf(r.status) !== -1 && (
                    <Tooltip placement="top" title="Reject">
                      <CloseCircleOutlined
                        style={{ color: 'red' }}
                        onClick={() => {
                          setCommentModal({ visible: true, id: r.id });
                        }}
                      />
                    </Tooltip>
                  )}
                </Space>
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
            cacheList.fetchDataList('registration-form').then((v) => {
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
            }) as Promise<Paging<RegistrationForm>>,
        }}
        tableProps={{
          actionRef: actionRef,
        }}
      />

      <RegistrationAdvanceSearch
        title="Advance Search"
        closable
        open={advanceSearch?.visible}
        initData={advanceSearchParams}
        onClose={() => {
          setAdvanceSearch({ visible: false });
        }}
        onReset={() => {
          actionRef.current?.reloadAndRest?.();
        }}
        onSearch={(data) => {
          setAdvanceSearchParams((v) => ({ ...v, ...data, status: v.status }));
          actionRef.current?.reloadAndRest?.();
        }}
      />

      <RemarkFormModal
        title="Reject Registration Form"
        open={commentModal.visible}
        onCancel={() => {
          setCommentModal({ visible: false, id: undefined });
        }}
        onSave={async (id, remark) => {
          console.log(remark);
          const response: { data: string; message: string } =
            (await services.updateStatusSuggestion({
              id: id,
              remark: remark,
              status: 'reject',
              customerType: 'Default',
              customerNo: '',
            })) as { data: string; message: string };
          setCommentModal({ visible: false, id: undefined });
          message.info(response.message);
          actionRef.current?.reload();
        }}
        id={commentModal.id ?? ''}
      />
      <ApproveFormModal
        open={approveModal.visible}
        customerTypes={customerTypes}
        actionHandler={{
          onCancel: () => {
            setApproveModal({ visible: false, id: undefined });
          },
          onOk: async (remark, customerType, it, customerGroupId) => {
            const response: { data: string; message: string } =
              (await services.updateStatusSuggestion({
                id: approveModal.id ?? '',
                status: 'approved',
                customerType: customerType,
                customerNo: it?.code,
                remark: remark,
                customerGroupId: customerGroupId,
              })) as { data: string; message: string };
            message.info(response.message);
            setApproveModal({
              visible: false,
              id: undefined,
            });
            actionRef.current?.reload();
          },
        }}
      />
    </>
  );
};
