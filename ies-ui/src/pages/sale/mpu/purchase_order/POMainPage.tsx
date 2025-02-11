import { TableViewSearchParams } from '@/components/DataCrud/TableView';
import PageWrapper from '@/components/PageWrapper';
import { simpleRequestActions } from '@/services/model';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DollarOutlined,
  EllipsisOutlined,
  PlusOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { ActionType } from '@ant-design/pro-components';
import { useQuery } from '@umijs/max';
import { Dropdown, MenuProps, Modal, Tag } from 'antd';
import numeral from 'numeral';
import { useEffect, useRef, useState } from 'react';
import MpuPoDetail from './MpuPODetail';
import MpuPoEntryForm from './MpuPOEntryForm';
import { PurchaseOrderAdvanceSearch, PurchaseOrderDTO } from './data';
import { PurchaseOrderServiceAPI } from './services';
interface Props {}

const POMainPage: React.FC<Props> = () => {
  const requestActions = simpleRequestActions();
  const services = PurchaseOrderServiceAPI(requestActions);
  const actionRef = useRef<ActionType>();
  const [actionStatusState, setActionStatusState] = useState<{
    visible?: {
      type: 'open';
      payloads?: PurchaseOrderDTO;
    };
  }>();
  const [filter, setFilter] = useState<TableViewSearchParams<PurchaseOrderAdvanceSearch>>({
    criteria: { advanceSearch: { status: 'ALL' } },
  });
  const { data, isFetching, refetch } = useQuery(
    ['fetch-po-list', filter],
    () => services.page(filter),
    {
      refetchOnWindowFocus: false,
      keepPreviousData: false,
    },
  );
  const items = (items: PurchaseOrderDTO): MenuProps['items'] => [
    // {
    //     key: "action-status",
    //     label: "Force Close",
    //     itemIcon: <IssuesCloseOutlined />,
    //     onClick: () => setActionStatusState({ visible: { type: "open", payloads: items } })
    // },
    // {
    //     type: "divider"
    // },
    {
      key: 'reject',
      label: 'Reject',
      danger: true,
      itemIcon: <CloseCircleOutlined />,
      disabled: items.status === 'Pending' ? false : true,
      onClick: () => {
        Modal.confirm({
          title: 'Reject Purchase',
          content: 'are you sure?',
          onOk: async () => {
            await services.rejected({
              id: items.id,
              remark: 'data was reject',
            });
            actionRef.current?.reload?.();
            refetch();
          },
        });
      },
    },
    // {
    //     key: "reject",
    //     label: "Reject",
    //     danger: true,
    //     disabled: items.status != "Pending",
    //     itemIcon: <DeleteOutlined />,
    //     onClick: () => {
    //         Modal.confirm({
    //             title: "Reject Purchase",
    //             content: "are you sure?",
    //             onOk: async () => {
    //                 // await services.updateStatus({
    //                 //     id:items.id,
    //                 //     status:"rejected",
    //                 //     remark:"data was reject"
    //                 // });
    //                 // actionRef.current?.reload?.();
    //                 // refetch();
    //             }
    //         })
    //     },
    // },
  ];
  useEffect(() => {}, [data]);
  return (
    <>
      <PageWrapper<PurchaseOrderDTO, PurchaseOrderAdvanceSearch, {}>
        tabRender={(items) => [
          {
            action: 'add',
            tabKey: 'add',
            panel: ({ onCloseTab, onUpdateTab, key }) => (
              <MpuPoEntryForm
                type={'CREATE'}
                onBack={onCloseTab}
                onView={(items) => onUpdateTab('view', items, undefined, key)}
              />
            ),
            tabLabel: 'Add New',
          },
          {
            action: 'view',
            tabKey: items?.id,
            panel: ({ onAddTab, onUpdateTab, key }) => (
              <MpuPoDetail
                id={items?.id}
                onEdit={(po?: PurchaseOrderDTO) => onUpdateTab?.('edit', undefined, undefined, key)}
                onAdd={() => onAddTab?.('add', undefined, key)}
              />
            ),
            tabLabel: `${items?.purchaseOrderCode}`,
          },
          {
            action: 'edit',
            tabKey: 'edit',
            panel: ({ onUpdateTab, onCloseTab, key }) => (
              <MpuPoEntryForm
                type={'EDIT'}
                onView={() => onUpdateTab?.('view', undefined, undefined, key)}
                onBack={() => {
                  onUpdateTab?.('view', undefined, undefined, key);
                  refetch();
                }}
                id={items?.id}
              />
            ),
            tabLabel: `Edit ${items?.purchaseOrderCode}`,
          },
        ]}
        listView={{
          statuses: [
            { option: { value: 'ALL', label: 'All' } },
            { option: { value: 'Pending', label: 'Pending' } },
            { option: { value: 'Loaded', label: 'Loaded' } },
            { option: { value: 'Rejected', label: 'Rejected' } },
            { option: { value: 'Paid', label: 'Paid' } },
          ],
          type: 'Table',
          title: 'Purchase Order',
          onRefresh: refetch,
          actionButtons: [
            {
              icon: <PlusOutlined />,
              type: 'link',
              addNewTab: true,
            },
          ],
          onFilter(params, page, sort) {
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

          props: {
            dataSource: data?.items,
            actionRef: actionRef,
            loading: isFetching,
            pagination: { total: data?.total },
            expandable: {},
            columns: [
              {
                title: 'No',
                dataIndex: 'purchaseRequestNo',
                actionProps: (item) => ({
                  type: 'view',
                  label: item.purchaseOrderCode || 'n/a',
                }),
              },
              {
                title: 'Purchase Date',
                dataIndex: 'purchaseOrderDate',
                valueType: 'date',
              },
              {
                title: 'Assigned To',
                dataIndex: 'assignedTo',
              },

              {
                title: 'Distributor Name',
                dataIndex: 'distributorName',
              },

              {
                title: 'Status',
                dataIndex: 'status',
                render: (_, r) => (
                  <Tag
                    icon={
                      r.status == 'Pending' ? (
                        <SyncOutlined spin />
                      ) : r.status == 'Paid' ? (
                        <DollarOutlined />
                      ) : r.status == 'Rejected' ? (
                        <CloseCircleOutlined />
                      ) : (
                        <CheckCircleOutlined />
                      )
                    }
                    bordered={false}
                    color={
                      r.status == 'Pending'
                        ? 'processing'
                        : r.status == 'Paid'
                        ? 'default'
                        : r.status == 'Rejected'
                        ? 'error'
                        : 'success'
                    }
                  >
                    {r.status}
                  </Tag>
                ),
              },
              {
                title: 'Amount',
                dataIndex: 'grantAmount',
                render: (_, r) => {
                  return `${numeral(r.grantAmount).format('$ 0,000.000')}`;
                },
                align: 'right',
              },
              // {
              //   title: 'Total Amount',
              //   dataIndex: 'totalAmount',
              //   valueType: 'money',
              // },
              {
                title: 'Requested By',
                dataIndex: 'requestedBy',
              },
              {
                title: 'Requested Date',
                dataIndex: 'requestedDate',
                valueType: 'date',
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
      {/* <ActionStatusModalForm
            open={actionStatusState?.visible?.type == "open"}
            onCancel={() => setActionStatusState({ visible: undefined })}
            data={actionStatusState?.visible?.payloads}
            onSave={async(items:PurchaseOrderCreate)=>{
                Modal.confirm({
                    title: "force Close Purchase Order.",
                    content: "are you sure?",
                    onOk: async () => {
                        await services.updateStatus(items);
                        actionRef.current?.reload?.();
                        refetch();
                    }
                })
            }}
        /> */}
    </>
  );
};

export default POMainPage;
