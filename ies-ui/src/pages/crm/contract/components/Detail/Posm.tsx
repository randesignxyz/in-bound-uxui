import { CrmServices } from "@/pages/crm/services"
import { LookupData } from "@/services/data"
import { simpleRequestActions } from "@/services/model"
import { EditableFormInstance, EditableProTable, ProCard } from "@ant-design/pro-components"
import { Form, message, Spin } from "antd"
import { toInteger, uniqueId } from "lodash"
import { useEffect, useRef, useState } from "react"
import { ContractServices } from "../../services"
import { POSM } from "../../types"

type PosmDataType = {
    key: string
    id?: number
    categoryId: number
    itemId: string
    qty: number
    remarks?: string
}

export default ({ contractId }: { contractId: number; }) => {
    const [data, setData] = useState<readonly PosmDataType[]>([])
    const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
    const requestActions = simpleRequestActions()
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

            const contarctPosmList = await ContractServices.listContractPOSM(contractId).query(requestActions)

            const list = contarctPosmList.map(it => ({
                key: uniqueId(),
                id: it.id,
                categoryId: posmList.find(i => i.id == it.itemId)?.categoryId || 0,
                itemId: it.itemId.toString(),
                qty: it.qty,
                remarks: it.remarks
            }))
            setData(list)
            setSavIds(list.map(it => ({key: it.key, id: it.id})))
        })()


    }, [])
    return <ProCard>
        <Spin spinning = {requestActions.request?.loading}>
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
                        width: 200
                    },
                    {
                        title: "Item", dataIndex: 'itemId', width: 200, valueType: 'select',
                        formItemProps: { rules: [{ required: true }] },
                        fieldProps: {
                            showSearch: true,
                            allowClear: true
                        },
                        valueEnum: (r) => posmList.filter(it => it.categoryId == r.categoryId).reduce((acc, cur) => ({ ...acc, [cur.id]: cur.name }), {})
                    },
                    {
                        title: "Qty", fieldProps: { style: { width: 120 } },
                        dataIndex: 'qty', valueType: 'digit', width: 150, formItemProps: { rules: [{ required: true }], },
                    },


                    { title: "Remarks", dataIndex: 'remarks' },
                    {
                        title: 'Actions',
                        valueType: 'option',
                        width: 200,
                        render: (text, record, _, action) => [
                            <a
                                key="editable"
                                onClick={() => {
                                    setOri(record)
                                    action?.startEditable?.(record.key);
                                }}
                            >
                                Edit
                            </a>
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
                            const rs = await ContractServices.savePOSM({
                                id: saveIds.find(it => it.key == key)?.id,
                                contractId: contractId,
                                itemId: toInteger(record.itemId),
                                qty: record.qty,

                                remarks: record.remarks
                            })(requestActions)

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
                            id && await ContractServices.deletePOSM(id)(requestActions)
                            setOri(undefined)
                            return true
                        } catch (error: any) {
                            message.error(error.message || 'Failed to delete.')
                            throw Error(error.message || 'Failed to save.')
                        }
                        
                    },

                    onCancel: async(key, _) => {
                        const id = saveIds.find(it => it.key == key)?.id
                        if(!id) {
                            setData(v => v.filter(it => it.key != key))
                        }else {
                            ori && setData(v=> v.map(it => it.key == key?ori: it))
                            setOri(undefined)
                        }
                    },

                    editableKeys: editableKeys,
                    onChange: setEditableRowKeys,
                    onValuesChange(record, dataSource) {
                        if(!record && !dataSource) {
                            return
                        }
                        const changeCateRecord = data?.find(it => it.key == record?.key && it.categoryId != record?.categoryId)
                        setData(dataSource.map(it => it.key == changeCateRecord?.key ? ({ ...it, itemId: null } as any) : ({ ...it, itemId: it.itemId?.toString()})))
                    },
                }}
            />
        </Spin>
    </ProCard>
}