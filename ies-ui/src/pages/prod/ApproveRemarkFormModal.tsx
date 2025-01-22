import FormModalComp, { FormModalProps } from '@/components/FormModal';
import ProForm, { ProFormTextArea } from '@ant-design/pro-form';
import { Card, message } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useEffect, useState } from 'react';

interface Props extends FormModalProps {
  id: string;
  transfer_id: string;
  data: any,
  loading:boolean
  onSave: (id: string, remarks: string, transfer_id: string, data: any) => void;
}
export default ({ id, transfer_id, onSave, data,loading, ...props }: Props) => {
  const [form] = useForm<{ remarks: string }>();
  useEffect(() => {
    if (props.open) form.resetFields();
    
  }, [props.open]);

  return (
    <FormModalComp
      width="600px"
      {...props}
      onResetForm={() => form.resetFields()}
      confirmLoading={loading}
      onSubmit={async () => {
        const dataForm = await form.validateFields();
        onSave(id, dataForm.remarks, transfer_id, data);
      }}
    >
      <Card>
        <ProForm form={form} submitter={false}>
          <ProFormTextArea label="Remarks" name={'remarks'} />
          {/* <Text>{id}</Text>
          <Text>{transfer_id}</Text> */}
        </ProForm>
      </Card>
    </FormModalComp>
  );
};
