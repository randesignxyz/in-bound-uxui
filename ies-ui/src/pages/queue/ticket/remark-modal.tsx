import FormModalComp, { FormModalProps } from '@/components/FormModal';
import ProForm, { ProFormTextArea } from '@ant-design/pro-form';
import { Card } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useEffect } from 'react';

interface Props extends FormModalProps {
  id: number;
  onSave: (id: number, remarks: string) => void;
}

const RemarkModal: React.FC<Props> = ({ id, onSave, ...props }) => {
  const [form] = useForm<{ remarks: string }>();

  useEffect(() => {
    if (props.open) form.resetFields();
  }, [props.open]);

  return (
    <FormModalComp
      {...props}
      onResetForm={() => form.resetFields()}
      onSubmit={async () => {
        const dataForm = await form.validateFields();
        onSave(id, dataForm.remarks);
      }}
    >
      <Card>
        <ProForm form={form} submitter={false}>
          <ProFormTextArea rules={[{ required: true }]} label="Remarks" name={'remarks'} />
        </ProForm>
      </Card>
    </FormModalComp>
  );
};

export default RemarkModal;
