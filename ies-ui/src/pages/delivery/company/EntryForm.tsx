import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { Company, SaveCompany, TransportSource } from '@/services/delivery/data';
import ProForm, { ProFormSelect, ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import { Card } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useEffect } from 'react';

interface Props extends FormModalProps {
  transprotSourceList: TransportSource[];
  data?: Company;
  onSave: (data: SaveCompany) => void;
}

const CompanyEntryModal: React.FC<Props> = ({ onSave, transprotSourceList, data, ...props }) => {
  const [form] = useForm<SaveCompany>();

  useEffect(() => {
    props.open &&
      form.setFieldsValue({
        name: data?.name,
        contactPerson: data?.contactPerson,
        phone1: data?.phone1,
        phone2: data?.phone2,
        address: data?.address,
        description: data?.description,
        transportSourceId: data?.transportSource.id,
      });
  }, [props.open]);

  return (
    <FormModalComp
      title="Company"
      width="700px"
      {...props}
      onSubmit={async () => {
        const dataForm = await form.validateFields();
        onSave?.(dataForm);
      }}
      onResetForm={() => {
        form.resetFields();
      }}
    >
      <Card>
        <ProForm form={form} submitter={false}>
          <ProFormText rules={[{ required: true }]} name={'name'} label="Name" help={<span />} />
          <ProFormSelect
            rules={[{ required: true }]}
            name={'transportSourceId'}
            label="Transport Source"
            help={<span />}
            options={transprotSourceList.map((it) => ({
              label: it.name,
              value: it.id,
            }))}
          />

          <ProFormText name={'contactPerson'} label="Contact Person" help={<span />} />
          <ProFormText name={'phone1'} label="Phone 1" help={<span />} />
          <ProFormText name={'phone2'} label="Pone 2" help={<span />} />
          <ProFormText name={'address'} label="Address" help={<span />} />
          <ProFormTextArea name={'description'} label="Description" />
        </ProForm>
      </Card>
    </FormModalComp>
  );
};

export default CompanyEntryModal;
