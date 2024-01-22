import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { Driver, Truck } from '@/services/delivery/data';
import ProForm, { ProFormSelect, ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import { message, Modal } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useEffect } from 'react';

interface Props extends FormModalProps {
  driver: Driver;
  truck: Truck;
  onSave: (licensePlate: string, remarks: string) => void;
}

export default ({ driver, truck, onSave, ...props }: Props) => {
  const [form] = useForm<{
    licensePlate: string;
    remarks: string;
  }>();

  useEffect(() => {
    if (props.open) {
      form.setFieldsValue({
        licensePlate: truck.licensePlate,
      });
    }
    return () => {
      form.resetFields();
    };
  }, [props.open]);

  return (
    <FormModalComp
      title="Changing Truck"
      {...props}
      onResetForm={() => form.resetFields()}
      onSubmit={async () => {
        const formData = await form.validateFields();
        onSave(formData.licensePlate.trim(), formData.remarks);
      }}
    >
      <ProForm form={form} submitter={false}>
        {!driver.isQuest && (
          <ProFormSelect
            rules={[{ required: true }]}
            label="License Plate"
            name={'licensePlate'}
            options={driver.trucks?.map((it) => it.licensePlate)}
          />
        )}
        {driver.isQuest && (
          <ProFormText rules={[{ required: true }]} label="licensePlate" name="licensePlate" />
        )}
        <ProFormTextArea rules={[{ required: true }]} label="Remarks" name="remarks" />
      </ProForm>
    </FormModalComp>
  );
};
