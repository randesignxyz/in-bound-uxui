import React, { useState, useEffect } from 'react';
import { Column } from '@ant-design/plots';
import { DashboardServiceAPI } from '../service';
import { simpleRequestActions } from '@/services/model';
import { TruckMaintenanceCostDTO, TruckMaintenanceCostParam } from '../data';
import { Card, Spin } from 'antd';
import { ProForm, ProFormDatePicker, ProFormSelect } from '@ant-design/pro-components';
import { useForm } from 'antd/lib/form/Form';
import { formatter } from '@/pages/utils';

const TruckMaintenanceCost = () => {
  const [data, setData] = useState<TruckMaintenanceCostDTO[]>([]);
  const requestActions = simpleRequestActions();
  const [form] = useForm();
  useEffect(() => {
    asyncFetch(form.getFieldsValue());
  }, []);

  const asyncFetch = async (param?: TruckMaintenanceCostParam) => {
    const data = await DashboardServiceAPI(requestActions).truckMaintenanceCostList({ ...param, status: param?.status || "Close" });
    setData(data);
  };



  return <Card title="Vehicls Maintenance Cost"
    extra={[
      <ProForm
        form={form}
        onValuesChange={async (e) => {
          const dataForm = await form.getFieldsValue();
          asyncFetch(dataForm)

        }}
        submitter={false}
        layout='inline'
      >
        <ProFormDatePicker.Month
          name="date"
          noStyle={false}
        />
        <ProFormSelect
          name={"type"}
          options={[
            {
              value: "Close",
              label: "Close"
            },
            {
              value: "Open",
              label: "Open"
            },

          ]}

          noStyle={true}
        />
      </ProForm>

    ]}

  >
    <Spin spinning={requestActions.request?.loading || false}>
      <Column
        data={data}
        xField={'truckNumber'}
        yField={'totalCost'}
        // label={{
        //   position:"top",
        //   formatter:(r:number)=>{
        //     return `${r?formatterQty.format(r):"00"}`
        //   }
        // }}
        label={{
          text: (r: { totalCost: any; }) => {
            return formatter.format(r.totalCost)
          },
          textBaseline: 'bottom',
        }}
        xAxis={{
          label: {
            autoRotate: true,
          },
        }}
        slider={{
          start: 0,
          end: data.length,
        }}

      /></Spin></Card>;
};

export default TruckMaintenanceCost
