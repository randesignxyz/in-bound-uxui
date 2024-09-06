import { Button, Col, FormInstance, RadioChangeEvent, Row } from 'antd';
import { AppraisalRemark, AppraisalEmp, AppraisalStyle, AppraisalEmpSubmissionResult, AppraisalOverallPerformanceRating, AppraisalEmpImprovement, AppraisalDataLookup } from "../data.types"
import { Radio,Checkbox, Space, Spin, Table, message } from "antd"
import { EditableFormInstance, EditableProTable, ProCard, ProDescriptions, ProForm, ProFormTextArea, ProList, ProTable } from "@ant-design/pro-components"
import { AttachmentFile } from '@/services/data';
import { useEffect, useState } from 'react';
import { DeleteOutlined, FileOutlined,  PaperClipOutlined,  StarTwoTone } from '@ant-design/icons';
import { downloadUploadFileV2 } from '@/services/apiGateway';
import { simpleRequestActions } from '@/services/model';
import { FileServiceAPI } from '@/services/files/service';
import { round, uniqueId } from 'lodash';
import { createService } from '../services';
import AppraisalInstruction from './AppraisalInstruction';
import OveralPerformance from './OveralPerformance';
import moment from 'moment';
import AttachedFileListCRUD from '@/components/Attachment/AttachedFileListCRUD';
import { useModel } from '@umijs/max';

export interface Props{
  loading?: boolean ,
  actions?: {isSaveDraft: boolean; isSubmitForm: boolean}
  onChangeLanglauge:()=>void
  dataLookup?: AppraisalDataLookup[]
  lang?:string 
  appraisalEmp?: AppraisalEmp
  form?: FormInstance<AppraisalRemark>
  initialValues?:AppraisalRemark
  appraisal?:AppraisalEmpSubmissionResult[] 
  onSetRatingScoreHandler:(status:string,appraisalDimensionId: number,appraisalBehaviorId:number,rating:number)=>void
  editableImprovementRated1FormRef?:  React.Ref<EditableFormInstance<AppraisalEmpImprovement&{key:string}> | undefined>
  improvementRated1?:(AppraisalEmpImprovement & {key:string})[]
  onSetImprovementRated1?:(list:(AppraisalEmpImprovement&{key:string})[])=>void
  editableImprovementRated2FormRef?:  React.Ref<EditableFormInstance<AppraisalEmpImprovement&{key:string}> | undefined>
  improvementRated2?:(AppraisalEmpImprovement & {key:string})[]
  onSetImprovementRated2?:(list:(AppraisalEmpImprovement&{key:string})[])=>void
  editableImprovementRated3FormRef?:  React.Ref<EditableFormInstance<AppraisalEmpImprovement&{key:string}> | undefined>
  improvementRated3?:(AppraisalEmpImprovement & {key:string})[]
  onSetImprovementRated3?:(list:(AppraisalEmpImprovement&{key:string})[])=>void
  attachedFiles?:string[]
  onUploadFileIdHandler?: (fileId: string) => void;
  onRemoveFileIdHandler?: (fileId: string) => void;
}

