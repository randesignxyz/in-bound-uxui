import CrudWrapper from "@/components/DataCrud/CrudWrapper"
import { CrmPaths } from ".."
import { TermListView } from "./components/list"
import  TermDetail  from "./components/detail"
import { useState } from "react"
import TermModalForm from "./components/TermModalForm"
export default () => {
    const [modalVisible, setModalVisible] = useState<{ type: 'ADD', id?: number , cb?: () => void } | {type: 'EDIT', id?: number, cb?:() => void  }>()
    const [forceRefresh, setForceRefresh] = useState<number>(0)
    return<>
        <CrudWrapper baseURL={CrmPaths.terms}>
        {
            (view, id, navigate) => {
                switch (view) {
                    case 'list': return <TermListView  data={{}} onDetail={r => navigate?.goToDetail?.({ id: r.id })} onAdd = {() => setModalVisible({type: 'ADD',cb:()=>{ setForceRefresh(v=> v+1);setModalVisible(undefined)}})} forceRefresh={forceRefresh}/>
                    case 'detail': return <TermDetail termId={id as number || 0}/>
                    default: throw new Error('Not supported')
                } 
            }
        }
        </CrudWrapper>
        {modalVisible?.type  && <TermModalForm onRefresh={modalVisible.cb}  open = {true} onOpenChange = {visible => !visible && setModalVisible(undefined)}/>}
    </>
}