import { Locations, VisitPlanAdvanceSearchParams } from '@/services/crm/data';
import { LookupDataItem } from '@/services/data';
import ProForm, { ProFormSelect } from '@ant-design/pro-form';
import { Drawer, DrawerProps } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useEffect } from 'react';

export interface AdvanceSearchProps extends DrawerProps {
  initData?: VisitPlanAdvanceSearchParams;
  onSearch: (params: VisitPlanAdvanceSearchParams) => void;
  onReset: () => void;
  seList?: LookupDataItem[];
  provinceList?: Locations[];
  regionList?: Locations[];
}

const AdvanceSearch: React.FC<AdvanceSearchProps> = ({
  initData,
  seList,
  provinceList,
  regionList,
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
            if (Object.values(data).some((v) => v)) {
              onSearch(data);
            } else {
              onReset();
            }
          },
        }}
      >
        <ProFormSelect
          label="Region"
          name="regionId"
          allowClear
          options={regionList?.map((it) => {
            return { value: it.id, label: it.name };
          })}
        />
        <ProFormSelect
          label="Province"
          name="provinceId"
          allowClear
          options={provinceList?.map((it) => {
            return { value: it.id, label: it.name };
          })}
        />
        <ProFormSelect
          label="Salesperson"
          name="salespersonId"
          allowClear
          showSearch
          fieldProps={{
            optionLabelProp: 'label',
            filterOption: (input, option) =>
              (option?.label?.toString() || '').toLowerCase().indexOf(input.toLowerCase()) >= 0,
          }}
          options={seList?.map((it) => {
            return { value: it.id, label: [it.code, it.name].join('-') };
          })}
        />
      </ProForm>
    </Drawer>
  );
};

export default AdvanceSearch;
