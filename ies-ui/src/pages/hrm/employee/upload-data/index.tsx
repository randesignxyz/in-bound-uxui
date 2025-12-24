import { toReadable } from "@/pages/utils";
import { commitImportedData, execDataService } from "@/services/apiGateway";
import { simpleRequestActions } from "@/services/model";
import { DataResponse, ImportDataItem, ImportDataResponse } from "@/services/shared/data"
import { ProColumns, ProTable } from "@ant-design/pro-components"
import { Alert, Checkbox, Modal, ModalProps, Space, Tooltip, Typography, message } from "antd"
import { uniqueId } from "lodash";
import { useEffect, useState } from "react";
const { Text } = Typography;

export default ({ datasources,onFinish, ...rest }: ModalProps & { datasources?: DataResponse<ImportDataItem>,onFinish:()=>void }) => {

    const [dataValidation, setDataValidation] = useState(0)
    const [importedData, setImportedData] = useState<DataResponse<ImportDataItem>>()
    const [data, setData] = useState<ImportDataItem[]>();
    // const [failedOnly, setFailedOnly] = useState(false)
    const [commited, setCommited] = useState(false)
    const [submited, setSubmited] = useState(false)
    const requestActions = simpleRequestActions()
    const init = (items?: ImportDataItem[], submited?: boolean) => {
        setSubmited(submited || false)
        const itemList = items || datasources?.items
        if (items && datasources?.id) {
            setImportedData({ id: datasources.id, items: itemList })
        } else {
         setImportedData(datasources)
        }
        setData(itemList?.map(it => ({ ...it, key: uniqueId() })) || []);
        setDataValidation(itemList?.filter(it => it.fieldInfoList.some(it1 => it1.isFailed))?.length || 0)
        setCommited(false)
    }
    useEffect(() => {
        if (!rest.open) return
        init()
      }, [rest.open]);

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
    const displayFields = [ "Employee ID","Training Course","Venue/Institution","From Date","To Date","Duration (Hours)"]

    return <Modal width={1500} {...rest}
        okText="Submit"
        cancelText = {'Close'}
        maskClosable= {false}
        onOk={() => {
            if (submited) {
                message.warning("Imported data is commited.")
                return
            }
            if (dataValidation > 0) {
                message.error("Please resolve all remaining issues")
                return
            }
            Modal.confirm({
                title: "Commit imported data.",
                content: "Are you sure?",
                onOk: async () => {
                    try {
                        ``
                        if (datasources) {
                            const rs = await commitImportedData<ImportDataItem>("ESS_IMPORT_TRAINING_LIST", datasources.id)(requestActions)
                            setCommited(true)
                            message.success("Data commited.")
                            init(rs.items, true)
                            onFinish()
                        }

                    } catch (error: any) {
                        setCommited(false)
                        message.error(error.message)
                    }
                }
            })
        }}
        okButtonProps={{
            disabled: dataValidation > 0 || commited || submited,
        }}>

        <Space direction='vertical' style={{ width: '100%' }}>
            {dataValidation > 0 && <Alert type='error' message={`${dataValidation} record${dataValidation > 1 ? 's' : ''} is invalid to import.`} showIcon action={[
                <Checkbox onChange={e => {
                    if (e.target.checked) {
                        setData(importedData?.items?.filter(it => it.fieldInfoList.some(it1 => it1.isFailed)))
                      } else {
                        setData(importedData?.items)
                      }
                }}>Reveal</Checkbox>
            ]} />}
        </Space>
        {data&&<ProTable<ImportDataItem>
            columns={[
                ...displayFields.map(it => renderCol(it, it == "Agreement No" || it == "Agreement Type")),
                {
                    title: 'Status',
                    render: (_, r) => {
                        const failed = r.fieldInfoList.some(it => it.isFailed)
                        return <Text type={failed ? "danger" : 'success'} >{ commited?"Commited":failed ? "Error" : r.action}</Text>

                    }
                },
                { title: 'Message', render: (_, r) => r.fieldInfoList.filter(it => it.isFailed).map(it => `${it.fieldDisplay}: ${it.message}`).join(", ") },
            ]}
            dataSource={data}
            search={false}
            options={false}
            scroll={{
                x: true
            }}
        />}
    </Modal>
}
