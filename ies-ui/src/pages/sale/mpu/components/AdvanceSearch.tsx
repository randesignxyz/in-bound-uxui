import RemoteSelectBox from '@/components/RemoteSelectBox';
// import { LookupDataItem } from '@/services/data';
import { SalesTeamWorkLess } from '@/services/sale/data';
import { SaleService } from '@/services/sale/services';
import { DrawerForm, DrawerFormProps } from '@ant-design/pro-components';
import ProForm, { ProFormDateRangePicker } from '@ant-design/pro-form';
import { Form, Segmented } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useEffect, useState } from 'react';

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
  const [distributor, setDistributor] = useState<string>('all');

  useEffect(() => {
    if (!props.open) return;
    form.setFieldsValue({ ...initData });
    (() => {
      form.resetFields();
    })();
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
        <Form.Item label="Source of Supply" name="distributorType">
          <Segmented
            value={distributor}
            onChange={(e) => setDistributor(e)}
            options={[
              { label: 'All', value: 'all' },
              { label: 'Wareshoue OFL', value: 'L911154' },
              { label: 'Distributor', value: 'distributor' },
            ]}
          />
        </Form.Item>
        <Form.Item
          help={<span />}
          name="salespersonId"
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
        <ProFormDateRangePicker label={`${entity} Date Start - ${entity} End`} name="dates" />
      </ProForm>
    </DrawerForm>
  );
};

export default AdvanceSearch;
