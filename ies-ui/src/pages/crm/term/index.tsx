import CrudWrapper from "@/components/DataCrud/CrudWrapper"
import { CrmPaths } from ".."
import { TermListView } from "./components/list"
import  TermDetail  from "./components/detail"
import { useEffect, useState } from "react"
import TermModalForm from "./components/TermModalForm"
import { simpleRequestActions } from "@/services/model"
import { MultiRequest } from "@/services/apiGateway"
import { LookupData } from "@/services/data"
import { ContractServices } from "../contract/services"
export default () => {
    const requestActions = simpleRequestActions()
    const [modalVisible, setModalVisible] = useState<{ type: 'ADD', id?: number , cb?: () => void } | {type: 'EDIT', id?: number, cb?:() => void  }>()
    const [forceRefresh, setForceRefresh] = useState<number>(0)
    const [lookupData, setLookupData] = useState<{
        contractTypes?: LookupData[];
      }>();
      useEffect(()=>{
        loadData()
      },[])
      const loadData= async ()=>{       
        const rs = await MultiRequest<{
          contractTypes: LookupData[];
        }>([
          ContractServices.listContractType().queryParams,
        ])(requestActions);  
        setLookupData(rs);
      }

    return<>
        <CrudWrapper baseURL={CrmPaths.terms}>
        {
            (view, id, navigate) => {
                switch (view) {
                    case 'list': return <TermListView contractTypes={lookupData?.contractTypes}  onDetail={r => navigate?.goToDetail?.({ id: r.id })} onAdd = {() => setModalVisible({type: 'ADD',cb:()=>{ setForceRefresh(v=> v+1);setModalVisible(undefined)}})} forceRefresh={forceRefresh}/>
                    case 'detail': return <TermDetail termId={id as number || 0}/>
                    default: throw new Error('Not supported')
                } 
            }
        }
        </CrudWrapper>
        {modalVisible?.type  && <TermModalForm onRefresh={modalVisible.cb} contractTypes={lookupData?.contractTypes}  open = {true} onOpenChange = {visible => !visible && setModalVisible(undefined)}/>}
    </>
}