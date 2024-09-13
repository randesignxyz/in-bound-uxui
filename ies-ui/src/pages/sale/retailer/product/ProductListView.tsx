import type { TableViewSearchParams } from '@/components/DataCrud/TableView';
import TableView from '@/components/DataCrud/TableView';
import type { Paging } from '@/services/API';
import { simpleRequestActions } from '@/services/model';
import { EditOutlined, SyncOutlined } from '@ant-design/icons';
import type { ActionType } from '@ant-design/pro-table';
import { history, useAccess, useModel } from '@umijs/max';
import { Badge, Button, Modal, Radio, Row, Space, Tag, Tooltip, message } from 'antd';
import { startCase } from 'lodash';
import Omit from 'omit.js';
import { useRef, useState } from 'react';
import { RetailerPath } from '..';
import { SalePaths } from '../..';
import BreadCrumbCom from '../components/BreadCrumbCom';
import type { ProductAdvanceSearchParams, ProductDto } from './data';
import { ProductServiceAPI } from './services';

interface Props {
  onAdd?: () => void;
  onEdit?: (id: string) => void;
  onDetail?: (id: string) => void;
}

export default ({ onAdd, onEdit, onDetail }: Props) => {
  const requestActions = simpleRequestActions();
  const services = ProductServiceAPI(requestActions);

  const [advanceSearchParams, setAdvanceSearchParams] = useState<ProductAdvanceSearchParams>({
    status: 'ALL',
  });
  const actionRef = useRef<ActionType>();
  const access = useAccess();

  const cacheList = useModel('dataList');

  const onRequestHandler = async (params: TableViewSearchParams<ProductAdvanceSearchParams>) => {
    try {
      return services.pageProducts(params).then((it) => {
        return cacheList.cacheDataList({
          type: 'retailer-product',
          criteria: params,
          data: it,
        });
      }) as Promise<Paging<ProductDto>>;
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
      label: 'Product',
    },
  ];

  return (
    <>
      <Row justify="space-between">
        <BreadCrumbCom separator=">" routes={routes} />
        {/* <Space>
          <Button type="primary" onClick={() => onAdd?.()}>
            New
          </Button>
        </Space> */}
      </Row>
      <TableView<ProductDto, { searchValue?: string; advanceSearch: ProductAdvanceSearchParams }>
        hasCriteria={Object.values(Omit(advanceSearchParams, ['status'])).some((v) => v)}
        cache
        displayOnly={!access.canCreateRetailer}
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
              <Radio.Button value="ALL">All</Radio.Button>
              <Badge size="small" offset={[-20, 0]} count={0}>
                <Radio.Button value="ACTIVE">Active</Radio.Button>
              </Badge>
              <Badge size="small" offset={[-20, 0]} count={0}>
                <Radio.Button value="INACTIVE">Inactive</Radio.Button>
              </Badge>
            </Radio.Group>
          </Space>
        }
        columns={[
          {
            title: 'Product Name',
            // dataIndex: 'name',
            render: (_, r) => {
              return (
                <Button
                  type="link"
                  onClick={() => {
                    onDetail?.(r.id);
                  }}
                >
                  {r.name}
                </Button>
              );
            },
          },
          {
            title: 'Product Code',
            dataIndex: 'code',
          },
          {
            title: 'Short Name',
            dataIndex: 'shortName',
          },
          {
            title: 'Description',
            dataIndex: 'description',
          },
          {
            title: 'Status',
            dataIndex: 'status',
            render: (_, r) => (
              <Tag color={r.status === 'active' ? 'green' : 'red'}>{startCase(r.status)}</Tag>
            ),
          },
          {
            title: 'Category',
            align: 'center',
            render: (_, r) => {
              return (
                <Button
                  type="link"
                  onClick={() => history.push(`${RetailerPath.category}/detail/${r.category?.id}`)}
                >
                  {r.category?.name}
                </Button>
              );
              // return `${r.category?.code} - ${r.category?.name}`;
            },
          },
          {
            title: 'Action',
            align: 'center',
            hideInTable: !access.canCreateRetailer,
            width: '150px',
            render: (_, r) => {
              return (
                <Space size={20}>
                  <EditOutlined
                    style={{ color: '#448DF7' }}
                    onClick={() => {
                      onEdit?.(r.id);
                    }}
                  />

                  <Tooltip title={r.status === 'active' ? 'Inactive Product' : 'Active Product'}>
                    <Button
                      type="link"
                      style={{ color: r.status === 'active' ? 'red' : 'green' }}
                      icon={<SyncOutlined />}
                      onClick={() => {
                        Modal.confirm({
                          title:
                            r.status === 'active'
                              ? 'Inactive product will effect to group of customer.'
                              : 'Active Product',
                          content: 'Are you sure?',
                          onOk: async () => {
                            try {
                              const response = await services.updateStatusProduct({
                                id: r.id,
                                status: r.status === 'active' ? 'inactive' : 'active',
                              });
                              message.info(response.message);
                            } catch (e: any) {
                              message.error(e);
                            } finally {
                              actionRef.current?.reload();
                            }
                          },
                        });
                      }}
                    />
                  </Tooltip>
                </Space>
              );
            },
          },
        ]}
        advanceSearch
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
            cacheList.fetchDataList('retailer-product').then((v) => {
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
            }) as Promise<Paging<ProductDto>>,
        }}
        tableProps={{
          actionRef: actionRef,
        }}
      />
    </>
  );
};
