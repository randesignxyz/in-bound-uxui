import { simpleRequestActions } from '@/services/model';
import { Column } from '@ant-design/plots';
import { ProForm, ProFormDatePicker, ProFormSelect } from '@ant-design/pro-components';
import { Card, Spin } from 'antd';
import { useForm } from 'antd/es/form/Form';
import { useEffect, useState } from 'react';
import { LookupDataServiceAPI } from '../../lookupData/service';
import { TruckFuelUsageDTO, TruckFuelUsageParam } from '../data';
import { DashboardServiceAPI } from '../service';

const TruckFuelUsage = () => {
  const [data, setData] = useState<TruckFuelUsageDTO[]>([]);
  const requestActions = simpleRequestActions();
  const [form] = useForm();
  useEffect(() => {
    asyncFetch(form.getFieldsValue());
  }, []);

  const asyncFetch = async (param?: TruckFuelUsageParam) => {
    const data = await DashboardServiceAPI(requestActions).truckFuelUsageList({
      ...param,
      gasType: param?.gasType,
    });

    setData(data);
  };

  return (
    <Card
      title="Vehicles Fuel Usage"
      extra={[
        <ProForm
          form={form}
          onValuesChange={async (e) => {
            const dataForm = await form.getFieldsValue();
            asyncFetch(dataForm);
          }}
          submitter={false}
          layout="inline"
        >
          <ProFormDatePicker.Month name="date" noStyle={false} />
          <ProFormSelect
            name={'gasType'}
            initialValue={1060}
            request={async () => {
              const lookup = await LookupDataServiceAPI(requestActions).lookupData({
                type: 'VEHICLE',
              });
              return lookup
                .filter((it) => it.code === 'FUELTYPE')
                .map((it, index) => ({ value: it.id, label: it.name, key: index, selected: true }));
            }}
            noStyle={true}
          />
        </ProForm>,
      ]}
    >
      <Spin spinning={requestActions.request?.loading || false}><Column
        data={data}

        xField={ 'truckNumber'}
        yField={ 'quantity'}
        xAxis={{
          label:{
            autoRotate:true
          },
        }}
        slider={{
          start:0,
          end:data.length
        }}
       /></Spin>
    </Card>
  );
};

export default TruckFuelUsage;
