import { ProDescriptions, ProList } from "@ant-design/pro-components";
import { LocationTracking } from "./data.type";
import { AimOutlined, RightCircleOutlined } from "@ant-design/icons";
import { Button, DatePicker, Input, Space } from "antd";
import truckIcon from '@/assets/truck.png';
import { formatDateTime } from "@/pages/utils";
import dayjs from "dayjs";
import weekday from 'dayjs/plugin/weekday';
import localeData from 'dayjs/plugin/localeData';
import { useEffect, useState } from "react";


dayjs.extend(localeData);
dayjs.extend(weekday);

export default ({ data, onZoom, onView, onSelectDate }: {
    data: LocationTracking[],
    onZoom: (item: LocationTracking) => void,
    onView: (item: LocationTracking) => void,
    onSelectDate: (data: dayjs.Dayjs) => void
}) => {
    const [fileter, setFilter] = useState<LocationTracking[]>([])

    useEffect(() => {
        setFilter(data)
    }, [data])


    return <div>
        <Space.Compact style={{ width: 570 }} >
            <DatePicker defaultValue={dayjs()} onChange={date => onSelectDate(date ?? dayjs())} />
            <Input.Search onSearch={value => {
                const regex = new RegExp(value, "i");
                setFilter(_ => data.filter(
                    it =>
                        value.length == 0 ||
                        it.licensePlane.search(regex) >= 0 ||
                        it.shipToCode.search(regex) >= 0 ||
                        it.shift.search(regex) >= 0 ||
                        it.cardCode.search(regex) >= 0 ||
                        it.cardName.search(regex) >= 0 ||
                        `${it.cardCode}-${it.cardName}`.search(regex) >= 0 ||
                        it.firstName.search(regex) >= 0 ||
                        it.lastName.search(regex) >= 0
                ))
            }} />
        </Space.Compact>
        <ProList<LocationTracking>
            dataSource={fileter}
            metas={{
                actions: {
                    render: (_, r) => <Button onClick={() => onView(r)} size="large" type="link" icon={<RightCircleOutlined />} />
                },
                avatar: {
                    render: () => <img height="50px" src={truckIcon} />
                },
                title: {
                    render: (_, r) => <Space >
                        <AimOutlined />
                        <a onClick={() => {
                            onZoom(r)
                        }}>{r.licensePlane}</a>

                    </Space>

                },
                subTitle: {
                    render: (_, r) => `${r.firstName} ${r.lastName}`
                },
                description: {
                    render: (_, r) => <ProDescriptions<LocationTracking> columns={[
                        { title: 'Ship to', span: 2, render: () => r.shipToCode },
                        { title: 'Shift', render: () => r.shift },
                        { title: 'Customer', render: () => `${r.cardCode}-${r.cardName}` },

                        { title: 'Check In Date', render: () => formatDateTime(r.checkInDate) },
                        { title: 'Checkout Date', render: () => formatDateTime(r.checkoutDate) }
                    ]} column={2} />
                }
            }}
        />
    </div>
}