import { StarTwoTone } from '@ant-design/icons';
import {
  ModalForm,
  ModalFormProps,
  ProCard,
  ProDescriptions,
  ProForm,
  ProFormDigit,
  ProFormMoney,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Space, Table } from 'antd';
import { useForm } from 'antd/es/form/Form';
import { round, uniqueId } from 'lodash';
import { useEffect, useState } from 'react';
import { Item, PrItem, SaveQuotationItem } from './data';

type DataFormType = {
  qty: number;
  description?: string;
  uomId: number;
  price: number;
  amount: number;
  discount?: number;
  amountAfterDiscount: number;
};

type EditItemType = {
  key: string;
  description?: string;
  qty: number;
  uomId: number;
  price: number;
  amount: number;
  discount?: number;
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

  useEffect(() => {
    const qty =
      editData?.qty || item.prItems?.map((it) => it.qty).reduce((acc, it) => (acc += it), 0) || 1;
    const firstItem = item.prItems?.find((it) => it);
    const price = editData?.price || firstItem?.unitPrice || 0;
    const description = editData?.description || item.description;
    setSelectedRowKeys(editData?.prLinked || item.prItems?.map((it) => it.id) || []);

    form.setFieldsValue({
      qty: qty,
      price: price,
      description: description,
      amount: editData?.amount || price * qty,
      uomId: (item.uomList.find((it) => it.name == firstItem?.uom) || item.uomList.find((it) => it))
        ?.id,
      discount: editData?.discount || 0,
      amountAfterDiscount: editData?.amountAfterDiscount || price * qty,
    });

    return () => {
      form.resetFields();
      setSelectedRowKeys([]);
    };
  }, [props.open, item, editData]);
  return (
    <ModalForm
      form={form}
      title="Service"
      onFinish={async (dataForm) => {
        onSave(
          {
            key: editData?.key || uniqueId('quotation'),
            itemId: item.id,
            itemCode: item.itemCode,
            itemName: item.itemName,
            description: dataForm.description,
            qty: 1,
            uomId: dataForm.uomId,
            price: dataForm.amount,
            uomName: item.uomList.find((it) => it.id == dataForm.uomId)?.name || 'N/A',
            amount: dataForm.amount,
            discount: dataForm.discount,
            amountAfterDiscount: dataForm.amountAfterDiscount,
            item: item,
            refType: item.refType,
            prLinked: selectedRowKeys.map((it) => it as number),
          },
          true,
        );
        return true;
      }}
      width={1000}
      {...props}
      onValuesChange={(changedValues, values) => {
        if ('amount' in changedValues || 'discount' in changedValues) {
          const { amount, discount } = values;
          form.setFieldsValue({
            amountAfterDiscount: round(amount * (1 - (discount || 0) / 100), 2),
          });
        }
      }}
    >
      <ProCard direction="column" size="small">
        <ProCard size="small" bordered title="Service Info">
          <ProDescriptions<Item>
            dataSource={item}
            columns={[
              { title: 'Service Name', dataIndex: 'itemName' },
              { title: 'Description', dataIndex: 'description' },
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
                { title: 'Amount', align: 'right', render: (_, r) => r.amount },
              ]}
            />
          </ProCard>
        )}

        <ProCard size="small" boxShadow bordered>
          <ProForm.Group>
            <Space size={5}>
              <ProFormTextArea
                fieldProps={{
                  style: { width: 230 },
                  rows: 1,
                }}
                label="Description"
                name={'description'}
              />
              <ProFormMoney fieldProps={{ precision: 2 }} name={'amount'} label="Amount" />
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
