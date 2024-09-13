import type { TableViewSearchParams } from '@/components/DataCrud/TableView';
import TableView from '@/components/DataCrud/TableView';
import type { Paging } from '@/services/API';
import { simpleRequestActions } from '@/services/model';
import { EditOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import type { ActionType } from '@ant-design/pro-table';
import { history, useModel } from '@umijs/max';
import { Radio, Space, Spin, message } from 'antd';
import Omit from 'omit.js';
import { useEffect, useRef, useState } from 'react';
import PricingItemEditModal from './PricingItemEditModal';
import { ItemSalesLinePriceDto, PricingAdvanceSearchParam } from './data';
import { PricingServiceAPI } from './services';

interface Props {
  onAdd?: () => void;
  //   onEdit?: (id: number) => void;
  //   onDetail?: (id: number) => void;
}

export default ({ onAdd }: Props) => {
  const requestActions = simpleRequestActions();
  const services = PricingServiceAPI(requestActions);
  //   const dsdService = DSDReportAPI(requestActions);
  const [action, setAction] = useState<{
    visible?: boolean;
    item?: ItemSalesLinePriceDto;
  }>({});

  useEffect(() => {
    (async () => {})();
    return () => {};
  }, []);

  const [advanceSearchParams, setAdvanceSearchParams] = useState<PricingAdvanceSearchParam>({
    type: 'ALL',
    searchValue: undefined,
  });
  const actionRef = useRef<ActionType>();
  //   const [report, setReport] = useState<ReportName>();

  const cacheList = useModel('dataList');

  const onRequestHandler = async (params: TableViewSearchParams<PricingAdvanceSearchParam>) => {
    try {
      return services.page(params).then((it) => {
        return cacheList.cacheDataList({
          type: 'item-sales-line',
          criteria: params,
          data: it,
        });
      }) as Promise<Paging<ItemSalesLinePriceDto>>;
    } catch (error: any) {
      message.error(error.message);
      return Promise.reject();
    }
  };

  return (
    <PageContainer
      breadcrumb={undefined}
      title={'Item Sales Line Price'}
      // breadcrumbRender={() => {
      //   return <Link to={'/sale'}>Back</Link>;
      // }}
      onBack={() => history.push('/sale')}
    >
      <Spin spinning={requestActions.request?.loading}>
        <TableView<
          ItemSalesLinePriceDto,
          { searchValue?: string; advanceSearch: PricingAdvanceSearchParam }
        >
          hasCriteria={Object.values(Omit(advanceSearchParams, ['status'])).some((v) => v)}
          cache
          // disableSearch
          advanceSearch={undefined}
          displayOnly
          extraRightFilter={
            [
              //   <Button
              //     key={'pricing-export-button'}
              //     type="primary"
              //     onClick={() => {
              //       setReport('visit-report');
              //     }}
              //   >
              //     Visit Report
              //   </Button>,
            ]
          }
          extraFilter={
            <Space size="large">
              <Radio.Group
                value={advanceSearchParams.type}
                onChange={(e) => {
                  setAdvanceSearchParams((v) => ({
                    ...v,
                    type: e.target.value,
                  }));

                  actionRef.current?.reloadAndRest?.();
                }}
              >
                <Radio.Button value="ALL">All</Radio.Button>
                <Radio.Button value="ACT-GROUP">Activation</Radio.Button>
                <Radio.Button value="DSD-GROUP">Van Sale</Radio.Button>
              </Radio.Group>
            </Space>
          }
          columns={[
            {
              title: 'Code',
              dataIndex: 'productCode',
            },
            {
              title: 'Description',
              dataIndex: 'productName',
            },
            {
              title: 'SKU',
              dataIndex: 'productDescription',
            },
            {
              title: 'Price Type',
              // dataIndex: 'priceType',
              render: (_, r) => {
                return r.priceType === 'DSD-GROUP'
                  ? 'Van Sale'
                  : r.priceType === 'ACT-GROUP'
                  ? 'Activation'
                  : r.priceType;
              },
            },
            {
              title: 'Unit Price',
              dataIndex: 'unitPrice',
              valueType: 'money',
              align: 'right',
            },

            {
              title: 'After Discount',
              dataIndex: 'unitPriceAfterDiscount',
              valueType: 'money',
              align: 'right',
            },
            {
              title: 'Currency Code',
              dataIndex: 'currencyCode',
            },

            //   {
            //     title: 'Checked In Location',
            //     // dataIndex: 'customerAddress',
            //     render: (_, r) => (
            //       <Button
            //         type="link"
            //         onClick={() =>
            //           setGoogleModal({
            //             visible: true,
            //             id: r.id,
            //             lat: parseFloat(r.checkInLatitude) ?? -1,
            //             lng: parseFloat(r.checkInLongitude) ?? -1,
            //             name: r.customerName,
            //             internalName: `Address: ${r.customerAddress}`,
            //             phone: `Phone: ${r.customerPhone}`,
            //           })
            //         }
            //       >
            //         {`${r.checkInLatitude}, ${r.checkInLongitude}`}
            //       </Button>
            //     ),
            //   },

            {
              title: 'Action',
              align: 'center',
              render: (_, r) => {
                return (
                  <EditOutlined
                    style={{ color: '#448DF7' }}
                    onClick={() => setAction({ visible: true, item: r })}
                  />
                );
              },
            },
          ]}
          actionHandlers={{
            onAdd: onAdd,
            //   onAdvanceSearchClicked: () => {
            //setAdvanceSearch({ visible: true });
            //   },
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
              cacheList.fetchDataList('item-sales-line').then((v: any) => {
                if (v) {
                  setAdvanceSearchParams({
                    ...v.creteria?.criteria,
                    type: v.creteria?.criteria?.advanceSearch?.type ?? 'ALL',
                  });
                  requestActions?.end?.('SUCCESS');
                  return v.dataList;
                } else {
                  return onRequestHandler({
                    criteria: {
                      advanceSearch: advanceSearchParams,
                    },
                  });
                }
              }) as Promise<Paging<ItemSalesLinePriceDto>>,
          }}
          tableProps={{
            actionRef: actionRef,
          }}
        />
        <PricingItemEditModal
          item={action.item}
          onCancel={() => setAction({ visible: false, item: undefined })}
          open={action.visible}
          actionHandlers={{
            onSave: async (item) => {
              try {
                const result = await services.update({
                  id: action.item?.id ?? -1,
                  unitPrice: item?.unitPrice ?? action.item?.unitPrice ?? -1,
                  unitPriceAfterDiscount:
                    item?.unitPriceAfterDiscount ?? action.item?.unitPriceAfterDiscount ?? -1,
                });
                message.info(result.message);
              } catch (e: any) {
                message.error(e.toString());
              } finally {
                setAction({ visible: false, item: undefined });
                actionRef.current?.reload();
              }
            },
          }}
        />
      </Spin>
    </PageContainer>
  );
};
