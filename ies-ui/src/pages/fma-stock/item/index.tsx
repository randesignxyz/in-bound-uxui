import CrudWrapper from "@/components/DataCrud/CrudWrapper"
import { ProTable } from "@ant-design/pro-components"
import { Spin } from "antd"
import { InhouseStockPaths } from ".."
import ListView from "./ListView"
import ItemModalForm from "./components/ItemModalForm"
import { useState } from "react"
import DetailView from "./DetailView"
// import { InhouseStockServices } from "../services"

export default () => {
    const [modalVisible, setModalVisible] = useState<{ type: 'ADD', id?: number , cb?: () => void } | {type: 'EDIT', id?: number, cb?:() => void  }>()
    const [forceRefresh, setForceRefresh] = useState<number>(0)

    return <><CrudWrapper baseURL={InhouseStockPaths.request} >
    {(view, id , navigate) => {
        switch (view) {
            case 'list':
                return <ListView 
                    onAdd = {() => setModalVisible({type: 'ADD',cb:()=>{ setForceRefresh(v=> v+1);setModalVisible(undefined)}})} 
                    forceRefresh={forceRefresh} 
                    onEdit={id =>setModalVisible({type: 'EDIT',id:id,cb:()=>{ setForceRefresh(v=> v+1);setModalVisible(undefined)}})}
                />
            case 'detail':
                // return <DataEntryView onBack={()=> navigate?.gotToListHandler?.()} type="CREATE" id={id as number}/>
                return <DetailView itemId={id as number}/>
            case 'edit': 
                // return <DataEntryView onBack={()=> navigate?.gotToListHandler?.()} type = 'EDIT' id={id as number}/> 
                return <div>edit</div>
            default:
                throw Error('Not supported')
        }
    }}
    </CrudWrapper>
    {modalVisible?.type && <ItemModalForm type={modalVisible?.type} itemId={modalVisible?.id} onRefresh={modalVisible.cb} open = {true} onOpenChange = {(v:boolean) => !v && setModalVisible(undefined)}/>}
</>
}