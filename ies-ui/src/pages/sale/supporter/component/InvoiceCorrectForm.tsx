import { simpleRequestActions } from "@/services/model";
import {
    EditableProTable,
    ModalForm,
    ModalFormProps,
    ProFormMoney,
    ProFormSelect,
    ProFormTextArea,
} from "@ant-design/pro-components";
import { Divider, Form, Table } from "antd";
import { useForm } from "antd/es/form/Form";
import { useEffect, useMemo, useState } from "react";
import { InvoiceServiceAPI } from "../../invoice/service";
import moment from "moment";
import { SupporterServiceAPI } from "../services";

interface Props extends ModalFormProps {
    open: boolean;
    actionType?: string;
}

const InvoiceCorrectForm = (props: Props) => {
    const [form] = useForm<any>();
    const requestActions = simpleRequestActions();

    const [invoiceList, setInvoiceList] = useState<any[]>([]);
    const [editableKeys, setEditableKeys] = useState<React.Key[]>([]);

    /* ---------------------------------- */
    /* SAFE WATCH ITEMS                   */
    /* ---------------------------------- */
    const rawItems = Form.useWatch("items", form);

    /**
     * EditableProTable may return:
     * - []
     * - undefined
     * - {}
     * - { dataSource: [] }
     */
    const items: any[] = useMemo(() => {
        if (Array.isArray(rawItems)) return rawItems;
        if (rawItems?.dataSource && Array.isArray(rawItems.dataSource)) {
            return rawItems.dataSource;
        }
        return [];
    }, [rawItems]);

    /* ---------------------------------- */
    /* TOTAL AMOUNT (SAFE)                */
    /* ---------------------------------- */
    const totalAmount = useMemo(() => {
        return items.reduce((sum, item) => {
            const qty = Number(item?.quantity ?? 0);
            const price = Number(item?.unitPrice ?? 0);
            return sum + qty * price;
        }, 0);
    }, [items]);

    /* ---------------------------------- */
    /* RESET WHEN OPEN                    */
    /* ---------------------------------- */
    useEffect(() => {
        if (props.open) {
            form.resetFields();
            setEditableKeys([]);
        }
    }, [props.open]);

    /* ---------------------------------- */
    /* INVOICE CHANGE                     */
    /* ---------------------------------- */
    const onInvoiceChange = (invoiceId: number) => {
        const invoice = invoiceList.find(o => o.id === invoiceId);
        const invoiceItems = Array.isArray(invoice?.items) ? invoice.items : [];

        form.setFieldValue("items", invoiceItems);
        setEditableKeys(invoiceItems.map((i: any) => i.id));
    };

    /* ---------------------------------- */
    /* SUBMIT                             */
    /* ---------------------------------- */
    const onFinish = async () => {
        const dataForm = await form.validateFields();

        const payload = {
            ...dataForm,
            actionType: "INVOICE",
            totalAmount,
            items: items.map((p: any) => ({
                id: p.id,
                itemCode: p.itemCode,
                itemId: p.itemId,
                qty: p.quantity,
                price: p.unitPrice,
                status: p.status?.[0],
            })),
        };

        await SupporterServiceAPI(requestActions).poTodo(payload);

        props.modalProps?.onCancel?.();
        return true;
    };

    /* ---------------------------------- */
    /* RENDER                             */
    /* ---------------------------------- */
    return (
        <ModalForm
            {...props}
            form={form}
            layout="horizontal"
            title="Invoice Correction"
            onFinish={onFinish}
        >
            {/* ---------------- Invoice ---------------- */}
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

                    return (data.items || []).map((o: any) => ({
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

            {/* ---------------- Items ---------------- */}
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
                            `${r.itemCode ?? ""} - ${r.itemName ?? ""}`,
                    },
                    {
                        title: "Type",
                        editable: false,
                        dataIndex: "itemType",
                    },
                    {
                        title: "Quantity",
                        dataIndex: "quantity",
                        valueType: "digit",
                        editable: false,
                        width: 120,
                    },
                    {
                        title: "Price",
                        dataIndex: "unitPrice",
                        width: 120,
                    },
                    {
                        title: "Amount",
                        width: 120,
                        align: "right",
                        editable: false,
                        render: (_, r) =>
                            (
                                Number(r.quantity ?? 0) * Number(r.unitPrice ?? 0)
                            ).toFixed(3),
                    },
                ]}
                summary={() => (
                    <Table.Summary>
                        <Table.Summary.Row>
                            <Table.Summary.Cell index={0} colSpan={4} align="right">
                                <strong>Total</strong>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={4} align="right">
                                <strong>{totalAmount.toFixed(3)}</strong>
                            </Table.Summary.Cell>
                        </Table.Summary.Row>
                    </Table.Summary>
                )}
            />

            <Divider />

            {/* ---------------- Remark ---------------- */}
            <ProFormTextArea
                name="remark"
                label="Remarks"
                rules={[{ required: true }]}
            />

            {/* ---------------- Total (Hidden) ---------------- */}
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
