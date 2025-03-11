import { ProDescriptions, ProFormSelect, ProList } from "@ant-design/pro-components";
// import { VisitScheduleItem } from "./data.type";
import { AimOutlined, RightCircleOutlined } from "@ant-design/icons";
import { Button, DatePicker, Input, Radio, Space, Spin } from "antd";
import storeIcon from '@/assets/store.png';
import { formatDateTime, toReadable } from "@/pages/utils";
import dayjs from "dayjs";
import weekday from 'dayjs/plugin/weekday';
import localeData from 'dayjs/plugin/localeData';
import { useEffect, useState } from "react";
import { VisitScheduleItem } from "@/services/crm/data";
import Status from "@/components/Status";
import moment from "moment";
import { CrmServiceAPI, InitVisitScheduleParamsType } from "@/services/crm/services";

dayjs.extend(localeData);
dayjs.extend(weekday);

interface InitVisitScheduleResponse {
    seList: { name: string }[];
}

export default ({ data, onZoom, onView, onSelectDate, onSearchSE, onFilterStatus, loading }: {
    data: VisitScheduleItem[],
    onZoom: (item: VisitScheduleItem) => void,
    onView: (item: VisitScheduleItem) => void,
    onSelectDate: (date: dayjs.Dayjs[]) => void,
    onSearchSE: (item: string) => void,
    loading: Boolean,
    onFilterStatus: (item: string) => void,
}) => {
    const [fileter, setFilter] = useState<VisitScheduleItem[]>([])
    const crmServices = CrmServiceAPI();
    useEffect(() => {
        setFilter(data)
    }, [data])

    return <div>
        {/* <Space.Compact style={{ width: 550 }} > */}
        {/* <DatePicker defaultValue={dayjs()} onChange={date => onSelectDate(date ?? dayjs())} /> */}

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <DatePicker
                defaultValue={dayjs()}
                onChange={(date) => {
                    if (date) {
                        const formattedDates: dayjs.Dayjs[] = [date, date];
                        onSelectDate(formattedDates);
                    }
                }}
            />
           
            <Radio.Group
                style={{
                    marginLeft: '5px',
                }}
                defaultValue="COMPLETED"
                onChange={(e) => {
                    onFilterStatus(e.target.value);
                }}
            >
                <Radio.Button value="ALL">All</Radio.Button>
                <Radio.Button value="PENDING">Pending</Radio.Button>
                <Radio.Button value="COMPLETED">Completed</Radio.Button>
            </Radio.Group>
            <ProFormSelect
                style={{
                    // overflowY: 'auto',
                    // height: '32px',
                    // lineHeight: '32px',
                    padding: 0, // Removes extra padding
                    marginTop: 12,
                    width: 300
                }}
                request={async () => {
                    const params: InitVisitScheduleParamsType[] = [
                        { actionName: 'sale', responseKey: 'seList', payload: {} },
                    ];
                    const rs = await crmServices.initVisitScheduleData(params) as InitVisitScheduleResponse;
                    return rs.seList.map((obj: any) => ({
                        value: `${obj.name}`,
                        label: `${obj.name}`,
                    }));
                }}
                showSearch
                fieldProps={{
                    onChange: (value: any) => {
                        onSearchSE(value);
                    },
                }}
            />
        </div>
        

        {/* <Input.Search
                onChange={(e) => onSearchSE(e.target.value)}
            /> */}

        {/* </Space.Compact> */}


        {loading ? (
            <Spin>
                <div style={{ height: "200px" }} />
            </Spin>
        ) :
            (<ProList<VisitScheduleItem>
                dataSource={fileter}
                metas={{
                    actions: {
                        render: (_, r) => <Button onClick={() => onView(r)} size="large" type="link" icon={<RightCircleOutlined />} />
                    },
                    avatar: {
                        render: () => <img height="50px" src={storeIcon} />
                    },
                    title: {
                        render: (_, r) => <Space >
                            <AimOutlined />
                            <a onClick={() => {
                                onZoom(r)
                            }}>{r.customer.code} </a>

                        </Space>

                    },
                    subTitle: {
                        render: (_, r) => `${r.customer.name}`
                    },
                    description: {
                        render: (_, r) => <ProDescriptions<VisitScheduleItem> columns={[
                            { title: 'Salesperson', render: () => r.salesperson.name },
                            { title: 'Address', render: () => r.address.name },
                            { title: 'Division', render: () => `${r.customer.division}` },
                            { title: 'Status', render: () => <Status value={r.status} text={toReadable(r.status)} /> },
                            { title: 'Check In Date', render: () => `${moment(r?.visit?.checkInDate)?.format("YYYY-MM-DD hh:mm:ss")}` },
                            { title: 'Check Out Date', render: () => `${moment(r?.visit?.checkoutDate)?.format("YYYY-MM-DD hh:mm:ss")}` },

                            // { title: 'Check In Date', render: () => formatDateTime(r.checkInDate) },
                            // { title: 'Checkout Date', render: () => formatDateTime(r.checkoutDate) }
                        ]} column={2} />
                    }
                }}
            />)}
    </div>
}