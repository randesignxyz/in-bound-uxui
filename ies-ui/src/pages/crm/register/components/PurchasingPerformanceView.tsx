import { EditOutlined } from "@ant-design/icons"
import { EditableFormInstance, EditableProTable } from "@ant-design/pro-components"
import { Button, Form, message, Space } from "antd"
import { uniqueId } from "lodash"
import { ReactElement, useEffect, useState } from "react"
import { RegisterCustomerServiceAPI } from "../services"
import { PurchasingPerformanceItem, RegisterItemBrandList, RegisterPPItemList } from "../data"

// export type PurchasingPerformanceDataType = {
//     key: string
//     id: number
//     categoryId?: number
//     itemId?: number
//     pQty?: number
//     dQty?: number
// }
export default ({editableFormRef, addedItems, onSetAddedItems, readOnly}:{
    editableFormRef?: React.MutableRefObject<EditableFormInstance | undefined>|undefined
    addedItems: PurchasingPerformanceItem[];
    onSetAddedItems?: (v: PurchasingPerformanceItem[]) => void;
    readOnly?: Boolean | undefined,
    // onSave: (data: { itemId: number, pQty: number,dQty: number, id?: number}) => Promise<{ data: number }>
})=> {
    const service = RegisterCustomerServiceAPI()

    const [form] = Form.useForm();
    // const [data, setData] = useState<PurchasingPerformanceItem[]>([])
    const [saveIds, setSavIds] = useState<{ key: string, id: number }[]>([])
    const [ori, setOri] = useState<PurchasingPerformanceItem>();
    // const editableFormRef = useRef<EditableFormInstance>();
    const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
    
    const [lookupDataItemBrand, setLookupDataItemBrand] = useState<RegisterItemBrandList[]>()
    const [lookupDataRegisterPPItem, setLookupDataRegisterPPItem] = useState<RegisterPPItemList[]>([])
    const initData=()=>{
        service.listRegisterItemBrand().then(r=>{
            setLookupDataItemBrand(r)
        })
        service.listRegisterPPItem().then(r=>{
            setLookupDataRegisterPPItem(r)
        })
    }
    useEffect(() => {
        initData()
    }, []);

    // const getDataItems = (): PurchasingPerformanceItem[] =>{
    //     const fieldsVaule = editableFormRef?.current?.getFieldsValue()
    //     const list: PurchasingPerformanceItem[] = []
    //     for (var key in fieldsVaule) {
    //         const item = fieldsVaule[key]
    //         item.key = key
    //         list.push(item)
    //     }      
    //     return list
    // }   

    // const addNewRow = (newItem: PurchasingPerformanceItem)=>{
    //     const list= getDataItems()
    //     list.push(newItem)  
    //     setData(list)
    // }


    return (<div>
        <EditableProTable<PurchasingPerformanceItem>
            rowKey="key"
            size="small"
            
            editableFormRef={editableFormRef}
            columns={[
                {
                    title: "Category", dataIndex: 'categoryId',
                    valueType: 'select',

                    fieldProps: {
                        showSearch: true,
                        // onChange: (list:any,value: any,index: any) => {
                        //     console.log(value,list);
                        //     console.log('index: ',index);
                        // },
                        options: lookupDataItemBrand?.map(it => ({ label: it.name, value: it.id }))
                    },
                    formItemProps: { rules: [{ required: true }] },
                    width: 120,
                },
                {
                    title: "Item",
                    dataIndex: 'itemId',
                    valueType: 'select',
                    formItemProps: {
                        rules: [{ required: true }]
                    },
                    fieldProps: {
                        showSearch: true,
                        popupMatchSelectWidth: 280,
                        allowClear: true
                    },
                    valueEnum: (r) => lookupDataRegisterPPItem.filter(it => it.productId == r.categoryId).reduce((acc, cur) => ({ ...acc, [cur.id]: cur.name }), {})
                },
                {
                    title: "Monthly Purchase (Quantity)",
                    dataIndex: 'pqty',
                    valueType: 'digit',
                    fieldProps: { style: { width: '99%' } },
                    formItemProps: { rules: [{ required: true }], },
                },
                {
                    title: " Mininum Exceptation per Delivery (Quantity)",
                    dataIndex: 'dqty',
                    valueType: 'digit',
                    fieldProps: { style: { width: '99%' } },
                    formItemProps: { rules: [{ required: true }]},
                },   
                // {
                //     valueType: 'option',
                //     // hidden: !editable,
                //     width: 50,
                //     render: () => {
                //         return null;
                //     },
                // },             
                {
                    title: 'Actions',
                    valueType: 'option',
                    width: 200,
                    render: (text, record, _, action) => [
                        <Space>
                            {/* {readOnly ? "" : <a */}
                            {readOnly ? "" : <Button
                                key="editable"
                                type="link"
                                onClick={() => {
                                    // setOri(record)
                                    action?.startEditable?.(record.key);
                                }}
                                icon={<EditOutlined />}
                            />}
                            {/* <Button
                                type="link"
                                icon={<PaperClipOutlined />}
                                onClick={() => {
                                    // setViewImageState({
                                    //     visible: {
                                    //         name: "DRAWER",
                                    //         posmInfo: record as unknown as ContractPOSMItem
                                    //     }
                                    // })
                                }}
                            /> */}
                        </Space>
                    ],
                },
            ]}
            value={addedItems}
            controlled
            recordCreatorProps= {readOnly? false:{
                creatorButtonText: "New Item",
                newRecordType: 'dataSource',
                record: (index) => {
                    const key = uniqueId().toString() + index          
                    return ({ key: key, id: 0, categoryId: lookupDataItemBrand?.find(it => it)?.id} as any)
                }
            }}
            editable={{
                form: form,
                // type: 'multiple',
                // editableKeys: addedItems?.map((it) => it.key),
                onlyAddOneLineAlertMessage: "Please save current item before adding another item.",
                onlyOneLineEditorAlertMessage: "Please save current item before adding another item.",
                editableKeys: editableKeys,
                onChange: setEditableRowKeys,
                actionRender: (row, config, defaultDoms) => 
                {                  
                    const save = defaultDoms.save as ReactElement
                    const deleteBtn = defaultDoms.delete as ReactElement
                    const updateBtn = {...save, props: {...save.props, children: "Update"}}
                    const removeBtn = {...deleteBtn, props: {...deleteBtn.props, deletePopconfirmMessage:'Remove this line?', children: "Remove"}}
                    return [updateBtn,removeBtn,defaultDoms.cancel]
                },
                onSave: async (key, record,) => {
                    try {
                       onSetAddedItems?.(
                            addedItems.map(it=> {
                                const edit = (record?.key==it.key)
                                if(edit ) {                                   
                                    return {...it, categoryId: record.categoryId, itemId: record.itemId, dqty: record.dqty, pqty: record.pqty}
                                }else{
                                    return it
                                }
                            })
                        )
                        return true
                    } catch (error: any) {
                        message.error(error.message || 'Failed to save.')
                        throw Error(error.message || 'Failed to save.')
                    }
                },
                onDelete: async (key, record) => {
                    onSetAddedItems?.(
                        addedItems.filter(it=> it.key != record.key)
                    )
                },
                onCancel: async (key, _) => {

                },
                onValuesChange(record, dataSource) {
                    if (!record && !dataSource) {
                        return
                    }
                    const changeCateRecord = addedItems?.find(it => it.key == record?.key && it.categoryId != record?.categoryId)
                    if(addedItems.length < dataSource.length){
                        const newRecord = dataSource.find(it=> !addedItems.find(r=> r.key==it.key))
                        if(newRecord){
                            onSetAddedItems?.(
                                [...addedItems,{id:0,key: newRecord?.key}]//.map(it=> ({...it}))
                            )
                        }
                    }else{
                        onSetAddedItems?.(
                            addedItems.map(it=> {
                                const edit = (record?.key==it.key)
                                if(edit && changeCateRecord) {
                                    return {...it, categoryId: record.categoryId, itemId: undefined}
                                }else{
                                    return it
                                }
                            })
                        )
                    }
                }
            }}
        />
    </div>)
}