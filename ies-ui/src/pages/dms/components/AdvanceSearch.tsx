import { LookupDataItem } from '@/services/data';
import { SoDeliveryMethod } from '@/services/sale/data';
import ProForm from '@ant-design/pro-form';
import { Button, Drawer, DrawerProps, Space } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useEffect } from 'react';
import { simpleRequestActions } from '@/services/model';
import { DocumentationAdvanceSearch } from '../documentation/data';
import { ProFormSelect } from '@ant-design/pro-components';
import { CoreServiceAPI } from '../service';
import { DepartmentServiceAPI } from '../setting/components/department/service';
import { DocumentTypeServiceAPI } from '../setting/components/documentType/service';

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
        <ProFormSelect
          name={"documentType"}
          allowClear
          label={"Document Type"}
          showSearch
          request={async (k: { keyWords?: string }) => {
            const data = await DocumentTypeServiceAPI(requestActions).page({
              criteria: {
                searchValue: k.keyWords || ""
              }
            });
            return data.items.map(i => ({ value: i.id, label: i.name }))
          }}
        />
      </ProForm>
    </Drawer>
  );
};

export default AdvanceDocumentSearch