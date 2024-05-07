import { AccountServiceAPI, AccountServiceAPIs, WorkFlowServiceAPI } from "@/services/account/services"
import { simpleRequestActions } from "@/services/model"
import { Delegation, DelegationSaveParams, DestUser, SaveFirstLevelApproval } from "@/services/process-workflow/data"
import { ModalForm, ModalFormProps, ProForm, ProFormDatePicker, ProFormSelect, ProFormTextArea } from "@ant-design/pro-components"
import { Modal, message } from "antd";
import _ from "lodash";
import moment from "moment";

interface Props extends ModalFormProps<DelegationSaveParams, { data: string }> {
    destination?: SaveFirstLevelApproval;
    onAdded: () => void;
}
export default ({ destination, onAdded, ...rest }: Props) => {

    const requestActions = simpleRequestActions()
    const accountServices = AccountServiceAPI(requestActions)
    const workflowServices = WorkFlowServiceAPI(requestActions)
    const loadUser = async (keyworks?: string) => {
        return (await AccountServiceAPIs.fetchListContributors(keyworks).query(requestActions)).map(it => ({ label: [it.code || '000000', it.name].join(' - '), value: it.id, }))
    }

    const listUserByUserIds = async (userIds: string[]) => {
        return (await accountServices.findUsers({ list: userIds })).map(it => ({ value: it.id, label: `${it.name}` }))
    }

    console.log(destination?.assignee);

    const approvers: (DestUser | undefined)[] = [
        destination?.assignee.defaultAssignee,
        destination?.assignee.departmentHead ? { userId: 'head.department', userName: "Function Head" } : undefined,
        ...(destination?.candidateUser?.candidates || []),
        ...(destination?.candidateUser?.custom?.flatMap(it => it.candidates) || []),
        ...(destination?.assignee.destSelectorList?.flatMap(it => ({ userId: it.userId, userName: it.userId })) || [])
    ].filter(it => it)

    console.log(approvers);

    const assignedList = _.unionBy(approvers, it => it?.userId)

    console.log(assignedList);


    return <ModalForm<DelegationSaveParams, { data: string }  >
        title="Delegation"
        {...rest}
        onFinish={async (data) => {
            Modal.confirm({
                title: "Save task delegation",
                content: "Are you sure?",
                onOk: async () => {
                    try {
                        destination?.taskDefId && await workflowServices.save({
                            ...data,
                            taskDefId: destination?.taskDefId,
                            effectiveDate: moment(data.effectiveDate),
                            expiryDate: data.expiryDate ? moment(data.expiryDate) : undefined

                        })
                        onAdded()
                    } catch (error: any) {
                        message.error(error.message || "Failed to save data.")
                    }
                }
            })

        }}
    >
        <ProFormSelect
            name={"approver"}
            label="Approver"
            request={async () => [...(destination?.assignee.departmentHead ? [{ value: 'head.department', label: "Function Head" }] : []), ... await listUserByUserIds(assignedList?.filter(it => it)?.map(it => it?.userId || ''))]}
            rules={[{ required: true }]} />
        <ProFormSelect
            tooltip="Leave blank for auto approval"
            name={"delegateTo"} label="Delegate To"
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