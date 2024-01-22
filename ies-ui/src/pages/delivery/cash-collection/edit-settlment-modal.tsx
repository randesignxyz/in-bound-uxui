import { formatter, formatterKh } from "@/pages/utils"
import { MultiRequest, execDataService0, fetchDataItemService } from "@/services/apiGateway"
import { AddedInvoice, CashCollections, CheckoutInvoice, CheckoutListItem } from "@/services/delivery/data"
import { simpleRequestActions } from "@/services/model"
import { DeleteOutlined } from "@ant-design/icons"
import { EditableFormInstance, EditableProTable, ModalForm, ProCard } from "@ant-design/pro-components"
import { Button, Card, Checkbox, Col, Modal, Row, Space, Tag, message } from "antd"
import { uniqueId } from "lodash"
import { useEffect, useRef, useState } from "react"

const lookupData = {
    currentcy: [{ id: 'RIEL', name: 'RIEL' }, { id: 'USD', name: 'USD' }],
    paymentMethod: [{ id: 'CASH', name: 'Cash' }, { id: 'BANK', name: 'Bank' }, { id: 'CHEQUE', name: 'Cheque' }, { id: 'RECONCILE', name: 'Reconcile' }, { id: 'NONE', name: 'None' }],
    bank: [{ id: 'ABA', name: "ABA" }, { id: 'WING', name: "Wing" }, { id: 'ACLEDA', name: 'ACLEDA' }, { id: 'OTHER', name: 'Other' }]
}

