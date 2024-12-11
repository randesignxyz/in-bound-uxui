import TableView, { TableViewSearchParams } from '@/components/DataCrud/TableView';
import { Paging } from '@/services/API';
import { downloadReport } from '@/services/apiGateway';
import { simpleRequestActions } from '@/services/model';
import { EyeFilled, FileExcelOutlined, PlusOutlined } from '@ant-design/icons';
import { ActionType, ProFormDateRangePicker } from '@ant-design/pro-components';
import { useAccess, useModel } from '@umijs/max';
import { Button, DatePicker, Input, Modal, Radio, Select, Space, Tag, Tooltip, message } from 'antd';
import Omit from 'omit.js';
import { useEffect, useRef, useState } from 'react';
import ApproveRemarkFormModal from '../../ApproveRemarkFormModal';
import ExportExcel from '../../ExportExcel';
import RemarkFormModal from '../../RemarkFormModal';
import DetailView from './DetailView';
import { TransferRequest, TransferRequestAdvanceParams, TransferRequestCreate } from '../data';
import { TransferRequestServiceAPI } from '../service';
import TransferRequestModelForm from './TransferRequestModelForm';
import { history } from 'umi'
import moment from 'moment';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

interface Props {
  onDetail?: (id: string) => void;
  onAdd?: () => void;
  onEdit?: (id: number) => void;
  data?: string;
}

