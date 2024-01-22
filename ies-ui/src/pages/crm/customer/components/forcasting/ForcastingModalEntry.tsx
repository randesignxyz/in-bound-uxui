import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { PurchaseEstData } from '@/services/crm/data';
import { LookupDataItem } from '@/services/data';
import ProForm from '@ant-design/pro-form';
import { Card, Modal } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useEffect } from 'react';
import ForcastingEntryForm from './ForcastingEntryForm';

interface ModalProps extends FormModalProps {
  data: {
    domain?: PurchaseEstData[];
    itemList?: LookupDataItem[];
  };
  actionHandlers: {
    onDirectSave?: (data?: PurchaseEstData[]) => Promise<void>;
  };
}

export const ForcastingModalEntry: React.FC<ModalProps> = ({
  data: { domain, itemList },
  actionHandlers: { onDirectSave },
  ...rest
}) => {
  const [form] = useForm<{ forcasting: PurchaseEstData[] }>();

  useEffect(() => {
    return () => {
      form.resetFields();
    };
  }, [rest.open]);

  return (
    <FormModalComp
      title="Edit Purchase Estimation"
      {...rest}
      onResetForm={() => form.resetFields()}
      onSubmit={async () => {
        const data = await form.validateFields();
        Modal.confirm({
          title: 'Edit Purchase Estimation',
          content: 'Are you sure?',
          onOk: async () => {
            await onDirectSave?.(data.forcasting);
            rest.onCancel?.();
          },
        });
      }}
    >
      <ProForm
        form={form}
        submitter={false}
        initialValues={{ forcasting: domain && domain.length == 0 ? [{}] : domain || [{}] }}
      >
        <Card>
          <ForcastingEntryForm itemList={itemList} />
        </Card>
      </ProForm>
    </FormModalComp>
  );
};
