import { SoAdvanceSearchParams, SoItemLess } from '@/services/sale/data';
import React, { useEffect, useRef, useState } from 'react';
import { history, useAccess, useModel } from 'umi';
import '@/pages/index.less';
import { CrmPaths } from '@/pages/crm';
import TableView, { colLink, TableViewProps } from '@/components/DataCrud/TableView';
import { Model } from '../../model';
import { Badge, Button, Radio, Space, Spin, Tag } from 'antd';
import { Paging } from '@/services/API';
import { ActionType } from '@ant-design/pro-table';
import { formatDateTime } from '@/pages/utils';
import { SortOrder } from 'antd/lib/table/interface';
import { EyeOutlined, PaperClipOutlined, SelectOutlined } from '@ant-design/icons';
import AdvanceSearch from './AdvanceSearch';
import Omit from 'omit.js';
import QuickView from './QickView';
import Status from '@/components/Status';

const SoListView: React.FC<TableViewProps<SoItemLess>> = ({ actionHandlers }) => {
  const cacheList = useModel('dataList');
  const { state, actions, modals } = Model();

  const [advanceSearchParams, setAdvanceSearchParams] = useState<SoAdvanceSearchParams>({
    status: 'Pending',
    customerType: 'Direct',
  });

  const actionRef = useRef<ActionType>();

  const access = useAccess();
  useEffect(() => {
    actions.initilizeData();
  }, []);

  const onRequestHandler = (
    criteria?: { searchValue?: string; advanceSearch?: SoAdvanceSearchParams },
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
          type: 'sale-order',
          criteria: criteria?.advanceSearch || advanceSearchParams,
          data: it,
        });
      }) as Promise<Paging<SoItemLess>>;
  };

  return (
    <Spin spinning={state.loading}>
      <TableView<SoItemLess, { searchValue?: string; advanceSearch?: SoAdvanceSearchParams }>
        cache
        advanceSearch
        hasCriteria={Object.values(Omit(advanceSearchParams, ['status', 'customerType'])).some(
          (v) => v,
        )}
        displayOnly={!access.canCreateEditSo}
        extraFilter={
          <Space size="large">
            <Radio.Group
              value={advanceSearchParams.status || 'Pending'}
              onChange={(e) => {
                setAdvanceSearchParams((v) => ({
                  ...v,
                  status: e.target.value,
                }));

                actionRef.current?.reloadAndRest?.();
              }}
            >
              <Badge
                size="small"
                offset={[-20, 0]}
                count={
                  ((['All', 'Direct'].some((it) => it === advanceSearchParams.customerType) &&
                    state.data?.soSummary?.pendingDirect) ||
                    0) +
                  ((['All', 'Indirect'].some((it) => it === advanceSearchParams.customerType) &&
                    state.data?.soSummary?.pendingIndirect) ||
                    0)
                }
              >
                <Radio.Button value="Pending"> Pending</Radio.Button>
              </Badge>
              <Radio.Button value="Posted">Posted</Radio.Button>
              <Badge size="small" offset={[-20, 0]} count={state.data?.soSummary?.failed}>
                <Radio.Button value="Failed">Failed</Radio.Button>
              </Badge>
              {/* <Radio.Button value="Closed">Closed</Radio.Button> */}
              <Radio.Button value="Canceled">Canceled</Radio.Button>
            </Radio.Group>

            <Radio.Group
              value={advanceSearchParams.customerType}
              onChange={(e) => {
                setAdvanceSearchParams((v) => ({
                  ...v,
                  customerType: e.target.value,
                }));

                actionRef.current?.reloadAndRest?.();
              }}
            >
              <Radio.Button value="All">All</Radio.Button>
              <Radio.Button value="Direct">Direct</Radio.Button>
              <Radio.Button value="Indirect">In Direct</Radio.Button>
            </Radio.Group>
          </Space>
        }
        tableProps={{
          actionRef: actionRef,
        }}
        actionHandlers={{
          onSearchCriteria: (data) => {
            return { searchValue: data, advanceSearch: advanceSearchParams };
          },
          onAdd: actionHandlers?.onAdd,
          onFirstLoad: () =>
            cacheList.fetchDataList('sale-order').then((v) => {
              if (v) {
                setAdvanceSearchParams(v.creteria);
                return v.dataList;
              } else return onRequestHandler();
            }) as Promise<Paging<SoItemLess>>,
          onRequest: onRequestHandler,
          onAdvanceSearchClicked: () => modals.showModal('advanceSearch'),
        }}
        columns={[
          {
            render: (_, r) => (
              <Space size={0}>
                <Button
                  type="link"
                  icon={<SelectOutlined />}
                  onClick={async () => {
                    window.open(`./detail/${r.id}`, '_blank')?.focus();
                  }}
                />
                <Button
                  type="link"
                  icon={<EyeOutlined />}
                  onClick={async () => {
                    await actions.fetchSo(r.id);
                    modals.showModal('quickView');
                  }}
                />
                {r.hasAttachment && (
                  <PaperClipOutlined style={{ color: `${r.uploaded ? '#A0A0A0' : 'red'}` }} />
                )}
              </Space>
            ),
          },
          {
            title: 'PO #',
            sorter: 'poNo',
            width: 100,
            render: (_, r) => (
              <a onClick={() => actionHandlers?.onDetail && actionHandlers?.onDetail(r)}>
                {r.poNo}
              </a>
            ),
          },
          {
            title: 'SO #',
            sorter: 'soNo',
            hideInTable: advanceSearchParams.status === 'Pending',
            width: 110,
            dataIndex: 'soNo',
            //render: colLink(actionHandlers?.onDetail, (d) => d.soNo || 'Not Assigned'),
          },
          {
            title: 'Customer',
            render: colLink(
              (data) => history.push(`${CrmPaths.customer}/detail/${data.customerId}`),
              (data) => data.customerCode,
            ),
            sorter: 'customerCode',
          },
          {
            title: 'Ship To',
            render: (_, data) => data.shippingAddress,
          },

          {
            title: 'Salesperson',
            render: (_, data) => data.salespersonName,
            sorter: 'salespersonName',
          },
          {
            title: 'Province',
            dataIndex: 'province',
          },
          {
            title: 'Region',
            dataIndex: 'region',
          },
          {
            title: 'Del. Method',
            render: (_, r) => r.deliveryMethod,
          },
          {
            title: 'Order Date',
            align: 'right',
            sorter: 'orderDate',

            width: 150,
            render: (_, data) => formatDateTime(data.orderedDate),
          },
          {
            title: 'Amount',
            align: 'right',
            valueType: {
              type: 'money',
              locale: 'en-US',
            },
            dataIndex: 'amount',
          },
          {
            title: 'Status',
            render: (_, r) =>r.status && <Status text={r.status}/>,
          },
          {
            title: 'Source',
            dataIndex: 'source',
          },
        ]}
      />

      <QuickView
        width="700px"
        placement="right"
        closable
        destroyOnClose
        title="Quick View"
        open={modals.isVisible('quickView')}
        onClose={() => {
          modals.hideModal('quickView');
        }}
        soDetail={state.data?.soDetail}
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
        salespersons={state.data?.initData?.salespersons}
        lookDataList={state.data?.initData?.lookDataList}
        onSearch={(data) => {
          setAdvanceSearchParams((v) => ({ ...v, ...data, status: v.status }));
          actionRef.current?.reloadAndRest?.();
        }}
        onReset={() => {
          setAdvanceSearchParams({ status: 'Pending', customerType: 'Direct' });
          actionRef.current?.reloadAndRest?.();
        }}
      />
    </Spin>
  );
};

export default SoListView;
