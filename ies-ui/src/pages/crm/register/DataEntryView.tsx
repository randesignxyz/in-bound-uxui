import { AimOutlined, PlusOutlined } from "@ant-design/icons";
import { ProCard, ProForm, ProFormDatePicker, ProFormGroup, ProFormRadio, ProFormSelect, ProFormText, ProFormTextArea } from "@ant-design/pro-components"
import { Button, Col, Flex, List, Row, Space, Spin, Tag } from "antd"
import { AddresssView } from "./data";
import { useState } from "react";
import { AddressDataForm } from "./components/AddressListView";
import AddressModalEntry from "./components/AddressModalEntry";
// import { AddresssView } from "@/services/crm/data";

export default({}:{
      onBack?: () => void;
})=>{

    const [modal, setModal] = useState<{ visible: boolean; data?: AddressDataForm }>({
      visible: false,
    });

  return (<Spin spinning={false} >
    <ProForm dir="horizontal">
      <Space direction="vertical" style={{ width: '100%' }}>
        <ProCard size="small"
          bordered
          headerBordered
          title='Customer Infomation'
          style={{ marginBlockStart: 8 }}
          gutter={8}
          direction="row"
        >
          <Flex justify="space-between">
              <Flex vertical>
                <ProCard size="small"
                  bordered
                  headerBordered
                  title='General Infomation'
                  style={{ marginBlockStart: 8 }}
                  gutter={8}
                  direction="row"
                >
                  <ProFormText
                    // width={470}
                    // disabled={items.length > 0 && form.getFieldValue('vendorId')}

                    // key={`vendor${forceReloadVendorList}`}
                    label="Customer's ID"
                    rules={[{ required: true }]}
                    name={'customerNo'}
                    fieldProps={{
                      // popupMatchSelectWidth: 500, onClear() {
                      //   setVendor(undefined)
                      //   form.resetFields(['billToAddress'])
                      // },
                    }}
                    allowClear
                    // showSearch
                    // request={onFindVendorHandler}
                  />
                  <ProFormRadio.Group
                    name="vatInvoice"
                    label="VAT Invoice"
                    options={[
                      {
                        label: 'Yes',
                        value: 'Y',
                      },
                      {
                        label: 'No',
                        value: 'N',
                      }
                    ]}
                  />
                  <ProFormSelect
                      label="Purpose"
                      name={'purpose'}
                      placeholder={'Purpose'}
                      options={[{
                        label: 'New Account',
                        value: 'newAccount',
                      },{
                        label: 'Add Shipping Address',
                        value: 'addShippingAddress',
                      }]}
                      width={470}
                    />
                    <ProFormSelect
                      label="Price & Trade Offer"
                      name={'priceTradeOffer'}
                      placeholder={'Price & Trade Offer'}
                      options={[{
                        label: 'Wholsale',
                        value: 'Wholsale',
                      },{
                        label: 'Standard',
                        value: 'Standard',
                      },{
                        label: 'Special(Enclose Sales Terms)',
                        value: 'Special(Enclose Sales Terms)',
                      }]}
                      width={470}
                    />
                    <ProFormSelect
                      label="Payment Term"
                      name={'paymentTerm'}
                      placeholder={'Payment Term'}
                      options={[{
                        label: 'Wholsale',
                        value: 'Wholsale',
                      },{
                        label: 'Standard',
                        value: 'Standard',
                      },{
                        label: 'Special(Enclose Sales Terms)',
                        value: 'Special(Enclose Sales Terms)',
                      }]}
                      width={470}
                    />
                  {/* <ProFormGroup>
                    <ProFormSelect
                      label="Contact Person"
                      name={'contactPersonId'}
                      placeholder={'Contact Person'}
                      // options={vendor?.contactList.map((it) => ({
                      //   label: it.contactName,
                      //   value: it.id,
                      // }))}
                      width={470}
                    />
                  </ProFormGroup>
                  <ProFormGroup>
                    <ProFormText
                      rules={[{ required: true }]}
                      name={'phone1'}
                      label="Phone1"
                      width={'sm'}
                    />
                    <ProFormText name={'phone2'} label="Phone2" width={'sm'} />
                  </ProFormGroup>
                  <ProFormText width={470} name={'mail'} label="E-Mail" />
                  <ProFormTextArea
                    name={'address'}
                    fieldProps={{ rows: 1, maxLength: 300 }}
                    width={500}
                    label="Address"
                  /> */}
                </ProCard>
              </Flex>

              <Flex vertical>
                <Flex justify="space-between" gap={0}>
                  <Flex vertical>
                    <ProCard
                       title='Billing Address'
                        style={{ marginBlockStart: 8 }}
                        gutter={8}
                    >
                      <List<AddresssView> style={{width:'450px'}}
                        size="small"
                        locale={{ emptyText: 'No Address added' }}
                        // dataSource={list}
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
                            //       icon={<DeleteOutlined />}
                            //     />
                            //   ),
                            // ]}
                          >
                            <List.Item.Meta
                              title={
                                <Space>
                                  {' '}
                                  <AimOutlined /> {item.address} <Tag>{item.type?.name}</Tag>{' '}
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
                      <Button
                        size="small"
                        style={{ width: '100%', marginBottom: 8 }}
                        type="dashed"
                        onClick={() => setModal({ visible: true })}
                        icon={<PlusOutlined />}
                      />
                      {/* <ProFormSelect
                        width={'md'}
                        name={'billToAddressId'}
                        rules={[{ required: true }]}
                        // options={vendor?.billingAddressList.map((it) => ({
                        //   label: it.address,
                        //   value: it.id,
                        // }))}
                        label="Bill to Address"
                      />
                      <ProFormTextArea
                        name={'billToAddress'}
                        placeholder={''}
                        fieldProps={{ rows: 7, readOnly: true }}
                        width={'md'}
                      />
                      <ProFormDatePicker width={'md'} rules={[{ required: true }]} label="Delivery Date" name={"deliveredDate"} /> */}

                    </ProCard>
                  </Flex>
                  <Flex vertical>
                    <ProCard
                       title='Shipping Address'
                        style={{ marginBlockStart: 8 }}
                        gutter={8}
                    >
                      <List<AddresssView> style={{width:'450px'}}
                        size="small"
                        locale={{ emptyText: 'No Address added' }}
                        // dataSource={list}
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
                            //       icon={<DeleteOutlined />}
                            //     />
                            //   ),
                            // ]}
                          >
                            <List.Item.Meta
                              title={
                                <Space>
                                  {' '}
                                  <AimOutlined /> {item.address} <Tag>{item.type?.name}</Tag>{' '}
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
                      <Button
                        size="small"
                        style={{ width: '100%', marginBottom: 8 }}
                        type="dashed"
                        // onClick={() => setModal({ visible: true })}
                        icon={<PlusOutlined />}
                      />
                      {/* <ProFormSelect
                        width={'md'}
                        name={'billToAddressId'}
                        rules={[{ required: true }]}
                        // options={vendor?.billingAddressList.map((it) => ({
                        //   label: it.address,
                        //   value: it.id,
                        // }))}
                        label="Bill to Address"
                      />
                      <ProFormTextArea
                        name={'billToAddress'}
                        placeholder={''}
                        fieldProps={{ rows: 7, readOnly: true }}
                        width={'md'}
                      />
                      <ProFormDatePicker width={'md'} rules={[{ required: true }]} label="Delivery Date" name={"deliveredDate"} /> */}

                    </ProCard>
                  </Flex>
                </Flex>
              </Flex>
            </Flex>
        </ProCard>
        <ProCard size="small"
          title='Billing Address'
          headerBordered
          bordered
        >
          <div>Customer Inf</div>
        </ProCard>
        <AddressModalEntry
          title="Address"
          open={modal.visible}
          // addressReadonly={addressR?eadonly}
          onCancel={() => setModal({ visible: false })}
          data={modal.data}
          initData={{
            // lookupDataList: data.init.lookupDataList?.filter(
            //   (it) =>
            //     it.type !== 'ADDRESS_TYPE' ||
            //     !list?.some((i) => i.type?.id == 14033) ||
            //     it.id !== 14033,
            // ),
            // provinceList: data.init.provinceList,
          }} actionHandlers={{
            onAdd: function (address: AddresssView, cb?: (sucess: boolean) => void): void {
              throw new Error("Function not implemented.");
            },
            onEdit: function (address: AddresssView, cb?: (sucess: boolean) => void): void {
              throw new Error("Function not implemented.");
            },
            onLoadLocations: undefined,
            onLoadMultiLocations: undefined,
            onCleaLocation: undefined
          }}        // locations={data.locations}
        // actionHandlers={{
          // onAdd: (data) =>
            // actionHandlers.onAdd(data, (success) => {
            //   if (success) {
            //     actionHandlers.loadData?.();
            //     setModal({ visible: false });
            //   }
            // }),
          // onEdit: (data) =>
          //   actionHandlers.onEdit(data, (success) => {
          //     if (success) {
          //       actionHandlers.loadData?.();
          //       setModal({ visible: false });
          //     }
          //   }),
          // onLoadLocations: actionHandlers.onLoadLocations,
          // onLoadMultiLocations: actionHandlers.onLoadMultiLocations,
          // onCleaLocation: actionHandlers.onCleaLocation,
        // }}
      />
      </Space>
    </ProForm>
  </Spin>);
}