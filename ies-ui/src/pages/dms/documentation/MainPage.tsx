import PageWrapper from "@/components/PageWrapper"
import { DocumentationAdvanceSearch, DocumentationCreate, DocumentationDTO, MoveDocParams } from "./data";
import { DocumentServiceAPI } from "./service";
import { TableViewSearchParams } from "@/components/DataCrud/TableView";
import { simpleRequestActions } from "@/services/model";
import { useQuery } from "@umijs/max";
import { useEffect, useRef, useState } from "react";
import { formatDate } from "@/pages/utils";
import { AuditOutlined, BellOutlined, DeleteOutlined, DownloadOutlined, EllipsisOutlined, FileAddOutlined, HeartOutlined, HistoryOutlined, PlusOutlined, ShareAltOutlined, SwapOutlined } from "@ant-design/icons";
import { Button, Dropdown, MenuProps, message, Modal, Card, Typography, Space, FloatButton } from "antd";
import { expriationStatus } from "../core";
import DocumentationDetail from "./DetailView";
import DocumentModalForm from "./EntryForm";
import { ActionType, LightFilter, ProFormSelect, ProFormSwitch } from "@ant-design/pro-components";
import { downloadUploadFileV2 } from "@/services/apiGateway";
import { FavoriteServiceAPI } from "../favorite/service";
import { HistoryServiceAPI } from "../history/service";
import AdvanceDocumentSearch from "../components/AdvanceSearch";
import { ReminderCreate } from "../reminder/data";
import ReminderModalForm from "../reminder/ModalFormEntry";
import { ReminderServiceAPI } from "../reminder/service";
import { ShareCreate } from "../share/data";
import QuickView from "../share/QuickView";
import { ShareServiceAPI } from "../share/service";
import ShareDrawerForm from "../share/ShareDrawerForm";
import HistoryDoc from "./HistoryDoc";
import MoveDocumentModal from "./MoveDocument";

interface Props {
    paramSearch?: DocumentationAdvanceSearch
}

