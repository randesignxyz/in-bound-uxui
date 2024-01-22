import { formatDate, formatter, moneyFormatter, toReadable } from "@/pages/utils";
import { commitImportedData } from "@/services/apiGateway";
import { DataResponse } from "@/services/delivery/data";
import { simpleRequestActions } from "@/services/model";
import { Alert, Checkbox, Modal, ModalProps, Space, Table, Tooltip, Typography, message } from "antd"
import { useEffect, useState } from "react";
import { renderFieldInfoText } from "@/components/Component";
import { ImportedPriceRate } from "../../data.type";
import moment from "moment";
const { Text } = Typography;

export default ({ datasources, ...props }: ModalProps & {
    onClose?: () => void;
    datasources: DataResponse<ImportedPriceRate>
}) => {

    const [importedData, setImportedData] = useState<DataResponse<ImportedPriceRate>>()
    const [data, setData] = useState<ImportedPriceRate[]>();
    const requestActions = simpleRequestActions()
    const [submited, setSubmited] = useState(false)
    const [dataValidation, setDataValidation] = useState(0)

    useEffect(() => {
        if (!props.open) return
        init(datasources)
    }, [props.open])

    const init = (datasources: DataResponse<ImportedPriceRate>, committed: boolean =false) => {
        setImportedData(datasources)
        setData(datasources.items)

        const errorCount = datasources?.items?.filter(it => it.fieldInfoList.some(it1 => it1.isFailed))?.length || 0

        setDataValidation(errorCount)

        if(committed) {
            errorCount ==0 && setSubmited(true)
        }else {
            setSubmited(false)
        }
        
    }
    return <Modal title="Imported Data Review" width={1500}   {...props}
        okButtonProps={{
            disabled: submited,
            loading: requestActions.request?.loading
        }}
        onOk={() => {
            Modal.confirm({
                title: "Commit imported data.",
                content: "Are you sure?",
                onOk: async () => {
                    try {
                        const rs = await commitImportedData<ImportedPriceRate>("IMPORT_DELIVERY_PRICE_RATE", datasources.id)(requestActions)
                        init(rs, true)
                       
                        message.success("Data commited.")
                    } catch (error: any) {
                        setSubmited(false)
                        message.error(error.message)
                    }
                }
            })
        }}
    >


        {dataValidation > 0 && <Alert type='error' message={`${dataValidation} records is invalid to import.`} showIcon action={[
            <Checkbox onChange={e => {
                if (e.target.checked) {
                    setData(importedData?.items?.filter(it => it.fieldInfoList.some(it1 => it1.isFailed)))
                } else {
                    setData(importedData?.items)
                }
            }}>Reveal</Checkbox>
        ]} />}

        {submited && <Alert type='success' message="Data successfully submitted." />}

        <Table<ImportedPriceRate>

            columns={[
                {
                    title: 'Province',
                    render: (_, r) => renderFieldInfoText(r, "province", r.province)
                },
                {
                    title: 'District',
                    render: (_, r) => renderFieldInfoText(r, "district", r.district)
                },
                {
                    title: 'Supplier Name',
                    render: (_, r) => renderFieldInfoText(r, "supplierName", r.supplierName)
                },
                {
                    title: '250mL (48)',
                    width: 40,
                    render: (_, r) => renderFieldInfoText(r, "vt250ml", moneyFormatter(3).format(r.vt250ml))
                },
                {
                    title: '250mL (40)',
                    width: 40,
                    render: (_, r) => renderFieldInfoText(r, "vt250ml_40", moneyFormatter(3).format(r.vt250ml_40))
                },
                {
                    title: '350mL',
                    width: 40,
                    render: (_, r) => renderFieldInfoText(r, "vt350ml", moneyFormatter(3).format(r.vt350ml))
                },
                {
                    title: '500mL',
                    width: 40,
                    render: (_, r) => renderFieldInfoText(r, "vt500ml", moneyFormatter(3).format(r.vt500ml))
                },
                {
                    title: '1.5L (12)',
                    width: 40,
                    render: (_, r) => renderFieldInfoText(r, "vt1ml5_12", moneyFormatter(3).format(r.vt1ml5_12))
                },
                {
                    title: '1.5L (6)',
                    width: 40,
                    render: (_, r) => renderFieldInfoText(r, "vt1ml5_6", moneyFormatter(3).format(r.vt1ml5_6))
                },
                {
                    title: 'MC (24)',
                    width: 40,
                    render: (_, r) => renderFieldInfoText(r, "mc24", moneyFormatter(3).format(r.mc24))
                },
                {
                    title: 'Effective Date',
                    width: 120,
                    render: (_, r) => r.effectiveDate  && renderFieldInfoText(r, "effectiveDate", formatDate(moment(r.effectiveDate) ))
                },
                {
                    title: 'Expiry Date',
                    width: 120,
                    render: (_, r) => r.expiryDate  && renderFieldInfoText(r, "effectiveDate", formatDate(moment(r.expiryDate) ))
                },
                {
                    title: 'Action',
                    render: (_, r) => toReadable(r.action)
                },
                {
                    title: 'Errors', render: (_, r) =>
                        r.fieldInfoList?.some(it => it.isFailed) ?
                            <Text type="danger">{r.fieldInfoList?.filter(it => it.isFailed)?.map(it => `${it.fieldDisplay}: ${it.message}`).join(", ")}</Text> : ''
                },
            ]}

            dataSource={data}
        />

    </Modal>
}