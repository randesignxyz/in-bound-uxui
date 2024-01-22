import { simpleRequestActions } from "@/services/model"
import { RequisitionItemDetailResponse, RequisitionServiceItemDetailResponse } from "@/services/pro/data"
import { ItemServiceAPI, RequisitionServiceAPI } from "@/services/pro/services"
import { CheckCard, DrawerForm, EditableProTable, ProCard, ProFormSelect } from "@ant-design/pro-components"
import { useForm } from "antd/lib/form/Form"
import { useState } from "react"

type FormDataType = {
    requisitionID: number;
    itemId: number;
}

export default ({ trigger }: { trigger?: JSX.Element }) => {

    const requestActions = simpleRequestActions()
    const [searchBy, setSearchBy] = useState("PR")
    const srv = RequisitionServiceAPI(requestActions)
    const itemSrv = ItemServiceAPI(requestActions)
    const [form] = useForm<FormDataType>() 
    const [data, setData] = useState<{
        type: 'ITEM' | 'SERVICE',
        items: RequisitionItemDetailResponse[]
        services: RequisitionServiceItemDetailResponse[]
    }>()

    const onSearchPR = async ({ keywords }: { keywords?: string }) => {
        const rs = await srv.list({
            criteria: {
                searchValue: keywords,
                advanceSearch: {
                    integratedStatus: "POSTED",
                    status: "APPROVED"
                }  
            },
            
        })
        const dataItems = rs.items.map(it => ({ label: [it.formNo, it.sapDocNo, it.requestedBy].join("/ "), value: it.id }))
        return dataItems

    }

    const onSearchItem = async ({ keywords }: { keywords?: string }) => {
        const rs = await itemSrv.list({
            criteria: {
                searchValue: keywords,
                advanceSearch: {
                  itemType: 'PRODUCT'
                }
                
            },
            
        })
        const dataItems = rs.items.map(it => ({ label: [it.itemCode, it.itemName].join("/ "), value: it.id }))
        return dataItems

    }

    // RequisitionServiceAPI
    return <DrawerForm form={form} layout="horizontal" title="Copy from Purchase Requisition" width={1000} trigger={trigger}>

        <CheckCard.Group onChange={v => setSearchBy(v?.toString() || 'PR')} defaultValue="PR" size="small">
            <CheckCard size="small" title="Purcase Requisition" value="PR" />
            <CheckCard size="small" title="Product Item" value="ITEM" />
        </CheckCard.Group>

        {searchBy == 'PR' && <ProFormSelect
            placeholder={"PR No, Request No, Requestor"}
            name={"requisitionID"} width={'xl'} showSearch allowClear request={onSearchPR}
        />}
        {searchBy == 'ITEM' && <ProFormSelect
            placeholder={"Item code , Item Name"}
            name={"itemId"} width={'xl'}
            request = {onSearchItem}
            showSearch allowClear
        />}

        <EditableProTable
            recordCreatorProps={false}
            columns={[
                { title: "No" },
                { title: "Item Code" },
                { title: "Item Name" },
                { title: "Item Descriptin" },
                { title: "Req. Qty" },
                { title: "Issued Qty" },
            ]}
        />

    </DrawerForm>
}