export default ({
  lang,
  actions,
  onChangeLanglauge,
  dataLookup,
  loading,
  appraisalEmp, 
  form,initialValues,
  appraisal,
  improvementRated1,
  editableImprovementRated1FormRef,
  onSetImprovementRated1,
  onSetRatingScoreHandler,
  improvementRated2,
  editableImprovementRated2FormRef,
  onSetImprovementRated2,
  improvementRated3,
  editableImprovementRated3FormRef,
  onSetImprovementRated3,
  attachedFiles,
  onUploadFileIdHandler,
  onRemoveFileIdHandler
 
}:Props) => {
    const requestActions = simpleRequestActions()
    const fielServices = FileServiceAPI(requestActions);
    const currentUser =  useModel('@@initialState');

    const currentDrafted = appraisalEmp?.currentDrafted
    const isDrafted = appraisalEmp?.actionStatus==='DRAFTED'?true:false
    const currentAssign1 = appraisalEmp?.currentAssign1||false
    const currentAssign2 = appraisalEmp?.currentAssign2||false
    const currentAssign3 = appraisalEmp?.currentAssign3||false
    const hasRating2 = appraisalEmp?.hasRating2||false
    const rated1 = appraisalEmp?.rated1
    const rated2 = appraisalEmp?.rated2
    const rated3 = appraisalEmp?.rated3

    const rating1Editable = (currentAssign1 && (currentDrafted || !rated1)) ? true:false
    const rating2Editable = (currentAssign2 && (currentDrafted || !rated2)) ? true:false
    const rating3Editable = (currentAssign3 && (currentDrafted || !rated3))? true:false
   
    
    const onChange1 = (e: RadioChangeEvent,r:AppraisalEmpSubmissionResult) => {
      var rating = e.target.value
      onSetRatingScoreHandler('r1',r.appraisalDimensionId,r.appraisalBehaviorId,rating)
    }
    const onChange2 = (e: RadioChangeEvent,r:AppraisalEmpSubmissionResult) => {
      var rating = e.target.value 
      onSetRatingScoreHandler('r2',r.appraisalDimensionId,r.appraisalBehaviorId,rating)
    }
    const onChange3 = (e: RadioChangeEvent,r:AppraisalEmpSubmissionResult) => {
      var rating = e.target.value 
      onSetRatingScoreHandler('r3',r.appraisalDimensionId,r.appraisalBehaviorId,rating)
    }    
    
    const getLable=(key:string)=>{
      var label = dataLookup?.find(it=> (it.code===key))
      return lang=='KH'?label?.value1:label?.value
    }
    const rowColr = AppraisalStyle.color1
    const color3 = AppraisalStyle.color3
    const border = `solid ${color3} 1px`

    /* PERFORMANCE ------------------------------------------------ */
    const columns = [
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
          return ((r?.rating3>0 && currentAssign3)||(r?.rating2>0 && (hasRating2 && (currentAssign2 || currentAssign3)))||r?.rating1>0)?<b>{behaviorDescription}</b>:behaviorDescription
        },
        onCell:(record:any)=>({style: record.sort%2===0?{ background:rowColr,border:border}:{border:border}})
      },{
        title: getLable('TBL_RATING1'),
        width: '9%',     
        render:(r:any)=> <Radio value={r.behaviorRate}  checked={(r.behaviorRate===r.rating1)?true:false} onChange={(e)=>rating1Editable&&onChange1(e,r)}/>,
        onCell:(record:any)=>({style: record.sort%2===0?{ background:rowColr, textAlign:'center',border:border}:{ textAlign:'center',border:border}})
      }
    ] 

   // FM's Rating 
  //  if(hasRating2 && (currentAssign2 || currentAssign3 || (rated3 && !isDrafted))){
    if(hasRating2 && (currentAssign2 || currentAssign3)){
      columns.push({
        title: getLable('TBL_RATING2'),
        width: '8%',     
        render:(r:any)=> <Radio value={r.behaviorRate}  checked={r.behaviorRate===r.rating2}  onChange={(e)=> rating2Editable&&onChange2(e,r)}/>,
        onCell:(record:any)=>({style: record.sort%2===0?{ background:rowColr, textAlign:'center',border:border}:{textAlign:'center',border:border}})
      })
    }

    //MBO's Rating
    // if(currentAssign3 || (rated3 && !isDrafted)){
    if(currentAssign3){
      columns.push({
        title: getLable('TBL_RATING5'),
        width: '8%',     
        render:(r:any)=> <Radio value={r.behaviorRate}  checked={r.behaviorRate===r.rating3}  onChange={(e)=> rating3Editable&&onChange3(e,r)}/>,
        onCell:(record:any)=>({style: record.sort%2===0?{ background:rowColr, textAlign:'center',border:border}:{ textAlign:'center',border:border}})
      })
    }

    return <Spin spinning={loading}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <AppraisalInstruction lang={lang} onChangeLanglauge={onChangeLanglauge} getLableName={(key:string)=>getLable(key)} appraisalPerformanceId={appraisalEmp?.appraisalPerformanceId||-1}/>
          <ProTable<AppraisalEmpSubmissionResult>  bordered 
            loading = {loading}
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
            columns={columns} 
            style={{padding:0, width:'100%'}}
            summary={(data) => {
              var rating1 = 0,
                  rating2 = 0,
                  rating3 = 0

              data?.forEach(it => {
                rating1 = rating1+ round(it.rating1*it.weight,2)
                rating2 = rating2+ round(it.rating2*it.weight,2)
                rating3 = rating3+ round(it.rating3*it.weight,2)
              }) 
             
              return <Table.Summary.Row style={{ textAlign: 'right', fontWeight: 'bold',border:border }}>
                <Table.Summary.Cell colSpan={2} index={2}>{getLable('LABEL_TOTAL_SCORE')}</Table.Summary.Cell>
                <Table.Summary.Cell index={4} align='center'>{ round(rating1,2) || 0}</Table.Summary.Cell>
                {/*(hasRating2 && (currentAssign2 || currentAssign3 || (rated3 && !isDrafted))) && <Table.Summary.Cell index={4} align='center'>{(currentAssign2 || currentAssign3)? round(rating2,2):'-'}</Table.Summary.Cell>*/}
                {/*(currentAssign3 || (rated3 && !isDrafted))&&<Table.Summary.Cell index={4} align='center'>{ round(rating3,2) || 0}</Table.Summary.Cell>*/}
                {(hasRating2 && (currentAssign2 || currentAssign3)) && <Table.Summary.Cell index={4} align='center'>{(currentAssign2 || currentAssign3)? round(rating2,2):'-'}</Table.Summary.Cell>}
                {(currentAssign3 )&&<Table.Summary.Cell index={4} align='center'>{ round(rating3,2) || 0}</Table.Summary.Cell>}
              </Table.Summary.Row>
            }}
          />
          <OveralPerformance lang={lang} getLableName={getLable} appraisalPerformanceId={appraisalEmp?.appraisalPerformanceId||-1}/>  
          <ProForm<AppraisalRemark>
            form={form}
            submitter={false}
            initialValues={initialValues}
          > 
            <Space direction="vertical" style={{ width: '100%' }}>  
              <ProCard size="small" style={{height:'100%'}} headerBordered bordered title={<b>{getLable('TITLE_EMP_COMMENT')}<span style={{color:'red'}}>*</span></b>}>
                <ProFormTextArea name={'empComment'} readonly={!rating1Editable}  rules={[{ required: true }]}/>               
                  {improvementRated1&&<EditableProTable<AppraisalEmpImprovement & {key:string}> 
                        style={{padding:0,margin:0}}
                        cardProps = {false}
                        size="small"
                        rowKey="key"
                        controlled
                        editableFormRef={editableImprovementRated1FormRef}
                        value={improvementRated1}
                        maxLength={5}
                        columns={[
                          {
                            title: <b>{currentAssign1? getLable('TITLE_EMP_EM_MY_AREA_IMPROVEMENT'):getLable('TITLE_EMP_EM_HIS_AREA_IMPROVEMENT')}<span style={{color:'red'}}>*</span></b>, valueType: 'textarea', width: 300, dataIndex: 'improvement',
                            formItemProps: {                                                       
                              rules: [{ required: true, message: undefined, whitespace: true, transform:(v)=>v.trim()}], 
                            },
                            fieldProps:{placeholder:'', maxLength: 500,}
                          },{
                            title: <b>{currentAssign1? getLable('TITLE_EMP_EM_MY_IMPROVEMENT_ACTION'):getLable('TITLE_EMP_EM_HIS_IMPROVEMENT_ACTION')}<span style={{color:'red'}}>*</span></b>, valueType: 'textarea', width: 300, dataIndex: 'propose',
                            formItemProps: {                                
                              rules: [{ required: true, message: undefined, whitespace: true, transform:(v)=>v.trim()}], 
                            },
                            fieldProps:{placeholder:'', maxLength: 500,}
                          },
                          { valueType: 'option', width: 18, render: () => { return null; }, },
                        ]}
                        recordCreatorProps={{
                          hidden: !rating1Editable,
                          creatorButtonText:  getLable('BTN_ADD_MORE'), 
                          newRecordType: 'dataSource',
                          record: (index) => {
                            const key = uniqueId('appraisal_emp_improvement_rating1')
                            return { key: key + index, id: 0,appraisalEmpId: appraisalEmp?.id,implement:null,propose:null,refCode:'r1' } as any;
                          },
                        }}
                        editable={{
                          type: 'multiple',
                          editableKeys: rating1Editable?improvementRated1?.map(it => it.key):[],
                          actionRender: (row, config) => [  improvementRated1?.find(it => it)?.key != row.key && <Button  size='small' danger onClick={() => {                            
                            config.onDelete?.(config.recordKey, row)
                          }} type="link" key={`del-${row.id}`} icon={<DeleteOutlined size={3}/>}/>],
                          onValuesChange(record, data) {
                            onSetImprovementRated1?.(data)
                          },
                        }}
                      />}
              </ProCard> 
              {hasRating2 && (currentAssign2 || currentAssign3 || (rated3 && !isDrafted)) &&<ProCard size="small" style={{height:'100%'}} headerBordered bordered title={<b>{getLable('TITLE_FM_COMMENT')}<span style={{color:'red'}}>*</span></b>}>
                <ProFormTextArea name={'rating2Comment'} readonly={!rating2Editable}  rules={[{ required: true }]}/>
                <EditableProTable<AppraisalEmpImprovement & {key:string}> 
                  style={{padding:0,margin:0}}
                  cardProps = {false}
                  size="small"
                  rowKey="key"
                  controlled
                  editableFormRef={editableImprovementRated2FormRef}
                  value={improvementRated2}
                  maxLength={5}
                  columns={[
                    {
                      title: <b>{currentAssign1?getLable('TITLE_EMP_EM_MY_AREA_IMPROVEMENT'):getLable('TITLE_EMP_EM_HIS_AREA_IMPROVEMENT')} <span style={{color:'red'}}>*</span></b>, valueType: 'textarea', width: 300, dataIndex: 'improvement',
                      formItemProps: {                                                       
                        rules: [{ required: true, message: undefined, whitespace: true, transform:(v)=>v.trim()}], 
                      },
                      fieldProps:{placeholder:'', maxLength: 500,}
                    },{
                      title: <b>{currentAssign1?getLable('TITLE_EMP_EM_MY_IMPROVEMENT_ACTION'):getLable('TITLE_EMP_EM_HIS_IMPROVEMENT_ACTION')}<span style={{color:'red'}}>*</span></b>, valueType: 'textarea', width: 300, dataIndex: 'propose',
                      formItemProps: {                                
                        rules: [{ required: true, message: undefined, whitespace: true, transform:(v)=>v.trim()}], 
                      },
                      fieldProps:{placeholder:'', maxLength: 500,}
                    },
                    { valueType: 'option', width: 18, render: () => { return null; }, },
                  ]}
                  recordCreatorProps={{
                    hidden: !rating2Editable,
                    creatorButtonText: getLable('BTN_ADD_MORE'), 
                    newRecordType: 'dataSource',
                    record: (index) => {
                      const key = uniqueId('appraisal_emp_improvement_rating1')
                      return { key: key + index, id: 0,appraisalEmpId: appraisalEmp?.id,implement:null,propose:null,refCode:'r1' } as any;
                    },
                  }}
                  editable={{
                    type: 'multiple',
                    editableKeys: rating2Editable?improvementRated2?.map(it => it.key):[],
                    actionRender: (row, config) => [  improvementRated2?.find(it => it)?.key != row.key && <Button  size='small' danger onClick={() => {                            
                      config.onDelete?.(config.recordKey, row)
                    }} type="link" key={`del-${row.id}`} icon={<DeleteOutlined size={3}/>}/>],
                    onValuesChange(record, data) {
                      onSetImprovementRated2?.(data)
                  },
                  }}
                />
              </ProCard>} 
              {(rating3Editable || rated3)&&<ProCard size="small" style={{height:'100%'}} headerBordered bordered title={<b>{getLable('TITLE_AGREED_COMMENT')}<span style={{color:'red'}}>*</span></b>}>
                <ProFormTextArea name={'rating3Comment'} readonly={!rating3Editable}  rules={[{ required: true }]}/>
                {!hasRating2&&<EditableProTable<AppraisalEmpImprovement & {key:string}> 
                  style={{padding:0,margin:0}}
                  cardProps = {false}
                  size="small"
                  rowKey="key"
                  controlled
                  editableFormRef={editableImprovementRated3FormRef}
                  value={improvementRated3}
                  maxLength={5}
                  columns={[
                    {
                      title: <b>{currentAssign1?getLable('TITLE_EMP_EM_MY_AREA_IMPROVEMENT'):getLable('TITLE_EMP_EM_HIS_AREA_IMPROVEMENT')}<span style={{color:'red'}}>*</span></b>, valueType: 'textarea', width: 300, dataIndex: 'improvement',
                      formItemProps: {                                                       
                        rules: [{ required: true, message: undefined,  whitespace: true, transform:(v)=>v.trim()}], 
                      },
                      fieldProps:{placeholder:'', maxLength: 500,}
                    },{
                      title: <b>{currentAssign1?getLable('TITLE_EMP_EM_MY_IMPROVEMENT_ACTION'):getLable('TITLE_EMP_EM_HIS_IMPROVEMENT_ACTION')}<span style={{color:'red'}}>*</span></b>, valueType: 'textarea', width: 300, dataIndex: 'propose',
                      formItemProps: {                                
                        rules: [{ required: true, message: undefined,  whitespace: true, transform:(v)=>v.trim()}], 
                      },
                      fieldProps:{placeholder:'', maxLength: 500,}
                    },
                    { valueType: 'option', width: 18, render: () => { return null; }, },
                  ]}
                  recordCreatorProps={{
                    hidden: !rating3Editable,
                    creatorButtonText:  getLable('BTN_ADD_MORE'), 
                    newRecordType: 'dataSource',
                    record: (index) => {
                      const key = uniqueId('appraisal_emp_improvement_rating1')
                      return { key: key + index, id: 0,appraisalEmpId: appraisalEmp?.id,implement:null,propose:null,refCode:'r1' } as any;
                    },
                  }}
                  editable={{
                    type: 'multiple',
                    editableKeys: rating3Editable?improvementRated3?.map(it => it.key):[],
                    actionRender: (row, config) => [  improvementRated3?.find(it => it)?.key != row.key && <Button  size='small' danger onClick={() => {                            
                      config.onDelete?.(config.recordKey, row)
                    }} type="link" key={`del-${row.id}`} icon={<DeleteOutlined size={3}/>}/>],
                    onValuesChange(record, data) {
                      onSetImprovementRated3?.(data)
                  },
                  }}
                />}
              </ProCard>}
            </Space> 
          </ProForm>
          
          {attachedFiles&&<AttachedFileListCRUD
                    readonly = {!actions?.isSaveDraft}
                    removeButton = {currentAssign1||currentAssign2||currentAssign3}
                    removeAbleButtom={(createdBy:string)=> createdBy=== currentUser.initialState?.currentUser?.login}
                    initFiles={attachedFiles?.map((it:any)=> {return {'fileId':it,'activity':''}})||[]}            
                    onUploadFileId={async file=>{
                        onUploadFileIdHandler?.(file)
                    }}
                    onRemoveFileId={async fileId => {    
                        onRemoveFileIdHandler?.(fileId)                
                    }}
                />}
        </Space>
    </Spin>
}