import { execDataService0, fetchDataItemService, fetchDataListService } from "@/services/apiGateway"
import { simpleRequestActions } from "@/services/model"
import { ProcessDefInfo, ProcessInstanceDef } from "@/services/process-workflow/data"
import { ModalForm, ModalFormProps, ProForm, ProFormCheckbox, ProFormDatePicker, ProFormDigit, ProFormGroup, ProFormSelect, ProFormText, ProFormTextArea } from "@ant-design/pro-components"
import { message, Modal } from "antd"
import { useForm } from "antd/es/form/Form"
import { Moment } from "moment"
import { useEffect, useState } from "react"

type SaveProcessDefInfo = {
    id: string
    shortName?: string
    description?: string
    bizKeyFormat?: string
    increment?: number
    deptId?: number
    urlPath?: string,
    shownInEForms?: boolean;
    startFormInNewPage?: boolean,
    liveDate?: Moment,
    announcementDays?: number,
    accessRole?: string;
}

type Department = {
    id: number
    name: string
}

export default ({ item, ...rest }: ModalFormProps<SaveProcessDefInfo> & { item: ProcessInstanceDef }) => {
    const requestActions = simpleRequestActions()
    const [form] = useForm<SaveProcessDefInfo>()

    const [department, setDepartment] = useState<Department[]>()
    useEffect(() => {
        if (!rest.open) return

        (async () => {
            const deptList = await fetchDataListService<Department>({
                actionName: 'list-department',
                endpoint: 'WORK_FLOW',

            }).query(requestActions)

            setDepartment(deptList)

            const rs = await fetchDataItemService<ProcessDefInfo, { id: string }>({
                actionName: 'fetch-process-def-info',
                endpoint: 'WORK_FLOW',
                payload: { id: item.id }
            }).query(requestActions)
            form.setFieldsValue({
                id: item.id,
                shortName: rs.shortName,
                description: rs.description,
                deptId: rs.department?.id,
                urlPath: rs.urlPath,
                bizKeyFormat: rs.bizKeyFormat,
                increment: rs.increment,
                shownInEForms: rs.shownInEForms,
                startFormInNewPage: rs.startFormInNewPage,
                liveDate: rs.liveDate,
                announcementDays: rs.announcementDays,
                accessRole: rs.accessRole

            })
        })()
    }, [rest.open])

    return <ModalForm form={form} title="Process Info" {...rest} onFinish={async (dataForm) => {
        Modal.confirm({
            title: "Save process def info",
            content: "Are you sure?",
            onOk: async () => {
                try {
                    await execDataService0<SaveProcessDefInfo>({
                        actionName: 'save-process-def-info',
                        endpoint: 'WORK_FLOW',
                        payload: { ...dataForm, id: item.id }
                    })(requestActions)
                    rest.onOpenChange?.(false)
                } catch (error: any) {
                    message.error(error.message || 'Failed to save')
                }
            }
        })
    }}>
        <ProFormGroup>
            <ProFormSelect showSearch width={'md'} options={department?.map(it => ({ label: it.name, value: it.id }))} rules={[{ required: true }]} label="Department" name={"deptId"} />
            <ProFormText width={'md'} rules={[{ required: true }]} label="Short Name" name={"shortName"} />
        </ProFormGroup>
        <ProFormGroup>
            <ProFormText width={'md'} rules={[{ required: true }]} label="Business Key Format" name={"bizKeyFormat"} />
            <ProFormDigit width={'md'} readonly label="Increment" name={"increment"} />
        </ProFormGroup>
        <ProFormText rules={[{ required: true }]} name={'urlPath'} label="UI Route Path" />
        <ProFormText label="Access Roles" name={'accessRole'} />
        <ProFormGroup>
            <ProFormCheckbox label="Shown in E-Forms" name={'shownInEForms'} />
            <ProFormCheckbox label="Start Form In New Page" name={'startFormInNewPage'} />
        </ProFormGroup>
        <ProFormGroup>
            <ProFormDatePicker label="Go Live Data" name={'liveDate'} />
            <ProFormDigit label="Anouncement Days" name={"announcementDays"} />
        </ProFormGroup>
        <ProFormTextArea label="Descrption" name={"description"} />


    </ModalForm>
}