import RemoteSelectBox from '@/components/RemoteSelectBox';
// import { LookupDataItem } from '@/services/data';
import { SalesTeamWorkLess } from '@/services/sale/data';
import { SaleService } from '@/services/sale/services';
import { DrawerForm, DrawerFormProps } from '@ant-design/pro-components';
import ProForm, { ProFormDateRangePicker } from '@ant-design/pro-form';
import { Form } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useEffect } from 'react';
import { PurchaseOrderAdvanceSearch } from './data';

export interface AdvanceSearchProps extends DrawerFormProps {
  initData?: PurchaseOrderAdvanceSearch;
  // salespersons?: LookupDataItem[];
  //   lookDataList?: LookupData[];
  onSearch: (params: PurchaseOrderAdvanceSearch) => void;
  onReset: () => void;
}

const AdvanceSarch: React.FC<AdvanceSearchProps> = ({
  initData,
  onReset,
  // salespersons,
  //   lookDataList,
  onSearch,
  ...props
}) => {
  const [form] = useForm<PurchaseOrderAdvanceSearch>();

  useEffect(() => {
    if (!props.open) return;
    console.log(initData);
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
          rules={[{ required: true }]}
          labelCol={{ sm: 8, md: 10, lg: 8, xl: 8, xxl: 6 }}
        >
          <RemoteSelectBox<SalesTeamWorkLess, { searchValue: any }>
            width={'300px'}
            // popupMatchSelectWidth={500}
            //initData={ type === edi? [{ ...so.associatedTo.customer }] : []}
            transforms={{
              onCriteria: (value) => {
                return { searchValue: value };
              },
              onOptionData: (item) => {
                return {
                  label: [item.salespersonCode, item.salespersonName].join(' - '),
                  value: [item.salespersonCode, item.salespersonName].join(','),
                };
              },
            }}
            service={SaleService('list-sales-team-work-1')}
          />
        </Form.Item>
        {/* <ProFormSelect  
          label="Salesperson"
          name="salespersonId"
          allowClear
          showSearch
          options={salespersons?.map((it) => {
            return { value: it.id, label: [it.code, it.name].join('-') };
          })}
        /> */}
        {/* <ProFormSelect
          label="Source"
          name="source"
          allowClear
          options={lookDataList
            ?.filter((it) => it.type === 'SALE_RECORD_SOURCE')
            .map((it) => {
              return { value: it.code, label: it.name };
            })}
        /> */}
        <ProFormDateRangePicker label="Purchase Date Start - Purchase End" name="orderedDate" />
        {/* <ProFormDateRangePicker label="Posted Start - Posted End" name="postedDate" />
        <ProFormCheckbox name="hasAttachment">Has Attachment</ProFormCheckbox>
        <ProFormDependency key={'hasAttachment'} name={['hasAttachment']}>
          {({ hasAttachment }) => {
            return (
              hasAttachment && (
                <ProFormCheckbox name={'uploadFailed'}>Upload Failed Only</ProFormCheckbox>
              )
            );
          }}
        </ProFormDependency> */}
      </ProForm>
    </DrawerForm>
  );
};

export default AdvanceSarch;
