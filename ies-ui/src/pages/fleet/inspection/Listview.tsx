import TableView, { TableViewSearchParams } from '@/components/DataCrud/TableView';
import { formatDate } from '@/pages/utils';
import { Paging } from '@/services/API';
import { simpleRequestActions } from '@/services/model';
import { ArrowRightOutlined, BlockOutlined, DashOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ActionType } from '@ant-design/pro-table';
import { useModel } from '@umijs/max';
import { Button, Dropdown, MenuProps, message, Modal, Popover, Radio, Space, Tag } from 'antd';
import Omit from 'omit.js';
import { useRef, useState } from 'react';
import { FleetPaths } from '..';
import BreadCrumbCom from '../components/BreadCrumbCom';
import { InspectionAdvanceParams, InspectionDTO } from './data';
import { InspectionServiceAPI } from './service';

interface Props {
  onDetail?: (id: string) => void;
  onAdd?: () => void;
  onEdit?: (id: number) => void;
}

export default ({ onDetail, onAdd, onEdit }: Props) => {
  const requestActions = simpleRequestActions();
  const services = InspectionServiceAPI(requestActions);

  const [advanceSearch, setAdvanceSearch] = useState<{ visible: boolean }>();
  const [advanceSearchParams, setAdvanceSearchParams] = useState<InspectionAdvanceParams>({
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
      label: 'Inspection',
    },
  ];

  const cacheList = useModel('dataList');

  const onRequestHandler = async (params: TableViewSearchParams<InspectionAdvanceParams>) => {
    try {
      return services.page(params).then((it) => {
        return cacheList.cacheDataList({
          type: 'fleet-inspection',
          criteria: params,
          data: it,
        });
      }) as Promise<Paging<InspectionDTO>>;
    } catch (error: any) {
      message.error(error.message);
      return Promise.reject();
    }
  };

  const items = (row: InspectionDTO): MenuProps['items'] => [
    {
      key: 1,
      label: 'View',
      itemIcon: <ArrowRightOutlined />,
      onClick: () => onDetail?.(row.id),
    },
    {
      key: 2,
      label: 'Void',
      itemIcon: <BlockOutlined />,
      onClick: () => {
        Modal.confirm({
          title: 'Confirm Inspection Entry Void',
          content: 'Are you sure you want to void this inspection entry?',
          onOk: async () => {
            services.void({
              id: row.id,
              vehicleId: row.vehicle,
              status: row.status == 1 ? 0 : 1,
            });
            actionRef.current?.reloadAndRest?.();
            message.success('success');
          },
        });
      },
    },
    {
      type: 'divider',
    },
    {
      key: 3,
      label: 'Delete',
      itemIcon: <DeleteOutlined />,
      danger: true,
      onClick: () => {
        Modal.confirm({
          title: 'Confirm Inspection Entry Deletion',
          content:
            'Are you sure you want to delete this Inspection Entry? All data will be lost forever.',
          onOk: async () => {
            services.delete({
              id: row.id,
              vehicleId: row.vehicle,
              status: 0,
            });
            actionRef.current?.reloadAndRest?.();
            message.success('success');
          },
        });
      },
    },
  ];
  return (
    <>
      <BreadCrumbCom separator=">" routes={routes} />

      <TableView<InspectionDTO, { searchValue?: string }>
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
              <Radio.Button value="ALL">All</Radio.Button>
              <Radio.Button value="DAILY">DAILY</Radio.Button>
              <Radio.Button value="WEEKLY">WEEKLY</Radio.Button>
              <Radio.Button value="MONTHLY">MONTHLY</Radio.Button>
              <Radio.Button value="ANNUALLY">ANNUALLY</Radio.Button>
            </Radio.Group>
          </Space>
        }
        tableProps={{
          actionRef: actionRef,
        }}
        columns={[
          {
            key: 'date',
            title: 'Inspection Date',
            valueType: 'date',
            sorter: 'createdDate',
            dataIndex: 'createdDate',
            render: (_, r) =><Button type='link' onClick={()=>onDetail?.(r.id)}>{ formatDate(r.createdDate)}</Button>

          },
          {
            key: 'duration',
            title: 'Duration',
            dataIndex: 'duration',
            sorter: 'duration',
            render: (_, r) => (
              <Tag color={'cyan'}>{[Math.floor(r.duration / 1000), 'm'].join(' ')}</Tag>
            ),
          },
          {
            key: 'type',
            title: 'Type',
            dataIndex: 'inspectionType',
            sorter: 'inspectionType',
          },
          {
            key: 'platenumber',
            title: 'Vehicle Number',
            dataIndex: 'plateNumber',
            sorter: 'plateNumber',
          },
          {
            key: 'item',
            title: 'Item',
            dataIndex: 'item',
            render: (_, r) => [r.checked, r.item].join('/'),
          },

          {
            key: 'percentage',
            title: 'Rate',
            valueType: {
              type: 'percent',
              precision: 0,
            },
            dataIndex: 'percentage',
            sorter: 'percentage',
            render: (_, r) => (
              <Tag color={r.checked > r.item - 5 ? 'green' : 'error'}>
                {[((r.checked / r.item) * 100) ^ 0, '%'].join(' ')}
              </Tag>
            ),
          },

          {
            key: 'fail',
            title: 'Fail Item',
            render: (_, r) => (
              <Tag color={'red'}>
                <Popover
                  content={r.failItem
                    .filter((it) => it.result == false)
                    .map((it, index) => (
                      <p>
                        {index + 1}- {it.item}
                      </p>
                    ))}
                >
                  {r.failItem.filter((it) => it.result == false).length}
                </Popover>
              </Tag>
            ),
          },
          {
            key: 'Inspected by',
            title: 'Inspected By',
            dataIndex: 'createdBy',
            render: (_, r) =>
              [r.inspectedBy?.firstName, r.inspectedBy?.lastName].filter((it) => it).join(' '),
          },
          {
            key: 'status',
            title: 'Status',
            render: (_, r) =>
              r.status == 1 ? (
                '-'
              ) : (
                <Tag color="error" bordered={false}>
                  void
                </Tag>
              ),
          },
          {
            render: (_, r) => (
              <>
                <Dropdown
                  menu={{
                    items: items(r),
                    style: {
                      width: 200,
                    },
                  }}
                >
                  <a>
                    <DashOutlined />
                  </a>
                </Dropdown>
              </>
            ),
          },
        ]}
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
            }) as Promise<Paging<InspectionDTO>>,
        }}
      />
    </>
  );
};
