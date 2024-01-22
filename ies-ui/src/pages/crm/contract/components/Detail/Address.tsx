import { AddressInfo } from "@/services/crm/data"
import { AimOutlined, CloseOutlined, EditOutlined, SaveOutlined } from "@ant-design/icons"
import { ProCard, ProList } from "@ant-design/pro-components"
import { Alert, Button, Col, Popconfirm, Row } from "antd"
import { useForm } from "antd/es/form/Form"
import { useEffect, useState } from "react"

export default ({ customerAddressList, addresInfos, onApplyLocation }: {
    customerId: number;
    contractId: number;
    customerAddressList: number[];
    addresInfos: AddressInfo[];
    onApplyLocation: (ids: number[]) => Promise<boolean>
}) => {
    const [form] = useForm<{ applyLocation: boolean }>()
   
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const rowSelection = {
        selectedRowKeys,
        onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
    };
    const [editable, setEditable] = useState(false)

    const initData = async () => {
        form.setFieldsValue({
            applyLocation: customerAddressList.length > 0
        })
    }

    useEffect(() => {
        initData()
    }, [])

    return  <ProCard title="Location" extra={[
        !editable && <Button type="link" icon={<EditOutlined />} onClick={() => {
            setSelectedRowKeys(customerAddressList)
            setEditable(v => true)
        }} />,
        editable && <Button type="link" icon={<CloseOutlined />} onClick={() => setEditable(v => false)} />,
        editable && <Popconfirm
            title="Apply selected locations only"
            description="Are you sure?"
            onConfirm={async () => {
               const rs = await onApplyLocation(selectedRowKeys.map(it => it.valueOf() as number))
               if(rs) setEditable(false)
               return rs
            }}
        >
            <Button type="link" icon={<SaveOutlined />} />
        </Popconfirm>,
    ]}>

        <ProList<AddressInfo>
            dataSource={editable ? addresInfos : addresInfos?.filter(it => customerAddressList.some(i => i == it.id))}
            rowKey={'id'}
            rowSelection={editable && rowSelection}
            metas={{
                avatar: {
                    render: (_, r) => <AimOutlined />
                },
                title: {
                    render: (_, r) => r.address
                },

                description: {
                    render: (_, r) => <div>
                        <Row>
                            <Col>
                                {[
                                    { name: 'Street Name', value: r.streetName },
                                    { name: 'Street No', value: r.streetNo },
                                    { name: 'House', value: r.houseNo },
                                    { name: 'Village', value: r.village },
                                    { name: 'Commune', value: r.commune },
                                    { name: 'District', value: r.district },
                                    { name: 'Province', value: r.province },
                                ]
                                    .filter((it) => it.value)
                                    .map((it) => `${it.name} ${it.value}`)
                                    .join(', ')}
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                {' '}
                                Hotspot: {r.hotspot || 'N/A'}, Direction: {r.direction || 'N/A'}{' '}
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                {' '}
                                Latitute: {r.latitude || 'N/A'}, Longitude: {r.longitude || 'N/A'}
                            </Col>
                        </Row>
                    </div>
                }
            }}
        />

    </ProCard>
}