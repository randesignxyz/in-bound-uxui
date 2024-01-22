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
        setData(rs)
    }
    const onChange = (value: number) => {        
        setCurrent(value);
    }
    const refreshQuickView=()=>{
        // loadData()
        reloadQuickView(data?.id||0,current)
    }
    
    /**
     * Enable Button        : Process Status                && Status
     * ---------------------------------------------------------------
     * Verify               : Created || Processed_cycle    && Pending
     */
    const steps = () => {
        const requestActions = simpleRequestActions()        
        return data?.contracts?.map(r =>{
            return (<StepFormView
                    data={r}
                    onClick={(data)=>{setCurrent(r.orderNo-1)}}
            > 
                <VerifyContractByMonthView isVerify={isVerify} gContract={data} verifyContract={r} onFinish={refreshQuickView}/>                
            </StepFormView>)
        })
    }  
    const statusSetled = data?.achieved == 0 ? 'Failed':'Achieved'
    var statusText = (data?.months||0) >1? data?.achieved+'/'+data?.months+' | Achieved':toReadable(statusSetled)
    return ( <DrawerForm 
        open={open}
        onOpenChange={onOpenModalChange}
        submitter={false}
        // (${formatDate(data?.effectiveDate)} ~ ${formatDate(data?.expiryDate)})
        title= {<Space>
            <div>{`Agreement Name: ${data?.contractNo} | ${data?.customer.code} ${data?.customer.name} `}</div>
            <Tag color={data?.achieved==0?'red':'green'}>{statusText} {((data?.achieved||0)>0 && (data?.achieved||0)!= (data?.months||0)) && <span style={{color:'red'}}>*</span>}</Tag>
            </Space>}
            {...rest} 
            width={'80%'}
        >
        <StepsForm 
            onFinish={async(values) => {
            }}            
            current={current}  
            // onCurrentChange = {onChange}
            stepsProps={{
                direction: 'horizontal',
                type: 'navigation',
                // current: current,
            }}           
            submitter={false}            
        >
            {/* {steps()} */}
            { data?.contracts?.map(r =>{
                return(<StepFormView title={r.title} 
                data={r}
                    onClick={(data)=>{setCurrent(r.orderNo-1)}}
                >
                    <VerifyContractByMonthView isVerify={isVerify} gContract={data} groupTypeCode={groupTypeCode} verifyContract={r} onFinish={refreshQuickView}/>
                </StepFormView>)
            })}
        </StepsForm>
    </DrawerForm>)
}