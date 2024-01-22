import ProForm, { ProFormSelect } from '@ant-design/pro-form';
import { Drawer, DrawerProps } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useEffect } from 'react';
import { MaintenaceAdvanceSearch } from './data';

export interface AdvanceSearchProps extends DrawerProps {
  initData?: MaintenaceAdvanceSearch;

  onSearch: (params: MaintenaceAdvanceSearch) => void;
  onReset: () => void;
}

const AdvanceSearch: React.FC<AdvanceSearchProps> = ({ initData, onReset, onSearch, ...props }) => {
  const [form] = useForm<MaintenaceAdvanceSearch>();
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
        <ProFormSelect name={'groupId'} label="Group Customer" showSearch />
      </ProForm>
    </Drawer>
  );
};

export default AdvanceSearch;
