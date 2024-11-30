import { DrawerForm, EditableFormInstance, SubmitterProps } from "@ant-design/pro-components"
import {AppraisalRemark, AppraisalEmp, AppraisalEmpSubmissionResult, ValidatorMsg, AppraisalEmpImprovement, AppraisalDataLookup } from "../../data.types";
import { useEffect, useRef, useState } from "react";
import { simpleRequestActions } from "@/services/model";
import { Button, Modal, Space, Tag, Typography, message } from "antd";
import { toReadable } from "@/pages/utils";
import DataView from "../data-view";
import { SaveOutlined} from "@ant-design/icons";
import { useForm } from "antd/es/form/Form";
import { createService } from "../../services";
import SubmissionInfo from "../SubmissionInfo";
import { Model } from "../../model";
import { uniqueId } from "lodash";

interface Props{
    appraisalEmp?: AppraisalEmp;
    open?: boolean;
    onOpenModalChange:(v:boolean)=>void;
    refreshTable:()=>void
}

const AppraisalFormQuickView=({appraisalEmp, open, onOpenModalChange, refreshTable}:Props) =>{
    const [lang,setLang] = useState<string>("ENG")
    const [dataLookup,setDataLookup] = useState<AppraisalDataLookup[]>()
    const requestActions = simpleRequestActions()
    const services = createService({ request: requestActions })
    const [dataDetail, setDataDetail] = useState<AppraisalEmp>()
    const [appraisal,setAppraisal] = useState<AppraisalEmpSubmissionResult[]>()
    const [form] = useForm<AppraisalRemark>()
    const { actions,data } = Model();

    const [improvementRated1List, setImprovementRated1List] = useState<(AppraisalEmpImprovement & {key:string})[]>()
    const editableImprovementRated1FormRef = useRef<EditableFormInstance>();
    const [improvementRated1Updated,setImprovementRated1Updated] = useState<boolean>(false)

    const [improvementRated2List, setImprovementRated2List] = useState<(AppraisalEmpImprovement & {key:string})[]>()
    const editableImprovementRated2FormRef = useRef<EditableFormInstance>();
    const [improvementRated2Updated,setImprovementRated2Updated] = useState<boolean>(false)

    const [improvementRated3List, setImprovementRated3List] = useState<(AppraisalEmpImprovement & {key:string})[]>()
    const editableImprovementRated3FormRef = useRef<EditableFormInstance>();
    const [improvementRated3Updated,setImprovementRated3Updated] = useState<boolean>(false)
    const [attachedFiles,setAttachedFiles]= useState<string[]>()
    const [attachedUpdated,setAttachedUpdated] = useState<boolean>(false)

    useEffect(()=>{
        services.fetchAppraisalDataLookupList().then(rs=>{
            setDataLookup(rs)
        })
        
    },[])
    useEffect(() => {
        (async () => {
            try {
                reloadData()
                const dimensionList = await services.fetchAppraisalDimensionList(appraisalEmp?.id||0)
                setAppraisal(dimensionList)    
               
            } catch (error: any) {
                message.error(error.message || 'Failed to load data.')
            }
        })()
    },[])
    useEffect(()=>{
        services.fetchItem(appraisalEmp?.id||0).then(rs =>{
            setAttachedFiles(rs?.attachedFiles) 
        })
    },[])
    const onUploadFileIdHandler= (file:any)=>{        
        setAttachedFiles(v =>{return [...v||'',file]})
        setAttachedUpdated(true)
    }
    const onRemoveFileIdHandler=(fileId:any) => {      
        setAttachedFiles(v => v?.filter(it=> it!= fileId))     
        setAttachedUpdated(true)             
    }

    const reloadData = async () => {
        try {
            services.fetchItem(appraisalEmp?.id||0).then(rs=>{
                setDataDetail(rs)               
                setImprovementRated1List(
                    rs?.appraisalEmpImprovementRated1List?.length!=0? rs?.appraisalEmpImprovementRated1List?.map(it=>{
                    return {key:uniqueId().toString(),...it}
                    }): [{key:uniqueId().toString(),id:0,appraisalEmpId:appraisalEmp?.id,improvement:'',propose:'',refCode:'r1'} as (AppraisalEmpImprovement & {key:string})]
                )           
                setImprovementRated2List(
                    rs?.appraisalEmpImprovementRated2List?.length!=0? rs?.appraisalEmpImprovementRated2List?.map(it=>{
                    return {key:uniqueId().toString(),...it}
                    }): [{key:uniqueId().toString(),id:0,appraisalEmpId:appraisalEmp?.id,improvement:'',propose:'',refCode:'r2'} as (AppraisalEmpImprovement & {key:string})]
                ) 
                
                setImprovementRated3List(
                    rs?.appraisalEmpImprovementRated3List?.length!=0? rs?.appraisalEmpImprovementRated3List?.map(it=>{
                    return {key:uniqueId().toString(),...it}
                    }): [{key:uniqueId().toString(),id:0,appraisalEmpId:appraisalEmp?.id,improvement:'',propose:'',refCode:'r3'} as (AppraisalEmpImprovement & {key:string})]
                ) 
                setAttachedUpdated(false)      
            })
            
        } catch (error: any) {
            message.error(error.message || 'Failed to load data.')
        }
    }

    const isDrafted = appraisalEmp?.actionStatus==='DRAFTED'?true:false
    const currentDrafted = appraisalEmp?.currentDrafted

    const currentAssign1 = (appraisalEmp?.currentAssign1||false)
    const currentAssign2 = appraisalEmp?.currentAssign2||false
    const currentAssign3 = appraisalEmp?.currentAssign3||false
    const hasRating2 = appraisalEmp?.hasRating2||false
    const rated1 = appraisalEmp?.rated1
    const rated2 = appraisalEmp?.rated2
    const rated3 = appraisalEmp?.rated3  

    const isSaveDraft = ((currentAssign1 && (currentDrafted || !rated1)) || (currentAssign2 && (currentDrafted || !rated2)) || (currentAssign3 && (currentDrafted || !rated3)))
    const isSubmitForm = (currentAssign1 && (currentDrafted || !rated1))
    // const isSubmitForm = ((currentAssign1 && (currentDrafted || !rated1)) || (currentAssign2 && (currentDrafted || !rated2)) || (currentAssign3 && (currentDrafted || !rated3)))

    const onSetRatingScoreHandler=(status:string,appraisalDimensionId: number,appraisalBehaviorId:number,rating:number)=>{   
        setAppraisal(v=> { 
                return v?.map(it=> data.setAppraisalRating(it,status,appraisalDimensionId,appraisalBehaviorId,rating)) 
        })
    }
    const onSetImprovementRated1=(list:(AppraisalEmpImprovement&{key:string})[])=>{
        setImprovementRated1List(list)     
        setImprovementRated1Updated(true)  
    }

    const onSetImprovementRated2=(list:(AppraisalEmpImprovement&{key:string})[])=>{
        setImprovementRated2List(list)     
        setImprovementRated2Updated(true)  
    }
    const onSetImprovementRated3=(list:(AppraisalEmpImprovement&{key:string})[])=>{
        setImprovementRated3List(list)     
        setImprovementRated3Updated(true)  
    }

    const saveDraftHandler =async () => {
        try {               
            var status = actions.getStatus('DRAFTED',dataDetail)  
            var validatorList = data.appraisalRatingValidation(lang,appraisal||[])
            var dataForm = form.getFieldsValue()
            var empPayload =  data.appraisalFormPayload(
                status,
                appraisalEmp,
                dataForm,
                validatorList,
                appraisal,
                improvementRated1Updated,
                improvementRated1List?.filter(it=>!(!it.improvement && !it.propose)).map(it=> ({id:it.id,appraisalEmpId:it.appraisalEmpId,improvement:it.improvement,propose:it.propose,refCode:'r1'})),
                improvementRated2Updated,
                improvementRated2List?.filter(it=>!(!it.improvement && !it.propose)).map(it=> ({id:it.id,appraisalEmpId:it.appraisalEmpId,improvement:it.improvement,propose:it.propose,refCode:'r2'})),
                improvementRated3Updated,
                improvementRated3List?.map(it=> ({id:it.id,appraisalEmpId:it.appraisalEmpId,improvement:it.improvement,propose:it.propose,refCode:'r3'})),
                attachedUpdated,
                attachedFiles
            )
            await services.saveItem(empPayload)
            reloadData()
            message.success(`Your submission is saved`)
            refreshTable()
           
        }catch (error: any) {
            message.error(error.message || 'Failed to submit.')
        }
    }
   
    const saveSubmitHandler =async ()=> {
        var status = actions.getStatus('DONE',appraisalEmp) 
        var dataForm = await form.getFieldsValue()
        data.onAppraisalFormDataValidator(lang,hasRating2,currentAssign1,currentAssign2,currentAssign3,dataForm, appraisal||[],improvementRated1List,improvementRated2List,improvementRated3List, async (requireFields,requireRating)=>{
            var title= 'Appraisal Form'        
            var content= `Are you sure to submit this form?`
            if(status.checkRating==='r1'){
                if(requireRating.find(it=> !it?.rating1)){                   
                    alertMsg(getLable('TITTLE_REQUIRE_RATING'),requireRating.filter(it=>(!it?.rating1 || it?.rating1==0)).map(it=>{ 
                        return {id:it.id,title:it.title,msg:lang=='KH'? `${getLable('MSG_IS_REQUIRED')}${getLable('TBL_RATING1')}`:`${getLable('TBL_RATING1')} ${getLable('MSG_IS_REQUIRED')}`} as ValidatorMsg
                    }))
                    return
                }                  
            } else if(status.checkRating==='r2'){
                if(requireRating.find(it=> !it?.rating2)){
                    alertMsg(getLable('TITTLE_REQUIRE_RATING'),requireRating.filter(it=>(!it?.rating2 || it?.rating2==0)).map(it=>{ 
                        return {id:it.id,title: it.title,msg:lang=='KH'? `${getLable('MSG_IS_REQUIRED')}${getLable('TBL_RATING2')}`:`${getLable('TBL_RATING2')} ${getLable('MSG_IS_REQUIRED')}`} as ValidatorMsg
                    }))
                    return
                }
            }else if(status.checkRating==='r3'){
                if(requireRating.find(it=> !it?.rating3)){
                    alertMsg(getLable('TITTLE_REQUIRE_RATING'),requireRating.filter(it=>(!it?.rating3 || it?.rating3==0)).map(it=>{ 
                        return {id:it.id,title: it.title,msg:lang=='KH'? `${getLable('MSG_IS_REQUIRED')}${getLable('TBL_RATING5')}`:`${getLable('TBL_RATING5')} ${getLable('MSG_IS_REQUIRED')}`} as ValidatorMsg
                    }))
                    return
                }
            }
            if(requireFields.length>0) {
                Modal.warning({
                    title: getLable('TITTLE_REQUIRE_FIELD'),
                    width: '45%',
                    content: <div>{requireFields.map(it =>{
                        return <div><b style={{color:'orange'}}>{getLable(it.title)}: </b><span>{getLable(it.msg)}</span></div>
                    })}</div>
                })
                await form.validateFields()
                await editableImprovementRated1FormRef.current?.validateFields()
                await editableImprovementRated2FormRef.current?.validateFields()
                await editableImprovementRated3FormRef.current?.validateFields()
                return
            }
            try {            
                Modal.confirm({
                    title: title,
                    content: content,
                    onOk: async () => {
                        try {
                            var dataForm = form.getFieldsValue()
                            await services.saveItem(
                                data.appraisalFormPayload(
                                    status,
                                    appraisalEmp,
                                    dataForm,
                                    requireRating,
                                    appraisal,
                                    improvementRated1Updated,
                                    improvementRated1List?.map(it=> ({id:it.id,appraisalEmpId:it.appraisalEmpId,improvement:it.improvement,propose:it.propose,refCode:'r1'})),
                                    improvementRated2Updated,
                                    improvementRated2List?.map(it=> ({id:it.id,appraisalEmpId:it.appraisalEmpId,improvement:it.improvement,propose:it.propose,refCode:'r2'})),
                                    improvementRated3Updated,
                                    improvementRated3List?.map(it=> ({id:it.id,appraisalEmpId:it.appraisalEmpId,improvement:it.improvement,propose:it.propose,refCode:'r3'})),
                                    attachedUpdated,
                                    attachedFiles
                                )
                            ) 
                            message.success(`Appraisal form is submitted`)
                            onOpenModalChange(false)
                            refreshTable()
                        } catch (error: any) {
                            message.error(error.message || 'Failed')                       
                        }
                    }
                })
                
            }catch (error: any) {
                message.error(error.message || 'Failed to submit.')           
            }            
        })
    }
    const alertMsg=(tittle?:string,data?:ValidatorMsg[])=>{
        Modal.warning({
            title: tittle||'',
            width: lang=='KH'?'50%':'45%',
            content: <div>{data?.map(it => { 
                   return <div><b style={{color:'orange'}}>{it.title}: </b><span>{it.msg}</span></div>
                })}</div>
        })
    }

    const submitter = {
        searchConfig: {
            submitText: (currentAssign1 && rated1 && !isDrafted)?'Resubmit':'Submit',
            resetText:'Close'            
        },
        render: (_, defaultDoms) => {
            return [
              defaultDoms[0],
              isSaveDraft  &&<Button key="1" icon={<SaveOutlined />} onClick={() => saveDraftHandler()}>Save Draft</Button>,
              isSubmitForm&&defaultDoms[1]
          ];
          }
    } as SubmitterProps 

    const onChangeLanglauge=()=>{
        setLang(v=> actions.getLangauge(v))
    }
    const getLable=(key:string)=>{
        var label = dataLookup?.find(it=> (it.code===key))
        return lang=='KH'?label?.value1:label?.value
    }
   
    return(<DrawerForm width={'80%'}
        loading={requestActions.request?.loading}
        open={open}
        onOpenChange={onOpenModalChange}       
        title={<Space>
            <div>Performance Appraisal {dataDetail?.title} | {dataDetail?.empNo}- {dataDetail?.empName}</div>
            <div>
                <Tag><Typography.Text type={ dataDetail?.status  == 'COMPLETED' ? 'success' : 'warning'}> {toReadable(dataDetail?.status )}</Typography.Text></Tag>
                {dataDetail?.actionStatus&& currentDrafted &&<span style={{
                    zIndex:'auto',
                    minWidth:'20px',
                    padding:'0px 6px 1px 6px',
                    color:'white',
                    fontWeight:'400',
                    fontSize:'10px',
                    lineHeight:'20px',
                    borderRadius:'10px',
                    whiteSpace:'nowrap' , 
                    textAlign:'center', 
                    backgroundColor:'#faad14fa',
                }}>{toReadable(dataDetail?.actionStatus)}</span>}
            </div>
        </Space>}
        
        submitter={submitter}
        onFinish={ async (dataForm:any)=> {           
             saveSubmitHandler()
           return false
        }}
    >
        <SubmissionInfo dataDetail={dataDetail}/>
        {dataDetail && improvementRated1List && improvementRated2List && improvementRated3List && <DataView 
            loading={requestActions.request?.loading}
            lang={lang}
            actions={{isSaveDraft,isSubmitForm}}
            onChangeLanglauge={onChangeLanglauge}
            dataLookup={dataLookup}
            appraisalEmp={dataDetail}
            editableImprovementRated1FormRef={editableImprovementRated1FormRef}
            improvementRated1={improvementRated1List}
            onSetImprovementRated1={onSetImprovementRated1}

            editableImprovementRated2FormRef={editableImprovementRated2FormRef}
            improvementRated2={improvementRated2List}
            onSetImprovementRated2={onSetImprovementRated2}

            editableImprovementRated3FormRef={editableImprovementRated3FormRef}
            improvementRated3={improvementRated3List}
            onSetImprovementRated3={onSetImprovementRated3}

            form={form}
            initialValues={{
                rating2Comment: dataDetail?.rating2Comment,
                rating2Comment1: dataDetail?.rating2Comment1,
                rating3Comment: dataDetail?.rating3Comment,
                rating4Comment: dataDetail?.rating4Comment,
                rating5Comment: dataDetail?.rating5Comment,
                empComment: dataDetail?.empComment,
                empStrength: dataDetail?.empStrength,
                empTrainingNeeded: dataDetail?.empTrainingNeeded
            }} 
            appraisal={appraisal} 
            onSetRatingScoreHandler={onSetRatingScoreHandler}
            attachedFiles={attachedFiles}
            onUploadFileIdHandler={onUploadFileIdHandler}
            onRemoveFileIdHandler={onRemoveFileIdHandler}
            />
        }
    </DrawerForm>

    )
}
export default AppraisalFormQuickView