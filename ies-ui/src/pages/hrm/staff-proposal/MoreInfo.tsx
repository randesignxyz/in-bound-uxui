import { Descriptions, Spin, message } from "antd"
import { useEffect, useState } from "react"

import { simpleRequestActions } from "@/services/model";
import { UserTask } from "@/services/process-workflow/data";
import { formatDate } from "@/pages/utils";
import { StaffProposalDetail } from "./data.types";
import { createService } from "./services";

export default ({ instanceInfo, owner }: UserTask) => {

    const requestActions = simpleRequestActions();

    const services = createService(requestActions)
    const [dataDetail, setDataDetail] = useState<StaffProposalDetail>()

    useEffect(() => {
        if (!instanceInfo?.processInstanceId) return
        (async () => {
            try {
                const rs = await services.findByInstId(instanceInfo.processInstanceId)
                setDataDetail(rs)
            } catch (error: any) {
                message.error(error.message || 'Failed to load data.')
            }
        })()
    }, [instanceInfo?.processInstanceId])


    return (
        <Spin spinning = {requestActions.request?.loading || false}>
            <Descriptions column={1} size="small">
                <Descriptions.Item label="Hired Posistion">
                    {dataDetail?.jobTitle.name} / {dataDetail?.department.name} / {dataDetail?.bu.name}
                </Descriptions.Item>
                <Descriptions.Item label="Requestor">{owner}</Descriptions.Item>
                <Descriptions.Item label="Requested Date">{formatDate(instanceInfo.submittedDate)}</Descriptions.Item>

            </Descriptions>
        </Spin>
    )
}
