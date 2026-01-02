import { simpleRequestActions } from "@/services/model";
import {
    EditableProTable,
    ModalForm,
    ModalFormProps,
    ProFormMoney,
    ProFormSelect,
    ProFormText,
    ProFormTextArea,
} from "@ant-design/pro-components";
import { Button, Divider, Form, Space, Table } from "antd";
import { useForm } from "antd/es/form/Form";
import { useEffect, useState } from "react";
import { InvoiceServiceAPI } from "../../invoice/service";
import moment from "moment";
import { SupporterServiceAPI } from "../services";
interface Props extends ModalFormProps {
    open: boolean;
    actionType?: string
}

const InvoiceCorrectForm = (props: Props) => {
    const [form] = useForm<any>();
    const requestActions = simpleRequestActions();

    const [invoiceList, setInvoiceList] = useState<any[]>([]);
    const [editableKeys, setEditableKeys] = useState<React.Key[]>([]);

    /* ✅ Watch items safely */
    const items = Form.useWatch("items", form);

    /* ✅ Compute total (NO setState, NO setFieldValue) */
    const totalAmount = (items || [])?.reduce(
        (sum: number, item: any) =>
            sum + Number(item.quantity || 0) * Number(item.unitPrice || 0),
        0
    );

    useEffect(() => {
        if (props.open) {
            form.resetFields();
            setEditableKeys([]);
        }
    }, [props.open]);

    const onInvoiceChange = (invoiceId: number) => {
        const invoice = invoiceList.find((o) => o.id === invoiceId);
        const items = invoice?.items || [];

        form.setFieldValue("items", items);
        setEditableKeys(items.map((i: any) => i.id));
    };

    return (
        <ModalForm
            {...props}
            form={form}
            layout="horizontal"
            title="Invoice Correction"
            onFinish={async () => {
                const dataForm = await form.validateFields();
                const entry = {
                    ...dataForm,
                    actionType: "INVOICE",
                    totalAmount: totalAmount,
                    items: dataForm.items?.map((p: any) => ({ id: p.id, itemCode: p.itemCode, itemId: p.itemId, qty: p.quantity, price: p.unitPrice, status: p.status?.[0], }))
                }

                await SupporterServiceAPI(requestActions).poTodo(entry);
                if (props.modalProps?.onCancel) {
                    props?.modalProps?.onCancel();
                }
                return true
            }}
        >
            <ProFormSelect
                label="Invoice"
                name="invoiceId"
                showSearch
                rules={[{ required: true }]}
                onChange={onInvoiceChange}
                request={async ({ keyWords }) => {
                    const data = await InvoiceServiceAPI(requestActions).pageInvoice({
                        criteria: { searchValue: keyWords },
                    });

                    setInvoiceList(data.items || []);

                    return data.items.map((o: any) => ({
                        label: [
                            o.invoiceNo,
                            o.salesperson,
                            moment(o.invoiceDate).format("DD/MM/YYYY"),
                        ]
                            .filter(Boolean)
                            .join(" - "),
                        value: o.id,
                    }));
                }}
            />

            <EditableProTable
                rowKey="id"
                name="items"
                size="small"
                recordCreatorProps={false}
                editable={{
                    type: "multiple",
                    editableKeys,
                    onChange: setEditableKeys,
                }}
                columns={[
                    {
                        title: "Product",
                        editable: false,
                        render: (_, r) =>
                            `${r.itemCode || ""} - ${r.itemName || ""}`,
                    },
                    {
                        title: "Type",
                        editable: false,
                        dataIndex: "itemType"
                    },
                    {
                        title: "Quantity",
                        dataIndex: "quantity",
                        width: 120,
                        valueType: "digit",
                    },
                    {
                        title: "Price",
                        dataIndex: "unitPrice",
                        width: 120,
                    },
                    {
                        title: "Amount",
                        width: 120,
                        editable: false,
                        align: "right",
                        render: (_, r) =>
                            (Number(r.quantity || 0) * Number(r.unitPrice || 0))?.toFixed(3),
                    },
                ]}
                summary={(item) => {
                    return <>
                        <Table.Summary>
                            <Table.Summary.Row>
                                <Table.Summary.Cell index={0} colSpan={4} align="right">Total</Table.Summary.Cell>
                                <Table.Summary.Cell index={4} align="right">{totalAmount.toFixed(3)}</Table.Summary.Cell>
                            </Table.Summary.Row>
                        </Table.Summary>
                    </>
                }}
            />
            <Divider />
            <ProFormTextArea
                name="remark"
                label="Remarks"
                rules={[{ required: true }]}
            />


            {/* ✅ TOTAL (READ ONLY, LOOP-FREE) */}
            <ProFormMoney
                label="Total Amount"
                fieldProps={{ value: totalAmount.toFixed(3) }}
                readonly
                hidden
            />


        </ModalForm>
    );
};

export default InvoiceCorrectForm;
