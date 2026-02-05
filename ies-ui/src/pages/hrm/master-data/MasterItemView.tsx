import React, { useEffect, useState } from 'react';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { EditableProTable, ProCard, ProFormSelect, ProList, ProTable } from '@ant-design/pro-components';
import { Button, Popconfirm, Tag, Space, Typography, Input, Tooltip, Badge, Divider, theme, Empty, Segmented, message } from 'antd';
import {
    PlusOutlined,
    DeleteOutlined,
    EditOutlined,
    FolderAddOutlined,
    ReloadOutlined,
    AppstoreOutlined,
    BarsOutlined,
    SettingOutlined,
    UnorderedListOutlined,
    TableOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined,
    CheckOutlined,
    CheckCircleOutlined
} from '@ant-design/icons';
import { MasterData as MasterDataType, MasterDataItem } from './data.d';
import { useQuery } from '@umijs/max';
import { DataSetupService } from './service';
import { simpleRequestActions } from '@/services/model';
import DataSetupItemForm from './DataSetupItemForm';
import Paragraph from 'antd/lib/typography/Paragraph';

const { Text } = Typography;

interface MasterItemViewProps {
    dataSetup: any
}

export default function MasterItemView({
    dataSetup
}: MasterItemViewProps) {
    const { token } = theme.useToken();
    const actionRef = React.useRef<ActionType>();
    const requestAction = simpleRequestActions();
    const [modalAction, setModalAction] = useState<{ open: boolean, record?: MasterDataItem | null }>({ open: false, record: null });

    const [filter, setFilter] = useState<any>(
        {
            criteria: { advanceSearch: { dataSetupId: dataSetup?.id } }
        }
    );
    const { data, isFetching, refetch } = useQuery({
        queryKey: ['master-data-items', filter],
        queryFn: async () => DataSetupService.pageDataSetupItems(filter),
        refetchOnWindowFocus: false,

    });

    useEffect(() => {
        if (dataSetup) {
            setFilter({ criteria: { advanceSearch: { dataSetupId: dataSetup?.id } } });
        }
    }, [dataSetup]);



    const columns: ProColumns<MasterDataItem>[] = [
        {
            title: 'Name',
            width: '20%',
            render: (dom, entity) => (
                <Space direction='vertical'>
                    <Text style={{ whiteSpace: 'pre-line' }}>{entity.nameEn}</Text>
                    <Text type="secondary" style={{ whiteSpace: 'pre-line' }}>{entity.nameKm}</Text>
                </Space>
            )
        },
        {
            title: 'Code',
            dataIndex: 'code',
            width: '15%',
            render: (_, r) => <Space direction='vertical'>
                <Tag bordered={false} style={{ fontFamily: 'monospace' }}>{r.code}</Tag>
                {r.access?.map((a: string) => <Tag key={a}
                    icon={<CheckCircleOutlined />}
                    bordered={false}
                    color='success'
                >{a}</Tag>)}
            </Space>,
            formItemProps: {
                rules: [{ required: true, message: 'Code is required' }],
                getValueFromEvent: (e) => e.target.value?.toUpperCase(),
            },
        },
        {
            title: 'Description',
            dataIndex: 'descriptionEn',
            render: (dom, entity) => (
                <Space direction='vertical'>
                    <Paragraph ellipsis={{ rows: 2, expandable: true, symbol: 'more' }} style={{ whiteSpace: 'pre-line' }}>{entity.descriptionEn}</Paragraph>
                    <Paragraph type="secondary" ellipsis={{ rows: 2, expandable: true, symbol: 'more' }} style={{ whiteSpace: 'pre-line' }}> {entity.descriptionKm}</Paragraph>
                </Space>
            )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            valueType: 'select',
            initialValue: 'Active',
            valueEnum: {
                Active: { text: 'Active', status: 'Success' },
                Inactive: { text: 'Inactive', status: 'Error' },
                Pending: { text: 'Pending', status: 'Warning' },
            },
            width: 100,
            render: (_: any, record: MasterDataItem) => (
                <Badge
                    status={record.status === 'Active' ? 'success' : record.status === 'Inactive' ? 'error' : 'warning'}
                    text={record.status}
                    style={{ color: record.status === 'Inactive' ? token.colorTextDisabled : undefined }}
                />
            )
        },
        {
            title: 'Action',
            valueType: 'option',
            width: 100,
            fixed: 'right',
            render: (text, record, _) => [
                <Tooltip title="Edit" key="edit">
                    <Button
                        type="text"
                        size="small"
                        icon={<EditOutlined style={{ color: token.colorWarning }} />}
                        onClick={() => record.id && setModalAction({
                            open: true,
                            record
                        })}
                    />
                </Tooltip>,
                <Popconfirm
                    key="delete"
                    title="Delete?"
                >
                    <Tooltip title="Delete">
                        <Button type="text" size="small" icon={<DeleteOutlined style={{ color: token.colorError }} />} />
                    </Tooltip>
                </Popconfirm>,
            ],
        },
    ];


    return (
        <ProCard
            title={
                <Space size={16} align="center">
                    <div style={{
                        width: 36, height: 36, borderRadius: 8,
                        backgroundColor: token.colorPrimaryBg, color: token.colorPrimary,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18
                    }}>
                        {<AppstoreOutlined />}
                    </div>
                    <Text>{dataSetup?.name}</Text>
                </Space>
            }
            extra={
                <Space>
                    <label>Access</label>
                    <ProFormSelect
                        noStyle
                        fieldProps={{
                            style: {
                                width: 200
                            }
                        }}
                        options={[
                            { label: 'All', value: 'All' },
                            { label: 'Casual Staff', value: 'Casual Staff' },
                            { label: 'Staff', value: 'Staff' },
                            { label: 'Team Leader', value: 'Team Leader' },
                            { label: 'Middle Management', value: 'Middle Management' },
                            { label: 'Management', value: 'Management' },
                            { label: 'Executive Management', value: 'Executive Management' },
                            { label: 'Board of Directors', value: 'Board of Directors' },

                        ]}
                        showSearch
                        onChange={(e) => {
                            setFilter({
                                ...filter,
                                criteria: {
                                    ...filter.criteria,
                                    advanceSearch: {
                                        ...filter.criteria.advanceSearch,
                                        access: e
                                    }
                                }
                            })

                        }}
                    />
                    <label>Mapping</label>
                    <ProFormSelect
                        noStyle
                        request={async () => {
                            const data = await DataSetupService.pageDataSetupItems({})
                            return data.items.filter((item) => item.dataSetId != dataSetup?.id).map((item) => ({ label: `${item.code}`, value: item.code }));
                        }}
                        showSearch
                        onChange={(e) => {
                            setFilter({
                                ...filter,
                                criteria: {
                                    ...filter.criteria,
                                    advanceSearch: {
                                        ...filter.criteria.advanceSearch,
                                        map: e
                                    }
                                }
                            })
                        }}
                    />
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        size='small'
                        onClick={() => setModalAction({ open: true })}
                    />

                    <Button
                        onClick={() => refetch()}
                        type='link'
                        icon={<ReloadOutlined />}
                    />
                </Space>
            }
            style={{ height: '100%', overflow: 'hidden' }}
            bodyStyle={{ padding: 0 }}
        >

            <ProTable<MasterDataItem>
                actionRef={actionRef}
                rowKey="id"
                // scroll={{ y: 'calc(100vh - 260px)' }}
                cardProps={{ bodyStyle: { padding: 0 }, bordered: false }}
                loading={isFetching}
                columns={columns}
                dataSource={data?.items ?? []}
                // toolBarRender={() => [
                //     <Input.Search key="search" placeholder="Search items..." style={{ width: 200 }} />,
                // ]}
                options={false}
                search={false}
                pagination={{
                    pageSize: 10,
                    current: filter.page,
                    total: data?.total,
                    onChange: (page) => {
                        setFilter({
                            ...filter,
                            page
                        })
                    }
                }}
            />

            <DataSetupItemForm
                open={modalAction.open}
                record={modalAction.record}
                parent={dataSetup}
                lastRecord={data?.total || 0}
                onFinish={async (data) => {
                    await DataSetupService.saveDataSetupItem({
                        ...data,
                        id: modalAction.record?.id,
                        dataSetupId: dataSetup?.id
                    })(requestAction);
                    setModalAction({ open: false });
                    refetch();
                }}
                drawerProps={{
                    onClose: () => setModalAction({ open: false }),
                    width: 600
                }}
            />
        </ProCard>
    );
}
