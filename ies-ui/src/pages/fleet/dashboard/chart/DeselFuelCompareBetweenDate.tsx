import React, { useState, useEffect } from 'react';
import { Line } from '@ant-design/plots';
import { Card, Spin } from 'antd';
import { ProForm, ProFormDatePicker } from '@ant-design/pro-components';
import moment from 'moment';
import { simpleRequestActions } from '@/services/model';
import { useForm } from 'antd/lib/form/Form';
import { DieselUsageDaysInMonthDTO, DieselUsageDaysInMonthParam } from '../data';
import { DashboardServiceAPI } from '../service';

export default () => {
    const [data, setData] = useState<DieselUsageDaysInMonthDTO[]>([]);
    const requestActions = simpleRequestActions();
    const [form] = useForm();
    useEffect(() => {
        asyncFetch({ date: moment() });
    }, []);

    const asyncFetch = async (param?: DieselUsageDaysInMonthParam) => {
        const data = await DashboardServiceAPI(requestActions).dieselUsageDaysInMonth({
            ...param,
        });
        setData(data);

    };



    return (
        <Card
            title="Daily Diesel Filled"
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

                </ProForm>,
            ]}
        >
            <Spin spinning={requestActions.request?.loading || false}></Spin>
            <Line
                data={data}
                padding={'auto'}
                xField={'day'}
                yField={'quantity'}

                label={{
                    formatter: (r) => {
                        if(r.quantity){
                            return `${r.quantity}`

                        }
                        return ""
                    }
                }}
            />
        </Card>
    )
};

