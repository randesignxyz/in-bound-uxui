import TableView, { TableViewSearchParams } from '@/components/DataCrud/TableView';
import { Paging } from '@/services/API';
import { downloadReport } from '@/services/apiGateway';
import { simpleRequestActions } from '@/services/model';
import {
  ArrowRightOutlined,
  BlockOutlined,
  ClockCircleOutlined,
  CloudDownloadOutlined,
  DashOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import type { ActionType } from '@ant-design/pro-table';
import { useModel } from '@umijs/max';
import {
  Badge,
  Button,
  Dropdown,
  MenuProps,
  message,
  Modal,
  Radio,
  Space,
  Spin,
  Tag,
  Tooltip,
} from 'antd';
import moment from 'moment';
import Omit from 'omit.js';
import { useRef, useState } from 'react';
import { FleetPaths } from '..';
import { DieselMonthlyReportParams, FuelAvanceSearchParam, FuelCreate, FuelDTO } from './data';
import DetailViewDrawer from './DetailViewDrawer';
import FuelModalForm from './FuelFormModal';
import { FuelServiceAPI } from './service';
import FuelExportModal from '../report/component/FuelExportModal';
import AdvanceFuelSearch from '../components/AdvanceFuelSearch';
import { PageContainer } from '@ant-design/pro-components';
import { formatDate, formatDateTime } from '@/pages/utils';

interface Props {
  onDetail?: (id: number) => void;
  onAdd?: () => void;
  onEdit?: (id: number) => void;
}

export default ({ onDetail, onAdd, onEdit }: Props) => {
  const requestActions = simpleRequestActions();
  const services = FuelServiceAPI(requestActions);

  const [state, setSate] = useState<{
    visible?: { name: 'modal'; type: 'ADD' | 'Edit'; payload?: { vehicle: FuelDTO } };
  }>({});

  const [detailState, setDetailSate] = useState<{
    visible?: { open: Boolean; record: FuelDTO };
  }>({});

  const [exportState, setExportState] = useState<{
    visible?: { name: 'modal' };
  }>();
  const [advanceSearch, setAdvanceSearch] = useState<{ visible: boolean }>();
  const [advanceSearchParams, setAdvanceSearchParams] = useState<FuelAvanceSearchParam>({
    status: 'ALL',
  });

  const actionRef = useRef<ActionType>();

  const routes = [
    {
      path: FleetPaths.fleet,
      label: 'Fleet',
    },
    {
      path: '',
      label: 'Fuel',
    },
  ];

  const downloadFuelDoc = async (param: DieselMonthlyReportParams) => {
    try {
      await downloadReport(requestActions)({
        fileName: 'monthly-diesel',
        reportName: 'fleet-diesel-monthly-report',
        data: param,
        type: 'EXCEL',
      });
    } catch (error) {
      message.error('Failed to download.');
    }
  };
  const cacheList = useModel('dataList');
  const onRequestHandler = async (params: TableViewSearchParams<FuelAvanceSearchParam>) => {
    try {
      return services.page(params).then((it) => {
        return cacheList.cacheDataList({
          type: 'fleet-fuel',
          criteria: params,
          data: it,
        });
      }) as Promise<Paging<FuelDTO>>;
    } catch (error: any) {
      message.error(error.message);
      return Promise.reject();
    }
  };
  const onAddHandler = async () => {
    setSate((v) => ({
      ...v,
      visible: { name: 'modal', type: 'ADD' },
    }));
  };
  const onSaveActionHandler = (data: FuelCreate) => {
    Modal.confirm({
      title: 'Save Fuel Consumption record',
      content: 'are you sure',
      onOk: async () => {
        const response = (await services.save(data)) as {
          data: string;
          message: string;
        };
        setSate((v) => ({ ...v, visible: undefined }));
        actionRef.current?.reloadAndRest?.();
        message.success(response.data);
      },
    });
  };
  const items = (row: FuelDTO): MenuProps['items'] => [
    {
      key: '1',
      label: 'View',
      itemIcon: <ArrowRightOutlined />,
      onClick: () => {
        setDetailSate({ visible: { open: true, record: row } });
      },
    },
    {
      key: '2',
      label: row.status == 'void' ? 'Unvoid' : 'Void',
      itemIcon: <BlockOutlined />,
      style: { color: row.status == 'void' ? '' : 'red' },
      disabled: moment(row.createdDate).isBefore(moment(), 'month'),
      onClick: () => {
        Modal.confirm({
          title: 'Confirm Fuel Entry Void',
          content: 'Are you sure you want to void this fuel entry?',
          onOk: async () => {
            const entry = {
              ...row,
              status: row.status == 'void' ? '' : 'void',
            };
            await services.void(entry);
            message.success('success!');
            actionRef.current?.reload();
          },
        });
      },
    },
    {
      key: '3',
      label: 'Edit',
      itemIcon: <EditOutlined />,
      disabled: moment(row.createdDate).isBefore(moment(), 'month'),
      onClick: () => {
        setSate({ visible: { name: 'modal', type: 'Edit', payload: { vehicle: row } } });
      },
    },
    {
      type: 'divider',
    },
    {
      key: '4',
      label: 'Delete',
      disabled: moment(row.createdDate).isBefore(moment(), 'month'),
      itemIcon: <DeleteOutlined />,
      danger: true,
      onClick: () => {
        Modal.confirm({
          title: 'Confirm Fuel Entry Deletion',
          content:
            'Are you sure you want to delete this Fuel Entry? All data will be lost forever.',
          onOk: async () => {
            await services.delete(row);
            message.success('Fuel Entry was successfully deleted');
            actionRef.current?.reload();
          },
        });
      },
    },
  ];
  return (
    <>
      <PageContainer
        title="Fuel Lists"
      >
      <Spin spinning={requestActions.request?.loading || false}>
        <TableView
          hasCriteria={Object.values(Omit(advanceSearchParams, ['status'])).some((v) => v)}
          cache
          extraFilter={
            <Space size="large">
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
                <Radio.Button value="ALL" >
                  All
                </Radio.Button>
                <Radio.Button value="void" >
                  Void
                </Radio.Button>
                <Badge offset={[-20, 0]} count={0}></Badge>
              </Radio.Group>
            </Space>
          }
          columns={[
            {
              key: 'refilledDate',
              title: 'Date',
              valueType: 'date',
              dataIndex: 'refilledDate',
              sorter: 'refilledDate',
              render:(_,r)=><Button type='link' onClick={()=>setDetailSate({ visible: { open: true, record: r } })}>{formatDate(r.refilledDate)}</Button>
            },
            {
              key: 'plateNumber',
              title: 'Truck Number',
              dataIndex: 'plateNumber',
              sorter: 'plateNumber',
            },
            {
              key: 'driverName',
              title: 'Driver',
              sorter: 'driverName',
              dataIndex: 'driverName',
            },

            {
              key: 'pumpBy',
              title: 'Pump By',
              dataIndex: 'pumpBy',
              sorter: 'pumpBy',
            },
            {
              key: 'quantity',
              title: 'Quantity(L)',
              dataIndex: 'quantity',
              sorter: 'quantity',
              render: (_, r) => <Tag color="green">{r.quantity?.toFixed(2)} L</Tag>,
            },
            {
              key: 'kilometer',
              title: 'Odometer',
              sorter: 'kilometer',
              render: (_, r) => <Tag color="blue">{r.kilometer?.toFixed(2)} km</Tag>,
            },
            {
              key: 'reciept',
              title: 'Tank Station',
              sorter: 'gasStation',
              render: (_, r) => r.gasStation?.tankName,
            },
            {
              key: 'type',
              title: 'Type',
              sorter: 'gasType',
              render: (_, r) => r.gasType?.name,
            },
            {
              key: 'Consumption Rate',
              title: 'Consumption Rate',
              render: (_, r) => {
                const rating = (r.quantity / r.numberKilometer) * 100 - r.previousRate?.usageRate;
                return r.gasType?.id != 1063?(
                  <Space>
                    <span
                      style={{
                        color:
                          rating > 2
                            ? 'red'
                            : (rating < 2 || rating == 2) && rating > 0
                            ? '#f5dc2c'
                            : '',
                      }}
                    >
                      {r.numberKilometer && rating?.toFixed(2)}
                    </span>
                    {r.numberKilometer && (
                      <Tooltip
                        color={
                          rating > 2
                            ? 'red'
                            : (rating < 2 || rating == 2) && rating > 0
                            ? '#f5dc2c'
                            : ''
                        }
                        title={
                          <>
                            <span>
                              Usage rate = {((r.quantity / r.numberKilometer) * 100)?.toFixed(2)}
                            </span>
                            <br />
                            <span>
                              Norm consumption rate = {r.previousRate?.usageRate?.toFixed(2)}
                            </span>
                            <br />
                            <span>Rate = {rating?.toFixed(2)}</span>
                          </>
                        }
                      >
                        <ClockCircleOutlined
                          style={{
                            color:
                              rating > 2
                                ? 'red'
                                : (rating < 2 || rating == 2) && rating > 0
                                ? '#f5dc2c'
                                : '',
                          }}
                        />
                      </Tooltip>
                    )}
                  </Space>
                ):<></>;
              },
            },
            {
              key: 'action',
              title: 'Action',
              render: (_, r) => (
                <>
                  <Dropdown
                    menu={{
                      items: items(r),
                      style: { width: 200 },
                    }}
                  >
                    <Space>
                      <a>
                        <DashOutlined />{' '}
                      </a>
                      {r.status && (
                        <Tag bordered={false} color="error">
                          {r.status}
                        </Tag>
                      )}
                    </Space>
                  </Dropdown>
                </>
              ),
            },
          ]}
          tableProps={{
            actionRef: actionRef,
            toolbar: {
              actions: [
                <Button
                  type="link"
                  icon={<CloudDownloadOutlined />}
                  onClick={() => setExportState({ visible: { name: 'modal' } })}
                >
                  Export
                </Button>,
                <Button type="link" icon={<PlusOutlined />} onClick={() => onAddHandler()} />,
              ],
            },
          }}
          advanceSearch
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
              cacheList.fetchDataList('retailer-customer').then((v) => {
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
              }) as Promise<Paging<FuelDTO>>,
          }}
        />
      </Spin>
      </PageContainer>
      <FuelModalForm
        open={state.visible?.name == 'modal'}
        onCancel={() => setSate((v) => ({ ...v, visible: undefined }))}
        onSave={onSaveActionHandler}
        data={state.visible?.payload?.vehicle}
      />
      <DetailViewDrawer
        open={detailState.visible?.open == true}
        onClose={() => setDetailSate((v) => ({ ...v, visible: undefined }))}
        data={detailState.visible?.record}
      />
       <FuelExportModal
        open={exportState?.visible?.name === 'modal'}
        modalProps={{
          onCancel: () => setExportState((v) => ({ ...v, visible: undefined })),
          bodyStyle: {
            border: '1px lightgray solid',
            borderRadius: 5,
            padding: 10,
          },
          okText: 'Submit',
        }}
        onSubmitExport={downloadFuelDoc}
      />
      <AdvanceFuelSearch
        title="Advance Fuel Search"
        placement="right"
        initData={advanceSearchParams}
        open={advanceSearch?.visible}
        onClose={() => setAdvanceSearch({visible:false})}
        onReset={() => {
          actionRef.current?.reloadAndRest?.();
        }}
        onSearch={(data) => {
          setAdvanceSearchParams(data);
          actionRef.current?.reloadAndRest?.();
        }}
      />
    </>
  );
};
