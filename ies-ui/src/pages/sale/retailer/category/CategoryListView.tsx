import type { TableViewSearchParams } from '@/components/DataCrud/TableView';
import TableView from '@/components/DataCrud/TableView';
import { formatDateTime } from '@/pages/utils';
import type { Paging } from '@/services/API';
import { simpleRequestActions } from '@/services/model';
import { EditOutlined } from '@ant-design/icons';
import type { ActionType } from '@ant-design/pro-table';
import { useAccess, useModel } from '@umijs/max';
import { Badge, Button, Modal, Radio, Row, Space, Tag, Tooltip, message } from 'antd';
import { startCase } from 'lodash';
import Omit from 'omit.js';
import { useRef, useState } from 'react';
import { SalePaths } from '../..';
import BreadCrumbCom from '../components/BreadCrumbCom';
import CategoryFormModal from './CategoryFormModal';
import type { CategoryAdvanceSearchParams, CategoryCreate, CategoryDto } from './data';
import { CategoryServiceAPI } from './services';

interface Props {
  // onAdd?: () => void;
  onDetail?: (id: string) => void;
  onEdit?: (id: string) => void;
}

export default ({ onDetail }: Props) => {
  const requestActions = simpleRequestActions();
  const services = CategoryServiceAPI(requestActions);
  const [categoryData, setCategoryData] = useState<CategoryDto>();
  const [advanceSearchParams, setAdvanceSearchParams] = useState<CategoryAdvanceSearchParams>({
    status: 'ALL',
  });
  const actionRef = useRef<ActionType>();

  const access = useAccess();

  const cacheList = useModel('dataList');
  const [state, setSate] = useState<{
    visible?: { name: 'modal'; type: 'ADD' | 'Edit' };
  }>({});
  const onRequestHandler = async (params: TableViewSearchParams<CategoryAdvanceSearchParams>) => {
    try {
      return services.listCategory(params).then((it) => {
        return cacheList.cacheDataList({
          type: 'retailer-category',
          criteria: params,
          data: it,
        });
      }) as Promise<Paging<CategoryDto>>;
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
      label: 'Category',
    },
  ];

  const onAddHandler = async () => {
    setCategoryData(undefined);
    setSate((v) => ({
      ...v,
      visible: { name: 'modal', type: 'ADD' },
    }));
  };
  const onSaveActionHandler = (data: CategoryCreate) => {
    Modal.confirm({
      title: 'Save Category',
      content: 'Are you sure?',
      onOk: async () => {
        try {
          (await services.save(data)) as {
            data: string;
            message: string;
          };
          setSate((v) => ({ ...v, visible: undefined }));
          actionRef.current?.reloadAndRest?.();
          message.success('Saved successfully.');
        } catch (error: any) {
          message.error(error.message || 'Failed to driver.');
        }
      },
    });
  };

  return (
    <>
      <Row justify="space-between">
        <BreadCrumbCom separator=">" routes={routes} />
      </Row>
      <TableView<CategoryDto, { searchValue?: string; advanceSearch: CategoryAdvanceSearchParams }>
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
            title: 'Category Name',
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
            title: 'Category Code',
            dataIndex: 'code',
          },
          {
            title: 'Description',
            dataIndex: 'description',
          },
          {
            title: 'Status',
            dataIndex: 'status',
            render: (_, r) => {
              return (
                <Tag color={r.status === 'active' ? 'green' : 'red'}>{startCase(r.status)}</Tag>
              );
            },
          },
          {
            title: 'Last Modified Date',
            render: (_, r) => {
              return formatDateTime(r.lastModifiedDate);
            },
          },
          {
            title: 'Action',
            align: 'center',
            hideInTable: !access.canCreateRetailer,
            render: (_, r) => {
              return (
                <Tooltip title="Edit" key={`edit-${r.id}`}>
                  <EditOutlined
                    style={{ color: '#448DF7' }}
                    onClick={() => {
                      onAddHandler();
                      setCategoryData(r);
                    }}
                  />
                </Tooltip>
              );
            },
          },
        ]}
        advanceSearch
        actionHandlers={{
          onAdd: onAddHandler,
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
            cacheList.fetchDataList('retailer-category').then((v) => {
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
            }) as Promise<Paging<CategoryDto>>,
        }}
        tableProps={{
          actionRef: actionRef,
        }}
      />

      <CategoryFormModal
        open={state.visible?.name === 'modal'}
        onCancel={() => setSate((v) => ({ ...v, visible: undefined }))}
        data={categoryData}
        onSave={onSaveActionHandler}
      />
    </>
  );
};
