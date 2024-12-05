import { simpleRequestActions } from "@/services/model";
import { ModalForm, ProTable } from "@ant-design/pro-components"
import { useEffect, useState } from "react"
import { createService } from "../../services";
import { AppraisalEmp, AppraisalEmpSubmitAllPayload, ValidatorMsg } from "../../data.types";
import { Button, Modal, Tooltip, Typography, message} from "antd";
import { Model } from "../../model";
import ConfirmSubmitModal from "./ConfirmSubmitModal";
import { DeleteOutlined } from "@ant-design/icons";
const { Link } = Typography;

interface Props{
    open?: boolean
    onOpenModalChange:(v:boolean)=>void,    
    refreshTable:()=>void
}
export default ({open, onOpenModalChange,refreshTable}:Props) =>{
    
    const requestActions = simpleRequestActions();
    const srv = createService({ request: requestActions })
    const [appraisalEmp,setAppraisalEmp] = useState<AppraisalEmp[]>()
    const { actions, data, modals } = Model();
    const [loading,setLoading] = useState<boolean>(false)
    
    useEffect(() => {
        try {
            srv.findDraftedAppraisalEmpList().then(it=>{
                setAppraisalEmp(it.filter(it=>{
                    // var msg = data.validationMsgList(it)
                    // return msg.length==0
                    return true
                }).map(i=> {
                    var status = actions.getStatus('DONE',i)
                    return {...i,
                        status:status.status,
                        actionStatus:status.actionStatus,
                        rated1: status.rated1,
                        rated2: status.rated2,
                        rated3: status.rated3,
                        rated4: status.rated4,
                        rated5: status.rated5
                    }
                }))
            })
        }catch(error: any){
            message.error(error.message || 'Failed to load data.')
        }
        
    },[])

    const removeHandler=(r:AppraisalEmp)=>{
        setAppraisalEmp(v=>{
            return v?.filter(it=> it.id!= r.id)
        })
    }
    const onSubmitAllHandler=async()=>{
        var validtor = Array<{id:number,title:string,msg: ValidatorMsg[]}>()
        appraisalEmp?.forEach(it=>{
            var msg = data.validationMsgList(it)
            if(msg.length>0){
                validtor.push({id:it.id,title:`${it.empNo}-${it.empName}`, msg:msg})
            }
        })
        if(validtor.length>0){
            Modal.warning({
                title: `Field's Required`,
                width: '50%',
                content: <div>{validtor.map(it=> it.msg?.map(i=> <div><b style={{color:'orange'}}>{it.title}: </b><span>{i.title} {i.msg}</span></div>))}</div>
            })
            return 
        }
        modals.showModal('ConfirmPerformanceEvaluationSubmit')        
    }
    const onFinishHandler=async ()=>{
        try {
            setLoading(true)
            await srv.submitAllAppraisalEmps(appraisalEmp?.map(
                it=> {
                return {
                    id:it.id,
                    status:it.status,
                    actionStatus:it.actionStatus,
                    rated1: it.rated1,
                    rated2: it.rated2,
                    rated3: it.rated3,
                    rated4: it.rated4,
                    rated5: it.rated5
                } as AppraisalEmpSubmitAllPayload
            })).then(rs=>{
                message.success(`submitted`)
                setLoading(false)
                onOpenModalChange(false)
                refreshTable()
            })
        } catch (error: any) {
            message.error(error.message || 'Failed')                       
        }
    }

    return <ModalForm
        title='Performance Evaluation List'        
        width={'85%'}
        open={open}
        onOpenChange={onOpenModalChange}
        submitter={{
            searchConfig: {
              submitText: 'Submit All',
            },
            submitButtonProps:{
               loading: loading,
               disabled: ((appraisalEmp?.length||0)==0 || appraisalEmp?.some(it => data.validationMsgList(it).length > 0 ))
            }    
        }}
        onFinish={()=>onSubmitAllHandler()}
    >
    {appraisalEmp&&<ProTable<AppraisalEmp>
        loading = {requestActions.request?.loading}
        pagination={false}  
        search={false}
        options={{
            density:false,
            search:false,
            reload:false,
            setting:false,
            fullScreen:false
            
        }}                
        dataSource={appraisalEmp}       
        columns={[
            {
                title: 'Employee',
                sorter: 'formNo', 
                width:'150px',
                render(_, r) {     
                    var vali = data.validationMsgList(r)                   
                    // return `${r.empNo}- ${r.empName}`
                    return <Link type={(vali.length > 0) ? 'danger' : undefined}>
                    <Tooltip
                        title={(vali.length > 0) && vali.map(it => <div><b style={{ color: 'orange' }}>{it.title}: </b>{it.msg}</div>)}
                        overlayStyle={{ maxWidth: '500px' }}
                    >
                        {`${r.empNo}- ${r.empName}`}
                    </Tooltip>
                </Link>
                },
            },
            {
                title: 'Employee(KH)', sorter: 'internalName', render(_, entity) {
                    return entity.internalName
                },
            },
            {title: 'Function', dataIndex: 'departmentName', sorter : 'function' },
            {title: 'Job Title', dataIndex: 'jobTitle', sorter : 'jobTitle' },
            {title: 'Self- Rating', dataIndex: 'rating1', sorter: 'rating1' },
            // {title: 'FM Rating', dataIndex: 'rating2', sorter: 'rating2' },
            {title: "Manager's Rating", dataIndex: 'rating3', sorter: 'rating3' },
            
            {
                 title: '',
                 width:'5px', 
                render: (_, r) => <Button danger type='link' icon={<DeleteOutlined/>} onClick={()=>removeHandler(r)}/>
            
            }
        ]} 
       />}
       {modals.isVisible('ConfirmPerformanceEvaluationSubmit') && <ConfirmSubmitModal onFinish={onFinishHandler}  open={modals.isVisible('ConfirmPerformanceEvaluationSubmit')} onOpenModalChange={(v: any) => !v && modals.hideModal('ConfirmPerformanceEvaluationSubmit')} />}

    </ModalForm>
}