import { simpleRequestActions } from "@/services/model";
import { ModalForm, ProTable } from "@ant-design/pro-components"
import { useEffect, useState } from "react"
import { createService } from "../../services";
import { AppraisalEmSubmissionPayLoad, AppraisalEmp, AppraisalEmpSubmitAllPayload, ValidatorMsg } from "../../data.types";
import { Modal, message} from "antd";
import { Model } from "../../model";

interface Props{
    open?: boolean
    onOpenModalChange:(v:boolean)=>void,    
    refreshTable:()=>void
}
export default ({open, onOpenModalChange,refreshTable}:Props) =>{
    const requestActions = simpleRequestActions();
    const srv = createService({ request: requestActions })
    const [appraisalEmp,setAppraisalEmp] = useState<AppraisalEmp[]>()
    const { actions, data } = Model();
    
    useEffect(() => {
        try {
            // async()=>{
                srv.findDraftedAppraisalEmpList().then(it=>{
                    setAppraisalEmp(it.filter(it=>{
                        var msg = data.validationMsgList(it)
                        return msg.length==0
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
            // }

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
        Modal.confirm({
            title: 'Submit All',
            content: 'Are you sure to submit all this forms.',
            onOk: async () => {
                try {
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
                    }))
                    message.success(`Appraisal forms're submitted`)
                    onOpenModalChange(false)
                    refreshTable()
                } catch (error: any) {
                    message.error(error.message || 'Failed')                       
                }
            }
        })
       
    }

    return <ModalForm
        title='Performance Evaluation List'        
        width={'85%'}
        open={open}
        onOpenChange={onOpenModalChange}
        submitter={((appraisalEmp?.length||0)>0)&&{
            searchConfig: {
              submitText: 'Submit All',
            },
        }}
        onFinish={()=>onSubmitAllHandler()}
    >
    <ProTable<AppraisalEmp>
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
                    return `${r.empNo}- ${r.empName}`
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
            {title: 'FM Rating', dataIndex: 'rating2', sorter: 'rating2' },
            // {title: 'Agreed Rating', dataIndex: 'rating3', sorter: 'rating3' },
            
            // {
            //      title: 'Action',
            //      width:'180px', 
            //     render: (_, r) =>  <a onClick={()=>removeHandler(r)}>Remove</a>
            
            // }
        ]} 
       />
    </ModalForm>
}