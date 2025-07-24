import { EditableFormInstance, EditableProTable, ProCard } from "@ant-design/pro-components"
import { DfComment } from "../data"
import { uniqueId } from "lodash";
import { useEffect, useState } from "react";
import { Button } from "antd";
import { MinusCircleOutlined } from "@ant-design/icons";

interface Props {
    title: string;
    commTitle: string;
    initDataItems:DfComment[];
    onSetItems?: (v: DfComment[]) => void;
    editableFormRef?: React.MutableRefObject<EditableFormInstance | undefined>|undefined
    editable: boolean|false;
}
export default({title, commTitle, initDataItems, onSetItems, editableFormRef, editable}: Props) => {
    const defaultCommentList = [
        {id:0, key:'default-assosser-comment-1', comment:''},
        {id:0, key:'default-assosser-comment-2', comment:''},
        {id:0, key:'default-assosser-comment-3', comment:''}
    ]
    // const [dataItems, setDataItems] = useState<DfComment[]>([])
    useEffect(()=>{
        if(initDataItems?.length==0){
            onSetItems?.(defaultCommentList)
        }else{
            onSetItems?.(initDataItems)
        }
    },[initDataItems])
    // const addNewRow = (newItem: DfComment)=>{
    //     const list= getDataItems()
    //     list.push(newItem)  
    //     onSetItems?.(list)
    // }
    // const getDataItems = (): DfComment[] =>{
    //     const fieldsVaule = editableFormRef?.current?.getFieldsValue()
    //     const list: DfComment[] = []
    //     for (var key in fieldsVaule) {
    //         const item = fieldsVaule[key]
    //         item.key = key
    //         list.push(item)
    //     }      
    //     return list
    // }

    return(
    <ProCard size="small"                  
        headerBordered
        title= {title}
    >
        <EditableProTable<DfComment>
            bordered
            pagination={false}
            cardProps={false}
            formRef={editableFormRef}
            editableFormRef={editableFormRef}
            size="small"
            rowKey="key"
            controlled
            maxLength={5}
            value={initDataItems}
            editable={{
                type: 'multiple',
                editableKeys: initDataItems?.map((it) => it.key),
                actionRender: (row, config) => [ 
                    (editable && (!defaultCommentList.find(r => r.key== row.key) )
                    && <Button
                        type="link"
                        danger
                        onClick={() => {
                            const list =initDataItems?.filter((it) => it.key != row.key)
                            onSetItems?.(list)
                        }}
                        key={`del-${row.id}`}
                        size="small"
                        icon={<MinusCircleOutlined />}
                    />)
                ],
                onValuesChange: (_, recordList) => {   
                    if(initDataItems.length< recordList.length){
                    const newRecord = recordList.find(it=> !initDataItems.find(r=> r.key==it.key))
                    if(newRecord){
                        onSetItems?.(
                        [...initDataItems,{id:0,key: newRecord?.key,comment:''}]
                        )
                    }
                    }else{          
                    onSetItems?.(
                        initDataItems.map((it) => {
                        const edit = recordList.find(r=> r.key==it.key)
                        if(edit){
                            return {...it, comment: edit.comment}
                        }
                        return it
                        }),
                    );
                    }
                }
            }}
             recordCreatorProps={editable?{
                creatorButtonText: 'Add',
                // onClick: () => {
                //     const newitem = {id: 0, key: 'default-assosser-comment-'+uniqueId().toString(),comment:''} as DfComment
                //     addNewRow(newitem)
                // },
                newRecordType: 'dataSource',
                record: (index) => ({ key: uniqueId().toString() + index } as any),
            }:false}
            columns={[
                { title: 'No', width: 20, editable: false, render: (_, __, index) => index + 1 },
                {
                    title: <div><span style={{color:'red'}}>*</span>{commTitle}</div>,
                    valueType: 'textarea',
                    dataIndex: 'comment',
                    editable:(_,r) => editable, 
                    formItemProps: {rules: [{ required: true, whitespace: true, message:'please enter'}] },
                    fieldProps: { rows: 2, maxLength: 200 }
                },
                {
                    valueType: 'option',
                    hidden: !editable,
                    width: 40,
                    render: () => {
                        return null;
                    },
                },  
            ]}
        />
    </ProCard>)
}