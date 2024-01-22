import TableView, { TableViewProps } from '@/components/DataCrud/TableView';
import { formatDate } from '@/pages/utils';
import { Paging } from '@/services/API';
import { StockStoreAdvanceSearchParams, StockStoreLess } from '@/services/sale/data';
import { EditOutlined } from '@ant-design/icons';
import { ActionType } from '@ant-design/pro-table';
import { useSetState } from 'ahooks';
import { message, Modal, Radio, Space, Tag, Tooltip } from 'antd';
import { SortOrder } from 'antd/lib/table/interface';
import { omit } from 'lodash';
import { useEffect, useRef, useState } from 'react';
import { history, useAccess, useModel } from 'umi';
import { SalePaths } from '../..';
import StockStoreFormModal from '../components/StockStoreFormModal';
import { Model } from '../model';
import AdvanceSearch from './AdvanceSearch';

const StoreListView: React.FC<TableViewProps<StockStoreLess>> = ({ actionHandlers }) => {
  const { state, actions, modals } = Model();
  const [force, setForce] = useSetState<{ update: number }>({ update: 0 });
  const [advanceSearchParams, setAdvanceSearchParams] = useState<StockStoreAdvanceSearchParams>();
  const [addNewModal, setAddNewModal] = useSetState<{
    visible?: boolean;
    record?: StockStoreLess;
  }>({});
  const actionRef = useRef<ActionType>();
  const access = useAccess();
  const cacheList = useModel('dataList');

  const onRequestHandler = (
    criteria?: { searchValue?: string; advanceSearch?: StockStoreAdvanceSearchParams },
    pagination?: {
      pageSize?: number;
      current?: number;
    },
    sort?: Record<string, SortOrder>,
  ) => {
    return actions
      .loadListItem?.(criteria || { advanceSearch: advanceSearchParams }, pagination, sort)
      .then((it) => {
        return cacheList.cacheDataList({
          type: 'stockStore',
          criteria: criteria?.advanceSearch || advanceSearchParams,
          data: it,
        });
      }) as Promise<Paging<StockStoreLess>>;
  };

  useEffect(() => {
    actions.initData();
  }, []);

  return (
    <>
      <TableView<
        StockStoreLess,
        { searchValue?: string; advanceSearch?: StockStoreAdvanceSearchParams }
      >
        cache
        advanceSearch
        hasCriteria={Object.values(omit(advanceSearchParams, ['status'])).some((v) => v)}
        forceUpdate={force.update}
        displayOnly={!access.canCreateEditStockControl}
        tableProps={{
          actionRef: actionRef,
        }}
        extraFilter={
          <Space size="large">
            <Radio.Group
              value={advanceSearchParams?.status || 'all'}
              onChange={(e) => {
                setAdvanceSearchParams((v) => ({
                  ...v,
                  status: e.target.value,
                }));

                actionRef.current?.reloadAndRest?.();
              }}
            >
              <Radio.Button value="all">All</Radio.Button>
              <Radio.Button value="open">Open</Radio.Button>
              <Radio.Button value="closed">Closed</Radio.Button>
            </Radio.Group>
          </Space>
        }
        // tableProps={{
        //   actionRef: actionRef,
        //   toolbar: !access.canOpenStore
        //     ? undefined
        //     : {
        //         actions: [
        //           <Button
        //             key={'bt'}
        //             type="link"
        //             onClick={() => setAddNewModal({ visible: true, record: undefined })}
        //             icon={<PlusOutlined />}
        //           />,
        //         ],
        //       },
        // }}
        actionHandlers={{
          onSearchCriteria: (data) => {
            return { searchValue: data, advanceSearch: advanceSearchParams };
          },
          onAdd: actionHandlers?.onAdd,
          onFirstLoad: () =>
            cacheList.fetchDataList('stockStore').then((v) => {
              if (v) {
                setAdvanceSearchParams(v.creteria);
                return v.dataList;
              } else return onRequestHandler();
            }) as Promise<Paging<StockStoreLess>>,
          onRequest: onRequestHandler,
          onAdvanceSearchClicked: () => modals.showModal('advanceSearch'),
        }}
        columns={[
          {
            title: 'Store Name',
            // dataIndex: 'name',
            render: (_, r) => {
              return (
                <a onClick={() => actionHandlers?.onDetail && actionHandlers?.onDetail(r)}>
                  {r.name}
                </a>
              );
            },
          },

          {
            title: 'Store Type',
            render: (_, r) => {
              return r.members?.find((it) => it.isRequester)?.role;
            },
          },

          {
            title: 'Vehicle',
            render: (_, r) => {
              return r.vehicle?.plateNumber;
              //   return (
              //     <a onClick={() => history.push(`${SalePaths.teamWork}/detail/${r.teamWork?.id}`)}>
              //       {r.teamWork?.teamName}
              //     </a>
              //   );
            },
          },
          {
            title: 'Created Date',
            render: (_, r) => {
              return formatDate(r.createdDate);
            },
          },
          {
            title: 'Status',
            // dataIndex: 'status',
            align: 'center',
            render: (_, r) => {
              const color =
                r.status === 'pending'
                  ? 'default'
                  : //: r.status === 'approved'
                  r.status === 'Open'
                  ? 'success'
                  : r.status === 'canceled' || r.status === 'Closed'
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
            title: 'Description',
            dataIndex: 'description',
          },
          access.canOpenStore
            ? {
                title: '',
                align: 'center',
                render: (_, r) => {
                  return (
                    <Tooltip title="Edit" key="edit">
                      <EditOutlined
                        style={{ color: '#448DF7' }}
                        onClick={() => history.push(`${SalePaths.store}/edit/${r.id}`)}
                      />
                    </Tooltip>
                  );
                  // return <Checkbox defaultChecked={r.isActive ? true : false} disabled />;
                },
              }
            : {},
        ]}
      />
      <StockStoreFormModal
        loading={state.loading || false}
        title={addNewModal.record ? 'Edit Store' : 'Add New Store'}
        open={addNewModal.visible}
        data={{
          teamWork: state.data?.teamWorks,
          detail: addNewModal.record,
        }}
        onCancel={() => setAddNewModal({ visible: false, record: undefined })}
        actionHandlers={{
          onSave: (item, isView) => {
            const msgTitle = addNewModal.record ? 'Update the store' : 'Save New Store';
            Modal.confirm({
              title: msgTitle,
              content: 'Are you sure:',
              onOk: async () => {
                const result = await actions.saveData(item);
                if (result && result.message === 'Ok') {
                  message.info(addNewModal.record ? 'The store is updated' : 'Create a new store');
                  setAddNewModal({ visible: false, record: undefined });

                  actionRef.current?.reload();
                  isView
                    ? history.push(`${SalePaths.store}/detail/${result.data.id}`)
                    : setForce({ update: force.update + 1 });
                }
              },
            });
          },
        }}
      />

      <AdvanceSearch
        width="400px"
        placement="right"
        closable
        title="Advance Search"
        open={modals.isVisible('advanceSearch')}
        onClose={() => {
          modals.hideModal('advanceSearch');
        }}
        initData={advanceSearchParams}
        // salespersons={state.data?.initData?.salespersonList}
        onSearch={(data) => {
          setAdvanceSearchParams((v) => ({ ...v, ...data, status: v?.status }));
          actionRef.current?.reloadAndRest?.();
        }}
        onReset={() => {
          setAdvanceSearchParams({ status: 'all' });
          actionRef.current?.reloadAndRest?.();
        }}
      />
    </>
  );
};

export default StoreListView;