const DocumentMainPage: React.FC<Props> = ({ paramSearch }) => {
    const requestActions = simpleRequestActions();
    const actionRef = useRef<ActionType>();
    const services = DocumentServiceAPI(requestActions);
    const [filter, setFilter] = useState<TableViewSearchParams<DocumentationAdvanceSearch>>({
        criteria: { advanceSearch: paramSearch }
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
            onClick: () => {
                if (paramSearch?.libraryId==0) {
                    message.warning("Please Folder First!")
                    return
                }
                setDocumentState({
                    visible: {
                        name: "MODAL",
                        type: "ADD",
                        division: "DOC",
                    }
                });
            }
        },
        {
            key: "2",
            label: "New Contract",
            icon: <AuditOutlined />,
            onClick: () => setDocumentState({
                visible: {
                    name: "MODAL",
                    type: "ADD",
                    folderId: paramSearch?.folderId,
                    division: "CONTRACT",
                }
            }),
        },
    ];

    useEffect(() => {
        paramSearch && setFilter((v) => ({ criteria: { advanceSearch: { ...paramSearch } } }))
    }, [paramSearch]);

    const [shareDrawerState, setShareDrawerState] = useState<{
        visible?: {
            name: "DRAWER";
            docId?: number;
            type: "ADD" | "EDIT" | "DETAIL"
        }
    }>();
    const [historyState, setHistoryState] = useState<{
        visible?: {
            name: "DRAWER";
            docId?: number;
        }
    }>();
    const [moveState, setMoveState] = useState<{
        visible?: {
            name: "MODAL";
            moveDoc: MoveDocParams
        }
    }>();
    const [quickViewDrawerState, setQuickViewDrawerState] = useState<{
        visible?: {
            name: "DRAWER";
            docId?: number;
        }
    }>();
    const [reminderState, setReminderState] = useState<{
        visible?: {
            name: "MODAL";
            payLoad?: string;
            documentId: number;
        }
    }>();
    const [advanceSearch, setAdvanceSearch] = useState<{ visible: boolean }>();
    const [advanceSearchParams, setAdvanceSearchParams] = useState<DocumentationAdvanceSearch>();
    const actionItem = (record: DocumentationDTO): MenuProps["items"] => [

        {
            key: "2",
            label: "Download",
            itemIcon: <DownloadOutlined />,
            disabled: record.attachment?.length ? false : true,
            onClick: async () => {
                HistoryServiceAPI(requestActions).save({
                    instantId: record.id,
                    action: "files was downloaded",
                    actionType: "Download",
                    source: "DOCUMENTATION",

                }).then(() => {
                    record.attachment?.forEach(o => downloadUploadFileV2()(o || "", record.documentation.docName || ""))
                });
            }
        },
        {
            key: "3",
            label: "Share",
            itemIcon: <ShareAltOutlined />,
            disabled: record.status == "Inactive" ? true : false,
            onClick: () => setShareDrawerState({ visible: { name: "DRAWER", docId: record.id, type: "ADD" } })
        },
        {
            key: "5",
            label: "Move",
            itemIcon: <SwapOutlined />,
            disabled: record.status == "Inactive" ? true : false,
            onClick: () => {
                setMoveState({
                    visible: {
                        name: "MODAL", moveDoc: {
                            docId: record.id,
                        }
                    }
                })
            }
        },
        {
            key: "6",
            label: "Reminder",
            itemIcon: <BellOutlined />,
            disabled: record.status == "Inactive" ? true : false,
            onClick: () => setReminderState({ visible: { name: "MODAL", documentId: record.id } })
        },
        {
            key: "10",
            label: record.favorite == null ? "Favorite" : "Unfavorite",
            itemIcon: <HeartOutlined />,
            onClick: () => {
                if (record.favorite == null) {
                    FavoriteServiceAPI(requestActions).save({
                        documentId: record.id
                    })
                } else {
                    FavoriteServiceAPI(requestActions).save(record.favorite)
                }
                refetch();
            }
        },
        {
            key: "trash",
            label: "Move To Trash",
            disabled: record.status == "Active" ? false : true,
            itemIcon: <DeleteOutlined />,
            onClick: () => {
                Modal.confirm({
                    title: "Move documentation to Trash",
                    content: "Are you sure you want to move documents to trash? You can restore the document",
                    onOk: () => {
                        services.moveToTrash(record.id).then(() => {
                            refetch();
                            message.success("document moved to trash")
                        });
                    }
                })
            }
        },
        {
            key: "restore",
            label: "Restore",
            disabled: record.status == "Active" ? true : false,
            itemIcon: <HistoryOutlined />,
            onClick: () => {
                Modal.confirm({
                    title: "Restore Documentation",
                    content: "Are you sure you want to move documents to trash? You can restore the document",
                    onOk: () => {
                        services.moveToTrash(record.id).then(() => {
                            refetch();
                            message.success("document moved to trash")
                        });
                    }
                })
            }
        },
        {
            type: "divider"
        },
        {
            key: "8",
            label: "Delete",
            danger: true,
            disabled: !record.owner,
            itemIcon: <DeleteOutlined />,
            onClick: () => {
                Modal.confirm({
                    title: "Delete Documentation",
                    content: "Are you sure you want to delete the document? You cannot undo this action.",
                    onOk: () => {
                        services.delete(record.id).then(() => {
                            refetch();
                            message.success("document in the database was deleted.");
                        });
                    }
                })
            }
        },
        {
            key: "9",
            label: "History",
            itemIcon: <HistoryOutlined />,
            onClick: () => setHistoryState({ visible: { name: "DRAWER", docId: record.id } })
        },
    ];

    const extractFilter = <Card size="small"><LightFilter
        onFinish={(value) => {
            setFilter((v) => ({ criteria: { 
                advanceSearch: {
                     ...v.criteria?.advanceSearch,
                      expired: value.expired, 
                      shared: value.shared,
                       isDeleted: value.isDeleted ,
                       filterType:paramSearch?.filterType
                    }
                     } }));
        }}
    >
        <ProFormSelect
            label={"Document Expire"}
            name={"expired"}
            options={[
                {
                    label: "Expire Soon",
                    value: "expiredSoon"
                },
                {
                    label: "Expired",
                    value: "expired"
                },
            ]}
        />
        <ProFormSelect
            label={"Shared"}
            name={"shared"}
            mode="multiple"
            options={[
                {
                    label: "Share to Me",
                    value: "shareIn"
                },
                {
                    label: "Share to Other",
                    value: "shareOut"
                },
            ]}
        />
        <Space>
            <Typography.Text type="secondary">Favorited</Typography.Text>
            <ProFormSwitch
                name={"favorite"}
            />
        </Space>
        <Space>
            <Typography.Text type="secondary">Deleted</Typography.Text>
            <ProFormSwitch
                name={"isDeleted"}
            />
        </Space>
    </LightFilter></Card>
    return (<>
        <PageWrapper<DocumentationDTO, DocumentationAdvanceSearch, {}>
            tabRender={items => [
                {
                    tabLabel: `${items?.documentation?.docNumber
                        ? items?.documentation?.docNumber
                        : items?.documentation?.docName
                        }`,
                    action: "view",
                    tabKey: items?.id,
                    panel: ({ }) => <DocumentationDetail
                        id={items?.id || 0}
                    />
                },
            ]}
            listView={{
                type: "Table",
                title: "Documnets",
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
                onOpenAdvanceSearch: () => setAdvanceSearch({ visible: true }),
                statuses: [
                    {
                        option: { label: "All", value: "ALL", default: true },
                        subOptions: [
                            {
                                value: "DOC",
                                label: "Documents"
                            },
                            {
                                value: "CONTRACT",
                                label: "Contract"
                            },
                        ],
                    },
                    {
                        option: { label: "Active", value: "Active", default: true },
                        subOptions: [
                            {
                                default: true,
                                value: "ALL",
                                label: "All"
                            },
                            {
                                value: "DOC",
                                label: "Documents"
                            },
                            {
                                value: "CONTRACT",
                                label: "Contract"
                            },
                        ]
                    },
                    {
                        option: { label: "Inactive", value: "Inactive", default: true },
                        subOptions: [
                            {
                                default: true,
                                value: "ALL",
                                label: "All"
                            },
                            {
                                value: "DOC",
                                label: "Documents"
                            },
                            {
                                value: "CONTRACT",
                                label: "Contract"
                            },
                        ]
                    },

                ],
                onExtraFilterRender: () => extractFilter,
                onFilter: (params, page, sort) => {

                    setFilter(f => ({
                        ...f,
                        criteria: {
                            searchValue: params?.searchValue,
                            advanceSearch: {
                                ...f.criteria?.advanceSearch,
                                ...params,
                                filterType:paramSearch?.filterType,
                                division: params?.subStatus,
                            },
                            sort
                        },
                        pagination: page
                    }))
                },
                onRefresh: refetch,
                props: {
                    dataSource: data?.items,
                    loading: isFetching,
                    actionRef: actionRef,
                    pagination: {
                        total: data?.total
                    },
                    columns: [
                        {
                            title: "#",
                            sorter: "code",
                            width: 180,
                            actionProps: (items) => ({
                                label: `${items?.documentation?.docNumber}`,
                                type: "view",
                            })
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
                            render: (_, r) => <span style={{ color: expriationStatus(r.term?.expiryDate) > 0 ? "red" : "" }}>{formatDate(r?.term?.expiryDate)}</span>
                        },
                        {
                            title: "Type",
                            render: (_, r) => r.division == "CONTRACT" ? "contract" : "document"
                        },
                        {
                            title: "Status",
                            sorter: "status",
                            fixed: true,
                            render: (_, r) => <Typography.Text
                                type={
                                    r.status == "Inactive" ? "danger"
                                        : r.status == "Active" ? "success"
                                            : "warning"
                                }
                            >{r.status}</Typography.Text>
                        },
                        {
                            title: "Created",
                            sorter: "createdDate",
                            dataIndex: "createdDate",
                            valueType: "date",
                            fixed: true,
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
                        {
                            title: "Action",
                            render: (_, r) => (<Dropdown
                                menu={{
                                    items: actionItem(r),
                                    style: {
                                        width: 200
                                    }
                                }}
                            >
                                <a><EllipsisOutlined /></a>
                            </Dropdown>)
                        }
                    ]
                }
            }}
        />
     
        <AdvanceDocumentSearch
            initData={advanceSearchParams}
            open={advanceSearch?.visible}
            onClose={() => setAdvanceSearch({ visible: false })}
            onReset={() => {
                setFilter((v) => ({ criteria: { advanceSearch: { ...v.criteria?.advanceSearch,filterType:paramSearch?.filterType } } }));
            }}
            onSearch={(data) => {
                setAdvanceSearchParams(data);
                setFilter((v) => ({ criteria: { advanceSearch: { ...v.criteria?.advanceSearch, ...data } } }));
            }}
        />
        <ShareDrawerForm
            open={shareDrawerState?.visible?.name === "DRAWER"}
            onCancel={() => setShareDrawerState(v => ({ ...v, visible: undefined }))}
            docId={shareDrawerState?.visible?.docId}
            type={shareDrawerState?.visible?.type}
            onSave={(data: ShareCreate) => {
                ShareServiceAPI(requestActions).save(data);
                message.success("Success"),
                    setShareDrawerState(() => ({ visible: undefined }));
                actionRef.current?.reloadAndRest?.();
            }}
        />
        <ReminderModalForm
            open={reminderState?.visible?.name == "MODAL"}
            onCancel={() => setReminderState(v => ({ ...v, visible: undefined }))}
            onSave={(data: ReminderCreate) => {
                ReminderServiceAPI(requestActions).save(data);
                message.success("Success");
                actionRef.current?.reloadAndRest?.();
                setReminderState((v) => ({ ...v, visible: undefined }));
            }}
            documentId={reminderState?.visible?.documentId}
        />
        <QuickView
            open={quickViewDrawerState?.visible?.name == "DRAWER"}
            onClose={() => setQuickViewDrawerState(v => ({ ...v, visible: undefined }))}
            docId={quickViewDrawerState?.visible?.docId}
        />
        <HistoryDoc
            open={historyState?.visible?.name == "DRAWER"}
            onClose={() => setHistoryState((v) => ({ ...v, visible: undefined }))}
            docId={historyState?.visible?.docId}
        />
        <MoveDocumentModal
            open={moveState?.visible?.name == "MODAL"}
            onCancel={() => setMoveState({ visible: undefined })}
            data={moveState?.visible?.moveDoc}
            onSave={(data: MoveDocParams) => {
                services.moveDoc(data);
                actionRef.current?.reload?.();
                message.success("Success!");
                setMoveState({ visible: undefined });
            }}
        />
        < DocumentModalForm
            open={documentModalState?.visible?.name === "MODAL"}
            type={documentModalState?.visible?.type}
            libraryId={paramSearch?.folderId}
            onCancel={() => setDocumentState(v => ({ ...v, visible: undefined }))}
            division={documentModalState?.visible?.division}
            onSave={(data: DocumentationCreate) => {
                Modal.confirm({
                    title: "Save document",
                    content: "are you sure?",
                    onOk: async () => {
                        const entry = {
                            ...data,
                            ...paramSearch,
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