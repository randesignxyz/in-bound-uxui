import { ActionType, ModalForm, ModalFormProps, ProCard, ProFormGroup, ProFormSelect, ProFormText, ProTable } from "@ant-design/pro-components"
import { Button, Space } from "antd"

import { AppraisalEmp } from "../../appraisal-submit/data.types"
import { useEffect, useRef, useState } from "react"
// import { createService } from "./services"
import { simpleRequestActions } from "@/services/model"
import { createService } from "../services"
import { useForm } from "antd/es/form/Form"
import { LookupData, LookupDataItem } from "@/services/data"
import { MultiRequest } from "@/services/apiGateway"
import { AppraisalLookupData, SearchCriteria } from "../data.types"

interface Props extends ModalFormProps<{}>{
    requestType?: AppraisalLookupData
    onAdd:(selected: AppraisalEmp[])=>void
    dataFilter?:AppraisalEmp[]
    onBuSelectedHandler: (bu: string)=> void
    buSelected?: string
}
// interface SearchCriteria {
//     searchValue?:string;
//     buName?: string[];
//     deptName?:string[];
// }

const AppraisalSubmitListModal=({requestType, onAdd,dataFilter,onBuSelectedHandler, buSelected,...rest}:Props)=>{
    const requestActions = simpleRequestActions()
    const services = createService(requestActions)
    const [form] = useForm<SearchCriteria>() 
    const actionRef = useRef<ActionType>();
    const [criteria,setCriteria] = useState<SearchCriteria>({requestTypeId:requestType?.value||0})
    const [selected, setSelected] = useState<AppraisalEmp[]>()
    const [lookupData, setLookupData] = useState<{
        appraisalBuLookup?: LookupDataItem[],
        appraisalFunctionLookup?: LookupDataItem[],
    }>()
    useEffect(() => {
        (async () => {
            const rs = await MultiRequest<{
                appraisalBuLookup?: LookupDataItem[],
                appraisalFunctionLookup?: LookupDataItem[],
            }>([
                services.listAppraisalBu(),
                services.listAppraisalFunction()
            ])(requestActions)
            setLookupData(rs)
            const lookupDataFirst = rs.appraisalBuLookup?.[0]
            if(lookupDataFirst && (!buSelected || buSelected=='')){
                const bu = lookupDataFirst.code||''
                onBuSelectedHandler(bu)
                setCriteria(v=>{return {...v, buName: bu}})
                actionRef.current?.reload()
            }
        })()
    },[])

    useEffect(()=>{
        form.setFieldValue('buName',buSelected)
        setCriteria(v=>{return {...v, buName: buSelected}})
    },[buSelected])
    return <ModalForm
        form={form}
        title="Appraisal List"
        width={1000}
        {...rest}
        submitter={{
            searchConfig: {
                submitText: 'Add',
            },
            render(props, defaultDoms) {

                if (defaultDoms.length > 1) {
                    return [
                        defaultDoms[0],
                        (selected||[])?.length>0&&defaultDoms[1],
                    ]
                }
                else return defaultDoms
            },
        }}
        onFinish={ dataForm=>{
            onAdd(selected||[])
            actionRef.current?.reload()
            setSelected([])

            return Promise.resolve()
        }}
        onFieldsChange={(changedFields, allFields) => {
            var data = form.getFieldsValue()            
            setCriteria(v=>{return {...v,...data}})
            actionRef.current?.reload()
        }}
    ><Space direction='vertical' style={{width: '100%'}} >
        <ProCard boxShadow size="small" >
            <ProFormGroup size={'small'}>
                <ProFormText label='Search' name={'searchValue'}/>
                <ProFormSelect label='Business Unit' name={'buName'} width={'sm'} mode="single" disabled={(dataFilter?.length ||0)>0} onChange={onBuSelectedHandler} options={lookupData?.appraisalBuLookup?.map(it => ({ label: it.name, value: it.code }))}/>
                <ProFormSelect label='Function' name={'deptName'} width={'sm'} mode="multiple" options={lookupData?.appraisalFunctionLookup?.map(it => ({ label: it.name, value: it.code }))}/>
            </ProFormGroup>
        </ProCard>
        <ProTable<AppraisalEmp> size="small"
            actionRef={actionRef} 
            search={false} 
            cardProps={false}
            pagination = {{
                defaultPageSize: 100
            }}
            options={{
                fullScreen: false,
                density: false,
                reload: false,
                setting: false,
            }} 
            request={ async(page: any)=>{
                return  services.fetchAppraisalSubmissionList(criteria).then(it=>{
                    return {
                        success: true,
                        total: ((it?.length||0) -(dataFilter?.length||0)),
                        data: it.filter((it:any)=> !!!dataFilter?.find(i=>i.id===it.id))
                        .sort((a,b)=> (a?.buName||'').localeCompare(b?.buName||'')?
                            (a?.buName||'').localeCompare(b?.buName||''):(a?.departmentName||'').localeCompare(b?.departmentName||'')?
                            (a?.departmentName||'').localeCompare(b?.departmentName||''):(a?.empName||'').localeCompare(b?.empName||'')
                        )
                    }
                })
            }}
            rowKey='id' 
            rowSelection={{
                selections: ["SELECT_ALL", "SELECT_INVERT", "SELECT_NONE"],
                checkStrictly: true,
                onSelect(item, selected) {
                    if (selected) {
                        setSelected(v => ([...(v || []), item]))
                    } else {
                        setSelected(v => v?.filter(it => it.id != item.id))
                    }
                },
                onChange(_, selectedRows, info) {
                    if (info.type !== 'single') {
                        setSelected(selectedRows)
                    }
                },
            }}
            columns={[
                {title:'Employee Name', dataIndex: 'empName'},
                {title:'Employee Name(KH)', dataIndex: 'internalName'},
                {title: 'Business Unit', dataIndex: 'buName'},
                {title: 'Function', dataIndex: 'departmentName'},
                {title: 'Job Title', dataIndex: 'jobTitle'},
                {title: 'Self- Rating', dataIndex: 'rating1',sorter:'rating1'},
                {title: "Manager's Rating", dataIndex: 'rating3',
                    render:(_,r)=> {
                        return (r?.rating3==0 ?'-':  r?.rating3==-1.0 ?'-': r.rating3)
                    }
                },
                // {title: 'Agreed Rating', dataIndex: 'rating5',
                //     render:(_,r)=>  !r?.agreeRating||r?.agreeRating==0 ?'-': r?.agreeRating
                // },
            ]}
        />        
     </Space></ModalForm>
}

export default AppraisalSubmitListModal