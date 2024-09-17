import { StockStoreAdvanceSearchParams } from '@/services/sale/data';
import ProForm, { ProFormDateRangePicker } from '@ant-design/pro-form';
import { Drawer, DrawerProps } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useEffect } from 'react';

export interface AdvanceSearchProps extends DrawerProps {
  initData?: StockStoreAdvanceSearchParams;
  onSearch: (params: StockStoreAdvanceSearchParams) => void;
  onReset: () => void;
}
const AdvanceSearch: React.FC<AdvanceSearchProps> = ({
  initData,
  onReset,
  onSearch,
  ...props
}) => {
  const [form] = useForm<StockStoreAdvanceSearchParams>();
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
        <ProFormDateRangePicker label="Requested Start - Reqeusted End" name="dates" />
      </ProForm>
    </Drawer>
  );
};

export default AdvanceSearch;
