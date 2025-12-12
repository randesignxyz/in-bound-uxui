import { EditableFormInstance, EditableProTable } from "@ant-design/pro-components";
import { ProbationEmpImprovement } from "../data.types";
import { MinusCircleOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { useEffect, useState } from "react";
import { uniqueId } from "lodash";

interface Props {
    editableFormRef?: React.MutableRefObject<EditableFormInstance | undefined>|undefined
    initDataItems: ProbationEmpImprovement[];
    // onSetAddedItems?: (v: ProbationEmpImprovement[]) => void;
    editable: boolean|false;
}

export default({editableFormRef,initDataItems,editable}: Props) => {

    const defaultEmpAchievments = [
        {id:0, key:'default-emp-ach-1', description:''},
        {id:0, key:'default-emp-ach-2', description:''},
        {id:0, key:'default-emp-ach-3', description:''},
    ]
    const [dataItems, setDataItems] = useState<ProbationEmpImprovement[]>([])

    useEffect(()=>{
        if(initDataItems?.length==0){
            setDataItems(defaultEmpAchievments)
          }else{
              setDataItems(initDataItems)
          }
    },[initDataItems])
    const addNewRow = (newItem: ProbationEmpImprovement)=>{
        const list= getDataItems()
        list.push(newItem)
        setDataItems(list)
    }
    const getDataItems = (): ProbationEmpImprovement[] =>{
        const fieldsVaule = editableFormRef?.current?.getFieldsValue()
        const list: ProbationEmpImprovement[] = []
        for (var key in fieldsVaule) {
            const item = fieldsVaule[key]
            item.key = key
            list.push(item)
        }
        return list
    }

    return (<EditableProTable<ProbationEmpImprovement>
        bordered
        pagination={false}
        cardProps={false}
        // formRef={editableFormRef}
        editableFormRef={editableFormRef}
        size="small"
        rowKey="key"
        controlled
        maxLength={5}
        value={dataItems}
        editable={{
            type: 'multiple',
            editableKeys: dataItems?.map((it) => it.key),
            actionRender: (row, config) => [
                (editable && (!defaultEmpAchievments.find(r => r.key== row.key) || ['default-emp-ach-2','default-emp-ach-3'].find(key => key== row.key))
                && <Button
                    type="link"
                    danger
                    onClick={() => {
                        const list =getDataItems()?.filter((it) => it.key != row.key)
                        setDataItems?.(list)
                    }}
                    key={`del-${row.id}`}
                    size="small"
                    icon={<MinusCircleOutlined />}
                />)
            ],
            // onValuesChange: (record, recordList) => {
            //     // onSetAddedItems?.(
            //     //     recordList.map((it) => ({
            //     //         ...it,
            //     //     })),
            //     // );
            // }
        }}
        recordCreatorProps={editable?{
            creatorButtonText: 'Add',
            onClick: () => {
                const newitem = {id: 0, key: 'default-emp-ach-'+uniqueId().toString(),description:'',description1:''} as ProbationEmpImprovement
                addNewRow(newitem)
            },
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
            formItemProps: {rules: [{ required: true, whitespace: true, message:'please enter'}] },
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
