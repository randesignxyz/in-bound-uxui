import { LoadingItemDetail } from '@/services/delivery/data';
import { InstanceDetail } from '@/services/delivery/instance.types';
import { ProCard, ProTable } from '@ant-design/pro-components';
import {
    ModalForm,
    ModalFormProps,
} from '@ant-design/pro-form';
import { Button, Col, Descriptions, Row } from 'antd';

interface Props extends ModalFormProps {

    instance: InstanceDetail
    onChangeRequest: (approved: boolean, remarks?: string) => void;
}

export default ({ instance, onChangeRequest, ...props }: Props) => {

    const newPickingItems = instance.loadingInfo?.newItems || []
    const pickingItems = instance.loadingInfo?.items || []

    return (
        <ModalForm
            title="Loading Changed Request"
            {...props}

            submitter={{
                searchConfig: {
                    submitText: 'Approve',
                },
                render: (_, defaultDoms) => {

                    return [
                        defaultDoms[0],
                        < Button
                            danger
                            key="reject"
                            onClick={() => {
                                onChangeRequest(false)
                            }}
                        >
                            Reject
                        </ Button >,
                        defaultDoms[1]
                    ];
                },
            }}
            onFinish={async (_) => {
                onChangeRequest(true)
            }}
        >
            <ProCard collapsible defaultCollapsed size="small" title="Current Picking" bordered style={{ marginBottom: 5 }}>
                <ProTable<LoadingItemDetail> dataSource={pickingItems} search={false} pagination={false}
                    size='small'
                    columns={[
                        { title: 'Item Code', dataIndex: 'itemCode' },
                        { title: 'Item Description', dataIndex: 'itemDescription' },
                        { title: 'UoM', dataIndex: 'uom' },
                        { title: 'Batch Num', dataIndex: 'batchNum' },
                        { title: 'WSH Code', dataIndex: 'whsCode' },
                        { title: 'Qty', dataIndex: 'qty', align: 'right' },

                    ]}
                    options={{
                        density: false,
                        reload: false,
                        setting: false
                    }}
                    footer={(data) => (
                        <Row>
                            <Col flex={'Auto'} style={{ fontWeight: 'bold' }}>
                                Total
                            </Col>
                            <Col flex={'100px'} style={{ textAlign: 'end', fontWeight: 'bold' }}>
                                {' '}
                                {data.map((it) => it.qty || 0).reduce((p, c) => p + c, 0)}{' '}
                            </Col>
                        </Row>
                    )}
                />

            </ProCard>
            <ProCard size="small" title="New Picking" bordered>
                {instance.loadingInfo?.truckTransfer && <Descriptions>
                    <Descriptions.Item label="Driver"> {instance.loadingInfo?.truckTransfer.driverName}</Descriptions.Item>
                    <Descriptions.Item label="License Plate #">{instance.loadingInfo?.truckTransfer.licensePlate}</Descriptions.Item>
                </Descriptions>}
                <ProTable dataSource={newPickingItems} search={false} pagination={false}
                    size='small'
                    options={{
                        density: false,
                        reload: false,
                        setting: false
                    }} columns={[
                        { title: 'Item Code', dataIndex: 'itemCode' },
                        { title: 'Item Description', dataIndex: 'itemDescription' },
                        { title: 'UoM', dataIndex: 'uom' },
                        { title: 'Batch Num', dataIndex: 'batchNum' },
                        { title: 'WSH Code', dataIndex: 'whsCode' },
                        { title: 'Qty', dataIndex: 'qty', align: 'right' },

                    ]} footer={(data) => (
                        <Row>
                            <Col flex={'Auto'} style={{ fontWeight: 'bold' }}>
                                Total
                            </Col>
                            <Col flex={'100px'} style={{ textAlign: 'end', fontWeight: 'bold' }}>
                                {' '}
                                {data.map((it) => it.qty || 0).reduce((p, c) => p + c, 0)}{' '}
                            </Col>
                        </Row>
                    )} />

            </ProCard>
        </ModalForm>
    );
};

