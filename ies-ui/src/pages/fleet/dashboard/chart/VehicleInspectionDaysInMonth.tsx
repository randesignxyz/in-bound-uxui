import { simpleRequestActions } from "@/services/model";
import { Line } from "@ant-design/plots";
import { ProForm, ProFormDatePicker } from "@ant-design/pro-components";
import { Card, Spin } from "antd";
import { useForm } from "antd/es/form/Form";
import moment from "moment";
import { useState, useEffect } from "react";
import { DieselUsageDaysInMonthParam, InspectionDaysInMonthDTO } from "../data";
import { DashboardServiceAPI } from "../service";

export default () => {
    const [data, setData] = useState<InspectionDaysInMonthDTO[]>([]);
    const requestActions = simpleRequestActions();
    const [form] = useForm();
    useEffect(() => {
        asyncFetch({ date: moment() });
    }, []);

    const asyncFetch = async (param?: DieselUsageDaysInMonthParam) => {
        const data = await DashboardServiceAPI(requestActions).inspectionDaysInMonth({
            ...param,
        });
        setData(data);

    };


    return (
        <Card
            title="Daily Inspaction"
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
                xField="day"
                yField="qty"
                
                legend={{
                    position: "bottom"
                }}
                smooth={true}
                animation={{
                    appear: {
                        animation: "path-in",
                        duration: 5000
                    }
                }}
            />
        </Card>
    )
}