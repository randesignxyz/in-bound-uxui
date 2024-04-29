import { ArrowRightOutlined, AuditOutlined, BellOutlined, DeleteOutlined, DownloadOutlined, EllipsisOutlined, ExportOutlined, FileAddOutlined, HeartOutlined, HistoryOutlined, PlusOutlined, ShareAltOutlined, SwapOutlined } from "@ant-design/icons"
import { ActionType } from "@ant-design/pro-components"
import { history, useModel, useParams } from "@umijs/max"
import { Badge, Button, Dropdown, Flex, MenuProps, Modal, Segmented, Space, message } from "antd"
import { DMSPaths } from ".."
import { simpleRequestActions } from "@/services/model"
import { DocumentServiceAPI } from "./service"
import { DocumentationAdvanceSearch, DocumentationCreate, DocumentationDTO, DocumentationSearchByFolder, MoveDocParams } from "./data"
import { formatDate } from "@/pages/utils"
import TableView, { TableViewSearchParams } from "@/components/DataCrud/TableView"
import { Paging } from "@/services/API"
import { useEffect, useRef, useState } from "react"
import AdvanceDocumentSearch from "../components/AdvanceSearch"
import Omit from "omit.js"
import { downloadUploadFileV2 } from "@/services/apiGateway"
import ShareDrawerForm from "../share/ShareDrawerForm"
import { ShareServiceAPI } from "../share/service"
import { ShareCreate } from "../share/data"
import ReminderModalForm from "../reminder/ModalFormEntry"
import { ReminderCreate } from "../reminder/data"
import { ReminderServiceAPI } from "../reminder/service"
import QuickView from "../share/QuickView"
import { HistoryServiceAPI } from "../history/service"
import HistoryDoc from "./HistoryDoc"
import MoveDocumentModal from "./MoveDocument"
import { StatusColor, expriationStatus } from "../core"
import { FavoriteServiceAPI } from "../favorite/service"
import DocumentModalForm from "./EntryForm"

interface Props {
    items?: DocumentationDTO[];
    folderSlect?: number;
    paramSearch?: DocumentationSearchByFolder;
    division?: string;
    folderId?: number;
    libraryId: number;
}

