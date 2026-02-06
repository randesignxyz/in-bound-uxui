import React, { useState } from 'react';
import { ProCard, ProList } from '@ant-design/pro-components';
import { Button, Typography, Input, Tooltip, theme, Space } from 'antd';
import {
    PlusOutlined,
    SearchOutlined,
    AppstoreOutlined,
} from '@ant-design/icons';
import { DataSetupService } from './service';
import { MasterData as MasterDataType, MasterDataItem } from './data.d';
import { useQuery } from '@umijs/max';
import { TableViewSearchParams } from '@/components/DataCrud/TableView';
import { simpleRequestActions } from '@/services/model';
import DataSetupForm from './DataSetupForm';
import MasterItemView from './MasterItemView';

const { Text } = Typography;

export default function MasterDataPage() {
    const { token } = theme.useToken();
    const requestAction = simpleRequestActions();


    const [selectedType, setSelectedType] = useState<MasterDataType | null>(null);

    const [searchText, setSearchText] = useState('');
    const [createTypeModalVisible, setCreateTypeModalVisible] = useState(false);


    const [filter] = useState<TableViewSearchParams<any>>({ pagination: { pageSize: 1000 } }); // Increase page size to get all types

    const { data, isFetching, refetch } = useQuery({
        queryKey: ["data-setup-types", filter],
        queryFn: () => DataSetupService.pageDataSetup(filter).query(requestAction),
        refetchOnWindowFocus: false
    });

    return (
        <ProCard
            split="vertical"
            bordered
            style={{
                minHeight: 600,
                background: token.colorBgContainer
            }}
            bodyStyle={{ padding: 0 }}
        >
            <ProCard
                colSpan={{ xs: 24, md: 4 }}
                title={<span style={{ fontWeight: 600 }}>Master Types</span>}
                extra={
                    <Space>
                        <Tooltip title="Create New Type">
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                size="small"
                                shape="circle"
                                onClick={() => setCreateTypeModalVisible(true)}
                            />
                        </Tooltip>
                    </Space>
                }
                headerBordered
                bodyStyle={{ padding: 0, backgroundColor: '#fcfcfc' }}
                style={{ borderRight: `1px solid ${token.colorSplit}` }}
            >
                <div style={{ padding: '16px', borderBottom: `1px solid ${token.colorSplit}` }}>
                    <Input
                        prefix={<SearchOutlined style={{ color: token.colorTextDescription }} />}
                        placeholder="Search types..."
                        allowClear
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                        style={{ borderRadius: 6 }}
                    />
                </div>
                <ProList<MasterDataType>
                    loading={isFetching}
                    dataSource={data?.items}
                    metas={{
                        title: {
                            render: (_, row) => (
                                <Text strong={selectedType?.id === row.id} style={{ color: selectedType?.id === row.id ? token.colorPrimary : token.colorText }}>
                                    {row.name}
                                </Text>
                            )
                        },
                        description: {
                            render: (_, row) => <Text type="secondary" style={{ fontSize: 11 }}>{row.code}</Text>
                        },
                        avatar: {
                            render: (_, row) => (
                                <div style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 6,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: selectedType?.id === row.id ? token.colorPrimaryBg : '#f0f0f0',
                                    color: selectedType?.id === row.id ? token.colorPrimary : token.colorTextSecondary
                                }}>
                                    <AppstoreOutlined />
                                </div>
                            )
                        }
                    }}
                    rowKey="id"
                    onRow={(record) => ({
                        onClick: () => setSelectedType(record),
                        style: {
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            padding: '12px 16px',
                            backgroundColor: selectedType?.id === record.id ? '#fff' : 'transparent',
                            borderRight: selectedType?.id === record.id ? `3px solid ${token.colorPrimary}` : '3px solid transparent'
                        },
                    })}
                    split={true}
                />
            </ProCard>

            <MasterItemView
                dataSetup={selectedType}
            />
            <DataSetupForm
                open={createTypeModalVisible}
                onFinish={async (data) => {
                    await DataSetupService.saveDataSetup(data)(requestAction)
                    setCreateTypeModalVisible(false);
                    refetch();
                }}
                modalProps={{
                    destroyOnClose: true, centered: true, width: 440, maskClosable: false,
                    onCancel: () => setCreateTypeModalVisible(false)
                }}
            />

        </ProCard >
    );
}