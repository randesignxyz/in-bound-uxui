import { Avatar, Badge, Button, Card, Col, Divider, Flex, Row, Tag, message } from "antd";
import { DMSPaths } from "..";
import BreadCrumbCom from "../components/BreadCrumbCom";
import { ProDescriptions, ProList } from "@ant-design/pro-components";
import { simpleRequestActions } from "@/services/model";
import { DocumentServiceAPI } from "./service";
import React, { useEffect, useState } from "react";
import { Alert, Space, Spin } from "antd/lib";
import HistoryTableView from "../history/HistoryTableView";
import { BellOutlined, DownloadOutlined, EditOutlined, ShareAltOutlined, TeamOutlined, UserOutlined } from "@ant-design/icons";
import AttachmentView from "../components/AttachmentView";
import { expriationStatus } from "../core";
import { downloadUploadFileV2, getUploadFileObjectUrlV2 } from "@/services/apiGateway";
import ShareDrawerForm from "../share/ShareDrawerForm";
import { ShareCreate, ShareDTO } from "../share/data";
import { ShareServiceAPI } from "../share/service";
import DocumentModalForm from "./EntryForm";
import ReminderModalForm from "../reminder/ModalFormEntry";
import { ReminderCreate, ReminderDTO } from "../reminder/data";
import { formatDate, formatDateTime } from "@/pages/utils";
import { ReminderServiceAPI } from "../reminder/service";
import ReminderListView from "../reminder/ReminderListView";
import { DocumentationCreate, DocumentationDTO } from "./data";
import { Moment } from "moment";
import DocViewerControlOverDisplayedDocument from "../components/DocV";


