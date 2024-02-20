import { ArrowRightOutlined, AuditOutlined, BellOutlined, DeleteOutlined, DownloadOutlined, EllipsisOutlined, ExportOutlined, FileAddOutlined, FolderAddOutlined, HeartOutlined, HistoryOutlined, PlusOutlined, ShareAltOutlined, SwapOutlined } from "@ant-design/icons"
import { ActionType } from "@ant-design/pro-components"
import { history, useModel, useParams } from "@umijs/max"
import { Badge, Button, Dropdown, Flex, MenuProps, Modal, Segmented, Space, Tooltip, message } from "antd"
import { DMSPaths } from ".."
import { simpleRequestActions } from "@/services/model"
import { DocumentServiceAPI } from "./service"
import { DocumentationAdvanceSearch, DocumentationCreate, DocumentationDTO, DocumentationSearchByFolder } from "./data"
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
import { expriationStatus } from "../core"
import { FavoriteServiceAPI } from "../favorite/service"
import DocumentModalForm from "./EntryForm"
import FolderEntryForm from "../folder/EntryForm"
import { FolderCreate } from "../folder/data"
import { FolderServiceAPI } from "../folder/service"

interface Props {
    items?: DocumentationDTO[];
    folderSlect?: number;
    paramSearch?: DocumentationSearchByFolder;
    division?: string;
    folderId?: number;
    libraryId:number;
}

