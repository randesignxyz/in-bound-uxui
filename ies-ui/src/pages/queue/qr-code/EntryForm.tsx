import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { QRCode } from '@/services/delivery/data';
import ProForm, { ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import { Card } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useEffect } from 'react';

interface Props extends FormModalProps {
  data?: QRCode;
  onSave: (name: string, qrCode: string, description?: string) => void;
}

const QRCodeEntryModal: React.FC<Props> = ({ onSave, data, ...props }) => {
  const [form] = useForm<{
    name: string;
    code: string;
    description?: string;
  }>();

  useEffect(() => {
    if (!props.open) return;
    form.setFieldsValue({
      code: data?.code,
      name: data?.name,
      description: data?.description,
    });
  }, [props.open]);

  return (
    <FormModalComp
      width="500px"
      {...props}
      onSubmit={async () => {
        const dataForm = await form.validateFields();
        onSave?.(dataForm.name, dataForm.code, dataForm.description);
      }}
      onResetForm={() => {
        form.resetFields();
      }}
    >
      <Card>
        <ProForm form={form} submitter={false}>
          <ProFormText rules={[{ required: true }]} name={'code'} label="QR Code" help={<span />} />
          <ProFormText rules={[{ required: true }]} name={'name'} label="Name" help={<span />} />
          <ProFormTextArea name={'description'} label="Description" />
        </ProForm>
      </Card>
    </FormModalComp>
  );
};

export default QRCodeEntryModal;
