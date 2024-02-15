import { PageContainer, ProCard, ProDescriptions } from "@ant-design/pro-components"
import { Button, Card, Col, Collapse, Divider, Flex, Row, Spin, Tag } from "antd"
import React, { useEffect, useState } from "react";
import { ContractCreate, ContractDTO } from "./data";
import { ContractServiceAPI } from "./service";
import { simpleRequestActions } from "@/services/model";
import { EditOutlined, PartitionOutlined, DeleteOutlined, InfoCircleOutlined } from "@ant-design/icons";
import AttachmentView from "../attachment/AttachmentView";
import HistoryTableView from "../history/HistoryTableView";
import ContractFormEntry from "./ContractFormEntry";
import ContractWorkFlow from "./ContractWorkFlow";
import ContractModalForm from "./ContractModalForm";
import { history } from "@umijs/max";
import CompanyDetail from "./company/CompanyDetail";

interface Props {
    id: number;
}

const ContractsDetail: React.FC<Props> = ({ id }) => {
    const requestAction = simpleRequestActions();
    const [contractsDTO, setContractsDTO] = useState<ContractDTO>();
    const services = ContractServiceAPI(requestAction);
    const [workFlowState, setWorkFlowState] = useState<{
        visible?: {
            name: "OPEN",

        }
    }>();
    const [contractForm, setContractForm] = useState<{
        visible?: {
            name: "MODAL";
            type: "ADD" | "EDIT";
            payload?: ContractDTO;
        }
    }>();
    const [contractFormModal, setContractFormModal] = useState<{
        visible?: {
            name: "MODAL";
            type: "ADD" | "EDIT";
            // payload?: ContractDTO;
        }
    }>();
    const [companyState, setCompanyState] = useState<{
        visible?: {
            name: "MODAL";
            type: "ADD" | "EDIT";
            payload?: CompanyDTO;
        }
    }>()

    const loadData = async () => {
        const data = await services.fetchContract(id);
        setContractsDTO(data);
    }


    useEffect(() => {
        loadData();
    }, [id]);

    return (
        <>

            <PageContainer
                onBack={history.back}
                title={`Contract `}
                subTitle={`#${contractsDTO?.contractNumber}`}
                header={undefined}
                extra={[
                    <Button icon={<PartitionOutlined />} onClick={() => setWorkFlowState({ visible: { name: "OPEN" } })} >Diagram</Button>,
                    <Button icon={<EditOutlined />} onClick={() => setContractForm({ visible: { name: "MODAL", type: "EDIT", payload: contractsDTO } })} >Edit</Button>,
                    <Button icon={<DeleteOutlined />} danger>Delete</Button>,
                    // <Button icon={<DeleteOutlined />} onClick={() => setContractFormModal({ visible: { name: "MODAL", type: "EDIT", } })}>Test</Button>
                ]}
            >

                <Spin spinning={requestAction.request?.loading}>
                    <Flex
                        vertical
                        gap={20}
                    >
                        <ProCard
                            collapsible
                            size="small"
                            title="Contract Information"
                        >
                            <Row gutter={16}>
                                <Col span={12}>
                                    {/* <Divider orientation="left" plain>Contract Infomation</Divider> */}
                                    <ProDescriptions
                                        labelStyle={{
                                            width: 150
                                        }}
                                        column={1}
                                        dataSource={contractsDTO}
                                        columns={[
                                            {
                                                label: "Contract Purpose",
                                                dataIndex: "contractName"
                                            },
                                            {
                                                label: "Contract Number",
                                                dataIndex: "contractNumber"
                                            },
                                            {
                                                label: "Currency",
                                                render: (_, r) => r.currency?.name
                                            },
                                            {
                                                label: "Contract Value",
                                                dataIndex: "contractValue"
                                            },
                                            {
                                                label: "Purpose Value",
                                                dataIndex: "purposeValue"
                                            },
                                            {
                                                label: "Gratis",
                                                dataIndex: "gratis"
                                            },
                                            {
                                                label: "Department",
                                                dataIndex: "department"
                                            },
                                            {
                                                label: "Location",
                                                dataIndex: "location"
                                            },
                                            {
                                                label: "Description",
                                                dataIndex: "description"
                                            },
                                        ]}
                                    />
                                </Col>
                                <Col span={12}>
                                    <Divider orientation="left" plain>Term and Renewal</Divider>
                                    <ProDescriptions
                                        column={1}
                                        dataSource={contractsDTO?.contractTerm}
                                        labelStyle={{
                                            width: 200
                                        }}
                                        columns={[
                                            {
                                                label: "Term Type",
                                                dataIndex: "termType"
                                            },
                                            {
                                                label: "Effective Date",
                                                dataIndex: "effectiveDate",
                                                valueType: "date"
                                            },
                                            {
                                                label: "Original Exp Date",
                                                dataIndex: "originalExpDate",
                                                valueType: "date"
                                            },
                                            {
                                                label: "Current Exp Date",
                                                dataIndex: "currentExpDate",
                                                valueType: "date"
                                            },
                                            {
                                                label: "Renewal Interval (Months)",
                                                dataIndex: "renewalInterval"
                                            },
                                            {
                                                label: "Notice Peroid",
                                                dataIndex: "noticePeriod"
                                            },
                                            {
                                                label: "Notice Date",
                                                dataIndex: "noticeDate",
                                                valueType: "date"
                                            },
                                        ]}
                                    />
                                </Col>
                            </Row>
                        </ProCard>
                        <Card>
                            <ProDescriptions
                                dataSource={contractsDTO}
                                columns={[
                                    {
                                        label: "Company Name",
                                        render: (_, r) => (<>
                                            <Button type="link" icon={<InfoCircleOutlined />} onClick={() => setCompanyState({ visible: { name: "MODAL", type: "ADD", payload: r.companyName } })}></Button><>{r.companyName?.name}</>
                                        </>)
                                    },
                                    {
                                        label: "Legal Entity",
                                        dataIndex: "Legal"
                                    },
                                    {
                                        label: "Status",
                                        render: (_, r) => (<Tag color="success">{contractsDTO?.status}</Tag>)
                                    },
                                    {
                                        label: "Customer/Vendor Name",
                                        dataIndex: "vendorName"
                                    },
                                    {
                                        label: "Customer/Vendor Code",
                                        dataIndex: "vendorCode"
                                    },
                                ]}
                            />
                        </Card>
                        <Card
                            tabList={[
                                {
                                    key: "1",
                                    label: "Documents",
                                    children: <AttachmentView />
                                },
                                {
                                    key: "2",
                                    label: "Activities",
                                    children: <HistoryTableView
                                        intantId={contractsDTO?.id}
                                        source="CONTRACTS"
                                    />
                                },
                            ]}
                        />

                    </Flex>
                </Spin>

            </PageContainer>
            <ContractFormEntry
                open={contractForm?.visible?.name === "MODAL"}
                onCancel={() => setContractForm({ visible: undefined })}
                onSave={(data: ContractCreate) => {
                    services.saveContract(data).then(o => {
                        setContractForm({ visible: undefined });
                        loadData();
                    });
                }}
                data={contractForm?.visible?.payload}
            />
            <ContractWorkFlow
                open={workFlowState?.visible?.name === "OPEN"}
                onCancel={() => setWorkFlowState({ visible: undefined })}
            />
            <ContractModalForm
                open={contractFormModal?.visible?.name == "MODAL"}
                onCancel={() => setContractFormModal({ visible: undefined })}
                onSave={() => {

                }}
            />

            <CompanyDetail
                open={companyState?.visible?.name == "MODAL"}
                onClose={() => setCompanyState({ visible: undefined })}
                data={companyState?.visible?.payload}
            />
        </>
    )
}
export default ContractsDetail