export default ({ items, paramSearch,libraryId, folderId, division, folderSlect }: Props) => {
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
            docId?: number;
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

    const [folderState, setFolderState] = useState<{
        visible?: {
            name: "MODAL";
            type?: "ADD" | "EDIT";
            // data?: DataNode,
            libraryId?: number;
            code: "LIBRARY" | "FOLDER",

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

                }).then(it => {
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
            onClick: () => setMoveState({ visible: { name: "MODAL", docId: record.id } })
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
                        services.moveToTrash(record.id).then(o => {
                            actionRef.current?.reloadAndRest?.();
                            message.success("document moved to trash")
                        })


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
                        services.moveToTrash(record.id).then(o => {
                            actionRef.current?.reloadAndRest?.();
                            message.success("document moved to trash")
                        })


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
                        services.delete(record.id).then(o => {
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
    }, [paramSearch]);
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

    const itemCreateNew = (record?: DocumentationDTO): MenuProps["items"] => [
        {
            key: "1",
            label: "New Document",
            icon: <FileAddOutlined />,
            onClick: () => setDocumentState({
                visible: {
                    name: "MODAL",
                    type: "ADD",
                    folderId: parseInt(param["*"] || ""),
                    // folderId: parseInt(record?.key || ""),
                    division: "DOC",
                    // libraryId: record?.libraryId
                }
            })
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
                    // folderId: parseInt(record?.key || ""),
                    division: "CONTRACT",
                    // libraryId: record?.libraryId
                }
            })
        },
    ]

    return (
        <>
            <TableView<DocumentationDTO, { searchValue?: string }>
                hasCriteria={Object.values(Omit(advanceSearchParams, ['status'])).some((v) => v)}
                cache
                displayOnly
                extraFilter={
                    <>
                        <Flex justify="space-between" gap={20}>
                            {/* <Radio.Group
                                    value={advanceSearchParams.status}
                                    onChange={(e) => {
                                        setAdvanceSearchParams((v) => ({
                                            ...v,
                                            status: e.target.value,
                                        }));

                                        actionRef.current?.reloadAndRest?.();
                                    }}
                                >
                                    <Radio.Button value="ALL">All</Radio.Button>
                                    <Radio.Button value="void">Void</Radio.Button>
                                    <Radio.Button value="draft">Drafted</Radio.Button>
                                    <Radio.Button value="favorite">Favorite</Radio.Button>
                                    <Radio.Button value="Trash">Trash</Radio.Button>
                                </Radio.Group> */}
                            <Segmented
                                defaultValue={advanceSearchParams.status}
                                onChange={(e) => {
                                    setAdvanceSearchParams((v) => ({
                                        ...v,
                                        status: e.toString(),
                                    }));

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
                            // <Tooltip title="New Folder"><Button
                            //     icon={<FolderAddOutlined />}
                            //     type="link"
                            //     onClick={() => setFolderState({ visible: { code: "FOLDER", name: "MODAL", libraryId: 0, type: "ADD" } })}
                            // /></Tooltip>,
                            <Dropdown
                                menu={{
                                    items: itemCreateNew()
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
                                    // library:parseInt(param["*"] ||"")
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
                                            library:parseInt(param["*"] ||"")
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
                        render: (_, r) => (<Space align="center" ><Button size="small" type="link" icon={<ExportOutlined />} onClick={() => {
                            window.open(`/external/dms/document/detail/${r.id}`)?.focus();
                        }} /><span>{r.documentation.docNumber}</span></Space>),

                    },
                    {
                        title: "Name",
                        sorter: "name",
                        render: (_, r) => (
                            <Button
                                type="link"
                                onClick={() => history.push(`${DMSPaths.document}/detail/${r.id}`)}
                            >
                                {r.documentation.docName}
                            </Button>)
                    },
                    {
                        title: "Expiry Date",
                        sorter: "expiryDate",
                        render: (_, r) => <span style={{ color: expriationStatus(r.term?.expiryDate) > 0 ? "red" : "" }}>{formatDate(r.term.expiryDate)}</span>
                    },
                    {
                        title: "Created",
                        sorter: "createdDate",
                        dataIndex: "createdDate",
                        valueType: "date",
                    },
                    {
                        title: "Updated",
                        sorter: "lastModifiedDate",
                        dataIndex: "lastModifiedDate",
                        valueType: "date"
                    },
                    {
                        title: "Type",
                        render: (_, r) => r.division == "CONTRACT" ? "contract" : "document"
                    },
                    {
                        title: "Status",
                        sorter: "status",
                        render: (_, r) => <Badge text={r.status} status={r.status == "Active" ? "success" : "error"} />
                    },
                    {
                        title: "Shared",
                        render: (_, r) => {
                            if (r.share > 0) {
                                return <Button icon={<ShareAltOutlined />} type="link" onClick={() => setQuickViewDrawerState({ visible: { name: "DRAWER", docId: r.id } })} />
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
                        actionRef.current?.reloadAndRest?.();
                    setShareDrawerState(v => ({ visible: undefined }));
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
                onSave={() => {

                }}
            />


            < DocumentModalForm
                open={documentModalState?.visible?.name === "MODAL"}
                type={documentModalState?.visible?.type}
                libraryId={documentModalState?.visible?.libraryId}
                onCancel={() => setDocumentState(v => ({ ...v, visible: undefined }))}
                folderId={documentModalState?.visible?.folderId}
                division={documentModalState?.visible?.division}
                onSave={async (data: DocumentationCreate) => {
                    const entry ={
                        ...data,
                        libraryId:libraryId
                    }
                    const response = await DocumentServiceAPI(requestAction).save(entry) as unknown as ({
                        data: DocumentationCreate;
                        message: string
                    });
                    setDocumentState({ visible: undefined });
                    actionRef.current?.reloadAndRest?.()
                }}
            />


            {/* < FolderEntryForm
                open={folderState?.visible?.name == "MODAL"}
                onCancel={() => setFolderState((v) => ({ visible: undefined }))}
                code={folderState?.visible?.code}
                // data={folderState?.visible?.data}
                libraryId={folderState?.visible?.libraryId}
                type={folderState?.visible?.type}
                onSave={async (data: FolderCreate) => {
                    // console.log(data);

                    const response = await FolderServiceAPI(requestAction).save(data) as ({
                        data: string;
                        message: string
                    });
                    message.success("Success");
                    // setFolderState((v) => ({ visible: undefined }));
                    // testGetFolder()
                    actionRef.current?.reloadAndRest?.();
                }}
            /> */}

        </>
    )
}