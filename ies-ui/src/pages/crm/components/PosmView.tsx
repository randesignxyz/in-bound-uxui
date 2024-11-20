import { LookupData } from "@/services/data"
import { SimpleRequestActions } from "@/services/model"
import { EditableFormInstance, EditableProTable, ProCard } from "@ant-design/pro-components"
import { Form, message, Space, Spin } from "antd"
import { toInteger, uniqueId } from "lodash"
import { useEffect, useRef, useState } from "react"
import { ContractServices } from "../contract/services"
import { ContractPOSMItem, POSM } from "../contract/types"
import { CrmServices } from "../services"
import { AddresssView } from "@/services/crm/data"
import { PaperClipOutlined } from "@ant-design/icons"

export type PosmDataType = {
    key: string
    id?: number
    categoryId: number
    itemId: string
    qty: number
    remarks?: string
}


export default ({ addresList, requestActions, listPosm, onSave, onDelete }: {
    addresList: AddresssView[]
    requestActions: SimpleRequestActions
    initAddressList: () => Promise<void>;
    listPosm: () => Promise<ContractPOSMItem[]>
    onSave: (itemId: number, qty: number, id?: number, remarks?: string) => Promise<{ data: number }>
    onDelete: (id: number) => Promise<void>
}) => {

    const [data, setData] = useState<readonly PosmDataType[]>([])
    const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
    const [lookupData, setLookupData] = useState<LookupData[]>()
    const [posmList, setPosmList] = useState<POSM[]>([])
    const editableFormRef = useRef<EditableFormInstance>();
    const [form] = Form.useForm();
    const [saveIds, setSavIds] = useState<{ key: string, id: number }[]>([])
    const [ori, setOri] = useState<PosmDataType>()


    useEffect(() => {
        (async () => {
            const rs = await CrmServices.listLookupData(['POSM_CATEGORY']).query(requestActions)
            setLookupData(rs)
            const posmList = await ContractServices.listPOSM.query(requestActions)
            setPosmList(posmList)
            const contarctPosmList = await listPosm()
            const list = contarctPosmList.map(it => ({
                key: uniqueId(),
                id: it.id,
                categoryId: posmList.find(i => i.id == it.itemId)?.categoryId || 0,
                itemId: it.itemId.toString(),
                qty: it.qty,
                remarks: it.remarks
            }))
            setData(list)
            setSavIds(list.map(it => ({ key: it.key, id: it.id })))
        })()
    }, []);

    return <ProCard>
        <Spin spinning={requestActions.request?.loading}>
            <EditableProTable<PosmDataType>
                rowKey="key"
                editableFormRef={editableFormRef}
                columns={[
                    {
                        title: "Category", dataIndex: 'categoryId',
                        valueType: 'select',

                        fieldProps: {
                            showSearch: true,
                            options: lookupData?.map(it => ({ label: it.name, value: it.id }))
                        },
                        formItemProps: { rules: [{ required: true }] },
                        width: 120
                    },
                    {
                        title: "Item", dataIndex: 'itemId', width: 200, valueType: 'select',
                        formItemProps: { style: { width: 200 }, rules: [{ required: true }] },

                        fieldProps: {
                            showSearch: true,
                            popupMatchSelectWidth: 310,
                            allowClear: true
                        },
                        valueEnum: (r) => posmList.filter(it => it.categoryId == r.categoryId).reduce((acc, cur) => ({ ...acc, [cur.id]: cur.name }), {})
                    },
                    {
                        title: "Qty", fieldProps: { style: { width: 120 } },
                        dataIndex: 'qty', valueType: 'digit', width: 150, formItemProps: { rules: [{ required: true }], },
                    },

                    {
                        title: "Address", dataIndex: 'customerAddressId', width: 200, valueType: 'select',
                        formItemProps: { style: { width: 200 } },
                        // formItemProps: {  },

                        fieldProps: {

                            showSearch: true,
                            popupMatchSelectWidth: 310,
                            allowClear: true,
                        },
                        valueEnum: (r) => addresList?.reduce((acc, cur) => ({ ...acc, [cur.id || 0]: cur.address }), {})
                    },
                    {
                        title: 'Effective Date',
                        dataIndex: 'effectiveDate',
                        width: 120,
                        formItemProps: { style: { width: 120 } },
                        valueType: 'date'
                    },
                    {
                        title: 'Expiry Date',
                        width: 120,
                        formItemProps: { style: { width: 120 } },
                        dataIndex: 'expiryDate',
                        valueType: 'date'
                    },
                    { title: "Remarks ", dataIndex: 'remarks' },
                    {
                        title: 'Actions',
                        valueType: 'option',
                        width: 200,
                        render: (text, record, _, action) => [
                            <Space>
                                <a
                                    key="editable"
                                    onClick={() => {
                                        setOri(record)
                                        action?.startEditable?.(record.key);
                                    }}
                                >
                                    Edit
                                </a>

                                <a
                                    key="uploadImage"
                                    onClick={() => {
                                        // setOri(record)
                                        // action?.startEditable?.(record.key);
                                    }}
                                >
                                    <PaperClipOutlined />
                                </a>
                            </Space>
                        ],
                    },
                ]}
                value={data}
                controlled
                recordCreatorProps={{
                    creatorButtonText: "New Item",
                    newRecordType: 'dataSource',
                    record: () => {
                        return ({ key: uniqueId().toString(), id: 0, categoryId: lookupData?.find(it => it)?.id, qty: 1 } as any)
                    }
                }}
                editable={{
                    form: form,
                    onlyAddOneLineAlertMessage: "Please save current item before adding another item.",
                    onlyOneLineEditorAlertMessage: "Please save current item before adding another item.",
                    onSave: async (key, record,) => {
                        try {

                            const rs = await onSave(toInteger(record.itemId), record.qty, saveIds.find(it => it.key == key)?.id, record.remarks)

                            setSavIds([...saveIds.filter(it => it.key != key), { key: key.toString(), id: rs.data }])
                            setOri(undefined)
                            return true
                        } catch (error: any) {
                            message.error(error.message || 'Failed to save.')
                            throw Error(error.message || 'Failed to save.')
                        }

                    },
                    onDelete: async (key, record) => {
                        try {
                            const id = saveIds.find(it => it.key == key)?.id
                            id && await onDelete(id)
                            setOri(undefined)
                            return true
                        } catch (error: any) {
                            message.error(error.message || 'Failed to delete.')
                            throw Error(error.message || 'Failed to save.')
                        }

                    },

                    onCancel: async (key, _) => {
                        const id = saveIds.find(it => it.key == key)?.id
                        if (!id) {
                            setData(v => v.filter(it => it.key != key))
                        } else {
                            ori && setData(v => v.map(it => it.key == key ? ori : it))
                            setOri(undefined)
                        }
                    },

                    editableKeys: editableKeys,
                    onChange: setEditableRowKeys,
                    onValuesChange(record, dataSource) {
                        if (!record && !dataSource) {
                            return
                        }
                        const changeCateRecord = data?.find(it => it.key == record?.key && it.categoryId != record?.categoryId)
                        setData(dataSource.map(it => it.key == changeCateRecord?.key ? ({ ...it, itemId: null } as any) : ({ ...it, itemId: it.itemId?.toString() })))
                    },
                }}
            />
        </Spin>
    </ProCard>
}