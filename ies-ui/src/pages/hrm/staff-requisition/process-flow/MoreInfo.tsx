import { Descriptions, Spin, Typography } from "antd"
import { useEffect, useState } from "react"
import { EmployeeServices } from "../../services";
import { simpleRequestActions } from "@/services/model";
import { StaffRequisitionRequest } from "../../data";
import { UserTask } from "@/services/process-workflow/data";
import { formatDate } from "@/pages/utils";

export default ({ instanceInfo, owner }: UserTask) => {

    const requestActions = simpleRequestActions();

    const [detail, setDetail] = useState<StaffRequisitionRequest>()

    useEffect(() => {
        if (!instanceInfo?.processInstanceId) return
        (async () => {
            const rs = await EmployeeServices.fetchStaffRequisitionRequest(instanceInfo?.processInstanceId).query(requestActions)
            setDetail(rs)
        })()
    }, [instanceInfo?.processInstanceId])
    return (
        <Spin spinning={requestActions.request?.loading || false}>
            <Descriptions column={1} size="small">
                <Descriptions.Item label="Hired Posistion">
                    {detail?.positionHired.name} / {detail?.department.name} / {detail?.bu.name}
                </Descriptions.Item>
                <Descriptions.Item label="Hired Reason">
                    <Typography.Paragraph ellipsis={{
                        expandable: true,
                        defaultExpanded: false,
                        rows: 3,
                        symbol: 'more'
                    }}>
                        {detail?.hiredReason || (detail?.replacedEmp ? "Replacement" : '')}
                    </Typography.Paragraph>

                </Descriptions.Item>
                <Descriptions.Item label="Requestor">{owner}</Descriptions.Item>
                <Descriptions.Item label="Requested Date">{formatDate(instanceInfo.submittedDate)}</Descriptions.Item>

            </Descriptions>
        </Spin>
    )
}