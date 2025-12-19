import { Descriptions, Spin, Typography } from "antd"
import { useEffect, useState } from "react"
import { EmployeeServices } from "../../services";
import { simpleRequestActions } from "@/services/model";
import { StaffRequisitionRequest } from "../../data";
import { UserTask } from "@/services/process-workflow/data";
import { formatDate } from "@/pages/utils";
import { createService } from "../services";
import { ProbationEvaluationDetailRs } from "../data.types";

export default ({ instanceInfo, owner }: UserTask) => {

    const requestActions = simpleRequestActions();
    const srv = createService({ request: requestActions });

    const [detail, setDetail] = useState<ProbationEvaluationDetailRs>()

    useEffect(() => {
        if (!instanceInfo?.processInstanceId) return
        (async () => {
            const rs = await srv.detailByProcessFlow(instanceInfo?.processInstanceId);            
            setDetail(rs)
        })()
    }, [instanceInfo?.processInstanceId])
    return (
        <Spin spinning={requestActions.request?.loading || false}>
            <Descriptions column={1} size="small">
                <Descriptions.Item label="Employee Name">
                    {detail?.empName} 
                </Descriptions.Item>
                <Descriptions.Item label="Hired Posistion">
                    {detail?.jobTitle} / {detail?.departmentName} / {detail?.buName}
                </Descriptions.Item>
                <Descriptions.Item label="Hired Date">{formatDate(detail?.joinedDate)}</Descriptions.Item>                
                <Descriptions.Item label="Requestor">{owner}</Descriptions.Item>
                <Descriptions.Item label="Requested Date">{formatDate(instanceInfo.submittedDate)}</Descriptions.Item>

            </Descriptions>
        </Spin>
    )
}