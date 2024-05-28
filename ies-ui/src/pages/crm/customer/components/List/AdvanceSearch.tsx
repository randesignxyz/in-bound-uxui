import {
  CustomerAdvanceSearchParams,
  Locations,
  outletType,
  VisitPlanAdvanceSearchParams,
} from '@/services/crm/data';
import { CrmServiceAPI } from '@/services/crm/services';
import { LookupData, LookupDataItem } from '@/services/data';
import ProForm, { ProFormSelect } from '@ant-design/pro-form';
import { useQuery } from '@umijs/max';
import { Drawer, DrawerProps, Spin } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useEffect } from 'react';

export interface AdvanceSearchProps extends DrawerProps {
  initData?: CustomerAdvanceSearchParams;
  onSearch: (params: CustomerAdvanceSearchParams) => void;
  onReset: () => void;
  lookupDataList?: LookupData[];
  seList?: LookupDataItem[];
  outletTypeList?: outletType[];
}

const AdvanceSearch: React.FC<AdvanceSearchProps> = ({
  initData,
  onReset,
  onSearch,
  ...props
}) => {
  const [form] = useForm<VisitPlanAdvanceSearchParams>();
  const crmServices = CrmServiceAPI();

  const { data, isFetching } = useQuery(['cust-advance-search-init-data'], () => crmServices.initCustomerData([
    // { actionName: 'locations', responseKey: 'provinceList', payload: { type: 'PROVINCE' } },
    { actionName: 'locations', responseKey: 'regionList', payload: { type: 'DIVISION' } },
    { actionName: 'outletTypeList', payload: {} },
    { actionName: 'sale', responseKey: 'seList', payload: {} },
    {
      actionName: 'lookupDataList',
      payload: {
        list: [
          'CUSTOMER_STATUS',
          'CUSTOMER_TYPE',
          'CUSTOMER_DIVISION'
        ],
      },
    },
  ]) as Promise<{
    regionList?: Locations[]
    // provinceList?: Locations[];
    outletTypeList?: outletType[];
    lookupDataList?: LookupData[];
    seList?: LookupDataItem[];
  }>, { refetchOnWindowFocus: false })


  useEffect(() => {
    if (!props.open) return;
    form.setFieldsValue({ ...initData });
  }, [props.open]);

  return (
    <Drawer {...props} >
      <Spin spinning={isFetching}>
        <ProForm
          form={form}
          onReset={() => {
            form.resetFields()
            onReset?.()
          }}
          submitter={{
            onSubmit: async () => {
              const data = await form.validateFields();
              onSearch(data);
            },
          }}
        >
          <ProFormSelect
            label="Customer Type"
            name="customerTypeId"
            allowClear
            options={data?.lookupDataList
              ?.filter((it) => it.type === 'CUSTOMER_TYPE')
              .map((it) => {
                return { value: it.id, label: it.name };
              })}
          />
          <ProFormSelect
            label="Outlet Type"
            name="outletTypeId"
            allowClear
            options={data?.outletTypeList?.map((it) => {
              return { value: it.id, label: it.name };
            })}
          />

          <ProFormSelect
            allowClear
            label="Source"
            name="source"
            options={[
              { label: 'SAP', value: 'SAP' },
              { label: 'SYSTEM', value: 'SYSTEM' },
            ]}
          />

          <ProFormSelect
            allowClear
            showSearch
            fieldProps={{
              optionLabelProp: 'label',
              filterOption: (input, option) =>
                (option?.label?.toString() || '').toLowerCase().indexOf(input.toLowerCase()) >= 0,
            }}
            label="Salesperson"
            name="salespersonId"
            options={data?.seList?.map((it) => {
              return { value: it.id, label: [it.code, it.name].join('-') };
            })}
          />

          <ProFormSelect
            label="Devision"
            name="divisionId"
            allowClear
            options={data?.lookupDataList
              ?.filter((it) => it.type === 'CUSTOMER_DIVISION')
              .map((it) => {
                return { value: it.id, label: it.name };
              })}
          />
        </ProForm>
      </Spin>
    </Drawer>
  );
};

export default AdvanceSearch;
