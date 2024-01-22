import type { TableViewSearchParams } from '@/components/DataCrud/TableView';
import TableView from '@/components/DataCrud/TableView';
import type { Paging } from '@/services/API';
import { simpleRequestActions } from '@/services/model';
import { EditOutlined } from '@ant-design/icons';
import type { ActionType } from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { Badge, Button, message, Modal, Radio, Row, Space, Tag, Tooltip } from 'antd';
import { startCase } from 'lodash';
import Omit from 'omit.js';
import { useRef, useState } from 'react';
import { SalePaths } from '../..';
import BreadCrumbCom from '../components/BreadCrumbCom';
import type { IngredientAdvanceSearchParams, IngredientCreate, IngredientDto } from './data';
import IngredientFormModal from './IngredientFormModal';
import { IngredientServiceAPI } from './services';

interface Props {
  onAdd?: () => void;
  onDetail?: (id: string) => void;
  onEdit?: (id: string) => void;
}

export default ({ onDetail }: Props) => {
  const requestActions = simpleRequestActions();
  const services = IngredientServiceAPI(requestActions);
  const [ingredientData, setIngredientData] = useState<IngredientDto>();
  const [advanceSearchParams, setAdvanceSearchParams] = useState<IngredientAdvanceSearchParams>({
    status: 'ALL',
  });
  const actionRef = useRef<ActionType>();

  const cacheList = useModel('dataList');

  const [state, setSate] = useState<{
    visible?: { name: 'modal'; type: 'ADD' | 'Edit'; payload?: { ingredient: IngredientCreate } };
  }>({});

  const onRequestHandler = async (params: TableViewSearchParams<IngredientAdvanceSearchParams>) => {
    try {
      return services.pageIngredient(params).then((it) => {
        return cacheList.cacheDataList({
          type: 'retailer-ingredient',
          criteria: params,
          data: it,
        });
      }) as Promise<Paging<IngredientDto>>;
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
      label: 'Ingredient',
    },
  ];

  const onAddHandler = async () => {
    setIngredientData(undefined);
    setSate((v) => ({
      ...v,
      visible: { name: 'modal', type: 'ADD' },
    }));
  };
  const onSaveActionHandler = (data: IngredientCreate) => {
    Modal.confirm({
      title: 'Create New Ingredient',
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
      <TableView<
        IngredientDto,
        { searchValue?: string; advanceSearch: IngredientAdvanceSearchParams }
      >
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
            title: 'Ingredient Code',
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
            title: 'Ingredient Name',
            dataIndex: 'name',
          },
          {
            title: 'Ingredient Name En',
            dataIndex: 'nameEn',
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
            title: 'Action',
            align: 'center',
            render: (_, r) => {
              return (
                <Tooltip title="Edit" key={`edit-${r.id}`}>
                  <EditOutlined
                    style={{ color: '#448DF7' }}
                    onClick={() => {
                      onAddHandler();
                      setIngredientData(r);
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
            cacheList.fetchDataList('retailer-ingredient').then((v) => {
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
            }) as Promise<Paging<IngredientDto>>,
        }}
        tableProps={{
          actionRef: actionRef,
        }}
      />

      <IngredientFormModal
        open={state.visible?.name === 'modal'}
        onCancel={() => setSate((v) => ({ ...v, visible: undefined }))}
        data={ingredientData}
        onSave={onSaveActionHandler}
      />
    </>
  );
};
