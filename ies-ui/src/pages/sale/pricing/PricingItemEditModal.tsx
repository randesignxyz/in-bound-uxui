import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { ProFormField } from '@ant-design/pro-components';
import ProForm from '@ant-design/pro-form';
import { Button } from 'antd';
import { useForm } from 'antd/es/form/Form';
import { useEffect } from 'react';
import { ItemSalesLinePriceDto, ItemSalesLinePriceParam } from './data';

export interface PricingItemEditProps extends FormModalProps {
  item?: ItemSalesLinePriceDto;
  actionHandlers?: {
    onSave: (actions: ItemSalesLinePriceParam | undefined) => void;
  };
}

const layout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 14 },
};

const PricingItemEditModal: React.FC<PricingItemEditProps> = ({
  actionHandlers,
  item,
  ...rest
}) => {
  const [form] = useForm<ItemSalesLinePriceParam>();

  useEffect(() => {
    if (!rest.open) return;
    if (item !== undefined) {
      form.setFieldsValue({
        id: item.id ?? 0,
        productCode: item.productCode,
        productId: item.productId,
        productName: item.productName,
        unitPrice: item.unitPrice,
        unitPriceAfterDiscount: item.unitPriceAfterDiscount,
        currency: item.currencyCode ?? '',
      });
    }

    // return () => {
    //   form.resetFields();
    // };
    //form.setFieldsValue({ empNo: seCode });
  }, [rest.open]);
  return (
    <FormModalComp
      {...rest}
      title={item?.productName}
      width="600px"
      footer={[
        <Button key="reset" onClick={() => rest.onCancel && rest.onCancel()}>
          Cancel
        </Button>,
        <Button
          loading={rest.confirmLoading}
          disabled={rest.disabled}
          key="submit"
          type="primary"
          onClick={async () => {
            const values = await form.validateFields();
            actionHandlers?.onSave(values);
          }}
        >
          Update
        </Button>,
      ]}
    >
      <ProForm form={form} submitter={false} autoFocusFirstInput {...layout} layout="horizontal">
        <ProFormField
          name="unitPrice"
          label="Unit Price"
          width={'lg'}
          required
          valueType={{
            type: 'money',
            locale: 'en-US',
          }}
        />
        <ProFormField
          name="unitPriceAfterDiscount"
          label="Unit Price After Discount"
          required
          width={'lg'}
          valueType={{
            type: 'money',
            locale: 'en-US',
          }}
        />
      </ProForm>
    </FormModalComp>
  );
};

export default PricingItemEditModal;
