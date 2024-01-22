import { TableViewSearchParams } from '@/components/DataCrud/TableView';
import { simpleRequestActions } from '@/services/model';
import { ItemDetail, ItemGroupListItem, ItemListItem } from '@/services/pro/data';
import { ItemAdvanceSearchParams } from '@/services/pro/req-params';
import { ItemServiceAPI } from '@/services/pro/services';
import { PlusCircleOutlined } from '@ant-design/icons';
import { DrawerForm } from '@ant-design/pro-components';
import { ModalFormProps, ProFormCheckbox, ProFormRadio } from '@ant-design/pro-form';
import ProList from '@ant-design/pro-list';
import { ActionType } from '@ant-design/pro-table';
import { Badge, Button, Col, Descriptions, Divider, Input, message, Row, Spin } from 'antd';
import CheckableTag from 'antd/es/tag/CheckableTag';
import { useEffect, useRef, useState } from 'react';

interface Props extends ModalFormProps {
  addedItems?: number[];
  onAddItem?: (data: ItemDetail) => void;
}

export default ({ addedItems, onAddItem, ...rest }: Props) => {
  const requestActions = simpleRequestActions();
  const services = ItemServiceAPI(requestActions);
  const actionRef = useRef<ActionType>();
  const [searchValue, setSearchValue] = useState<string>();
  const [searchParams, setSearchParams] = useState<ItemAdvanceSearchParams>({});
  const [itemGroups, setItemGroups] = useState<ItemGroupListItem[]>([]);
  const onRequestHandler = async (params: TableViewSearchParams<ItemAdvanceSearchParams>) => {
    try {
      const data = await services.list({
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
    if (rest.open) initData();
  }, [rest.open]);

  const initData = async () => {
    const data = await services.listAllItemGroup();
    setItemGroups(data);
  };

  return (
    <DrawerForm
      onValuesChange={(changedValue) => {
        if ('itemType' in changedValue) {
          const { itemType } = changedValue;
          setSearchParams((v) => ({ ...v, itemType: itemType }));
          actionRef.current?.reloadAndRest?.();
        }
      }}
      {...rest}
      title="Select item"
      resize={{
        maxWidth: window.innerWidth * 0.99,
        minWidth: 1000,
      }}
      submitter={false}
    >
      <Spin spinning={requestActions.request?.loading}>
        <ProFormCheckbox.Group name={'itemGroup'}>
          {itemGroups.map((it) => (
            <CheckableTag
              key={it.id}
              onChange={(checked) => {
                if (checked)
                  setSearchParams((v) => ({ ...v, groupIds: [...(v.groupIds || []), it.id] }));
                else
                  setSearchParams((v) => ({
                    ...v,
                    groupIds: v.groupIds?.filter((it1) => it1 !== it.id),
                  }));

                actionRef.current?.reloadAndRest?.();
              }}
              checked={searchParams.groupIds?.some((it1) => it1 == it.id) || false}
            >
              {it.itemGroupName}
            </CheckableTag>
          ))}
        </ProFormCheckbox.Group>
        <Row>
          <Col>
            <ProFormRadio.Group
              radioType="button"
              fieldProps={{
                buttonStyle: 'solid',
              }}
              initialValue={'ALL'}
              name={'itemType'}
              options={[
                { label: 'All', value: 'ALL' },
                { label: 'Product', value: 'PRODUCT' },
                { label: 'Service', value: 'SERVICE' },
              ]}
            />
          </Col>
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

        <Divider />
        <ProList<ItemListItem>
          // showActions="hover"
          actionRef={actionRef}
          key="id"
          pagination={{
            defaultPageSize: 20,
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
                  <Descriptions.Item label="Group"> {r.itemGroup.itemGroupName} </Descriptions.Item>
                  <Descriptions.Item label="Last purchase price">
                    {' '}
                    {r.lastPurchasePrice} - {r.lastPurchaseCurr}
                  </Descriptions.Item>
                  <Descriptions.Item label="UoM"> {r.buyUoM}</Descriptions.Item>
                  <Descriptions.Item label=""> {''}</Descriptions.Item>
                </Descriptions>
              ),
            },
            actions: {
              render: (_, row, index) => [
                <Badge
                  key={`${row.id}-${index}`}
                  style={{ top: -10 }}
                  count={addedItems?.filter((it) => it == row.id).length}
                >
                  <Button onClick={async () => {
                    const item = await services.detail(row.id);
                    onAddItem?.(item);
                  }}
                    type='link' icon={<PlusCircleOutlined />} />

                </Badge>,
              ],
            },
          }}
        />
      </Spin>
    </DrawerForm>
  );
};
