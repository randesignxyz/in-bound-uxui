import { DrawerForm, DrawerFormProps } from '@ant-design/pro-form';
import { Typography, Table, Descriptions } from 'antd';
import { useEffect, useState } from 'react';
import { simpleRequestActions } from '@/services/model';
import { DNList, SaleTypeList } from './data';
import { useAccess } from '@umijs/max';
import { AllocateServiceAPI } from './service';

interface Props extends DrawerFormProps {
    dataList?: DNList
}

interface TableRow {
    sku: string;
    qty: number;
    [key: string]: any;
}

export default ({ dataList, ...rest }: Props) => {
    const requestActions = simpleRequestActions();
    const services = AllocateServiceAPI(requestActions)
    const [saleType, setSaleType] = useState<SaleTypeList[]>([]);
    console.log('dataList',dataList)
    useEffect(() => {
        const fetchSaleType = async () => {
            const result = await services.list_sale_type();
            setSaleType(result)
        };

        fetchSaleType();
    }, [rest.open]);

    const prepareData = (delivery: any): { data: TableRow[], columns: any[] } => {
        const rows: Record<string, TableRow> = {};

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

            const type = item.saleType?.trim() || 'STD';
            rows[key][type] = (rows[key][type] || 0) + item.qty;
        });

        const data = Object.values(rows).sort((a, b) => {
            if (a.category !== b.category) {
                return Number(a.category) - Number(b.category);
            }
            return Number(a.sequence) - Number(b.sequence);
        });

        const saleTypeCodes = saleType?.map(st => st.code);

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
            },
            {
                title: "Total Qty",
                dataIndex: "qty",
                key: "qty",
                render: (v: any) => <strong>{v}</strong>,
            },
            ...saleTypeCodes.map((code: any) => ({
                title: code,
                dataIndex: code,
                key: code,
                render: (v: any) => v ?? '-',
            })),
        ];

        data.forEach(row => {
            saleTypeCodes.forEach((code: string | number) => {
                if (row[code] === undefined) {
                    row[code] = '-';
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
                        {dataList?.remarks ? dataList?.remarks : '-'}
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
            title="PO Item"
            {...rest}
            width={700}
            submitter={false}
        >
            <DeliveryTable delivery={dataList} />
        </DrawerForm>
    );
};
