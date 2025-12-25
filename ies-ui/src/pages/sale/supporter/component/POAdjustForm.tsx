import { EditableProTable, ModalForm, ModalFormProps, ProFormCheckbox, ProFormDatePicker, ProFormDependency, ProFormDigit, ProFormList, ProFormMoney, ProFormSelect, ProFormText, ProFormTextArea } from "@ant-design/pro-components"
import { Alert } from "antd";
import { useForm } from "antd/es/form/Form"
import { PurchaseOrderServiceAPI } from "../../mpu/purchase_order/services";
import { simpleRequestActions } from "@/services/model";
import { SupporterAPI, SupporterServiceAPI } from "../services";
import { useQuery } from "@umijs/max";
import { PurChaseRequestAPIService } from "../../mpu/request/service";
import { log } from "console";
import { useEffect, useState } from "react";

interface Props extends ModalFormProps {
    actionType: string
}

const POAdjustForm: React.FC<Props> = ({ actionType, ...props }) => {
    const [form] = useForm<any>();
    const requestActions = simpleRequestActions();
    const typeOption = [
        {
            value: "ROllBACK_DATE",
            label: "Rollback Date",
            description: "Revert the purchase order to a previous transaction date."
        },
        {
            value: "CHANGE_ITEM_QTY",
            label: "Change Quantity",
            description: "Adjust the item quantity in the purchase order."
        },
        {
            value: "CHANGE_ITEM_PRICE",
            label: "Change Price",
            description: "Update or correct the item pricing in the purchase order."
        },
        {
            value: "REJECT_ITEM",
            label: "Reject Item",
            description: "Mark the item as rejected and exclude it from the purchase order."
        }
    ];

    useEffect(() => {
        props.open && form.resetFields();
    }, [props.open])

    const selectedType = typeOption.find(item => item.value === actionType);
    const [poIdState, setPoIdState] = useState<number>();
    // const { data, isFetching, refetch } = useQuery({
    //     queryKey: ["asas", poIdState],
    //     queryFn: () => PurchaseOrderServiceAPI(requestActions).detail(poIdState),
    //     refetchOnWindowFocus: false
    // });

    // useEffect(() => {
    //     if (actionType === "CHANGE_ITEM_PRICE") {
    //         form.setFieldsValue({
    //             items: data.items
    //         });
    //     }
    // }, [ actionType]);

    // poIdState && form.setFieldValue("items", poIdState)


    return (
        <>
            <ModalForm
                {...props}
                form={form}
                title="PO Adjustment & Correction"
                onValuesChange={async (values) => {
                    if (values.poId && values.poId !== poIdState) {
                        const dd = await PurchaseOrderServiceAPI(requestActions).detail(values.poId)
                        form.setFieldValue("items", dd.items)
                        // setPoIdState(values.poId);
                    }
                }}
                // onValuesChange={async (e) => {
                //     if (e.poId) {
                //         // const dd = await PurchaseOrderServiceAPI(requestActions).detail(e.poId)
                //         setPoIdState(e.poId);
                //         // console.log(dd.items);

                //         // form.setFieldValue("items", dd.items)
                //     }
                //     // e.poId && setPoIdState(e.poId);
                // }}
                onFinish={async () => {
                    const dataForm = await form.validateFields();
                    const entry = {
                        ...dataForm,
                        actionType: actionType,
                        items: dataForm.items?.map(p => ({ id: p.id, itemCode: p.itemCode, itemId: p.itemId, qty: p.quantity, price: p.pricing, status: p.status?.[0] }))
                    }

                    console.log(entry);

                    await SupporterServiceAPI(requestActions).poTodo(entry);

                    // if (props.modalProps?.onCancel) {
                    //     props?.modalProps?.onCancel();
                    // }
                    // return true
                }}
            >
                <Alert
                    title={selectedType?.label}
                    description={selectedType?.description}
                    type="warning"
                />
                <ProFormSelect
                    label={"PO"}
                    name={"poId"}
                    showSearch
                    rules={[{ required: true }]}
                    request={async ({ keyWords }) => {
                        const data = await PurchaseOrderServiceAPI(requestActions).page({
                            criteria: {
                                searchValue: keyWords,
                              
                            }
                        });

                        return data.items.map((o) => ({
                            label: [o.purchaseOrderCode, o.distributorCode, o.assignedTo].filter(p => p).join("/"),
                            value: o.id
                        }))
                    }}
                />

                {
                    (actionType == "ROllBACK_DATE" && <ProFormDatePicker name={"date"} label={"Date Change"} />) ||
                    actionType === "CHANGE_ITEM_PRICE" && (
                        <EditableProTable
                            rowKey="id"
                            name="items"
                            recordCreatorProps={false}
                            size="small"
                            editable={{
                                type: 'multiple',
                                editableKeys: form.getFieldValue("items")?.map((p) => p.id) || [],
                                onValuesChange: (_, recordList) => {
                                    form.setFieldValue("items", recordList);
                                },
                            }}
                            columns={[
                                {
                                    editable: false,
                                    title: "Product",
                                    render: (_, r) => `${r.itemCode || ""} - ${r.itemName || ""}`,
                                },
                                {
                                    title: "Quantity",
                                    dataIndex: "quantity",
                                    width: 120
                                },
                                {
                                    title: "Price",
                                    dataIndex: "pricing",
                                    width: 120
                                },
                                {
                                    title: "Rejected",
                                    dataIndex: "status",
                                    valueType: "select",
                                    valueEnum: {
                                        Loaded: { text: "Loaded" },
                                        Rejected: { text: "Rejected" }
                                    },
                                },

                            ]}
                        />
                    )

                }


                <ProFormTextArea
                    name="reamark"
                    label="Remarks"
                    rules={[{ required: true }]}
                />

            </ModalForm>
        </>
    )
}

export default POAdjustForm