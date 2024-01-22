import { Card,  Descriptions,} from 'antd'
import React from 'react'

interface Props {
    outletType?: string;
    channel?: string;
    subChannel?: string;
    region?: string;
    se?: string;
}

const BasicInfoView: React.FC<Props> = (props) => {
    return <Card size='small'>
        <Descriptions>
            <Descriptions.Item label = 'Outlet Type'>
                {props.outletType}
            </Descriptions.Item>
            <Descriptions.Item label = 'Channel'>
                {props.channel}
            </Descriptions.Item>
            <Descriptions.Item label = 'Sub Channel'>
                {props.subChannel}
            </Descriptions.Item>
            <Descriptions.Item label = 'Division/ Region'>
                {props.region}
            </Descriptions.Item>
            <Descriptions.Item label = 'Sale Executive'>
                {props.se}
            </Descriptions.Item>
        </Descriptions>
    </Card>
}

export default BasicInfoView