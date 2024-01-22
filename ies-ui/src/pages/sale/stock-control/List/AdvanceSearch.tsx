import { SalesTeamWorkLess, StockAdvanceSearchParams } from '@/services/sale/data';
import ProForm, { ProFormDateRangePicker, ProFormSelect } from '@ant-design/pro-form';
import { Drawer, DrawerProps } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useEffect } from 'react';

export interface AdvanceSearchProps extends DrawerProps {
  initData?: StockAdvanceSearchParams;
  salespersons?: SalesTeamWorkLess[];
  // lookDataList?: LookupData[];
  onSearch: (params: StockAdvanceSearchParams) => void;
  onReset: () => void;
}

const AdvanceSearch: React.FC<AdvanceSearchProps> = ({
  initData,
  onReset,
  salespersons,
  // lookDataList,
  onSearch,
  ...props
}) => {
  const [form] = useForm<StockAdvanceSearchParams>();

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
          label="Approved By"
          name="approvedBy"
          allowClear
          showSearch
          options={salespersons
            ?.filter((it) => it.isApprover)
            ?.map((it) => {
              return {
                value: it.salespersonCode,
                label: [it.salespersonCode, it.salespersonName].join(' - '),
              };
            })}
        />

        <ProFormSelect
          label="Received By"
          name="receivedBy"
          allowClear
          showSearch
          options={salespersons
            ?.filter((it) => !it.isApprover)
            ?.map((it) => {
              return {
                value: it.salespersonCode,
                label: [it.salespersonCode, it.salespersonName].join(' - '),
              };
            })}
        />

        <ProFormSelect
          label="Requested By"
          name="owner"
          allowClear
          showSearch
          options={salespersons
            ?.filter((it) => it.isRequester)
            ?.map((it) => {
              return {
                value: it.salespersonCode,
                label: [it.salespersonCode, it.salespersonName].join(' - '),
              };
            })}
        />
        {/* 
        <ProFormSelect
          label="Source"
          name="source"
          allowClear
          options={lookDataList
            ?.filter((it) => it.type === 'SALE_RECORD_SOURCE')
            .map((it) => {
              return { value: it.code, label: it.name };
            })}
        /> */}
        <ProFormDateRangePicker label="Requested Start - Reqeusted End" name="dates" />
        {/* <ProFormDateRangePicker label="Approve Start - Approve End" name="approvedDate" /> 
        <ProFormCheckbox name="hasAttachment">Has Attachment</ProFormCheckbox>*/}
      </ProForm>
    </Drawer>
  );
};

export default AdvanceSearch;
