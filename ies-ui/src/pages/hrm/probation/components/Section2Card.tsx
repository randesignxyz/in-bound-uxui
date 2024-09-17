import { EditableFormInstance, EditableProTable, ProColumns } from "@ant-design/pro-components"
import { useEffect } from "react";
import { ProbationEvaluation } from "../data.types";
import { MinusCircleOutlined } from "@ant-design/icons";
import { Button, Radio } from "antd";
import { uniqueId } from "lodash";

interface Props {
    dataDetail?: string;
    editableFormRef?: React.MutableRefObject<EditableFormInstance | undefined>|undefined
    addedItems: ProbationEvaluation[];
    onSetAddedItems?: (v: ProbationEvaluation[]) => void;
    editable: boolean|false;
    editableRating: boolean|false
}
export default({editableFormRef, dataDetail,addedItems, onSetAddedItems,editable, editableRating }: Props) => {

    const data = [
      {id:0,key: 'default-1' , assessment:'',  target:'',},
      {id:0,key: 'default-2' , assessment:'', target:'',},
      {id:0,key: 'default-3' , assessment:'', target:'',}
    ]
    useEffect(()=>{
      if(addedItems?.length==0){
        onSetAddedItems?.(data)
      }
    },[addedItems])

    const  cols: ProColumns<ProbationEvaluation>[] = [
      { title: 'No', width: 20, editable: false, render: (_, __, index) => index + 1 },
      { title: 'ASSESSMENT',  
        // editable: false,
        dataIndex: 'assessment',
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
          editable:(_,r) => editableRating, 
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
          editable:(_,r) => editableRating, 
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
          editable:(_,r) => editableRating, 
          dataIndex: 'rating3',
          width: 70,
          align:'center',
          renderFormItem(_, config, form) {
            return (<Radio  
              key={`checked-${config.record?.key}`}
              checked={(config.record?.rating3==1)}
              onChange={(e) => {
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
          editable:(_,r) => editableRating,       
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
          editable:(_,r) => editableRating,         
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
    ]

  return (<EditableProTable<ProbationEvaluation>
    bordered
    pagination={false}
    cardProps={false}
    formRef={editableFormRef}
    editableFormRef={editableFormRef}
    rowKey="key"
    editable={{
      type: 'multiple',
      editableKeys: addedItems?.map((it) => it.key),
      actionRender: (row) => [
        (!data.find(r => r.key== row.key) &&
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
        />),
      ],
      onValuesChange: (_, recordList) => {           
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
      record: (index) => ({ key: uniqueId().toString() + index } as any),
    }}
    value={addedItems}
    columns={cols}
  />)
}