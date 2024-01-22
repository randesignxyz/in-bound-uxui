import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { SaleInvoiceItemLess, SaleItem } from '@/services/sale/data';
import ProForm, { ProFormDigit, ProFormMoney, ProFormSelect } from '@ant-design/pro-form';
import { Card } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useEffect, useState } from 'react';
import numeral from 'numeral';
import { uniqueId } from 'lodash';

interface Props extends FormModalProps {
  data?: {
    //saleTypes?: LookupData[];
    productItems?: SaleItem[];
    typeProductItems?: { itemId: number; itemType: number }[];
  };
  actionHandlers: {
    onAddItem?: (item: SaleInvoiceItemLess) => void;
  };
}

const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

const ItemEntryFormModal: React.FC<Props> = ({ data, actionHandlers, ...props }) => {
  const [formItem] = useForm<SaleInvoiceItemLess>();

  const [itemType, setItemType] = useState<string>();

  const onSubmitActionHandler = async () => {
    const dataForm = await formItem.validateFields();
    const saleItem = data?.productItems?.find((it) => it.id === dataForm.itemId);
    const type = data?.typeProductItems?.find((it) => it.itemId === dataForm.itemId);
    const item: SaleInvoiceItemLess = {
      ...dataForm,
      key: uniqueId('sale-invoice-item'),
      itemCode: saleItem?.code || '',
      itemName: saleItem?.name || '',
      uom: 'CASE',
      unitPrice: dataForm.itemType === 'STD' ? dataForm.unitPrice : 0,
      amount: dataForm.itemType === 'STD' ? dataForm.quantity * dataForm.unitPrice : 0,
      // Todo
      // itemType: type?.itemType,

      stockCategoryId: type?.itemType,
    };
    actionHandlers.onAddItem?.(item);
  };

  const onValuesChange = (changedValues: any, values: SaleInvoiceItemLess) => {
    const { itemId, quantity, unitPrice, itemType } = changedValues;

    if (itemId && 'itemId' in values) {
      const saleItem = data?.productItems?.find((it) => it.id === values.itemId);
      let price = 0.0;
      if (values.itemType === 'STD') {
        price = saleItem?.price || 0;
      }
      const amount = price * (quantity || values.quantity || 0);
      formItem.setFieldsValue({
        unitPrice: price,
        amount: amount,
      });
    }
    if (quantity && 'quantity' in values) {
      const saleItem = data?.productItems?.find((it) => it.id === values.itemId);
      let price = 0.0;
      if (values.itemType === 'STD') {
        price = saleItem?.price || 0;
      }
      const amount = price * (quantity || 0);
      formItem.setFieldsValue({
        amount: amount,
      });
    }

    if (unitPrice && 'unitPrice' in values) {
      const amount = unitPrice * (values.quantity || 0);
      formItem.setFieldsValue({
        amount: amount,
      });
    }
    if (itemType && 'itemType' in values) {
      let price = 0.0;
      if (itemType === 'STD' && values.itemId) {
        const saleItem = data?.productItems?.find((it) => it.id === values.itemId);
        price = saleItem?.price || 0.0;
      }
      const amount = price * (values.quantity || 0);
      setItemType(itemType);
      formItem.setFieldsValue({
        unitPrice: price,
        amount: amount,
      });
    }
  };

  useEffect(() => {
    if (!props.open) return;
    formItem.setFieldsValue({
      itemType: 'STD',
      quantity: 1,
    });
    setItemType('STD');
    return () => {
      formItem.resetFields();
    };
  }, [props.open]);
  return (
    <FormModalComp
      {...props}
      width="450px"
      onResetForm={() => formItem.resetFields()}
      onSubmit={onSubmitActionHandler}
      okText={'Add'}
    >
      <Card size="small">
        <ProForm
          form={formItem}
          submitter={false}
          layout="horizontal"
          {...layout}
          onValuesChange={onValuesChange}
        >
          <ProFormSelect
            rules={[{ required: true }]}
            name="itemId"
            allowClear={false}
            label="Item Name"
            options={data?.productItems?.map((it) => ({ label: it.name, value: it.id }))}
            width="md"
          />
          <ProFormSelect
            rules={[{ required: true }]}
            name="itemType"
            allowClear={false}
            label="Type"
            options={['STD', 'TDO', 'TPO'].map((it) => ({ label: it, value: it }))}
            width="md"
          />
          <ProFormDigit
            rules={[{ required: true }]}
            name="quantity"
            label="Quantity"
            min={1}
            width="md"
          />
          <ProFormMoney
            // fieldProps={{
            //   formatter: (value) => {
            //     return numeral(value).format('$ 0,0.00');
            //   },
            // }}
            rules={[{ required: itemType === 'STD' }]}
            placeholder=""
            name="unitPrice"
            label="Sale Price"
            min={itemType === 'STD' ? 1 : 0}
            width="md"
            locale="en-US"
            disabled={itemType !== 'STD'}
          />
          <ProFormMoney
            fieldProps={{
              formatter: (value) => {
                return numeral(value).format('$ 0,0.00');
              },
            }}
            disabled
            name="amount"
            label="Amount"
            min={itemType === 'STD' ? 1 : 0}
            width="md"
            placeholder=""
          />
        </ProForm>
      </Card>
    </FormModalComp>
  );
};

export default ItemEntryFormModal;
