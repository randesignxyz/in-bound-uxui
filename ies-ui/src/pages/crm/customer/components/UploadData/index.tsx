import { commitImportedData, execDataService } from "@/services/apiGateway";
import { simpleRequestActions } from "@/services/model";
import { ImportDataItem, ImportDataResponse } from "@/services/shared/data"
import { ProColumns, ProTable } from "@ant-design/pro-components"
import { Alert, Checkbox, Modal, ModalProps, Space, Tooltip, Typography, message } from "antd"
import { useEffect, useState } from "react";
const { Text } = Typography;


export default ({ data, ...rest }: ModalProps & { data?: ImportDataResponse }) => {

    const [dataValidation, setDataValidation] = useState(0)
    const [failedOnly, setFailedOnly] = useState(false)
    const [commited, setCommited] = useState(false)
    const requestActions = simpleRequestActions()

    const renderCol = (title: string, fixed?: boolean): ProColumns<ImportDataItem> => ({
        title: title,
        fixed: fixed,
        render: (_, r) => {
            const field = r.fieldInfoList.find(it => it.fieldDisplay == title)
            if (field?.isFailed) {
                return <Tooltip color="red" title={field.message}><Text type="danger" >{field?.fieldValue || 'N/A'}</Text></Tooltip>
            }

            return field?.fieldValue
        }
    })

    const displayFields = [
        "Customer Code", "Business Name", "Business Name (KH)", "Owner/Contact Name", "Owner/Contact Name (KH)",
        "Phone1", "Customer Type", "Status", "Account", "Mapping Coordinate", "Province", "District",
        "Outlet Type", "Division", "Salesperson Code"
    ]


    useEffect(() => {
        if (!rest.open) return
        setDataValidation(data?.items?.filter(it => it.fieldInfoList.some(i => i.isFailed))?.length || 0)
    }, [rest.open])

    return <Modal width={1500} {...rest}
        okText="Submit"
        onOk={() => {
            Modal.confirm({
                title: "Commit imported data.",
                content: "Are you sure?",
                onOk: async () => {
                    try {
                        ``
                        if (data) {
                            const rs = await commitImportedData<ImportDataItem>("INDIRECT_CUSTOMER", data.id)(requestActions)
                            setCommited(true)
                            message.success("Data commited.")
                        }

                    } catch (error: any) {
                        message.error(error.message)
                    }
                }
            })
        }}
        okButtonProps={{
            disabled: dataValidation > 0 || commited,
        }} >

        <Space direction='vertical' style={{ width: '100%' }}>
            {dataValidation > 0 && <Alert type='error' message={`${dataValidation} record${dataValidation > 1 ? 's' : ''} is invalid to import.`} showIcon action={[
                <Checkbox onChange={e => {
                    setFailedOnly(e.target.checked)
                }}>Reveal</Checkbox>
            ]} />}
        </Space>
        <ProTable<ImportDataItem>
            columns={[
                ...displayFields.map(it => renderCol(it, it == "Customer Code" || it == "Business Name")),
                {
                    title: 'Status',
                    render: (_, r) => {
                        const failed = r.fieldInfoList.some(it => it.isFailed)
                        return <Text type={failed ? "danger" : 'success'} >{ commited?"Commited":failed ? "Error" : r.action}</Text>
                    }
                },
                { title: 'Message', render: (_, r) => r.fieldInfoList.filter(it => it.isFailed).map(it => `${it.fieldDisplay}: ${it.fieldValue}`).join(", ") },
            ]}
            dataSource={data?.items?.filter(it => !failedOnly || it.fieldInfoList.some(i => i.isFailed))}
            search={false}
            options={false}
            scroll={{
                x: true
            }}

        />
    </Modal>
}