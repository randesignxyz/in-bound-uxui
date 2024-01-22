import FormModalComp, { FormModalProps } from '@/components/FormModal';
// import { simpleRequestActions } from '@/services/model';
import { ProFormTextArea } from '@ant-design/pro-components';
import ProForm, { ProFormText } from '@ant-design/pro-form';
import { useForm } from 'antd/lib/form/Form';
import { useEffect } from 'react';
import { CategoryCreate, CategoryDto } from './data';

interface Props extends FormModalProps {
  data?: CategoryDto | any;
  onSave: (data: CategoryCreate) => void;
  actionType?: string;
  id?: string;
}

const CategoryFormModal: React.FC<Props> = ({ onSave, data, ...props }) => {
  const [form] = useForm<CategoryCreate>();

  useEffect(() => {
    if (props.open) {
      if (data) {
        form.setFieldsValue({
          name: data?.name,
          id: data?.id,
          code: data?.code,
          description: data?.description,
        });
      } else {
        form.resetFields();
      }
    }
  }, [props.open]);

  return (
    <FormModalComp
      width={'600px'}
      title={`${data ? 'Edit' : 'New'} Category`}
      {...props}
      onSubmit={async () => {
        const dataForm = await form.validateFields();
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
        <ProFormText help={<span />} label="Category Name" name="name" required />
        <ProFormText help={<span />} label="Category Code" name="code" required />
        <ProFormTextArea help={<span />} label="Description" name="description" />
      </ProForm>
    </FormModalComp>
  );
};

export default CategoryFormModal;
