
import { FieldInfo } from "@/services/shared/data";
import { Tooltip, Typography } from "antd";
const { Text } = Typography;

export const renderFieldInfoText = (record: { fieldInfoList: FieldInfo[];}, fieldName: string, value?: string,) => {
    const errorField = record.fieldInfoList.filter(it => it.fieldName == fieldName && it.isFailed)
    if (errorField.length > 0) {
        return <Tooltip color="red" title={errorField.map(it => it.message).join(", ")}><Text type="danger" >{value || errorField.map(it => it.message).join(", ")}</Text></Tooltip>
    }

    return value
}