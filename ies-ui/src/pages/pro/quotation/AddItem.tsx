import { StarTwoTone } from '@ant-design/icons';
import {
  ModalForm,
  ModalFormProps,
  ProCard,
  ProDescriptions,
  ProForm,
  ProFormDigit,
  ProFormMoney,
  ProFormSelect,
} from '@ant-design/pro-components';
import { Space, Table } from 'antd';
import { useForm } from 'antd/es/form/Form';
import { round, uniqueId } from 'lodash';
import { useEffect, useState } from 'react';
import { Item, PrItem, SaveQuotationItem } from './data';

type DataFormType = {
  qty: number;
  uomId: number;
  price: number;
  amount: number;
  discount?: number;
  amountAfterDiscount: number;
};

type EditItemType = {
  key: string;
  qty: number;
  uomId: number;
  price: number;
  amount: number;
  discount?: number;
  description?: string;
  amountAfterDiscount: number;
  prLinked: number[];
};
export default ({
  item,
  editData,
  onSave,
  ...props
}: ModalFormProps<DataFormType> & {
  item: Item;
  editData?: EditItemType;
  onSave: (data: SaveQuotationItem, isService: boolean) => void;
}) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [form] = useForm<DataFormType>();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const qty =
      editData?.qty || item.prItems?.map((it) => it.qty).reduce((acc, it) => (acc += it), 0) || 1;
    const firstItem = item.prItems?.find((it) => it);
    const price = editData?.price || firstItem?.unitPrice || 0;
    setSelectedRowKeys(editData?.prLinked || item.prItems?.map((it) => it.id) || []);

    form.setFieldsValue({
      qty: qty,
      price: price,
      amount: editData?.amount || price * qty,
      uomId: item.uomList.find((it) => it.name == firstItem?.uom)?.id,
      discount: editData?.discount || 0,
      amountAfterDiscount: editData?.amountAfterDiscount || price * qty,
    });
    return () => {
      form.resetFields();
      setSelectedRowKeys([]);
    };
  }, [isOpen, item, editData]);

  return (
    <ModalForm
      form={form}
      title="Add Item"
      onOpenChange={setIsOpen}
      onFinish={async (dataForm) => {
        onSave(
          {
            key: editData?.key || uniqueId('quotation'),
            itemId: item.id,
            itemCode: item.itemCode,
            itemName: item.itemName,
            description: editData?.description || item.prItems?.find((it) => it)?.description,
            qty: dataForm.qty,
            uomId: dataForm.uomId,
            price: dataForm.price,
            uomName: item.uomList.find((it) => it.id == dataForm.uomId)?.name || 'N/A',
            amount: dataForm.amount,
            discount: dataForm.discount,
            amountAfterDiscount: dataForm.amountAfterDiscount,
            item: item,
            refType: item.refType,
            prLinked: selectedRowKeys.map((it) => it as number),
          },
          false,
        );
        return true;
      }}
      width={1000}
      {...props}
      onValuesChange={(changedValues, values) => {
        if ('qty' in changedValues || 'price' in changedValues || 'discount' in changedValues) {
          const { qty, price, discount } = values;

          form.setFieldsValue({
            amount: qty * price,
            amountAfterDiscount: round(qty * price * (1 - (discount || 0) / 100), 2),
          });
        }
      }}
    >
      <ProCard direction="column" size="small">
        <ProCard size="small" bordered title="Product Info">
          <ProDescriptions<Item>
            dataSource={item}
            size='small'
            columns={[
              { title: 'Item Code', dataIndex: 'itemCode' },
              { title: 'Item Name', dataIndex: 'itemName' },
              {
                title: 'Item Description',
                render: (_, r) =>
                  editData?.description || item.prItems?.find((it) => it)?.description,
              },
            ]}
          />
        </ProCard>
        {item.prItems && item.prItems.length > 0 && (
          <ProCard bordered size="small" title="Linked to Purchase Requisition">
            <Table<PrItem>
              size="small"
              rowKey={'id'}
              pagination={false}
              rowSelection={{
                selectedRowKeys: selectedRowKeys,
                onChange(selectedRowKeys) {
                  setSelectedRowKeys(selectedRowKeys);
                },
                type: 'checkbox',
              }}
              dataSource={item.prItems}
              columns={[
                {
                  title: 'Form No',
                  render: (_, r) => (
                    <Space>
                      {r.formNo} {r.default && <StarTwoTone />}
                    </Space>
                  ),
                },
                { title: 'Doc No', render: (_, r) => r.docNo },
                { title: 'Requested By', render: (_, r) => r.requestedBy },
                { title: 'Qty', align: 'right', render: (_, r) => r.qty },
                { title: 'uom', render: (_, r) => r.uom },
              ]}
            />
          </ProCard>
        )}

        <ProCard size="small" boxShadow bordered>
          <ProForm.Group>
            <Space size={5}>
              <ProFormDigit
                rules={[{ required: true }]}
                width={'xs'}
                name={'qty'}
                min={1}
                label="Quantity"
              />
              <ProFormSelect
                rules={[{ required: true }]}
                width={'xs'}
                options={item.uomList.map((it) => ({ label: it.name, value: it.id }))}
                name={'uomId'}
                label="UoM"
              />
              <ProFormMoney
                fieldProps={{ precision: 2 }}
                rules={[{ required: true }]}
                width={'xs'}
                name={'price'}
                label="Price"
              />
              <ProFormMoney
                fieldProps={{ precision: 2 }}
                disabled
                width={'sm'}
                name={'amount'}
                label="Amount"
              />
              <ProFormDigit
                fieldProps={{ precision: 2 }}
                min={0}
                max={100}
                width={'xs'}
                name={'discount'}
                label="Dis%"
              />
              <ProFormMoney
                fieldProps={{ precision: 2 }}
                disabled
                width={'sm'}
                name={'amountAfterDiscount'}
                label="Amount After Discount"
              />
            </Space>
          </ProForm.Group>
        </ProCard>
      </ProCard>
    </ModalForm>
  );
};
