import { SoDetail, SoItemDetail } from "@/services/sale/data";
import { ProForm, ProFormField, ProTable } from "@ant-design/pro-components";
import { Card, Col, Form, Row } from "antd";
import numeral from 'numeral';
import { useEffect } from "react";

const layout = {
    labelCol: { span: 10 },
    wrapperCol: { span: 14 },
};

interface SummaryAmount {
    subTotal: number;
    discountAmount: number;
    vatAmount: number;
    totalAmount: number;
}


export default ({ data }: { data?: SoDetail; }) => {

    const [formSum] = Form.useForm<SummaryAmount>();

    useEffect(() => {
        console.log(data);

        formSum.setFieldsValue({ subTotal: data?.amount, totalAmount: data?.totalAmount })
    }, [data])

    return <Card style={{ marginTop: '10px' }} size="small" title="Line Items">
        <ProTable<SoItemDetail>
            size="small"
            sortDirections={['ascend']}
            showSorterTooltip={false}
            columns={[
                {
                    title: '#',
                    dataIndex: 'index',
                    defaultSortOrder: 'ascend',
                    sorter: (a, b) => a.index! - b.index!,
                },
                { title: 'Code', dataIndex: 'itemCode' },
                { title: 'Description', dataIndex: 'description' },
                { title: 'Type', dataIndex: 'type' },
                { title: 'Budget Code', dataIndex: 'budgetCode' },
                {
                    title: 'Qty',
                    dataIndex: 'qty',
                    align: 'right',
                },
                { title: 'UoM', render: (_, data) => data.uom },
                {
                    title: 'Price',
                    align: 'right',

                    render: (_, r) => {
                        return numeral(r.price).format('$ 0,0.00');
                    },
                },
                {
                    title: 'Amount',
                    align: 'right',
                    render: (_, r) => {
                        return numeral(r.amount).format('$ 0,0.00');
                    },
                },
                {
                    title: 'Discount',
                    align: 'right',

                    render: (_, r) => {
                        return numeral(r.discountPercent).format('0 %');
                    },
                },
                {
                    title: 'Total Amount',
                    align: 'right',
                    render: (_, r) => {
                        return numeral(r.totalAmount).format('$ 0,0.00');
                    },
                },

            ]}
            rowKey="id"
            pagination={false}
            bordered={false}
            search={false}
            options={{
                setting: false,
                density: false,
                fullScreen: false,
                reload: false,
            }}
            dataSource={data?.items}
        />

        <ProForm
            {...layout}
            style={{ fontWeight: 'bolder' }}
            submitter={false}
            layout="horizontal"
            form={formSum}
        >
            <Row>
                <Col flex="Auto" />
                <Col flex="350px">
                    <ProFormField
                        // valueType={{ type: 'money', locale: 'en-US', precision: 6 }}
                        render={(_, r) => {
                            return numeral(r['value']).format('$ 0,0.00');
                        }}
                        label="Sub Total"
                        name="subTotal"
                        readonly
                    />
                    {/* <ProFormField
                  valueType={{ type: 'money', locale: 'en-US' }}
                  label="Discount Amount"
                  name="discountAmount"
                  readonly
                /> */}
                    <ProFormField
                        // valueType={{ type: 'money', locale: 'en-US', precision: 6 }}
                        render={(_, r) => {
                            return numeral(r['value']).format('$ 0,0.00');
                        }}
                        label="VAT Amount"
                        name="vatAmount"
                        readonly
                    />
                    <ProFormField
                        // valueType={{ type: 'money', locale: 'en-US', precision: 6 }}
                        render={(_, r) => {
                            return numeral(r['value']).format('$ 0,0.00');
                        }}
                        label="Total Amount"
                        name="totalAmount"
                        readonly
                    />
                </Col>
            </Row>
        </ProForm>
    </Card>
}