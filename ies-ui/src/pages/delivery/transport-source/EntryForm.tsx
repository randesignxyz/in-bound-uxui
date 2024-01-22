import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { TransportSource } from '@/services/delivery/data';
import { ProFormCheckbox } from '@ant-design/pro-components';
import ProForm, { ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import { Card } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useEffect } from 'react';

interface Props extends FormModalProps {
  data?: TransportSource;
  onSave: (name: string, deliveryTracking?: boolean, description?: string) => void;
}

const TranporSourceEntryModal: React.FC<Props> = ({ onSave, data, ...props }) => {
  const [form] = useForm<{
    name: string;
    deliveryTracking?: boolean;
    description?: string;
  }>();

  useEffect(() => {
    props.open &&
      form.setFieldsValue({
        name: data?.name,
        deliveryTracking: data?.deliveryTracking,
        description: data?.description,
      });
  }, [props.open]);

  return (
    <FormModalComp
      width="500px"
      {...props}
      onSubmit={async () => {
        const dataForm = await form.validateFields();
        onSave?.(dataForm.name,dataForm.deliveryTracking , dataForm.description);
      }}
      onResetForm={() => {
        form.resetFields();
      }}
    >
      <Card>
        <ProForm form={form} submitter={false}>
          <ProFormText rules={[{ required: true }]} name={'name'} label="Name" help={<span />} />
          <ProFormCheckbox label = "Track Delivery" name={'deliveryTracking'}/>
          <ProFormTextArea name={'description'} label="Description" />
        </ProForm>
      </Card>
    </FormModalComp>
  );
};

export default TranporSourceEntryModal;
