import TableView, { TableViewSearchParams } from '@/components/DataCrud/TableView';
import { formatDate, formatter } from '@/pages/utils';
import { Paging } from '@/services/API';
import { simpleRequestActions } from '@/services/model';
import { CopyOutlined, DashOutlined, ExportOutlined, IssuesCloseOutlined, StopOutlined } from '@ant-design/icons';
import { ActionType, PageContainer } from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { Badge, Button, Dropdown, MenuProps, message, Radio, Space, Tag, Tooltip } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import moment from 'moment';
import Omit from 'omit.js';
import { useRef, useState } from 'react';
import { FuelAvanceSearchParam } from '../fuel/data';
import AdvanceSearch from './AdvanceSearch';
import { MaintenaceAdvanceSearch, MaintenanceStatus, MaintenneceDTO } from './data';
import MaintenanceModalForm from './EntityFormModal';
import ForceModal from './ForceModal';
import { MaintenanceServiceAPI } from './service';

interface Props {
  onDetail?: (id: string) => void;
  onAdd?: () => void;
  onEdit?: (id: number) => void;
}

export default ({ onDetail }: Props) => {
  const requestActions = simpleRequestActions();
  const services = MaintenanceServiceAPI(requestActions);
  const [form] = useForm();

  const [state, setSate] = useState<{
    visible?: { name: 'modal'; type: 'ADD' | 'Edit'; payload?: { vehicle: MaintenneceDTO } };
  }>({});

  const [forcCompleteState, setForcCompleteState] = useState<{
    visible?: { name: 'modal'; type: 'ADD' | 'Edit'; payload: MaintenneceDTO };
  }>({});

  const [advanceSearch, setAdvanceSearch] = useState<{ visible: boolean }>();
  const [advanceSearchParams, setAdvanceSearchParams] = useState<FuelAvanceSearchParam>({
    status: 'ALL',
  });

  const actionRef = useRef<ActionType>();
  const cacheList = useModel('dataList');
  const onRequestHandler = async (params: TableViewSearchParams<MaintenaceAdvanceSearch>) => {
    try {
      return services.page(params).then((it) => {
        return cacheList.cacheDataList({
          type: 'fleet-maintenance',
          criteria: params,
          data: it,
        });
      }) as Promise<Paging<MaintenneceDTO>>;
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
  const getMenuItems = (item: MaintenneceDTO): MenuProps["items"] => {
    return [
      {
        key: '1',
        label: 'Copy add new',
        disabled: item.status === 'void' ? true : false,
        itemIcon: <CopyOutlined />,
        onClick: async () => {
          setSate((v) => ({
            ...v,
            visible: { name: 'modal', type: 'Edit', payload: { vehicle: item } },
          }));
        },
      },
      {
        type: "divider"
      },
      {
        label: item.status === 'Void' ? 'Unvoid' : 'Void',
        key: '3',
        danger: item.status === 'Void' ? false : true,
        style: { color: item.status === 'Void' ? 'green' : 'red' },
        itemIcon: item.status === 'Void' ? <IssuesCloseOutlined /> : <StopOutlined />,
        onClick: () => {
          setForcCompleteState({ visible: { name: 'modal', type: 'ADD', payload: item } });
        },
      },
    ];
  };
  const durationDate = (r: MaintenneceDTO) => {
    if (r.formDate && r.toDate !== null) {
      const start = moment(r.formDate);
      const end = moment(r.toDate);
      return moment.duration(start.diff(end)).humanize();
    }
    return '';
  };

  return (

      <PageContainer
        title={"Maintenances"}
        
      >
        <TableView<MaintenneceDTO, { searchValue?: string }>
          hasCriteria={Object.values(Omit(advanceSearchParams, ['status'])).some((v) => v)}
          cache
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

                <Badge size="small" offset={[-20, 0]} count={0}>
                  <Radio.Button value="Void">Void</Radio.Button>
                </Badge>
              </Radio.Group>
            </Space>
          }
          columns={[
            {
              key: 'Date',
              title: 'Date',
              dataIndex: 'createdDate',
              sorter: 'createdDate',
              valueType: 'date',
              render: (_, r) => (
                <>
                  <Button icon={<ExportOutlined />} size='small' type='link' onClick={() => window.open(`/external/fleet/maintenance/detail/${r.id}`)?.focus()} />
                  <Button
                    type="link"
                    onClick={() => {
                      onDetail?.(r.id);
                    }}
                  >
                    {formatDate(r.createdDate)}
                  </Button>
                </>
              ),
            },
            {
              key: 'vehicle',
              title: 'Truck Number',
              dataIndex: 'vehiclePlate',
              sorter: 'vehiclePlate',
              render: (_, r) => [r.vehicle?.plateNumber].filter((it) => it).join('-'),
            },
            {
              key: 'durationDate',
              title: 'Duration Date',
              render: (_, r) => (
                <Tooltip
                  title={
                    <>
                      <span>{moment(r.formDate).format('YYYY-MM-DD HH:mm:ss')}</span><br />
                      <span>{moment(r.toDate).format('YYYY-MM-DD HH:mm:ss')}</span>
                    </>
                  }
                  color={'blue'}
                >
                  {durationDate(r) || '-'}
                </Tooltip>
              ),
            },
            {
              key: 'vendorname',
              title: 'Vendor Name',
              dataIndex: 'vendorName',
              sorter: 'vendorName',
              render: (_, r) => r.vendorName?.name,
            },
            {
              key: 'item',
              title: 'Item',
              dataIndex: 'itemCount',
            },
            {
              key: 'totalCost',
              title: 'Cost',
              dataIndex: 'totalCost',
              sorter: 'totalCost',
              render: (_, r) => formatter.format(r.totalCost),
            },
            {
              key: 'odometer',
              sorter: 'odometer',
              title: 'Odometer',
              render: (_, r) => [r.odometer?.toFixed(2), 'km'].filter((it) => it).join(' '),
            },
            {
              key: 'status',
              sorter: 'status',
              title: 'Status',
              render: (_, r) => (
                <Tag color={r.status == 'Void' ? 'error' : r.status === 'Open' ? 'green' : 'cyan'}>
                  {r.status}
                </Tag>
              ),
            },
            {
              key: 'by',
              title: 'Created by',
              dataIndex: 'createdBy',
            },
            {
              key: 'action',
              title: 'Action',
              render: (_, r) => (
                <>
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
                </>
              ),
            },
          ]}
          tableProps={{
            actionRef: actionRef,
          }}
          advanceSearch
          actionHandlers={{
            onAdd: onAddHandler,
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
              cacheList.fetchDataList('fleet-maintenance').then((v) => {
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
              }) as Promise<Paging<MaintenneceDTO>>,
          }}
        />

        <AdvanceSearch
          title="Advance Search"
          closable
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
        <MaintenanceModalForm
          open={state.visible?.name === 'modal'}
          onCancel={() => setSate((v) => ({ ...v, visible: undefined }))}
          dataEntry={state.visible?.payload?.vehicle}
        />
        <ForceModal
          open={forcCompleteState.visible?.name === 'modal'}
          onSave={async (data: MaintenanceStatus) => {
            const res = (await services.status(data)) as {
              data: string;
              message: string;
            };
            actionRef.current?.reloadAndRest?.();
            message.success(res.message);
            setForcCompleteState((v) => ({ ...v, visible: undefined }));
          }}
          modalProps={{
            onCancel: () => setForcCompleteState((v) => ({ ...v, visible: undefined })),
          }}
          data={forcCompleteState.visible?.payload}
        />
      </PageContainer>


  );
};



