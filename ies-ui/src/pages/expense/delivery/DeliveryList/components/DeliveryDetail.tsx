import { ModalForm, ModalFormProps, ProCard, ProFormText } from "@ant-design/pro-components"
import { Col, Row } from "antd"

export default ({ data, onFix, ...rest }: ModalFormProps<DeliveryDetail> & { data: DeliveryDetail; onFix?: (docEntry: number, cb?: ()=> void) => void }) => {
    return <ModalForm title='Delivery Note Detail' {...rest}
        initialValues={data}
        onFinish = { async () => {  onFix?.(data.docEntry, ()=> {rest.onOpenChange?.(false)}) }}
        submitter={{
            searchConfig: {
                submitText: "Sync"
            }
            
        }}>
        <ProCard>
            <Row gutter={16}>
                <Col flex={1}>
                    <ProFormText label='Company' name={'company'} />
                    <ProFormText label='Doc Entry' name={'docEntry'} />
                    <ProFormText label='Doc No' name={'docNo'} />
                    <ProFormText label='Customer Code' name={'shippingToCode'} />
                    <ProFormText label='Customer Name' name={'shippingToName'} />
                    <ProFormText label='Indirect Customer' name={'indirectName'} />
                    <ProFormText label='Canceled' name={'canceled'} />

                </Col>
                <Col flex={1}>
                    <ProFormText label='Driver' name={'driver'} />
                    <ProFormText label='Truck' name={'truckNo'} />
                    <ProFormText label='Tranport Type' name={'transportation'} />
                    <ProFormText label='Outsource' name={'outSource'} />
                    <ProFormText label='Province' name={'province'} />
                    <ProFormText label='District' name={'district'} />
                    <ProFormText label='commune' name={'commune'} />


                </Col>
            </Row>
        </ProCard>
    </ModalForm>
}