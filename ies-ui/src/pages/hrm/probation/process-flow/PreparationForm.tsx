import { ActionDataFormProps } from '@/pages/process-flow/data';
import ActionFormWrapper from '@/pages/process-flow/components/forms/ActionFormWrapper';
import { ProForm, ProFormTextArea } from "@ant-design/pro-components";
import { Card } from "antd";

export default (props: ActionDataFormProps) => {
    return (
        <ActionFormWrapper
           title="Request Review"
            {...props}
            width={'1350px'}
            actionHandlers= {{...props.actionHandlers,
                onCompleted: async ()=> {},
                onSetFiles: file => {},
                onRemoveFile: file => {},
                onReset: ()=> {
                //   loadData()
                //   form.setFieldsValue({
                //       comment: undefined
                //     })
                //     setFiles([])
                }
            }}
        >
             <ProForm  submitter={false}>
                <Card style={{ marginTop: 10, marginBottom: 10 }}>
                    <ProFormTextArea rules={[{required: props.action =='Rejected'}]} label="Comment" name="comment" />
                </Card>
             </ProForm>

        </ActionFormWrapper>
    )

}