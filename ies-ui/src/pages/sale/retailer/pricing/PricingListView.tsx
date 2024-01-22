import type { TableViewSearchParams } from '@/components/DataCrud/TableView';
import TableView from '@/components/DataCrud/TableView';
import { formatDate } from '@/pages/utils';
import type { Paging } from '@/services/API';
import { simpleRequestActions } from '@/services/model';
import type { ActionType } from '@ant-design/pro-components';
import { history, useModel } from '@umijs/max';
import { Badge, Button, message, Radio, Row, Space, Tag, Tooltip } from 'antd';
import Omit from 'omit.js';
import { useRef, useState } from 'react';
import { SalePaths } from '../..';
import BreadCrumbCom from '../components/BreadCrumbCom';
//import { GroupCustomer } from '../customer/data';
import { EditOutlined } from '@ant-design/icons';
import { startCase } from 'lodash';
import numeral from 'numeral';
import { RetailerPath } from '..';
import type { ItemsPricing, PricingAdvanceSearchParams } from './data';
import { PricingServiceAPI } from './services';

interface Props {
  onAdd?: () => void;
  onDetail?: (id: string) => void;
  onEdit?: (id: string) => void;
}

export default ({ onAdd, onDetail, onEdit }: Props) => {
  const requestActions = simpleRequestActions();
  const services = PricingServiceAPI(requestActions);

  const [advanceSearchParams, setAdvanceSearchParams] = useState<PricingAdvanceSearchParams>({
    status: 'ALL',
  });

  const actionRef = useRef<ActionType>();

  const cacheList = useModel('dataList');

  const onRequestHandler = async (params: TableViewSearchParams<PricingAdvanceSearchParams>) => {
    try {
      return services.listPricing(params).then((it) => {
        return cacheList.cacheDataList({
          type: 'retailer-pricing',
          criteria: params,
          data: it,
        });
      }) as Promise<Paging<ItemsPricing>>;
    } catch (error: any) {
      message.error(error.message);
      return Promise.reject();
    }
  };

  const routes = [
    {
      path: SalePaths.retailer,
      label: 'Retailer',
    },
    {
      path: '',
      label: 'Pricing Rule',
    },
  ];

  return (
    <>
      <Row justify="space-between">
        <BreadCrumbCom separator=">" routes={routes} />
      </Row>
      <TableView<ItemsPricing, { searchValue?: string; advanceSearch: PricingAdvanceSearchParams }>
        hasCriteria={Object.values(Omit(advanceSearchParams, ['status'])).some((v) => v)}
        cache
        extraFilter={
          <Space size="large">
            <Radio.Group
              value={advanceSearchParams.status}
              onChange={(e) => {
                setAdvanceSearchParams((v) => ({
                  ...v,
                  status: e.target.value,
                }));

                actionRef.current?.reloadAndRest?.();
              }}
            >
              <Radio.Button value="ALL" style={{ borderRadius: 5 }}>
                All
              </Radio.Button>
              <Badge size="small" offset={[-20, 0]} count={0}>
                <Radio.Button value="active">Active</Radio.Button>
              </Badge>
              <Badge size="small" offset={[-20, 0]} count={0}>
                <Radio.Button value="inactive">Inactive</Radio.Button>
              </Badge>
            </Radio.Group>
          </Space>
        }
        columns={[
          {
            title: 'Pricing Code',
            render: (_, r) => {
              return (
                <Button
                  type="link"
                  onClick={() => {
                    onDetail?.(r.id);
                  }}
                >
                  {r.code}
                </Button>
              );
            },
          },
          {
            title: 'Pricing Type',
            //dataIndex: 'pricingType',
            render: (_, r) => startCase(r.pricingType),
          },
          {
            title: 'Reference',
            //dataIndex: 'pricingType',
            render: (_, r) => {
              return (
                <Button
                  type="link"
                  onClick={() => {
                    const url =
                      r.pricingType === 'customer'
                        ? RetailerPath.customer
                        : RetailerPath.customergroup;
                    history.push(url.concat('/detail/', r.referenceId ?? ''));
                  }}
                >
                  {r.referenceName}
                </Button>
              );
            },
          },
          {
            title: 'Product Item',
            render: (_, r) => {
              return (
                <Button
                  type="link"
                  onClick={() => {
                    const url = '/retailer/products';
                    history.push(url.concat('/detail/', r.productId ?? ''));
                  }}
                >
                  {r.productCode?.concat(' - ', r.productName ?? '')}
                </Button>
              );
            },
          },
          {
            title: 'Unit Price',
            valueType: 'money',
            render: (_, r) => numeral(r.unitPrice).format('$ 0,0.00'),
          },
          {
            title: 'Discount Price',
            valueType: 'money',
            render: (_, r) =>
              r.discountPrice === undefined ? '' : numeral(r.discountPrice).format('$ 0,0.00'),
          },
          {
            title: 'Status',
            render: (_, r) => {
              return (
                <Tag color={`${r.status === 'active' ? 'green' : 'red'}`}>
                  {startCase(r.status)}
                </Tag>
              );
            },
          },

          {
            title: 'Effective Date',
            render: (_, r) => {
              return formatDate(r.effectiveDate);
            },
          },
          {
            title: 'Expired Date',
            render: (_, r) => {
              return formatDate(r.expiredDate);
            },
          },
          {
            title: 'Created By',
            dataIndex: 'createdBy',
          },
          {
            title: 'Action',
            align: 'center',
            render: (_, r) => {
              return (
                <Tooltip title="Edit" key={`edit-${r.id}`}>
                  <EditOutlined style={{ color: '#448DF7' }} onClick={() => onEdit?.(r.id)} />
                </Tooltip>
              );
            },
          },
        ]}
        actionHandlers={{
          onAdd: onAdd,
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
            cacheList.fetchDataList('retailer-pricing').then((v) => {
              if (v) {
                setAdvanceSearchParams({
                  ...v.creteria?.criteria,
                  status: v.creteria?.criteria?.advanceSearch?.status ?? 'ALL',
                });
                return v.dataList;
              } else {
                return onRequestHandler({
                  criteria: {
                    advanceSearch: advanceSearchParams,
                  },
                });
              }
            }) as Promise<Paging<ItemsPricing>>,
        }}
        tableProps={{
          actionRef: actionRef,
        }}
      />
    </>
  );
};
