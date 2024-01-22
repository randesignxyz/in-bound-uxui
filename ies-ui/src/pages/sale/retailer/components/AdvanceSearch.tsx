import { TableViewSearchParams } from '@/components/DataCrud/TableView';
import { simpleRequestActions } from '@/services/model';
// import { RequisitionAdvanceSearchParams } from '@/services/pro/req-params';
import ProForm, { ProFormSelect } from '@ant-design/pro-form';
import { Drawer, DrawerProps } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useEffect } from 'react';
import { CustomerAdvanceSearchParams } from '../customer/data';
import { GroupCustomerAdvanceSearchParams } from '../groupCustomer/data';
import { GroupCustomerServiceAPI } from '../groupCustomer/service';

export interface AdvanceSearchProps extends DrawerProps {
  initData?: CustomerAdvanceSearchParams;

  onSearch: (params: CustomerAdvanceSearchParams) => void;
  onReset: () => void;
}

const AdvanceSearch: React.FC<AdvanceSearchProps> = ({ initData, onReset, onSearch, ...props }) => {
  const [form] = useForm<CustomerAdvanceSearchParams>();
  const requestActions = simpleRequestActions();
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
        <ProFormSelect
          name={'groupId'}
          label="Group Customer"
          showSearch
          request={async (params: TableViewSearchParams<GroupCustomerAdvanceSearchParams>) => {
            const data = await GroupCustomerServiceAPI(requestActions).listGroupCustomer(params);
            return data.items.map((obj) => ({ value: obj.id, label: obj.name, key: obj.id }));
          }}
        />
      </ProForm>
    </Drawer>
  );
};

export default AdvanceSearch;
