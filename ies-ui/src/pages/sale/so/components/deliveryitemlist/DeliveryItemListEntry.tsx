import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { AddressInfo } from '@/services/crm/data';
import ProForm, {
  ProFormDatePicker,
  ProFormDigit,
  ProFormGroup,
  ProFormList,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-form';
import { Card, message } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { sumBy } from 'lodash';
import { useEffect } from 'react';
import { DeliveryEntry } from '../../reducer';

interface Props extends FormModalProps {
  data?: {
    addressList?: AddressInfo[];
    default?: DeliveryEntry;
    currentDelivery?: DeliveryEntry;
  };
  actionHandlers?: {
    onSaveHandlers?: (itemList: DeliveryEntry) => void;
  };
}

const DeliveryItemListEntry: React.FC<Props> = ({ data, actionHandlers, ...props }) => {
  const [form] = useForm<DeliveryEntry>();
  useEffect(() => {
    if (!props.open) return;
    initFormData();
    return () => {
      form.resetFields();
    };
  }, [props.open]);

  const initFormData = () => {
    const initData = data?.currentDelivery ? { ...data?.currentDelivery } : data?.default;
    form.setFieldsValue({
      deliveryDate: initData?.deliveryDate,
      shippingAddressId: initData?.shippingAddressId,
      itemList: initData?.itemList,
    });
  };

  const onSaveActionHandler = async () => {
    try {
      const dataForm = await form.validateFields();
      if (sumBy(dataForm.itemList, (it) => it.qty) <= 0) {
        message.error('No item quantity.');
        return;
      }
      const dlv: DeliveryEntry = {
        key: data?.currentDelivery?.key,
        shippingAddressId: dataForm.shippingAddressId,
        shippingAddressCode: data?.addressList?.find((it) => it.id === dataForm.shippingAddressId)
          ?.address,
        deliveryDate: dataForm.deliveryDate,
        itemList: dataForm.itemList.filter((it) => it.qty > 0),
      };

      actionHandlers?.onSaveHandlers?.(dlv);
    } catch (error) {
      message.error('Invalid data');
    }
  };

  return (
    <FormModalComp
      onResetForm={initFormData}
      okText={data?.currentDelivery ? 'Edit' : 'Add'}
      onSubmit={onSaveActionHandler}
      {...props}
    >
      <ProForm submitter={false} form={form}>
        <Card size="small">
          <ProFormGroup title="Delivery">
            <ProFormDatePicker
              rules={[{ required: true }]}
              allowClear={false}
              width={200}
              help={<span />}
              label="Delivery Date"
              name="deliveryDate"
            />
            <ProFormSelect
              help={<span />}
              label="Shipping Address"
              name="shippingAddressId"
              rules={[{ required: true }]}
              showSearch
              width="lg"
              allowClear={false}
              fieldProps={{
                defaultActiveFirstOption: true,
                popupMatchSelectWidth: 300,
                filterOption: (input, option) =>
                  (option?.label?.toString() || '').toLowerCase().indexOf(input.toLowerCase()) >= 0,
              }}
              options={data?.addressList?.map((item) => {
                return { value: item.id, label: item.address };
              })}
            />
          </ProFormGroup>
          <ProForm.Group label="Line Items">
            <ProFormList
              creatorButtonProps={false}
              copyIconProps={false}
              deleteIconProps={false}
              name="itemList"
              itemRender={(_, listMeta) => {
                const maxQtyDefault =
                  data?.default?.itemList.find(
                    (it) =>
                      it.itemId === listMeta.record.itemId && it.type === listMeta.record.type,
                  )?.qty || 0;
                const maxCurrent =
                  data?.currentDelivery?.itemList.find(
                    (it) =>
                      it.itemId === listMeta.record.itemId && it.type === listMeta.record.type,
                  )?.qty || 0;
                const max = maxQtyDefault + maxCurrent;
                return (
                  <ProForm.Group>
                    <ProFormText
                      label={listMeta.index === 0 && 'Item Code'}
                      width={200}
                      disabled
                      name="itemCode"
                    />
                    <ProFormText
                      label={listMeta.index === 0 && 'Description'}
                      width={200}
                      disabled
                      name="itemDesc"
                    />
                    <ProFormText
                      label={listMeta.index === 0 && 'Type'}
                      disabled
                      name="type"
                      width={70}
                    />
                    <ProFormDigit
                      label={listMeta.index === 0 && 'Quantity'}
                      width={100}
                      min={0}
                      max={max < 0 ? 0 : max}
                      name="qty"
                    />
                    <ProFormText
                      label={listMeta.index === 0 && 'Remark'}
                      width={200}
                      name="remarks"
                    />
                  </ProForm.Group>
                );
              }}
              children={undefined}
            />
          </ProForm.Group>
        </Card>
      </ProForm>
    </FormModalComp>
  );
};

export default DeliveryItemListEntry;
