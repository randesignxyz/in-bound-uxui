import { simpleRequestActions } from "@/services/model"
import { Checkbox, Space, Spin, message } from "antd"
import { createService } from "./services"
import { NewStaffDetailItem, NewStaffItemDetail } from "./data.types"
import { useEffect, useState } from "react"
import { ProCard, ProDescriptions, ProTable } from "@ant-design/pro-components"
import { formatDate } from "@/pages/utils"

export default ({ processInstaceId, forceReload }: { processInstaceId: string, forceReload?: number }) => {
    const requestActions = simpleRequestActions()
    const services = createService(requestActions)
    const [dataDetail, setDataDetail] = useState<NewStaffItemDetail>()

    useEffect(() => {
        (async () => {
            try {
                const rs = await services.findByInstId(processInstaceId)
                setDataDetail(rs)
            } catch (error: any) {
                message.error(error.message || "Failed to fetch data.")
            }

        })()
    }, [forceReload, processInstaceId])

    const renderItem = (title: string, dataSource: NewStaffDetailItem[], index: number) => {
        return <ProTable headerTitle={title}
            search={false}
            key={`table-${index}`}
            rowKey={'id'}
            pagination={false}
            options={{
                density: false,
                setting: false,
                reload: false
            }}
            showHeader={false} size="small" dataSource={dataSource}
            columns={[
                { dataIndex: 'checked', width: 50, render: (_, r) => <Checkbox checked={r.checked} /> },
                { dataIndex: "itemName", width: 300 },
                { dataIndex: "remarks" }
            ]}
        />
    }

    const shareDriveList = dataDetail?.items.filter(it => it.itemType == 'ICT_FORM_SHARE_DRIVE') || []
    const systemList = dataDetail?.items.filter(it => it.itemType == 'ICT_FORM_SYSTEM_ACCESS') || []
    const workflowList = dataDetail?.items.filter(it => it.itemType == 'ICT_FORM_WORKFLOW_ACCESS') || []
    const networkList = dataDetail?.items.filter(it => it.itemType == 'ICT_FORM_NETWORK_ACCESS') || []

    return <Spin spinning={requestActions.request?.loading}><Space style={{ width: '100%' }} direction="vertical">
        <ProCard size="small" title="1. Personal Details (Completed by HR)" bordered >
            <ProDescriptions<NewStaffItemDetail> dataSource={dataDetail} columns={[
                { title: "Employee No", dataIndex: 'empNo' },
                { title: "Employee Name", dataIndex: 'empName' },
                { title: "Employee Name (KH)", dataIndex: 'empLocalName' },
                { title: "Job title", dataIndex: 'jobTitle' },
                { title: "BU", dataIndex: 'bu' },
                { title: "Department", dataIndex: 'department' },
                { title: "Starting Date", render: (_, r) => formatDate(r.startingDate) },
                { title: "workplace", dataIndex: 'workplace' },

            ]} />
        </ProCard>

        {renderItem("2. Fingerprint Attendance (Please √, Initiated by HR, reviewed by hired Function Manager)", dataDetail?.items.filter(it => it.itemType == 'ICT_FORM_FINGER_PRINT_ATTENDANCE') || [], 1)}
        {renderItem("3. Fingerprint Access Door (Please √, Initiated by HR, reviewed by hired Function Manager)", dataDetail?.items.filter(it => it.itemType == 'ICT_FORM_FINGER_PRINT_ACCESS_DOOR') || [], 2)}
        {shareDriveList.length > 0 && renderItem("4. Shared Drive (Please √, completed by hired Function Manager)", shareDriveList, 3)}
        {systemList.length > 0 && renderItem("5. Systems Access (Please √, completed by hired Function)", systemList, 4)}
        {workflowList.length > 0 && renderItem("6. Workflow Process, E-Form (Please √, completed by hired Function)", workflowList, 5)}
        {networkList.length > 0 && renderItem("7.  Shared Drive (Please √, completed by ICT)", networkList, 6)}

    </Space></Spin>
}