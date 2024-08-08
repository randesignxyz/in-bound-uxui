import PageWrapper from "@/components/PageWrapper"
import { formatDate, formatWithDuration } from "@/pages/utils";
import { Button, Tag } from "antd";
import { join, startCase } from "lodash";
import { VisitAvanceSearchParam, VisitDTO } from "./data";
import { simpleRequestActions } from "@/services/model";
import { SalesTeamWorkLess } from "@/services/sale/data";
import { useQuery } from "@umijs/max";
import { useState } from "react";
import { DSDReportAPI } from "../reports/service";
import { VisitServiceAPI } from "./services";
import { TableViewSearchParams } from "@/components/DataCrud/TableView";
import VisitDetailView from "./VisitDetailView";
import { GoogleEntity } from "../retailer/orders/data";
import { ReportName } from "../reports";
import GoogleMapModal from "../retailer/orders/components/GoogleMapModal";
import VisitReports from "../reports/VisitReports";

interface Props {

}

const VisitMainPage: React.FC<Props> = () => {
    const requestActions = simpleRequestActions();
    const services = VisitServiceAPI(requestActions);
    const dsdService = DSDReportAPI(requestActions);
    const [salesperson, setSalesperson] = useState<SalesTeamWorkLess[]>([]);
    const [filter, setFilter] = useState<TableViewSearchParams<VisitAvanceSearchParam>>({
        criteria: { advanceSearch: { status: 'ALL' } }
    });
    const { data, isFetching, refetch } = useQuery(['fetch-visit', filter], () => services.page(filter),
        {
            refetchOnWindowFocus: false
        });

    const [report, setReport] = useState<ReportName>();

    const [googleModal, setGoogleModal] = useState<GoogleEntity>({
        visible: false,
        id: '',
        lat: -1,
        lng: -1,
        name: '',
        internalName: '',
        phone: '',
    });

    const resetModal = () => {
        setGoogleModal({
            visible: false,
            id: '',
            lat: -1,
            lng: -1,
            internalName: '',
            name: '',
            phone: '',
        });
    };

    return (
        <>
            <PageWrapper<VisitDTO, VisitAvanceSearchParam, {}>
                tabRender={item => [
                    {
                        tabLabel: `${formatDate(item?.visitDate)}`,
                        tabKey: `visit-${item?.id}`,
                        action: "view",
                        panel: ({ }) => <VisitDetailView id={item?.id || 0} />
                    }
                ]}
                listView={{
                    title: "Visit List",
                    type: "Table",
                    onRefresh:refetch,
                    onFilter: (param, page, sort) => {
                        setFilter(v => ({
                            ...v,
                            criteria: {
                                searchValue:param?.searchValue,
                                advanceSearch: { ...param },
                                sort: sort
                            },
                            pagination: page
                        }))
                    },
                    actionButtons: [
                        <Button
                            key={'visit-export-button'}
                            type="primary"
                            onClick={() => {
                                setReport('visit-report');
                            }}
                        >
                            Visit Report
                        </Button>
                    ],
                    props: {
                        dataSource: data?.items,
                        loading: isFetching,
                        pagination: {
                            total: data?.total
                        },
                        columns: [
                            {
                                title: 'Visit Date',
                                actionProps: (item) => ({
                                    type: 'view',
                                    label: formatDate(item.visitDate) || 'n/a',
                                }),
                            },
                            {
                                title: 'Duration',
                                align: 'right',
                                render: (_, r) => formatWithDuration(r.checkInDateTime, r.checkOutDateTime),
                            },
                            {
                                title: 'Customer Name',
                                dataIndex: 'customerName',
                            },
                            {
                                title: 'Phone',
                                dataIndex: 'customerPhone',
                            },
                            {
                                title: 'Checked In Location',
                                render: (_, r) => (
                                    <Button
                                        type="link"
                                        onClick={() =>
                                            setGoogleModal({
                                                visible: true,
                                                id: `${r.id}`,
                                                lat: parseFloat(r.checkInLatitude) ?? -1,
                                                lng: parseFloat(r.checkInLongitude) ?? -1,
                                                name: r.customerName,
                                                internalName: `Address: ${r.customerAddress}`,
                                                phone: `Phone: ${r.customerPhone}`,
                                            })
                                        }
                                    >
                                        {`${r.checkInLatitude}, ${r.checkInLongitude}`}
                                    </Button>
                                ),
                            },
                            {
                                title: 'Region',
                                dataIndex: 'region',
                            },
                            {
                                title: 'Salesperson',
                                render: (_, r) => join([r.salespersonCode, r.salespersonName], ' - '),
                            },
                            {
                                title: 'Status',
                                render: (_, r) => (
                                    <Tag color={r.status === 'checked out' ? 'green' : 'red'}>{startCase(r.status)}</Tag>
                                ),
                            },
                            {
                                title: 'Sales Invoice',
                                render: (_, r) => {
                                    if (r.salesInvoice !== undefined && r.salesInvoice !== null) {
                                        return (
                                            <Button
                                                type="link"
                                            //   onClick={() =>
                                            //     history.push(`${SalePaths.soInvoice}/detail/${r.salesInvoiceId}`)
                                            //   }
                                            >
                                                {r.salesInvoice.invoiceNo}
                                            </Button>
                                        );
                                    }
                                    return '-';
                                },
                            },
                            // {
                            //   title: 'Action',
                            //   align: 'center',
                            //   render: (_, r) => {
                            //     return (
                            //       <EditOutlined
                            //         style={{ color: '#448DF7' }}
                            //         onClick={() => {
                            //           onEdit?.(r.id);
                            //         }}
                            //       />
                            //     );
                            //   },
                            // },
                        ]
                    }
                }}
            />

            <GoogleMapModal
                title="Visit Place"
                open={googleModal.visible}
                onCancel={resetModal}
                onSubmit={resetModal}
                centerPoint={{ ...googleModal }}
            />
            <VisitReports
                salespersons={salesperson}
                title="Visit Rport"
                width="700px"
                open={report === 'visit-report'}
                onCancel={() => setReport(undefined)}
            />
        </>
    )
}

export default VisitMainPage