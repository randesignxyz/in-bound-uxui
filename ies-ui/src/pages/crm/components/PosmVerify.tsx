
import { PosmReview } from "@/services/crm/data";
import { LookupData } from "@/services/data";
import { simpleRequestActions } from "@/services/model";
import { EditableFormInstance, EditableProTable, ModalForm, ModalFormProps } from "@ant-design/pro-components";
import { Button, message, Modal } from "antd";
import { useForm } from "antd/lib/form/Form";
import _ from "lodash";
import { useEffect, useRef, useState } from "react";
import { POSMView } from "../contract/types";
import { CustomerServices } from "../customer/services";
import { CrmServices } from "../services";
import React from "react";

type PosmVerify = {
    id: number;
    category: string;
    name: string;
    qty: number;
    actualQty: number;
    itemChekedStatus?: number;
    checkedStatus?: number;
    checkedQuantity?: number;
    remarks?: string;
    editable?: boolean;
}

export default ({ customerId, visitId, posmItems, posmReviewList, onRefresh,editable=true, ...rest }: ModalFormProps & {
    customerId: number;
    visitId: number,
    posmItems: POSMView[];
    posmReviewList: PosmReview[];
    onRefresh?: () => void
    editable?: boolean
}) => {
    const requestActions = simpleRequestActions()
    const [form] = useForm()
    const [data, setData] = useState<PosmVerify[]>([])
    const editableFormRef = useRef<EditableFormInstance>();
    const [lookupData, setLookupData] = useState<LookupData[]>()

    useEffect(() => {
        (async () => {
            const rs = await CrmServices.listLookupData(['POSM_ITEM_REVIEWED', 'POSM_REVIEWED_STATUS']).query(requestActions)
            setLookupData(rs)
        })()

        const combine: { id: number; category: string; name: string }[] = [
            ...posmItems.map(it => ({ id: it.item.id, category: it.category, name: it.item.name })),
            ...posmReviewList.map(it => ({ id: it.posm.id, category: it.category, name: it.posm.name }))
        ]

        setData(_.uniqBy(combine, 'id').map(it => ({
            id: it.id,
            category: it.category,
            name: it.name,
            qty: posmItems.find(i => i.item.id == it.id)?.qty || 0,
            actualQty: posmReviewList.find(i => i.posm.id == it.id)?.quantity || 0,


        })))
    }, [])

    return <ModalForm
        width={1200}
        form={form}
        submitter={{
            submitButtonProps: {
                disabled: !editable,
            },
        }}
        onFinish={async () => {
            await editableFormRef.current?.validateFields()
            Modal.confirm({
                title: "POSM Checked",
                content: "Are you sure?",
                onOk: async () => {
                    try {
                        await CustomerServices.checkPosm(visitId, data.map(it => ({
                            posmId: it.id,
                            qty: it.qty,
                            actualQty: it.actualQty,
                            itemCheckedStatus: it.itemChekedStatus || 0,
                            checkedStatus: it.checkedStatus || 0,
                            checkedQuantity:it.checkedQuantity,
                            remarks: it.remarks
                        })))(requestActions)
                        message.success("Submitted Successfully.")
                        onRefresh?.()
                        rest.onOpenChange?.(false)
                    } catch (error: any) {
                        message.error(error.message || 'Failed to save.')
                    }
                }
            })
        }}
        title="POSM Review Verification" {...rest}>

        <EditableProTable<PosmVerify>
            editableFormRef={editableFormRef}
            columns={[
                {
                    title: "POSM",
                    children: [
                        { title: "Category", width: 80, readonly: true, dataIndex: 'category' },
                        { title: 'Name', readonly: true, dataIndex: "name" }
                    ]
                },
                {
                    title: "Qty",
                    children: [
                        { title: 'Current', align: 'right', width: 80, readonly: true, dataIndex: 'qty' },
                        { title: 'Reviwed', width: 80, align: 'right', readonly: true, dataIndex: 'actualQty' }
                    ]
                },
                {
                    title: "Verification",
                    children: [
                        { title: 'Item Check', dataIndex: 'itemChekedStatus', valueType: 'select', formItemProps: { rules: [{ required: true }] }, fieldProps: { options: lookupData?.filter(it => it.type == 'POSM_ITEM_REVIEWED').map(it => ({ label: it.name, value: it.id })) } },
                        { title: "QTY Check", dataIndex: "checkedQuantity", valueType:"digit", fieldProps:{ placeholder:"QTY" } },
                        { title: "Status", dataIndex: 'checkedStatus', valueType: 'select', formItemProps: { rules: [{ required: true }] }, fieldProps: { options: lookupData?.filter(it => it.type == 'POSM_REVIEWED_STATUS').map(it => ({ label: it.name, value: it.id })) } },
                        { title: "Remarks (SA)", dataIndex: 'remarks', valueType: 'textarea', fieldProps: { rows: 1 } }
                    ]
                }
                // {
                //     title: "Status", 
                //     children: [
                //         { title: 'Item & Qty', dataIndex: 'itemChekedStatus', valueType: 'select', formItemProps: { rules: [{ required: true }] }, fieldProps: { options: lookupData?.filter(it => it.type == 'POSM_ITEM_REVIEWED').map(it => ({ label: it.name, value: it.id })) } },
                //         { title: "Verification", dataIndex: 'checkedStatus', valueType: 'select', formItemProps: { rules: [{ required: true }] }, fieldProps: { options: lookupData?.filter(it => it.type == 'POSM_REVIEWED_STATUS').map(it => ({ label: it.name, value: it.id })) } },
                //         { title: "Remarks (SA)", dataIndex: 'remarks', valueType: 'textarea', fieldProps: { rows: 1 } }
                //     ]
                // }
            ]}
            rowKey='id'
            size='small'
            bordered
            value={data}
            recordCreatorProps={false}
            editable={editable?{
                type: 'multiple',
                editableKeys: data.map(it => it.id),
                onValuesChange: (_, records) => {
                    setData(records)
                }
            }:undefined}
        />
    </ModalForm>
}