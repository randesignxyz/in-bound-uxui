import React, { useMemo } from 'react';
import { Card, Table, Typography, Space, Divider, Row, Col } from 'antd';
import { SoDetail, SoItemDetail } from '@/services/sale/data';
import numeral from 'numeral';
import { BankOutlined } from '@ant-design/icons';

interface Props {
    data?: SoDetail;
}

const MOCK_ITEMS: SoItemDetail[] = [
    {
        id: 1, seq: 1, itemId: 101, itemCode: 'OFL-1001', key: '1', uomId: 1, uom: 'pcs',
        qty: 10, price: 15.5, amount: 155, discountAmount: 0, discountPercent: 0, totalAmount: 155,
        description: 'Office Chair', type: 'STD', budgetCode: 'OFL'
    },
    {
        id: 2, seq: 2, itemId: 102, itemCode: 'OFL-2050', key: '2', uomId: 1, uom: 'pcs',
        qty: 5, price: 120.0, amount: 600, discountAmount: 10, discountPercent: 0.1, totalAmount: 590,
        description: 'Standing Desk', type: 'STD', budgetCode: 'OFL'
    },
    {
        id: 3, seq: 3, itemId: 305, itemCode: 'MOT-500', key: '3', uomId: 2, uom: 'box',
        qty: 20, price: 25.0, amount: 500, discountAmount: 0, discountPercent: 0, totalAmount: 500,
        description: 'Engine Oil Filter', type: 'STD', budgetCode: 'MOT'
    },
    {
        id: 4, seq: 4, itemId: 306, itemCode: 'MOT-550', key: '4', uomId: 1, uom: 'pcs',
        qty: 4, price: 250.0, amount: 1000, discountAmount: 50, discountPercent: 0.05, totalAmount: 950,
        description: 'Car Battery 12V', type: 'STD', budgetCode: 'MOT'
    },
    {
        id: 5, seq: 5, itemId: 307, itemCode: 'MOT-600', key: '5', uomId: 3, uom: 'set',
        qty: 2, price: 50.0, amount: 100, discountAmount: 0, discountPercent: 0, totalAmount: 100,
        description: 'Wiper Blades', type: 'STD', budgetCode: 'MOT'
    }
];

const ItemByCompany: React.FC<Props> = ({ data }) => {
    // Group the items by budgetCode (which acts as the Company Code / Entity)
    const groupedItems = useMemo(() => {
        let itemsToUse = (data?.items && data.items.length > 0) ? data.items : MOCK_ITEMS;

        // Force a mock budgetCode for display purposes if the real items don't have one
        itemsToUse = itemsToUse.map((item, index) => ({
            ...item,
            budgetCode: item.budgetCode || (index % 2 === 0 ? 'OFL' : 'MOT')
        }));

        return itemsToUse.reduce((acc: Record<string, SoItemDetail[]>, item: SoItemDetail) => {
            const companyCode = item.budgetCode || 'Unassigned / Default Company';
            if (!acc[companyCode]) {
                acc[companyCode] = [];
            }
            acc[companyCode].push(item);
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
                {entries.map(([companyCode, items]) => {
                    const subTotal = items.reduce((sum, item) => sum + (item.totalAmount || 0), 0);
                    return (
                        <Card
                            key={companyCode}
                            size="small"
                            type="inner"
                            headStyle={{ backgroundColor: '#fafafa', borderBottom: '2px solid #e8e8e8' }}
                            title={
                                <Space>
                                    <Typography.Text strong>Company: {companyCode}</Typography.Text>
                                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                                        ({items.length} {items.length > 1 ? 'Items' : 'Item'})
                                    </Typography.Text>
                                </Space>
                            }
                        >
                            <Table<SoItemDetail>
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
                                                <Typography.Text>Total for <strong>{companyCode}</strong>:</Typography.Text>
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
