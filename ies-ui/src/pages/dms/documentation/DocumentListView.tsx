import { ArrowRightOutlined, BellOutlined, DeleteOutlined, DownloadOutlined, EllipsisOutlined, ExportOutlined, FileExcelOutlined, FileJpgOutlined, FilePdfOutlined, FileUnknownOutlined, FileWordOutlined, HeartOutlined, HistoryOutlined, ShareAltOutlined, StopOutlined } from "@ant-design/icons"
import { ActionType } from "@ant-design/pro-components"
import { history, useModel } from "@umijs/max"
import { Button, Dropdown, Flex, MenuProps, Modal, Radio, message } from "antd"
import { DMSPaths } from ".."
import { simpleRequestActions } from "@/services/model"
import { DocumentServiceAPI } from "./service"
import { DocumentationAdvanceSearch, DocumentationDTO, DocumentationSearchByFolder } from "./data"
import { formateBytes, formateFileType } from "../core"
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
import { FavoriteServiceAPI } from "../favorite/service"
import QuickView from "../share/QuickView"
import { HistoryServiceAPI } from "../history/service"
import HistoryDoc from "./HistoryDoc"
import MoveModalForm from "./MoveModalForm"

interface Props {
    items?: DocumentationDTO[];
    folderSlect?: number;
    paramSearch?: DocumentationSearchByFolder
}

export default ({ items, paramSearch, folderSlect }: Props) => {
    const requestAction = simpleRequestActions();
    const services = DocumentServiceAPI(requestAction);
    const actionRef = useRef<ActionType>();
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
    const [advanceSearchParams, setAdvanceSearchParams] = useState<DocumentationAdvanceSearch>({
        status: "ALL"
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
            disabled: record.attachment == null ? true : false,
            onClick: async () => {
                HistoryServiceAPI(requestAction).save({
                    instantId: record.id,
                    action: "DOWNLOAD",
                    actionType: "DOCUMENT",
                }).then(it => {
                    console.log(it);

                    downloadUploadFileV2()(record.attachment.fileId || "", record.title);
                });
            }
        },
        {
            key: "3",
            label: "Share",
            itemIcon: <ShareAltOutlined />,
            onClick: () => setShareDrawerState({ visible: { name: "DRAWER", docId: record.id, type: "ADD" } })
        },
        {
            key: "5",
            label: "Move",
            itemIcon: <ExportOutlined />,
            onClick: () => setMoveState({ visible: { name: "MODAL", docId: record.id } })
        },
        {
            key: "6",
            label: "Reminder",
            itemIcon: <BellOutlined />,
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
            type: "divider"
        },
        // {
        //     key: "7",
        //     label: record.status == "Void" ? "Unvoid" : "Void",
        //     danger: true,
        //     itemIcon: <StopOutlined />,
        //     onClick: () => {
        //         Modal.confirm({
        //             title: "Void Documentation",
        //             content: "are you sure?",
        //             onOk: () => {
        //                 services.void(record.id);
        //                 actionRef.current?.reload?.();
        //             }
        //         })
        //     }
        // },

        {
            key: "8",
            label: "Delete",
            danger: true,
            itemIcon: <DeleteOutlined />,
            onClick: () => {
                Modal.confirm({
                    title: "Delete Documentation",
                    content: "are you sure?",
                    onOk: () => {
                        services.delete(record.id);
                        actionRef.current?.reload?.();
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
        setAdvanceSearchParams({ folderId: paramSearch?.folderId, folderType: paramSearch?.folderType });
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


    return (
        <>
            <TableView<DocumentationDTO, { searchValue?: string }>
                hasCriteria={Object.values(Omit(advanceSearchParams, ['status'])).some((v) => v)}
                cache
                displayOnly
                extraFilter={
                    <>
                        <Flex>
                            <Radio.Group
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
                                <Radio.Button value="Draft">Drafted</Radio.Button>
                            </Radio.Group>
                        </Flex>
                    </>
                }
                tableProps={{
                    actionRef: actionRef,

                }}
                advanceSearch
                actionHandlers={{
                    onAdvanceSearchClicked: () => setAdvanceSearch({ visible: true }),
                    onRequest: (criteria, pagination, sort) =>
                        onRequestHandler({
                            criteria: {
                                searchValue: criteria.searchValue || "",
                                advanceSearch: advanceSearchParams,
                                sort,
                            },
                            pagination,
                        }),
                    onFirstLoad: () =>
                        cacheList.fetchDataList('dms-document').then((v) => {
                            if (v) {
                                setAdvanceSearchParams({
                                    ...v.creteria,
                                    status: v.creteria?.criteria?.advanceSearch?.status ?? "ALL",
                                });
                                return v.dataList;
                            } else {
                                return onRequestHandler({
                                    criteria: {
                                        searchValue: "",
                                        advanceSearch: advanceSearchParams,
                                    },
                                });
                            }
                        }) as Promise<Paging<DocumentationDTO>>,
                }}
                columns={[
                    {
                        title: "Icon",
                        width: 50,
                        align: "center",
                        render: (_, r) => (<>
                            {
                                formateFileType(r?.attachment?.fileType) == "EXCEL" && <FileExcelOutlined /> ||
                                formateFileType(r?.attachment?.fileType) == "JPG" && <FileJpgOutlined /> ||
                                formateFileType(r?.attachment?.fileType) == "PDF" && <FilePdfOutlined /> ||
                                formateFileType(r?.attachment?.fileType) == "PNG" && <FileJpgOutlined /> ||
                                formateFileType(r?.attachment?.fileType) == "WORD" && <FileWordOutlined /> ||
                                <FileUnknownOutlined />
                            }
                        </>)
                    },
                    {
                        title: "Name",
                        sorter: "title",
                        render: (_, r) => (
                            <Button
                                type="link"
                                onClick={() => history.push(`${DMSPaths.document}/detail/${r.id}`)}
                            >
                                {r.title}
                            </Button>)
                    },
                    {
                        title: "Created By",
                        dataIndex: "createdBy"
                    },
                    {
                        title: "Modified Date",
                        dataIndex: "lastModifiedDate",
                        valueType: "date"
                    },
                    {
                        title: "Expiry Date",
                        render: (_, r) => formatDate(r.expirationDate)
                    },
                    {
                        title: "Size",
                        render: (_, r) => formateBytes(r?.attachment?.fileSize, 2)
                    },
                    // {
                    //     title: "Status",
                    //     render: (_, r) => <Tag color={r.status=="Void"?"error":"processing"}>{r.status}</Tag>
                    // },
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


            <MoveModalForm
                open={moveState?.visible?.name === "MODAL"}
                onCancel={() => setMoveState((v) => ({ ...v, visible: undefined }))}
                docId={moveState?.visible?.docId}
            />
        </>
    )
}