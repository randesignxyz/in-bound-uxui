import { Badge, Radio, Space } from "antd";
import { forwardRef, useImperativeHandle, useState } from "react";


const StatusBar = forwardRef(({ onStatusChanged, onCustomerTypeChanged }: { onStatusChanged: (value?: string) => void; onCustomerTypeChanged: (value?: string) => void }, ref) => {
    const [statusCount, setStatusCount] = useState<{ pending?: number, failed?: number }>()
    useImperativeHandle(ref, () => ({
        refresh: (pending?: number, failed?: number) => {
            setStatusCount({
                pending, failed
            })
        }
    }))


    return <Space size="large" style={{ marginTop: -10 }}>

        <Radio.Group
            defaultValue={'Pending'}
            onChange={(e) => onStatusChanged(e.target.value)}
        >
            <Badge
                size="small"
                offset={[-20, 0]}
                count={statusCount?.pending}
            >
                <Radio.Button value="Pending"> Pending</Radio.Button>
            </Badge>
            <Radio.Button value="Posted">Posted</Radio.Button>
            <Badge size="small" offset={[-20, 0]} count={statusCount?.failed}>
                <Radio.Button style={{ borderRadius: 0 }} value="Failed">Failed</Radio.Button>
            </Badge>
            {/* <Radio.Button value="Closed">Closed</Radio.Button> */}
            <Radio.Button value="Canceled">Canceled</Radio.Button>
        </Radio.Group>

        <Radio.Group
            defaultValue={'Direct'}
            onChange={(e) => onCustomerTypeChanged(e.target.value)}
        >
            <Radio.Button value="All">All</Radio.Button>
            <Radio.Button value="Direct">Direct</Radio.Button>
            <Radio.Button value="Indirect">In Direct</Radio.Button>
        </Radio.Group>
    </Space >
})

export default StatusBar