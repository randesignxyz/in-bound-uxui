
import { Form, Button, Spin, Tabs, Space } from "antd"
import { SalePaths } from "../.."
import { Model } from "../model"
import { history } from "@umijs/max";
import { DollarCircleOutlined } from "@ant-design/icons"
import SoHeader from "../../so/components/SoHeader"
import { FooterToolbar, ProForm } from "@ant-design/pro-components"

type Props = {
    type: 'new' | 'edit',
    id?: number,
}

const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
};


const EntryForm: React.FC<Props> = ({ type, id }) => {

    const { state, actions } = Model()


    const onSaveActionHandler = async (isNew: boolean = false) => {

    }


    return <Spin spinning={state.loading}>
        <ProForm
            submitter={{
                render: () => {
                    return <FooterToolbar>
                        {type === 'new' && <Button onClick={() => {
                            // form.resetFields()
                        }}  >Clear</Button>}

                        {type === 'edit' && <Button onClick={() => {
                            history.push(`${SalePaths.tradeOffer}/detail/${id}`)
                        }}  >Cancel</Button>}
                        {type === 'edit' && <Button onClick={() => {
                            //form.resetFields()
                        }}  >Reset</Button>}
                        {type === 'new' && <Button type='primary' onClick={() => { onSaveActionHandler(true) }} >Save & Add New</Button>}
                        <Button type='primary' onClick={() => { onSaveActionHandler() }} >{type === 'new' ? 'Save & View' : 'Edit'}</Button>
                    </FooterToolbar>
                }
            }}
        />
        <Form.Provider>
            <Tabs>
                <Tabs.TabPane tab={<Space size={0}><DollarCircleOutlined /> <span>Sale Order</span></Space>} key='tradeOffer'>
                    {/* <ProForm
                        // labelAlign='left'

                        layout='horizontal'
                        {...layout}
                        size='middle'
                        submitter={false}
                        onValuesChange={onFormvalueChanged}
                        form={form}>
                        <SoHeader data={{
                            so: data?.soDetail,
                            addressList: data?.initData?.addressList,
                            salePersonList: data?.initData?.salePersonList,
                            deliveryMethodList: data?.initData?.deliveryMethodList,
                            requiredFields: requiredFields
                        }} />
                    </ProForm> */}
                </Tabs.TabPane>
            </Tabs>
        </Form.Provider>
    </Spin>
}
