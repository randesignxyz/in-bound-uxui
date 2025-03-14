import { TableViewSearchParams } from '@/components/DataCrud/TableView';
import PageWrapper from '@/components/PageWrapper';
import { simpleRequestActions } from '@/services/model';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteFilled,
  DollarOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { ActionType } from '@ant-design/pro-components';
import { useQuery } from '@umijs/max';
import { Button, Modal, Space, Tag, Tooltip } from 'antd';
import numeral from 'numeral';
import { useRef, useState } from 'react';
import RemarkModalForm from '../../component/RemarkModal';
import AdvanceSearch from '../components/AdvanceSearch';
import MpuPoDetail from './MpuPODetail';
import MpuPoEntryForm from './MpuPOEntryForm';
import { PurchaseOrderDTO } from './data';
import { PurchaseOrderServiceAPI } from './services';
// interface Props {}

const POMainPage: React.FC = () => {
  // const { state, actions, modals } = Model();
  const requestActions = simpleRequestActions();
  const services = PurchaseOrderServiceAPI(requestActions);
  const actionRef = useRef<ActionType>();
  const [advanceSearch, setAdvanceSearch] = useState<{
    isVisibled: boolean;
    value?: AdvanceSearchParam;
  }>({
    isVisibled: false,
  });

  const [remarkModal, setRemarkModal] = useState<{ isVisibled: boolean; data?: PurchaseOrderDTO }>({
    isVisibled: false,
  });

  // const [actionStatusState, setActionStatusState] = useState<{
  //   visible?: {
  //     type: 'open';
  //     payloads?: PurchaseOrderDTO;
  //   };
  // }>();
  const [filter, setFilter] = useState<TableViewSearchParams<AdvanceSearchParam>>({
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

  const rejectedAction = (id: number, remark: string) => {
    Modal.confirm({
      title: 'Reject Purchase Order',
      content: 'are you sure?',
      onOk: async () => {
        await services.rejected({
          id: id,
          remark: remark,
        });
        actionRef.current?.reload?.();
        refetch();
      },
    });
  };

  // const items = (items: PurchaseOrderDTO): MenuProps['items'] => [
  // {
  //     key: "action-status",
  //     label: "Force Close",
  //     itemIcon: <IssuesCloseOutlined />,
  //     onClick: () => setActionStatusState({ visible: { type: "open", payloads: items } })
  // },
  // {
  //     type: "divider"
  // },
  // {
  //   key: 'reject',
  //   label: 'Reject',
  //   danger: true,
  //   itemIcon: <CloseCircleOutlined />,
  //   disabled: items.status === 'Pending' ? false : true,
  //   onClick: () => {
  //     Modal.confirm({
  //       title: 'Reject Purchase',
  //       content: 'are you sure?',
  //       onOk: async () => {
  //         await services.rejected({
  //           id: items.id,
  //           remark: 'data was reject',
  //         });
  //         actionRef.current?.reload?.();
  //         refetch();
  //       },
  //     });
  //   },
  // },
  // ];
  // useEffect(() => {}, [data]);
  return (
    <>
      <PageWrapper<PurchaseOrderDTO, AdvanceSearchParam, ''>
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
                onEdit={() => onUpdateTab?.('edit', undefined, undefined, key)}
                onAdd={() => onAddTab?.('add', undefined, key)}
              />
            ),
            tabLabel: `${items?.purchaseOrderCode}`,
          },
          {
            action: 'edit',
            tabKey: 'edit',
            panel: ({ onUpdateTab, key }) => (
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
          onOpenAdvanceSearch: () => setAdvanceSearch({ isVisibled: true }),
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
            setFilter(() => ({
              criteria: {
                searchValue: params?.searchValue,
                advanceSearch: {
                  status: params?.status,
                  dates: advanceSearch.value?.dates,
                  salespersonId: advanceSearch.value?.salespersonId,
                  distributorType: advanceSearch.value?.distributorType,
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
                title: 'Address',
                dataIndex: 'addressCode',
              },

              {
                title: 'Status',
                dataIndex: 'status',
                render: (_, r) => (
                  <Space>
                    <Tag
                      icon={
                        r.status === 'Pending' ? (
                          <SyncOutlined spin />
                        ) : r.status === 'Paid' ? (
                          <DollarOutlined />
                        ) : r.status === 'Rejected' ? (
                          <CloseCircleOutlined />
                        ) : (
                          <CheckCircleOutlined />
                        )
                      }
                      bordered={false}
                      color={
                        r.status === 'Pending'
                          ? 'processing'
                          : r.status === 'Paid'
                          ? 'default'
                          : r.status === 'Rejected'
                          ? 'error'
                          : 'success'
                      }
                    >
                      {r.status}
                    </Tag>
                    {r.status === 'Rejected' && (
                      <Tooltip placement="top" title={r.remark ?? 'N/A'}>
                        <InfoCircleOutlined style={{ color: '#EB5E5A' }} />
                      </Tooltip>
                    )}
                  </Space>
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
                    <Button
                      disabled={r.status !== 'Pending'}
                      type="link"
                      onClick={() => setRemarkModal({ isVisibled: true, data: r })}
                      danger
                      icon={<DeleteFilled />}
                    />
                  );
                  //   <Dropdown
                  //     menu={{
                  //       items: items(r),
                  //       style: {
                  //         width: 200,
                  //       },
                  //     }}
                  //   >
                  //     <a>
                  //       <EllipsisOutlined />
                  //     </a>
                  //   </Dropdown>
                },
              },
            ],
          },
        }}
      />

      <RemarkModalForm
        showAlertInfo
        open={remarkModal.isVisibled}
        status="reject"
        onCancel={() => setRemarkModal({ isVisibled: false, data: undefined })}
        onSave={(data) => {
          if (remarkModal.data !== undefined) {
            rejectedAction(remarkModal.data.id, data.remark);
            setRemarkModal({ isVisibled: false, data: undefined });
          }
        }}
      />

      {/* <RemarkModal
        title="Exclude Order"
        width="500px"
        open={remarkModal.isVisibled}
        onCancel={() => setRemarkModal({ isVisibled: false, data: undefined })}
        id={remarkModal.data?.id}
        onSave={(id, remarks) => {
          rejectedAction(id, remarks);
          setRemarkModal({ isVisibled: false, data: undefined });
        }}
      /> */}
      <AdvanceSearch
        width={500}
        title="Advance Search"
        open={advanceSearch.isVisibled}
        entity="Purchase Order"
        onOpenChange={(visible) => {
          if (!visible) {
            setAdvanceSearch({ isVisibled: false });
          }
        }}
        onSearch={(data) => {
          // setFilter((v) => ({
          //   ...v,
          //   criteria: {
          //     ...v.criteria,
          //     advanceSearch: {
          //       ...filter.criteria?.advanceSearch,
          //       ...data,
          //     },
          //   },
          // }));
          console.log(data);
          setFilter({
            criteria: {
              searchValue: filter.criteria?.searchValue,
              advanceSearch: {
                ...advanceSearch.value,
                salespersonId: data.salespersonId,
                dates: data.dates,
                distributorType: data.distributorType,
              },
              //advanceSearch
            },
          });
        }}
        onReset={() => {
          setFilter((v) => ({
            ...v,
            criteria: {
              ...filter.criteria,
              advanceSearch: {
                salespersonId: undefined,
                dates: undefined,
                distributorType: 'all',
              },
            },
          }));
        }}
        initData={filter.criteria}
      />
    </>
  );
};

export default POMainPage;
