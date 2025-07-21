import ImportFileButton from "@/components/ImportFileButton"
import PageWrapper from "@/components/PageWrapper"
import { ImportDataItem, ImportDataResponse } from "@/services/shared/data"
import { Button, message } from "antd"
import { useRef, useState } from "react"
import UploadDataModal from "./UploadDataModal"
import { useQuery } from "@umijs/max"
import { ShippingAddressAPI } from "./services"
import { simpleRequestActions } from "@/services/model"
import { TableViewSearchParams } from "@/components/DataCrud/TableView"
import { ActionType } from "@ant-design/pro-components"
import ShippingAddressDetail from "./Detail"
import { ExportOutlined, SwapOutlined } from "@ant-design/icons"
import { model } from "../customer/model"
import TransferSE from "./TransferSE"
import { downloadGenericReport } from "@/services/apiGateway"
import moment from "moment"
import { getUrlReporting } from "@/pages/ReportUrl"
import ExportCustomerShippingAddress from "./ExportForm"

export default () => {
    const [importData, setImportData] = useState<ImportDataResponse>();
    const [loading, setLoading] = useState(false);
    const requestActions = simpleRequestActions();
    const requestAction = simpleRequestActions()
    const [filter, setFilter] = useState<TableViewSearchParams<any>>({
        criteria: {}
    });
    const { state, ops, modals } = model();
    const actionRef = useRef<ActionType>();
    const { data, isFetching, refetch } = useQuery({
        queryKey: ["shipping-address", filter],
        queryFn: () => ShippingAddressAPI(requestAction).page({ ...filter }),
        refetchOnWindowFocus: false
    });
    const [exportState, setExportState] = useState<{
        visible?: { name: "MODAL", payloads?: any }
    }>();

    const onDowloadReportHandler = async (params: any) => {

        try {
            const reportName = 'customer-shipping-address';
            await downloadGenericReport(requestActions)({
                fileName: `${reportName}-${moment().format()}.xls`,
                type: 'EXCEL',
                data: {
                    reportName: reportName,
                    reportPath: getUrlReporting('crm'),
                    data: [
                        { key: "regionIds", type: "string", value: params.regionId },
                        { key: "provinceIds", type: "string", value: params.provinceId },
                        { key: "customerTypeIds", type: "string", value: params.customerTypeId },
                        { key: "salespersonIds", type: "string", value: params.salespersonId },
                        { key: "status", type: "string", value: params.status },
                    ],
                },
            }).then(() => { });
            message.success('Export successfully.');
        } catch (error: any) {
            message.error(error.message || 'Failed to generate report.');
        }
    };

    return (
        <>
            <PageWrapper
                tabRender={(item) => [
                    {
                        tabKey: item?.code,
                        tabLabel: item?.code,
                        action: "view",
                        panel: (_) => <ShippingAddressDetail openInTab id={item?.id} item={item} />
                    }
                ]}
                listView={{
                    actionButtons: [
                        <ImportFileButton<ImportDataItem>
                            importedKey="CUSTOMER_SHIPPING_ADDRESS"
                            onDataResponse={data => {
                                setImportData(data)
                            }}
                            key={'import-customer-shiped-address'}
                            onHandleChange={(status) => {
                                setLoading(status == 'uploading');
                                if (status == 'done') {
                                    message.info('Data uploaded.');
                                }
                            }}
                        />,
                        <Button icon={<ExportOutlined />}
                            onClick={async () => setExportState({ visible: { name: "MODAL" } })} type="link">Export</Button>
                    ],
                    actions: [
                        { key: 'TRANSFER', label: 'Transfer SE', onClick: () => modals.showModal('transfer-customers'), icon: <SwapOutlined style={{ fontSize: '16px', color: '#08c' }} /> }
                    ],
                    title: "Shipping Address",
                    type: "Table",
                    onFilter(params, page, sort) {
                        setFilter(v => ({
                            ...v,
                            keywords: params?.searchValue,
                            criteria: { ...v.criteria, ...params, status: params?.status == "ALL" ? undefined : params?.status || 'COMPLETED' },
                            pagination: { ...page },
                            sort: sort
                        }))
                    },
                    onRefresh: refetch,
                    props: {
                        dataSource: data?.items,
                        loading: isFetching,
                        actionRef: actionRef,
                        pagination: {
                            total: data?.total,
                        },
                        columns: [
                            {
                                title: "Shipping ID",
                                dataIndex: "code",
                                actionProps: (item) => ({
                                    type: 'view',
                                    label: item.code || '',
                                    // actionButtons: [{ type: 'link', size: 'small', icon: <ExportOutlined />, onClick: () => window.open(`/external/crm/customer/detail/${item.id}`, '_blank')?.focus() }]
                                }),
                            },
                            {
                                title: "Customer",
                                dataIndex: "customerCode"
                            },
                            {
                                title: "Address",
                                dataIndex: "addressCode"
                            },
                            {
                                title: "Salesperson Code",
                                width: 130,
                                render: (_, r) => r.salesperson?.code
                            },
                            {
                                title: "Salesperson Name",
                                render: (_, r) => r.salesperson?.name
                            }
                        ]
                    }
                }}
            />
            {modals.isVisible('transfer-customers') && <TransferSE
                open={true}
                onOpenChange={(visible) => !visible && modals.hideModal('transfer-customers')} />}
            <UploadDataModal title="Import indirect customer" onCancel={() => setImportData(undefined)} open={!!importData} data={importData} />
            <ExportCustomerShippingAddress
                title="Export Customer"
                open={exportState?.visible?.name == "MODAL"}
                onCancel={() => setExportState({ visible: undefined })}
                confirmLoading={state.loading}
                lookupDataList={state.initData?.lookupDataList || []}
                outletTypeList={state.initData?.outletTypeList || []}
                seList={state.initData?.seList || []}
                provinceList={state.initData?.provinceList || []}
                regionList={state.initData?.regionList || []}
                onExport={async (data) => {
                    try {
                        await onDowloadReportHandler(data);
                    } catch (error: any) {
                        message.error(error.message || 'Failed to export.');
                    }
                }}
            />
        </>
    )
}