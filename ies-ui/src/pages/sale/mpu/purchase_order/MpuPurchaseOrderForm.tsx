import FormModalComp, { FormModalProps } from "@/components/FormModal";
import { simpleRequestActions } from "@/services/model";
import { ActionType, EditableFormInstance, EditableProTable, ProDescriptions, ProForm, ProFormDatePicker, ProFormSelect, ProFormText, ProFormTextArea } from "@ant-design/pro-components";
import { Button, Card, Col, Flex, Row, message } from "antd";
import { useForm } from "antd/es/form/Form";
import React, { useEffect, useRef, useState } from "react";
import { PurchaseRequestDTO, PurchaseRequestItemCreate } from "../request/data";
import { PurChaseRequestAPIService } from "../request/service";
import { DeleteOutlined } from "@ant-design/icons";
import { uniqueId } from "lodash";
import { formatter } from "@/pages/utils";
import moment from "moment";
import { PurchaseOrderCreate, PurchaseOrderItem } from "./data";
import { PurchaseOrderServiceAPI } from "./services";

interface Props extends FormModalProps {
    onSave: (data: PurchaseOrderCreate) => void;
}

const MpuPurchaseOrderForm: React.FC<Props> = ({ onSave, ...props }) => {
    const requestActions = simpleRequestActions();
    const [form] = useForm<PurchaseOrderCreate>();
    const [purchaseRequest, setPurchaseRequest] = useState<PurchaseRequestDTO>();
    const [purchaseItem, setPurchaseItem] = useState<PurchaseRequestItemCreate[]>();
    const editableFormRef = useRef<EditableFormInstance>();
    const actionRef = useRef<ActionType>();
    const [amount, setAmount] = useState<{ totalAmount?: number; grantAmount?: number; discountAmount?: number; }>();

    useEffect(() => {
        props.open && form.resetFields();
        props.open && setPurchaseRequest(undefined);
        props.open && setAmount(undefined);
        props.open && setPurchaseItem(undefined);
    }, [props.open]);
    const onTotalAmoun = async () => {
        const result = purchaseItem
            ?.map((o) => ({
                totalAmoun: (o.pricing * o.quantity) || 0
            }))
            .reduce((p, c) => ({ totalAmoun: (p.totalAmoun + c.totalAmoun) || 0 }));
        result ? setAmount((t => ({
            ...t,
            totalAmount: result.totalAmoun,
            grantAmount: result.totalAmoun,
            discountAmount: 0
        }))
        ) : { totalAmount: 0, discountAmount: 0, grantAmount: 0 }
    }
    useEffect(() => {
        purchaseItem?.length && onTotalAmoun();
    }, [purchaseItem]);
    return (
        <FormModalComp
            title="Purchase Order Form"
            {...props}
            onSubmit={async () => {
                const dataForm = await form.validateFields();
                await editableFormRef.current?.validateFields();
                if (purchaseItem?.length) {
                    const entry = {
                        ...dataForm,
                        items: purchaseItem,
                        purchaseRequestNo: purchaseRequest?.purchaseRequestNo || "",
                        ...amount
                    }
                    onSave(entry)
                }
                else {
                    message.error("No purchase order items or no items")
                }
            }}
        >
            <ProForm
                form={form}
                submitter={false}
                labelAlign="right"
            >
                <ProForm.Group grid>
                    <ProFormSelect
                        name={"SA"}
                        label="SA"
                    />
                </ProForm.Group>
                <Flex vertical gap={12}>
                    <ProFormSelect
                        label="Purchase Request"
                        name={"purchaseRequestId"}
                        rules={[
                            {
                                required: true
                            }
                        ]}
                        showSearch
                        request={async (k: { keyWords: string }) => {
                            const data = await PurChaseRequestAPIService(requestActions).page({
                                criteria: {
                                    searchValue: k.keyWords
                                }
                            });
                            return data.items.map((p) => ({ value: p.id, label: [p.purchaseRequestNo, p.assignedTo].join(" - ") }))
                        }}
                        allowClear={true}
                        fieldProps={{
                            onClear: () => {
                                setPurchaseRequest(undefined);
                                setAmount(undefined);
                                setPurchaseItem(undefined);
                            },
                        }}
                        onChange={async (e: number) => {
                            PurchaseOrderServiceAPI(requestActions).findOrderItem(e).then(ar => {
                                const updatedItemsMap = new Map<number, PurchaseOrderItem>();
                                ar.forEach(o => {
                                    const existingItemId = updatedItemsMap.get(o.itemId);
                                    if (existingItemId) {
                                        existingItemId.quantity -= o.quantity
                                    }
                                    else {
                                        updatedItemsMap.set(o.itemId, { ...o });
                                    }
                                })
                                const items = Array.from(updatedItemsMap.values());
                                setPurchaseItem(items.filter(o => o.quantity != 0).map((r, index) => ({
                                    ...r,
                                    quantity: Math.abs(r.quantity),
                                    key: uniqueId().toString() + index
                                })));
                            });
                            PurChaseRequestAPIService(requestActions).fetchData(e).then(o => {
                                setPurchaseRequest(o);
                                actionRef.current?.reload?.();
                            });
                        }}
                    />
                    <Card size="small">
                        <ProDescriptions
                            dataSource={purchaseRequest}
                            size="small"
                            contentStyle={{
                                fontWeight: 500
                            }}
                            columns={[
                                {
                                    title: "Purchase Request Code",
                                    dataIndex: "purchaseRequestNo"
                                },
                                {
                                    title: "Saleperson Code",
                                    dataIndex: "assignedToCode"
                                },
                                {
                                    title: "Saleperson",
                                    dataIndex: "assignedTo"
                                },
                                {
                                    title: "Grand Amount",
                                    dataIndex: "grantAmount",
                                    valueType: "money"
                                },
                                {
                                    title: "Discount",
                                    dataIndex: "discountAmount",
                                    valueType: "percent"
                                },
                                {
                                    title: "Total Amount",
                                    dataIndex: "totalAmount",
                                    valueType: "money"
                                },
                            ]}
                        />
                    </Card>
                    <EditableProTable<PurchaseRequestItemCreate, { key: string }>
                        headerTitle={"Items"}
                        editableFormRef={editableFormRef}
                        rowKey="key"
                        size="small"
                        loading={requestActions.request?.loading}
                        actionRef={actionRef}
                        onValuesChange={(f) => {
                            setPurchaseItem(f);
                        }}
                        value={purchaseItem}
                        toolBarRender={() => [
                            <Button
                                type="link"
                                onClick={() => {
                                    setPurchaseItem(purchaseRequest?.items.map((r, index) => ({
                                        ...r,
                                        key: uniqueId().toString() + index
                                    })));
                                }}
                            >reset</Button>
                        ]}
                        columns={[
                            {
                                title: "Product Name",
                                dataIndex: "itemName",
                                readonly: true,
                            },
                            {
                                title: 'UOM',
                                dataIndex: 'uom',
                                readonly: true,
                                fieldProps: {
                                    showSearch: true,
                                    debounceTime: 500,
                                },
                                formItemProps: {
                                    rules: [{
                                        required: true,
                                    }],
                                },
                            },
                            {
                                title: 'Quantity',
                                dataIndex: 'quantity',
                                valueType: "digit",
                                initialValue: 1,
                                ellipsis: true,
                                fieldProps: (_, { entity }) => {
                                    return {
                                        min: 1,
                                        max: purchaseRequest?.items?.find(o => o.id == entity.id)?.quantity
                                    }
                                },
                                formItemProps: {
                                    rules: [
                                        {
                                            required: true,
                                            type: "number",
                                            min: 0
                                        },
                                    ]
                                }
                            },
                            {
                                title: 'Unit Price ',
                                dataIndex: 'pricing',
                                valueType: "digit",
                                initialValue: 0,
                                ellipsis: true,
                                formItemProps: {
                                    rules: [{
                                        required: true,
                                    },
                                    ]
                                },
                            },
                            {
                                title: 'Total',
                                dataIndex: 'total',
                                valueType: "money",
                                initialValue: 0,
                                ellipsis: true,
                                readonly: true,
                                dependencies: ["pricing", "quantoty"],
                                renderFormItem: (_, r) => {
                                    const total = r.record ? r.record?.pricing * r.record?.quantity : 0
                                    return <>{formatter.format(total)}</>
                                },
                                formItemProps: {
                                    rules: [{
                                        required: true,
                                    },
                                    ]
                                },
                            },
                            {
                                width: 50,
                                valueType: "option"
                            }
                        ]}
                        recordCreatorProps={false}
                        controlled
                        editable={{
                            type: 'multiple',
                            editableKeys: purchaseItem?.map((t) => t.key),
                            onValuesChange: (_, ds) => {
                                setPurchaseItem(ds);
                            },
                            actionRender: (row, config) => [
                                <Button
                                    icon={<DeleteOutlined />}
                                    type='link'
                                    danger
                                    onClick={() => {
                                        config.onDelete?.(config.recordKey, row);
                                    }}
                                />
                            ]
                        }}
                    />
                    <Flex
                        justify='space-between'
                    >
                        <div></div>
                        <ProDescriptions
                            size="small"
                            column={1}
                            editable={{
                                onSave: (key, record, originRow, newLineConfig) => {
                                    const total = (originRow.grantAmount as number - (originRow.grantAmount as number * (record.discountAmount || 0) / 100))
                                    setAmount((c) => ({
                                        ...c,
                                        ...record,
                                        discountAmount: record.discountAmount,
                                        totalAmount: total,
                                    }))
                                    return Promise.resolve({
                                        data: record,
                                        sucess: true
                                    })
                                },
                            }}
                            style={{
                                width: "300px",
                            }}
                            labelStyle={{
                                width: 150
                            }}
                            contentStyle={{
                                fontWeight: 500
                            }}
                            dataSource={amount}
                            columns={[
                                {
                                    title: "Grand Amount",
                                    dataIndex: "grandAmount",
                                    valueType: "money",
                                    editable: false,
                                    render: (_, r) => r.grantAmount ? formatter.format(r.grantAmount) : "$0.00"
                                },
                                {
                                    title: "Discount Amount",
                                    dataIndex: "discountAmount",
                                    valueType: "percent",
                                },
                                {
                                    title: "Total Amount",
                                    dataIndex: "totalAmount",
                                    valueType: "money",
                                    editable: false,
                                    render: (_, r) => r.totalAmount ? formatter.format(r.totalAmount,) : "$0.00"
                                },
                            ]}
                        />
                    </Flex>
                    <Card size="small">
                        <Row gutter={24}>
                            <Col span={8}>
                                <ProFormText
                                    name={"referenceNumber"}
                                    label="Reference Number"
                                />
                                <ProFormDatePicker
                                    name={"purchaseOrderDate"}
                                    label="Purchase Order Date"
                                    initialValue={moment()}
                                    rules={[
                                        {
                                            required: true
                                        }
                                    ]}
                                    width={"lg"}
                                />
                            </Col>
                            <Col span={16}>
                                <ProFormTextArea
                                    name={"Remark"}
                                    label="Remark"
                                    allowClear
                                />
                            </Col>
                        </Row>
                    </Card>
                </Flex>
            </ProForm>
        </FormModalComp>
    )
}

export default MpuPurchaseOrderForm