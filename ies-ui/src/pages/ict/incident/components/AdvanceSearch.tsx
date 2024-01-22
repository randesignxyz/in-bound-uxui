import { RequisitionAdvanceSearchParams } from '@/services/pro/req-params';
import ProForm, { ProFormDateRangePicker, ProFormText } from '@ant-design/pro-form';
import { Drawer, DrawerProps } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useEffect } from 'react';

export interface AdvanceSearchProps extends DrawerProps {
  initData?: RequisitionAdvanceSearchParams;

  onSearch: (params: RequisitionAdvanceSearchParams) => void;
  onReset: () => void;
}

const AdvanceSearch: React.FC<AdvanceSearchProps> = ({ initData, onReset, onSearch, ...props }) => {
  const [form] = useForm<RequisitionAdvanceSearchParams>();

  useEffect(() => {
    if (!props.open) return;
    form.setFieldsValue({ ...initData });
  }, [props.open]);

  return (
    <Drawer {...props}>
      <ProForm
        form={form}
        onReset={() => onReset()}
        submitter={{
          onSubmit: async () => {
            const data = await form.validateFields();
            onSearch(data);
          },
        }}
      >
        <ProFormDateRangePicker
          rules={[{ required: true }]}
          label="Requested Date"
          name="requestedDate"
        />
        <ProFormText label="Issued Statement" name="symptom" />
      </ProForm>
    </Drawer>
  );
};

export default AdvanceSearch;
