import FormModalComp, { FormModalProps } from '@/components/FormModal';
import ProForm, { ProFormTextArea } from '@ant-design/pro-form';
import { message } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useEffect } from 'react';

interface Props extends FormModalProps {
  onDelete?: (remarks: string) => void;
}

const DeleteVisitPlanModal: React.FC<Props> = ({ onDelete, ...props }) => {
  useEffect(() => {
    if (!props.open) return;
    return () => {
      form.resetFields();
    };
  }, [props.open]);

  const [form] = useForm<{ remarks: string }>();
  return (
    <FormModalComp
      {...props}
      onResetForm={() => form.resetFields()}
      onSubmit={async () => {
        try {
          const dataForm = await form.validateFields();
          onDelete?.(dataForm.remarks);
        } catch (error: any) {
          message.error(error.message || 'Invalid data.');
        }
      }}
    >
      <ProForm form={form} submitter={false}>
        <ProFormTextArea rules={[{ required: true }]} label="Remarks" name="remarks" />
      </ProForm>
    </FormModalComp>
  );
};

export default DeleteVisitPlanModal;
