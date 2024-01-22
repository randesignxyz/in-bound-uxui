import { LookupDataItem } from "@/services/data";
import { simpleRequestActions } from "@/services/model";
import { ModalForm, ModalFormProps, ProFormSelect, ProFormTextArea } from "@ant-design/pro-components"
import { message, Modal, Spin } from "antd";
import { useEffect, useState } from "react"
import { CustomerServices } from "../../services";
import { SaveSupplySourceParams, SupplySource } from "../../types"

export default ({ customerId, data, onRefresh, ...rest }: ModalFormProps<SaveSupplySourceParams> & { customerId: number, data?: SupplySource, onRefresh: () => void; }) => {

    const requestActions = simpleRequestActions();
    const [branList, setBrandList] = useState<LookupDataItem[]>([])

    useEffect(() => {
        if (!rest.open) return
        (async () => {
            const rs = await CustomerServices.listBrand.query(requestActions)
            setBrandList(rs)
        })()

    }, [rest.open])

    const getData = async (search?: string) => {
        const rs = await CustomerServices.listDistributors(search).query(requestActions)
        return rs.items.map(it => ({ label: [it.code, it.name].join('-'), value: it.id }))
    }

    const onSaveHandler = async (data: SaveSupplySourceParams) => {
        Modal.confirm({
            title: "Save supply source.",
            content: "Are you sure?",
            onOk: async () => {
                try {
                    await CustomerServices.saveSupplySource(data)(requestActions)
                    onRefresh()
                } catch (error: any) {
                    message.error(error.message || "Failed to save.")
                }
            }
        })
        
    }

    return <ModalForm {...rest}
        initialValues={data}
        onFinish={(dataForm) => onSaveHandler({
            ...dataForm,
            customerId: customerId,
            entityTypeId: 15001,
            id: data?.id,
        })}
    >
        <Spin spinning={requestActions.request?.loading}>
            <ProFormSelect rules={[{ required: true }]} width={'md'} label="Brand Name" name={'entityId'} options={branList.map(it => ({ value: it.id, label: it.name }))} />
            <ProFormSelect rules={[{ required: true }]} showSearch width={'md'} debounceTime={500} name={'distributorId'} label="Distributor" request={(params) => {
                return getData(params.keyWords)
            }} />
            <ProFormTextArea name={'remarks'} label="Remarks" />
        </Spin>
    </ModalForm>
}