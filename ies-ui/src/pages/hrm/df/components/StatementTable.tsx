import { EditableFormInstance, EditableProTable, ProColumns } from "@ant-design/pro-components"
import { DfEmpEvaluationRs } from "../data"
import { Radio } from "antd";
import { useRef } from "react";

export default({
    items,
    onSetItems,
    editableFormRef,
    editable,
    editableRating
}:{
    items: DfEmpEvaluationRs[];
    onSetItems?: (v: DfEmpEvaluationRs[]) => void;
    editableFormRef?: React.MutableRefObject<EditableFormInstance | undefined>|undefined
    editable: boolean|false;
    editableRating: boolean|false
})=>{
    // const editableFormRef = useRef<EditableFormInstance>();

    const setRatingScore=(key?: string, rating1?: number, rating2?: number, rating3?: number, rating4?: number, rating5?: number)=>{
      onSetItems?.(
        items.map(it=> {
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
    const cols: ProColumns<DfEmpEvaluationRs>[] = [
        { title: 'No', width: 20, editable: false, render: (_, __, index) => index + 1 },
        { title: 'Statement',  
        // editable: false,
            dataIndex: 'description1',
            valueType: 'textarea',
            editable:(_,r) => false, 
            formItemProps: {rules: [{ required: true}] },
            fieldProps: { rows: 1, maxLength: 5000 },
        },
    ]
    // if(editableRating){
        cols.push({
            title: 'Strongly Disagree',
             dataIndex: 'rating1',
            width: 102,
            align:'center',
            valueType: 'radio',  
            // editable:(_,r) => editableRating,       
            renderFormItem(_, config, form,record) {
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
                />:<Radio required checked={(config.record?.rating1==1)}/>)
            },
        })
        cols.push({
            title: 'Disagree',
            dataIndex: 'rating2',
            width: 102,
            align:'center',
            valueType: 'radio',  
            // editable:(_,r) => editableRating,       
            renderFormItem(_, config, form,record) {
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
                />:<Radio required checked={(config.record?.rating2==2)}/>)
                
            },
        })
        cols.push({
            title: 'Neutral',
            dataIndex: 'rating3',
            width: 102,
            align:'center',
            valueType: 'radio',  
            // editable:(_,r) => editableRating,       
            renderFormItem(_, config, form,record) {
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
                />:<Radio required checked={(config.record?.rating3==3)}/>)
                
            },
        })
        cols.push({
            title: 'Agree',
            dataIndex: 'rating4',
            width: 102,
            align:'center',
            valueType: 'radio',  
            // editable:(_,r) => editableRating,       
            renderFormItem(_, config, form,record) {
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
                />:<Radio required checked={(config.record?.rating4==4)}/>)
                
            },
        })
        cols.push({
            title: 'Strongly Agree',
            dataIndex: 'rating5',
            width: 102,
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
                />:<Radio required checked={(config.record?.rating5==5)}/>)
                
            },
        })
    // }
    

    return(<>
        <EditableProTable<DfEmpEvaluationRs>
            bordered
            pagination={false}
            cardProps={false}
            formRef={editableFormRef}
            editableFormRef={editableFormRef}
            rowKey="key"
            editable={{
                type: 'multiple',
                editableKeys: items?.map((it) => it.key), 
                onValuesChange: (record, recordList) => { 

                }
            }}
            
            recordCreatorProps={false}
            value={items}
            columns={cols}
        />

    </>)
}