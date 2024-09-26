import PageWrapper from "@/components/PageWrapper"
import { DocumentationAdvanceSearch, DocumentationCreate, DocumentationDTO } from "./data";
import { DocumentServiceAPI } from "./service";
import { TableViewSearchParams } from "@/components/DataCrud/TableView";
import { simpleRequestActions } from "@/services/model";
import { useParams, useQuery } from "@umijs/max";
import { useState } from "react";
import { formatDate } from "@/pages/utils";
import { AuditOutlined, FileAddOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Badge, Dropdown, MenuProps, message, Modal } from "antd";
import { expriationStatus, StatusColor } from "../core";
import DocumentationDetail from "./DetailView";
import DocumentModalForm from "./EntryForm";

interface Props {
    
}

const DocumentMainPage: React.FC<Props> = () => {
    const param = useParams();
    const requestActions = simpleRequestActions();
    const services = DocumentServiceAPI(requestActions);
    const [filter, setFilter] = useState<TableViewSearchParams<DocumentationAdvanceSearch>>({
        criteria: { advanceSearch: { status: 'ALL' } }
    });
    const { data, isFetching, refetch } = useQuery(['fetch-customer-list', filter], () => services.page(filter), {
        refetchOnWindowFocus: false
    });

    const [documentModalState, setDocumentState] = useState<{
        visible?: {
            name: "MODAL";
            type: "ADD" | "EDIT";
            folderId?: number;
            payload?: DocumentationCreate;
            libraryId?: number;
            division: "DOC" | "CONTRACT"
        }
    }>();

    const itemCreateNew = (): MenuProps["items"] => [
        {
            key: "1",
            label: "New Document",
            icon: <FileAddOutlined />,
            onClick: () => setDocumentState({
                visible: {
                    name: "MODAL",
                    type: "ADD",
                    folderId: parseInt(param["*"] || ""),
                    division: "DOC",
                }
            }),
        },
        {
            key: "2",
            label: "New Contract",
            icon: <AuditOutlined />,
            onClick: () => setDocumentState({
                visible: {
                    name: "MODAL",
                    type: "ADD",
                    folderId: parseInt(param["*"] || ""),
                    division: "CONTRACT",
                }
            }),
        },
    ];
    return (<>
        <PageWrapper<DocumentationDTO, DocumentationAdvanceSearch, {}>
            tabRender={items => [
                {
                    tabLabel: `View ${items?.documentation?.docNumber
                        ? items?.documentation?.docNumber
                        : items?.documentation?.docName
                        }`,
                    action: "view",
                    panel: ({ }) => <DocumentationDetail
                        id={items?.id || 0}
                    />
                },
                {
                    tabLabel:"as",
                    action:"add",
                },
            ]}
            listView={{
                type: "Table",
                actionButtons: [
                    <Dropdown
                        menu={{
                            items: itemCreateNew(),
                            style: {
                                width: 200
                            }
                        }}
                    >
                        <Button
                            icon={<PlusOutlined />}
                            type="link"
                        >New</Button>
                    </Dropdown>
                ],
                statuses: [
                    {
                        option: { label: "All", value: "ALL", default: true },
                        subOptions: [
                            {
                                value: "document",
                                label: "Documents"
                            },
                            {
                                value: "contract",
                                label: "Contract"
                            },
                        ],
                    },
                    { option: { label: "Active", value: "Active", default: true } },
                    { option: { label: "Inactive", value: "Inactive", default: true } },
                ],
                onFilter: (params, page, sort) => {
                    setFilter(f => ({
                        ...f,
                        criteria: {
                            searchValue: params?.searchValue,
                            advanceSearch: {
                                library: 0
                            },
                        },
                        pagination: page
                    }))
                },
                props: {
                    dataSource: data?.items,
                    loading: isFetching,
                    pagination: {
                        total: data?.total
                    },
                    columns: [
                        {
                            title: "#",
                            sorter: "code",
                            width: 180,
                            actionProps: (items) => ({
                                label: `${items.documentation.docNumber}`,
                                type: "view",
                            })
                            // render: (_, r) => (<Space align="center" >
                            //     <Button size="small" type="link" icon={<ExportOutlined />} onClick={() => {
                            //         window.open(`/external/dms/document/detail/${r.id}`)?.focus();
                            //     }} />
                            //     <Button
                            //         type="link"
                            //         size="small"
                            //         onClick={() => history.push(`${DMSPaths.document}/detail/${r.id}`)}
                            //     >
                            //         {r.documentation.docNumber ? r.documentation.docNumber : "N/A"}
                            //     </Button>
                            // </Space>),
                        },
                        {
                            title: "Name",
                            sorter: "name",
                            width: 400,
                            render: (_, r) => r.documentation?.docName,
                        },
                        {
                            title: "Expiry Date",
                            sorter: "expiryDate",
                            fixed: true,
                            render: (_, r) => <span style={{ color: expriationStatus(r.term?.expiryDate) > 0 ? "red" : "" }}>{formatDate(r.term.expiryDate)}</span>
                        },
                        {
                            title: "Created",
                            sorter: "createdDate",
                            dataIndex: "createdDate",
                            valueType: "date",
                            fixed: true,
                        },
                        {
                            title: "Updated",
                            sorter: "lastModifiedDate",
                            dataIndex: "lastModifiedDate",
                            valueType: "date",
                            fixed: true,
                        },
                        {
                            title: "Type",
                            render: (_, r) => r.division == "CONTRACT" ? "contract" : "document"
                        },
                        {
                            title: "Status",
                            sorter: "status",
                            fixed: true,
                            render: (_, r) => <Badge text={r.status} status={StatusColor.getColorStatus(r.status)} />
                        },
                        {
                            title: "Shared",
                            align: "center",
                            render: (_, r) => {
                                if (r.share > 0) {
                                    // return <Button size="small" icon={<ShareAltOutlined />} type="link" onClick={() => setQuickViewDrawerState({ visible: { name: "DRAWER", docId: r.id } })} />
                                }
                                else {
                                    return ""
                                }
                            }
                        },
                        // {
                        //     title: "Action",
                        //     render: (_, r) => (<Dropdown
                        //         menu={{
                        //             // items: actionItem(r),
                        //             style: {
                        //                 width: 200
                        //             }
                        //         }}
                        //     >
                        //         <a><EllipsisOutlined /></a>
                        //     </Dropdown>)
                        // }
                    ]
                }
            }}
        />


        < DocumentModalForm
            open={documentModalState?.visible?.name === "MODAL"}
            type={documentModalState?.visible?.type}
            libraryId={documentModalState?.visible?.libraryId}
            onCancel={() => setDocumentState(v => ({ ...v, visible: undefined }))}
            division={documentModalState?.visible?.division}
            onSave={(data: DocumentationCreate) => {
                Modal.confirm({
                    title: "Save document",
                    content: "are you sure?",
                    onOk: async () => {
                        const entry = {
                            ...data,
                            libraryId: libraryId,
                            folderId: folderId
                        }
                        await services.save(entry);
                        actionRef.current?.reloadAndRest?.();
                        setDocumentState({ visible: undefined });
                        message.success("Success!");
                    }
                });
            }}
        />
    </>)
}


export default DocumentMainPage