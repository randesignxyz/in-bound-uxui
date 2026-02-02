import { ModalForm, ProFormText, ProFormSwitch, ModalFormProps } from "@ant-design/pro-components"
import { Divider } from "antd"
import Title from "antd/es/typography/Title"


import React from "react"

interface Props extends ModalFormProps {
}
const DataSetupForm: React.FC<Props> = ({ ...props }) => {


    return <>
        <ModalForm
            {...props}
            title={<Title level={4}>Create Master Type</Title>}
            submitter={{
                searchConfig: {
                    submitText: 'Create Type',
                    resetText: 'Cancel'
                }
            }}
        >

            <ProFormText
                name="name"
                label="Type Name"
                placeholder="e.g. Employee Position"
                rules={[{ required: true, message: 'Please enter a name' }]}
            />
            <ProFormText
                name="code"
                label="System Code"
                placeholder="e.g. EMP_POSITION"
                rules={[{ required: true, message: 'Please enter a unique code' }]}
                normalize={(value) =>
                    value ? value.toUpperCase().replace(/\s+/g, '_') : ''
                }
                help="Code is automatically uppercase with underscores."
            />

            <Divider style={{ margin: '12px 0' }} />

            <ProFormSwitch
                name="isHierarchical"
                label="Hierarchical Structure"
                tooltip="Allows creating parent-child relationships between items."
            />
        </ModalForm>
    </>
}

export default DataSetupForm