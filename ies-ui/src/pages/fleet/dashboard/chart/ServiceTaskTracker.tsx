import { simpleRequestActions } from '@/services/model';
import { Column } from '@ant-design/plots';
import { ProForm, ProFormDatePicker, ProFormSelect } from '@ant-design/pro-components';
import { Card, Spin } from 'antd';
import { useForm } from 'antd/es/form/Form';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { LookupDataServiceAPI } from '../../lookupData/service';
import { ServiceTaskMoreMaintenanceDTO, ServiceTaskMoreMaintenanceParam } from '../data';
import { DashboardServiceAPI } from '../service';

const ServiceTaskTracker = () => {
  const [data, setData] = useState<ServiceTaskMoreMaintenanceDTO[]>([]);
  const requestActions = simpleRequestActions();
  const [form] = useForm();
  useEffect(() => {
    asyncFetch(form.getFieldsValue());
  }, []);

  const asyncFetch = async (param?: ServiceTaskMoreMaintenanceParam) => {
    const data = await DashboardServiceAPI(requestActions).serviceTaskMostMaintenanceList({
      ...param,
    });

    setData(data);
  };

  const config = {
    data,

    xField: 'serviceName',
    yField: 'count',
    xAxis: {
      label: {
        autoRotate: true,
      },
    },
    slider: {
      start: 0,
      end: data.length,
    },
  };

  return (
    <Card
      title="Service Task More Maintenace"
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
          <ProFormDatePicker.Month name="date" initialValue={moment()} noStyle={false} />
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
      <Spin spinning={requestActions.request?.loading || false}><Column {...config} /></Spin>
    </Card>
  );
};

export default ServiceTaskTracker;
