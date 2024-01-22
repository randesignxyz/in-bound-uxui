import { LookupDataItem } from '@/services/data';
import { DeliveryAdvanceSearchParams, SoDeliveryMethod } from '@/services/sale/data';
import ProForm, { ProFormDateRangePicker, ProFormField, ProFormSelect } from '@ant-design/pro-form';
import { Drawer, DrawerProps } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useEffect } from 'react';

interface Props extends DrawerProps {
  initData?: DeliveryAdvanceSearchParams;
  deliveryMethodList?: SoDeliveryMethod[];
  salespersons?: LookupDataItem[];
  onSearch: (params: DeliveryAdvanceSearchParams) => void;
  onReset: () => void;
}

const AdvanceSearch: React.FC<Props> = ({
  initData,
  onSearch,
  onReset,
  salespersons,
  deliveryMethodList,
  ...props
}) => {
  const [form] = useForm<DeliveryAdvanceSearchParams>();
  useEffect(() => {
    if (!props.open) return;
    form.setFieldsValue({ ...initData });
  }, [props.open]);

  return (
    <Drawer {...props}>
      <ProForm
        form={form}
        onReset={() => onReset()}
        submitter={{
          onSubmit: async () => {
            const data = await form.validateFields();
            onSearch(data);
          },
        }}
      >
        <ProFormSelect
          label="Salesperson"
          name="salespersonId"
          allowClear
          showSearch
          options={salespersons?.map((it) => {
            return { value: it.id, label: [it.code, it.name].join('-') };
          })}
        />

        <ProFormSelect
          label="Delivery Method"
          name="deliveryMethodId"
          allowClear
          showSearch
          options={deliveryMethodList?.map((it) => {
            return { value: it.id, label: it.name };
          })}
        />

        <ProFormField label="Sale Order Number" name="saleOrderNum" allowClear />

        <ProFormDateRangePicker label="Shipping Date (From - To)" name="dates" />
      </ProForm>
    </Drawer>
  );
};

export default AdvanceSearch;
