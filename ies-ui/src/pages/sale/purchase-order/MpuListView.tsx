import TableView, { TableViewProps } from '@/components/DataCrud/TableView';
import { formatDate } from '@/pages/utils';
import { Paging } from '@/services/API';
import { RsmRequestMpuDetail, StockStoreAdvanceSearchParams, StockStoreLess } from '@/services/sale/data';
import { EditOutlined } from '@ant-design/icons';
import { ActionType } from '@ant-design/pro-table';
import { useSetState } from 'ahooks';
import { Tag, Tooltip } from 'antd';
import { SortOrder } from 'antd/lib/table/interface';
import { omit } from 'lodash';
import { useRef, useState } from 'react';
import { history, useAccess, useModel } from 'umi';
import { Model } from './model';
import { SalePaths } from '..';
import { MpuAdvanceSearchParams } from './data';

const MpuListView: React.FC<TableViewProps<RsmRequestMpuDetail>> = ({ actionHandlers }) => {
  const {actions } = Model();
  const [force] = useSetState<{ update: number }>({ update: 0 });
  const [searchValueParams, setAdvanceSearchParams] = useState<MpuAdvanceSearchParams>();
//   const [addNewModal, setAddNewModal] = useSetState<{
//     visible?: boolean;
//     record?: StockStoreLess;
//   }>({});
  const actionRef = useRef<ActionType>();
  const access = useAccess();
  const cacheList = useModel('dataList');

  const onRequestHandler = (
    criteria?: { searchValue?: string;},
    pagination?: {
      pageSize?: number;
      current?: number;
    },
    sort?: Record<string, SortOrder>,
  ) => {
    return actions
      .listRsmRequest?.(criteria || { searchValue: searchValueParams }, pagination, sort)
      .then((it) => {
        return cacheList.cacheDataList({
          type: 'mpuRequest-id',
          criteria: criteria?.searchValue || searchValueParams,
          data: it,
        });
      }) as Promise<Paging<RsmRequestMpuDetail>>;
  };

//   useEffect(() => {
//     actions.initData();
//   }, []);

  return (
    <>
      <TableView<
        RsmRequestMpuDetail,
        { searchValue?: string; advanceSearch?: MpuAdvanceSearchParams }
      >
        cache
        hasCriteria={Object.values(omit(searchValueParams, ['status'])).some((v) => v)}
        forceUpdate={force.update}
        displayOnly={!access.canCreateEditMpuRequest}
        tableProps={{
          actionRef: actionRef,
        }}
        // extraFilter={
        //   <Space size="large">
        //     <Radio.Group
        //       value={advanceSearchParams?.status || 'all'}
        //       onChange={(e) => {
        //         setAdvanceSearchParams((v) => ({
        //           ...v,
        //           status: e.target.value,
        //         }));

        //         actionRef.current?.reloadAndRest?.();
        //       }}
        //     >
        //       <Radio.Button value="all">All</Radio.Button>
        //       <Radio.Button value="open">Open</Radio.Button>
        //       <Radio.Button value="closed">Closed</Radio.Button>
        //     </Radio.Group>
        //   </Space>
        // }
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
            return { searchValue: data, advanceSearch: searchValueParams };
          },
          onAdd: actionHandlers?.onAdd,
          onFirstLoad: () =>
            cacheList.fetchDataList('mpuRequest-id').then((v) => {
              if (v) {
                setAdvanceSearchParams(v.creteria);
                return v.dataList;
              } else return onRequestHandler();
            }) as Promise<Paging<RsmRequestMpuDetail>>,
          onRequest: onRequestHandler,
        }}
        columns={[
          {
            title: 'Distributor Code',
            // dataIndex: 'name',
            render: (_, r) => {
              return (
                <a onClick={() => actionHandlers?.onDetail && actionHandlers?.onDetail(r)}>
                  {r.distributorCode}
                </a>
              );
            },
          },

          {
            title:  'Plate Number',
            render: (_, r) => {
              return r.plateNumber;
            },
          },

          {
            title: 'Stock Name',
            render: (_, r) => {
              return r.stockName;
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
            title: 'Description',
            dataIndex: 'description',
          },
          access.canAccessRSMRequestToMPU
            ? {
                title: '',
                align: 'center',
                render: (_, r) => {
                  return (
                    <Tooltip title="Edit" key="edit">
                      <EditOutlined
                        style={{ color: '#448DF7' }}
                        onClick={() => history.push(`${SalePaths.purchaseOrder}/edit/${r.id}`)}
                      />
                    </Tooltip>
                  );
                  // return <Checkbox defaultChecked={r.isActive ? true : false} disabled />;
                },
              }
            : {},
        ]}
      />
    </>
  );
};

export default MpuListView;