export default ({ onAdd }: Props) => {
  dayjs.extend(utc);
  dayjs.extend(timezone);
  const [stateOpen, setStateOpen] = useState<{
    visible?: { name: 'modal'; type: 'ADD' | 'Edit'; payload?: { data: TransferRequest } };
  }>({});
  const access = useAccess();
  const requestActions = simpleRequestActions();
  const services = TransferRequestServiceAPI(requestActions);
  const [loading, setLoading] = useState(false)
  const [rejectLoading, setRejectLoading] = useState(false)
  const [excelLoading, setExcelLoading] = useState(false)
  // const [advanceSearch, setAdvanceSearch] = useState<{ visible: boolean }>();
  const [advanceSearchParams, setAdvanceSearchParams] = useState<TransferRequestAdvanceParams>({
    business_unit: 'ALL',
    state: 'in-progress',
    transfer_type: 'ALL',
  });
  const actionRef = useRef<ActionType>();
  const [viewDetail, setViewDetail] = useState<{
    visible: boolean;
    data?: TransferRequest;
  }>({ visible: false });

  const [commentModal, setCommentModal] = useState<{
    visible: boolean;
    id?: string;
    transfer_id?: string;
  }>({
    visible: false,
    id: undefined,
    transfer_id: undefined,
  });
  const [approveModel, setApproveModal] = useState<{
    visible: boolean;
    id?: string;
    transfer_id?: string;
    data?: any
  }>({
    visible: false,
    id: undefined,
    transfer_id: undefined,
  });
  const [exportModel, setExportModal] = useState<{ visible: boolean }>({
    visible: false,
  });

  const onAddHandler = async () => {
    setStateOpen((v) => ({
      ...v,
      visible: { name: 'modal', type: 'ADD' },
    }));
  };

  const onSaveActionHandler = (data: TransferRequestCreate) => {
    Modal.confirm({
      title: 'Save Transfer Request record',
      content: 'are you sure',
      onOk: async () => {
        const response = (await services.save(data)) as {
          data: string;
          message: string;
        };
        // await services.save_activites(activities)
        setStateOpen((v) => ({ ...v, visible: undefined }));
        actionRef.current?.reloadAndRest?.();
        message.success(response.data);
      },
    });
  };

  const cacheList = useModel('dataList');
  //   useEffect(()=>{
  //   const getExcel = async(params:GetToExcelParams)=>{
  //     try {
  //       const result = await services.get_to_excel(params);
  //       // console.log(result)

  //           setGetAllData(result)
  //   } catch (error: any) {
  //       message.error(error.message);
  //       return Promise.reject();
  //   }
  //   };
  //   getExcel(da)
  // },[])

  // useEffect(()=>{
  //   console.log(getAllData)
  // },[])

  const onRequestHandler = async (params: TableViewSearchParams<TransferRequestAdvanceParams>) => {
    try {
      return services.page(params).then((it) => {
        return cacheList.cacheDataList({
          type: 'transfer-request-list',
          criteria: params,
          data: it,
        });
      }) as Promise<Paging<TransferRequest>>;
    } catch (error: any) {
      message.error(error.message);
      return Promise.reject();
    }
  };

  const onDetailhandler = async (data: TransferRequest) => {
    try {
      const detail = await services.detail(data.id);
      setViewDetail({ visible: true, data: detail });
    } catch (error: any) {
      message.error(error.message || 'Faild to load data.');
    }
  };

  useEffect(() => {
    if (access.canAccessNVCItem) {
      setAdvanceSearchParams((v) => ({ ...v, business_unit: 'NVC' }));
      actionRef.current?.reloadAndRest?.();
    } else if (access.canAccessOFLItem) {
      setAdvanceSearchParams((v) => ({ ...v, business_unit: 'OFL' }));
      actionRef.current?.reloadAndRest?.();
    } else if (access.canAccessOMMItem) {
      setAdvanceSearchParams((v) => ({ ...v, business_unit: 'OMM' }));
      actionRef.current?.reloadAndRest?.();
    } else if (access.canAccessItem) {
      setAdvanceSearchParams((v) => ({ ...v, business_unit: 'ALL' }));
      actionRef.current?.reloadAndRest?.();
    } else {
      setAdvanceSearchParams((v) => ({ ...v, business_unit: 'None' }));
      actionRef.current?.reloadAndRest?.();
    }
  }, []);

  // const handleClick = async (params: GetToExcelParams) => {
  //   const result = await services.get_to_excel(params);
  //   const excel = new Excel();
  //   excel
  //     .addSheet("test")
  //     .addColumns(columns)
  //     .addDataSource(result, {
  //       str2Percent: true
  //     })
  //     .saveAs("Excel.xlsx");
  // };

  return (
    <>
      <TableView
        hasCriteria={Object.values(Omit(advanceSearchParams, ['business_unit'])).some((v) => v)}
        cache
        extraFilter={

          <Space size="large" style={{ flexDirection: 'row' }}>
            <Radio.Group
              value={advanceSearchParams.transfer_type}
              onChange={(e) => {
                setAdvanceSearchParams((v) => ({
                  ...v,
                  transfer_type: e.target.value,
                }));
                actionRef.current?.reloadAndRest?.();
              }}
            >
              <Radio.Button value="ALL">All</Radio.Button>
              <Radio.Button value="PM/RM">PM/RM</Radio.Button>
              <Radio.Button value="FG">FG</Radio.Button>
            </Radio.Group>
            <Select
              defaultValue="in-progress"
              style={{ width: 120 }}
              onChange={(e) => {
                setAdvanceSearchParams((v) => ({
                  ...v,
                  state: e,
                }));
                actionRef.current?.reloadAndRest?.();
              }}
              options={[
                { value: 'in-progress', label: 'In Progress' },
                { value: 'rejected', label: 'Rejectetd' },
                { value: 'completed', label: 'Completed' },
              ]}
            />
            <DatePicker
              style={{ width: 165 }}
              onChange={(v => {
                const dateWithoutTime = v?.format("YYYY-MM-DD")
                setAdvanceSearchParams((v) => ({
                  ...v,
                  postingDate: dateWithoutTime,
                }));
                actionRef.current?.reloadAndRest?.();
              })}
              placeholder='Posting date'
            />
            <DatePicker
              style={{ width: 165 }}
              onChange={(v => {
                const dateWithoutTime = v?.format("YYYY-MM-DD")
                setAdvanceSearchParams((v) => ({
                  ...v,
                  docDueDate: dateWithoutTime,
                }));
                actionRef.current?.reloadAndRest?.();
              })}
              placeholder='Doc Due date'
            />

          </Space>
        }
        tableProps={{
          actionRef: actionRef,
          toolbar: {
            actions: [
              <>
                <Tooltip title="Add New Request">
                  <Button
                    key="click-add"
                    type="link"
                    icon={<PlusOutlined />}
                    onClick={() => onAddHandler()}
                  />
                </Tooltip>

                <Tooltip title="Dowload Excel File"><Button type="link" icon={<FileExcelOutlined />} onClick={() => setExportModal({ visible: true })} /></Tooltip>
              </>
            ],
          },
        }}
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
              </Space>
            ),
          },
          {
            key: 'id',
            title: 'ID',
            dataIndex: 'id',
            render: (_, r) => (
              <a onClick={() => history.push(`/prod/inventory-transfer-request/view/${r.id}`, { id: r.id })}>PDR-{String(r.id).padStart(6, '0')}</a>
            ),
          },
          {
            key: 'transfer_type',
            title: 'Type',
            dataIndex: 'transfer_type',
          },
          {
            width: 150,
            key: 'line',
            title: 'Line',
            dataIndex: 'line',
          },
          {
            width: 80,
            key: 'shift',
            title: 'Shift',
            dataIndex: 'shift',
          },
          {
            width: 150,
            key: 'from_warehouse',
            title: 'From Warehouse',
            dataIndex: 'from_warehouse',
            render: (_, r) => r.from_warehouse.map((w) => w.whsCode),
          },
          {
            width: 150,
            key: 'to_warehouse',
            title: 'To Warehouse',
            dataIndex: 'to_warehouse',
            render: (_, r) => r.to_warehouse.map((w) => w.whsCode),
          },
          {
            width: 80,
            key: 'tendency',
            title: 'BU',
            dataIndex: 'tendency',
            render: (_, r) => r.business_unit,
          },
          {
            key: 'createdBy',
            title: 'Created By',
            dataIndex: 'createdBy',
          },
          {
            key: 'date',
            title: 'Created Date',
            valueType: 'date',
            dataIndex: 'createdDate',
            sorter: 'createdDate',
          },
          {
            key: 'state',
            title: 'Status',
            render: (_, r) =>
              r.state === 'in-progress' ? (
                <Tag color="processing" bordered={false}>
                  Pending
                </Tag>
              ) : r.state === 'rejected' ? (
                <Tag color="error" bordered={false}>
                  Rejected
                </Tag>
              ) : r.state === 'completed' ? (
                <Tag color="success" bordered={false}>
                  Completed
                </Tag>
              ) : (
                ''
              ),
          },
          {
            render: (_, r) => (
              <>
                {r.status === 'transfer-request' ? (
                  <>
                    <Button
                      style={{ width: '30%' }}
                      onClick={() => {
                        setApproveModal({ visible: true, id: r.id, transfer_id: r.transfer_id, data: r });
                      }}
                    >
                      Approve
                    </Button>
                    <Button
                      style={{ width: '30%', marginLeft: 10, marginRight: 10 }}
                      onClick={() => {
                        setCommentModal({ visible: true, id: r.id, transfer_id: r.transfer_id });
                      }}
                    >
                      Reject
                    </Button>
                  </>
                ) : (
                  ''
                )}
              </>
            ),
          },
        ]}
        actionHandlers={{
          onAdd: () => onAdd?.(),
          // onAdvanceSearchClicked: () => setAdvanceSearch({ visible: true }),
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
            cacheList.fetchDataList('transfer-request-production-list').then((v: any) => {
              if (v) {
                setAdvanceSearchParams({
                  ...v.creteria?.criteria,
                  // status: v.creteria?.criteria?.advanceSearch?.status ?? '',
                  // searchValue:''
                });

                return v.dataList;
              } else {
                return onRequestHandler({
                  criteria: {
                    advanceSearch: advanceSearchParams,
                  },
                });
              }
            }) as Promise<Paging<TransferRequest>>,
        }}
      />
      <TransferRequestModelForm
        open={stateOpen.visible?.name === 'modal'}
        onCancel={() => setStateOpen((v) => ({ ...v, visible: undefined }))}
        onSave={onSaveActionHandler}
        data={stateOpen.visible?.payload?.data}
      />
      <DetailView
        open={viewDetail.visible}
        data={viewDetail.data}
        onVisibleChange={(v) => v === false && setViewDetail({ visible: false })}
      />
      <RemarkFormModal
        title="Reject Form"
        loading={rejectLoading}
        open={commentModal.visible}
        onCancel={() => {
          setCommentModal({ visible: false, id: undefined });
        }}
        onSave={async (id, remark, transfer_id) => {
          try {
            setRejectLoading(true)
            const response: { data: string; message: string } = (await services.status_change({
              id: id,
              remark: remark,
              statusChange: 'transfer-request-reject',
              state: 'rejected',
            })) as { data: string; message: string };
            await services.save_activites({
              activities_name: 'Production Approval',
              action: 'Rejected',
              remark: remark,
              transfer_request: transfer_id,
            });
            setCommentModal({ visible: false, id: undefined });
            message.info(response.message);
            actionRef.current?.reload();
          } catch (e) {
            message.error('Error');
          } finally {
            setRejectLoading(false);
          }
        }}
        id={commentModal.id ?? ''}
        transfer_id={commentModal.transfer_id ?? ''}
      />
      <ApproveRemarkFormModal
        title="Approve Form"
        open={approveModel.visible}
        loading={loading}
        onCancel={() => {
          setApproveModal({ visible: false, id: undefined });
        }}
        onSave={async (id, remark, transfer_id, data) => {
          try {
            setLoading(true)
            const entity = {
              id: id,
              vendorCode: '',
              vendorName: '',
              fromWarehouse: data.from_warehouse.map((i: any) => (i.whsCode)).toString(),
              toWarehouse: data.to_warehouse.map((i: any) => (i.whsCode)).toString(),
              apiReferenceNo: id,
              comments: data.line + ', ' + data.shift,
              transferRequestDetails: data.item.map((v: any) => ({
                ...v,
                itemCode: v.item_code,
                itemName: v.item_name,
                fromWarehouse: data.from_warehouse.map((i: any) => (i.whsCode)).toString(),
                toWarehouse: data.to_warehouse.map((i: any) => (i.whsCode)).toString(),
                remark: v.remark === null ? '' : v.remark === undefined ? '' : v.remark,
              })),
              statusChange: 'request-production-approve',
              state: 'in-progress',
              activities_name: 'Production Approval',
              action: 'Approved',
              transfer_request: transfer_id,
              postingDate: new Date(data.posting_date).toISOString(),
              docDueDate: new Date(data.due_date).toISOString(),
              taxDate: new Date(data.posting_date).toISOString(),
            }
            await services.save_to_sap(entity)
            setApproveModal({ visible: false, id: undefined });
            message.success("Success");
            actionRef.current?.reload();
          } catch (e) {
            message.error('Error');
          } finally {
            setLoading(false);
          }
        }}
        id={approveModel.id ?? ''}
        transfer_id={approveModel.transfer_id ?? ''}
        data={approveModel.data ?? {}}
      />

      <ExportExcel
        title="Export Excel"
        open={exportModel.visible}
        loading={excelLoading}
        type='request'
        onCancel={() => setExportModal({ visible: false })}
        onSave={async (duration, line, shift, state, request_type) => {
          const result = {
            line: line,
            shift: shift,
            startDate: dayjs(duration[0]).format('YYYY-MM-DD'),
            endDate: dayjs(duration[1]).format('YYYY-MM-DD'),
            state: state,
            type: 'production',
            request_type: request_type || ''
          };
          try {
            setExcelLoading(true)
            await downloadReport(requestActions)({
              fileName: `invantory-transfer-request-production-report-${moment().toDate().toDateString()}`,
              reportName: 'prod-transfer-request-report',
              data: result,
              type: 'EXCEL',
              // target: '_blank'
            });
          } catch (error) {
            message.error('Failed to download.');
          } finally {
            setExcelLoading(false)
          }
          setExportModal({ visible: false });
        }}
      />
    </>
  );
};
