import { EditableFormInstance, EditableProTable, ProCard } from "@ant-design/pro-components"
import { useEffect, useRef, useState } from "react";
import { ProbationEvaluation } from "../data.types";
import { MinusCircleOutlined } from "@ant-design/icons";
import { Button, message, Radio, Table } from "antd";
import { round, uniqueId } from "lodash";
import { formatterQty1 } from "@/pages/utils";

interface Props {
    // dataDetail?: string;
    editableFormRef?: React.MutableRefObject<EditableFormInstance | undefined>|undefined
    addedItems: ProbationEvaluation[];
    onSetAddedItems?: (v: ProbationEvaluation[]) => void;
    editable: boolean|false;
    editableRating: boolean|false
    totalScore?: number
}
export default({editableFormRef,addedItems,onSetAddedItems,editable,editableRating,totalScore }: Props) => {

    const dataSection1 = [
      {id:0,key:'default1-1', assessment:'', target:''},
      {id:0,key:'default1-2', assessment:'', target:''},
      {id:0,key:'default1-3', assessment:'', target:''}
    ]
    useEffect(()=>{
        if(addedItems?.length==0){
          onSetAddedItems?.(dataSection1)
        }
    },[addedItems])

    const setRatingScore=(key?: string, rating1?: number, rating2?: number, rating3?: number, rating4?: number, rating5?: number)=>{
      onSetAddedItems?.(
        addedItems.map(it=> {
          if(it.key==key){
            return {
              ...it, 
              rating1: rating1,
              rating2: rating2,
              rating3: rating3,
              rating4: rating4,
              rating5: rating5
            }
          }
          return it
        })
      )
    }

  return (<><EditableProTable<ProbationEvaluation>
    bordered
    pagination={false}
    cardProps={false}
    formRef={editableFormRef}
    editableFormRef={editableFormRef}
    rowKey="key"
    editable={{
      type: 'multiple',
      editableKeys: addedItems?.map((it) => it.key),
      actionRender: (row, config) => [        
        (editable && !dataSection1.find(r => r.key== row.key) && ![1,2,3].find(i=> i==row.seqNo) && <Button
          type="link"
          danger
          onClick={() => {
            const list =addedItems?.filter((it) => it.key != row.key)
            onSetAddedItems?.(list)
          }}
          key={`del-${row.id}`}
          size="small"
          icon={<MinusCircleOutlined />}
        ></Button>),
      ],
      onValuesChange: (record, recordList) => {  
        if(addedItems.length< recordList.length){
          const newRecord = recordList.find(it=> !addedItems.find(r=> r.key==it.key))
          if(newRecord){
            onSetAddedItems?.(
              [...addedItems,{id:0,key: newRecord?.key}]//.map(it=> ({...it}))
            )
          }
        }else{   
          onSetAddedItems?.(
            addedItems.map((it) => {
              const edit = recordList.find(r=> r.key==it.key)
              if(edit){
                return {...it, assessment: edit.assessment,target: edit.target}
              }
              return it
            }),
          );
        }
      },
    }}
    recordCreatorProps={editable?{
      creatorButtonText: 'Add',
      newRecordType: 'dataSource',
      record: (index, datasource) => {
        const key = uniqueId().toString() + index
        // message.error(key)
        // if(addedItems.filter(it=> it.key!=key).length==0){
        //   message.error(key)
        // }
        // console.log('datasource11111:   ',datasource)
        // setAddNewItemKey(key)
        return({ key: key } as any)
      },
    }:false}
    value={addedItems}
    columns={[
      { title: 'No', width: 20, editable: false, render: (_, __, index) => index + 1 },
      { title: 'ASSESSMENT',  
        // editable: false,
        dataIndex: 'assessment',
        valueType: 'textarea',
        editable:(_,r) => editable, 
        formItemProps: {rules: [{ required: true}] },
        fieldProps: { rows: 1, maxLength: 200 },
      },
      { title: 'TARGET',  
        // editable: false, 
        dataIndex: 'target',
        valueType: 'textarea',
        editable:(_,r) => editable, 
        formItemProps: {rules: [{ required: true}] },
        fieldProps: { rows: 1, maxLength: 200 },
      },     
      {
        title: 'RATING SCORE',
        children:[{
          title: <span style={{fontSize:11}}>5- Outstanding</span>,
          dataIndex: 'rating5',
          width: 93,
          align:'center',
          valueType: 'radio',  
          // editable:(_,r) => editableRating,       
          renderFormItem(_, config, form,record) {
            return (editableRating?<Radio  
              key={`checked-${config.record?.key}`}
              checked={(config.record?.rating5==5)}
              onChange={(e) => {                    
                form.setFieldValue(config.record?.key || '', {
                  ...config.record,
                  rating5: e.target.checked?5:0,
                  rating4: 0,
                  rating3: 0,
                  rating2: 0,
                  rating1: 0,
                  checked: e.target.checked,
              });
              setRatingScore(config.record?.key,0,0,0,0,e.target.checked?5:0) 
            }}
            />:<Radio checked={(config.record?.rating5==5)}/>)
          }
        },{
          title: <span style={{fontSize:11}}>4- Exceeds Expectations</span>,                
          dataIndex: 'rating4',
          width: 70,
          align:'center',
          valueType: 'radio',    
          // editable:(_,r) => editableRating,     
          renderFormItem(_, config, form) {
            return (editableRating?<Radio  
              key={`checked-${config.record?.key}`}
              checked={(config.record?.rating4==4)}
              onChange={(e) => {                    
                form.setFieldValue(config.record?.key || '', {
                  ...config.record,
                  rating4: e.target.checked?4:0,
                  rating5: 0,
                  rating3: 0,
                  rating2: 0,
                  rating1: 0,
                  checked: e.target.checked,
              });
              setRatingScore(config.record?.key,0,0,0,e.target.checked?4:0,0) 
            }}
            />:<Radio checked={(config.record?.rating4==4)}/>)
          },
        },{
          title: <span style={{fontSize:11}}>3- Meets Expectations</span>,    
          // editable: false,
          dataIndex: 'rating3',
          width: 70,
          align:'center',
          valueType: 'radio',     
          // editable:(_,r) => editableRating,        
          renderFormItem(_, config, form) {
            return (editableRating?<Radio  
              key={`checked-${config.record?.key}`}
              checked={(config.record?.rating3==3)}
              onChange={(e) => {                
                form.setFieldValue(config.record?.key || '', {
                    ...config.record,
                    rating3: e.target.checked?3:0,
                    rating5: 0,
                    rating4: 0,
                    rating2: 0,
                    rating1: 0,
                    checked: e.target.checked,
                });
                setRatingScore(config.record?.key,0,0,e.target.checked?3:0,0,0)    
            }}
            />:<Radio checked={(config.record?.rating3==3)}/>)
          },
        },{
          title: <span style={{fontSize:11}}>2- Needs Improvement</span>,                
          dataIndex: 'rating2',
          width: 70,
          align:'center',
          valueType: 'radio', 
          // editable:(_,r) => editableRating,        
          renderFormItem(_, config, form) {
            return (editableRating?<Radio  
              key={`checked-${config.record?.key}`}
              checked={(config.record?.rating2==2)}
              onChange={(e) => {                    
                form.setFieldValue(config.record?.key || '', {
                  ...config.record,
                  rating2: e.target.checked?2:0,
                  rating5: 0,
                  rating4: 0,
                  rating3: 0,
                  rating1: 0,
                  checked: e.target.checked,
              });
              setRatingScore(config.record?.key,0,e.target.checked?2:0,0,0,0)    
            }}
            />:<Radio checked={(config.record?.rating2==2)}/>)
          },
        },{
          title: <span style={{fontSize:11}}>1- Unsatisfactory</span>,                
          dataIndex: 'rating1',
          width: 102,
          align:'center',
          valueType: 'radio',  
          // editable:(_,r) => editableRating,       
          renderFormItem(_, config, form) {
            return (editableRating?<Radio  
              key={`checked-${config.record?.key}`}
              checked={(config.record?.rating1==1)}
              onChange={(e) => {                    
                form.setFieldValue(config.record?.key || '', {
                  ...config.record,
                  rating1: e.target.checked?1:0,
                  rating5: 0,
                  rating4: 0,
                  rating3: 0,
                  rating2: 0,
                  checked: e.target.checked,
              });
              setRatingScore(config.record?.key,e.target.checked?1:0,0,0,0,0)             
            }}
            />:<Radio checked={(config.record?.rating1==1)}/>)
          },
        }]              
      }, 
      {
        title: 'JUSTIFICATION',
        children:[{
          width: '10%',
          valueType: 'textarea',
          dataIndex: 'remark',
          editable:(_,r) => editable, 
          fieldProps: { rows: 1, maxLength: 200 },
        }]
      
      }, 
      {
        valueType: 'option',
        width: 50,
        render: () => {
          return null;
        },
      },  
    ]}
    summary={(data) => {
      return (
        <Table.Summary.Row style={{ textAlign: 'right', fontWeight: 'bold' }}>
          <Table.Summary.Cell colSpan={8} index={8}>
            {'SECTION I. PERFORMANCE (Weightage: 50%)'}
          </Table.Summary.Cell>
          <Table.Summary.Cell colSpan={2} index={9} align="left">
            {formatterQty1.format(totalScore || 0)}
          </Table.Summary.Cell>
        </Table.Summary.Row>
      );
    }}

  /> </>)
}