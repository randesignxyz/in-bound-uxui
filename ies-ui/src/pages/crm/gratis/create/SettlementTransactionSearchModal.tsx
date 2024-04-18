import { ActionType, ModalForm, ModalFormProps, ProCard, ProColumns, ProFormGroup, ProFormSelect, ProFormText, ProFormTextArea, ProTable } from "@ant-design/pro-components";
import { Space, Tooltip } from "antd";
import { GratisServices } from "../services";
import { useEffect, useRef, useState } from "react";
import { SettlementSearchDate } from "../types";
import { simpleRequestActions } from "@/services/model";
import { ContractLess } from "@/services/crm/contract";
import { LookupData } from "@/services/data";
import { useForm } from "antd/es/form/Form";
import { MessageOutlined } from "@ant-design/icons";

interface Props extends ModalFormProps<{label:string, remarks: string}>{
    key?: string;
    required?: boolean
    onSave: (selected: ContractLess[]) => void;
    loading?:boolean;
    params: SettlementSearchDate;
    dataFilter?: ContractLess[];
    gratisTarget?: LookupData[],
    skuSettled?: LookupData[],
    gratisIncentive?: LookupData[]
}
interface SearchCriteria {   
    searchValue?:string;
    target?: number[];
    incentiveRate?:number[];
    skuSettled?:string[];
    label:string;
    remarks:string;

}

const cols: ProColumns<ContractLess>[] = [{
    title:'Agreement Name',
    width: 150,
    dataIndex:'contractNo',
    render: (_, r) => r?.contractNo
},{
    title:'Contract Type',
    render: (_, r) => `${r.contractType}`
},{
    title:'Customer Code',
    render: (_, r) => `${r.customer?.code}`
},{
    title:'Customer Namne',
    render: (_, r) => <div>
        <span>{r.customer?.name}</span>
        <div style={{padding:2,fontSize:13,color:'#b49900',borderRadius:5}}>{r?.address}</div>
    </div>
},{
    title:'Budget Code',
    dataIndex:'budgetCode'
},{
    title:'Brand',
    dataIndex:'brand'
},/*,{
    title: 'Duration Date',
    hideInSearch: true,
    render: (_, record) => `${moment(record.effectiveDate).format('YYYY-MM-DD')} - ${moment(record.expiryDate).format('YYYY-MM-DD')}` 
}*/{
    title:'Term',
    render:(_,r)=> !r?.terms?'No Term':r?.terms
}

]

export default ( { key,required, onSave,loading, params, dataFilter, gratisTarget, skuSettled, gratisIncentive, ...rest} : Props) => {
    const requestActions = simpleRequestActions()
    const [selected, setSelected] = useState<ContractLess[]>()
    const actionRef = useRef<ActionType>();
    const [form] = useForm<SearchCriteria>()  
    const [data, setData] = useState<ContractLess[]>()
    const [criteria,setCriteria] = useState<SearchCriteria>({label:'',remarks:''})
    useEffect(()=>{
        actionRef.current?.reload()
    },[dataFilter])
    const loadDate =()=>{

    }
    // const directHidden = params.contractTypeGroupCode=='DIRECT'?true:false
    const inDirectHidden = params.contractTypeGroupCode=='IN_DIRECT'?true:false
    const otherHidden = params.contractTypeGroupCode=='OTHER'?true:false

    return <ModalForm {...rest} width={'90%'}           
        form={form}
        title={"Search"}        
        loading={loading}
        modalProps={{
           maskClosable:false 
        }}
        submitter={{
            searchConfig: {
                submitText: 'Add',
            }
        }}
        
        onFinish = {dataForm => {
            onSave(selected||[])
            return Promise.resolve()
        }} 
        onFieldsChange={(changedFields, allFields) => {
            var data = form.getFieldsValue()
            setCriteria(v=>{return {...data}})
            actionRef.current?.reload()
        }}
    ><Space direction='vertical' style={{width: '100%'}} > 
         <ProCard boxShadow size="small" direction="row">
            <ProFormGroup size={'small'}>
            <ProFormText label='Customer' name={'searchValue'}/>
            <ProFormSelect label="Target" hidden={otherHidden}  name={'target'} mode="multiple" rules={[{ required: false }]} showSearch allowClear width={'sm'} options={gratisTarget?.map(it => ({ label: it.name, value: it.code }))}/>  
            <ProFormSelect label="Incentive Rate" hidden={otherHidden || inDirectHidden}  name={'incentiveRate'}  mode="multiple" rules={[{ required: false }]} showSearch allowClear width={'sm'} options={gratisIncentive?.map(it => ({ label: it.name, value: it.code }))}/>
            <ProFormSelect label="SKU to be settled" hidden={otherHidden} name={'skuSettled'}  mode="multiple" rules={[{ required: false }]} showSearch allowClear width={'sm'} options={skuSettled?.map(it => ({ label: it.name, value: it.code }))}/>   
            </ProFormGroup>
         </ProCard>
        <ProTable size="small"
            actionRef={actionRef} 
            search={false} 
            bordered
            cardProps={false}
            options={{
                fullScreen: false,
                density: false,
                reload: false,
                setting: false
            }}             
            request={ async(page: any)=>{
                return GratisServices.fetchContractToGratisContract({...params,searchValue:criteria.searchValue,target:criteria.target,incentiveRate:criteria.incentiveRate,skuSettled:criteria.skuSettled}).query(requestActions).then(it => {                    
                    return {               
                        success: true, 
                        total: (it?.length - (dataFilter?.length||0)),
                        data: it.filter((it:any)=> !!!dataFilter?.find(i=> i.uuId ===it.uuId))
                    }
                }) //as Promise<Paging<ContractLess>>
            }} 
            rowKey='uuId' 
            rowSelection={{
                selections: ["SELECT_ALL", "SELECT_INVERT", "SELECT_NONE"],
                checkStrictly: true,
                getCheckboxProps: (data) => ({ disabled: !data.terms }),
                onSelect(item, selected1) {
                    if (selected1) {
                        setSelected(v => ([...(v || []), item]))
                    } else {
                        setSelected(v => v?.filter(it => it.uuId != item.uuId))
                    }
                },
                onChange(_, selectedRows, info) {
                    if (info.type !== 'single') {
                        setSelected(selectedRows)
                    }
                },
            }}
            columns={cols}
        />
    </Space>
    </ModalForm>
}