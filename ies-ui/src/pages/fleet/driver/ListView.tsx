import TableView, { TableViewSearchParams } from '@/components/DataCrud/TableView';
import { formatDate } from '@/pages/utils';
import { Paging } from '@/services/API';
import { simpleRequestActions } from '@/services/model';
import { ArrowRightOutlined, DashOutlined, EditOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { ActionType } from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { Badge, Dropdown, message, Modal, Popover, Radio, Space, Spin, Tag } from 'antd';
import moment from 'moment';
import Omit from 'omit.js';
import { ItemType } from 'rc-menu/lib/interface';
import { useRef, useState } from 'react';
import AdvanceFuelSearch from '../components/AdvanceFuelSearch';
import { VehicleServiceAPI } from '../vehicle/service';
import AssignDriverFormModal from './AssignDriverFormModal';
import { DriverCreate, DriverDTO, DriverSearchParam, VehicleDriverCreate } from './data';
import DetailViewDrawer from './DetailViewDrawer';
import DriverModalForm from './DriverFormModal';
import { DriverServiceAPI } from './service';
import { MenuProps } from 'rc-menu';

interface Props {
  onDetail?: (id: number) => void;
  onAdd?: () => void;
  onEdit?: (id: number) => void;
}

export default ({ onDetail, onAdd, onEdit }: Props) => {
  const requestActions = simpleRequestActions();
  const services = DriverServiceAPI(requestActions);
  const [detailOpen, setDetailOpen] = useState<{ open?: boolean; data?: DriverDTO }>({});

  const [state, setSate] = useState<{
    visible?: { name: 'modal'; type: 'ADD' | 'Edit'; payload?: { vehicle: DriverCreate } };
  }>({});
  const [assignState, setAssignState] = useState<{
    visible?: { name: 'modal'; type: 'ADD' | 'Edit'; payload?: { vehicle: DriverDTO } };
  }>({});

  const [advanceSearch, setAdvanceSearch] = useState<{ visible: boolean }>();
  const [advanceSearchParams, setAdvanceSearchParams] = useState<DriverSearchParam>({
    status: 'ALL',
  });

  const actionRef = useRef<ActionType>();
  const cacheList = useModel('dataList');

  const onRequestHandler = async (params: TableViewSearchParams<DriverSearchParam>) => {
    try {
      return services.page(params).then((it) => {
        return cacheList.cacheDataList({
          type: 'fleet-driver',
          criteria: params,
          data: it,
        });
      }) as Promise<Paging<DriverDTO>>;
    } catch (error: any) {
      message.error(error.message);
      return Promise.reject();
    }
  };

  const onSaveActionHandler = (data: DriverCreate) => {
    Modal.confirm({
      title: 'Save Driver Record',
      content: ' are you sure?',
      onOk: async () => {
        const response = (await services.save(data)) as {
          data: string;
          message: string;
        };
        setSate((v) => ({ ...v, visible: undefined }));
        message.success(response.data);
        actionRef.current?.reloadAndRest?.();
      },
    });
  };

  const items = (item: DriverDTO): MenuProps["items"] =>  [
      {
        key: '1',
        label: 'View',
        itemIcon: <ArrowRightOutlined />,
        onClick:()=>setDetailOpen({open:true, data:item})
      },
      {
        key: '2',
        label: 'Assign To Vehicle',
        disabled: item.status !="Active"?true:false,
        itemIcon: <SafetyCertificateOutlined />,
        onClick: async () =>
          setAssignState({ visible: { name: 'modal', type: 'ADD', payload: { vehicle: item } } }),
      },
      {
        key: '3',
        label: 'Edit',
        itemIcon: <EditOutlined />,
        onClick: () =>
          setSate((v) => ({
            ...v,
            visible: { name: 'modal', type: 'ADD', payload: { vehicle: item } },
          })),
      },
    ]
  

  const onAssignDriverSave = (data: VehicleDriverCreate) => {
    Modal.confirm({
      title: `Assign Driver to Vehicle`,
      content: 'are you sure?',
      onOk: async () => {
        const response = (await VehicleServiceAPI(requestActions).saveVehicleDriver(data)) as {
          data: string;
          message: string;
        };
        setAssignState((v) => ({ ...v, visible: undefined }));
        actionRef.current?.reload();
        message.success('SUCCESS SAVED');
      },
    });
  };

  return (
    <>
      <Spin spinning={requestActions.request?.loading}>
        <TableView<DriverDTO, { searchValue?: string; advanceSearch: DriverSearchParam }>
          hasCriteria={Object.values(Omit(advanceSearchParams, ['status'])).some((v) => v)}
          cache
          displayOnly
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
                <Radio.Button value="ALL" style={{ borderRadius: 5 }}>
                  All
                </Radio.Button>
                <Badge offset={[-20, 0]} count={0}>
                  <Radio.Button value="Active">Active</Radio.Button>
                </Badge>
                <Badge size="small" offset={[-20, 0]} count={0}>
                  <Radio.Button value="Inactive">Inactive</Radio.Button>
                </Badge>
              </Radio.Group>
            </Space>
          }
          columns={[
            {
              key: 'name',
              title: 'Full Name',
              render: (_, r) => [r.firstName, r.lastName].filter((it) => it).join(' '),
            },
            {
              key: 'License',
              title: 'License Number',
              dataIndex: 'driverLicense',
            },
            {
              key: 'employeeNumber',
              title: 'Employee Number',
              dataIndex: 'employeeNumber',
            },
            {
              key: 'phone',
              title: 'Phone',
              dataIndex: 'phone',
            },
            {
              key: 'vehicle',
              title: 'Vehicle',
              render: (_, r) => r.vehicle?.plateNumber,
            },
            {
              key: 'type',
              title: 'Assign Type',
              render: (_, r) => (
                <>
                  {r.vehicleDriver ? (
                    <>
                      <span style={{ fontSize: 12, color: 'green' }}>
                        {r.vehicleDriver?.driverType}
                      </span>
                      <br />
                      {r.vehicleDriver.endDate ? (
                        <span style={{ fontSize: 12, color: 'red' }}>
                          <Popover
                            content={
                              <>
                                <p>Start Date: {formatDate(r.vehicleDriver.startDate)}</p>
                                <p>End Date: {formatDate(r.vehicleDriver.endDate)}</p>
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
              ),
            },

            {
              key: 'createdBy',
              title: 'Created By',
              dataIndex: 'createdBy',
            },
            {
              key: 'status',
              title: 'Status',
              render: (_, r) =>
                r.status === 'Active' ? (
                  <Tag color="green">{r.status}</Tag>
                ) : (
                  <Tag color="red">{r.status}</Tag>
                ),
            },
            {
              key: 'action',
              title: 'Activity',
              render: (_, r) => (
                <>
                  <Dropdown
                    menu={{
                      items:items(r),
                      style: { width: 200 },
                    }}
                  >
                    <a onClick={(e) => e.preventDefault()}>
                      <DashOutlined />
                    </a>
                  </Dropdown>
                </>
              ),
            },
          ]}
          tableProps={{
            actionRef: actionRef,
          }}
          // advanceSearch
          actionHandlers={{
            // onAdd: () => onAddHandler(),
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
              }) as Promise<Paging<DriverDTO>>,
          }}
        />
      </Spin>

      <DriverModalForm
        open={state.visible?.name == 'modal'}
        onCancel={() => setSate((v) => ({ ...v, visible: undefined }))}
        onSave={onSaveActionHandler}
        data={state.visible?.payload?.vehicle}
      />

      <DetailViewDrawer
        onClose={() => setDetailOpen({ open: false })}
        open={detailOpen?.open}
        data={detailOpen.data}
      />

      {/* <AdvanceFuelSearch
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
      /> */}

      <AssignDriverFormModal
        defualtData={assignState.visible?.payload?.vehicle}
        open={assignState.visible?.name === 'modal'}
        modalProps={{
          onCancel: () => setAssignState((v) => ({ ...v, visible: undefined })),
          okText: 'Submit',
        }}
        onSave={onAssignDriverSave}
      />
    </>
  );
};
