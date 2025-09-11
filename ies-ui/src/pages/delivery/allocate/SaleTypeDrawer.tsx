import { DrawerForm, DrawerFormProps } from '@ant-design/pro-form';
import { Typography, Table, Descriptions } from 'antd';
import { useState } from 'react';
import { simpleRequestActions } from '@/services/model';
import { DNList } from './data';
import { useAccess } from '@umijs/max';

interface Props extends DrawerFormProps {
    dataList?: DNList
}

interface TableRow {
    sku: string;
    qty: number;
    [key: string]: any;
}

export default ({ dataList, ...rest }: Props) => {
    const prepareData = (delivery: any): { data: TableRow[], columns: any[] } => {
        const rows: Record<string, TableRow> = {};
        const saleTypes = new Set<string>();

        delivery?.deliveryItems?.forEach((item: any) => {
            const key = `${item.category}_${item.sku_id}`;
            if (!rows[key]) {
                const displaySKU =
                    item.category == 2 && item.sku_uom
                        ? `${item.sku_name} - ${item.sku_uom}`
                        : item.sku_name;

                rows[key] = {
                    sku: displaySKU,
                    qty: 0,
                    category: item.category,
                    sku_id: item.sku_id,
                    sequence: Number(item.sequence),
                };
            }

            rows[key].qty += item.qty;

            const saleType = item.saleType && item.saleType.trim() !== ""
                ? item.saleType
                : "STD";

            rows[key][saleType] = item.qty;
            saleTypes.add(saleType);
        });


        const data = Object.values(rows).sort((a, b) => {
            if (a.category !== b.category) {
                return Number(a.category) - Number(b.category);
            }
            return Number(a.sequence) - Number(b.sequence);
        });

        const saleTypeArray = Array.from(saleTypes);
        const columns: any[] = [
            {
                title: "SKU",
                dataIndex: "sku",
                key: "sku",
                onCell: (record: TableRow) => ({
                    style: {
                        backgroundColor:
                            record.category == 1
                                ? 'rgba(3, 78, 162, 0.05)'
                                : record.category == 2
                                    ? 'rgba(239, 109, 35, 0.05)'
                                    : 'inherit',
                        color:
                            record.category == 1
                                ? 'rgba(3, 78, 162, 1)'
                                : record.category == 2
                                    ? 'rgba(239, 109, 35, 1)'
                                    : 'inherit',
                        fontWeight: 'bold',
                    },
                }),
                render: (text: any) => text,
            },
            {
                title: "QTY",
                dataIndex: "qty",
                key: "qty",
                render: (value: any) => <strong>{value}</strong>,
            },
            ...saleTypeArray.map((type) => ({
                title: type,
                dataIndex: type,
                key: type,
                render: (value: any) => <span>{value}</span>,
            })),
        ];

        data.forEach((row) => {
            saleTypeArray.forEach((type) => {
                if (row[type] === undefined) {
                    row[type] = "-";
                }
            });
        });

        return { data, columns };
    };

    const DeliveryTable = ({ delivery }: { delivery: any }) => {
        const { data, columns } = prepareData(delivery);

        return (
            <>
            <Descriptions>
                <Descriptions.Item label={"Sale Remark"}>
                    { dataList?.remarks ? dataList?.remarks : '-'}
                </Descriptions.Item>
            </Descriptions>
            <Table
                rowKey="sku"
                columns={columns}
                dataSource={data}
                pagination={false}
                bordered
            />
            </>
        );
    };

    return (
        <DrawerForm
            title="Promotion Type"
            {...rest}
            width={700}
            submitter={false}
        >
            <DeliveryTable delivery={dataList} />
        </DrawerForm>
    );
};
