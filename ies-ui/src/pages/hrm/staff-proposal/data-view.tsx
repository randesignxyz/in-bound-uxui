import { simpleRequestActions } from "@/services/model"
import { createService } from "./services"
import { useEffect, useState } from "react"
import { RequestedItem, StaffProposalDetail } from "./data.types"
import { Checkbox, Space, Spin, message } from "antd"
import { ProCard, ProDescriptions, ProTable } from "@ant-design/pro-components"
import { formatDate, formatter } from "@/pages/utils"
export default ({ processInstaceId, forceReload }: { processInstaceId: string, forceReload?: number }) => {
    const requestActions = simpleRequestActions()
    const services = createService(requestActions)
    const [dataDetail, setDataDetail] = useState<StaffProposalDetail>()

    useEffect(() => {
        (async () => {
            try {
                const rs = await services.findByInstId(processInstaceId)
                setDataDetail(rs)
            } catch (error: any) {
                message.error(error.message || 'Failed to load data.')
            }
        })()
    }, [forceReload, processInstaceId])

    return <Spin spinning={requestActions.request?.loading}>
        <Space direction="vertical" style={{ width: '100%' }}>
            <ProCard size="small" bordered title="Details of Position Hired">
                <ProDescriptions<StaffProposalDetail>
                    dataSource={dataDetail}
                    columns={[
                        { title: "Name", dataIndex: 'empName', },
                        { title: "Job Title", render: (_, r) => r?.jobTitle?.name },
                        { title: "Job Title", render: (_, r) => r?.segment?.name },
                        { title: "BU", render: (_, r) => r?.bu?.name },
                        { title: "Function", render: (_, r) => r?.department?.name },
                        { title: "Sub Function", render: (_, r) => r?.subDepartment?.name },
                        { title: "Session", render: (_, r) => r?.session },
                        { title: "Team", render: (_, r) => r?.team },
                        { title: "Team", render: (_, r) => r?.team },
                        { title: "Working Shift", render: (_, r) => r?.workingShift?.name },
                        { title: "Direct supervisor", render: (_, r) => r?.directReportTo?.name },
                        { title: "Group day-off", render: (_, r) => r?.dayOffGroup?.name },
                        { title: "Starting Date", render: (_, r) => r?.startingDate && formatDate(r.startingDate) },
                        { title: "Requisition No#", render: (_, r) => r?.requisition && <a target="_blank" onClick={() => {
                            window.open(`/data-form/staff_requisition_request_process/${r?.requisition.code}`, '_blank')?.focus();
                        }}>  {r?.requisition.name }</a>},
                    ]}

                />
            </ProCard>
            <ProCard size="small" bordered title="Type of Contract">
                <ProDescriptions<StaffProposalDetail> dataSource={dataDetail}
                    columns={[
                        { title: "Type", render: (_, r) => r?.contractType?.name },
                        { title: "Duration", hideInDescriptions: !dataDetail?.contractDateFrom, render: (_, r) => [r.contractDateFrom, r.contractDateTo].filter(it => it).map(it => formatDate(it)).join(" to ") },
                    ]}
                />
            </ProCard>

            <ProCard size="small" bordered title="Benefit">
                <ProTable<RequestedItem>
                    search={false}
                    pagination={false}
                    options={{
                        density: false,
                        setting: false,
                        reload: false
                    }}
                    showHeader={false} size="small" dataSource={dataDetail?.items}
                    columns={[
                        { dataIndex: 'checked', width: 50, render: (_, r) => <Checkbox checked={r.checked} /> },
                        { dataIndex: "itemName", width: 300 },
                        { dataIndex: "amount" , width: 100, align: 'right', render: (_,r) => (r.amount || 0)>0 && r.checked && formatter.format(r.amount || 0) },
                        { dataIndex: "remarks" }
                    ]}
                />
            </ProCard>

        </Space>
    </Spin>
}