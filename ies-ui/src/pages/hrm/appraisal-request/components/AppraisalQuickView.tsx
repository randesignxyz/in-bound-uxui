import { SaveOutlined, StarTwoTone } from "@ant-design/icons";
import { DrawerForm, ProCard, ProForm, ProFormTextArea, ProTable } from "@ant-design/pro-components"
import { Button, Modal, Radio, RadioChangeEvent, Space, Table, Tag, Typography, message } from "antd"
import { AppraisalDataLookup, AppraisalEmp, AppraisalEmpSubmissionResult, AppraisalRating, AppraisalRemark, AppraisalStyle, ValidatorMsg } from "../../appraisal-submit/data.types";
import { toReadable } from "@/pages/utils";
import SubmissionInfo from "../../appraisal-submit/components/SubmissionInfo";
import { useEffect, useState } from "react";
import { simpleRequestActions } from "@/services/model";
import { createService } from "../services";
import AppraisalInstruction from "../../appraisal-submit/components/AppraisalInstruction";
import OveralPerformance from "../../appraisal-submit/components/OveralPerformance";
import AttachedFileListCRUD from "@/components/Attachment/AttachedFileListCRUD";
import { Model } from "../../appraisal-submit/model";
import { round } from "lodash";
import { AppraisalRequestItemPayload } from "../data.types";
import { useForm } from "antd/es/form/Form";

