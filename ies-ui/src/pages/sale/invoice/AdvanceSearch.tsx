import RemoteSelectBox from '@/components/RemoteSelectBox';
import { SalesTeamWorkLess } from '@/services/sale/data';
import { SaleService } from '@/services/sale/services';
import { DrawerForm, DrawerFormProps } from '@ant-design/pro-components';
import ProForm, { ProFormDateRangePicker } from '@ant-design/pro-form';
import { Form } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useEffect } from 'react';

export interface AdvanceSearchProps extends DrawerFormProps {
  initData?: AdvanceSearchParam;
  entity: string;
  onSearch: (params: AdvanceSearchParam) => void;
  onReset: () => void;
}

const AdvanceSearch: React.FC<AdvanceSearchProps> = ({
  initData,
  onReset,
  onSearch,
  entity,
  ...props
}) => {
  const [form] = useForm<AdvanceSearchParam>();

  useEffect(() => {
    if (!props.open) return;
    form.resetFields();
    props.open && initData && form.setFieldsValue({ ...initData });
  }, [props.open]);

  return (
    <DrawerForm
      {...props}
      resize={{
        maxWidth: window.innerWidth * 0.8,
        minWidth: 5000,
      }}
      onFinish={async () => {
        const data = await form.validateFields();
        onSearch(data);
      }}
      submitter={{
        onReset: (value) => onReset(),
      }}
    >
      <ProForm form={form} onReset={() => onReset()} submitter={false}>
        <Form.Item
          help={<span />}
          name="salesperson"
          label="Salesperson"
          labelCol={{ sm: 8, md: 10, lg: 8, xl: 8, xxl: 6 }}
        >
          <RemoteSelectBox<SalesTeamWorkLess, { searchValue: any }>
            width={'300px'}
            // CH: need to change mobile
            // mode="multiple"
            transforms={{
              onCriteria: (value) => {
                return { searchValue: value };
              },
              onOptionData: (item) => {
                return {
                  label: [item.salespersonCode, item.salespersonName].join(' - '),
                  value: item.salespersonCode,
                };
              },
            }}
            service={SaleService('list-sales-team-work-1')}
          />
        </Form.Item>
        <ProFormDateRangePicker label={` Date Start - End Start`} name="dates" />
      </ProForm>
    </DrawerForm>
  );
};

export default AdvanceSearch;