export default ({ paramSearch, libraryId }: Props) => {
    const requestAction = simpleRequestActions();
    const services = DocumentServiceAPI(requestAction);
    const actionRef = useRef<ActionType>();
    const param = useParams();
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
    const [advanceSearchParams, setAdvanceSearchParams] = useState<DocumentationAdvanceSearch>({
        status: "ALL",
    });
    const [advanceSearch, setAdvanceSearch] = useState<{ visible: boolean }>();
    const actionItem = (record: DocumentationDTO): MenuProps["items"] => [

        {
            key: "1",
            label: "View",
            itemIcon: <ArrowRightOutlined />,
            onClick: () => history.push(`${DMSPaths.document}/detail/${record.id}`)
        },
        {
            key: "2",
            label: "Download",
            itemIcon: <DownloadOutlined />,
            disabled: record.attachment?.length ? false : true,
            onClick: async () => {
                HistoryServiceAPI(requestAction).save({
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
                    FavoriteServiceAPI(requestAction).save({
                        documentId: record.id
                    })
                } else {
                    FavoriteServiceAPI(requestAction).save(record.favorite)
                }
                actionRef.current?.reload?.()
            }
        },
        {
            key: "trash",
            label: "Move To Trash",
            disabled: record.status == "Active" ? false : true,
            itemIcon: <DeleteOutlined />,
            onClick: () => {
                Modal.confirm({
                    title: "Move Documentation to Trash",
                    content: "are you sure, you want to move document trash? You can restore document",
                    onOk: () => {
                        services.moveToTrash(record.id).then(() => {
                            actionRef.current?.reloadAndRest?.();
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
                    title: "Restore Documentation ",
                    content: "are you sure, you want to move document trash? You can restore document",
                    onOk: () => {
                        services.moveToTrash(record.id).then(() => {
                            actionRef.current?.reloadAndRest?.();
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
            itemIcon: <DeleteOutlined />,
            onClick: () => {
                Modal.confirm({
                    title: "Delete Documentation",
                    content: "are you sure, you want to delete document? You can not undo this action",
                    onOk: () => {
                        services.delete(record.id).then(() => {
                            actionRef.current?.reloadAndRest?.();
                            message.success("document was deleted");
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
    useEffect(() => {
        setAdvanceSearchParams({ ...paramSearch });
        actionRef.current?.reload?.()
    }, [paramSearch, libraryId]);
    const cacheList = useModel('dataList');
    const onRequestHandler = async (params: TableViewSearchParams<DocumentationAdvanceSearch>) => {
        try {
            return services.page(params).then((it) => {
                return cacheList.cacheDataList({
                    type: 'dms-document',
                    criteria: params,
                    data: it,
                });
            }) as Promise<Paging<DocumentationDTO>>;
        } catch (error: any) {
            message.error(error.message);
            return Promise.reject();
        }
    };

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
    return (
        <>
            <TableView<DocumentationDTO, { searchValue?: string }>
                hasCriteria={Object.values(Omit(advanceSearchParams, ['status'])).some((v) => v)}
                cache
                displayOnly
                extraFilter={
                    <>
                        <Flex justify="space-between" align="baseline" gap={20}>
                            <Segmented
                                defaultValue={advanceSearchParams.status}
                                onChange={(e) => {
                                    if (e == "ALL") {
                                        setAdvanceSearchParams((v) => ({
                                            // ...v,
                                            status: e.toString(),
                                        }));
                                    }
                                    else {
                                        setAdvanceSearchParams((v) => ({
                                            ...v,
                                            status: e.toString(),
                                        }));
                                    }
                                    actionRef.current?.reloadAndRest?.();
                                }}
                                options={[
                                    {
                                        label: "ALL",
                                        value: "ALL"
                                    },
                                    {
                                        label: "Active",
                                        value: "Active"
                                    },
                                    {
                                        label: "Inactive",
                                        value: "Inactive"
                                    },
                                ]}
                            />
                            <Segmented
                                defaultValue={advanceSearchParams.status}
                                onChange={(e) => {
                                    setAdvanceSearchParams((v) => ({
                                        ...v,
                                        division: e.toString(),
                                    }));
                                    actionRef.current?.reloadAndRest?.();
                                }}
                                options={[
                                    {
                                        label: "Document",
                                        value: "doc"
                                    },
                                    {
                                        label: "Contract",
                                        value: "contract"
                                    },
                                ]}
                            />
                        </Flex>
                    </>
                }
                tableProps={{
                    actionRef: actionRef,
                    toolbar: {
                        actions: [
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
                                />
                            </Dropdown>
                        ]
                    }
                }}
                advanceSearch
                actionHandlers={{
                    onAdvanceSearchClicked: () => setAdvanceSearch({ visible: true }),
                    onRequest: (criteria, pagination, sort) =>
                        onRequestHandler({
                            criteria: {
                                ...criteria,
                                advanceSearch: {
                                    ...advanceSearchParams,
                                    library: libraryId
                                },
                                sort,
                            },
                            pagination,
                        }),
                    onFirstLoad: () =>
                        cacheList.fetchDataList('dms-document').then((v) => {
                            if (v) {
                                setAdvanceSearchParams({
                                    ...v.creteria?.criteria,
                                    status: v.creteria?.criteria?.advanceSearch?.status ?? "ALL",
                                });
                                return v.dataList;
                            } else {
                                return onRequestHandler({
                                    criteria: {
                                        advanceSearch: {
                                            ...advanceSearchParams,
                                            library: parseInt(param["*"] || ""),
                                            folderType: "LIBRARY"
                                        }
                                    },
                                });
                            }
                        }) as Promise<Paging<DocumentationDTO>>,
                }}
                columns={[
                    {
                        title: "#",
                        sorter: "code",
                        width: 180,
                        render: (_, r) => (<Space align="center" >
                            <Button size="small" type="link" icon={<ExportOutlined />} onClick={() => {
                                window.open(`/external/dms/document/detail/${r.id}`)?.focus();
                            }} />
                            <Button
                                type="link"
                                size="small"
                                onClick={() => history.push(`${DMSPaths.document}/detail/${r.id}`)}
                            >
                                {r.documentation.docNumber?r.documentation.docName:"N/A"}
                            </Button>
                        </Space>),
                    },
                    {
                        title: "Name",
                        sorter: "name",
                        width:400,
                        render:(_,r)=>r.documentation?.docName,
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
                                return <Button size="small" icon={<ShareAltOutlined />} type="link" onClick={() => setQuickViewDrawerState({ visible: { name: "DRAWER", docId: r.id } })} />
                            }
                            else {
                                return ""
                            }
                        }
                    },
                    {
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
                ]}
            />
            <AdvanceDocumentSearch
                initData={advanceSearchParams}
                open={advanceSearch?.visible}
                onClose={() => setAdvanceSearch({ visible: false })}
                onReset={() => {
                    setAdvanceSearchParams({})
                    actionRef.current?.reloadAndRest?.();
                }}
                onSearch={(data) => {
                    setAdvanceSearchParams(data);
                    actionRef.current?.reloadAndRest?.();
                }}
            />
            <ShareDrawerForm
                open={shareDrawerState?.visible?.name === "DRAWER"}
                onCancel={() => setShareDrawerState(v => ({ ...v, visible: undefined }))}
                docId={shareDrawerState?.visible?.docId}
                type={shareDrawerState?.visible?.type}
                onSave={(data: ShareCreate) => {
                    ShareServiceAPI(requestAction).save(data);
                    message.success("Success"),
                        setShareDrawerState(() => ({ visible: undefined }));
                    actionRef.current?.reloadAndRest?.();
                }}
            />
            <ReminderModalForm
                open={reminderState?.visible?.name == "MODAL"}
                onCancel={() => setReminderState(v => ({ ...v, visible: undefined }))}
                onSave={(data: ReminderCreate) => {
                    ReminderServiceAPI(requestAction).save(data);
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
                libraryId={documentModalState?.visible?.libraryId}
                onCancel={() => setDocumentState(v => ({ ...v, visible: undefined }))}
                folderId={documentModalState?.visible?.folderId}
                division={documentModalState?.visible?.division}
                onSave={ (data: DocumentationCreate) => {
                    Modal.confirm({
                        title: "Save document",
                        content: "are you sure?",
                        onOk:async () => {
                            const entry = {
                                ...data,
                                libraryId: libraryId
                            }
                            await services.save(entry);
                            actionRef.current?.reloadAndRest?.();
                            setDocumentState({ visible: undefined });
                            message.success("Success!");
                        }
                    });
                }}
            />
        </>
    )
}