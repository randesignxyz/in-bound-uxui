import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { VehicleLess } from '@/services/sale/data';
import ProForm, { ProFormSelect, ProFormText } from '@ant-design/pro-form';
import { Card, message } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useEffect } from 'react';

interface VehicleFormModelProps extends FormModalProps {
  actionHandlers?: {
    onSave?: (item: VehicleLess) => void;
  };
}

const layout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 13 },
};

const VehicleFormModal: React.FC<VehicleFormModelProps> = ({ actionHandlers, ...props }) => {
  const [form] = useForm<VehicleLess>();

  const onSubmitActionHandler = async () => {
    try {
      const dataForm = await form.validateFields();
      actionHandlers && actionHandlers.onSave && actionHandlers.onSave(dataForm);
    } catch (err: any) {
      message.error('Required field');
    }
  };

  useEffect(() => {
    if (!props.open) return;

    form.resetFields();
  }, [props.open]);

  return (
    <FormModalComp
      {...props}
      width="400px"
      onResetForm={() => form.resetFields()}
      onSubmit={onSubmitActionHandler}
      okText={'Add New'}
    >
      <Card size="small">
        <ProForm<VehicleLess> form={form} {...layout} layout="horizontal" submitter={false}>
          <ProFormText
            rules={[{ required: true }]}
            help={<span />}
            placeholder="Please Enter"
            label="Plate Number"
            name="plateNumber"
            width="sm"
          />
          <ProFormSelect
            help={<span />}
            rules={[{ required: true }]}
            width="sm"
            label="Type"
            name="type"
            options={['Van', 'Tuk Tuk'].map((it) => ({ label: it, value: it }))}
          />
        </ProForm>
      </Card>
    </FormModalComp>
  );
};

export default VehicleFormModal;
