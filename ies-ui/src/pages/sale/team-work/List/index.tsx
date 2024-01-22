import type { TableViewProps } from '@/components/DataCrud/TableView';
import TableView from '@/components/DataCrud/TableView';
import { formatDate } from '@/pages/utils';
import type { Paging } from '@/services/API';
import type { TeamWorkAdvanceSearchParams, TeamWorkLess } from '@/services/sale/data';
import type { ActionType } from '@ant-design/pro-table';
import { useSetState } from 'ahooks';
import { Space, Tag } from 'antd';
import type { SortOrder } from 'antd/lib/table/interface';
import { omit } from 'lodash';
import { useRef, useState } from 'react';
import { useAccess, useModel } from 'umi';
import { Model } from '../model';

const TeamWorkList: React.FC<TableViewProps<TeamWorkLess>> = ({ actionHandlers }) => {
  const [advanceSearchParams, setAdvanceSearchParams] = useState<TeamWorkAdvanceSearchParams>();
  const cacheList = useModel('dataList');
  const actionRef = useRef<ActionType>();
  const access = useAccess();
  const { actions, modals } = Model();
  const [force, setForce] = useSetState<{ update: number }>({ update: 0 });

  const onRequestHandler = (
    criteria?: { searchValue?: string; advanceSearch?: TeamWorkAdvanceSearchParams },
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
          type: 'team-work',
          criteria: criteria?.advanceSearch || advanceSearchParams,
          data: it,
        });
      }) as Promise<Paging<TeamWorkLess>>;
  };

  return (
    <>
      <TableView<
        TeamWorkLess,
        { searchValue?: string; advanceSearch?: TeamWorkAdvanceSearchParams }
      >
        cache
        advanceSearch
        hasCriteria={Object.values(omit(advanceSearchParams, ['status', 'customerType'])).some(
          (v) => v,
        )}
        forceUpdate={force.update}
        displayOnly={!access.canCreateEditStockControl}
        tableProps={{
          actionRef: actionRef,
        }}
        actionHandlers={{
          onSearchCriteria: (data) => {
            return { searchValue: data, advanceSearch: advanceSearchParams };
          },
          onAdd: actionHandlers?.onAdd,
          onFirstLoad: () =>
            cacheList.fetchDataList('team-work').then((v) => {
              if (v) {
                setAdvanceSearchParams(v.creteria);
                return v.dataList;
              } else return onRequestHandler();
            }) as Promise<Paging<TeamWorkLess>>,
          onRequest: onRequestHandler,
          onAdvanceSearchClicked: () => modals.showModal('advanceSearch'),
        }}
        columns={[
          {
            title: 'Team Name',
            //dataIndex: 'teamName',
            render: (_, r) => {
              return (
                <Space size={0}>
                  <a onClick={() => actionHandlers?.onDetail && actionHandlers?.onDetail(r)}>
                    {r.teamName}
                  </a>
                </Space>
              );
            },
          },
          {
            title: 'Description',
            dataIndex: 'description',
          },
          {
            title: 'Store',
            dataIndex: 'stockStoreName',
          },

          {
            title: 'Vichicle',
            dataIndex: 'plateNumber',
          },
          {
            title: 'Created Date',
            render: (_, r) => {
              return formatDate(r.createdDate);
            },
          },
          {
            title: 'Active',
            render: (_, r) => {
              return (
                <Tag color={r.isActive ? 'processing' : 'default'}>
                  {r.isActive ? 'True' : 'false'}
                </Tag>
              );
            },
          },
        ]}
      />
    </>
  );
};

export default TeamWorkList;
