import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { AddressInfo } from '@/services/crm/data';
import ProForm, {
  ProFormDatePicker,
  ProFormDependency,
  ProFormDigit,
  ProFormGroup,
  ProFormList,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
} from '@ant-design/pro-form';
import { Card, message, Switch } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { sumBy } from 'lodash';
import { useEffect } from 'react';
import { DeliveryEntry } from '../../reducer';
import moment from 'moment';

interface Props extends FormModalProps {
  data?: {
    addressList?: AddressInfo[];
    default?: DeliveryEntry;
    currentDelivery?: DeliveryEntry;
    so_status?: string
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

  // const initFormData = () => {
  //   const initData = data?.currentDelivery ? { ...data?.currentDelivery } : data?.default;
  //   form.setFieldsValue({
  //     deliveryDate: initData?.deliveryDate,
  //     shippingAddressId: initData?.shippingAddressId,
  //     itemList: initData?.itemList,
  //   });
  // };

  const initFormData = () => {
    const initData = data?.currentDelivery
      ? { ...data?.currentDelivery }
      : data?.default;

    const isTBC =
      initData?.deliveryDate &&
      moment(initData.deliveryDate).isSame(
        moment('2099-12-31'),
        'day'
      );

    form.setFieldsValue({
      deliveryDate: initData?.deliveryDate
        ? moment(initData.deliveryDate)
        : undefined,
      isTBC: isTBC,
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
        deliveryId: data?.currentDelivery?.id
      };
      actionHandlers?.onSaveHandlers?.(dlv);
    } catch (error) {
      message.error('Invalid data');
    }
  };

  return (
    <FormModalComp
      onResetForm={initFormData}
      okText={data?.currentDelivery ? 'Update' : 'Add'}
      onSubmit={onSaveActionHandler}
      {...props}
    >
      <ProForm submitter={false} form={form} initialValues={{
        isTBC: false,
      }}>
        <Card size="small" >
          <ProFormGroup title="Delivery">
            {/* <ProFormDependency name={["isTBC"]}>
              {({ isTBC }) => (
                <ProFormDatePicker
                  rules={[{ required: true }]}
                  allowClear={false}
                  width={200}
                  help={<span />}
                  format="YYYY-MM-DD HH:mm" 
                  showTime
                  label="Delivery Date"
                  name="deliveryDate"
                  fieldProps={{
                    disabled: isTBC,
                  }}
                />
              )}
            </ProFormDependency> */}
            <ProFormDependency name={['isTBC']}>
              {({ isTBC }) => (
                <ProFormDatePicker
                  rules={[{ required: true }]}
                  allowClear={false}
                  width={200}
                  help={<span />}
                  format="YYYY-MM-DD HH:mm"
                  showTime
                  label="Delivery Date"
                  name="deliveryDate"
                  fieldProps={{ disabled: isTBC }}
                  transform={(value: any) => ({ deliveryDate: value })}
                />
              )}
            </ProFormDependency>
            <ProFormSwitch
              label="To Be Confirm"
              name="isTBC"
              fieldProps={{
                onChange: (checked) => {
                  if (checked) {
                    form.setFieldsValue({
                      deliveryDate: moment("2099-12-31"),
                    });
                  } else {
                    form.setFieldsValue({
                      deliveryDate: moment(),
                    });
                  }
                },
              }}
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
                console.log(listMeta)
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
                      disabled={data?.so_status?.toLocaleLowerCase() == 'posted'}
                      width={100}
                      min={0}
                      max={max < 0 ? 0 : max}
                      name="qty"
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
