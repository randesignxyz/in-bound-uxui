import { ActionDataFormProps } from "@/pages/process-flow/data";
import { simpleRequestActions } from "@/services/model";
import { Checkbox, Modal, Space, UploadFile, message } from "antd";
import ActionFormWrapper from "@/pages/process-flow/components/forms/ActionFormWrapper";
import { useForm } from "antd/lib/form/Form";
import { useEffect, useRef, useState } from "react";
import { createService } from "./services";
import { RequestedItem, StaffProposalDetail, StaffProposalFormNames } from "./data.types";
import { EditableFormInstance, EditableProTable, ProCard, ProForm, ProFormTextArea } from "@ant-design/pro-components";
import { EmployeeServices } from "../services";
import { RequestItem } from "../data";
import _ from "lodash";

export default (props: ActionDataFormProps) => {

    const [files, setFiles] = useState<UploadFile[]>([])
    const [form] = useForm<{
        basicSalary: number;
        remarks?: string;

    }>()
    const requestActions = simpleRequestActions()
    const services = createService(requestActions)
    const [data, setData] = useState<StaffProposalDetail>()
    const [requestItems, setRequestItems] = useState<RequestItem[]>([])
    const [benefits, setBenefits] = useState<RequestedItem[]>([])
    const [itemTaken, setItemTaken] = useState<number[]>([])
    const editableFormRef = useRef<EditableFormInstance>();

    useEffect(() => {

        if (!props.visible) return
        (async () => {
            if (props.activityData?.procInstId) {
                try {
                    const rs = await services.findByInstId(props.activityData.procInstId)
                    setData(rs)
                    const items = await EmployeeServices.fetchRequestItemByCategories([1]).query(requestActions)
                    setRequestItems(items)
                    const selector = rs.segment.id === 2004 ? "CASUAL_STAFF" : 'NORMAL_STAFF'
                    setBenefits(items.filter(it => it.selector?.includes(selector)).map(it => {
                        const saveItem = rs.items.find(i => i.itemId === it.id)
                        return {
                            itemId: it.id,
                            itemName: it.itemName,
                            checked: saveItem?.checked || false,
                            amount: saveItem?.amount,
                            optionGroup: it.optionGroup,
                            selector: it.selector,
                            remarks: saveItem?.remarks,
                            itemType: 'Benefit'
                        }
                    }))

                    setItemTaken(rs.items.filter(it => it.checked).map(it => it.itemId))
                } catch (error: any) {
                    message.error(error.message || 'Failed to load data.')
                }

            }
        })()
    }, [props.visible, props.ProcessInstanceData])

    return <ActionFormWrapper
        {...props}
        // uploadProps={props.activityData?.formKey == 'staff_proposal_hrbp'?{
        //     required: true,
        //     message: "Please attach the required documents(CV, Interview feedback and reference docs)"
        // }: undefined  }
        loading={requestActions.request?.loading || false}
        instanceData={props.ProcessInstanceData}
        title={props.activityData?.activity}
        actionHandlers={{
            ...props.actionHandlers,
            onCompleted: async () => {
                const formData = await form.validateFields()

                if (!benefits.some(it => it.checked)) {
                    message.error("Benefits is required to fill.")
                    return
                }

                const groups = _.groupBy(benefits.filter(it => it.checked), 'optionGroup')
                for (var key in groups) {
                    const options = groups[key]
                    if (key.toLocaleLowerCase() !== 'null' && !!key && options.length > 1) {
                        message.error(`Please select one of ${options.map(it => it.itemName).join(", ")}`)
                        return
                    }
                }

                Modal.confirm({
                    title: "HR Review",
                    content: "Are you sure?",
                    onOk: async () => {

                        if (!props.activityData?.taskId || !data?.id) {
                            message.error("Task cannot be found.")
                            return
                        }
                        try {
                            await services.actionHR({
                                actionName: props.action,
                                taskId: props.activityData.taskId,
                                comment: formData.remarks,
                                fileIds: files.map(it => it.response),
                                payload: {
                                    id: data.id,
                                    items: benefits
                                }
                            })
                            message.success("Submitted successfully.")
                            props.actionHandlers?.onCancel?.(true)

                        } catch (error: any) {
                            message.error(error.message || 'Failed to post.')
                        }
                    }
                })
            },
            onSetFiles: setFiles,
            onReset: () => form.resetFields()
        }}
    >
        <ProForm form={form} submitter={false}>
            <Space direction="vertical" style={{ width: '100%' }}>

                <ProCard size="small" title="Benefit">
                    <EditableProTable<RequestedItem>
                        recordCreatorProps={false}
                        editableFormRef={editableFormRef}
                        rowKey={'itemId'}
                        size="small"
                        showHeader={false}
                        value={benefits}
                        onValuesChange={(values => {
                            const newData = values.map(it => ({ ...it, amount: it.amount || 0, checked: itemTaken.some(i => i === it.itemId) }))
                            const groups = _.groupBy(newData.filter(it => it.checked), 'optionGroup')
                            for (var key in groups) {
                                const options = groups[key]
                                if (key.toLocaleLowerCase() !== 'null' && !!key && options.length > 1) {
                                    message.error(`Please select one of ${options.map(it => it.itemName).join(", ")}`)
                                    break
                                }
                            }
                            setBenefits(newData)

                        })}
                        columns={[
                            {
                                dataIndex: 'checked', width: 30, renderFormItem(_, config, form, ) {
                                    return <Checkbox
                                    disabled={!config.record?.selector?.toUpperCase()?.includes(props.formKey.toUpperCase())}
                                    defaultChecked={
                                        itemTaken.some(it => it === config.record?.itemId) || false
                                    } key={`checked-${config.record?.itemId}`}
                                        onChange={e => {
                                            if (e.target.checked && !itemTaken.some(it => it === config.record?.itemId)) {
                                                setItemTaken(v => [...v, config.record?.itemId || 0])
                                            }
                                            if (!e.target.checked) {
                                                setItemTaken(v => v.filter(it => it !== config.record?.itemId))
                                            }

                                            form.setFieldValue(config.record?.itemId || '', { ...config.record, checked: e.target.checked })

                                        }} />
                                },
                            },
                            { dataIndex: 'itemName', width: 300, readonly: true },
                            {
                                dataIndex: 'amount', width: 140, valueType: 'money', formItemProps(form, config) {
                                    const item = form.getFieldValue(config.rowKey || '')

                                    const checkOnly = requestItems.some(it => it.id === (item.itemId || config.entity.itemId) && it.selector?.includes("CHECK_ONLY"))

                                    return { ...config, hidden: (!item?.checked || checkOnly), rules: [{ required: item?.checked && !checkOnly, message: "Amount required" }] }
                                }, fieldProps: { rows: 1, placeholder: 'Amount (USD)', style: { width: 120 } }
                            },
                            {
                                dataIndex: 'remarks', valueType: 'textarea', formItemProps(form, config) {
                                    const item = form.getFieldValue(config.rowKey || '')
                                    return { ...config, hidden: !item?.checked }
                                }, fieldProps: { rows: 1, placeholder: 'Remarks' }
                            },

                        ]}
                        editable={{
                            editableKeys: benefits.map(it => it.itemId),
                            type: 'multiple',

                        }}
                    />
                </ProCard>
                <ProFormTextArea rules={[{ required: true }]} label="Comment" name={"remarks"} />
            </Space>
        </ProForm>
    </ActionFormWrapper>


}