export default ({ trigger, disabledAddInvoice, data: { checkout, freightId }, onRefresh }: { 
    trigger: JSX.Element, 
    disabledAddInvoice?: true,
    data: { checkout: CheckoutListItem, freightId: number  }, 
    onRefresh?: () => void }) => {

    const requestActions = simpleRequestActions()

    const [data] = useState<{ paymentMethod: { id: string, name: string }[], bank: { id: string, name: string }[], currentcy: { id: string, name: string }[] }>(lookupData)
    const [exchangeRate, setExchangeRate] = useState<number>()

    const [payments, setPayments] = useState<(CashCollections & { key: string, currentcy: string, modifiedRemarks?: string })[]>([])
    const [invoices, setInvices] = useState<(CheckoutInvoice & { key: string })[]>([])

    const editableFormRef1 = useRef<EditableFormInstance>();
    const editableFormRef2 = useRef<EditableFormInstance>();
    const [open, setOpen] = useState(false)

    useEffect(() => {
        if (open) {
            initData()
        }
    }, [open])

    const initData = async () => {
        setPayments(checkout.cashCollections.map(it => ({ ...it, currentcy: it.localCurrency ? 'RIEL' : 'USD', key: uniqueId() })))
        setInvices(checkout.invoices.map(it => ({ ...it, key: uniqueId() })))

        const rs = await fetchDataItemService<{ rate: number }>({
            actionName: 'fetch-exchange-rate',
            endpoint: 'DELIVERY',
        }).query(requestActions)

        setExchangeRate(rs.rate)
    }

    const getTotalIinvoiceAmount = () => invoices.map(it => it.invoiceAmount || 0).reduce((c, p) => c + p, 0)

    const getPayments = () => {
        const paymentLocalInUSD = payments.filter(it => it.currentcy != 'USD').map(it => it.paidAmount).reduce((c, p) => c + p, 0)
        const paymentUSD = payments.filter(it => it.currentcy == 'USD').map(it => it.paidAmount).reduce((c, p) => c + p, 0)
        const paymentLocal = paymentLocalInUSD * (exchangeRate || 1)
        return {
            paymentUSD: paymentUSD,
            paymentLocal: paymentLocal,
            paymentLocalInUSD: paymentLocalInUSD,
            totalPayment: paymentUSD + paymentLocalInUSD
        }
    }
    return (
        <ModalForm width={1000}
            title={`Editing for ${checkout.customerCode}-${checkout.customerName}`}
            open={open}
            onOpenChange={setOpen}
            onFinish={async () => {
                await editableFormRef1.current?.validateFields()
                await editableFormRef2.current?.validateFields()

                const invoiceAmount = getTotalIinvoiceAmount()
                const paymentAmount = getPayments()

                if (invoiceAmount > paymentAmount.totalPayment) {
                    message.error("Partial payment is not allowed.")
                    return
                }


                if (invoiceAmount < paymentAmount.totalPayment) {
                    message.error("Overpaid is not allowed.")
                    return
                }

                Modal.confirm({
                    title: "Payment adjustment",
                    content: "Are you sure?",
                    onOk: async () => {
                        try {
                            await execDataService0<{
                                freightId: number;
                                cashCollections: CashCollections[],
                                addedInvoices: AddedInvoice[]
                            }>({
                                actionName: 'edit-payment',
                                endpoint: 'DELIVERY',
                                payload: {
                                    freightId: freightId,
                                    addedInvoices: invoices.filter(it => it.paymentTerm != 'COD').map(it => ({invoiceNum: it.invoiceNum, invoiceAmount: it.invoiceAmount })),
                                    cashCollections: payments.map(it => ({
                                        paymentMethod: it.paymentMethod, 
                                        bank: it.bank,
                                        localCurrency: it.currentcy != 'USD',
                                        paidAmount: it.paidAmount,
                                        exchangeRate: exchangeRate,
                                        remarks: it.remarks,
                                        images: it.images || [],

                                        id: it.id || 0,
                                    })),
                                }
                            })(requestActions)
                            onRefresh?.()
                            setOpen(false)
                        } catch (error: any) {
                            message.error(error.message || 'Failed to submit.')
                        }
                    }
                })
            }}

            trigger={trigger}>

            <Space direction="vertical" style={{ width: '100%' }}>

                <ProCard bordered title="Invoice">
                    <EditableProTable<CheckoutInvoice & { key: string }>
                        value={invoices}
                        editableFormRef={editableFormRef1}
                        rowKey="key"
                        controlled
                        footer={() => <Row>
                            <Col flex={1} style={{ fontWeight: 'bolder' }}>Total Invoice Amount</Col>
                            <Col flex={'200px'} style={{ fontWeight: 'bolder', textAlign: 'right' }}> {formatter.format(getTotalIinvoiceAmount())} </Col>
                        </Row>}
                        columns={[
                            {
                                formItemProps: { rules: [{ required: true }] },
                                title: 'Invoice Num', fieldProps(form, config) {
                                    const readOnly = !invoices.find(it => it.key == config.rowKey)?.manualAdded
                                    return { readOnly: readOnly, }
                                }, dataIndex: "invoiceNum",
                            },
                            {
                                formItemProps: { rules: [{ required: true }] },
                                valueType: 'money',
                                width: 150,
                                title: 'Amount', dataIndex: "invoiceAmount", align: 'right', fieldProps(_, config) {
                                    const readOnly = !invoices.find(it => it.key == config.rowKey)?.manualAdded
                                    return { readOnly: readOnly, style: { width: 140 } }
                                }
                            },
                            { title: 'Payment Term', dataIndex: 'paymentTerm', readonly: true },
                            {
                                title: 'Manual Added',
                                align: 'center',
                                dataIndex: 'manualAdded',
                                width: 120,
                                renderFormItem: (_, config) => { return config.record?.manualAdded ? <Checkbox checked /> : '' },
                            },
                            { valueType: 'option', width: 50, render: () => { return null; }, },
                        ]}
                        recordCreatorProps={!disabledAddInvoice && {
                            creatorButtonText: 'Add Invoice',
                            newRecordType: 'dataSource',
                            record: (index) => {
                                const key = uniqueId('invoice-item')
                                return { key: key + index, manualAdded: true } as any;
                            },
                        }}
                        editable={{
                            type: 'multiple',
                            actionRender: (row, config) => [row.paymentTerm != 'COD' && <Button onClick={() => {
                                config.onDelete?.(config.recordKey, row)
                            }} type="link" key={`del-${row.id}`} icon={<DeleteOutlined />} />],
                            editableKeys: invoices.map(it => it.key),
                            onValuesChange(record, dataSource) {
                                setInvices(dataSource)
                            },
                        }}
                    />
                </ProCard>

                <ProCard bordered title='Payment' extra={<Tag> Exchange Rate: {exchangeRate} </Tag>}>
                    <EditableProTable<CashCollections & { key: string, currentcy: string, moådifiedRemarks?: string }>
                        rowKey="key"
                        value={payments}
                        controlled
                        editableFormRef={editableFormRef2}
                        columns={[
                            {
                                title: "Payment Method",
                                valueType: 'select',
                                dataIndex: 'paymentMethod',
                                formItemProps: { rules: [{ required: true }] },
                                fieldProps: { showSearch: true, options: data.paymentMethod.map(it => ({ value: it.id, label: it.name })) }
                            },
                            {
                                title: "Bank",
                                valueType: 'select',
                                dataIndex: 'bank',
                                fieldProps: { showArrow: true, },
                                formItemProps: (form, config) => {
                                    const item = form.getFieldValue(config.rowKey || '')
                                    return { ...config, rules: [{ required: item?.paymentMethod == 'BANK' }] }
                                },
                                valueEnum: (r) => {
                                    console.log(r);

                                    if (r.paymentMethod != 'BANK') {
                                        return []
                                    }
                                    return data.bank.reduce((acc, cur) => ({ ...acc, [cur.id]: cur.name }), {})
                                }

                            },
                            {
                                title: "Amount", align: 'right',
                                width: 100,
                                valueType: 'money', dataIndex: 'paidAmount',
                                formItemProps: { rules: [{ required: true }] },
                                fieldProps: { width: 200 }
                            },
                            {
                                title: 'Curr.',
                                dataIndex: 'currentcy',
                                valueType: 'select',
                                fieldProps: { showSearch: true, options: data.currentcy.map(it => ({ value: it.id, label: it.name })) }
                            },
                            { title: "Remarks",  valueType: 'textarea', fieldProps: { rows: 1 }, dataIndex: 'remarks' },
                            { valueType: 'option', width: 50, render: () => { return null; }, },
                        ]}

                        footer={() => <Row>
                            <Col flex={'150px'} style={{ fontWeight: 'bolder' }}>
                                Total Paid Amount
                            </Col>
                            <Col>
                                {(() => {
                                    const invoiceAmount = getTotalIinvoiceAmount()
                                    const payment = getPayments()
                                    if (payment.totalPayment > invoiceAmount) {
                                        return <Tag color="error">Overpaid</Tag>
                                    }
                                })()}
                            </Col>
                            <Col flex={1} style={{ fontWeight: 'bolder', textAlign: 'right' }}>
                                {(() => {
                                    const payments = getPayments()
                                    return <Space>
                                        {payments.paymentLocal > 0 && <Tag> {[
                                            payments.paymentUSD > 0 ? formatter.format(payments.paymentUSD) : undefined,
                                            payments.paymentLocal > 0 ? `${formatter.format(payments.paymentLocalInUSD)} (${formatterKh.format(payments.paymentLocal)})` : undefined
                                        ].filter(it => it).join(" + ")}
                                        </Tag>}

                                        {formatter.format((payments.totalPayment))}
                                    </Space>
                                })()}


                            </Col>
                        </Row>}
                        recordCreatorProps={{
                            creatorButtonText: 'Add Payment',
                            newRecordType: 'dataSource',

                            record: (index) => {
                                const key = uniqueId('payment-item')
                                const invoiceAmount = getTotalIinvoiceAmount()
                                const payments = getPayments()

                                const toPaidAmount = invoiceAmount - payments.totalPayment
                                return { key: key + index, paymentMethod: 'CASH', paidAmount: toPaidAmount, currentcy: 'USD' } as any;
                            },
                        }}
                        editable={{
                            type: 'multiple',
                            editableKeys: payments.map(it => it.key),
                            actionRender: (row, config) => [<Button onClick={() => {
                                config.onDelete?.(config.recordKey, row)
                            }} type="link" key={`del-${row.id}`} icon={<DeleteOutlined />} />],
                            onValuesChange(record, dataSource) {
                                if (record?.paymentMethod == "NONE" && dataSource.length > 1) {
                                    message.error("None payment is not allowed. Please make sure none payement cannot be fixed with others")
                                    setPayments(dataSource.filter(it => it.paymentMethod != 'NONE').map(it => it.key == record?.key && record?.paymentMethod != 'BANK' ? ({ ...it, bank: undefined }) : { ...it }))
                                    return
                                }

                                if (dataSource.some(it => it.paymentMethod == 'NONE') && dataSource.length > 1) {
                                    message.error("None payment is not allowed. Please make sure none payement cannot be fixed with others")
                                    return
                                }
                                setPayments(dataSource.map(it => it.key == record?.key && record?.paymentMethod != 'BANK' ? ({ ...it, bank: undefined }) : { ...it }))


                            },
                        }}
                    />
                </ProCard>

            </Space>
        </ModalForm>
    )
}