import { EditableFormInstance, EditableProTable, ProCard } from "@ant-design/pro-components"
import { useEffect, useRef, useState } from "react";
import { ProbationEvaluation } from "../data.types";
import { MinusCircleOutlined } from "@ant-design/icons";
import { Button, Radio } from "antd";
import { uniqueId } from "lodash";

interface Props {
    dataDetail?: string;
    addedItems: ProbationEvaluation[];
    onSetAddedItems?: (v: ProbationEvaluation[]) => void;
}
export default({dataDetail,addedItems, onSetAddedItems}: Props) => {


    const editableFormRef1 = useRef<EditableFormInstance>();
    // const [addedItems, setAddedItems] = useState<ProbationEvaluation[]>([]);
    const data = [{id:0,key:'dfsdf', assessment:'Learn about One More Group (OML) structures', target:'Learn about One More Group (OML) structures',
        rating5: 1
    }]
    useEffect(()=>{
        if(addedItems?.length==0){
        // setAddedItems(data)
        onSetAddedItems?.(data)
        }
    },[addedItems])

    return (<ProCard title={<b>SECTION II. JOB KNOWLEDGE AND SKILLS (Weightage: 20%)</b>} collapsible  size="small" bordered headerBordered >        
        <div style={{paddingTop:5}}>           
            <div>What relevant knowledge and skills that employee possesses and applies effectively in the job.</div>
        </div>
        <EditableProTable<ProbationEvaluation>
            bordered
            pagination={false}
            cardProps={false}
            editableFormRef={editableFormRef1}
            rowKey="key"
            editable={{
              type: 'multiple',
              editableKeys: addedItems?.map((it) => it.key),
              actionRender: (row) => [
                <Button
                  type="link"
                  danger
                  onClick={() => {
                   const list =addedItems?.filter((it) => it.key != row.key)
                    onSetAddedItems?.(list)
                    console.log('assessment list',addedItems)
                  }}
                  size="small"
                  icon={<MinusCircleOutlined />}
                />,
              ],
              onValuesChange: (_, recordList) => {  
                // alert('sdfsdf11111111111111111')             
                onSetAddedItems?.(
                  recordList.map((it) => ({
                    ...it,                   
                  })),
                );
              },
            }}
            recordCreatorProps={{
              creatorButtonText: 'Add',
              newRecordType: 'dataSource',
              // onClick: () => {
              //   // setSearcVisible(true);
              //   // alert(uuid().toString())
              //   setAddedItems(v=> [...v,{id:0,key: uuid().toString(),remark:'',assessment:'t',target:'test',rating3:1}])
              // },
              record: (index) => ({ key: uniqueId().toString() + index } as any),
            }}
            value={addedItems}
            columns={[
              { title: 'No', width: 20, editable: false, render: (_, __, index) => index + 1 },
              { title: 'ASSESSMENT',  
                // editable: false,
                dataIndex: 'assessment',
                valueType: 'textarea',
                fieldProps: { rows: 1, maxLength: 200 },
              },
              { title: 'TARGET',  
                // editable: false, 
                dataIndex: 'target',
                valueType: 'textarea',
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
                  renderFormItem(_, config, form,record) {
                    return (<Radio  
                      key={`checked-${config.record?.key}`}
                      checked={(config.record?.rating5==1)}
                      onChange={(e) => {                    
                        form.setFieldValue(config.record?.key || '', {
                          ...config.record,
                          rating5: e.target.checked?1:0,
                          rating4: 0,
                          rating3: 0,
                          rating2: 0,
                          rating1: 0,
                          checked: e.target.checked,
                      });
                    }}
                    />)
                  }
                },{
                  title: <span style={{fontSize:11}}>4- Exceeds Expectations</span>,                
                  dataIndex: 'rating4',
                  width: 70,
                  align:'center',
                  valueType: 'radio',        
                  renderFormItem(_, config, form) {
                    return (<Radio  
                      key={`checked-${config.record?.key}`}
                      checked={(config.record?.rating4==1)}
                      onChange={(e) => {                    
                        form.setFieldValue(config.record?.key || '', {
                          ...config.record,
                          rating4: e.target.checked?1:0,
                          rating5: 0,
                          rating3: 0,
                          rating2: 0,
                          rating1: 0,
                          checked: e.target.checked,
                      });
                    }}
                    />)
                  },
                },{
                  title: <span style={{fontSize:11}}>3- Meets Expectations</span>,    
                  valueType: 'radio',            
                  // editable: false,
                  dataIndex: 'rating3',
                  width: 70,
                  align:'center',
                  renderFormItem(_, config, form) {
                    return (<Radio  
                      key={`checked-${config.record?.key}`}
                      checked={(config.record?.rating3==1)}
                      onChange={(e) => {
                        // if (
                        //     e.target.checked &&
                        //     !itemTaken.some((it) => it == config.record?.itemId)
                        // ) {
                        //     setItemTaken([...itemTaken, config.record?.itemId || 0]);
                        // }
                        // if (!e.target.checked) {
                        //     setItemTaken(itemTaken.filter((it) => it != config.record?.itemId));
                        // }
                        // setAddedItems(r => r.map(it => {
                        //   if(it.key== config.record?.key){
                        //     return {...it,rating3: 1}
                        //   }else {
                        //     return it
                        //   }
                        // }))
                        // console.log('config.record',config.record)

                        form.setFieldValue(config.record?.key || '', {
                            ...config.record,
                            rating3: e.target.checked?1:0,
                            rating5: 0,
                            rating4: 0,
                            rating2: 0,
                            rating1: 0,
                            checked: e.target.checked,
                        });
                    }}
                    />)
                  },
                },{
                  title: <span style={{fontSize:11}}>1- Needs Improvement</span>,                
                  dataIndex: 'rating2',
                  width: 70,
                  align:'center',
                  valueType: 'radio',        
                  renderFormItem(_, config, form) {
                    return (<Radio  
                      key={`checked-${config.record?.key}`}
                      checked={(config.record?.rating2==1)}
                      onChange={(e) => {                    
                        form.setFieldValue(config.record?.key || '', {
                          ...config.record,
                          rating2: e.target.checked?1:0,
                          rating5: 0,
                          rating4: 0,
                          rating3: 0,
                          rating1: 0,
                          checked: e.target.checked,
                      });
                    }}
                    />)
                  },
                },{
                  title: <span style={{fontSize:11}}>1- Unsatisfactory</span>,                
                  dataIndex: 'rating1',
                  width: 102,
                  align:'center',
                  valueType: 'radio',        
                  renderFormItem(_, config, form) {
                    return (<Radio  
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
                    }}
                    />)
                  },
                }]              
              }, 
              {
                title: 'JUSTIFICATION',
                children:[{
                  width: '10%',
                  valueType: 'textarea',
                  dataIndex: 'remark',
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

          />        
    </ProCard>)
}