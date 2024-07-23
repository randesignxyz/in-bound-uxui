import React, { useState, useEffect } from 'react';
import { Column } from '@ant-design/plots';
import { MonthlyAvgVehicleRepair, MonthlyAvgVehicleRepairParam } from '../data';
import { simpleRequestActions } from '@/services/model';
import { DashboardServiceAPI } from '../service';
import { Card, Spin } from 'antd';
import { ProForm, ProFormDatePicker } from '@ant-design/pro-components';
import moment from 'moment';
import { useForm } from 'antd/es/form/Form';
import { formatter } from '@/pages/utils';

const MonthlyAvgTruckRepair = () => {
    const [data, setData] = useState<MonthlyAvgVehicleRepair[]>([]);
    const requestActions = simpleRequestActions();
    const [form] = useForm<MonthlyAvgVehicleRepairParam>();
    useEffect(() => {
        asyncFetch();
    }, []);

    const asyncFetch = async (param?: MonthlyAvgVehicleRepairParam) => {
        const data = await DashboardServiceAPI(requestActions).monthlyAvgTruckRepair({
            ...param,
        });
        setData(data);

    };

    return <Card
        title="Monthly AVG Vehicles Repair Maintenance"
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
                <ProFormDatePicker.Year name="date" initialValue={moment()} noStyle={false} />
               
            </ProForm>,
        ]}
    >
        <Spin spinning={requestActions.request?.loading || false}>
            <Column
                data={data}
                xField='date'
                yField='value'
                seriesField='type'
                isGroup={true}
                legend={{
                    position:"bottom"
                }}
                label={{
                    text: (r: { value: any; }) => {
                      return formatter.format(r.value)
                    },
                    textBaseline: 'bottom',
                  }}
                // label={{
                //     formatter:(r)=>{
                //         return `${formatter.format(r.value)} `
                //     },
                //     position: 'top',
                //     layout: [
                //         {
                //             type: 'interval-adjust-position',
                //         },  
                //         {
                //             type: 'interval-hide-overlap',
                //         }, 
                //         {
                //             type: 'adjust-color',
                //         },
                    
                //     ],
                // }}
            /></Spin>
    </Card>
};

export default MonthlyAvgTruckRepair 