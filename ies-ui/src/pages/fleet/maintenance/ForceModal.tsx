import { ModalForm, ModalFormProps, ProFormTextArea } from '@ant-design/pro-components';
import { useForm } from 'antd/es/form/Form';
import { MaintenanceStatus, MaintenneceDTO } from './data';

interface Props extends ModalFormProps {
  onSave: (data: MaintenanceStatus) => void;
  data?: MaintenneceDTO;
}

export default ({ onSave, data, ...props }: Props) => {
  const [form] = useForm<MaintenanceStatus>();

  return (
    <ModalForm
      form={form}
      width={400}
      onFinish={async () => {
        const dataForm = await form.validateFields();
        const entry = {
          ...dataForm,
          id: data?.id || '',
          vehicleId:data?.vehicle?.id,
          status: data?.status === 'Void' ? 'Close' : 'Void',
        };
        onSave(entry);
      }}
      {...props}
      title={'Void Meter Entry'}
    >
      <ProFormTextArea name="remark" rules={[{ required: true, max: 255 }]} />
    </ModalForm>
  );
};
