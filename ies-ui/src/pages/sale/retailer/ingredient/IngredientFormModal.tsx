import FormModalComp, { FormModalProps } from '@/components/FormModal';
import ProForm, { ProFormText } from '@ant-design/pro-form';
import { useForm } from 'antd/lib/form/Form';
import { useEffect } from 'react';

import { IngredientCreate } from './data';

interface Props extends FormModalProps {
  data?: IngredientCreate | any;
  onSave: (data: IngredientCreate) => void;
  actionType?: string;
  id?: string;
}

const IngredientFormModal: React.FC<Props> = ({ onSave, data, ...props }) => {
  const [form] = useForm<IngredientCreate>();

  useEffect(() => {
    if (!props.open) return;
    if (data) {
      form.setFieldsValue({
        name: data?.name,
        id: data?.id,
        nameEn: data.nameEn,
      });
    } else {
      form.resetFields();
    }
  }, [props.open]);

  return (
    <FormModalComp
      width={'600px'}
      title="New Ingredient"
      {...props}
      onSubmit={async () => {
        const dataForm = await form.validateFields();
        console.log(dataForm);

        if (data) {
          dataForm['id'] = data.id;
        }
        onSave(dataForm);
      }}
      onResetForm={() => {
        form.resetFields();
      }}
    >
      <ProForm form={form} submitter={false}>
        <ProFormText help={<span />} label="Name" name="name" required />
        <ProFormText help={<span />} label="Name En" name="nameEn" required />
      </ProForm>
    </FormModalComp>
  );
};

export default IngredientFormModal;
