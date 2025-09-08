import { ProCard } from "@ant-design/pro-components"
import { Button } from "antd"
import { Df360EmpServiceAPI } from "../services"
import { useEffect, useState } from "react"
import { DfInstrunctionItemList } from "../data"

interface Props{
  lang?:string
  onChangeLanglauge:()=>void
  getLableName:(key:string)=>any
}
export default({lang,onChangeLanglauge,getLableName}:Props)=>{

    const [instructionList, setInstructionList] = useState<DfInstrunctionItemList[]>();   
    const services = Df360EmpServiceAPI();
    useEffect(()=>{
       services.fetchDfInstructionList().then(rs=>setInstructionList(rs))
    },[])

    return (<> <ProCard title={getLableName('TITLE_INSTRACTION')}
        collapsible  
        size="small"
        bordered headerBordered 
        extra = {<Button shape="round" onClick={onChangeLanglauge}>{lang=='KH'?'English':'ភាសាខ្មែរ'}</Button>}
    >  
      {instructionList?.map(r=> 
        (<div>{lang=='KH' ?r.description1: r.description}</div>)
      )}
    </ProCard></>)

}