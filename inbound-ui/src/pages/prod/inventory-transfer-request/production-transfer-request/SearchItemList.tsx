import { TableViewSearchParams } from '@/components/DataCrud/TableView';
import { simpleRequestActions } from '@/services/model';
import ProList from '@ant-design/pro-list';
import { ActionType } from '@ant-design/pro-table';
import { Badge, Col, Descriptions, Input, message, Row } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { Item, ItemSearch } from '../data';
import { ItemServiceAPI } from '../service';

interface Props {
  addedItems?: number[];
  onAddItem?: (data: Item) => void;
  tendency?: string;
}

export default ({ addedItems, onAddItem, tendency }: Props) => {
  const actionRef = useRef<ActionType>();
  const requestActions = simpleRequestActions();
  const services = ItemServiceAPI(requestActions);
  const [searchValue, setSearchValue] = useState<string>();
  const [searchParams, setSearchParams] = useState<ItemSearch>({});
  // const [itemGroup, setItemGroup] = useState<ItemGroup[]>([])
  const onRequestHandler = async (params: TableViewSearchParams<ItemSearch>) => {
    try {
      const data = await services.page({
        ...params,
        criteria: {
          ...params.criteria,
          advanceSearch: searchParams,
        },
      });
      return {
        success: !!data,
        total: data?.total,
        data: data?.items,
      };
    } catch (error: any) {
      message.error(error.message);
      return Promise.reject();
    }
  };

  useEffect(() => {
    setSearchParams((v) => ({ ...v, tendency: tendency }));
    actionRef.current?.reloadAndRest?.();
  }, [tendency]);

  return (
    // <ModalForm
    // onValuesChange={(changedValue) => {
    //   if ('tendency' in changedValue) {
    //     const { tendency } = changedValue;
    //     setSearchParams((v) => ({ ...v, tendency: tendency }));
    //     actionRef.current?.reloadAndRest?.();
    //   }
    // }}
    //   {...rest}
    //   title="Select item"
    //   submitter={false}
    // >
    <>
      <Row>
        <Col flex={'Auto'}>
          <Input.Search
            allowClear
            onSearch={(v) => {
              setSearchValue(v);
              actionRef.current?.reloadAndRest?.();
            }}
          />
        </Col>
      </Row>
      <ProList<Item>
        // showActions="hover"
        actionRef={actionRef}
        key="id"
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
        }}
        request={(pagination) =>
          onRequestHandler({
            criteria: {
              searchValue,
              advanceSearch: searchParams,
            },
            pagination,
          })
        }
        metas={{
          title: { dataIndex: 'itemName' },
          subTitle: { dataIndex: 'itemCode' },
          description: {
            render: (_, r) => (
              <Descriptions size="small">
                <Descriptions.Item label="Group">
                  {' '}
                  {r.item_group.map((i) => i.itemGroupName)}{' '}
                </Descriptions.Item>
                <Descriptions.Item label="UoM"> {r.inventoryUoM}</Descriptions.Item>
                <Descriptions.Item label="Business Unit"> {r.tendency}</Descriptions.Item>
                <Descriptions.Item label=""> {''}</Descriptions.Item>
              </Descriptions>
            ),
          },
          actions: {
            render: (_, row, index) => [
              <Badge
                key={`${row.id}-${index}`}
                style={{ top: -10 }}
                count={addedItems?.filter((it) => it === row.id).length}
              >
                <a
                  onClick={async () => {
                    const item = await services.detail(row.id);
                    onAddItem?.(item);
                    // console.log(item)
                  }}
                  key="link"
                >
                  Add
                </a>
              </Badge>,
            ],
          },
        }}
      />
    </>
  );
};
