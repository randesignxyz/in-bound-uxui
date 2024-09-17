import { EditableFormInstance, EditableProTable, ProColumns } from "@ant-design/pro-components"
import { useEffect } from "react";
import { ProbationEvaluation, ProbationEvaluationResourcesSupport } from "../data.types";
import { MinusCircleOutlined } from "@ant-design/icons";
import { Button, Radio } from "antd";
import { partial, uniqueId } from "lodash";

interface Props {
    dataDetail?: string;
    editableFormRef?: React.MutableRefObject<EditableFormInstance | undefined>|undefined
    addedItems: ProbationEvaluationResourcesSupport[];
    onSetAddedItems?: (v: ProbationEvaluationResourcesSupport[]) => void;
    editable: boolean|false;
    editableRating: boolean|false
}
export default({editableFormRef, dataDetail,addedItems, onSetAddedItems,editable, editableRating }: Props) => {
    
    const  cols: ProColumns<ProbationEvaluationResourcesSupport>[] = [
      { title: 'No', width: 20, editable: false, render: (_, __, index) => index + 1 },
      { title: 'ASSESSMENT',  
        // editable: false,
        dataIndex: 'assessment',
        valueType: 'textarea',
        editable:(_,r) => editable, 
        formItemProps: {rules: [{ required: true}] },
        fieldProps: { rows: 1, maxLength: 200 },
        render: (_, r) => {
          return (<div>
            <div>{r?.title}</div>
            {r?.description?.split('/r/n').map(r => 
               <div style={{fontSize:12}}>• {r}</div>
            )}
          </div>)
        },
      },    
      {
        title: 'RATING SCORE',
        children:[{
          title: <span style={{fontSize:11}}>Fully Done</span>,
          dataIndex: 'rating5',
          width: 93,
          align:'center',
          valueType: 'radio',  
          editable:(_,r) => editableRating, 
          renderFormItem(_, config, form,record) {
            return editableRating?(<Radio  
              key={`checked-${config.record?.key}`}
              checked={(config.record?.fully==1)}
              onChange={(e) => {                    
                form.setFieldValue(config.record?.key || '', {
                  ...config.record,
                  fully: e.target.checked?1:0,
                  partial: 0,
                  no: 0,                  
                  checked: e.target.checked,
              });
            }}
            />):(<Radio key={`checked1-${config.record?.key}`} checked={(config.record?.fully==1)}/>)
          }
        },{
          title: <span style={{fontSize:11}}>Partially Done</span>,                
          dataIndex: 'rating4',
          width: 100,
          align:'center',
          valueType: 'radio',  
          editable:(_,r) => editableRating, 
          renderFormItem(_, config, form) {
            return editableRating?(<Radio  
              key={`checked-${config.record?.key}`}
              checked={(config.record?.partial==1)}
              onChange={(e) => {                    
                form.setFieldValue(config.record?.key || '', {
                  ...config.record,
                  partial: e.target.checked?1:0,
                  fully: 0,
                  no: 0,
                  checked: e.target.checked,
              });
            }}
            />):(<Radio key={`checked1-${config.record?.key}`} checked={(config.record?.partial==1)}/>)
          },
        },{
          title: <span style={{fontSize:11}}>No</span>,    
          valueType: 'radio',            
          editable:(_,r) => editableRating, 
          dataIndex: 'rating3',
          width: 70,
          align:'center',
          renderFormItem(_, config, form) {
            return editableRating?(<Radio  
              key={`checked-${config.record?.key}`}
              checked={(config.record?.no==1)}
              onChange={(e) => {
                form.setFieldValue(config.record?.key || '', {
                    ...config.record,
                    no: e.target.checked?1:0,
                    fully: 0,
                    partial: 0,
                    checked: e.target.checked,
                });
              }}
            />):(<Radio key={`checked1-${config.record?.key}`} checked={(config.record?.no==1)}/>)
          },
        }]              
      },
      // {
      //   valueType: 'option',
      //   width: 50,
      //   render: () => {
      //     return null;
      //   },
      // },  
    ]

    cols.push({
      title:'Rating',
      valueType: 'radio', 
      render:(r)=>{
        return (<Radio checked></Radio>)
      }
    })

  return (<EditableProTable<ProbationEvaluationResourcesSupport>
    bordered
    pagination={false}
    cardProps={false}
    formRef={editableFormRef}
    editableFormRef={editableFormRef}
    rowKey="key"
    editable={{
      type: 'multiple',
      editableKeys: addedItems?.map((it) => it.key||uniqueId.toString()),
      actionRender: (row) => [
        (!addedItems.find(r => r.key== row.key) &&
        <Button
          type="link"
          danger
          onClick={() => {
            const list =addedItems?.filter((it) => it.key != row.key)
            // onSetAddedItems?.(list)
            console.log('assessment list',addedItems)
          }}
          size="small"
          icon={<MinusCircleOutlined />}
        />),
      ],
      onValuesChange: (_, recordList) => {  
           console.log(recordList)
        // onSetAddedItems?.(
        //   recordList.map((it) => ({
        //     ...it,                   
        //   })),
        // );
      },
    }}
    recordCreatorProps={false}
    // recordCreatorProps={{
    //   creatorButtonText: 'Add',
    //   newRecordType: 'dataSource',     
    //   record: (index) => ({ key: uniqueId().toString() + index } as any),
    // }}
    value={addedItems}
    columns={cols}
  />)
}