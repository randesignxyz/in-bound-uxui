import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { LookupDataItem } from '@/services/data';
import { StockControlItemLess } from '@/services/sale/data';
import ProForm, {
  ProFormDatePicker,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-form';
import { Card, message } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { uniqueId } from 'lodash';
import { useEffect, useState } from 'react';

const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};

interface Props extends FormModalProps {
  data: {
    typeId?: number;
    seq: number;
    slectedItem?: StockControlItemLess;
    types?: LookupDataItem[];
    typeProductItems?: { type: number; value: LookupDataItem[] }[];
    keyStr: string;
  };
  actionHandlers: {
    onAddItem?: (item: StockControlItemLess) => void;
  };
}

const ItemEntryFormModal: React.FC<Props> = ({ data, actionHandlers, loading, ...props }) => {
  const [formStock] = useForm<StockControlItemLess>();
  // const uomList = [{ id: 1, name: 'Case' }];

  const [productItems, setProductItems] = useState<LookupDataItem[]>([]);
  const [selectedType, setSelectedType] = useState<number>();
  // const [selectProductItems, setSelectedProductItems] = useState<LookupDataItem>();

  useEffect(() => {
    if (!props.open) return;
    formStock.resetFields();
    setSelectedType(undefined);
    setProductItems([]);
    if (data.typeId) {
      formStock.setFieldsValue({ itemType: data.typeId });
      const items = data.typeProductItems?.find((it) => it.type === data.typeId)?.value || [];
      setProductItems(items);
      setSelectedType(data.typeId);
    }

    return () => {
      formStock.resetFields();
    };
  }, [props.open]);

  const onValuesChange = (changedValues: any, values: StockControlItemLess) => {
    const { itemType, itemQuantity } = changedValues;
    if ('itemType' in changedValues) {
      const items = data.typeProductItems?.find((it) => it.type === itemType)?.value || [];
      setProductItems(items);
      setSelectedType(itemType);
      formStock.setFieldsValue({
        itemId: undefined,
        expiredDate: undefined,
        itemQuantity: undefined,
      });
    }
    if ('itemQuantity' in changedValues && itemQuantity > 1000) {
      message.error('Quantity is limit 1000.');
    }
  };

  const onSubmitActionHandler = async () => {
    const dataForm = await formStock.validateFields();
    const item = productItems.find((it) => it.id === dataForm.itemId);
    if (!item) {
      message.error('Item is not found.');
      return;
    }
    const stockType = data.types?.find((it) => it.id === dataForm.itemType);
    if (!stockType) {
      message.error('Type is not found.');
      return;
    }

    const stockItem: StockControlItemLess = {
      key: uniqueId(data.keyStr),
      index: data.seq,
      itemId: dataForm.itemId,
      itemName: item.name,
      itemQuantity: dataForm.itemQuantity,
      expiredDate: dataForm.expiredDate,
      type: stockType.name,
      itemType: dataForm.itemType,
      remark: dataForm.remark,
      batchNo: dataForm.batchNo,
    };
    if (actionHandlers.onAddItem) actionHandlers.onAddItem(stockItem);
  };

  return (
    <FormModalComp
      {...props}
      width="500px"
      onResetForm={formStock.resetFields}
      onSubmit={onSubmitActionHandler}
      okText={data.slectedItem ? 'Edit' : 'Add'}
      title="Product Line Item"
    >
      <Card size="small">
        <ProForm<StockControlItemLess>
          form={formStock}
          onValuesChange={onValuesChange}
          {...layout}
          layout="horizontal"
          submitter={false}
        >
          <ProFormSelect
            disabled={data.typeId ? true : false}
            rules={[{ required: true }]}
            name="itemType"
            allowClear={false}
            label="Type"
            options={data.types?.map((it) => ({ label: it.name, value: it.id }))}
            width="lg"
          />
          <ProFormText
            disabled={selectedType === 133}
            rules={[{ required: true }]}
            label="Batch #"
            name="batchNo"
            width="lg"
          />
          <ProFormSelect
            rules={[{ required: true }]}
            name="itemId"
            allowClear={false}
            label="Item Name"
            options={productItems?.map((it) => ({ label: it.name, value: it.id }))}
            width="lg"
          />
          <ProFormDigit
            rules={[{ required: true }]}
            name="itemQuantity"
            label="Quantity"
            min={1}
            width="lg"
          />
          <ProFormDatePicker
            disabled={selectedType === 133}
            name="expiredDate"
            label="Expired Date"
            rules={[{ required: selectedType === 132 }]}
            width="lg"
          />
          <ProFormTextArea name="remarks" label="Remarks" width="lg" />
        </ProForm>
      </Card>
    </FormModalComp>
  );
};

export default ItemEntryFormModal;
