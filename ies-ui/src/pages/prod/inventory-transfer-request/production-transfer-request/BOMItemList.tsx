import { simpleRequestActions } from '@/services/model';
import {
  EditableFormInstance,
  EditableProTable,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { ActionType } from '@ant-design/pro-table';
import { Col, Row } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { BomItemSearch, Item } from '../data';
import { ItemServiceAPI } from '../service';

interface Props {
  onAddItem?: (data: Item[]) => void;
  updateQuantity?: (newQuantity: string) => void;
  quantity?: string;
  tendency: string;
}

export default ({ onAddItem, updateQuantity, tendency }: Props) => {
  // const [form] = useForm<Item>()
  const actionRef = useRef<ActionType>();
  const requestActions = simpleRequestActions();
  const services = ItemServiceAPI(requestActions);
  const editableFormRef = useRef<EditableFormInstance>();
  const [fatherId, setFatherID] = useState('');
  const [childItem, setChildItem] = useState<Item[]>([]);
  const [qty, setQty] = useState('');
  const [searchParams, setSearchParams] = useState<BomItemSearch>({
    tendency: tendency,
  });

  const getList = async () => {
    // Call the function to process table data when qty changes
    const itemcode = childItem.map((v) => v.itemCode);
    // console.log(itemcode)
    const itemList = [];
    for (let i = 0; i < itemcode.length; i++) {
      const item = await services.detailByCode(fatherId, itemcode[i], tendency);
      itemList.push(item);
    }
    onAddItem?.(itemList);
  };

  useEffect(() => {
    setSearchParams((v) => ({ ...v, tendency: tendency }));
    actionRef.current?.reloadAndRest?.();
  }, [tendency]);

  return (
    <>
      <Row gutter={6}>
        <Col span={16}>
          <ProFormSelect
            showSearch
            name="item"
            label="Item"
            rules={[{ required: true }]}
            request={async ({ keyWords }) => {
              const data = await services.page_bom({
                criteria: { searchValue: keyWords, advanceSearch: searchParams },
                pagination: { pageSize: 10 },
              });
              return data.items.map((obj) => ({
                value: obj.product_code,
                label: `${obj.product_name}`,
              }));
            }}
            fieldProps={{
              onChange: async (e: string) => {
                const data = await services.listChildItem(e, tendency);
                setFatherID(e);
                setChildItem(data);
              },
            }}
          />
        </Col>
        <Col span={8}>
          <ProFormText
            hasFeedback={false}
            label="Qty"
            name={'qty'}
            rules={[{ required: true }]}
            fieldProps={{
              onChange: async (data) => {
                updateQuantity?.(data.target.value);
                setQty(data.target.value);
              },
              onBlur: async (data) => {
                console.log(data.target.value);
                updateQuantity?.(data.target.value);
                getList();
                // updateQuantity?.(data.target.value);
              },
            }}
          />
        </Col>
      </Row>
      <EditableProTable
        size="small"
        // name={'childItem'}
        search={false}
        rowKey="id"
        editable={{
          type: 'multiple',
          editableKeys: childItem.map((it) => it.id),
          // onValuesChange: (_, recordList) => {
          //   setItems(recordList.map(it => ({ ...it })));
          // },
        }}
        editableFormRef={editableFormRef}
        value={childItem}
        recordCreatorProps={false}
        pagination={false}
        columns={[
          { title: 'No', render: (_, r, index) => index + 1, editable: false, width: 70 },
          { title: 'Item Code', dataIndex: 'itemCode', editable: false },
          { title: 'Item Name', dataIndex: 'itemName', editable: false },
          {
            title: 'Quantity',
            dataIndex: 'quantity',
            render: (_, r) => {
              const firstChildItem = r.childItem && r.childItem.length > 0 ? r.childItem[0] : null;
              return firstChildItem && qty ? firstChildItem.quantity * parseInt(qty) : 0;
            },
            editable: false,
          },
          { title: 'UoM', dataIndex: 'inventoryUoM', editable: false, width: 60 },
          // { title: 'Remark', dataIndex: 'remark' },
        ]}
      />
    </>
  );
};
