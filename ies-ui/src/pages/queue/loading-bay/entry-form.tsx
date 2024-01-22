import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { LoadingBay } from '@/services/delivery/data';
import { ProFormRate } from '@ant-design/pro-components';
import { ProForm, ProFormSelect, ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import { Card } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useEffect } from 'react';

interface Props extends FormModalProps {
  data?: LoadingBay;
  onSave: (data: LoadingBay) => void;
}

const LoadingBayEntryModal: React.FC<Props> = ({ onSave, data, ...props }) => {
  const [form] = useForm<LoadingBay>();

  useEffect(() => {
    props.open && initDataForm();
  }, [props.open]);

  const initDataForm = () => {
    form.setFieldsValue({
      code: data?.code,
      name: data?.name,
      status: data?.status,
      description: data?.description,
      priority: data?.priority
    });
  };

  return (
    <FormModalComp
      {...props}
      width="500px"
      {...props}
      onSubmit={async () => {
        const dataForm = await form.validateFields();
        onSave?.(dataForm);
      }}
      onResetForm={() => {
        initDataForm();
      }}
    >
      <Card>
        <ProForm form={form} submitter={false}>
          <ProFormText rules={[{ required: true }]} name={'code'} label="Code" help={<span />} />
          <ProFormText rules={[{ required: true }]} name={'name'} label="Name" help={<span />} />
          <ProFormSelect
            rules={[{ required: true }]}
            name={'status'}
            label="Status"
            options={[
              { label: 'Active', value: 'ACTIVE' },
              { label: 'Inactive', value: 'INACTIVE' },
            ]}
            help={<span />}
          />
          <ProFormRate name={"priority"} label = "Priority"/>
          <ProFormTextArea name={'description'} label="Description" />
        </ProForm>
      </Card>
    </FormModalComp>
  );
};

export default LoadingBayEntryModal;
