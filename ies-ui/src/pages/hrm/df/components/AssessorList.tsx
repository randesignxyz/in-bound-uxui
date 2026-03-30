import { EditableFormInstance, EditableProTable } from "@ant-design/pro-components"
import { AssessorFD } from "../data"
import { uniqueId } from "lodash"
import { Button, Form } from "antd"
import { ReactElement, useState } from "react"
import { MinusCircleOutlined } from "@ant-design/icons"

export default({
    title,
    readOnly,
    editableFormRef,
    initData,
    items,
    onSetItems
}:{
    title: string,
    readOnly?: Boolean | undefined,
    editableFormRef?: React.MutableRefObject<EditableFormInstance | undefined>|undefined,
    initData: AssessorFD[],
    items: AssessorFD[];
    onSetItems?: (v: AssessorFD[]) => void;
})=>{
    const [form] = Form.useForm();
    // const [item, setItem] = useState<AssessorFD[]>([])
    // const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
    // const initData = [
    //     {
    //         key: uniqueId().toString(),
    //         empId: 1,
    //         empNo: '002136',
    //         empName: 'Hay sokhom(00213)' 
    //     },
    //     {
    //         key: uniqueId().toString(),
    //         empId: 2,
    //         empNo: '002137',
    //         empName: 'Nob Sreynan(00215)' 
    //     }
    // ]
    // const addNewRow = (newItem: AssessorFD)=>{
    //         const list= getDataItems()
    //         list.push(newItem)  
    //         setItem(list)
    //     }
    // const getDataItems = (): AssessorFD[] =>{
    //         const fieldsVaule = editableFormRef?.current?.getFieldsValue()
    //         const list: AssessorFD[] = []
    //         for (var key in fieldsVaule) {
    //             const item = fieldsVaule[key]
    //             item.key = key
    //             list.push(item)
    //         }      
    //         return list
    //     }

    return( <EditableProTable<AssessorFD>
        rowKey="key"
        size="small"
        editableFormRef={editableFormRef}
        columns={[
            {
                title: title,
                dataIndex: 'empId',
                valueType: 'select',
                formItemProps: {
                    rules: [{ required: true }]
                },
                fieldProps: {
                    showSearch: true,
                    popupMatchSelectWidth: 280,
                    allowClear: true
                },
                valueEnum: (r) => initData.filter(it => !(items?.some(i=> i.empId==it.empId))).reduce((acc, cur) => ({ ...acc, [cur.empId]: cur.empName }), {})
            },
            {
                valueType: 'option',
                // hidden: !editable,
                width: 20,
                render: () => {
                    return null;
                },
            },  
            // ,{
            //     title: '',
            //     valueType: 'option',
            //     width: 20,
            //     render: (text, row, _, action) => [
            //         <Space>
            //             {/* {readOnly ? "" : <a */}
            //             {readOnly ? "" : <Button
            //                 type="link"
            //                 icon={<PaperClipOutlined />}
            //                 onClick={() => {
            //                    const list =getDataItems()?.filter((it) => it.key != row.key)
            //                     setItem?.(list)
            //                 }}
            //             />}
            //         </Space>
            //     ],
            // },
        ]}
        controlled
        value={items}
        recordCreatorProps= {readOnly? false:{
            creatorButtonText: "Add",
            newRecordType: 'dataSource',
            // onClick: () => {
            //     const newitem = {id: 0, key: 'default-emp-ach-'+uniqueId().toString(),empId:0,empNo:'',empName:''} as AssessorFD
            //     addNewRow(newitem)
            // },
            record: (index) => {
                const key = uniqueId().toString() + index    
                // const key = initData.find(it => it)?.key      
                // return ({ key: key, id: 0, categoryId: lookupDataItemBrand?.find(it => it)?.id} as any)
                return ({ key: key, id: 0} as any)
            }
        }}
        editable={{
            form: form,
            type: 'multiple',
            // editableKeys: items?.map((it) => it.key),
            // editableKeys: editableKeys,
            // onChange: setEditableRowKeys,
            actionRender: (row, config, defaultDoms) => {                  
                // const save = defaultDoms.save as ReactElement
                const deleteBtn = defaultDoms.delete as ReactElement
                // const updateBtn = {...save, props: {...save.props, children: "Update"}}
                // const removeBtn = {...deleteBtn, props: {...deleteBtn.props, deletePopconfirmMessage:'Remove this line?', children: "Remove"}}
                return [
                    <Button
                        type="link"
                        danger
                        onClick={() => {
                            const list =items?.filter((it) => it.key != row.key)
                            onSetItems?.(list)
                        }}
                        size="small"
                        icon={<MinusCircleOutlined />}
                    />
                ]
            },
            onValuesChange(record, dataSource) {
                if (!record && !dataSource) {
                    return
                }
                const changeCateRecord = items?.find(it => it.key == record?.key )
               
                if(items?.length < dataSource.length){
                    const newRecord = dataSource.find(it=> !items.find(r=> r.key==it.key))
                    if(newRecord){
                        onSetItems?.(
                            [...items,{key: newRecord?.key,empId: newRecord.empId,empNo: newRecord.empNo,empName: newRecord.empName}]
                        )
                    }
                }else{
                    onSetItems?.(
                        items.map(it=> {
                            const edit = (record?.key==it.key)
                            if(edit && changeCateRecord) {
                                return {...it,key: record.key,empId: record.empId}
                            }else{
                                return it
                            }
                        })
                    )
                }
            }
        }}
        
    />)
}
