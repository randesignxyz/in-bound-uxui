import { EditableFormInstance, EditableProTable } from "@ant-design/pro-components";
import { ProbationEmpImprovement } from "../data.types";
import { MinusCircleOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { useEffect } from "react";
import { uniqueId } from "lodash";

interface Props {
    editableFormRef?: React.MutableRefObject<EditableFormInstance | undefined>|undefined
    addedItems: ProbationEmpImprovement[];
    onSetAddedItems?: (v: ProbationEmpImprovement[]) => void;
    editable: boolean|false;
}

export default({editableFormRef,addedItems,onSetAddedItems,editable}: Props) => {
    
    const defaultEmpAchievments = [
        {id:0, key:'default-emp-ach-1', description:''},
        {id:0, key:'default-emp-ach-2', description:''},
        {id:0, key:'default-emp-ach-3', description:''},
    ]

    useEffect(()=>{
        if(addedItems?.length==0){
          onSetAddedItems?.(defaultEmpAchievments)
        }
    },[addedItems])

    return (<EditableProTable<ProbationEmpImprovement>
        bordered
        pagination={false}
        cardProps={false}
        formRef={editableFormRef}
        editableFormRef={editableFormRef}
        size="small"
        rowKey="key"
        controlled
        maxLength={5}
        value={addedItems}
        editable={{
            type: 'multiple',
            editableKeys: addedItems?.map((it) => it.key),
            actionRender: (row, config) => [ 
                (editable && (!defaultEmpAchievments.find(r => r.key== row.key) || ['default-emp-ach-2','default-emp-ach-3'].find(key => key== row.key))
                && <Button
                    type="link"
                    danger
                    onClick={() => {
                        const list =addedItems?.filter((it) => it.key != row.key)
                        onSetAddedItems?.(list)
                    }}
                    key={`del-${row.id}`}
                    size="small"
                    icon={<MinusCircleOutlined />}
                />)
            ],
            onValuesChange: (record, recordList) => {  
                onSetAddedItems?.(
                    recordList.map((it) => ({
                        ...it,                   
                    })),
                );
            }
        }}
        recordCreatorProps={editable?{
            creatorButtonText: 'Add',
            newRecordType: 'dataSource',
            record: (index, datasource) => {
                const key = uniqueId().toString() + index                    
                return({ key: key } as any)
            },
        }:false}
        columns={[
        { title: 'No', width: 20, editable: false, render: (_, __, index) => index + 1 },
        {
            title: <div><span style={{color:'red'}}>*</span>1.Achievement</div>,
            valueType: 'textarea',
            dataIndex: 'description',
            editable:(_,r) => editable, 
            formItemProps: {rules: [{ required: true}] },
            fieldProps: { rows: 2, maxLength: 200 }
        
        },
        {
            valueType: 'option',
            hidden: !editable,
            width: 50,
            render: () => {
                return null;
            },
        },  
        ]}
    />)
    

}