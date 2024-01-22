import FormModalComp, { FormModalProps } from '@/components/FormModal';
import ProForm, { ProFormTextArea } from '@ant-design/pro-form';
import { useForm } from 'antd/lib/form/Form';
import { useEffect } from 'react';

interface Props extends FormModalProps {
  onSave?: (description: string) => void;
}

const UserCommentEntryModal: React.FC<Props> = ({ onSave, ...props }) => {
  const [form] = useForm<{ description: string }>();

  useEffect(() => {
    return () => {
      form.resetFields();
    };
  }, [props.open]);
  return (
    <FormModalComp
      {...props}
      onResetForm={() => form.resetFields()}
      onSubmit={async () => {
        const formData = await form.validateFields();
        onSave?.(formData.description);
      }}
    >
      <ProForm form={form} submitter={false}>
        <ProFormTextArea rules={[{ required: true }]} label="Description" name="description" />
      </ProForm>
    </FormModalComp>
  );
};

export default UserCommentEntryModal;
