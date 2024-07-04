import { LookupDataItem } from '@/services/data';
import { SoDeliveryMethod } from '@/services/sale/data';
import ProForm from '@ant-design/pro-form';
import { Button, Divider, Drawer, DrawerProps, Space } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useEffect } from 'react';
import { simpleRequestActions } from '@/services/model';
import { DocumentationAdvanceSearch } from '../documentation/data';
import { ProFormDateRangePicker, ProFormSelect } from '@ant-design/pro-components';
import { CoreServiceAPI } from '../service';
import { DepartmentServiceAPI } from '../setting/components/department/service';

interface Props extends DrawerProps {
  initData?: DocumentationAdvanceSearch;
  deliveryMethodList?: SoDeliveryMethod[];
  salespersons?: LookupDataItem[];
  onSearch: (params: DocumentationAdvanceSearch) => void;
  onReset: () => void;
}
const AdvanceDocumentSearch: React.FC<Props> = ({
  initData,
  onSearch,
  onReset,
  salespersons,
  deliveryMethodList,
  ...props
}) => {
  const [form] = useForm<DocumentationAdvanceSearch>();
  useEffect(() => {
    if (!props.open) return;
    form.setFieldsValue({ ...initData });
  }, [props.open]);
  const requestActions = simpleRequestActions();
  return (
    <Drawer
      {...props}
      title="Advance Fuel Search"
      footer={
        <Space>
          <Button 
            onClick={()=>{
              form.resetFields();
              onReset();
            }}
          type='default'>Reset</Button>
          <Button
            onClick={async () => {
              const data = await form.validateFields();
              onSearch(data);
            }}
            type='primary'>Submit</Button>
        </Space>
      }
    >
      <ProForm
        form={form}
        onReset={() => onReset()}
        submitter={false}
      >
        <ProFormSelect
          name={"buId"}
          allowClear
          label={"Bussiness Unit"}
          request={async () => {
            const data = await CoreServiceAPI(requestActions).orgUnitList();
            return data.map(i => ({ value: i.id, label: i.name }))
          }}
        />
        <ProFormSelect
          name={"department"}
          allowClear
          label={"Department"}
          showSearch
          request={async (k: { keyWords?: string }) => {
            const data = await DepartmentServiceAPI(requestActions).page({
              criteria: {
                searchValue: k.keyWords || "",
                advanceSearch: {}
              }
            });
            return data.items.map(i => ({ value: i.id, label: i.name }))
          }}
        />
        <Divider orientation='left'> Expiry Date</Divider>
        <ProFormDateRangePicker
          name={"expiryDate"}
        />
      </ProForm>
    </Drawer>
  );
};
export default AdvanceDocumentSearch