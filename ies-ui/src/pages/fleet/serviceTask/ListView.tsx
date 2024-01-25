import TableView, { TableViewSearchParams } from '@/components/DataCrud/TableView';
import BreadCrumbCom from '@/pages/sale/retailer/components/BreadCrumbCom';
import { Paging } from '@/services/API';
import { simpleRequestActions } from '@/services/model';
import { DashOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import type { ActionType } from '@ant-design/pro-table';
import { history, useModel } from '@umijs/max';
import { Badge, Dropdown, MenuProps, message, Modal, Radio, Space } from 'antd';
import Omit from 'omit.js';
import { useRef, useState } from 'react';
import { FleetPaths } from '..';
import { ServiceTasksCreate, ServiceTasksDTO, ServiceTasksSearch } from './data';
import ServiceTasksModalForm from './EntryFormModel';
import { ServiceTasksServiceAPI } from './service';
import { PageContainer } from '@ant-design/pro-components';

interface Props {
  onDetail?: (id: string) => void;
  onAdd?: () => void;
  onEdit?: (id: string) => void;
}

export default ({ onDetail, onAdd, onEdit }: Props) => {
  const requestActions = simpleRequestActions();
  const services = ServiceTasksServiceAPI(requestActions);
  const [state, setSate] = useState<{
    visible?: { name: 'modal'; type: 'ADD' | 'Edit'; payload?: { vehicle: ServiceTasksDTO } };
  }>({});

  const [advanceSearch, setAdvanceSearch] = useState<{ visible: boolean }>();
  const [advanceSearchParams, setAdvanceSearchParams] = useState<ServiceTasksSearch>({
    status: 'ALL',
  });

  const cacheList = useModel('dataList');

  const onRequestHandler = async (params: TableViewSearchParams<{ searchValue?: string }>) => {
    try {
      return services.page(params).then((it) => {
        return cacheList.cacheDataList({
          type: 'fleet-service-task',
          criteria: params,
          data: it,
        });
      }) as Promise<Paging<ServiceTasksDTO>>;
    } catch (error: any) {
      message.error(error.message);
      return Promise.reject();
    }
  };

  const actionRef = useRef<ActionType>();

  const onAddHandler = async () => {
    setSate((v) => ({
      ...v,
      visible: { name: 'modal', type: 'ADD' },
    }));
  };

  const routes = [
    {
      path: FleetPaths.fleet,
      label: 'Fleet',
    },
    {
      path: '',
      label: 'Service Tasks',
    },
  ];

  const onSaveHandler = (data: ServiceTasksCreate) => {
    Modal.confirm({
      title: 'Save Service Task',
      content: ' are you sure?',
      onOk: async () => {
        const response = (await services.save(data)) as {
          data: string;
          message: string;
        };
        setSate((v) => ({ ...v, visible: undefined }));
        actionRef.current?.reloadAndRest?.();
        message.success(response.message);
      },
    });
  };

  const items = (items:ServiceTasksDTO):MenuProps["items"]  => [
    {
      key:1,
      label:"Edit",
      itemIcon:<EditOutlined/>
    },
    {
      key:2,
      label:items.status==="Active"?"Inactive":"Active",
      itemIcon:<EyeOutlined/>,
    
      onClick:()=>{
          Modal.confirm({
            title:`change status to ${items.status==="Active"?"Inactive":"Active"}`,
            content:"are you sure",
            onOk:async()=>{
              await services.status({
                id:items.id,
                status:items.status==="Active"?"Inactive":"Active"
              });
              message.success("success");
              actionRef.current?.reloadAndRest?.();
            }
          })
      }
    },
    {
      type:"divider"
    },
    // {
    //   key:3,
    //   label:"Delete",
    //   itemIcon:<DeleteOutlined/>,
    //   danger: true,
    // },
  ]

  return (
    <>
      {/* <BreadCrumbCom separator=">" routes={routes} /> */}
     <PageContainer
      onBack={()=>history.push(FleetPaths.fleet)}
      title="Service Tasks "
     >
     <TableView<ServiceTasksDTO, { searchValue?: string }>
        hasCriteria={Object.values(Omit(advanceSearchParams, ['status'])).some((v) => v)}
        cache
        columns={[
          {
            title: 'Name',
            dataIndex: 'name',
          },

          {
            title: 'Reminder',
            dataIndex: 'remider',
            render: (_, r) => r.reminder,
          },
          { title: 'Description', dataIndex: 'description' },
          {
            title: 'Status',
            key: 'status',
            render: (_, r) => (
              <Badge status={r.status === 'Active' ? 'processing' : 'error'} text={r.status} />
            ),
          },
          {
            title: '',
            hideInForm: true,
            width: 100,
            render: (_, r) => (
              <Space>
                <Dropdown
                  menu={{
                    items:items(r),
                    style:{width:200},
                    onLoad:(e)=>{
                      console.log(e);
                      
                    },
                    onClick:(e)=>{
                      
                       e.key === "1" &&  setSate((v) => ({...v,visible: { name: 'modal', type: 'Edit', payload: { vehicle: r } },}));
                    }
                  }}
                >
                  <a><DashOutlined/></a>
                </Dropdown>
              </Space>
            ),
          },
        ]}
        tableProps={{
          actionRef: actionRef,
        }}
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
            cacheList.fetchDataList('fleet-service-task').then((v) => {
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
            }) as Promise<Paging<ServiceTasksDTO>>,
        }}
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
              <Radio.Button value="ALL">All</Radio.Button>
              <Radio.Button value="Active">Active</Radio.Button>
              <Radio.Button value="Inactive">Inactive</Radio.Button>
            </Radio.Group>
          </Space>
        }
      />

     </PageContainer>
      <ServiceTasksModalForm
        open={state.visible?.name == 'modal'}
        onCancel={() => setSate((v) => ({ ...v, visible: undefined }))}
        onSave={onSaveHandler}
        data={state.visible?.payload?.vehicle}
      />
    </>
  );
};
