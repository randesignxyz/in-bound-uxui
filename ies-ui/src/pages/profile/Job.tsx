
import { ProTable } from "@ant-design/pro-components"
import { Card } from "antd"
import { JobData, ProfileData } from "./data"

export default ({ profile }: { profile: ProfileData }) => {
    return <div>
        <Card>
            <ProTable<JobData>
                dataSource={profile.jobs}
                search={false}
                pagination={false}
                size='small'
                options={{
                    density: false,
                    fullScreen: false,
                    setting: false,
                    reload: false
                }}
                columns={[
                    {
                        title: "Job Title", dataIndex: "jobTitle"
                    },{
                        title: "Report To", dataIndex: "reportTo"
                    }, {
                        title: "Department", dataIndex: 'department'
                    },{
                        title: "Business Unit", dataIndex: 'buName'
                    }
                ]}
            />
        </Card>
    </div>
}