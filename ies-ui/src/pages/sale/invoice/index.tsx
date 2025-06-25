import { TableViewSearchParams } from "@/components/DataCrud/TableView";
import PageWrapper from "@/components/PageWrapper";
import { PlusOutlined, SyncOutlined, DollarOutlined, CloseCircleOutlined, CheckCircleOutlined, EditOutlined } from "@ant-design/icons";
import { useQuery } from "@umijs/max";
import { Tag, Button, Modal, message } from "antd";
import { useRef, useState } from "react";
import MpuPoEntryForm from "../mpu/purchase_order/MpuPOEntryForm";
import MpuPoDetail from "../warehouse/MpuPODetail";
import { ActionType, ProTable } from "@ant-design/pro-components";
import { simpleRequestActions } from "@/services/model";
import { InvoiceServiceAPI } from "./service";
import { LeadLess, SaleInvoiceLess } from "@/services/sale/data";
import numeral from 'numeral';
import AdvanceSearch from "./AdvanceSearch";
import RemarkModalForm from "../component/RemarkModal";

export default () => {
    const requestActions = simpleRequestActions();
    const [filter, setFilter] = useState<TableViewSearchParams<any>>({
        criteria: { advanceSearch: { status: 'ALL', } },
    });
    const actionRef = useRef<ActionType>();

    const { data, isFetching, refetch } = useQuery(
        ['fetch-po-list', filter],
        () => InvoiceServiceAPI(requestActions).pageInvoice(filter),
        {
            refetchOnWindowFocus: false,
            keepPreviousData: false,
        },
    );
    const [advanceSearch, setAdvanceSearch] = useState<{
        isVisibled: boolean;
        value?: any;
    }>({
        isVisibled: false,
    });
    const [remarkState, setRemarkState] = useState<{ visble?: { name: "MODAL", paload?: SaleInvoiceLess } }>();
    const getCustomerName = (it?: LeadLess): string => {
        const name =
            it?.internalName !== null
                ? it?.internalName
                : it?.firstName !== null && it?.lastName !== null
                    ? `${it?.firstName} ${it?.lastName}`
                    : it?.firstName !== null
                        ? it?.firstName
                        : it?.lastName || '';
        return `${name} - ( ${it?.phone} )`;
    };

    const expandedRowRender = (parent: SaleInvoiceLess) => {
        return parent.items.length > 0 ? (
            <ProTable
                size={'small'}
                style={{ backgroundColor: '#EEE' }}
                key={'key'}
                rowKey={'id'}
                columns={[
                    { title: '#', dataIndex: 'index', key: 'key' },
                    {
                        title: 'Batch No',
                        render: (_, r) => {
                            return r.batchNo === 'n/a' ? '-' : r.batchNo;
                        },
                    },
                    { title: 'Code', dataIndex: 'itemCode' },
                    { title: 'Description', dataIndex: 'itemName' },
                    {
                        title: 'Type',
                        render: (_, r) => {
                            return <Tag color={r.itemType === 'FOC' ? 'error' : 'success'}>{r.itemType}</Tag>;
                            // return r.itemType;
                        },
                    },
                    { title: 'Quantity', dataIndex: 'quantity' },
                    { title: 'UOM', dataIndex: 'uom' },
                    {
                        title: 'Unit Price',
                        align: 'right',
                        render: (_, r) => {
                            return `$ ${numeral(r.unitPrice).format('0,0.000')}`;
                        },
                    },
                    {
                        title: 'Amount',
                        align: 'right',
                        render: (_, r) => {
                            return `$ ${numeral(r.quantity * r.unitPrice).format('0,0.000')}`;
                        },
                    },

                ]}
                headerTitle={false}
                search={false}
                options={false}
                dataSource={parent.items.sort((a, b) =>
                    parseInt(a.itemCode) < parseInt(b.itemCode) ? 1 : 0,
                )}
                pagination={false}
            />
        ) : (
            <div key={parent.id} style={{ textAlign: 'center', fontWeight: 'bold', color: 'gray' }}>
                No Data
            </div>
        );
    };

    return (
        <>
            <PageWrapper<any, any, ''>
                tabRender={(items) => [
                    {
                        action: 'view',
                        tabKey: items?.id,
                        panel: ({ onAddTab, onUpdateTab, key }) => (
                            <MpuPoDetail
                                id={items?.id}
                                onEdit={() => onUpdateTab?.('edit', undefined, undefined, key)}
                                onAdd={() => onAddTab?.('add', undefined, key)}
                            />
                        ),
                        tabLabel: `${items?.purchaseOrderCode}`,
                    },
                    {
                        action: 'edit',
                        tabKey: 'edit',
                        panel: ({ onUpdateTab, key }) => (
                            <MpuPoEntryForm
                                type={'EDIT'}
                                onView={() => onUpdateTab?.('view', undefined, undefined, key)}
                                onBack={() => {
                                    onUpdateTab?.('view', undefined, undefined, key);
                                    refetch();
                                }}
                                id={items?.id}
                            />
                        ),
                        tabLabel: `Edit ${items?.purchaseOrderCode}`,
                    },
                ]}
                listView={{
                    onOpenAdvanceSearch: () => setAdvanceSearch({ isVisibled: true }),
                    statuses: [
                        { option: { value: 'ALL', label: 'All' } },
                        { option: { value: 'Pending', label: 'Pending' } },
                        { option: { value: 'Paid', label: 'Paid' } },
                        { option: { value: 'deleted', label: 'Deleted' } },
                    ],
                    type: 'Table',
                    title: 'Invoices',
                    onRefresh: refetch,
                    actionButtons: [
                        {
                            icon: <PlusOutlined />,
                            type: 'link',
                            addNewTab: true,
                        },
                    ],
                    onFilter(params, page, sort) {
                        setFilter(() => ({
                            criteria: {
                                ...params,
                                advanceSearch: {
                                    ...filter.criteria?.advanceSearch,
                                    status:params?.status
                                }
                            },
                            pagination: { ...page },
                            sort: sort,
                        }));
                        console.log( params);
                    },

                    props: {
                        dataSource: data?.items,
                        actionRef: actionRef,
                        loading: isFetching,
                        pagination: { total: data?.total },
                        expandable: { expandedRowRender },
                        columns: [
                            {
                                title: 'Number',
                                dataIndex: 'invoiceNo',
                                // actionProps: (item) => ({
                                //     type: 'view',
                                //     label: item.invoiceNo || 'n/a',
                                // }),
                            },
                            {
                                title: 'Date',
                                dataIndex: 'invoiceDate',
                                valueType: 'date',
                            },
                            {
                                title: 'Customer',
                                render: (_, r) => getCustomerName(r.customer)
                            },

                            {
                                title: 'Salesperson',
                                render: (_, r) => `${r.salesperson?.salespersonCode} - ${r.salesperson?.salespersonName}`
                            },
                            {
                                title: 'Amount',
                                render: (_, r) => {
                                    return `$ ${numeral(r.amount).format('0,0.000')}`;
                                },

                            },
                            {
                                title: 'Remark',
                                dataIndex: 'remark',
                            },
                            {
                                title: 'Status',
                                dataIndex: 'status',
                                render: (_, r) => (
                                    <Tag
                                        icon={
                                            r.status === 'Pending' ? (
                                                <SyncOutlined spin />
                                            ) : r.status === 'Paid' ? (
                                                <DollarOutlined />
                                            ) : r.status === 'Rejected' ? (
                                                <CloseCircleOutlined />
                                            ) : (
                                                <CheckCircleOutlined />
                                            )
                                        }
                                        bordered={false}
                                        color={
                                            r.status === 'Pending'
                                                ? 'processing'
                                                : r.status === 'Paid'
                                                    ? 'default'
                                                    : r.status === 'deleted'
                                                        ? 'error'
                                                        : 'success'
                                        }
                                    >
                                        {r.status}
                                    </Tag>
                                ),
                            },
                            {
                                title: 'Action',
                                align: 'center',
                                render: (_, r) => {
                                    return (
                                        <Button
                                            // disabled={r.status !== 'Pending'}
                                            type="link"
                                            onClick={() => setRemarkState({ visble: { name: "MODAL", paload: r } })}
                                            icon={<EditOutlined />}
                                        />
                                    );
                                },
                            },
                        ],
                    },
                }}
            />

            <AdvanceSearch
                width={500}
                title="Advance Search"
                open={advanceSearch.isVisibled}
                entity="Purchase Order"
                onOpenChange={(visible) => {
                    if (!visible) {
                        setAdvanceSearch({ isVisibled: false });
                    }
                }}
                onSearch={(data) => {
                    setFilter({
                        criteria: {
                            ...filter.criteria,
                            advanceSearch: {
                                ...filter.criteria?.advanceSearch,
                                ...data,
                            }
                        },
                    });
                }}
                onReset={() => {
                    setFilter((v) => ({
                        ...v,
                        criteria: {
                            ...filter.criteria,
                            advanceSearch: {
                                salespersonId: undefined,
                                dates: undefined,
                            },
                        },
                    }));
                }}
                initData={filter.criteria?.advanceSearch}
            />

            <RemarkModalForm
                open={remarkState?.visble?.name === "MODAL"}
                onSave={({ remark }) => {
                    Modal.confirm({
                        title: "Confirmation",
                        content: "do you want save?",
                        onOk: async () => {
                            await InvoiceServiceAPI(requestActions).saveSaleInvoiceRemark({ id: remarkState?.visble?.paload?.id, remark: remark });
                            setRemarkState({ visble: undefined });
                            message.success("Success!");
                            refetch();
                        }
                    });
                }}
                onCancel={() => setRemarkState({ visble: undefined })}
                showAlertInfo={false} />
        </>
    )
}

