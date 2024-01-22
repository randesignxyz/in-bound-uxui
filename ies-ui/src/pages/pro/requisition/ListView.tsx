import TableView, { TableViewSearchParams } from '@/components/DataCrud/TableView';
import Status from '@/components/Status';
import { formatDate, formatter } from '@/pages/utils';
import { Paging } from '@/services/API';
import { simpleRequestActions } from '@/services/model';
import {
  ProDepartment,
  RequisitionDetailResponse,
  RequisitionLess,
  RequisitionListItem,
} from '@/services/pro/data';
import { RequisitionAdvanceSearchParams } from '@/services/pro/req-params';
import { RequisitionServiceAPI } from '@/services/pro/services';
import {
  CheckOutlined,
  CopyFilled,
  EditFilled,
  ExportOutlined,
  EyeFilled,
  PartitionOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { ActionType } from '@ant-design/pro-table';
import { Badge, Button, Flex, message, Modal, Radio, Space, Spin, Tooltip } from 'antd';
import Omit from 'omit.js';
import { useRef, useState } from 'react';
import { history, useAccess, useModel } from 'umi';
import Flow from '../flow';
import AdvanceSearch from './components/AdvanceSearch';
import DataDetailView from './DataDetailView';

interface Props {
  onAdd?: (id?: number) => void;
  onEdit?: (id: number) => void;
}

export default ({ onAdd, onEdit }: Props) => {
  const requestActions = simpleRequestActions();
  const services = RequisitionServiceAPI(requestActions);
  const [advanceSearchParams, setAdvanceSearchParams] = useState<RequisitionAdvanceSearchParams>({
    status: 'ALL',
    integratedStatus: 'ALL',
    service: undefined,
  });

  const actionRef = useRef<ActionType>();
  const access = useAccess();
  const cacheList = useModel('dataList');

  const [viewDetail, setViewDetail] = useState<{
    visible: boolean;
    data?: RequisitionDetailResponse;
  }>({ visible: false });
  const [advanceSearch, setAdvanceSearch] = useState<{ visible: boolean }>();
  const [listDepartment, setListDepartment] = useState<ProDepartment[]>([]);
  const [openFlow, setOpenFlow] = useState<RequisitionListItem>();

  const onRequestHandler = async (
    params: TableViewSearchParams<RequisitionAdvanceSearchParams>,
  ) => {
    try {
      return services.list(params).then((it) => {
        return cacheList.cacheDataList({
          type: 'pro-pr',
          criteria: params,
          data: it,
        });
      }) as Promise<Paging<RequisitionLess>>;
    } catch (error: any) {
      message.error(error.message);
      return Promise.reject();
    }
  };

  const onDetailhandler = async (data: RequisitionListItem) => {
    try {
      const detail = await services.detail(data.id);

      setViewDetail({ visible: true, data: detail });
    } catch (error: any) {
      message.error(error.message || 'Faild to load data.');
    }
  };

  const listDepts = async () => {
    try {
      const depts = await services.listProDepartment();
      setListDepartment(depts);
    } catch (error: any) {
      message.error(error.message);
    }
  };

  return (
    <PageContainer onBack={history.back} title="Purchase Requisition">
      <Spin spinning={false}>
        <TableView<
          RequisitionListItem,
          { searchValue?: string; advanceSearch?: RequisitionAdvanceSearchParams }
        >
          hasCriteria={Object.values(
            Omit(advanceSearchParams, ['status', 'integratedStatus']),
          ).some((v) => v)}
          cache
          bordered
          addButtonLabel="New Request"
          extraFilter={
            <Space size="large">
              <Radio.Group
                value={advanceSearchParams.status}
                onChange={(e) => {
                  setAdvanceSearchParams((v) => ({
                    ...v,
                    status: e.target.value,
                    integratedStatus: undefined,
                  }));

                  actionRef.current?.reloadAndRest?.();
                }}
              >
                <Radio.Button value="ALL">All</Radio.Button>
                <Badge size="small" offset={[-20, 0]} count={0}>
                  <Radio.Button value="DRAFT">Draft</Radio.Button>
                </Badge>
                <Radio.Button value="PENDING">Pending</Radio.Button>
                <Badge size="small" offset={[-20, 0]} count={0}>
                  <Radio.Button value="APPROVED">Approved</Radio.Button>
                </Badge>
                <Badge size="small" offset={[-20, 0]} count={0}>
                  <Radio.Button value="REJECTED">Rejected</Radio.Button>
                </Badge>
              </Radio.Group>

              {advanceSearchParams.status == 'APPROVED' && (
                <Radio.Group
                  value={advanceSearchParams.integratedStatus}
                  onChange={(e) => {
                    setAdvanceSearchParams((v) => ({
                      ...v,
                      integratedStatus: e.target.value,
                    }));

                    actionRef.current?.reloadAndRest?.();
                  }}
                >
                  <Radio.Button value="ALL">All</Radio.Button>
                  <Badge size="small" offset={[-20, 0]} count={0}>
                    <Radio.Button value="POSTED">Posted</Radio.Button>
                  </Badge>
                  <Badge size="small" offset={[-20, 0]} count={0}>
                    <Radio.Button value="CLOSED">Closed</Radio.Button>
                  </Badge>
                  <Radio.Button value="CANCELED">Canceled</Radio.Button>
                  <Badge size="small" offset={[-20, 0]} count={0}>
                    <Radio.Button value="FAILED">Failed</Radio.Button>
                  </Badge>
                </Radio.Group>
              )}
            </Space>
          }
          columns={[
            {
              title: '',
              width: 10,
              render: (_, r) => (
                <Space size={1}>

                  <Tooltip title="View Data">
                    <Button
                      size="small"
                      type="link"
                      icon={<EyeFilled />}
                      onClick={() => onDetailhandler(r)}
                    />
                  </Tooltip>
                  <Tooltip title="Copy Data">
                    <Button
                      size="small"
                      type="link"
                      icon={<CopyFilled />}
                      onClick={() => history.push(`/pro/requisition/create/${r.id}`)}
                    />
                  </Tooltip>

                  {!r.formNo && (
                    <Tooltip title="Edit">
                      <Button
                        size="small"
                        type="link"
                        icon={<EditFilled />}
                        onClick={() => history.push(`/pro/requisition/edit/${r.id}`)}
                      />
                    </Tooltip>
                  )}
                </Space>
              ),
            },
            {
              title: 'Form No',
              sorter: 'formNo',
              width: 100,
              render: (_, r) => (
                <Flex gap={5}>
                  <Button
                    size="small"
                    type="link"
                    icon={<ExportOutlined />}
                    onClick={async () => {
                      window.open(`/external/data-form/requisition_request_process/${r.instanceId}`, '_blank')?.focus();
                    }}
                  />
                  <a
                    onClick={() =>
                      history.push(`/data-form/requisition_request_process/${r.instanceId}`)
                    }
                  >
                    {r.formNo}
                  </a>
                </Flex>

              ),
            },
            {
              title: 'Requisition Infomation',
              children: [
                {
                  title: 'Expected Dt',
                  align: 'right',
                  sorter: 'acquisitionDate',
                  width: 120,
                  render: (_, r) => formatDate(r.acquisitionDate),
                },
                {
                  title: 'Total Amt.',
                  align: 'right',
                  width: 120,
                  sorter: 'totalAmount',
                  render: (_, r) => formatter.format(r.totalAmount || 0),
                },
                {
                  title: 'Srv',
                  width: '10px',
                  align: 'center',
                  render: (_, r) => {
                    return r.service == 'Y' ? <CheckOutlined size={5} /> : <span />;
                  },
                },
              ],
            },
            {
              title: 'Requested Information',
              children: [
                {
                  title: 'Requested By',
                  width: 130,
                  sorter: 'requestedBy',
                  render: (_, r) => r.requestedBy,
                },
                {
                  title: 'Requested Dt',
                  align: 'right',
                  sorter: 'createdDate',
                  width: 130,
                  render: (_, r) => formatDate(r.createdDate),
                },
                {
                  title: 'Status',
                  dataIndex: 'processStatus',
                  width: 70,
                  render: (_, r) => r.processStatus && <Status text={r.processStatus} />,
                },
              ],
            },

            {
              title: 'SAP Information',
              hideInTable: !['APPROVED', 'ALL'].some((it) => it == advanceSearchParams.status),
              children: [
                {
                  title: 'DocNum',
                  width: 100,
                  dataIndex: 'sapDocNo',
                  // hideInTable: !['APPROVED', 'ALL'].some((it) => it == advanceSearchParams.status),
                },
                {
                  title: 'Posted Date',
                  width: 100,
                  // hideInTable: !['APPROVED', 'ALL'].some((it) => it == advanceSearchParams.status),
                  render: (_, r) => formatDate(r.postedDate),
                },
                {
                  title: 'Status',
                  width: 70,
                  dataIndex: 'sapStatus',
                  // hideInTable: !['APPROVED', 'ALL'].some((it) => it == advanceSearchParams.status),
                  render: (_, r) => r.sapStatus && <Status text={r.sapStatus} />,
                },
              ],
            },
            {
              width: 5,
              render: (_, r) => (
                <Flex>
                  <Button type="link" title='View Flow' onClick={() => setOpenFlow(r)} icon={<PartitionOutlined />} />
                  {r.sapStatus == 'FAILED' && <Button title='Post to SAP' danger type="link" onClick={() => {
                    Modal.confirm({
                      title: 'Post to SAP',
                      content: 'Are you sure?',
                      onOk: async () => {
                        try {
                          await services.post(r.id);
                          actionRef.current?.reloadAndRest?.()
                          message.success('Posted successfully.');
                        } catch (error: any) {
                          message.error(error.message || 'Failed to post.');
                        } finally {

                        }
                      },
                    });
                  }} icon={<UploadOutlined />} />}
                </Flex>

              ),
            },
          ]}
          advanceSearch
          displayOnly={!access.canCreatePR}
          actionHandlers={{
            onAdd: onAdd,

            onAdvanceSearchClicked: () => {
              setAdvanceSearch({ visible: true });
              listDepts();
            },
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
              cacheList.fetchDataList('pro-pr').then((v) => {
                // console.log('onFirstLoad',v);
                if (v) {
                  // console.log('arrived here???');
                  setAdvanceSearchParams({
                    ...v.creteria?.criteria,
                    status: v.creteria?.criteria?.advanceSearch?.status ?? 'ALL',
                    integratedStatus:
                      v.creteria?.criteria?.advanceSearch?.integratedStatus ?? undefined,
                  });
                  return v.dataList;
                } else {
                  // console.log('not arrived here???');
                  return onRequestHandler({
                    criteria: {
                      // v.creteria,
                      advanceSearch: advanceSearchParams,
                      // sort,
                    },
                    // pagination,
                  });
                }
              }) as Promise<Paging<RequisitionLess>>,
          }}
          tableProps={{
            actionRef: actionRef,
          }}
        />

        <DataDetailView
          open={viewDetail.visible}
          data={viewDetail.data}
          reload={async (id) => {
            const detail = await services.detail(id);
            await setViewDetail((v) => ({ ...v, data: detail }));
          }}
          onEdit={() => viewDetail.data?.id && onEdit?.(viewDetail.data?.id)}
          onAdd={() => viewDetail.data?.id && onAdd?.(viewDetail.data?.id)}
          onOpenChange={(v) => v == false && setViewDetail({ visible: false })}
        />
        <AdvanceSearch
          title="Advance Search"
          closable
          open={advanceSearch?.visible}
          // onVisibleChange = {v => setAdvanceSearch({visible: v})}
          initData={advanceSearchParams}
          onClose={() => {
            console.log('advance search in pro visible ', advanceSearch);
            setAdvanceSearch({ visible: false });
          }}
          onReset={() => {
            setAdvanceSearchParams({ status: 'ALL' });
            actionRef.current?.reloadAndRest?.();
          }}
          onSearch={(data) => {
            setAdvanceSearchParams((v) => ({ ...v, ...data, status: v.status }));
            actionRef.current?.reloadAndRest?.();
          }}
          listDepts={listDepartment}
        />
      </Spin>
      <Flow
        open={!!openFlow}
        onOpenChange={(visible) => !visible && setOpenFlow(undefined)}
        type={'PR'}
        fromId={openFlow?.id || 0}
      />
    </PageContainer>
  );
};
