import { fetchDataItemService } from "@/services/apiGateway"
import { simpleRequestActions } from "@/services/model"
import { ModalForm, ProDescriptions } from "@ant-design/pro-components"
import { useEffect, useState } from "react"
import { OperatorCheckInInfo } from "../board/data"
import { message } from "antd"
import { formatDateTime } from "@/pages/utils"
import moment from "moment"

export default ({ trigger, type }: { trigger?: JSX.Element, type: 'WAREHOUSE' | 'DELIVERY' }) => {
    const requestActions = simpleRequestActions()
    const [data, setData] = useState<OperatorCheckInInfo>()
  
    const initData = async () => {
        try {
            const rs = await fetchDataItemService<OperatorCheckInInfo, { type: 'WAREHOUSE' | 'DELIVERY' }>({
                actionName: "fetch-operator-check-in-info",
                endpoint: 'DELIVERY',
                payload: { type }
            }).query(requestActions)
            setData(rs)    
        } catch (error: any) {
            message.error(error.message || 'Failed to fetch check in info.')
        }
        
    }
    return <ModalForm onInit={()=> {
        initData()
    }} modalProps={{destroyOnClose: true}} title={"Check In info"} trigger={trigger} submitter={false}>
        <ProDescriptions column={2} loading = {requestActions.request?.loading || false}>
            <ProDescriptions.Item label="Check In Datetime">
                {formatDateTime(data?.checkedInDate)}
            </ProDescriptions.Item>
            <ProDescriptions.Item label="Duration">
                { data?.checkedInDate && moment(data.checkedInDate).toNow()}
            </ProDescriptions.Item>
            {type == 'DELIVERY' && <ProDescriptions.Item span={2} label="Transport source">
                {data?.transportSources?.map(it => it.name).join(", ")}
            </ProDescriptions.Item>}
            {type == 'DELIVERY' && <ProDescriptions.Item span={2} label="Loading Capacity">
                {data?.loadingCapacities?.map(it => it.name).join(", ")}
            </ProDescriptions.Item>}
            {type == 'WAREHOUSE' && <ProDescriptions.Item span={2} label="Loading dock">
                {data?.loadingDocks?.map(it => it.name).join(", ")}
            </ProDescriptions.Item>}
            <ProDescriptions.Item span={2} label = "Remarks"> {data?.checkInRemarks} </ProDescriptions.Item>
        </ProDescriptions>
    </ModalForm>
}