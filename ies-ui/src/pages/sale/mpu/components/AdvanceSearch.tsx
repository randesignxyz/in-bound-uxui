import RemoteSelectBox from '@/components/RemoteSelectBox';
// import { LookupDataItem } from '@/services/data';
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
    form.setFieldsValue({ ...initData });
  }, [props.open]);

  return (
    <DrawerForm
      {...props}
      resize={{
        maxWidth: window.innerWidth * 0.8,
        minWidth: 5000,
      }}
      submitter={false}
    >
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
        <Form.Item
          help={<span />}
          name="salespersonId"
          label="Salesperson"
          labelCol={{ sm: 8, md: 10, lg: 8, xl: 8, xxl: 6 }}
        >
          <RemoteSelectBox<SalesTeamWorkLess, { searchValue: any }>
            width={'300px'}
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
        <ProFormDateRangePicker label={`${entity} Date Start - ${entity} End`} name="orderedDate" />
      </ProForm>
    </DrawerForm>
  );
};

export default AdvanceSearch;
