import { LookupDataItem } from '@/services/data';
import { DeliveryAdvanceSearchParams, SoDeliveryMethod } from '@/services/sale/data';
import { ProFormSelect } from '@ant-design/pro-components';
import ProForm from '@ant-design/pro-form';
import { Drawer, DrawerProps } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useEffect } from 'react';
import { LookupDataServiceAPI } from '../lookupData/service';
import { simpleRequestActions } from '@/services/model';
import { DriverServiceAPI } from '../driver/service';
import { FuelAvanceSearchParam } from '../fuel/data';

interface Props extends DrawerProps {
  initData?: DeliveryAdvanceSearchParams;
  deliveryMethodList?: SoDeliveryMethod[];
  salespersons?: LookupDataItem[];
  onSearch: (params: FuelAvanceSearchParam) => void;
  onReset: () => void;
}

const AdvanceFuelSearch: React.FC<Props> = ({
  initData,
  onSearch,
  onReset,
  salespersons,
  deliveryMethodList,
  ...props
}) => {
  const [form] = useForm<FuelAvanceSearchParam>();
  useEffect(() => {
    if (!props.open) return;
    form.setFieldsValue({ ...initData });
  }, [props.open]);

  const requestActions = simpleRequestActions();
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
            name={"fuelType"}
            label="Type Of Fuel"
            showSearch
            allowClear
            request={async()=>{
              const data = await LookupDataServiceAPI(requestActions).lookupData({type:"VEHICLE"});
              return data.filter(it=>it.code =='FUELTYPE').map(it=>({
                label:it.name,
                value:it.id
              }))
            }}
        />
        <ProFormSelect
            name={"driver"}
            label="Driver"
            showSearch
            allowClear
            request={async(k:{keyWords:string})=>{
      
              
              const data = await DriverServiceAPI(requestActions).page({
                criteria:{searchValue:k.keyWords}
              });
              return data.items.map(it=>({
                label:[it.firstName, it.lastName].join(" "),
                value:it.id
              }))
            }}
        />
      </ProForm>
    </Drawer>
  );
};

export default AdvanceFuelSearch;
