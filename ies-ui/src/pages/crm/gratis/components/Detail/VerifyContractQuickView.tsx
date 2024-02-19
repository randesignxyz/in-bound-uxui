import { DrawerForm, StepsForm } from "@ant-design/pro-components"
import { AdjustItem, GratisContract} from "../../types";
import { formatDate, toReadable } from "@/pages/utils";
import { useEffect, useState } from "react";
import { Space, Tag, message } from "antd";
import { GratisServices } from "../../services";
import useSafeState from "ahooks/lib/useSafeState";
import { simpleRequestActions } from "@/services/model";
import VerifyContractByMonthView from "./VerifyContractByMonthView";
import StepFormView from "./StepFormView";
import { UIBuilder } from "@/components/UIBuilder";
import { uniqueId } from "lodash";

interface Props{
    open?: boolean;
    id: number;
    groupTypeCode?: string;
    status?: string;
    currentNum: number;
    isVerify: boolean;
    onOpenModalChange:(v:boolean)=>void;
    reloadQuickView: (id: number,orderNo: number)=>void;
}
export default ({open,onOpenModalChange, reloadQuickView, id, groupTypeCode, status, currentNum, isVerify, ...rest }: Props) => {

    const requestActions = simpleRequestActions()
    const [data, setData] = useSafeState<GratisContract>()
    const [current, setCurrent] = useState(0);
    // const [forceReload,setForceReload] = useState(0)
    useEffect(() => {
        try {
          loadData()
          setCurrent(currentNum)
        } catch (error: any) {
          message.error(error.message || 'Failed to load data.');
        }
    }, [])    
    const loadData = async () => {
        const rs = await GratisServices.fectchGratisContract({id: id}).query(requestActions)
        
        setData({...rs,contracts: rs.contracts?.map(r=>{
            return {...r,uuid: uniqueId()}
        })})
    }
    const onChange = (value: number) => {        
        setCurrent(value);
    }
    const refreshQuickView=()=>{
        loadData()
        reloadQuickView(data?.id||0,current)
        // setForceReload(v=> v+1)
    }
    
    /**
     * Enable Button        : Process Status                && Status
     * ---------------------------------------------------------------
     * Verify               : Created || Processed_cycle    && Pending
     */
    // const steps = () => {
    //     const requestActions = simpleRequestActions()        
    //     return data?.contracts?.map(r =>{
    //         return (<StepFormView
    //                 data={r}
    //                 onClick={(data)=>{setCurrent(r.orderNo-1)}}
    //         > 
    //             <VerifyContractByMonthView isVerify={isVerify} gContract={data} verifyContract={r} onFinish={refreshQuickView}/>                
    //         </StepFormView>)
    //     })
    // }  
    const statusSetled = data?.achieved == 0 ? 'Failed':'Achieved'
    var statusText = (data?.months||0) >1? data?.achieved+'/'+data?.months+' | Achieved':toReadable(statusSetled)
    return ( <DrawerForm 
        open={open}
        onOpenChange={onOpenModalChange}
        submitter={false}
        title= {<Space>
            <div>{`Agreement Name: ${data?.contractNo} | ${data?.customer.code} ${data?.customer.name} `}</div>
            <span style={{border:0, color: (data?.achieved == 0 ? '#ff4d4f' : '#52c41a')}}>{statusText} {((data?.achieved||0)>0 && (data?.achieved||0)!= (data?.months||0)) && <span style={{color:'red'}}>*</span>}</span>
            </Space>}
            {...rest} 
            width={'80%'}
        >
        <StepsForm 
            onFinish={async(values) => {
            }}            
            current={current}  
            stepsProps={{
                direction: 'horizontal',
                type: 'navigation'
            }}           
            submitter={false}            
        >           
            {data?.contracts?.map(r =>{
                return(<StepFormView title={r.title}
                    data={r}
                    onClick={(data)=>{setCurrent(r.orderNo-1)}}
                >
                    <VerifyContractByMonthView isVerify={isVerify} id={id} groupTypeCode={groupTypeCode} verifyContract={r} onFinish={refreshQuickView}/>
                </StepFormView>)
            })}
        </StepsForm>
    </DrawerForm>)
}