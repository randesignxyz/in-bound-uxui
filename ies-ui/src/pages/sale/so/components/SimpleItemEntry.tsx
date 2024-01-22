import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { BudgetCodeLess, ProductItem, SoLineItemEntry } from '@/services/sale/data';
import ProForm, {
  ProFormDigit,
  ProFormField,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-form';
import { uniqueId } from 'lodash';
import { useForm } from 'antd/lib/form/Form';
import { useEffect, useState } from 'react';
import { Card, Spin } from 'antd';
import { SoItemEntry } from '../reducer';
import { LookupDataItem } from '@/services/data';

const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};

interface Props extends FormModalProps {
  data: {
    seq?: number;
    productItem?: ProductItem;
    soLineItem?: SoItemEntry;
    budgetList?: BudgetCodeLess[];
    defaultSaleType?: LookupDataItem;
    saleTypes?: LookupDataItem[];
  };
  actionHandlers: {
    onAddItem?: (soItem: SoItemEntry) => void;
  };
}

const SimpleItemEntry: React.FC<Props> = ({ data, loading, actionHandlers, ...props }) => {
  const [form] = useForm<SoLineItemEntry>();
  const uomList = [{ id: 1, name: 'Case' }];
  const [saleType, setSaleType] = useState<string | undefined>(data.defaultSaleType?.code);
  const [budgetCodes, setBudgetCodes] = useState<LookupDataItem[]>([]);

  useEffect(() => {
    if (!props.open) return;
    onResetActionHandler();
    return () => {
      form.resetFields();
    };
  }, [props.open]);

  // useEffect(() => {
  //   if (saleType !== undefined && saleType !== '') {
  //     const budgetCode = getSelectAuto(saleType)
  //     form.setFieldsValue({
  //       budgetCode: budgetCode
  //     })
  //   }
  // }, [saleType])

  const onResetActionHandler = () => {
    const typeCode = data.soLineItem?.type || data.defaultSaleType?.code;
    setSaleType(typeCode);
    const typeId = data.saleTypes?.find((it) => it.code === typeCode)?.id;
    setBudgetCodes(data.budgetList?.find((it) => it.saleType === typeId)?.budgets || []);

    const dataForm = data.soLineItem
      ? {
          id: data.soLineItem.itemId,
          itemName: [data.soLineItem.itemCode, data.soLineItem.description].join('-'),
          uomId: data.soLineItem.uomId,
          qty: data.soLineItem.qty,
          price: data.soLineItem.price,
          type: data.soLineItem.type,
          amount: data.soLineItem.amount,
          remarks: data.soLineItem.remarks,
          categoryId: data.soLineItem.categoryId,
          budgetCode: data.soLineItem.budgetCode,
          discountPercent: data.soLineItem.discountPercent,
        }
      : {
          id: data.productItem?.id,
          uomId: data.productItem?.uomId,
          qty: 1,
          price: data.productItem?.priceAfterDiscount || data.productItem?.price,
          type: data.defaultSaleType?.code,
          itemName: [data.productItem?.code, data.productItem?.name].join('-'),
          amount: data.productItem?.priceAfterDiscount || data.productItem?.price,
          categoryId: data.productItem?.itemCategoryId,
          discountPercent: data.productItem?.discountPercent,
        };
    form.setFieldsValue(dataForm);
  };
  const onValuesChange = (changedValues: any, values: SoLineItemEntry) => {
    const { type } = changedValues;
    if ('type' in changedValues) {
      const typeId = data.saleTypes?.find((it) => it.code === type)?.id;
      const budgetCodes = data.budgetList?.find((it) => it.saleType === typeId)?.budgets || [];
      setBudgetCodes(budgetCodes);
      setSaleType(type);
      if (type === data.defaultSaleType?.code) {
        const price = data.productItem?.priceAfterDiscount || data.productItem?.price || 0;
        const amount = values.qty * price;
        form.setFieldsValue({
          amount: amount,
          price: data.productItem?.priceAfterDiscount || data.productItem?.price,
          discountPercent: data.productItem?.discountPercent,
          budgetCode: undefined,
        });
      } else {
        form.setFieldsValue({
          price: 0,
          amount: 0,
          discountPercent: 0,
          budgetCode: budgetCodes.length === 1 ? budgetCodes[0].code : undefined,
        });
      }
    }

    if ('qty' in changedValues || 'price' in changedValues) {
      if (values.type === data.defaultSaleType?.code) {
        const amount = values.qty * values.price;
        form.setFieldsValue({
          amount: amount,
          price: data.productItem?.priceAfterDiscount || data.productItem?.price,
          discountPercent: data.productItem?.discountPercent,
        });
      } else {
        form.setFieldsValue({
          price: 0,
          amount: 0,
          discountPercent: 0,
        });
      }
    }
  };

  const onSubmitActionHandler = async () => {
    if (!data.productItem) throw Error('Not product item found.');
    const dataForm = await form.validateFields();
    const uom = uomList.find((it) => it.id === dataForm.uomId);

    if (!uom) throw new Error('UoM not found.');

    const soItem: SoItemEntry = {
      key: data.soLineItem?.key || uniqueId('soitem'),
      itemId: data.productItem.id,
      seq: data.soLineItem?.seq || data.seq,
      itemCode: data.productItem?.code,
      description: data.productItem.name,
      uomId: dataForm.uomId,
      uom: uom.name,
      qty: dataForm.qty,
      price: dataForm.price,
      amount: dataForm.amount,
      remarks: dataForm.remarks,
      discountAmount: ((data.productItem.discountPercent || 0) / 100) * data.productItem.price,
      discountPercent: data.productItem.discountPercent,
      type: dataForm.type,
      totalAmount: dataForm.amount,
      parentKey: data.soLineItem?.parentKey,
      categoryId: data.productItem?.itemCategoryId,
      budgetCode: dataForm.budgetCode,
    };
    actionHandlers.onAddItem?.(soItem);
  };

  return (
    <FormModalComp
      {...props}
      onResetForm={onResetActionHandler}
      onSubmit={onSubmitActionHandler}
      title="Product Line Item"
      okText={data.soLineItem ? 'Edit' : 'Add'}
    >
      <Spin spinning={loading}>
        <Card size="small">
          <ProForm
            form={form}
            onValuesChange={onValuesChange}
            {...layout}
            layout="horizontal"
            submitter={false}
          >
            <ProFormSelect
              rules={[{ required: true }]}
              name="type"
              allowClear={false}
              label="Type"
              options={data.saleTypes?.map((it) => ({ label: it.code!, value: it.code! }))}
            />
            {/* <ProFormSelect
                name='id'
                label="Item Name"
                options={[{ value: data.productItem?.id || 0, label: [data.productItem?.code, data.productItem?.name].join('-') }]}
            /> */}
            <ProFormText readonly label="Item Name" name="itemName" />
            <ProFormDigit rules={[{ required: true }]} name="qty" label="Quantity" min={1} />
            <ProFormSelect
              name="budgetCode"
              label="Budget Code"
              // allowClear={showComponent().component === 'COMBO'}
              rules={[{ required: saleType === 'TPO' }]}
              options={budgetCodes.map((it) => ({
                label: it.code,
                value: it.code || '',
              }))}
            />
            <ProFormSelect
              name="uomId"
              label="UoM"
              rules={[{ required: true }]}
              allowClear={false}
              options={[{ value: 1, label: 'Each' }]}
            />
            <ProFormField
              readonly
              rules={[{ required: true }]}
              name="price"
              label="Price"
              // min={0}
              valueType={{
                type: 'money',
                locale: 'en-US',
              }}
            />
            <ProFormField
              readonly
              name="amount"
              label="Amount"
              valueType={{
                type: 'money',
                locale: 'en-US',
              }}
            />
            <ProFormTextArea name="remarks" label="Remarks" />
          </ProForm>
        </Card>
      </Spin>
    </FormModalComp>
  );
};

export default SimpleItemEntry;
