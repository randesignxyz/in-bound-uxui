import {
  CustomerAdvanceSearchParams,
  outletType,
  VisitPlanAdvanceSearchParams,
} from '@/services/crm/data';
import { LookupData, LookupDataItem } from '@/services/data';
import { ProFormText } from '@ant-design/pro-components';
import ProForm, { ProFormSelect } from '@ant-design/pro-form';
import { Drawer, DrawerProps } from 'antd';
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
  lookupDataList,
  outletTypeList,
  seList,
  onReset,
  onSearch,
  ...props
}) => {
  const [form] = useForm<VisitPlanAdvanceSearchParams>();

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
          label="Customer Type"
          name="customerTypeId"
          allowClear
          options={lookupDataList
            ?.filter((it) => it.type === 'CUSTOMER_TYPE')
            .map((it) => {
              return { value: it.id, label: it.name };
            })}
        />
        <ProFormSelect
          label="Outlet Type"
          name="outletTypeId"
          allowClear
          options={outletTypeList?.map((it) => {
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
          options={seList?.map((it) => {
            return { value: it.id, label: [it.code, it.name].join('-') };
          })}
        />

        <ProFormSelect
          label="Devision"
          name="divisionId"
          allowClear
          options={lookupDataList
            ?.filter((it) => it.type === 'CUSTOMER_DIVISION')
            .map((it) => {
              return { value: it.id, label: it.name };
            })}
        />

        {/* <ProFormSelect label="Status" name="status"
                    options={state.initData?.lookupDataList?.filter(it => it.type === 'CUSTOMER_STATUS') ?.map(it => {
                        return { value: it.code, label: it.name }
                    })}
                    allowClear
                /> */}
      </ProForm>
    </Drawer>
  );
};

export default AdvanceSearch;
