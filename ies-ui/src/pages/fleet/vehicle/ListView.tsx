import TableView, { TableViewSearchParams } from '@/components/DataCrud/TableView';
import { Paging } from '@/services/API';
import { simpleRequestActions } from '@/services/model';
import {
  AimOutlined,
  ArrowRightOutlined,
  CiCircleOutlined,
  CloseCircleOutlined,
  DashOutlined,
  DashboardOutlined,
  EditOutlined,
  ExportOutlined,
  SafetyCertificateOutlined,
  StrikethroughOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import type { ActionType } from '@ant-design/pro-table';
import { history, useModel } from '@umijs/max';
import { Badge, Button, Dropdown, MenuProps, message, Modal, Popover, Radio, Space, Tag, Tooltip } from 'antd';
import Omit from 'omit.js';
import { useRef, useState } from 'react';
import AdvanceVehicleSearch from '../components/AdvanceVehicleSearch';
import AssignDriverFormModal from '../driver/AssignDriverFormModal';
import { DriverDTO, VehicleDriverCreate, VehicleDriverDTO } from '../driver/data';
import { VehicleAdvanSearch as VehicleAdvanceSearch, VehicleListItem } from './data';
import { VehicleServiceAPI } from './service';
import { formatDate } from '@/pages/utils';
import moment from 'moment';
import OdometerIssue from './OdometerIssue';
import TireAssigntoVehicleModal from '../tires/AssignTireVehicle';
import { TireAssignCreate } from '../specification/data';
import { SpecificationServiceAPI } from '../specification/service';
import { PageContainer } from '@ant-design/pro-components';

interface Props {
  onDetail?: (id: string) => void;
  onAdd?: () => void;
  onEdit?: (id: string) => void;
}

export default ({ onDetail, onAdd, onEdit }: Props) => {
  const requestActions = simpleRequestActions();
  const services = VehicleServiceAPI(requestActions);
  const [odometerIssue, setOdometerIssue] = useState<{
    visible?: {
      name: "MODAL",
      type: "ADD" | "EDIT",
      payload?: VehicleListItem
    }
  }>();
  const [tireState, setTireState] = useState<{
    visible?: {
      name: "MODAL",
      type: "ADD" | "EDIT";
      payload?: VehicleListItem;
    }
  }>();
  const [advanceSearch, setAdvanceSearch] = useState<{ visible: boolean }>();
  const [advanceSearchParams, setAdvanceSearchParams] = useState<VehicleAdvanceSearch>({
    status: 'ALL',
  });

  const [assignState, setAssignState] = useState<{
    visible?: {
      name: 'modal';
      type: 'ADD' | 'Edit';
      vehicleId?: VehicleListItem;
      driver?: DriverDTO,
      vehicleDriver?: VehicleDriverDTO
    };
  }>({});

  const cacheList = useModel('dataList');
  const onRequestHandler = async (params: TableViewSearchParams<VehicleAdvanceSearch>) => {
    try {
      return services.pageVehicle(params).then((it) => {
        return cacheList.cacheDataList({
          type: 'fleet-vehicle',
          criteria: params,
          data: it,
        });
      }) as Promise<Paging<VehicleListItem>>;
    } catch (error: any) {
      message.error(error.message);
      return Promise.reject();
    }
  };
  const actionRef = useRef<ActionType>();
  const onStatusChange = (id: string, status: string) => {
    Modal.confirm({
      title: ` Vehicle Change to ${status}`,
      content: 'Are you sure? This status will affect action with the vehicle',
      onOk: async () => {
        await services.status({
          id: id,
          status: status,
        });
        message.success('Success');
        actionRef.current?.reloadAndRest?.();
      },
    });
  }
  const getMenuItems = (item: VehicleListItem): MenuProps["items"] => {
    return [
      {
        key: 1,
        label: 'View',
        itemIcon: <ArrowRightOutlined />,
        onClick: async () => onDetail?.(item.id),
      },
      {
        key: 2,
        label: 'Edit',
        itemIcon: <EditOutlined />,
        onClick: async () => onEdit?.(item.id),
      },
      {
        key: 3,
        label: 'Assign Operator',
        disabled: item.status != "Active" ? true : false,
        itemIcon: <SafetyCertificateOutlined />,
        onClick: () => {
          setAssignState({ visible: { name: 'modal', type: 'ADD', vehicleId: item, driver: item?.driver, vehicleDriver: item.vehicleDriver } });
        },
      },
      {
        key: "odometer",
        label: 'Odometer Issue',
        itemIcon: <DashboardOutlined />,
        onClick: () => setOdometerIssue({ visible: { name: 'MODAL', type: 'EDIT', payload: item } })
      },
      {
        key: "tire",
        label: 'Assign Tires',
        itemIcon: <AimOutlined />,
        onClick: () => setTireState({ visible: { name: 'MODAL', type: 'EDIT', payload: item } })
      },
      {
        type: 'divider',
      },
      {
        type: "group",
        label: `Current Status is ${item.status}`,
        children: [
          {
            key: "1_1",
            label: "Active",
            itemIcon: <CiCircleOutlined />,
            onClick: () => onStatusChange(item.id, "Active")
          },
          {
            key: "1_2",
            label: "Sold Out",

            itemIcon: <StrikethroughOutlined />,
            onClick: () => onStatusChange(item.id, "Sold Out")
          },
          {
            key: "1_3",
            label: "Inactive",
            danger: true,
            itemIcon: <CloseCircleOutlined />,
            onClick: () => onStatusChange(item.id, "Inactive")
          },
        ]
      },
    ];
  };
  return (
    <>
      <PageContainer
        title="Vehicles"
        ghost
        onBack={() => history.push("/fleet")}
        style={{
          margin: "-30px -40px 0",
        }}
        fixedHeader
      />
      <>
        <TableView<VehicleListItem, { searchValue?: string; advanceSearch: VehicleAdvanceSearch }>
          hasCriteria={Object.values(Omit(advanceSearchParams, ['status'])).some((v) => v)}
          cache
          columns={[
            {
              title: 'No',
              render: (_, r, index) => index + 1,
            },
            {
              title: 'Plate Number',
              dataIndex: 'plateNumber',
              sorter: 'plateNumber',
              render: (_, r) => {
                return (
                  <>
                    <Button icon={<ExportOutlined />} type='link' onClick={() => window.open(`/external/fleet/vehicle/detail/${r.id}`)?.focus()} size='small' />
                    <Button type="link" onClick={() => onDetail?.(r.id)}>
                      {r.plateNumber}
                    </Button>
                  </>
                );
              },
            },
            {
              title: 'Models',
              sorter: 'model',
              dataIndex: 'model',
            },
            {
              title: 'Brand',
              sorter: 'make',
              render: (_, r) => r.make.name,
            },
            {
              title: 'Year',
              dataIndex: 'year',
              sorter: 'year',
            },
            {
              title: 'Weight',
              dataIndex: 'weight',
              sorter: 'weight',
              render: (_, r) => r.weight.name,
            },
            {
              title: 'Status',
              dataIndex: 'status',
              sorter: 'status',
              render: (_, r) => (
                <Badge
                  status={
                    r.status == 'Active' ? 'processing' : r.status == 'Inactive' ? 'error' : 'warning'
                  }
                  text={r.status}
                />
              ),
            },
            {
              title: 'Branding Type',
              sorter: 'brandingType',
              render: (_, r) => (r.brandingType ? r.brandingType.name : '-'),
            },
            {
              title: 'Odometer',
              sorter: 'odometer',
              render: (_, r) => (
                <Tag color="gold" bordered={false}>{[r.currentMeter?.meterValue].join(' ').concat("km")}</Tag>
              ),
            },
            {
              title: 'Operator',
              render: (_, r) => <>
                {r.driver ? [r.driver.firstName, r.driver.lastName].filter((it) => it).join(' ') : '-'}<br />
                <>
                  {r.vehicleDriver ? (
                    <>
                      {r.vehicleDriver?.endDate ? (
                        <span style={{ fontSize: 12, color: 'red' }}>
                          <Popover
                            content={
                              <>
                                <p>Start: {formatDate(r.vehicleDriver?.startDate)}</p>
                                <p>End: {formatDate(r.vehicleDriver?.endDate)}</p>
                              </>
                            }
                          >
                            {' '}
                            duration: {moment(r.vehicleDriver?.endDate).fromNow()}
                          </Popover>
                        </span>
                      ) : (
                        ''
                      )}
                    </>
                  ) : (
                    ''
                  )}
                </>
              </>
            },
            {
              key: 'action',
              title: 'Action',
              render: (_, r) => (
                <>
                  <Space>
                    <Dropdown
                      menu={{
                        items: getMenuItems(r),
                        style: { width: 200 },
                      }}
                    >
                      <a onClick={(e) => e.preventDefault()}>
                        <DashOutlined />
                      </a>
                    </Dropdown>
                    {(!r.vehicleDriver || !r.normFuelConsumption) && <Tooltip
                      title={
                        <>
                          {!r.vehicleDriver && <p>- Currently, this truck has no operator.</p>}
                          {!r.normFuelConsumption && <p>- Please set up norm consumption to control the average tank refile.</p>}
                        </>
                      }
                    >
                      <WarningOutlined style={{ color: "#faad14" }} />
                    </Tooltip>}
                  </Space>
                </>
              ),
            },
          ]}
          advanceSearch
          tableProps={{
            actionRef: actionRef,
          }}
          actionHandlers={{
            onAdd: () => onAdd?.(),
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
              cacheList.fetchDataList('fleet-vehicle').then((v) => {
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
              }) as Promise<Paging<VehicleListItem>>,
          }}
          extraFilter={
            <Space size="small">
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
                <Radio.Button value="Active">Active</Radio.Button>
                <Radio.Button value="Inactive">Inactive</Radio.Button>
                <Radio.Button value="Sold Out">Sold Out</Radio.Button>
                <Radio.Button value="Out Off Service">Out of Service</Radio.Button>
              </Radio.Group>
            </Space>
          }
        />
        <AdvanceVehicleSearch
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
        <AssignDriverFormModal
          open={assignState.visible?.name === 'modal'}
          vehicleId={assignState.visible?.vehicleId}
          vehicleDriver={assignState.visible?.vehicleDriver}
          modalProps={{
            onCancel: () => setAssignState((v) => ({ ...v, visible: undefined })),
            okText: 'Submit',
          }}
          onSave={(data: VehicleDriverCreate) => {
            Modal.confirm({
              title: `Assign Operator to Vehicle`,
              content: 'are you sure?',
              onOk: async () => {
                const response = (await services.saveVehicleDriver(data)) as {
                  data: string;
                  message: string;
                };
                setAssignState((v) => ({ ...v, visible: undefined }));
                actionRef.current?.reloadAndRest?.();
                message.success('SUCCESS SAVED');
              },
            });
          }}
        />
        <OdometerIssue
          open={odometerIssue?.visible?.name === "MODAL"}
          onCancel={() => setOdometerIssue({ visible: undefined })}
          data={odometerIssue?.visible?.payload}
          onSave={(data: { vId?: string; odometer: number; reason?: string }) => {
            Modal.confirm({
              title: "Change Odometer",
              content: "Are you sure? This odometer will be set as a current meter!",
              onOk: async () => {
                await services.changeOdometer(data);
                actionRef.current?.reload?.();
                setOdometerIssue({ visible: undefined });
              }
            })
          }}
        />
        <TireAssigntoVehicleModal
          open={tireState?.visible?.name === "MODAL"}
          onCancel={() => setTireState((v) => ({ ...v, visible: undefined }))}
          vehicleId={tireState?.visible?.payload?.id}
          onSave={(data: TireAssignCreate) => {
            Modal.confirm({
              title: "Save tire for vehicle",
              content: "Are you sure the record you entered is correct?",
              onOk: async () => {
                SpecificationServiceAPI(requestActions).saveVehicleTire(data);
                setTireState({ visible: undefined });
              }
            })
          }}
        />
      </>
    </>
  );
};

