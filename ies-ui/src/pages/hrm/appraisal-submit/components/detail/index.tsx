import { Button, Modal, Radio, Space, Tag, Typography, message } from "antd"
import DataView from "../data-view"
import { EditableFormInstance, PageContainer, ProCard} from "@ant-design/pro-components"
import { useEffect, useRef, useState } from "react"
import ActivityView from "@/pages/process-flow/components/forms/ActivityView"
import { createService } from "../../services"
import { simpleRequestActions } from "@/services/model"
import { AppraisalEmpSubmissionResult, AppraisalRemark, AppraisalEmp, ValidatorMsg, AppraisalEmpImprovement, AppraisalDataLookup } from "../../data.types"
import { Activity } from "@/services/process-workflow/data"
import { toReadable } from "@/pages/utils"
import { CheckOutlined, SaveOutlined} from "@ant-design/icons"
import { useForm } from "antd/es/form/Form"
import AttachedFileListCRUD from "@/components/Attachment/AttachedFileListCRUD"
import SubmissionInfo from "../SubmissionInfo"
import { Model } from "../../model"
import { uniqueId } from "lodash"
import {useModel } from '@umijs/max';

interface Props {
    id: number,
    onBack?: () => void;
}

const AppraisalViewDetail=(props: Props) => {
    const currentUser =  useModel('@@initialState');
    const [lang,setLang] = useState<string>("ENG")
    const [dataLookup,setDataLookup] = useState<AppraisalDataLookup[]>()
    const requestActions = simpleRequestActions()
    const [contentType, setContentType] = useState('dataForm');
    const services = createService({ request: requestActions })
    const [form] = useForm<AppraisalRemark>()
    const [dataDetail, setDataDetail] = useState<AppraisalEmp>()
    const [appraisal,setAppraisal] = useState<AppraisalEmpSubmissionResult[]>()
    const [activityList, setActivityList] = useState<Activity[]>()
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
    const [attachedFiles1,setAttachedFiles1]= useState<string[]>()
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
                var dimensionList = await services.fetchAppraisalDimensionList(props.id)
                setAppraisal(dimensionList)               
            } catch (error: any) {
                message.error(error.message || 'Failed to load data.')
            }
        })()
    },[])
    const onUploadFileIdHandler= (file:any)=>{        
        setAttachedFiles1(v =>{return [...v||'',file]})
        setAttachedUpdated(true)
    }
    const onRemoveFileIdHandler=(fileId:any) => {      
        setAttachedFiles1(v => v?.filter(it=> it!= fileId))     
        setAttachedUpdated(true)             
    }
    const reloadData = async () => {
        try {
            services.fetchItem(props.id).then(rs =>{
                setDataDetail(rs)               
                setImprovementRated1List(
                    rs?.appraisalEmpImprovementRated1List?.length!=0? rs?.appraisalEmpImprovementRated1List?.map(it=>{
                    return {key:uniqueId().toString(),...it}
                    }): [{key:uniqueId().toString(),id:0,appraisalEmpId:dataDetail?.id,improvement:'',propose:'',refCode:'r1'} as (AppraisalEmpImprovement & {key:string})]
                )           
                setImprovementRated2List(
                    rs?.appraisalEmpImprovementRated2List?.length!=0? rs?.appraisalEmpImprovementRated2List?.map(it=>{
                    return {key:uniqueId().toString(),...it}
                    }): [{key:uniqueId().toString(),id:0,appraisalEmpId:dataDetail?.id,improvement:'',propose:'',refCode:'r2'} as (AppraisalEmpImprovement & {key:string})]
                ) 
                setImprovementRated3List(
                    rs?.appraisalEmpImprovementRated3List?.length!=0? rs?.appraisalEmpImprovementRated3List?.map(it=>{
                    return {key:uniqueId().toString(),...it}
                    }): [{key:uniqueId().toString(),id:0,appraisalEmpId:dataDetail?.id,improvement:'',propose:'',refCode:'r2'} as (AppraisalEmpImprovement & {key:string})]
                ) 
            })
            services.fetchItem(props.id).then(rs =>{
                setAttachedFiles(rs?.attachedFiles)    
                setAttachedFiles1(rs?.attachedFiles)
            })
            services.fetchActivityList(props.id).then(rs=>{
                setActivityList(rs)
            })           
            setAttachedUpdated(false)
           
        } catch (error: any) {
            message.error(error.message || 'Failed to load data.')
        }
    }
     /**
     * Status: DRAFT, SUMTMITTED, REVIEWED, COMPLETED
     */ 
    const isDrafted = dataDetail?.actionStatus==='DRAFTED'?true:false
    const currentDrafted = dataDetail?.currentDrafted

    const currentAssign1 = (dataDetail?.currentAssign1||false)
    const currentAssign2 = dataDetail?.currentAssign2||false
    const currentAssign3 = dataDetail?.currentAssign3||false
    const hasRating2 = dataDetail?.hasRating2||false
    const rated1 = dataDetail?.rated1
    const rated2 = dataDetail?.rated2
    const rated3 = dataDetail?.rated3
    // const isSaveDraft = ((currentAssign1 && (currentDrafted || !rated1)) || (currentAssign2 && (currentDrafted || !rated2)) || (currentAssign3 && (currentDrafted || !rated3)))
    const isSaveDraft = ((currentAssign1 && (currentDrafted || (!rated1 && !isDrafted))) || (currentAssign2 && (currentDrafted || (!rated2 && !isDrafted))) || (currentAssign3 && (currentDrafted || (!rated3 && !isDrafted))))
    const isSubmitForm = (currentAssign1 && (currentDrafted || !rated1))  
    // const isSubmitForm = ((currentAssign1 && (currentDrafted || !rated1)) || (currentAssign2 && (currentDrafted || !rated2)) || (currentAssign3 && (currentDrafted || !rated3)))
    
    
    const saveDraftHandler =async () =>{       
        try {
            var status = actions.getStatus('DRAFTED',dataDetail)    
            var validatorList = data.appraisalRatingValidation(lang,appraisal||[]) 
            var dataForm = await form.getFieldsValue()  
            var empPayload =  data.appraisalFormPayload(
                status,
                dataDetail,
                dataForm,
                validatorList,
                appraisal,
                improvementRated1Updated,
                getAppraisalEmpImprovementRated1List()?.filter(it=>!(!it.improvement && !it.propose)).map(it=> ({id:it.id,appraisalEmpId:it.appraisalEmpId,improvement:it.improvement,propose:it.propose,refCode:'r1'})),
                improvementRated2Updated,
                getAppraisalEmpImprovementRated2List()?.filter(it=>!(!it.improvement && !it.propose)).map(it=> ({id:it.id,appraisalEmpId:it.appraisalEmpId,improvement:it.improvement,propose:it.propose,refCode:'r2'})),
                improvementRated3Updated,
                getAppraisalEmpImprovementRated3List()?.filter(it=>!(!it.improvement && !it.propose)).map(it=> ({id:it.id,appraisalEmpId:it.appraisalEmpId,improvement:it.improvement,propose:it.propose,refCode:'r3'})),
                attachedUpdated,
                attachedFiles1
            )
            console.log('empPayload',empPayload)
            await services.saveItem(empPayload)
            reloadData()
            message.success(`Your submission is saved`)
        }catch (error: any) {
            message.error(error.message || 'Failed to submit.')
        }
    }
    const getAppraisalEmpImprovementRated1List=(): AppraisalEmpImprovement[]=>{
        const fieldsVaule = editableImprovementRated1FormRef?.current?.getFieldsValue()
        const list:AppraisalEmpImprovement[]  = fieldsVaule?Object.values(fieldsVaule):[]
        return list.map(r=> ({...r, refCode:'r1'}))
    }
    const getAppraisalEmpImprovementRated2List=(): AppraisalEmpImprovement[]=>{
        const fieldsVaule = editableImprovementRated2FormRef?.current?.getFieldsValue()
        const list:AppraisalEmpImprovement[]  = fieldsVaule?Object.values(fieldsVaule):[]
        return list.map(r=> ({...r, refCode:'r2'}))
    }
    const getAppraisalEmpImprovementRated3List=(): AppraisalEmpImprovement[]=>{
        const fieldsVaule = editableImprovementRated3FormRef?.current?.getFieldsValue()
        console.log('fieldsVaule',fieldsVaule)
        const list:AppraisalEmpImprovement[]  = fieldsVaule!= undefined?Object.values(fieldsVaule):[]
        return list.map(r=> ({...r, refCode:'r3'}))
    }
    
    const saveSubmitHandler =async () =>{
        var status = actions.getStatus('DONE',dataDetail) 
        var dataForm = await form.getFieldsValue()
        data.onAppraisalFormDataValidator(
            lang,
            hasRating2,
            currentAssign1,currentAssign2,currentAssign3,dataForm, appraisal||[],getAppraisalEmpImprovementRated1List(),getAppraisalEmpImprovementRated2List(),getAppraisalEmpImprovementRated3List(),async (requireFields,requireRating)=>{
            var title= 'Appraisal Form'        
            var content= `Are you sure to submit this form?`
            if(status.checkRating==='r1'){
                if(requireRating.find(it=> !it?.rating1)){                   
                    alertMsg(requireRating.filter(it=>(!it?.rating1 || it?.rating1==0)).map(it=>{ 
                        return {id:it.id,title:it.title,msg: lang=='KH'? `${getLable('MSG_IS_REQUIRED')}${getLable('TBL_RATING1')}`:`${getLable('TBL_RATING1')} ${getLable('MSG_IS_REQUIRED')}`} as ValidatorMsg
                    }))
                    return
                }           
            } else if(status.checkRating==='r2'){
                if(requireRating.find(it=> !it?.rating2)){
                    alertMsg(requireRating.filter(it=>(!it?.rating2 || it?.rating2==0)).map(it=>{ 
                        return {id:it.id,title:it.title,msg: lang=='KH'? `${getLable('MSG_IS_REQUIRED')}${getLable('TBL_RATING2')}`:`${getLable('TBL_RATING2')} ${getLable('MSG_IS_REQUIRED')}`} as ValidatorMsg
                    }))
                    return
                }
            }else if(status.checkRating==='r3'){
                if(requireRating.find(it=> !it?.rating3)){
                    alertMsg(requireRating.filter(it=>(!it?.rating3 || it?.rating3==0)).map(it=>{ 
                        return {id:it.id,title:it.title,msg: lang=='KH'? `${getLable('MSG_IS_REQUIRED')}${getLable('TBL_RATING5')}`:`${getLable('TBL_RATING5')} ${getLable('MSG_IS_REQUIRED')}`} as ValidatorMsg
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
                                    dataDetail,
                                    dataForm,
                                    requireRating,
                                    appraisal,
                                    improvementRated1Updated,
                                    getAppraisalEmpImprovementRated1List()?.map(it=> ({id:it.id,appraisalEmpId:it.appraisalEmpId,improvement:it.improvement,propose:it.propose,refCode:'r1'})),
                                    improvementRated2Updated,
                                    getAppraisalEmpImprovementRated2List()?.map(it=> ({id:it.id,appraisalEmpId:it.appraisalEmpId,improvement:it.improvement,propose:it.propose,refCode:'r2'})),
                                    improvementRated3Updated,
                                    getAppraisalEmpImprovementRated3List()?.filter(it=>!(!it.improvement && !it.propose)).map(it=> ({id:it.id,appraisalEmpId:it.appraisalEmpId,improvement:it.improvement,propose:it.propose,refCode:'r3'})),
                                    attachedUpdated,
                                    attachedFiles1
                                )
                                )                            
                            message.success(`Appraisal form is submitted`)
                            reloadData()
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
    const alertMsg=(data?:ValidatorMsg[])=>{
        Modal.warning({
            title: getLable('TITTLE_REQUIRE_RATING'),
            width: lang=='KH'?'50%':'45%',
            content: <div>{data?.map(it => { 
                   return <div><b style={{color:'orange'}}>{it.title}: </b><span>{it.msg}</span></div>
                })}</div>
        })
    }
    const onSetRatingScoreHandler=(status:string,appraisalDimensionId: number,appraisalBehaviorId:number,rating:number)=>{         
        setAppraisal(v=> { 
            return v?.map(it=> data.setAppraisalRating(it,status,appraisalDimensionId,appraisalBehaviorId,rating)) 
        })
    }
    // const onSetImprovementRated1=(list:(AppraisalEmpImprovement&{key:string})[])=>{
    //     setImprovementRated1List(list)     
    //     setImprovementRated1Updated(true)  
    // }

    // const onSetImprovementRated2=(list:(AppraisalEmpImprovement&{key:string})[])=>{
    //     setImprovementRated2List(list)     
    //     setImprovementRated2Updated(true)  
    // }

    // const onSetImprovementRated3=(list:(AppraisalEmpImprovement&{key:string})[])=>{
    //     setImprovementRated3List(list)     
    //     setImprovementRated3Updated(true)  
    // }
   const onChangeLanglauge=()=>{
        setLang(v=> actions.getLangauge(v))
   }
   const getLable=(key:string)=>{
        var label = dataLookup?.find(it=> (it.code===key))
        return lang=='KH'?label?.value1:label?.value
    }
    
   return <PageContainer 
    loading = {requestActions.request?.loading}   
    title={<Space>
        <div>Performance Appraisal {dataDetail?.title} | {dataDetail?.empNo}- {dataDetail?.empName}</div>
        <div>
            <Tag><Typography.Text type={ dataDetail?.status  == 'COMPLETED' ? 'success' : 'warning'}> {toReadable(dataDetail?.status )}</Typography.Text></Tag>
            {dataDetail?.actionStatus && dataDetail?.currentDrafted&&<sup style={{
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
                    }}>{toReadable(dataDetail?.actionStatus)}</sup>}
        </div>
    </Space>}
    onBack={props.onBack}
    breadcrumb={undefined}
    footer={[
        contentType == 'dataForm' &&  isSaveDraft  &&  <Button key="1" icon={<SaveOutlined />} onClick={() => saveDraftHandler()}>Save Draft</Button>,
        contentType == 'dataForm' && isSubmitForm&&<Button type='primary' key="2" icon={<CheckOutlined />} onClick={() => saveSubmitHandler()}>{(currentAssign1 && rated1 && !isDrafted)? 'Resubmit': 'Submit'}</Button>
      ]}
   >
    <SubmissionInfo dataDetail={dataDetail}/>    
    <ProCard>
        <PageContainer 
            header={{
                title:'',
                ghost: true,
                breadcrumb: {
                items: [],
                },
            }}     
            breadcrumb={undefined} 
            onTabChange={setContentType}
            tabActiveKey={contentType}
            tabList={[
                { tab: 'Data Form', key: 'dataForm', tabKey: 'dataForm' },
                { tab: 'Activities', key: 'activities', tabKey: 'activities' },
                { tab: 'Attachments', key: 'attachment', tabKey: 'attachment' },
            ]}
        >
            {dataDetail && appraisal && improvementRated1List && improvementRated2List  && contentType == 'dataForm' && 
                <DataView lang={lang} 
                    loading={requestActions.request?.loading||false} 
                    actions={{isSaveDraft,isSubmitForm}}
                    onChangeLanglauge={onChangeLanglauge} 
                    dataLookup={dataLookup}
                    appraisalEmp={dataDetail} 
                    editableImprovementRated1FormRef={editableImprovementRated1FormRef}
                    initDataImprovementRated1={improvementRated1List}
                    setImprovementRated1Updated={setImprovementRated1Updated}

                    editableImprovementRated2FormRef={editableImprovementRated2FormRef}
                    initDataImprovementRated2={improvementRated2List}
                    setImprovementRated2Updated={setImprovementRated2Updated}
                    // onSetImprovementRated2={onSetImprovementRated2}

                    editableImprovementRated3FormRef={editableImprovementRated3FormRef}
                    initDataImprovementRated3={improvementRated3List}
                    setImprovementRated3Updated={setImprovementRated3Updated}
                    // onSetImprovementRated3={onSetImprovementRated3}
                    
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
                    attachedFiles={attachedFiles1}
                    onUploadFileIdHandler={onUploadFileIdHandler}
                    onRemoveFileIdHandler={onRemoveFileIdHandler}
                />
            }      
            {dataDetail && contentType == 'activities' && (<ActivityView activityList={activityList||[]}/>)}
            {contentType == 'attachment' && dataDetail && 
                <AttachedFileListCRUD
                    readonly = {(!isDrafted && (rated1 && rated3))}
                    removeButton = {currentAssign1||currentAssign2||currentAssign3}
                    removeAbleButtom={(createdBy:string)=> createdBy=== currentUser.initialState?.currentUser?.login}
                    initFiles={attachedFiles?.map(it=> {return {'fileId':it,'activity':''}})||[]}            
                    onUploadFileId={async file=> {
                        services.addAppraisalAttachment(dataDetail?.id||0,[file]).then(it=>{
                            setAttachedFiles(v =>{return [...v||'',file]})
                            setAttachedFiles1(v =>{return [...v||'',file]})
                        })
                    }}
                    onSetFileIds = {(files)=> {
                        console.log(files)
                    }}
                    onRemoveFileId={async fileId => {
                        services.removeAttachmentList(fileId).then(it=>{
                            setAttachedFiles(v => v?.filter(it=> it!= fileId)) 
                            setAttachedFiles1(v => v?.filter(it=> it!= fileId))       
                        })                                    
                    }}
                />
            }
        </PageContainer>
    </ProCard>
   </PageContainer>
}
export default AppraisalViewDetail