interface Props {
    id: number;
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

const DocumentationDetail: React.FC<Props> = ({ id }) => {

    const requestAction = simpleRequestActions();
    const service = DocumentServiceAPI(requestAction);
    const [detail, setDetail] = useState<DocumentationDTO>();


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

        <Space
            style={{
                display: "flex",
                justifyContent: "space-between",
                margin: "8px 0"
            }}
        >
            <BreadCrumbCom
                routes={[
                    {
                        label: "DMS",
                        path: `${DMSPaths.dms}`
                    },
                    {
                        label: "Document Detail",
                        path: ``
                    }
                ]}
                separator="/"
            />
            <Space>
                <Button type="primary" onClick={() => setState({ visible: { name: "MODAL", type: "EDIT", payload: detail } })} icon={<EditOutlined />} />
                {/* <Button type="primary" onClick={() => downloadUploadFileV2()(detail?.attachment?.fileId || "", detail?.title || "")} icon={<DownloadOutlined />} /> */}
                <Button type="primary" onClick={() => setShareState({ visible: { name: "MODAL", type: "ADD" } })} icon={<ShareAltOutlined />} />
                <Button type="primary" onClick={() => setReminderState({ visible: { name: "MODAL", type: "ADD" } })} icon={<BellOutlined />} />

            </Space>
        </Space>
        <Spin spinning={requestAction.request?.loading}>
            <Space
                direction="vertical"
            >
                {alertMessage(detail?.expirationDate, detail?.periodDays)}
                <Card>
                    <ProDescriptions
                        dataSource={detail}
                        columns={[
                            {
                                title: "Document Category",
                                render: (_, r) => r.category?.name
                            },
                            {
                                title: "Document Title",
                                dataIndex: "title"
                            },
                            {
                                title: "Owner",
                                render: (_, r) => (<Tag bordered={false} color="processing">{r.createdBy}</Tag>)
                            },
                            {
                                title: "Document Status",
                                dataIndex: "status"
                            },
                        ]}
                    />
                </Card>

                <Row gutter={16} >
                    <Col span={24} >
                        <Card
                            tabList={[
                                {
                                    key: "1",
                                    label: "Detail",
                                    children: <>
                                        <Row gutter={16}>
                                            <Col span={12}>
                                                <ProDescriptions
                                                    contentStyle={{ fontWeight: "bold" }}
                                                    dataSource={detail}
                                                    column={1}
                                                    columns={[
                                                        {
                                                            title: "Document Number",
                                                            dataIndex: "documentCode"
                                                        },
                                                        {
                                                            title: "Document Title",
                                                            dataIndex: "title"
                                                        },
                                                        {
                                                            title: "Document Type",
                                                            render: (_, r) => r.documentType?.name
                                                        },
                                                        {
                                                            title: "Category",
                                                            render: (_, r) => r.category?.name
                                                        },
                                                        {
                                                            title: "Description",
                                                            dataIndex: "description"
                                                        },
                                                        {
                                                            title: "Created on",
                                                            render: (_, r) => (<>
                                                                <span>{formatDateTime(r?.createdDate)}  By {r?.createdBy}</span>
                                                            </>)
                                                        },
                                                        {
                                                            title: "Modified on",
                                                            render: (_, r) => (<>
                                                                <span>{formatDateTime(r?.lastModifiedDate)}  By {r?.lastModifiedBy}</span>
                                                            </>)
                                                        }
                                                    ]}
                                                />
                                            </Col>
                                            <Col span={12} >
                                                <ProDescriptions
                                                    contentStyle={{ fontWeight: "bold" }}
                                                    dataSource={detail}
                                                    column={1}
                                                    columns={[
                                                        {
                                                            title: "Document status",
                                                            dataIndex: "status"
                                                        },
                                                        {
                                                            title: "Approve Staus",
                                                            dataIndex: ""
                                                        },
                                                        {
                                                            title: "Effective Date",
                                                            dataIndex: "effectiveDate",
                                                            render: (_, r) => formatDate(r.effectiveDate)
                                                        },
                                                        {
                                                            title: "Expiry  Date",
                                                            dataIndex: "expirationDate",
                                                            render: (_, r) => (<>
                                                                <Space  >
                                                                    {r.expirationDate ? <Badge status={expriationStatus(r.expirationDate) > 0 ? "error" : "processing"} text={formatDate(r.expirationDate)} /> : "-"}
                                                                </Space>
                                                            </>)
                                                        },
                                                        
                                                    ]}
                                                />

                                            </Col>
                                            <Divider orientation="left">Owner</Divider>
                                            <Col span={24}>
                                                <ProDescriptions
                                                    dataSource={detail}
                                                    columns={[
                                                        {
                                                            title: "Owner",
                                                            render: (_, r) => (<Tag bordered={false} color="processing">{r.createdBy}</Tag>)
                                                        },
                                                        {
                                                            title: "Department",
                                                            render: (_, r) => r.department?.name
                                                        },
                                                        {
                                                            title: "Bussiness Unit",
                                                            render: (_, r) => r.orgUnit?.name
                                                        }
                                                    ]}
                                                />
                                            </Col>
                                            <Divider orientation="left">File Infomation</Divider>
                                            <Col span={24}>
                                                <AttachmentView record={detail} fileSize={detail?.attachment?.fileSize} fileId={detail?.attachment?.fileId} />
                                            </Col>
                                        </Row>
                                    </>
                                },
                                {
                                    key: "2",
                                    label: "Shared",
                                    children: (<>
                                        <ProList<ShareDTO>

                                            style={{
                                                margin: 0,
                                                padding: 0
                                            }}
                                            cardProps={{
                                                style: {
                                                    margin: 0,
                                                    padding: 0
                                                }
                                            }}
                                            request={async () => {
                                                const data = await ShareServiceAPI(requestAction).list(detail?.id);
                                                return Promise.resolve({
                                                    data: data,
                                                    success: true
                                                })
                                            }}
                                            metas={{
                                                avatar: {
                                                    valueType: "avatar",
                                                    render: (_, r) => <Avatar icon={r.type === "GROUP" ? <TeamOutlined /> : <UserOutlined />} />
                                                },
                                                title: {
                                                    dataIndex: "recipient",
                                                },
                                                subTitle: {
                                                    render: (_, r) => <Tag color="gold">{r.type}</Tag>
                                                },
                                                description: {
                                                    render: (_, r) => (<Flex vertical>
                                                        <Space >
                                                            <p>Shared Date: </p>
                                                            <p>{formatDate(r.createdDate)}</p>
                                                        </Space>
                                                        <Space >
                                                            <p>Expiration Date: </p>
                                                            <p>{formatDate(r.expirationDate)}</p>
                                                        </Space>
                                                        <p>{r.description}</p>
                                                    </Flex>)
                                                },
                                                actions: {
                                                    render: (_, r) => <Flex vertical><span>Accessible</span><Tag color="cyan" bordered={false}>{r.accessible}</Tag></Flex>
                                                }
                                            }}

                                        />
                                    </>)
                                },
                                {
                                    key: "3",
                                    label: "Reminder",
                                    children: <ReminderListView documentId={detail?.id} />
                                },
                                {
                                    key: "5",
                                    label: "Activity Log",
                                    children: <HistoryTableView intantId={id} />
                                },
                            ]}
                        >
                        </Card>
                    </Col>
                    {/* <Col span={24}>
                        <DocViewerControlOverDisplayedDocument
                            attachment={detail?.attachment}
                        />
                    </Col> */}
                </Row>
            </Space>
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
            }}
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
    </>)
}

export default DocumentationDetail