import { TableViewSearchParams } from '@/components/DataCrud/TableView';
import PageWrapper from '@/components/PageWrapper';
import { formatDate } from '@/pages/utils';
import { simpleRequestActions } from '@/services/model';
import {
  ExchangeRate,
  StockControlLess,
  StockStoreAdvanceSearchParams,
} from '@/services/sale/data';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { ActionType } from '@ant-design/pro-components';
import { useAccess, useQuery } from '@umijs/max';
import { Modal, Spin, Tag, Tooltip, message } from 'antd';
import { uniqueId } from 'lodash';
import { useEffect, useRef, useState } from 'react';
import RemarkModalForm from '../component/RemarkModal';
import TaskListDetailView from './DetailView';
import ExpendableTable from './ExpendableTable';
import CountStockModal from './components/CountStockModal';
import EditItemEntryModal from './components/EditItemEntryModal';
import MMAApproval from './components/MMAAproval';
import MMASettlement from './components/MMASettlement';
import SettlementModal from './components/SettlementModal';
import { SuggestionServiceAPI } from './services';

interface Props {}

const TaskListMainPage: React.FC<Props> = () => {
  const access = useAccess();
  const requestActions = simpleRequestActions();
  const suggestionService = SuggestionServiceAPI(requestActions);
  const actionRef = useRef<ActionType>();
  const [exchangeRate, setExchangeRate] = useState<ExchangeRate>();

  const role = access.canAccessAllMenuDSD
    ? 'sale_admin'
    : access.canAccessTabWarehouse
    ? 'warehouse'
    : access.canAccessTabCashier
    ? 'cashier'
    : 'admin';
  const [filter, setFilter] = useState<TableViewSearchParams<StockStoreAdvanceSearchParams>>({
    criteria: {
      advanceSearch: {
        status: 'ALL',
        role: role,
      },
    },
  });
  const [settleModal, setSettleModal] = useState<{
    open?: boolean;
    record?: StockControlLess;
  }>({});

  const [countModal, setCountModal] = useState<{
    open?: boolean;
    record?: StockControlLess;
  }>({});

  const [approvedState, setApprovedState] = useState<{
    visible?: {
      open: boolean;
      record?: StockControlLess;
    };
  }>();
  const { data, isFetching, refetch } = useQuery(
    ['fetch-customer-list', filter],
    () => suggestionService.page(filter),
    {
      refetchOnWindowFocus: false,
      refetchInterval: 50000,
    },
  );

  const [remarkState, setRemarkState] = useState<{
    visible?: {
      open: boolean;
      carryData?: StockControlLess;
    };
  }>();

  const [addNewModal, setAddNewModal] = useState<{
    open?: boolean;
    record?: StockControlLess;
    role?: string;
  }>({});

  const [mmaSettilementState, setMMASettlementState] = useState<{
    visible?: {
      open: boolean;
      record?: StockControlLess;
    };
  }>();

  const expendableRender = (parent: StockControlLess) => {
    return (
      <ExpendableTable
        data={parent}
        onReload={() => refetch()}
        onSettlement={(d) => setSettleModal({ open: true, record: d })}
        source={
          access.canAccessTabCashier
            ? 'CASHIER'
            : access.canAccessTabWarehouse
            ? 'WAREHHOUSE'
            : 'ADMIN'
        }
        onMMAReviewSettlement={(data) =>
          setMMASettlementState({ visible: { open: true, record: data } })
        }
        onMMAApprove={(data, role) => {
            setApprovedState({ visible: { open: true, record: data } });
        //   setAddNewModal({ open: true, record: data, role: role });
        }}
      />
    );
  };
  const onLoadDSDExchange = async () => {
    const rs1 = await suggestionService.dsdExchangeRage();
    setExchangeRate(rs1);
  };
  useEffect(() => {
    onLoadDSDExchange();
  }, []);
  return (
    <Spin spinning={false}>
      <PageWrapper<StockControlLess, StockStoreAdvanceSearchParams, {}>
        tabRender={(item) => [
          {
            action: 'copy',
            tabLabel: item?.stockName ? `Copy (#${item.stockName})` : 'Copy',
            tabKey: `copy-${item?.id}-${uniqueId('copy')}`,
          },
          {
            action: 'view',
            value: item?.stockName || 'n/a',
            tabLabel: item?.stockName || 'Draft',
            panel: ({ onUpdateTab, onCloseTab }) => (
              <TaskListDetailView
                data={item}
                onCountStock={(r) => setCountModal({ open: true, record: r })}
                onView={() => {
                  onCloseTab();
                  refetch();
                }}
              />
            ),
          },
        ]}
        listView={{
          type: 'Table',
          title: 'Task List',
          onFilter: (params, page, sort) => {},
          onRefresh: refetch,
          props: {
            dataSource: data?.items,
            expandable: { expandedRowRender: expendableRender },
            loading: isFetching,
            columns: [
              {
                title: 'Store Name',
                render: (_, r) => {
                  return r.stockName ? r.stockName : '-';
                },
              },
              {
                width: 120,
                title: 'Request Date',
                align: 'right',
                render: (_, r) => {
                  return formatDate(r.requestedDate);
                },
              },
              {
                title: 'Serial Number',
                dataIndex: 'referenceNo',
              },

              {
                title: 'Number Plate',
                dataIndex: 'plateNumber',
              },
              {
                title: 'Status',
                align: 'center',
                render: (_, r) => {
                  const color =
                    r.status === 'pending'
                      ? 'processing'
                      : r.status === 'open'
                      ? 'success'
                      : r.status === 'canceled' || r.status === 'closed'
                      ? 'magenta'
                      : 'warning';
                  const icon =
                    r.status === 'pending' ? (
                      <SyncOutlined spin />
                    ) : r.status === 'open' ? (
                      <CheckCircleOutlined />
                    ) : r.status === 'canceled' || r.status === 'closed' ? (
                      <CloseCircleOutlined />
                    ) : (
                      <ExclamationCircleOutlined />
                    );
                  return (
                    <span>
                      <Tag color={color} bordered={false} icon={icon}>
                        {r.status}
                      </Tag>
                    </span>
                  );
                },
              },
              {
                title: 'Approved By',
                render: (_, r) => {
                  return r.approvedBy ? r.approvedBy : '-';
                },
              },
              {
                width: 120,
                title: 'Approved Date',
                align: 'right',
                dataIndex: 'approvedDate',
                valueType: 'date',
              },
              access.canAccessTabWarehouse
                ? {
                    render: (_, r) => {
                      return (
                        ['approved', 'count stock'].includes(r.status) && (
                          <Tooltip title="Edit" key="edit">
                            <EditOutlined
                              style={{ color: '#448DF7' }}
                              onClick={() => {
                                if (r.status === 'count stock') {
                                  setCountModal({ open: true, record: r });
                                } else {
                                  setAddNewModal({ open: true, record: r });
                                }
                              }}
                            />
                          </Tooltip>
                        )
                      );
                    },
                  }
                : {},
            ],
          },
        }}
      />

      <EditItemEntryModal
        key={`EditItemEntryModal`}
        open={addNewModal.open}
        onCancel={() => setAddNewModal({ open: false, record: undefined })}
        data={addNewModal.record}
        role={addNewModal.role}
        actionHandlers={{
          onRejectItem: async (id: number, remark: string) => {
            try {
              const result = await suggestionService.doReject(id, remark);
              message.success(result.message);
            } catch (e: any) {
              message.error(e.toString());
            }
            if (addNewModal.record?.items?.length === 1) {
              setAddNewModal({
                open: false,
                record: undefined,
              });
            }
          },
          onReload: () => {
            setAddNewModal({
              open: false,
              record: undefined,
            });
          },
          onAddItem: async (item) => {
            Modal.confirm({
              title: 'Ready! Batch No and Quanity.',
              content: 'Are you sure?',
              onOk: async () => {
                try {
                  const res = await suggestionService.onApprovalStockRequest(item);
                  res &&
                    setAddNewModal({
                      open: false,
                      record: undefined,
                    });
                  res && message.success('Data was recorded!');
                } catch (error) {}
                refetch();
              },
            });
          },
        }}
      />
      <RemarkModalForm
        open={remarkState?.visible?.open}
        showAlertInfo
        onCancel={() => setRemarkState({ visible: undefined })}
        status="reject"
        onSave={async (data) => {
          suggestionService
            .reject({
              id: remarkState?.visible?.carryData?.id,
              ...data,
            })
            .then((o) => {
              message.success('Your rejection request was a success!');
            });
          setRemarkState({ visible: undefined });
          actionRef.current?.reload?.();
          refetch();
        }}
      />

      <SettlementModal
        key={`SettlementModal`}
        open={settleModal.open}
        data={settleModal.record}
        dsdExchangeRate={exchangeRate}
        onCancel={() => setSettleModal({ open: false, record: undefined })}
        onSave={async (data) => {
          Modal.confirm({
            title: 'Confirm settlement is valid data.',
            content: 'are you sure?',
            onOk: async () => {
              await suggestionService
                .onSaveSettlementModel(data)
                .then(() => {
                  setSettleModal({
                    open: false,
                    record: undefined,
                  });
                  refetch();
                  message.success('success!');
                })
                .catch(() => {
                  message.error('Something went wrong!');
                });
            },
          });
        }}
      />

      <CountStockModal
        key={`CountStockModal`}
        open={countModal.open}
        data={countModal.record}
        actionHandlers={{
          onCancel: () => setCountModal({ open: false, record: undefined }),
          onAddItem: async (item) => {
            Modal.confirm({
              title: 'Stock Count Confirmation',
              content: 'are you sure',
              onOk: async () => {
                setCountModal({
                  open: false,
                  record: undefined,
                });
                await suggestionService.countStock(item);
                refetch();
                message.success('count stock was success!');
              },
            });
          },
        }}
      />

      <MMAApproval
        open={approvedState?.visible?.open}
        onCancel={() => setApprovedState({ visible: undefined })}
        data={approvedState?.visible?.record}
        onSave={(data) => {
          Modal.confirm({
            title: 'Make Approve Requested',
            content: 'are you sure?',
            onOk: async () => {
              try {
                const res = await suggestionService.onMMAApprovalStockRequest(data);
                res &&
                  setAddNewModal({
                    open: false,
                    record: undefined,
                  });
                res && message.success('success approval!');
              } catch (error) {}
              setApprovedState({ visible: undefined });
              refetch();
            },
          });
        }}
      />

      <MMASettlement
        open={mmaSettilementState?.visible?.open}
        data={mmaSettilementState?.visible?.record}
        onCancel={() => setMMASettlementState({ visible: undefined })}
        onSave={(data) => {
          Modal.confirm({
            title: 'Approve MMA Request Settlement',
            content: 'are you sure?',
            onOk: async () => {
              await suggestionService.onMMASaveSettlementModel(data);
              setMMASettlementState({ visible: undefined });
              refetch();
            },
          });
        }}
      />
    </Spin>
  );
};

export default TaskListMainPage;
