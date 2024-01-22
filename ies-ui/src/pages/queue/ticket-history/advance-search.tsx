import { DrawerForm, DrawerFormProps, ProFormDateRangePicker,  ProFormSelect, ProFormText } from "@ant-design/pro-form"
import { Button, Space } from "antd"

type Data = {
    licensePlate?: string
}

interface Props extends DrawerFormProps<Data> {
    
}

export default ({ ...props }: Props) => {

    return (
        <DrawerForm {...props}
            title={"Advance Search"}
            onFinish = {(d) => {
                console.log(d);
                
                return Promise.resolve()
            }}
            submitter = {{
                render: (props) => {
                    return <Space>
                        <Button onClick = {props.reset}>Reset</Button>
                        <Button type="primary" onClick = {props.submit}>Submit</Button>
                    </Space> 
                }
            }}
        >
            <ProFormSelect mode="multiple" label = "Driver" name={"driver"}/>
            <ProFormText width={'md'} label = "License Plate" name={"licensePlate"}/>
            <ProFormDateRangePicker label ="Issued Date" name={'issuedDate'} />

        </DrawerForm>
    )
}