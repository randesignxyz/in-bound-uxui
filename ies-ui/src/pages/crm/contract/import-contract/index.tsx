import { toReadable } from "@/pages/utils";
import { commitImportedData } from "@/services/apiGateway";
import { simpleRequestActions } from "@/services/model";
import { Alert, Checkbox, Modal, ModalProps, Space, Table, Tooltip, Typography, message } from "antd"
import { useEffect, useState } from "react";
import { renderFieldInfoText } from "@/components/Component";
import { DataResponse } from "@/services/shared/data";
import { ImportedContract } from "../types";
const { Text } = Typography;

export default ({ data, ...props }: ModalProps & {
    onClose?: () => void;
    data: DataResponse<ImportedContract>
}) => {

    const [error, setError] = useState(false)
    const [items, setItems] = useState<ImportedContract[]>([])
    const requestActions = simpleRequestActions()
    const [completed, setCompleted] = useState(false)
    const [dataValidation, setDataValidation] = useState(0)

    useEffect(() => {
        setItems(data.items || [])
    }, [])
    return <Modal title="Imported Data Review" width={1500}   {...props}
        okButtonProps={{
            disabled: completed,
            loading: requestActions.request?.loading
        }}
        onOk={() => {
            Modal.confirm({
                title: "Commit imported contract.",
                content: "Are you sure?",
                onOk: async () => {
                    try {
                        const rs = await commitImportedData<ImportedContract>("CONTRACT", data.id)(requestActions)
                        setItems(rs.items || [])
                        setCompleted(true)
                        const errorCount = rs.items?.filter(it => it.fieldInfoList.some(it1 => it1.isFailed))?.length || 0
                        setDataValidation(errorCount)
                        message.success("Data commited.")
                    } catch (error: any) {
                        message.error(error.message)
                    }

                }
            })
        }}
    >
        <Space direction="vertical" style={{width: '100%'}}>

        
            {dataValidation>0 && <Alert type='error' message={`${dataValidation} records is invalid to import.`} showIcon action={[
                <Checkbox onChange={e => setError(e.target.checked)}>Reveal</Checkbox>
            ]} />}
            <Table<ImportedContract>

                columns={[
                    { title: 'Customer Id', render: (_, r) => renderFieldInfoText(r, 'customerCode', r.customerCode) },
                    { title: 'Agreement No', render: (_, r) => renderFieldInfoText(r, 'contractNo', r.contractNo) },
                    { title: 'Agreement Type', render: (_, r) => renderFieldInfoText(r, 'contractType', r.contractType) },
                    { title: 'Brand', render: (_, r) => renderFieldInfoText(r, 'brand', r.brand) },
                    { title: 'Budget Codes', render: (_, r) => renderFieldInfoText(r, 'budgetCode', r.budgetCode) },
                    { title: 'Start Date', width: 115, render: (_, r) => renderFieldInfoText(r, 'effectiveDate', r.effectiveDate) },
                    { title: 'End Date', width: 115, render: (_, r) => renderFieldInfoText(r, 'expiryDate', r.expiryDate) },
                    { title: 'Status', render: (_, r) => renderFieldInfoText(r, 'status', toReadable(r.status)) },
                    { title: 'Terms', render: (_, r) => renderFieldInfoText(r, 'terms', r.terms) },
                    { title: 'Remarks', dataIndex: 'remarks' },
                    { title: 'Action', render: (_, r) => toReadable(r.action) },
                    {
                        title: 'Errors', render: (_, r) =>
                            r.fieldInfoList?.some(it => it.isFailed) ?
                                <Text type="danger">{r.fieldInfoList?.filter(it => it.isFailed)?.map(it => `${it.fieldDisplay}: ${it.message}`).join(", ")}</Text> : ''
                    },

                ]}

                dataSource={items.filter(it => !error || it.fieldInfoList.some(i => i.isFailed))}
            />
        </Space>
    </Modal>
}