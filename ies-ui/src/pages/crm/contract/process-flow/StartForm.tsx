import { Card, Form, message, Modal } from "antd";
import { UploadFile } from "antd/lib/upload/interface";
import { useEffect, useState } from "react";
import { CustomerContractForm } from ".";
import { ActionDataFormProps } from "@/pages/process-flow/data";
import { ContractData } from "@/services/crm/contract";
import { Model } from "../model";
import StartFromWrapper from "@/pages/process-flow/components/forms/StartFromWrapper";
import ContractEntryWrapper from "../components/ContractEntryWrapper";
import ProcessFlowModel from "@/models/ProcessFlowModel";

const StartForm: React.FC<ActionDataFormProps> = (props) => {
    const workflowModel = ProcessFlowModel()
    const { state, actions } = Model(workflowModel)
    const { uploadFiles, payload } = props
    const [form] = Form.useForm<ContractData>()
    const [files, setFiles] = useState<UploadFile[]>([])

    useEffect(() => {
        if (!props.visible) return

        try {
            actions.loadInitData(payload?.id)
            workflowModel.actions.setRequestor()

        } catch (error: any) {
            message.error(error.message ||"Failed t load init data.")
        }
        

    }, [props.visible])

    const onSubmitHandler = async (draft: boolean) => {

        try {
            const dataForm = await form.validateFields()
            const { ...values } = dataForm
            Modal.confirm({
                title: draft ? 'Save Contract Draft' : 'Contract Request Process',
                content: 'Are you sure?',
                onOk: async () => {
                    if (!payload?.id) return
                    const rs = await actions.createContract({
                        ...values,
                        expiryDate: values.expiryDate.endOf('M'),
                        customerId: payload?.id,
                        attachmentFileIds: files.map(it => it.response),
                        // workflowData: draft && {
                        //     buId: 1,
                        //     formKey: props.formKey,
                        //     requestorId: workflowModel.state.requestor?.id || '',
                        //     processDef: CustomerContractForm.processDefKey,
                        // }
                    })
                    if (rs) {
                        message.success(draft ? `Successfully created.` : `Customer contract request process (${rs.requestNo}) summited sucessfully`)
                        props.actionHandlers?.onCancel?.(true)
                    }

                }
            })
        } catch (error: any) {
            message.error(error.message ||"Invalid data.")
        }
    }

    return (
        <StartFromWrapper
            visible={props.visible && !!state.initialData}
            loading={state.loading || props.loading}
            requestor={workflowModel.state.requestor}
            draft
            actionHandlers={{
                onSetFiles: workflowModel.actions.onSetFiles,
                onReset: () => {
                    form.resetFields()
                    workflowModel.actions.setRequestor()
                    actions.applyLayoutConfig('EXCLUSIVE')
                    actions.listSubContract(2531)
                },
                onCancel: props.actionHandlers?.onCancel,
                onSetRequestor: workflowModel.actions.setRequestor,
                onSaveDraft: () => onSubmitHandler(true),
                onOk: () => onSubmitHandler(false)

            }}
            uploadFiles={uploadFiles}>
            <Card>
                <ContractEntryWrapper
                    form={form}
                    layoutConfig={state.layoutConfig}

                    initData={{
                        itemList: state.initialData?.itemList,
                        customer: state.initialData?.customer,
                        lookupDataList: state.initialData?.lookupDataList,
                        productList: state.initialData?.productList,
                        shippingChannelList: state.initialData?.shippingChannelList,
                        subContractTypeList: state.initialData?.subContractTypeList,
                        incentiveSchemeList: state.initialData?.incentiveSchemeList
                    }}
                    applyLayoutConfig={actions.applyLayoutConfig}
                    listSubContract={actions.listSubContract}
                    uploadFiles={files}
                    actionHandlers={{
                        onSetFiles: setFiles
                    }}
                />
            </Card>

        </StartFromWrapper>
    )
}

export default StartForm