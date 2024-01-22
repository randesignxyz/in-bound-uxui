import { LookupData, LookupDataItem } from '@/services/data';
import { SoAdvanceSearchParams } from '@/services/sale/data';
import { ProFormDependency } from '@ant-design/pro-components';
import ProForm, {
  ProFormCheckbox,
  ProFormDateRangePicker,
  ProFormSelect,
} from '@ant-design/pro-form';
import { Drawer, DrawerProps } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useEffect } from 'react';

export interface AdvanceSearchProps extends DrawerProps {
  initData?: SoAdvanceSearchParams;
  salespersons?: LookupDataItem[];
  lookDataList?: LookupData[];
  onSearch: (params: SoAdvanceSearchParams) => void;
  onReset: () => void;
}

const AdvanceSarch: React.FC<AdvanceSearchProps> = ({
  initData,
  onReset,
  salespersons,
  lookDataList,
  onSearch,
  ...props
}) => {
  const [form] = useForm<SoAdvanceSearchParams>();

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
          label="Salesperson"
          name="salespersonId"
          allowClear
          showSearch
          options={salespersons?.map((it) => {
            return { value: it.id, label: [it.code, it.name].join('-') };
          })}
        />
        <ProFormSelect
          label="Source"
          name="source"
          allowClear
          options={lookDataList
            ?.filter((it) => it.type === 'SALE_RECORD_SOURCE')
            .map((it) => {
              return { value: it.code, label: it.name };
            })}
        />
        <ProFormDateRangePicker label="Ordered Date Start - Ordered End" name="orderedDate" />
        <ProFormDateRangePicker label="Posted Start - Posted End" name="postedDate" />
        <ProFormCheckbox name="hasAttachment">Has Attachment</ProFormCheckbox>
        <ProFormDependency key={'hasAttachment'} name={['hasAttachment']}>
          {({ hasAttachment }) => {
            return (
              hasAttachment && (
                <ProFormCheckbox name={'uploadFailed'}>Upload Failed Only</ProFormCheckbox>
              )
            );
          }}
        </ProFormDependency>
      </ProForm>
    </Drawer>
  );
};

export default AdvanceSarch;
