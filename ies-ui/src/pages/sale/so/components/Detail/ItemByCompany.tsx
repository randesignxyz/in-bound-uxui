import React, { useMemo } from 'react';
import { Card, Table, Typography, Space, Row, Col } from 'antd';
import { SoDetail, SoItemDetail } from '@/services/sale/data';
import numeral from 'numeral';

interface Props {
    data?: SoDetail;
}

type SoItemWithCompany = SoItemDetail & { company?: string };

const ItemByCompany: React.FC<Props> = ({ data }) => {
    // Group items by the `company` field returned from the API
    const groupedItems = useMemo(() => {
        const items = (data?.items ?? []) as SoItemWithCompany[];

        return items.reduce((acc: Record<string, SoItemWithCompany[]>, item) => {
            const companyKey = item.company || item.budgetCode || 'Unassigned';
            if (!acc[companyKey]) {
                acc[companyKey] = [];
            }
            acc[companyKey].push(item);
            return acc;
        }, {});
    }, [data]);

    const columns = [
        {
            title: '#',
            render: (_: any, __: any, index: number) => index + 1,
            width: 50,
        },
        { title: 'Item Code', dataIndex: 'itemCode', width: 120 },
        { title: 'Description', dataIndex: 'description' },
        { title: 'Type', dataIndex: 'type', width: 100 },
        {
            title: 'Qty',
            dataIndex: 'qty',
            align: 'right' as const,
            width: 80,
        },
        { title: 'UoM', dataIndex: 'uom', width: 80 },
        {
            title: 'Price',
            align: 'right' as const,
            width: 120,
            render: (_: any, r: SoItemDetail) => numeral(r.price).format('$ 0,0.00'),
        },
        {
            title: 'Discount',
            align: 'right' as const,
            width: 100,
            render: (_: any, r: SoItemDetail) => numeral(r.discountPercent).format('0 %'),
        },
        {
            title: 'Total Amount',
            align: 'right' as const,
            width: 130,
            render: (_: any, r: SoItemDetail) => <Typography.Text strong>{numeral(r.totalAmount).format('$ 0,0.00')}</Typography.Text>,
        },
    ];

    const entries = Object.entries(groupedItems);

    if (entries.length === 0) {
        return (
            <Card style={{ marginTop: 10 }}>
                <Typography.Text type="secondary">No items available to display by company.</Typography.Text>
            </Card>
        );
    }

    return (
        <div style={{ marginTop: '10px' }}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                {entries.map(([companyKey, items]) => {
                    const subTotal = items.reduce((sum, item) => sum + (item.totalAmount || 0), 0);
                    return (
                        <Card
                            key={companyKey}
                            size="small"
                            type="inner"
                            headStyle={{ backgroundColor: '#fafafa', borderBottom: '2px solid #e8e8e8' }}
                            title={
                                <Space>
                                    <Typography.Text strong>Company: {companyKey}</Typography.Text>
                                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                                        ({items.length} {items.length > 1 ? 'Items' : 'Item'})
                                    </Typography.Text>
                                </Space>
                            }
                        >
                            <Table<SoItemWithCompany>
                                size="small"
                                columns={columns}
                                dataSource={items}
                                rowKey="id"
                                pagination={false}
                                bordered={false}
                                footer={() => (
                                    <Row justify="end">
                                        <Col>
                                            <Space size="large">
                                                <Typography.Text>Total for <strong>{companyKey}</strong>:</Typography.Text>
                                                <Typography.Title level={5} style={{ margin: 0, color: '#1890ff' }}>
                                                    {numeral(subTotal).format('$ 0,0.00')}
                                                </Typography.Title>
                                            </Space>
                                        </Col>
                                    </Row>
                                )}
                            />
                        </Card>
                    );
                })}
            </Space>
        </div>
    );
};

export default ItemByCompany;
