import { VisitScheduleAdvanceSearchParams } from '@/services/crm/data';
import { LookupData, LookupDataItem } from "@/services/data";
import ProForm, { ProFormDateRangePicker, ProFormSelect } from '@ant-design/pro-form';
import { Drawer, DrawerProps } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useEffect } from 'react';

export interface AdvanceSearchProps extends DrawerProps {
  seList: LookupDataItem[];
  lookupList: LookupData[];
  contractTypes?: LookupData[];
  initData: VisitScheduleAdvanceSearchParams;
  onSearch: (params: VisitScheduleAdvanceSearchParams) => void;
  onReset: () => void;
}

const AdvanceSearch: React.FC<AdvanceSearchProps> = ({
  seList,
  lookupList,
  contractTypes,
  initData,
  onSearch,
  onReset,
  ...props
}) => {
  const [form] = useForm<VisitScheduleAdvanceSearchParams>();

  useEffect(() => {
    if (!props.open) return;
    form.setFieldsValue(initData);
  }, [props.open]);

  return (
    <Drawer {...props}>
      <ProForm
        form={form}
        onReset={onReset}
        submitter={{
          onSubmit: async () => {
            const data = await form.validateFields();
            if (Object.values(data).some((v) => v)) {
              onSearch(data);
            } else {
              onReset();
            }
          },
        }}
      >
        {initData.status == 'COMPLETED' && (
          <ProFormSelect
            label="Type"
            name="planned"
            width="md"
            showSearch
            allowClear
            options={[
              { value: 'Y', label: 'Planned' },
              { value: 'N', label: 'Manual' },
            ]}
          />
        )}

        <ProFormSelect
          label="Division"
          name="divisionIds"
          mode='multiple'
          width="md"
          showSearch
          allowClear
          options={lookupList?.filter(it => it.type == 'CUSTOMER_DIVISION')?.map(it => {
            return { value: it.id, label: it.name }
      })} 
        />
      <ProFormSelect
          label="Salesperson"
          name="salespersonId"
          width="md"
          showSearch
          allowClear
          options={seList.map((it) => {
            return { value: it.id, label: it.code?.concat(' - ', it.name) };
          })}
        />

        <ProFormDateRangePicker width="md" label="Schedule Date" name="dates" />
        {initData.status == 'COMPLETED' && (
          <ProFormDateRangePicker width="md" label="Completed Date" name="completedDate" />
        )}
        {initData.status == 'COMPLETED' && (
          <ProFormSelect label="Contract Type"
            name="contractTypeIds"
            mode='multiple'
            width="md"
            showSearch
            allowClear
            options={contractTypes?.map((it) => {
              return { label: it.name, value: it.id }
            })} />
        )}

      </ProForm>
    </Drawer>
  );
};

export default AdvanceSearch;
