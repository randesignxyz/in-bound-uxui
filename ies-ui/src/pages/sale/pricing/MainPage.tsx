import { TableViewSearchParams } from '@/components/DataCrud/TableView';
import PageWrapper from '@/components/PageWrapper';
import { simpleRequestActions } from '@/services/model';
import { EditOutlined } from '@ant-design/icons';
import { ActionType } from '@ant-design/pro-components';
import { useQuery } from '@umijs/max';
import { Button, Modal, message } from 'antd';
import { useRef, useState } from 'react';
import PricingItemEditModal from './PricingItemEditModal';
import { ItemSalesLinePriceDto, PricingAdvanceSearchParam, PricingUpdateParam } from './data';
import { PricingServiceAPI } from './services';

interface Props {}

const PricingMainPage: React.FC<Props> = () => {
  const actionRef = useRef<ActionType>();
  const requestAction = simpleRequestActions();
  const service = PricingServiceAPI(requestAction);
  const [action, setAction] = useState<{
    status?: {
      visible: boolean;
      item?: ItemSalesLinePriceDto;
      formEditType: 'SINGLE' | 'MULTI';
    };
  }>();
  const [filter, setFilter] = useState<TableViewSearchParams<PricingAdvanceSearchParam>>({
    criteria: {
      advanceSearch: {
        status: 'ALL',
      },
    },
  });
  const { data, isFetching, refetch } = useQuery(
    ['fetch-pricing-list', filter],
    () => service.page(filter),
    {
      refetchOnWindowFocus: false,
    },
  );

  return (
    <>
      <PageWrapper<ItemSalesLinePriceDto, PricingAdvanceSearchParam, {}>
        listView={{
          type: 'Table',
          title: 'Line Pricing ',
          onRefresh: refetch,
          onFilter: (params, page, sort) => {
            setFilter((v) => ({
              ...v,
              criteria: {
                ...v.criteria,
                searchValue: params?.searchValue,
                advanceSearch: {
                  status: params?.status || 'ALL',
                },
                sort: sort,
              },
              pagination: page,
            }));
          },
          statuses: [
            { option: { value: 'ALL', label: 'All', default: true } },
            { option: { value: 'ACT-GROUP', label: 'Activation', default: true } },
            { option: { value: 'DSD-GROUP', label: 'Van Sale', default: true } },
          ],
          actionButtons: [
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => setAction({ status: { visible: true, formEditType: 'MULTI' } })}
            >
              Adjusting multiple prices
            </Button>,
          ].filter((o) => o) as React.ReactElement[],
          props: {
            dataSource: data?.items,
            actionRef: actionRef,
            loading: isFetching,
            pagination: {
              total: data?.total,
            },
            columns: [
              {
                title: 'Code',
                sorter: 'productCode',
                dataIndex: 'productCode',
              },
              {
                title: 'Description',
                dataIndex: 'productName',
                sorter: 'productName',
              },
              {
                title: 'SKU',
                dataIndex: 'productDescription',
              },
              {
                title: 'Team',
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
                sorter: 'unitPrice',
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
                      onClick={() =>
                        setAction({ status: { visible: true, formEditType: 'SINGLE', item: r } })
                      }
                    />
                  );
                },
              },
            ],
          },
        }}
      />
      <PricingItemEditModal
        item={action?.status?.item}
        formEditType={action?.status?.formEditType}
        onCancel={() => setAction({ status: undefined })}
        open={action?.status?.visible}
        onSave={async (items: PricingUpdateParam) => {
          Modal.confirm({
            title: 'update pricing selected',
            content: 'are you sure?',
            onOk: async () => {
              service
                .update(items)
                .then((s) => {
                  message.success('Save Sucessed!');
                  setAction({ status: undefined });
                  refetch();
                })
                .catch((p) => {
                  message.error('Something went wrong !');
                });
            },
          });
        }}
      />
    </>
  );
};

export default PricingMainPage;
