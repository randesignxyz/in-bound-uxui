import { ModalForm, ModalFormProps, ProCard, ProForm, ProFormGroup, ProFormSelect, ProFormText, ProList } from "@ant-design/pro-components"
import { Button, Input, Space } from "antd"
import { uniqueId } from "lodash"

type FormType = {

}

export default ({ trigger }: { trigger?: JSX.Element }) => {
    return <ModalForm title="SAP Invoice Finder" trigger={trigger}
        submitter={false}
    >  <Space direction="vertical" style={{ width: '100%' }}>
            <ProCard bordered >
                <ProForm submitter = {false}>
                    <ProFormSelect label="Customer" name={"customer"} />
                </ProForm>
            </ProCard>

            <ProCard>
                <ProList />
            </ProCard>
        </Space>
    </ModalForm>

}