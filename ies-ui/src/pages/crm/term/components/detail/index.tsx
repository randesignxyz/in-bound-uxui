import { simpleRequestActions } from "@/services/model"
import { PageContainer, ProCard, ProDescriptions, ProForm, ProFormSelect, ProTable } from '@ant-design/pro-components';
import { history } from "@umijs/max";
import { Button, Form, Space, Spin, Tag } from "antd"
import { CrmPaths } from "@/pages/crm";
import { useEffect, useState } from "react";
import { TermServices } from "../../service";
import { CheckCircleOutlined, CheckOutlined, DeleteOutlined, EditOutlined, PlusOutlined, TagsOutlined } from "@ant-design/icons";
import GratisTermConfigModalForm from "../GratisTermConfigModalForm";
import { GratisSettledConfigData, RemoveGratisSettledConfigData, Term } from "../../types";
import PopconfirmMe from "@/pages/expense/delivery/components/PopconfirmMe";
import { message } from "antd/lib";
import { values } from "lodash";
import TagModalForm from "../TagModalForm";

const TermDetail: React.FC<{ termId: number }> = ({ termId }) => {
    const requestActions = simpleRequestActions()
    const [term, setTerm] = useState<Term>()
    const [config, setConfig] = useState<GratisSettledConfigData[]>()
    const [modalVisible, setModalVisible] = useState<{ type: 'ADD', termId: number, cb?: () => void } | { type: 'EDIT', termId: number, data?: GratisSettledConfigData, cb?: () => void } | { type: 'TAG', termId: number, cb?: () => void }>()

    useEffect(() => {
        dataLoad()
    }, [])
    const dataLoad = async () => {
        const t = await TermServices.detail(termId).query(requestActions)
        setTerm(t)
        const list = await TermServices.listSettledConfig(termId).query(requestActions)
        setConfig(list)
    }
    const handleBackHandler = () => {
        history.push(`${CrmPaths.terms}/list`);
    };

    return (<Spin spinning={requestActions.request?.loading || false}>
        <PageContainer
            breadcrumb={undefined}
            onBack={handleBackHandler}
            title={'Term Code:' + term?.code}
            extra={<Space>
                <Button type="link" icon={<TagsOutlined />} onClick={() => { setModalVisible({ type: 'TAG', termId: termId, cb: () => { dataLoad(); setModalVisible(undefined) } }) }}>Tag</Button>
            </Space>}
            content={<ProCard>
                <ProDescriptions column={1} dataSource={term} columns={[
                    { label: "", render: (_, r) => r.description }
                ]} />
                {term?.tag?.map(it => <Tag icon={<CheckCircleOutlined />} color="success"> {it}</Tag>)}
            </ProCard>
            }
        >
            {term?.gratisAdmin && <Space direction="vertical" style={{ width: '100%' }}>
                <ProTable<GratisSettledConfigData>
                    search={false}
                    options={{
                        search: false,
                        setting: false,
                        reload: true,
                        fullScreen: false,
                        density: false
                    }}
                    dataSource={config}
                    footer={() => <Button type="dashed" icon={<PlusOutlined />} style={{ width: '100%' }} onClick={() => { setModalVisible({ type: 'ADD', termId: termId, cb: () => { dataLoad(); setModalVisible(undefined) } }) }}> Add</Button>}
                    columns={[
                        {
                            title: 'Code',
                            dataIndex: 'code',
                            hidden: true
                        },
                        {
                            title: 'SKU',
                            dataIndex: 'sku'
                        },
                        {
                            title: 'Operator',
                            dataIndex: 'operator'
                        },
                        {
                            title: 'Target0',
                            dataIndex: 'target0'
                        },
                        {
                            title: 'Target1',
                            dataIndex: 'target1'
                        },
                        {
                            title: 'Count',
                            dataIndex: 'countValue'
                        },
                        {
                            title: 'Offer',
                            dataIndex: 'offer'
                        },

                        {
                            title: 'Settled SKU Code',
                            dataIndex: 'settledCode'
                        },
                        {
                            title: 'Settled SKU',
                            dataIndex: 'settledSKU'
                        },
                        {
                            title: 'Excluded SKU',
                            dataIndex: 'excludedSKU'
                        },
                        {
                            title: 'Merged SKU',
                            dataIndex: 'mergedSKU'
                        },
                        {
                            title: 'Remarks',
                            dataIndex: 'remark'
                        },
                        {
                            title: 'Actions',
                            render: (_, r) => <Space>
                                <Button type="link" icon={<EditOutlined />} onClick={() => { setModalVisible({ type: 'EDIT', termId: termId, data: r, cb: () => { dataLoad(); setModalVisible(undefined) } }) }}></Button>
                                <PopconfirmMe title="Remove" description="Are you sure to remove this mapping?" placement="left"
                                    onConfirm={async () => {
                                        try {
                                            await TermServices.removeSettledConfig({ termId: termId, id: r.id } as RemoveGratisSettledConfigData)(requestActions).then(it => {
                                                dataLoad();
                                                setModalVisible(undefined)
                                                message.info('Removed successfully')
                                            })
                                        } catch (error: any) {
                                            message.error(error.message || 'Failed to romove')
                                        }

                                    }}
                                >
                                    <Button loading={requestActions.request?.loading} type="link" icon={<DeleteOutlined style={{ color: 'red' }} />} size="small" />
                                </PopconfirmMe>
                            </Space>
                        }
                    ]}
                />

            </Space>}
        </PageContainer>
        {term?.gratisAdmin && (modalVisible?.type == 'EDIT' || modalVisible?.type == 'ADD') && <GratisTermConfigModalForm termId={modalVisible.termId} initData={modalVisible?.type == 'EDIT' ? modalVisible.data : undefined} onRefresh={modalVisible.cb} open={true} onOpenChange={visible => !visible && setModalVisible(undefined)} />}
        {modalVisible?.type == 'TAG' && <TagModalForm termId={modalVisible.termId} onRefresh={modalVisible.cb} open={true} onOpenChange={visible => !visible && setModalVisible(undefined)} />}
    </Spin>)
}
export default TermDetail;