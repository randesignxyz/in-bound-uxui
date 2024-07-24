import { Button, Flex, Popconfirm } from "antd"
import DelegationForm from "./DelegationForm"
import { DeleteOutlined, PlusCircleFilled, UserOutlined } from "@ant-design/icons"
import { ActionType, ProDescriptions, ProList } from "@ant-design/pro-components"
import { Delegation, SaveFirstLevelApproval } from "@/services/process-workflow/data"
import { useRef } from "react"
import { simpleRequestActions } from "@/services/model"
import { WorkFlowServiceAPI } from "@/services/account/services"
import { formatDate } from "@/pages/utils"

export default ({ destination }: { destination?: SaveFirstLevelApproval; }) => {

    const requestActions = simpleRequestActions()
    const workflowServices = WorkFlowServiceAPI(requestActions)
    const actionRef = useRef<ActionType>();

    return <>
        <Flex justify='flex-end'>
            <Flex>
                <DelegationForm destination={destination} onAdded={() => {
                    actionRef.current?.reloadAndRest?.()
                }} trigger={<Button type='link' icon={<PlusCircleFilled />} />} />
            </Flex>
        </Flex>
        <ProList<Delegation>
            request={async () => {
                const rs = await workflowServices.list(destination?.taskDefId || '')
                return { data: rs }
            }}
            actionRef={actionRef}
            metas={{
                avatar: {
                    render: () => <UserOutlined />
                },
                title: {
                    render: (_, r) => r.delegateUser?.name || "Auto Approval"
                },
                description: {
                    render: (_, r) => <ProDescriptions<Delegation> columns={[
                        { title: "Approver", render: () => r.approver.name },
                        { title: "Effective Date", render: () => formatDate(r.effectiveDate) },
                        { title: "Expiry Date", render: () => r.expiryDate && formatDate(r.expiryDate) },
                        { title: "Remarks", render: () => r.remarks },
                    ]} />
                },
                actions: {
                    render: (_, r) => <Button danger type="link" icon={<Popconfirm
                        title="Delete the delegation"
                        description="Are you sure?"
                        onConfirm={async () => {
                            await workflowServices.delete(r.id)
                            actionRef.current?.reloadAndRest?.()
                        }}
                        okText="Yes"
                        cancelText="No"
                    > <DeleteOutlined />
                    </Popconfirm>} />
                }
            }} />
    </>
}