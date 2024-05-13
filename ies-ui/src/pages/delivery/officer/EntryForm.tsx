import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { LoadingDock, Officer, SaveOfficer } from '@/services/delivery/data';
import { LoadingParams } from '@/services/delivery/loading-params';
import { simpleRequestActions } from '@/services/model';
import ProForm, { ProFormSelect, ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import { Card } from 'antd';
import { Flex } from 'antd/lib';
import { useForm } from 'antd/lib/form/Form';
import { useEffect } from 'react';

interface Props extends FormModalProps {
  data?: Officer;
  loadingDockList?: LoadingDock[];
  onSave: (data: SaveOfficer) => void;
}

const OfficerEntryModal: React.FC<Props> = ({ onSave, data, loadingDockList, ...props }) => {
  const [form] = useForm<SaveOfficer>();
  const requestActions = simpleRequestActions();
  useEffect(() => {
    props.open && initDataForm();
  }, [props.open]);

  const initDataForm = () => {
    form.setFieldsValue({
      ...data,
      name: data?.name,
      loadingDockIds: data?.loadingDocks?.map((it) => it.id),
      userName: data?.userName,
      warehouses: data?.warehouses?.map(it => it.id),
      description: data?.description,
    });
  };

  return (
    <FormModalComp
      {...props}
      width="800px"
      title='Loading Officer'
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
        <ProForm style={{ width: '100%' }} form={form} submitter={false}>

          <ProFormText rules={[{ required: true }]} name={'name'} label="Name" help={<span />} />
          <ProFormText
            rules={[{ required: true }]}
            name={'userName'}
            label="User Name"
            help={<span />}
          />
          <ProFormSelect allowClear name={"warehouses"} mode='multiple' label="Warehouses" request={async () => {
            return (await LoadingParams.listWarehouse.query(requestActions)).map(it => ({ label: it.name, value: it.id }))
          }} />

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
