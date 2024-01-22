import ActionFormWrapper from "@/pages/process-flow/components/forms/ActionFormWrapper";
import { simpleRequestActions } from "@/services/model"
import { ActionDataFormProps } from "@/pages/process-flow/data";
import { useEffect, useState } from "react";
import { createService } from "./services";
import { ProCard, ProForm, ProFormTextArea } from "@ant-design/pro-components";
import { Flex, Modal, message } from "antd";
import { useForm } from "antd/lib/form/Form";
import { IncidentServiceAPI } from "@/services/ict/services";
import { ItemType } from "./ItNewStaffRequestForm";
import RequestItems from "./RequestItems";

export default (props: ActionDataFormProps) => {

    const requestActions = simpleRequestActions()
    const [files, setFiles] = useState<string[]>([])
    const services = createService(requestActions)
    const itemItIcServices = IncidentServiceAPI(requestActions)
    const [form] = useForm<{ comment?: string }>()

    const [data, setData] = useState<{
        sharedDrives: ItemType[],
        systems: ItemType[],
        workflows: ItemType[],

    }>({
        sharedDrives: [],
        systems: [],
        workflows: [],
    })

    const onCompletedHandler = async () => {
        const dataForm = await form.validateFields()
        Modal.confirm({
            title: "Hiring function manager task",
            content: "Are you sure to submit?",
            onOk: async () => {
                if (!props.activityData?.taskId) {
                    message.error("Task cannot be found.")
                    return
                }
                try {
                    const itemList = [...data.sharedDrives, ...data.systems, ...data.workflows]
                    await services.actionReviewItemFunction({
                        actionName: props.action,
                        taskId: props.activityData.taskId,
                        comment: dataForm.comment,
                        fileIds: files,
                        payload: {
                            instanceId: props.procInstId || '',
                            items: itemList
                        }
                    })
                    props.actionHandlers?.onCancel?.(true)
                    message.success("Submitted successfully.")
                } catch (error: any) {
                    message.error(error.message || 'Failed to submit.')
                }
            }
        })
    }

    const init = async () => {
        // const rs = await itServices.listItemByCategories([5, 6, 7, 8, 1005])
        const itemList = (await itemItIcServices.listLookup([
            'ICT_FORM_SHARE_DRIVE',
            'ICT_FORM_SYSTEM_ACCESS',
            'ICT_FORM_WORKFLOW_ACCESS',
        ])).map((it) => ({
            itemId: it.id,
            itemName: it.name,
            qty: 0,
            checked: false,
            itemType: it.type,
            itemCategory: it.type,
        }))
        setData({

            sharedDrives: itemList.filter(it => it.itemType == 'ICT_FORM_SHARE_DRIVE'),
            systems: itemList.filter(it => it.itemType == 'ICT_FORM_SYSTEM_ACCESS'),
            workflows: itemList.filter(it => it.itemType == 'ICT_FORM_WORKFLOW_ACCESS'),

        })
    }

    useEffect(() => {
        init()
    }, [])
    return <ActionFormWrapper
        {...props}
        loading={requestActions.request?.loading || false}
        instanceData={props.ProcessInstanceData}
        actionHandlers={{
            onSetFiles(files) {
                setFiles(files.map(it => it.response))
            },
            onCancel() {
                props.actionHandlers?.onCancel?.()
            },

            onCompleted: onCompletedHandler,
        }}
        title="Hired Function Form">
        <Flex vertical gap={"small"}>
            <RequestItems data={data?.sharedDrives || []} title={"1. Shared Drive (Please √, completed by hired Function Manager)"} onItemsChange={(items: ItemType[]) => {
                setData(v => ({ ...v, sharedDrives: items }))
            }} />

            <RequestItems data={data?.systems || []} title={"2. Systems Access (Please √, completed by hired Function)"} onItemsChange={(items: ItemType[]) => {
                setData(v => ({ ...v, systems: items }))
            }} />


            <RequestItems data={data?.workflows || []} title={"3. Workflow Process, E-Form (Please √, completed by hired Function)"} onItemsChange={(items: ItemType[]) => {
                setData(v => ({ ...v, workflows: items }))
            }} />

            <ProCard size="small" bordered title="Remarks">
                <ProForm submitter={false} form={form}>
                    <ProFormTextArea name={'remarks'} />
                </ProForm>
            </ProCard>
        </Flex>

    </ActionFormWrapper>
}

