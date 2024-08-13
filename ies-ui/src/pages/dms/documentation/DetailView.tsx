import { Button, Tabs, message } from "antd";
import { ActionType, PageContainer } from "@ant-design/pro-components";
import { simpleRequestActions } from "@/services/model";
import { DocumentServiceAPI } from "./service";
import React, { useEffect, useRef, useState } from "react";
import { Alert, Modal, Spin } from "antd/lib";
import HistoryTableView from "../history/HistoryTableView";
import { BellOutlined, EditOutlined, ShareAltOutlined, UploadOutlined } from "@ant-design/icons";
import AttachmentView from "../attachment/AttachmentView";
import { expriationStatus } from "../core";
import ShareDrawerForm from "../share/ShareDrawerForm";
import { ShareCreate, ShareDTO } from "../share/data";
import { ShareServiceAPI } from "../share/service";
import DocumentModalForm from "./EntryForm";
import ReminderModalForm from "../reminder/ModalFormEntry";
import { ReminderCreate, ReminderDTO } from "../reminder/data";
import { ReminderServiceAPI } from "../reminder/service";
import ReminderListView from "../reminder/ReminderListView";
import { DocumentationCreate, DocumentationDTO, UploadAttachmentFile } from "./data";
import { Moment } from "moment";
import DocFileUploadModal from "../attachment/DocFileUploadModal";
import DocumentDetail from "./DocumentDetail";
import ContractViewDetail from "../contract/ContractViewDetail";
import ShareListView from "../share/ShareListView";
import { ExternalLayout } from "../dms";
interface Props {
    id: number;
    share?: ShareDTO;
}
const alertMessage = (date: Moment, period?: number) => {
    if (expriationStatus(date) > 0) {
        return <Alert
            message={`document was expired `}
            type="error"
            closable
            showIcon
        />
    }
    if ((expriationStatus(date) < 0) && (expriationStatus(date) >= -24)) {
        return <Alert
            message={`your document will be expired soon`}
            type="warning"
            closable
            showIcon
        />
    }
}
const DocumentationDetail: React.FC<Props> = ({ id, share }) => {
    const requestAction = simpleRequestActions();
    const service = DocumentServiceAPI(requestAction);
    const [detail, setDetail] = useState<DocumentationDTO>();
    const actionRef = useRef<ActionType>();
    const [tabState, setTabState] = useState<string>("1");
    const [uploadFileState, setUploadFileState] = useState<{
        visible?: {
            name: "MODAL";
            type: "EDIT" | "ADD";
        }
    }>();
    const [shareState, setShareState] = useState<{
        visible?: {
            name: "MODAL";
            type: "EDIT" | "ADD";
            payload?: ShareDTO
        }
    }>();
    const [reminderState, setReminderState] = useState<{
        visible?: {
            name: "MODAL";
            type: "EDIT" | "ADD";
            payload?: ReminderDTO
        }
    }>();
    const [state, setState] = useState<{
        visible?: {
            name: "MODAL";
            type: "EDIT" | "ADD";
            payload?: DocumentationDTO
        }
    }>();
    const loadData = async () => {
        const data = await service.fetch(id);
        setDetail(data);
    }
    useEffect(() => {
        loadData();
    }, [id]);
    return (<>
        <Spin spinning={requestAction.request?.loading}>
            <PageContainer
                onBack={!ExternalLayout.isExternal("dms/document/") ? ExternalLayout.handleBackHandler : undefined}
                title="Documentation"
                breadcrumb={undefined}
                subTitle={`# ${detail?.documentation?.docName}`}
                extra={[
                    <Button type="default" onClick={() => setState({ visible: { name: "MODAL", type: "EDIT", payload: detail } })} icon={<EditOutlined />} disabled={share?.accessible == "viewer"} >Edit</Button>,
                    <Button type="default" onClick={() => setShareState({ visible: { name: "MODAL", type: "ADD" } })} icon={<ShareAltOutlined />} >Shared</Button>,
                    <Button type="default" onClick={() => setReminderState({ visible: { name: "MODAL", type: "ADD" } })} icon={<BellOutlined />} >Reminder</Button>,
                    <Button type="default" onClick={() => setUploadFileState({ visible: { name: "MODAL", type: "ADD" } })} icon={<UploadOutlined />} disabled={share?.accessible == "viewer"} >Upload</Button>,
                ]}
            >
                {alertMessage(detail?.term.expiryDate)}
                {detail && (<>
                    {
                        detail?.division == "DOC" && (
                            <DocumentDetail
                                document={detail}
                                actionRef={actionRef}
                            />
                        ) ||
                        (
                            <ContractViewDetail
                                document={detail}
                                actionRef={actionRef}
                            />
                        )
                    }
                </>)}
                <Tabs
                    defaultActiveKey={tabState}
                    items={[
                        {
                            key: "1",
                            label: "Attachments",
                            children: <AttachmentView
                                docId={detail?.id}
                                tabState={tabState || Math.random().toString()}
                                accessKey={share?.accessible}
                            />
                        },
                        {
                            key: "2",
                            label: "Shareds",
                            children: <ShareListView docId={detail?.id} />
                        },
                        {
                            key: "3",
                            label: "Reminders",
                            children: <ReminderListView documentId={detail?.id} />
                        },
                        
                        {
                            key: "4",
                            label: "Activities",
                            children: <HistoryTableView intantId={id} source="DOCUMENTATION" />
                        },
                    ]}
                />
            </PageContainer>
        </Spin>
        <ShareDrawerForm
            open={shareState?.visible?.name === "MODAL"}
            onCancel={() => setShareState((v) => ({ visible: undefined }))}
            docId={id}
            onSave={async (data: ShareCreate) => {
                const response = await ShareServiceAPI(requestAction).save(data) as ({
                    data?: string;
                    message?: string
                });
                setShareState((v) => ({ visible: undefined }));
                message.success("Success!");
            }}
        />
        <DocumentModalForm
            open={state?.visible?.name == "MODAL"}
            data={state?.visible?.payload}
            onSave={(data: DocumentationCreate) => {
                Modal.confirm({
                    title: "Update Document",
                    content: "do you want update information this document?",
                    onOk: async() => {
                        await service.save(data);
                        actionRef.current?.reloadAndRest?.();
                        loadData();
                        setState((v) => ({ visible: undefined }));
                        message.success("Success!");
                    }
                });
            }}
            division={state?.visible?.payload?.division}
            onCancel={() => setState((v) => ({ visible: undefined }))}
        />
        <ReminderModalForm
            open={reminderState?.visible?.name == "MODAL"}
            onCancel={() => setReminderState((v) => ({ visible: undefined }))}
            onSave={(data: ReminderCreate) => {
                ReminderServiceAPI(requestAction).save(data);
                message.success("Success");
                setReminderState((v) => ({ ...v, visible: undefined }));
            }}
            documentId={detail?.id}
        />
        <DocFileUploadModal
            open={uploadFileState?.visible?.name == "MODAL"}
            onCancel={() => setUploadFileState(o => ({ ...o, visible: undefined }))}
            onSave={(data: UploadAttachmentFile) => {
                service.uploadAttachment(data);
                setUploadFileState(o => ({ ...o, visible: undefined }));
                actionRef.current?.reload?.();
                setTabState(Math.random().toString())
            }}
            documentTypeId={detail?.docType?.id}
            documentId={detail?.id}
        />
    </>)
}
export default DocumentationDetail