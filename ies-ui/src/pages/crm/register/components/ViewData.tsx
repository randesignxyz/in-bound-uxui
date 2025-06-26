import { ProCard, ProTable } from "@ant-design/pro-components";
import { AddresssView, PurchasingPerformanceItem, RegisterCustomerDetailResponse } from "../data";
import { Card, Col, Descriptions, Flex, List, Radio, Row, Space } from "antd";
import AddressListView from "./AddressListView";
import { AimOutlined } from "@ant-design/icons";
import PurchasingPerformanceView from "./PurchasingPerformanceView";
import RemarkCard from "./RemarkCard";
import DocmentRequire from "./DocmentRequire";

interface Props {
  data?: RegisterCustomerDetailResponse;
}

export default ({ data }: Props) => {
    return ( <Space direction="vertical" style={{ width: '100%' }}>
        <ProCard size="small" headerBordered title="General Infomation">
            <Descriptions>
                <Descriptions.Item label="From No" style={{ fontWeight: 'bolder' }}>
                    {data?.formNo}
                </Descriptions.Item>
                <Descriptions.Item label="Customer's ID" style={{ fontWeight: 'bolder' }}>
                    {data?.customerCode}
                </Descriptions.Item>
                <Descriptions.Item label="VAT Invoice" >
                    <Radio.Group value={data?.vatInv} 
                        options={[
                            {label: 'Yes',value: 'Y',},
                            {label: 'No',value: 'N',}
                        ]}
                    />
                </Descriptions.Item>
                <Descriptions.Item label="Purpose">
                    {data?.purpose}
                </Descriptions.Item>
                <Descriptions.Item label="Price & Trade Offer">
                    {data?.priceTradeOfferName}
                </Descriptions.Item>
                <Descriptions.Item label="Payment Term">
                    {data?.paymentTermName}
                </Descriptions.Item>
                <Descriptions.Item label="Outlet Type">
                    {data?.outletTypeName}
                </Descriptions.Item>
                <Descriptions.Item label="Region">
                    {data?.regionName}
                </Descriptions.Item>
                <Descriptions.Item label="Division">
                    {data?.divisionName}
                </Descriptions.Item>
                <Descriptions.Item label="Channel">
                    {data?.channelName}
                </Descriptions.Item>
                <Descriptions.Item label="Sub Channel">
                    {data?.subChannelName}
                </Descriptions.Item>
                <Descriptions.Item label="Sale Executive">
                    {data?.saleName}
                </Descriptions.Item>    

            </Descriptions>
        </ProCard>
        <ProCard size="small" headerBordered title="Business Name">
            <Descriptions>
                <Descriptions.Item label="Business Name(Khmer)">
                    {data?.buNameKh}
                </Descriptions.Item>
                <Descriptions.Item label="Business Name(English)">
                    {data?.buName}
                </Descriptions.Item>
                 <Descriptions.Item label="Purchase Phone Number">
                    {data?.purchasePhone}
                </Descriptions.Item>
                <Descriptions.Item label="Owner Name(Khmer)">
                    {data?.ownerNameKh}
                </Descriptions.Item>
                <Descriptions.Item label="Owner Name(English)">
                    {data?.ownerName}
                </Descriptions.Item>
                <Descriptions.Item label="Owner Phone Number">
                    {data?.ownerPhone}
                </Descriptions.Item>
                <Descriptions.Item label="Purchase Name(Khmer)">
                    {data?.purchaseNameKh}
                </Descriptions.Item>
                <Descriptions.Item label="Purchase Name(English)">
                    {data?.purchaseName}
                </Descriptions.Item>
                <Descriptions.Item label="Purchase Phone">
                    {data?.purchasePhone}
                </Descriptions.Item>
            </Descriptions>
        </ProCard>
        <ProCard size="small">
          <Flex vertical>
            <Flex justify="flex-start" gap={25}>
                <Flex vertical style={{width:'100%'}}>
                    <ProCard
                    title='Billing Address'
                    headerBordered
                    // style={{ marginBlockStart: 8 }}
                    // gutter={8}
                    >
                        <List<AddresssView>
                            size="small"
                            locale={{ emptyText: 'No Address added' }}
                            dataSource={data?.billing}
                            itemLayout="horizontal"
                            rowKey="key"
                            renderItem={(item) => (
                                <List.Item
                                // extra={[
                                //   !addressReadonly && (
                                //     <Button key="b1" onClick={() => onEdit(item)} type="link" icon={<EditOutlined />} />
                                //   ),
                                //   !addressReadonly && item.type?.id !== DEFAULT_ADDRESS_TYPE_ID && (
                                //     <Button
                                //       key="b2"
                                //       onClick={() => actionHandlers.onRemove?.(item)}
                                //       type="link"
                                //       icon={<MinusCircleOutlined />}
                                //     />
                                //   ),
                                // ]}
                        >
                            <List.Item.Meta
                                title={
                                    <Space>
                                    {' '}
                                    <AimOutlined /> {item.address} {/*<Tag>{item.type?.name}</Tag>{' '}*/}
                                    </Space>
                                }
                                description={
                                    <div>
                                    <Row>
                                        <Col>
                                        {[
                                            { name: 'Street Name', value: item?.streetName },
                                            { name: 'Street No', value: item?.streetNo },
                                            { name: 'House', value: item?.houseNo },
                                            { name: 'Village', value: item?.village?.name },
                                            { name: 'Commune', value: item?.commune?.name },
                                            { name: 'District', value: item?.district?.name },
                                            { name: 'Province', value: item?.province?.name },
                                        ]
                                            .filter((it) => it.value)
                                            .map((it) => `${it.name} ${it.value}`)
                                            .join(', ')}
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                        {' '}
                                        Hotspot: {item.hotspot || 'N/A'}, Direction: {item.direction || 'N/A'}{' '}
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                        {' '}
                                        Latitute: {item.latitude || 'N/A'}, Longitude: {item.longitude || 'N/A'}
                                        </Col>
                                    </Row>
                                    </div>
                                }
                            />

                            {/* {(item.visitPlanOptionList || []).length > 0 && <ListContent item={item} />} */}
                            </List.Item>
                        )}
                        />
                </ProCard>
              </Flex>
              <Flex vertical style={{width:'100%'}}>
                <ProCard
                  title='Shipping Address'
                  headerBordered
                >
                  <List<AddresssView>
                            size="small"
                            locale={{ emptyText: 'No Address added' }}
                            dataSource={data?.shipping}
                            itemLayout="horizontal"
                            rowKey="key"
                            renderItem={(item) => (
                                <List.Item
                                // extra={[
                                //   !addressReadonly && (
                                //     <Button key="b1" onClick={() => onEdit(item)} type="link" icon={<EditOutlined />} />
                                //   ),
                                //   !addressReadonly && item.type?.id !== DEFAULT_ADDRESS_TYPE_ID && (
                                //     <Button
                                //       key="b2"
                                //       onClick={() => actionHandlers.onRemove?.(item)}
                                //       type="link"
                                //       icon={<MinusCircleOutlined />}
                                //     />
                                //   ),
                                // ]}
                        >
                            <List.Item.Meta
                                title={
                                    <Space>
                                    {' '}
                                    <AimOutlined /> {item.address} {/*<Tag>{item.type?.name}</Tag>{' '}*/}
                                    </Space>
                                }
                                description={
                                    <div>
                                    <Row>
                                        <Col>
                                        {[
                                            { name: 'Street Name', value: item?.streetName },
                                            { name: 'Street No', value: item?.streetNo },
                                            { name: 'House', value: item?.houseNo },
                                            { name: 'Village', value: item?.village?.name },
                                            { name: 'Commune', value: item?.commune?.name },
                                            { name: 'District', value: item?.district?.name },
                                            { name: 'Province', value: item?.province?.name },
                                        ]
                                            .filter((it) => it.value)
                                            .map((it) => `${it.name} ${it.value}`)
                                            .join(', ')}
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                        {' '}
                                        Hotspot: {item.hotspot || 'N/A'}, Direction: {item.direction || 'N/A'}{' '}
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                        {' '}
                                        Latitute: {item.latitude || 'N/A'}, Longitude: {item.longitude || 'N/A'}
                                        </Col>
                                    </Row>
                                    </div>
                                }
                            />

                            {/* {(item.visitPlanOptionList || []).length > 0 && <ListContent item={item} />} */}
                            </List.Item>
                        )}
                        />
                </ProCard>
              </Flex>
            </Flex>
          </Flex>
        </ProCard>
        <ProCard size="small"                  
            headerBordered
            title='Purchasing Performance'
        >
            {data?.ppItems && <ProTable<PurchasingPerformanceItem>
          size="small"
          search={false}
          rowKey="id"
          dataSource={data?.ppItems}
          options={{
            density: false,
            fullScreen: false,
            reload: false,
            setting: false,
          }}
          pagination={false}
          columns={[
            { title: 'Category', dataIndex: 'categoryName' }, //render: (_, r, index) => ++index},
            { title: 'Item', dataIndex: 'itemName' },
            { title: "Monthly Purchase (Quantity)", dataIndex: 'pqty', },
            // { title: 'Amount', align: 'right', render: (_, r) => formatter1.format(r.amount) },
            { title: " Mininum Exceptation per Delivery (Quantity)", dataIndex: 'dqty', },
            // { title: 'Remarks', dataIndex: 'remarks' },
          ]}
        />}
        </ProCard>  
        <Card>
            <Descriptions>
                <Descriptions.Item label="Frequency of Purchase">
                    {data?.frequencyPurchase}
                </Descriptions.Item>
                <Descriptions.Item label="Remarks">
                    {data?.remarkFrequencyPurchase}
                </Descriptions.Item>
            </Descriptions>  
        </Card>  
        <ProCard size="small"                  
          headerBordered
          title='Document Requirment'
        >
            <Space direction="vertical" style={{ width: '90%' }}>
                {data?.docPersonalList && <DocmentRequire readOnly={true} title="1. Persal Identification Documents (ONE OF THE FOLLOWING)" itemList={data?.docPersonalList} />}
                {data?.docCorporateList && <DocmentRequire readOnly={true} title="2. Corporate Ducuments" itemList={data?.docCorporateList} />}  
                <RemarkCard/>   
            </Space>
        </ProCard> 
    </Space>)
}