import ProcessFlowModel from "@/models/ProcessFlowModel";
import pro from "@/pages/pro";
import ViewFormWrapper from "@/pages/process-flow/components/forms/ViewFormWrapper";
import { DataViewProps } from "@/pages/process-flow/data"
import { simpleRequestActions } from "@/services/model";
import { ProcessInstanceData } from "@/services/process-workflow/data";
import { Card, message, Spin } from "antd";
import { useEffect, useRef, useState } from "react";
import { RegisterCustomerServiceAPI } from "../services";
import { AddresssView, PurchasingPerformanceItem, RegisterCustomerDetailResponse } from "../data";
import { EditableFormInstance } from "@ant-design/pro-components";
import { uniqueId } from "lodash";
import ViewData from "../components/ViewData";


export default (props: DataViewProps) => {
    const workflowModel = ProcessFlowModel();
    const requestActions = simpleRequestActions();
    const services = RegisterCustomerServiceAPI(requestActions)
    
    // const [addressList, setAddressList] = useState<AddresssView[]>()
    // const [shippingAddressList, setShippingAddressList] = useState<AddresssView[]>()
    // const editablePPItemFormRef = useRef<EditableFormInstance>();
    // const [ppItems, setPPItems] = useState<PurchasingPerformanceItem[]>([])
    const [ rCustomer, setRCustomert] = useState<RegisterCustomerDetailResponse>()
    
    useEffect(() => {
        loadData();
    }, [workflowModel.state.instanceData]);
    
    const loadData = async () => {
        const instId = workflowModel.state?.instanceData?.processInstance?.procInstId;
        // message.error(instId)
        if (!instId) return;
        try {
            const data = await services.detailByProcessFlow(instId);
            setRCustomert(data)
            // setPPItems(data?.ppItems?.map((it) => ({...it,key: uniqueId().toString(),itemId: it?.itemId?.toString()}))||[])
            // setAddressList(data?.billing?.map(it=>({...it,key: uniqueId().toString()})))
            // setShippingAddressList(data?.shipping?.map(it=>({...it,key: uniqueId().toString()})))
            // setAttachedFiles(data?.attachedFiles?.map(it => ({ fileId: it, activity: 'Start' })) || [])
        } catch (error: any) {
            message.error(error.message || 'Failed to load requisition.');
        }
    };
     
    return(<ViewFormWrapper<{ id: number }> 
            workflowModel={workflowModel}
            workflowProp={props} 
            attachedFiles={rCustomer?.attachedFiles?.map(it => ({ fileId: it, activity: 'Start' }))}
        >
         {(_) => {
        return (<Spin spinning={requestActions.request?.loading}>
          {/* <Card title='Register Customer' size='small' style={{ marginTop: 10 }}> */}
            <ViewData data={rCustomer} />
          {/* </Card> */}
          {/* <Flow
            open={!!openFlow}
            onOpenChange={(visible) => !visible && setOpenFlow(undefined)}
            type={'PR'}
            fromId={openFlow || 0}
          /> */}
        </Spin>)
      }}
            
        </ViewFormWrapper>
    )
}