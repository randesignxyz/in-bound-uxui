import FileUploader from "@/components/Attachment/FileUploader";
import { ActionCompProps } from "@/components/core/comp";
import {
  ModalForm,
  ProCard,
  ProForm,
  ProFormDependency,
  ProFormRadio,
  ProFormText,
  ProTable,
} from '@ant-design/pro-components';
import { Alert, Button, Modal, Space, message } from "antd";
import { useForm } from "antd/lib/form/Form";
import { uniqueId } from "lodash";
import { useEffect, useState } from "react";
import Requestor from "@/pages/process-flow/components/Requestor/Requestor"
import { simpleRequestActions } from "@/services/model";
import { createService } from "./services";
import { AppraisalLookupData } from "./data.types";
import { Moment } from "moment";
import _ from "lodash";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import AppraisalSubmitListModal from "./components/AppraisalSubmitListModal";
import { AppraisalEmp } from "../appraisal-submit/data.types";

type DataFormType = {
  requestorId: string
  requestorBuId: number
  title: string
  requestTypeId: number
}

export default ({ visisble, formKey, onClose, cb }: ActionCompProps & { formKey: string }) => {
  const [uploadFiles, setUploadFiles] = useState<string[]>([])
  const [form] = useForm<DataFormType>()
  const [forceClearUpload, setForceClearUpload] = useState(0)
  const requestActions = simpleRequestActions();
  const srv = createService(requestActions)
  const [appraisalSelected, setAppraisalSelected] = useState<AppraisalEmp[]>([])
  const [buSelected, setBuSelected] = useState<string>()
  const [appraisalSubmitListModal,setAppraisalSubmitListModal] = useState<{
    type: 'appraisal-submit-list',
    required: boolean,
    cb:(selected:AppraisalEmp[])=>void
  }>()
  const [requestType,setRequestType] = useState<AppraisalLookupData>()
  const [requestSessions,setRequestSessions] = useState<AppraisalLookupData[]>()

  useEffect(()=>{
    srv.fetchRequestTypeList().then(rs=>{
      setRequestSessions(rs)
      var reqType = rs.at(0)
      setRequestType(reqType)
      form.setFieldsValue({ requestTypeId: reqType?.value})
    })

  },[])

  const onBuSelectedHandler=(bu: string) => {
    setBuSelected(bu)
  }

  const onSaveHandler = async () => {
    const dataForm = await form.validateFields()
    if(appraisalSelected.length ==0){
      message.error("Performance Appraisal List is required.")
      return
    }
    if(buSelected){
      Modal.confirm({
        title: 'Appraisal Request Form',
        content: "Are you sure to submit the request?",
        onOk: async () => {
          try {
            await srv.saveItem({
              requester: dataForm.requestorId,
              title: dataForm.title,
              requestorBuId: dataForm.requestorBuId,
              requestTypeId: dataForm.requestTypeId,
              uploadedFiles: uploadFiles,
              items: appraisalSelected.map(it => it.id),
              buCode: buSelected
            })
            onClose?.()
            cb?.()
          } catch (error: any) {
            message.error(error.message || 'Failed to submit request.')
          }
        }
      })
    }
  }
  const addItemHandler=()=>{
    setAppraisalSubmitListModal({
      type:'appraisal-submit-list',
      required: true,
      async cb(selected) {
        setAppraisalSelected(v=> [...v,...selected])
        // setAppraisalSubmitListModal(undefined)
      }
    })
  }

  return <ProForm<DataFormType>
    form={form}
    width={1000}
    modalProps ={{
      maskClosable:false
    }}
    title="Appraisal Request Form"
    open={visisble}
    onFinish={onSaveHandler}
    onOpenChange={visible => !visible && onClose?.()}
    onValuesChange={async (changeValues) => {
      if ('requestTypeId' in changeValues) {
        try {
          const { requestTypeId } = changeValues
          setRequestType(requestSessions?.find(it=> it.value==requestTypeId))
        } catch (error: any) {
          message.error(error.message || 'Failed to fetch data.')
        }
      }
    }}
    submitter={{
      searchConfig: {
        submitText: 'Submit',
      },
      render(props, defaultDoms) {

        if (defaultDoms.length > 1) {
          return [
            defaultDoms[0],
            // <Button key={'reset-bt'} onClick={() => {
            //   const key = uniqueId('request-item')
            //   props.form?.resetFields()
            //   setForceClearUpload(v => v + 1)
            //   setUploadFiles([])
            //   setAppraisalSelected([])
            //   form.setFieldsValue({})
            // }}>Reset</Button>,
            defaultDoms[1],
          ]
        }
        else return defaultDoms
      },
    }}
  >
    <Space direction="vertical" style={{ width: '100%' }}>
      <Requestor onlyCurrentUser={true}  form={form} title="Requestor" />
      <ProFormText label= {<b>Title</b>} name='title' rules={[{required:true,message:'Title is required, and must be up to 250 characters',whitespace:true, max:255}]}/>
      {requestSessions&&<><ProFormRadio.Group disabled={(appraisalSelected?.length||0)>0} name={'requestTypeId'} label={<b>Request Type</b>} options={requestSessions} />
        <Alert type="info" message={requestType?.description} />
      </>}

      <ProCard size="small"
               title= {<>Appraisal List<span style={{color:'red'}}>*</span></>}
               bordered
               extra={<Button  icon={<PlusOutlined/>} onClick={addItemHandler}>Add</Button>}
      >
        <ProTable<AppraisalEmp> size="small"
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
                                dataSource={
                                  appraisalSelected?.sort((a,b)=> (a?.buName||'').localeCompare(b?.buName||'')?
                                    (a?.buName||'').localeCompare(b?.buName||''):(a?.departmentName||'').localeCompare(b?.departmentName||'')?
                                      (a?.departmentName||'').localeCompare(b?.departmentName||''):(a?.empName||'').localeCompare(b?.empName||'')
                                  )
                                }
                                columns={[
                                  {title:'Employee Name', dataIndex: 'empName'},
                                  {title:'Employee Name(KH)', dataIndex: 'internalName'},
                                  {title: 'Business Unit', dataIndex: 'buName'},
                                  {title: 'Function', dataIndex: 'departmentName'},
                                  {title: 'Job Title', dataIndex: 'jobTitle'},
                                  {title: 'Self- Rating', dataIndex: 'rating1'},
                                  {title: "Manager's Rating", dataIndex: 'rating3',
                                    render:(_,r)=> {
                                      return (r?.rating3==0 ?'-':  r?.rating3==-1.0 ?'-': r.rating3)
                                    }
                                  },
                                  // {title: 'Agreed Rating', dataIndex: 'rating5',
                                  //     render:(_,r)=>  !r?.rating5||r?.rating5==0 ?'-': r?.rating5
                                  // },
                                  {
                                    title:'Action',
                                    render:(_,r)=> <Button type="link" size="small" onClick={(v)=> setAppraisalSelected(v=> v.filter(it => it.id!=r.id))} icon ={<DeleteOutlined style={{width:14,color:"red"}}/>}></Button>
                                  }
                                ]}
        />
      </ProCard>
      <FileUploader
        title="Attachment"
        addFileInfo
        showTitle={true}
        required={false}
        key={forceClearUpload}
        multiple
        service="FILE"
        onSetFiles={files => {
          setUploadFiles(files.map(it => it.response))
        }}
      />
    </Space>
    {appraisalSubmitListModal?.type=='appraisal-submit-list' && <AppraisalSubmitListModal
      requestType = {requestType}
      open={true}
      onAdd={appraisalSubmitListModal.cb}
      dataFilter={appraisalSelected}
      onBuSelectedHandler={onBuSelectedHandler}
      buSelected={buSelected}
      onOpenChange={visible => !visible && setAppraisalSubmitListModal(undefined)}
    />
    }

  </ProForm>
}

