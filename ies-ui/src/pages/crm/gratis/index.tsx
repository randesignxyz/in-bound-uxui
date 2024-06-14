import CrudWrapper from "@/components/DataCrud/CrudWrapper"
import { useState } from "react"
import { CrmPaths } from ".."
import ContactDetailView from "./components/Detail"
import GratisContractCheckListView from "./components/List"
// import GratisContractModal from "./components/GratisContractModal"
import SettlementView from "./create"
import ItemDetail from "./request/item-detail"

export default () => {

    const [modalVisible, setModalVisible] = useState<{ type: 'ADD', id?: number , cb?: undefined} | {type: 'EDIT', id?: number, cb?:() => void  }>()
    const [forceUpdate, setForceUpdate] = useState<number>(0)
    const onEditHandler =  (id: number, cb?: () => void) => {
        setModalVisible({type: 'EDIT', id: id, cb: cb})
    }
    // const refresh = ()=> {
    //     setForceUpdate(v => v + 1)
    // }
    return (<>
        <CrudWrapper baseURL={CrmPaths.gratisSettlement}>
            {
                (view, id, navigate) => {
                    switch (view) {
                        case 'list': return <GratisContractCheckListView onDetail={r => navigate?.goToDetail?.({ id: r.id })} onAdd = {() => setModalVisible({type: 'ADD'})} forceReload= {forceUpdate}/>
                        case 'detail': return <ContactDetailView onEdit={onEditHandler} id={id as number || 0} />
                        case 'create' : return <SettlementView/>
                        // case 'view': return <ItemDetail  id={id as number || 0} />
                        default: throw new Error('Not supported')
                    }
                }
            }
        </CrudWrapper>
        {/* {modalVisible?.type  &&  <GratisContractModal onRefresh={refresh} contractId={ modalVisible.id} open = {true} onOpenModalChange = {visible => !visible && setModalVisible(undefined)}/>} */}
    </>
    )
}