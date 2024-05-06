import { AccountServiceAPI, AccountServiceAPIs, WorkFlowServiceAPI } from "@/services/account/services"
import { simpleRequestActions } from "@/services/model"
import { Delegation, DelegationSaveParams, DestUser, SaveFirstLevelApproval } from "@/services/process-workflow/data"
import { ModalForm, ModalFormProps, ProForm, ProFormDatePicker, ProFormSelect, ProFormTextArea } from "@ant-design/pro-components"
import { Modal, message } from "antd";
import _ from "lodash";

interface Props extends ModalFormProps<DelegationSaveParams, { data: string }> {
    destination?: SaveFirstLevelApproval;
    onAdd: (data: Delegation) => void;
}
export default ({ destination, onAdd, ...rest }: Props) => {

    const requestActions = simpleRequestActions()
    const accountServices = AccountServiceAPI(requestActions)
    const workflowServices = WorkFlowServiceAPI(requestActions)
    const loadUser = async (keyworks?: string) => {
        return (await AccountServiceAPIs.fetchListContributors(keyworks).query(requestActions)).map(it => ({ label: [it.code || '000000', it.name].join(' - '), value: it.id, }))
    }

    const listUserByUserIds = async (userIds: string[]) => {
        return (await accountServices.findUsers({ list: userIds })).map(it => ({ value: it.id, label: `${it.name}` }))
    }

    const approvers: (DestUser | undefined)[] = [
        destination?.assignee.defaultAssignee,
        destination?.assignee.departmentHead ? { userId: 'head.department', userName: "Function Head" } : undefined,
        ...(destination?.candidateUser?.candidates || []),
        ...(destination?.candidateUser?.custom?.flatMap(it => it.candidates) || []),
        ...(destination?.assignee.destSelectorList?.flatMap(it => ({ userId: it.userId, userName: it.userId })) || [])
    ].filter(it => it)

    const assignedList = _.unionBy(approvers, it => it?.userId)

    return <ModalForm<DelegationSaveParams, { data: string }  >
        title="Delegation"
        {...rest}
        onFinish={async (data) => {
            Modal.confirm({
                title: "Save task delegation",
                content: "Are you sure?",
                onOk: async () => {
                    try {
                        await workflowServices.save(data)
                    } catch (error: any) {
                        message.error(error.message || "Failed to save data.")
                    }
                }
            })
            workflowServices.save(data)
        }}
    >
        <ProFormSelect
            name={"approvers"}
            label="Approver"
            request={async () => await listUserByUserIds(assignedList?.filter(it => it)?.map(it => it?.userId || ''))}

            rules={[{ required: true }]} />
        <ProFormSelect
            tooltip="Leave blank for auto approval"
            name={"deligateTo"} label="Delegate To"
            showSearch
            debounceTime={500} request={({ keyWords }) => loadUser(keyWords)}
        />
        <ProForm.Group>
            <ProFormDatePicker name={"effectiveDate"} label="Effective Date" rules={[{ required: true }]} />
            <ProFormDatePicker name={"expiryDate"} label="Expirey Date" />
        </ProForm.Group>
        <ProFormTextArea name={"remarks"} label="Remarks" rules={[{ required: true }]} />

    </ModalForm>
}