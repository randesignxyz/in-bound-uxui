import FormModalComp, { FormModalProps } from '@/components/FormModal';
import ProForm, { ProFormTextArea } from '@ant-design/pro-form';
import { Card } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useEffect } from 'react';

interface Props extends FormModalProps {
  onSave: (remarks: string) => void;
}
export default ({ onSave, ...props }: Props) => {
  const [form] = useForm<{ remarks: string }>();

  useEffect(() => {
    if (props.open) form.resetFields();
  }, [props.open]);

  return (
    <FormModalComp
      width="600px"
      {...props}
      onResetForm={() => form.resetFields()}
      onSubmit={async () => {
        const dataForm = await form.validateFields();
        onSave(dataForm.remarks);
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
