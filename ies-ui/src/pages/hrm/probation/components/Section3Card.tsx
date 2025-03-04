import { EditableFormInstance, EditableProTable, ProColumns } from "@ant-design/pro-components"
import { useEffect } from "react";
import { ProbationEvaluation, ProbationEvaluationResources } from "../data.types";
import { MinusCircleOutlined } from "@ant-design/icons";
import { Button, Radio, Table } from "antd";
import { round, uniqueId } from "lodash";
import { formatterQty1 } from "@/pages/utils";

interface Props {
    dataDetail?: string;
    editableFormRef?: React.MutableRefObject<EditableFormInstance | undefined>|undefined
    addedItems: ProbationEvaluationResources[];
    onSetAddedItems?: (v: ProbationEvaluationResources[]) => void;
    editable: boolean|false;
    editableRating: boolean|false
    totalScore?: number
    showRating?: boolean
}
export default({editableFormRef, dataDetail,addedItems, onSetAddedItems,editable, editableRating, totalScore,showRating=true }: Props) => {

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

    const  cols: ProColumns<ProbationEvaluationResources>[] = [
      { title: 'No', width: 20, editable: false, render: (_, __, index) => index + 1 },
      { title: 'ASSESSMENT',  
        // editable: false,
        dataIndex: 'assessment',
        valueType: 'textarea',
        editable:(_,r) => editable, 
        formItemProps: {rules: [{ required: true}] },
        fieldProps: { rows: 1, maxLength: 5000 },
        render: (_, r) => {
          return (<div>
            <div>{r?.title}</div>
            {r?.description?.split('/r/n').map(r => 
               <div style={{fontSize:12}}>• {r}</div>
            )}
          </div>)
        },
      }
    ]
    if(showRating){
      cols.push({
        title: 'RATING SCORE',
        children:[{
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
          title: <span style={{fontSize:11}}>3- Meets Expectations</span>,    
          valueType: 'radio',            
          // editable:(_,r) => editableRating, 
          dataIndex: 'rating3',
          width: 70,
          align:'center',
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
        }]              
      }, 
      {
        title: 'JUSTIFICATION',
        children:[{
          dataIndex: 'remark',
          width: '10%',
          valueType: 'textarea',
          editable:(_,r) => editableRating, 
          formItemProps: {rules: [{ required: true}] },
          fieldProps: { rows: 1, maxLength: 5000 },
        }]
      
      })
    }
    // cols.push({
    //   valueType: 'option',
    //   width: 50,
    //   render: () => {
    //     return null;
    //   }
    // })

  return (<>
  <div>
      <div style={{paddingTop:5}}>
      <div><b>SECTION III. BEHAVIOR (Weightage: 30%)</b></div>
      <div>How employee is expected to behave in a proper manner.</div>
      </div>
  </div>
  <EditableProTable<ProbationEvaluationResources>
    bordered
    pagination={false}
    cardProps={false}
    formRef={editableFormRef}
    editableFormRef={editableFormRef}
    rowKey="key"
    editable={{
      type: 'multiple',
      editableKeys: addedItems?.map((it) => it.key||uniqueId.toString()),
      // actionRender: (row) => [
      //   (!addedItems.find(r => r.key== row.key) &&
      //   <Button
      //     type="link"
      //     danger
      //     onClick={() => {
      //       // const list =addedItems?.filter((it) => it.key != row.key)
      //       // onSetAddedItems?.(list)
      //       console.log('assessment list',addedItems)
      //     }}
      //     size="small"
      //     icon={<MinusCircleOutlined />}
      //   />),
      // ],
      onValuesChange: (_, recordList) => {           
        onSetAddedItems?.(
          addedItems.map((it) => {
            const edit = recordList.find(r=> r.key==it.key)
            if(edit){
              return {...it, remark: edit?.remark}
            }
            return it
          }),
        );
      },
    }}
    // recordCreatorProps={{
    //   creatorButtonText: 'Add',
    //   newRecordType: 'dataSource',     
    //   record: (index) => ({ key: uniqueId().toString() + index } as any),
    // }}
    recordCreatorProps={false}
    value={addedItems}
    columns={cols}
    summary={(data) => {
      var rating = 0;
      data?.forEach((it) => {
        rating += (it.rating1||0) +  (it.rating2||0) +  (it.rating3||0) +  (it.rating4||0) +  (it.rating5||0)
      });
      rating = (rating / data.length)*0.3
      return showRating &&(
        <Table.Summary.Row style={{ textAlign: 'right', fontWeight: 'bold' }}>
          <Table.Summary.Cell colSpan={7} index={7}>
            {'SECTION III. BEHAVIOR (Weightage: 30%)'}
          </Table.Summary.Cell>
          <Table.Summary.Cell colSpan={2} index={8} align="left">
            {formatterQty1.format(totalScore || rating)}
          </Table.Summary.Cell>
        </Table.Summary.Row>
      );
    }}
  /></>)
}