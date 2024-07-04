import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { LoadingBay } from '@/services/delivery/data';
import { LoadingParams } from '@/services/delivery/loading-params';
import { simpleRequestActions } from '@/services/model';
import { ProFormRate } from '@ant-design/pro-components';
import { ProForm, ProFormSelect, ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import { Card, Flex } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useEffect } from 'react';

interface Props extends FormModalProps {
  data?: LoadingBay;
  onSave: (data: LoadingBayDataForm) => void;
}


export interface LoadingBayDataForm {
  id: number;
  code: string;
  name: string;
  status: string;
  priority?: number;
  warehouse?: number;
  description?: string;
}


const LoadingBayEntryModal: React.FC<Props> = ({ onSave, data, ...props }) => {
  const [form] = useForm<LoadingBayDataForm>();
  const requestActions = simpleRequestActions();
  useEffect(() => {
    props.open && initDataForm();
  }, [props.open]);

  const initDataForm = () => {
    form.setFieldsValue({
      code: data?.code,
      name: data?.name,
      status: data?.status,
      warehouse: data?.warehouse?.id,
      description: data?.description,
      priority: data?.priority
    });
  };

  return (
    <FormModalComp
      {...props}
      width="700px"
      {...props}
      onSubmit={async () => {
        const dataForm = await form.validateFields();
        onSave?.(dataForm);
      }}
      onResetForm={() => {
        initDataForm();
      }}
    >
      <Card style={{ width: '100%' }}>
        <ProForm form={form} submitter={false}>
          <Flex vertical>
            <Flex wrap='wrap' gap="middle">
              <Flex vertical>
                <ProFormText rules={[{ required: true }]} name={'code'} label="Code" help={<span />} />
                <ProFormText rules={[{ required: true }]} name={'name'} label="Name" help={<span />} />
                <ProFormSelect rules={[{ required: true }]} name={"warehouse"} label="Warehouse" request={async () => {
                  return (await LoadingParams.listWarehouse.query(requestActions)).map(it => ({ label: it.name, value: it.id }))
                }} />
              </Flex>
              <Flex vertical>
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
                <ProFormRate name={"priority"} label="Priority" />
              </Flex>
            </Flex>

            <ProFormTextArea name={'description'} label="Description" />

          </Flex>
        </ProForm>
      </Card>
    </FormModalComp>
  );
};

export default LoadingBayEntryModal;
