import { ProDescriptions } from "@ant-design/pro-components"
import { Card } from "antd"
import { ProfileData } from "./data"

export default ({profile}: {profile: ProfileData}) => {
    return <div>
        <Card>
        <ProDescriptions>
            <ProDescriptions.Item label="User Name">
                {profile.userId}
            </ProDescriptions.Item>
            <ProDescriptions.Item label="Roles">
                {profile.roles.join(", ")}
            </ProDescriptions.Item>
        </ProDescriptions>
        </Card>
    </div>
}