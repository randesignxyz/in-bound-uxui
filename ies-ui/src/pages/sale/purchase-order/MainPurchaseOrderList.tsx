import { TableViewSearchParams } from '@/components/DataCrud/TableView';
import PageWrapper from '@/components/PageWrapper';
import { formatDate } from '@/pages/utils';
import { simpleRequestActions } from '@/services/model';
import { StockStoreAdvanceSearchParams, StockStoreLess } from '@/services/sale/data';
import {
  DeleteOutlined,
  EllipsisOutlined,
  ExportOutlined,
  FileOutlined,
  IssuesCloseOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { ActionType } from '@ant-design/pro-components';
import { useQuery } from '@umijs/max';
import { Dropdown, Modal, Tag } from 'antd';
import { uniqueId } from 'lodash';
import { MenuProps } from 'rc-menu';
import { useRef, useState } from 'react';
import { SalePaths } from '..';
import MpuCreateForm from './components/MpuCreateForm';
import PurchaseOrderDetail from './components/PurchaseOrderDetail';
import { MpuServiceApi } from './services';

interface Props {}

const MainPurchaseOrderList: React.FC<Props> = () => {
  //const access = useAccess();
  //const { state, actions, modals } = Model();
  const actionRef = useRef<ActionType>();
  const [filter, setFilter] = useState<TableViewSearchParams<StockStoreAdvanceSearchParams>>({
    criteria: { advanceSearch: { status: 'ALL' } },
  });
  const requestActions = simpleRequestActions();
  const service = MpuServiceApi(requestActions);

  const { data, isFetching, refetch } = useQuery(
    ['list-rsm-request-mpu', filter],
    () => service.listMpuRequest(filter),
    {
      refetchOnWindowFocus: false,
      keepPreviousData: false,
    },
  );

  const items = (items: StockStoreLess): MenuProps['items'] => [
    {
      key: 'force_close',
      label: 'Force Close',
      itemIcon: <IssuesCloseOutlined />,
      onClick: () => {
        if (items.status != 'closed') {
          Modal.confirm({
            title: 'Force Close Purchase Order',
            content: 'Are you sure?',
            onOk: async () => {
              await service.forceCloseRequest(items.id);
              actionRef.current?.reload?.();
              refetch();
            },
          });
        } else {
          Modal.info({
            title: 'Sorry',
            content: 'The Purchase Order is Closed !',
            onOk: async () => {
              actionRef.current?.reload?.();
              refetch();
            },
          });
        }
      },
    },
    {
      key: 'void',
      label: 'Delete',
      itemIcon: <DeleteOutlined />,
      onClick: () => {
        if (items.status == 'open') {
          Modal.confirm({
            title: 'Delete Purchase Order',
            content: 'Are you sure ?',
            onOk: async () => {
              const data = await service.deActivatePo(items.id);
              actionRef.current?.reload?.();
              refetch();
            },
          });
        } else {
          Modal.info({
            title: 'Sorry',
            content: 'The Purchase Order is Closed !',
            onOk: async () => {
              actionRef.current?.reload?.();
              refetch();
            },
          });
        }
      },
    },
  ];

  const noneItem = () => {
    Modal.info({
      title: 'Sorry',
      content: 'The Purchase Order is Closed !',
    });
  };

  return (
    <>
      <PageWrapper<StockStoreLess, StockStoreAdvanceSearchParams, {}>
        tabRender={(items) => [
          {
            action: 'add',
            tabIcon: <FileOutlined />,
            tabLabel: 'Add New',
            tabKey: 'add',
            panel: ({ onUpdateTab, onCloseTab, key }) => (
              <MpuCreateForm
                type="CREATE"
                onView={(it) => onUpdateTab?.('view', it, undefined, key)}
                onBack={onCloseTab}
              />
            ),
          },
          {
            action: 'copy',
            tabLabel: items?.name ? `Copy (#${items.name})` : 'Copy',
            tabKey: `copy-${items?.id}-${uniqueId('copy')}`,
          },
          {
            action: 'view',
            value: items?.referenceNo || 'n/a',
            tabLabel: items?.referenceNo || 'Draft',
            tabKey: items?.id,
            panel: ({ onUpdateTab, onAddTab, key }) => (
              <PurchaseOrderDetail
                id={items?.id}
                onEdit={() => onUpdateTab?.('edit', undefined, undefined, key)}
                onAdd={() => onAddTab?.('add', undefined, key)}
              />
            ),
          },
          {
            action: 'edit',
            tabLabel: `Edit ${items?.referenceNo}`,
            tabKey: 'edit',
            panel: ({ onUpdateTab, onCloseTab, key }) => (
              <MpuCreateForm
                type={'EDIT'}
                onView={() => onUpdateTab?.('view', undefined, undefined, key)}
                onBack={() => {
                  onUpdateTab?.('view', undefined, undefined, key);
                  refetch();
                }}
                id={items?.id}
              />
            ),
          },
        ]}
        listView={{
          type: 'Table',
          title: 'Purchase Order',
          onFilter: (params, page, sort) => {
            setFilter((v) => ({
              criteria: {
                searchValue: params?.searchValue,
                advanceSearch: {
                  status: params?.status,
                },
              },
              pagination: { ...page },
              sort: sort,
            }));
          },
          actionButtons: [
            {
              icon: <PlusOutlined />,
              type: 'link',
              addNewTab: true,
            },
          ],
          statuses: [
            { option: { label: 'All', value: 'ALL' } },
            { option: { label: 'Open', value: 'open' } },
            { option: { label: 'Closed', value: 'closed' } },
          ],
          onRefresh: refetch,
          props: {
            dataSource: data?.items,
            actionRef: actionRef,
            loading: isFetching,
            pagination: {
              total: data?.total,
            },
            columns: [
              {
                title: 'Distributor Code',
                dataIndex: 'distributorCode',
                actionProps: (item) => ({
                  type: 'view',
                  label: item.distributorCode || 'n/a',
                  actionButtons: [
                    {
                      icon: <ExportOutlined />,
                      type: 'link',
                      size: 'small',
                      onClick: () =>
                        window
                          .open(`${SalePaths.purchaseOrder}/detail/${item.id}`, '_blank')
                          ?.focus(),
                    },
                  ],
                }),
              },
              {
                title: 'Plate Number',
                render: (_, r) => {
                  return r.plateNumber;
                },
              },
              {
                title: 'Reference No',
                render: (_, r) => {
                  return r.referenceNo;
                },
              },
              {
                title: 'Created Date',
                render: (_, r) => {
                  return formatDate(r.requestedDate);
                },
              },
              {
                title: 'Status',
                // dataIndex: 'status',
                align: 'center',
                render: (_, r) => {
                  const color =
                    r.status === 'open'
                      ? 'success'
                      : r.status === 'canceled' || r.status === 'closed'
                      ? 'magenta'
                      : 'warning';
                  return (
                    <span>
                      <Tag color={color}>{r.status}</Tag>
                    </span>
                  );
                },
              },
              {
                title: 'Action',
                align: 'center',
                render: (_, r) => {
                  return (
                    <Dropdown
                      menu={{
                        items: items(r),
                        style: {
                          width: 200,
                        },
                      }}
                    >
                      <a>
                        <EllipsisOutlined />
                      </a>
                    </Dropdown>
                  );
                },
              },
            ],
          },
        }}
      />
    </>
  );
};

export default MainPurchaseOrderList;
