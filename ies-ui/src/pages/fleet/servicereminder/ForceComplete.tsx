import { ModalForm, ModalFormProps, ProFormTextArea } from '@ant-design/pro-components';
import { useForm } from 'antd/lib/form/Form';
import { ReminderHistory, ServiceReminderDTO } from './data';

interface Props extends ModalFormProps {
  onSave: (data: ReminderHistory) => void;
  reminderId?: number;
  reminderDTO?: ServiceReminderDTO;
}

export default ({ onSave, reminderId, reminderDTO, ...props }: Props) => {
  const [form] = useForm<ReminderHistory>();

  return (
    <ModalForm
      {...props}
      title="Force Complted "
      width={400}
      form={form}
      onFinish={async () => {
        const dataForm = await form.validateFields();
        dataForm.reminderId = reminderId || 0;
        dataForm.reminderDTO = reminderDTO;
        onSave(dataForm);
      }}
    >
      <ProFormTextArea
        name={'remark'}
        placeholder={'remark...'}
        rules={[{ required: true, max: 255 }]}
      />
    </ModalForm>
  );
};
