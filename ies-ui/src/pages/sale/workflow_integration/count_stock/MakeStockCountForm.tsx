import { FormModalProps } from "@/components/FormModal";
import { ActionDataFormProps } from "@/pages/process-flow/data";
import { ActionFormWrapper } from "@/pages/process-flow/form-resources";
import { EditableProTable, ModalForm, ProForm } from "@ant-design/pro-components";
import { Card, Flex, UploadFile } from "antd";
import { useForm } from "antd/es/form/Form";
import { useEffect, useState } from "react";

interface Props extends ActionDataFormProps {

}

const MakeStockCountForm: React.FC<Props> = ({ ...props }) => {
    const [files, setFiles] = useState<UploadFile[]>([])
    const [form] = useForm<any>();

    return  <ActionFormWrapper
            {...props}
            title="Make Stock Count"
            actionHandlers={{
                ...props.actionHandlers,
                onCompletedTask:async()=>{},
                onSetFiles: file => setFiles(v => (file)),
            }}

        >

            <ProForm
                form={form}
                submitter={false}
            >
                <Flex>
                    <Card >

                    </Card>
                <EditableProTable
                    columns={[
                        {
                            title:""
                        }
                    ]}
                />
                </Flex>
            </ProForm>
        </ActionFormWrapper>
    
}

export default MakeStockCountForm