import { LookupDataItem } from '@/services/data';
import { simpleRequestActions } from '@/services/model';
import { DeliveryAdvanceSearchParams, SoDeliveryMethod } from '@/services/sale/data';
import ProForm, { ProFormSelect } from '@ant-design/pro-form';
import { Drawer, DrawerProps } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useEffect, useState } from 'react';
import { FleetServiceAPI } from '../service';
import { LookUpDataDTO } from '../data';

interface Props extends DrawerProps {
  initData?: DeliveryAdvanceSearchParams;
  deliveryMethodList?: SoDeliveryMethod[];
  salespersons?: LookupDataItem[];
  onSearch: (params: DeliveryAdvanceSearchParams) => void;
  onReset: () => void;
}
const AdvanceVehicleSearch: React.FC<Props> = ({
  initData,
  onSearch,
  onReset,
  salespersons,
  deliveryMethodList,
  ...props
}) => {
  const requestActions = simpleRequestActions();
  const [form] = useForm<DeliveryAdvanceSearchParams>();
  const [lookup, setLookup] = useState<LookUpDataDTO[]>([]);
  const loadData = async () => {
    const response = await FleetServiceAPI(requestActions).lookupData({ type: 'VEHICLE' });
    setLookup(response);
  };
  useEffect(() => {
    if (!props.open) return;
    form.setFieldsValue({ ...initData });
    props.open && loadData();
  }, [props.open]);
  const group = lookup.filter((it) => it.code == 'GROUP').map((it) => ({ value: it.id, label: it.name }));
  const vehicleType = lookup.filter((it) => it.code == 'VEHICLETYPE').map((it) => ({ value: it.id, label: it.name }));
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
          label="Vehicle Type"
          name={'vehicleType'}
          allowClear
          showSearch
          options={vehicleType}
        />
        <ProFormSelect label="Branding Type" name={'brandingType'} showSearch allowClear options={group} />
        
      </ProForm>
    </Drawer>
  );
};

export default AdvanceVehicleSearch;
