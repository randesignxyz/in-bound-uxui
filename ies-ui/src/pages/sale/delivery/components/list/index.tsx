import TableView, { colLink } from '@/components/DataCrud/TableView';
import { formatDate } from '@/pages/utils';
import { DeliveryAdvanceSearchParams, SoDeliveryDetail } from '@/services/sale/data';
import { Model } from '../../model';
import { history, useModel } from 'umi';
import { SalePaths } from '@/pages/sale';
import { CrmPaths } from '@/pages/crm';
import { ActionType } from '@ant-design/pro-table';
import { useEffect, useRef, useState } from 'react';
import { Paging } from '@/services/API';
import AdvanceSearch from './AdvanceSearch';
import Omit from 'omit.js';
import { Radio } from 'antd';
import { SortOrder } from 'antd/lib/table/interface';

interface Props {}

const DeliveryListView: React.FC<Props> = ({}) => {
  const cacheList = useModel('dataList');
  const { state, actions, modals } = Model();
  const actionRef = useRef<ActionType>();
  const [advanceSearchParams, setAdvanceSearchParams] = useState<DeliveryAdvanceSearchParams>({
    status: 'Posted',
  });

  useEffect(() => {
    actions.initData();
  }, []);

  const onRequestHandler = (
    criteria?: { searchValue?: string; advanceSearch?: DeliveryAdvanceSearchParams },
    pagination?: {
      pageSize?: number;
      current?: number;
    },
    sort?: Record<string, SortOrder>,
  ) => {
    return actions.listSoDeliveries?.(criteria, pagination, sort).then((it) => {
      return cacheList.cacheDataList({
        type: 'sale-order-delivery',
        criteria: criteria?.advanceSearch || advanceSearchParams,
        data: it,
      });
    }) as Promise<Paging<SoDeliveryDetail>>;
  };

  return (
    <>
      <TableView<
        SoDeliveryDetail,
        { searchValue?: string; advanceSearch?: DeliveryAdvanceSearchParams }
      >
        cache
        advanceSearch
        displayOnly
        tableProps={{
          actionRef: actionRef,
        }}
        extraFilter={
          <Radio.Group
            value={advanceSearchParams.status || 'Posted'}
            onChange={(e) => {
              setAdvanceSearchParams((v) => ({
                ...v,
                status: e.target.value,
              }));

              actionRef.current?.reloadAndRest?.();
            }}
          >
            <Radio.Button value="Posted">Pending</Radio.Button>
            <Radio.Button value="Closed">Closed</Radio.Button>
          </Radio.Group>
        }
        hasCriteria={Object.values(Omit(advanceSearchParams, ['status'])).some((v) => v)}
        actionHandlers={{
          onSearchCriteria: (data) => {
            return { searchValue: data, advanceSearch: advanceSearchParams };
          },

          onFirstLoad: () =>
            cacheList.fetchDataList('sale-order-delivery').then((v) => {
              if (v) {
                setAdvanceSearchParams(v.creteria);
                return v.dataList;
              } else return onRequestHandler();
            }) as Promise<Paging<SoDeliveryDetail>>,
          onRequest: onRequestHandler,
          onAdvanceSearchClicked: () => modals.showModal('advanceSearch'),
        }}
        columns={[
          {
            title: 'Shipping Date',
            sorter: 'deliveryDate',
            width: 110,
            render: (_, r) => formatDate(r.shippingDate),
          },
          {
            title: 'SO#',
            sorter: 'soNo',
            render: colLink(
              (r) => history.push(`${SalePaths.so}/detail/${r.so.id}`),
              (r) => r.so.code || 'Not Assigned',
            ),
          },
          {
            title: 'Delivery Method',
            sorter: 'deliveryMethod',
            render: (_, r) => r.deliveryMethod?.code,
          },
          {
            title: 'Customer',
            sorter: 'customerName',
            render: colLink(
              (r) => history.push(`${CrmPaths.customer}/detail/${r.id}`),
              (r) => r.customer.name,
            ),
          },

          {
            title: 'Shipping Addr Code',
            render: (_, r) => r.shippingAddress.name,
          },

          {
            title: 'Salesperson',
            sorter: 'salesperson',
            render: (_, r) => r.salesperson.name,
          },

          {
            title: 'Remarks',
            dataIndex: 'remarks',
          },
        ]}
      />

      <AdvanceSearch
        width="400px"
        placement="right"
        // closable
        title="Advance Search"
        open={modals.isVisible('advanceSearch')}
        onClose={() => {
          modals.hideModal('advanceSearch');
        }}
        initData={advanceSearchParams}
        deliveryMethodList={state.data?.initData?.deliveryMethodList}
        salespersons={state.data?.initData?.salespersons}
        onReset={() => {
          setAdvanceSearchParams({ status: 'Posted' });
          actionRef.current?.reloadAndRest?.();
        }}
        onSearch={(data) => {
          setAdvanceSearchParams(data);
          actionRef.current?.reload();
        }}
      />
    </>
  );
};

export default DeliveryListView;
