import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { LoadingDock, Officer, SaveOfficer } from '@/services/delivery/data';
import ProForm, { ProFormSelect, ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import { Card } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useEffect } from 'react';

interface Props extends FormModalProps {
  data?: Officer;
  loadingDockList?: LoadingDock[];
  onSave: (data: SaveOfficer) => void;
}

const OfficerEntryModal: React.FC<Props> = ({ onSave, data, loadingDockList, ...props }) => {
  const [form] = useForm<SaveOfficer>();

  useEffect(() => {
    props.open && initDataForm();
  }, [props.open]);

  const initDataForm = () => {
    form.setFieldsValue({
      ...data,
      name: data?.name,
      loadingDockIds: data?.loadingDocks?.map((it) => it.id),
      userName: data?.userName,
      description: data?.description,
    });
  };

  return (
    <FormModalComp
      {...props}
      width="500px"
      {...props}
      onSubmit={async () => {
        const dataForm = await form.validateFields();
        onSave?.({ ...dataForm, id: data?.id });
      }}
      onResetForm={() => {
        initDataForm();
      }}
    >
      <Card>
        <ProForm form={form} submitter={false}>
          <ProFormText rules={[{ required: true }]} name={'name'} label="Name" help={<span />} />
          <ProFormText
            rules={[{ required: true }]}
            name={'userName'}
            label="User Name"
            help={<span />}
          />
          <ProFormSelect
            rules={[{ required: true }]}
            mode="multiple"
            label="Loading Dock"
            name={'loadingDockIds'}
            options={loadingDockList?.map((it) => ({
              label: [it.code, it.name].join('-'),
              value: it.id,
            }))}
          />
          <ProFormTextArea name={'description'} label="Description" />
        </ProForm>
      </Card>
    </FormModalComp>
  );
};

export default OfficerEntryModal;
