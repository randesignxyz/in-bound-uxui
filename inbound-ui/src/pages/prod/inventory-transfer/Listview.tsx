import TableView, { TableViewSearchParams } from '@/components/DataCrud/TableView';
import { simpleRequestActions } from '@/services/model';
import { Button, Col, DatePicker, Flex, Modal, Progress, Radio, Row, Select, Space, Tabs, Tag, Tooltip, message } from 'antd';
import Omit from 'omit.js';
import { useRef, useState } from 'react';
// import { TransferServiceAPI } from "../service";
import { Paging } from '@/services/API';
import { ActionType } from '@ant-design/pro-components';
import { ReceiveStatusChange, Transfer, TransferAdvanceParams, TransferCreate } from './data';
// import DetailView from "../DetailView";
import BreadCrumbCom from '@/pages/prod/shared/BreadCrumbCom';
import { FileExcelOutlined, PlusOutlined } from '@ant-design/icons';
import { useModel } from '@umijs/max';
import { ProdPaths } from '..';
import DetailView from './DetailView';
import ModelForm from './ModelForm';
import { TransferServiceAPI } from './service';
import { history } from 'umi'
import ExportExcel from '../ExportExcel';
import { downloadReport } from '@/services/apiGateway';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import moment from 'moment';

interface Props {
  onDetail?: (id: string) => void;
  onAdd?: () => void;
  onEdit?: (id: number) => void;
  data?: string;
}

