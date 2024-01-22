import { formatDate } from "@/pages/utils";
import { UserTask } from "@/services/process-workflow/data";
import { Descriptions } from "antd";

export default (task: UserTask) => {
    return (
        <Descriptions column={1} size="small">
            <Descriptions.Item label = "Requestor">{task.owner}</Descriptions.Item>
            <Descriptions.Item label = "Requested Date">{formatDate(task.instanceInfo.submittedDate)}</Descriptions.Item>
            {task.instanceInfo.instanceComment && <Descriptions.Item label = "Description">{task.instanceInfo.instanceComment}</Descriptions.Item>}
        </Descriptions>
    )
}