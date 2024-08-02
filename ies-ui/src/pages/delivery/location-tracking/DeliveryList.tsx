import { ProDescriptions, ProList } from "@ant-design/pro-components";
import { LocationTracking } from "./data.type";
import { AimOutlined, RightCircleOutlined } from "@ant-design/icons";
import { Button, DatePicker, Input, Space } from "antd";
import truckIcon from '@/assets/truck.png';
import { formatDateTime } from "@/pages/utils";
import dayjs from "dayjs";
import weekday from 'dayjs/plugin/weekday';
import localeData from 'dayjs/plugin/localeData';


dayjs.extend(localeData);
dayjs.extend(weekday);

export default ({ data, onZoom, onView }: { data: LocationTracking[], onZoom: (item: LocationTracking) => void, onView: (item: LocationTracking) => void }) => {

    return <div>
        <Space.Compact style={{ width: 570 }} >
            <DatePicker defaultValue={dayjs()} onChange={(date) => {
                console.log(date);
            }} />
            <Input.Search />
        </Space.Compact>
        <ProList<LocationTracking>
            dataSource={data}

            metas={{
                actions: {
                    render: (_, r) => <Button onClick={() => onView(r)} size="large" type="link" icon={<RightCircleOutlined />} />
                },
                avatar: {
                    render: () => <img height="80px" src={truckIcon} />
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
                        { title: 'Shift', render: () => r.shift },
                        { title: 'Customer', render: () => `${r.cardCode}-${r.cardName}` },
                        { title: 'Ship to', render: () => r.shipToCode },
                        { title: 'Check In Date', render: () => formatDateTime(r.checkInDate) },
                        { title: 'Checkout Date', render: () => formatDateTime(r.checkoutDate) }
                    ]} column={1} />
                }
            }}
        />
    </div>
}