export default ({ }: Props) => {
  dayjs.extend(utc);
  dayjs.extend(timezone);
  const [state, setSate] = useState<{
    visible?: { name: 'modal'; type: 'ADD' | 'Edit'; payload?: { data: Transfer } };
  }>({});
  const [exportModel, setExportModal] = useState<{ visible: boolean }>({
    visible: false,
  });
  const [excelLoading, setExcelLoading] = useState(false)
  const requestActions = simpleRequestActions();
  const services = TransferServiceAPI(requestActions);
  // const [advanceSearch, setAdvanceSearch] = useState<{ visible: boolean }>();
  const [advanceSearchParams, setAdvanceSearchParams] = useState<TransferAdvanceParams>({
    transfer_type: 'ALL',
    transfer_request: '',
    status: 'ALL'
  });
  const [viewDetail, setViewDetail] = useState<{ visible: boolean; data?: Transfer }>({
    visible: false,
  });
  const actionRef = useRef<ActionType>();
  const cacheList = useModel('dataList');
  const [activeTab, setActiveTab] = useState('1');
  const routes = [
    {
      path: ProdPaths.prod,
      label: 'Prod',
    },
    {
      path: '',
      label: 'Inventory Transfer',
    },
  ];
  const onRequestHandler1 = async (params: TableViewSearchParams<TransferAdvanceParams>) => {
    try {
      const data = services.page(params).then((it) => {
        return cacheList.cacheDataList({
          type: 'transfer-request-list',
          criteria: params,
          data: it,
        });
      }) as Promise<Paging<Transfer>>;
      return data
    } catch (error: any) {
      message.error(error.message);
      return Promise.reject();
    }
  };

  const onRequestHandler2 = async (params: TableViewSearchParams<TransferAdvanceParams>) => {
    try {
      const data = services.pageFianl(params).then((it) => {
        return cacheList.cacheDataList({
          type: 'transfer-request-final-list',
          criteria: params,
          data: it,
        });
      }) as Promise<Paging<Transfer>>;
      return data
    } catch (error: any) {
      message.error(error.message);
      return Promise.reject();
    }
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    actionRef.current?.reloadAndRest?.();
  };

  const handleRequest = (criteria, pagination, sort) => {
    const params = {
      criteria: {
        ...criteria,
        advanceSearch: advanceSearchParams,
        sort,
      },
      pagination,
    };

    if (activeTab === '1') {
      return onRequestHandler1(params);
    } else {
      return onRequestHandler2(params);
    }
  };

  const onDetailhandler = async (data: Transfer) => {
    try {
      const detail = await services.detail_list(data.id);
      setViewDetail({ visible: true, data: detail });
    } catch (error: any) {
      message.error(error.message || 'Faild to load data.');
    }
  };

  const onSaveActionHandler = (data: TransferCreate, receive: ReceiveStatusChange) => {
    Modal.confirm({
      title: 'Save Transfer record',
      content: 'are you sure',

      onOk: async () => {
        const response = (await services.save(data)) as {
          data: string;
          message: string;
        };
        await services.receive_change(receive);
        setSate((v) => ({ ...v, visible: undefined }));
        actionRef.current?.reloadAndRest?.();
        message.success(response.data);
      },
    });
  };

  const onAddHandler = async () => {
    setSate((v) => ({
      ...v,
      visible: { name: 'modal', type: 'ADD' },
    }));
  };

  // useEffect(() => {
  //     if (access.canAccessTransferWarehouseItem) {
  //       setAdvanceSearchParams((v) => ({ ...v, transfer_type:'FG' }));
  //       actionRef.current?.reloadAndRest?.();
  //     } else if (access.canAccessTransferProductionItem) {
  //       setAdvanceSearchParams((v) => ({ ...v, transfer_type:'PM/RM' }));
  //       actionRef.current?.reloadAndRest?.();
  //     } else if (access.canAccessAll) {
  //         setAdvanceSearchParams((v) => ({ ...v, transfer_type:'ALL' }));
  //         actionRef.current?.reloadAndRest?.();
  //     } else {
  //       setAdvanceSearchParams((v) => ({ ...v, transfer_type:'none'  }));
  //       actionRef.current?.reloadAndRest?.();
  //     }
  // }, []);

  return (
    <>
      <BreadCrumbCom separator=">" routes={routes} />
      <TableView
        hasCriteria={Object.values(Omit(advanceSearchParams, ['transfer_type'])).some((v) => v)}
        cache
        // displayOnly
        extraFilter={
          <Space size="large">
            {/* {access.canAccessAll ?  */}
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
              <Radio.Button value="ALL">All</Radio.Button>
              <Radio.Button value='pending'>Pending</Radio.Button>
              <Radio.Button value="completed">Completed</Radio.Button>
            </Radio.Group>
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
              <div style={{ width: '100%' }}>
                <Row style={{ alignItems: 'center' }}>
                  <Tabs
                    style={{ marginRight: 20 }}
                    activeKey={activeTab}
                    onChange={handleTabChange}
                    items={[
                      { label: 'Transaction Movement', key: '1' },
                      { label: 'Transaction', key: '2' },
                    ]}
                  />
                  <Col>
                    <Button
                      key="add-button"
                      type="link"
                      icon={<PlusOutlined />}
                      onClick={() => history.push(`/prod/inventory-transfer/create`)}
                    />
                  </Col>
                  <Tooltip title="Dowload Excel File"><Button type="link" icon={<FileExcelOutlined />} onClick={() => setExportModal({ visible: true })} /></Tooltip>
                </Row>
              </div>
            ],
          },
        }}
        columns={[
          {
            key: 'id',
            title: 'ID',
            dataIndex: 'id',
            render: (_, r) => (
              <a onClick={() => onDetailhandler(r)}>PDT-{String(r.id).padStart(6, '0')}</a>
            ),
          },
          {
            key: 'transfer_request',
            title: 'Request ID',
            dataIndex: 'transfer_request',
            render: (_, r) => (
              <>PDR-{String(r.transfer_request).padStart(6, '0')}</>
              // PDT-{String(r.id).padStart(5, '0')}
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
            key: 'from_warehouse',
            title: 'From Warehouse',
            dataIndex: 'from_warehouse',
            render: (_, r) => r.from_warehouse.map((w) => w.whsCode),
          },
          {
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
            key: 'status',
            title: 'Progress',
            render: (_, r) => {
              const totalReceived = r.item.reduce((acc, item) => acc + parseFloat(item.total), 0);
              const totalQuantity = r.item.reduce(
                (acc, item) => acc + parseFloat(item.quantity),
                0,
              );

              const getWholeAndDecimal = (value: number) => {
                const [whole] = String(value).split('.');
                return [Number(whole)];
              };
              const percentageReceived = getWholeAndDecimal(
                (totalReceived / totalQuantity) * 100,
              ).toString();

              return (
                <Flex
                  vertical
                  gap="small"
                  style={{
                    width: 100,
                  }}
                >
                  <Progress
                    percent={parseInt(percentageReceived)}
                    strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }}
                    size="small"
                    status="active"
                  />
                </Flex>
              );
            },
          },
          {
            key: 'status',
            title: 'Status',
            render: (_, r) =>
              r.status === 'completed' ? (
                <Tag color="green" bordered={false}>
                  Completed
                </Tag>
              ) : (
                <Tag color="processing" bordered={false}>
                  Pending
                </Tag>
              ),
            // <Tag color='processing' bordered={false}>Pending</Tag>
          },

          // {
          //     render: (_, r) => (
          //         <>

          //             <Button
          //             onClick={() => onReceivehandler(r)}
          //             // onClick={() => {
          //             //   Modal.confirm({
          //             //     title: 'Confirm Approve',
          //             //     content: 'Are you sure you want to approve?',
          //             //     onOk: async () => {
          //             //       services.status_change({
          //             //         id: r.id,
          //             //         status: "transfer-request-approve"
          //             //       });
          //             //       actionRef.current?.reloadAndRest?.();
          //             //       message.success('success');
          //             //     },
          //             //   });
          //             // }}
          //             >
          //                 Receive
          //             </Button>
          //             {/* <Dropdown
          //       menu={{
          //         items: items(r),
          //         style: {
          //           width: 200,
          //         },
          //       }}
          //     >
          //       <a>
          //         <DashOutlined />
          //       </a>
          //     </Dropdown> */}
          //         </>
          //     ),
          // },
        ]}
        actionHandlers={{
          // onAdvanceSearchClicked: () => setAdvanceSearch({ visible: true }),
          // onRequest: (criteria, pagination, sort) =>
          //   onRequestHandler2({
          //     criteria: {
          //       ...criteria,
          //       advanceSearch: advanceSearchParams,
          //       sort,
          //     },
          //     pagination,
          //   }),
          onRequest: handleRequest,
          onFirstLoad: () =>
            cacheList.fetchDataList('paging-testing').then((v) => {
              if (v) {
                setAdvanceSearchParams({
                  ...v.creteria?.criteria,
                  // status: v.creteria?.criteria?.advanceSearch?.status ?? '',
                  // searchValue:''
                });
                return v.dataList;
              } else {
                return onRequestHandler1({
                  criteria: {
                    advanceSearch: advanceSearchParams,
                  },
                });
              }
            }) as Promise<Paging<Transfer>>,
        }}
      />
      <ModelForm
        open={state.visible?.name === 'modal'}
        onCancel={() => setSate((v) => ({ ...v, visible: undefined }))}
        onSave={onSaveActionHandler}
        close={() => { setSate((v) => ({ ...v, visible: undefined })), actionRef.current?.reloadAndRest?.(); }}
      />
      <DetailView
        open={viewDetail.visible}
        data={viewDetail.data}
        onVisibleChange={(v) => v === false && setViewDetail({ visible: false })}
      />
      <ExportExcel
        title="Export Excel"
        open={exportModel.visible}
        loading={excelLoading}
        type='transfer'
        onCancel={() => setExportModal({ visible: false })}
        onSave={async (duration, line, shift, state, request_type) => {
          const result = {
            line: line,
            shift: shift,
            startDate: dayjs(duration[0]).format('YYYY-MM-DD'),
            endDate: dayjs(duration[1]).format('YYYY-MM-DD'),
            state: state,
            type: 'transfer',
            request_type: request_type || ''
          };
          try {
            setExcelLoading(true)
            await downloadReport(requestActions)({
              fileName: `invantory-transfer-report-${moment().toDate().toDateString()}`,
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