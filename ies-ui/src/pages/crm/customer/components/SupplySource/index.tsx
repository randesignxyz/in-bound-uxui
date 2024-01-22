import { simpleRequestActions } from "@/services/model"
import { DeleteColumnOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons"
import { ProList } from "@ant-design/pro-components"
import { Button, message, Modal } from "antd"
import { useEffect, useState } from "react"
import { CustomerServices } from "../../services"
import { SupplySource } from "../../types"
import SupplySourceEntryModal from "./SupplySourceEntryModal"


export default ( {customerId}: {customerId: number}) => {
    const requestActions = simpleRequestActions();
    const [visisble, setVisible] = useState(false)
    const [dataList, setDataList] = useState<SupplySource[]>()

    useEffect(()=> {
        loadData()
    },[])

    const loadData = async() => {
        const rs = await CustomerServices.listSupplyByCustomer(customerId).query(requestActions)
        setDataList(rs)
    }

    const onDeletedHandler = (id: number) => {
        Modal.confirm({
            title: "Delete supply source",
            content: 'Are you sure?',
            onOk: async () => {
                try {
                    await CustomerServices.deleteSupplySource(id)(requestActions) 
                    loadData() 
                } catch (error: any) {
                    message.error(error.message || 'Failed to delete.')
                }
                
            }
        })
    }

    return <div>
        <ProList<SupplySource>   dataSource={dataList}
        showActions = 'hover'
        metas = {{
            title: {
                render: (_,r) => r.entity.name
            },
            subTitle: {
                render: (_,r ) => `Supplied by ${[r.distributor.code, r.distributor.name].join('-')}`
            },

            description: {
                dataIndex: 'remarks'
            },

            actions: {
                render: (_, r) => [<Button onClick={()=> onDeletedHandler(r.id)} size="small" danger icon = {<DeleteOutlined />} type = 'link'/>]
            }
            

        }} loading = {requestActions.request?.loading} />
        <Button
            size="small"
            style={{ width: '100%', marginBottom: 8 }}
            type="dashed"
            onClick={() => setVisible(true)}
            icon={<PlusOutlined />}
        />
        <SupplySourceEntryModal customerId={customerId} onRefresh={loadData} open = {visisble} onOpenChange = {visible => !visible && setVisible(false)}/>
    </div>
}