interface Props{
    open?: boolean;
    onOpenModalChange:(v:boolean)=>void
    appraisalRequestItemId: number
    appraisalEmpId: number
    refeshTable:(isClose:()=>boolean)=>void
    taskCompleted?: boolean
    showRating5?:boolean,
    edit?: boolean
}
type DataFormType = {
    personalAction?: string
    devAction?: number  
    remark?: string
}
const AppraisalQuickView = ({open,onOpenModalChange,appraisalRequestItemId,appraisalEmpId,refeshTable,taskCompleted,showRating5,edit}:Props) => {
    const rowColr = AppraisalStyle.color1
    const color3 = AppraisalStyle.color3
    const border = `solid ${color3} 1px`
    const [form] = useForm<DataFormType>();
    const [dataLookup,setDataLookup] = useState<AppraisalDataLookup[]>()
    const [lang,setLang] = useState<string>("ENG")
    const requestActions = simpleRequestActions()
    const services = createService( requestActions)
    const [appraisalEmp,setAppraisalEmp] = useState<AppraisalEmp>()
    const [appraisal,setAppraisal] = useState<AppraisalEmpSubmissionResult[]>()
    const { actions,data } = Model();

    useEffect(()=>{
        services.fetchAppraisalDataLookupList().then(rs=>{
            setDataLookup(rs)
        })
        loadData()
      
    },[])
    const loadData = ()=> {
        services.fetchItemDetail(appraisalRequestItemId).then(rs=> {
            setAppraisalEmp(rs)
            services.fetchAppraisalDimensionList(appraisalEmpId).then(list=>{                         
                setAppraisal(list) 
           })
        })
    }
    const onChangeLanglauge=()=>{
        setLang(v=> lang=='KH'?'ENG':'KH')
    }
    const getLable=(key:string)=>{
        var label = dataLookup?.find(it=> (it.code==key))
        return lang=='KH'?label?.value1:label?.value
    }
   
    const onChange5 = (e: RadioChangeEvent,r:AppraisalEmpSubmissionResult) => {
        var rating = e.target.value
        setAppraisal(v=> { 
            return v?.map(it=> data.setAppraisalRating(it,'r5',r.appraisalDimensionId,r.appraisalBehaviorId,rating)) 
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
    const saveSubmitHandler =async ()=> {       
        var requireRating =data.appraisalRatingValidation(lang,appraisal||[])
        if(requireRating.find(it=> !it?.rating5)){   
            alertMsg(getLable('TITTLE_REQUIRE_RATING'),requireRating.filter(it=>(!it?.rating5 || it?.rating5==0)).map(it=>{ 
                return {id:it.id,title: it.title,msg:lang=='KH'? `${getLable('MSG_IS_REQUIRED')}${getLable('TBL_RATING5')}`:`${getLable('TBL_RATING5')} ${getLable('MSG_IS_REQUIRED')}`} as ValidatorMsg
            }))
            return
        }
        Modal.confirm({
            title: 'Update Appraisal Form',
            content: 'Are you sure to complete this form?',
            onOk: async () => {
                try {
                    saveItem('DONE',requireRating,()=>{
                        refeshTable(()=> true) 
                        message.success(`saved successfully.`)
                    })
                }catch (error: any) {
                    message.error(error.message || 'Failed to save.')
                }}
            })
       
    }

    const saveDraftHandler = () =>{   
        try {           
            var list =data.appraisalRatingValidation(lang,appraisal||[])           
            saveItem('DRAFTED',list,()=>{
                refeshTable(()=> false) 
                loadData()
                message.success(`saved successfully.`)
            })
           
           
        }catch (error: any) {
            message.error(error.message || 'Failed to save.')
        }
    }
    const saveItem = (status: string,list: AppraisalRating[],cb:()=>void) => {
        const formData = form.getFieldsValue()        
        var payLoad = {
            id: appraisalRequestItemId,           
            submissionList: list.map((it:AppraisalRating) => {
                return {
                    id: it.id,
                    appraisalDimensionId: it.appraisalDimensionId,
                    rating1: it.rating1,
                    rating2: it.rating2,
                    rating3: it.rating3,
                    rating4: it.rating4,
                    rating5: it.rating5,
                    weight: it.weight
                } as AppraisalRating
            }),           
            actionStatus: status,
            personalAction: formData?.personalAction,
            devAction: formData?.devAction,
            remark: formData?.remark
        } as AppraisalRequestItemPayload
        services.saveItemDetail(payLoad).then(it=> {
            // refeshTable(()=> isClose)    
            cb()       
        })
    }
    const cols = [
        {
            // title: 'Performance Dimension',
            title: getLable('TBL_DIMENSION'),
            width: '24%',
            render:(r: any)=><>
                
                <div > <b> {(appraisal?.filter(it=> (it.appraisalDimensionId === r.appraisalDimensionId && it.rating1>0))||[]).length>0 ? <><StarTwoTone/></>:<></>} {lang=='KH'?r.title1:r.title}</b></div>
                <div >{lang=='KH'?r.description1:r.description}</div>
            </>,
            onCell: (record:any) => ({
                rowSpan: (record?.gsort)===1? record?.gtotal:0,
                style: record.sort%2===0?{ background:rowColr,border:border}:{border:border}
            }),   
        },{
            title: getLable('TBL_BEHAVIOR'),
            width: '45%',
            render:(r: any)=>{
                var behaviorDescription = lang=='KH'?r.behaviorDescription1:r.behaviorDescription
                return ((r?.rating5>0 &&(edit || showRating5 || taskCompleted))||r?.rating3>0||r?.rating1>0)?<b>{behaviorDescription}</b>:behaviorDescription
            },
            onCell:(record:any)=>({style: record.sort%2===0?{ background:rowColr,border:border}:{border:border}})
        },{
            title: getLable('TBL_RATING1'),
            width: '9%',     
            render:(r:any)=> <Radio value={r.behaviorRate}  checked={(r.behaviorRate===r.rating1)?true:false} />,
            onCell:(record:any)=>({style: record.sort%2===0?{ background:rowColr, textAlign:'center',border:border}:{ textAlign:'center',border:border}})
        },{
            title: getLable('TBL_RATING3'),
            width: '8%',     
            render:(r:any)=> <Radio value={r.behaviorRate}  checked={r.behaviorRate===r.rating3} />,
            onCell:(record:any)=>({style: record.sort%2===0?{ background:rowColr, textAlign:'center',border:border}:{textAlign:'center',border:border}})
        },
    ]
    if(edit || showRating5 || taskCompleted){
        cols.push(
            {
                title: getLable('TBL_RATING5'),
                width: '8%',     
                render:(r:any)=> <Radio value={r.behaviorRate}  checked={r.behaviorRate===r.rating5}  onChange={(e)=>  (edit&&!taskCompleted)&&onChange5(e,r)}/>,
                onCell:(record:any)=>({style: record.sort%2===0?{ background:rowColr, textAlign:'center',border:border}:{ textAlign:'center',border:border}})
            }
        )
    }

    return (<DrawerForm width={'85%'}       
        open={open}
        onOpenChange={onOpenModalChange}
        title={<Space>
            <div>Performance Appraisal {appraisalEmp?.title} | {appraisalEmp?.empNo}- {appraisalEmp?.empName}</div>
            <div>
                <Tag><Typography.Text type={ appraisalEmp?.actionStatus  == 'DONE' ? 'success' : 'warning'}> {toReadable(appraisalEmp?.actionStatus )}</Typography.Text></Tag>               
            </div>
        </Space>}
        submitter={{
            searchConfig: {
                submitText: 'Done',
                resetText:'Close'            
            },
            render: (_, defaultDoms) => {
                return [
                    defaultDoms[0],
                    (edit&&!taskCompleted)&&<Button key="1" icon={<SaveOutlined />} onClick={saveDraftHandler}>Save Draft</Button>,
                    (edit&&!taskCompleted)&&defaultDoms[1]
                ]
            }            
        }}       
        onFinish={ async (dataForm:any)=> {           
            saveSubmitHandler()
            return false
        }}
    >
       {appraisalEmp && <SubmissionInfo dataDetail={{...appraisalEmp,status: appraisalEmp?.actionStatus||'PENDING' }}/>}     
        <Space direction="vertical" style={{ width: '100%' }}>
            <AppraisalInstruction 
                lang={lang} 
                onChangeLanglauge={onChangeLanglauge} 
                getLableName={(key:string)=>getLable(key)} 
                appraisalPerformanceId={appraisalEmp?.appraisalPerformanceId||-1}
            />
            <ProTable
                cardProps = {false}
                pagination={false}  
                search={false}
                options={{
                    density:false,
                    search:false,
                    reload:false,
                    setting:false,
                    fullScreen:false
                    
                }}
                dataSource={appraisal} 
                columns={cols} 
                summary={(data) => {
                    var rating1 = 0,
                        rating3 = 0,
                        rating5 = 0
      
                    data?.forEach(it => {
                      rating1 = rating1+ round(it.rating1*it.weight,2)
                      rating3 = rating3+ round(it.rating3*it.weight,2)
                      rating5 = rating5+ round(it.rating5*it.weight,2)
                    }) 
                   
                    return <Table.Summary.Row style={{ textAlign: 'right', fontWeight: 'bold',border:border }}>
                      <Table.Summary.Cell colSpan={2} index={2}>{getLable('LABEL_TOTAL_SCORE')}</Table.Summary.Cell>
                      <Table.Summary.Cell index={4} align='center'>{ round(rating1,2) || 0}</Table.Summary.Cell>
                      <Table.Summary.Cell index={4} align='center'>{round(rating3,2)}</Table.Summary.Cell>
                      {(edit || showRating5 || taskCompleted)&&<Table.Summary.Cell index={4} align='center'>{ round(rating5,2) || 0}</Table.Summary.Cell>}
                    </Table.Summary.Row>
                  }}
                            
            />
            <OveralPerformance lang={lang} getLableName={getLable} appraisalPerformanceId={appraisalEmp?.appraisalPerformanceId||-1}/> 
            {appraisalEmp&& <ProForm<AppraisalRemark>
                 submitter={false}
                initialValues={{
                    empComment: appraisalEmp.empComment,
                    rating2Comment:appraisalEmp?.rating2Comment,
                    rating3Comment:appraisalEmp?.rating3Comment
                }}
            >
                <Space direction="vertical" style={{ width: '100%' }}>  
                    <ProCard size="small" style={{height:'100%'}} headerBordered bordered title={<b>{getLable('TITLE_EMP_COMMENT')}<span style={{color:'red'}}>*</span></b>}>
                        <ProFormTextArea name={'empComment'} readonly={true}  rules={[{ required: true }]}/> 
                        <ProTable
                            cardProps = {false}
                            pagination={false}  
                            search={false}
                            options={{
                                density:false,
                                search:false,
                                reload:false,
                                setting:false,
                                fullScreen:false
                                
                            }}
                            dataSource={appraisalEmp.appraisalEmpImprovementRated1List}
                            columns={[
                                {
                                    title: <b>{getLable('TITLE_EMP_EM_HIS_AREA_IMPROVEMENT')}<span style={{color:'red'}}>*</span></b>, valueType: 'textarea', width: 300, dataIndex: 'improvement'
                                },{ 
                                    title: <b>{getLable('TITLE_EMP_EM_HIS_IMPROVEMENT_ACTION')}<span style={{color:'red'}}>*</span></b>, valueType: 'textarea', width: 300, dataIndex: 'propose',                            
                                    fieldProps:{placeholder:'', maxLength: 500,}
                                },
                        ]}
                        />
                    </ProCard>
                </Space>
                {appraisalEmp.hasRating2 &&<Space direction="vertical" style={{ width: '100%' }}>  
                    <ProCard size="small" style={{height:'100%'}} headerBordered bordered title={<b>{getLable('TITLE_RATING2_COMMENT')}<span style={{color:'red'}}>*</span></b>}>
                        <ProFormTextArea name={'rating2Comment'} readonly={true}  /> 
                        <ProTable
                            cardProps = {false}
                            pagination={false}  
                            search={false}
                            options={{
                                density:false,
                                search:false,
                                reload:false,
                                setting:false,
                                fullScreen:false
                                
                            }}
                            dataSource={appraisalEmp.appraisalEmpImprovementRated2List}
                            columns={[
                                {
                                    title: <b>{getLable('TITLE_EMP_EM_HIS_AREA_IMPROVEMENT')}<span style={{color:'red'}}>*</span></b>, valueType: 'textarea', width: 300, dataIndex: 'improvement'
                                },{ 
                                    title: <b>{getLable('TITLE_EMP_EM_HIS_IMPROVEMENT_ACTION')}<span style={{color:'red'}}>*</span></b>, valueType: 'textarea', width: 300, dataIndex: 'propose',                            
                                    fieldProps:{placeholder:'', maxLength: 500,}
                                },
                        ]}
                        />
                    </ProCard>
                </Space>}
                <Space direction="vertical" style={{ width: '100%' }}>  
                    <ProCard size="small" style={{height:'100%'}} headerBordered bordered title={<b>{getLable('TITLE_RATING3_COMMENT')}<span style={{color:'red'}}>*</span></b>}>
                        <ProFormTextArea name={'rating3Comment'} readonly={true}  /> 
                        <ProTable
                            cardProps = {false}
                            pagination={false}  
                            search={false}
                            options={{
                                density:false,
                                search:false,
                                reload:false,
                                setting:false,
                                fullScreen:false
                                
                            }}
                            dataSource={appraisalEmp.appraisalEmpImprovementRated3List}
                            columns={[
                                {
                                    title: <b>{getLable('TITLE_EMP_EM_HIS_AREA_IMPROVEMENT')}<span style={{color:'red'}}>*</span></b>, valueType: 'textarea', width: 300, dataIndex: 'improvement'
                                },{ 
                                    title: <b>{getLable('TITLE_EMP_EM_HIS_IMPROVEMENT_ACTION')}<span style={{color:'red'}}>*</span></b>, valueType: 'textarea', width: 300, dataIndex: 'propose',                            
                                    fieldProps:{placeholder:'', maxLength: 500,}
                                },
                            ]}
                        />
                    </ProCard>
                </Space>               
            </ProForm>}
            {appraisalEmp&&<ProCard size="small" style={{height:'100%'}} headerBordered bordered title={<b>{getLable('TITLE_REVIEW_COMMENT')}</b>}>
                <ProForm<DataFormType>
                submitter={false}
                form={form}       
                initialValues={{
                    personalAction: appraisalEmp?.appraisalRequestItem?.personalAction,
                    devAction: appraisalEmp?.appraisalRequestItem?.devAction,
                    remark: appraisalEmp?.appraisalRequestItem?.remark
                }}
            >
                <Space direction="vertical" style={{ width: '100%' }}> 
                    <ProFormTextArea label={<b>{getLable('TITLE_PERSONAL_ACTION')}</b>} readonly={ !(edit&&!taskCompleted)} rules={[{max:3000}]} name='personalAction' />
                    <ProFormTextArea label={<b>{getLable('TITLE_DEV_ACTION')}</b>} rules={[{max:3000}]} readonly={ !(edit&&!taskCompleted)} name='devAction' />
                    <ProFormTextArea label={<b>{getLable('TITLE_REMARK')}</b>} rules={[{max:3000}]} readonly={ !(edit&&!taskCompleted)} name='remark'/>
                </Space>
            </ProForm></ProCard>}
           
            {appraisalEmp?.attachedFiles&&<AttachedFileListCRUD
                    readonly = {true}
                    removeButton = {false}
                    removeAbleButtom={(createdBy:string)=> false}
                    initFiles={appraisalEmp?.attachedFiles?.map((it:any)=> {return {'fileId':it,'activity':''}})||[]}   
                />}
        </Space>
    </DrawerForm>)
}
export default AppraisalQuickView