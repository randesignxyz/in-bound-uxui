import { ProCard } from "@ant-design/pro-components"
import { Button, Grid } from "antd"
import { Df360EmpServiceAPI } from "../services"
import { useEffect, useState } from "react"
import { DfInstrunctionItemList } from "../data"
import { FileExcelOutlined, FilePdfOutlined } from "@ant-design/icons"

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
    const screens = Grid.useBreakpoint();
    const isMobile = !screens.md;

    return (<> <ProCard title={getLableName('TITLE_INSTRACTION')}
        collapsible  
        size="small"
        bordered headerBordered 
        extra = {<div style={{width: isMobile?'85px':'auto'}}> 
          {/* <Button type="link" onClick={onChangeLanglauge} icon={<FileExcelOutlined/>}>Export</Button> */}
          <Button shape="round" onClick={onChangeLanglauge}>{lang=='KH'?'English':'ភាសាខ្មែរ'}</Button>
        </div>}
    >  
      {instructionList?.map(r=> 
        (<div>{lang=='KH' ?r.description1: r.description}</div>)
      )}
    </ProCard></>)

}