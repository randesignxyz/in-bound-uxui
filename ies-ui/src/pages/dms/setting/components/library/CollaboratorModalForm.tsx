import FormModalComp, { FormModalProps } from "@/components/FormModal";
import { ProForm, ProFormSelect } from "@ant-design/pro-components";
import { CoreServiceAPI } from "@/pages/dms/service";
import { simpleRequestActions } from "@/services/model";
import { TeamOutlined } from "@ant-design/icons";
import { Avatar, Space } from "antd";
import { CollaboratorCreate, FolderDTO } from "@/pages/dms/folder/data";
import { useForm } from "antd/es/form/Form";
import { useEffect } from "react";

interface Props extends FormModalProps {
    onSave: (data: CollaboratorCreate) => void,
    data?: FolderDTO
}
const CollaboratorsModalForm: React.FC<Props> = ({ data, onSave, ...props }) => {
    const requestActions = simpleRequestActions();
    const [form] = useForm<CollaboratorCreate>();
    useEffect(()=>{
        props.open && form.resetFields();
    },[props.open]);
    return (
        <FormModalComp
            {...props}
            width="500px"
            onSubmit={async()=>{
                const dataForm = await form.validateFields();
                const entry = {
                    ...dataForm,
                    folder:data?.id
                }
                onSave(entry);
            }}
        >
            <ProForm
                submitter={false}
                style={{ backgroundColor: "white" }}
                form={form}
            >
                <Space
                    align="center"
                    direction="vertical"
                    style={{
                        width: "100%"
                    }}
                >
                    <Avatar
                        size={{ xs: 24, sm: 32, md: 40, lg: 64, xl: 80, xxl: 100 }}
                        icon={<TeamOutlined twoToneColor={"#2196F3"} />}
                    />
                    <h3>Add collaborators to <span style={{ fontWeight: "bold" }}>{data?.name}</span></h3>
                </Space>
                <ProFormSelect
                    fieldProps={{
                        mode: "multiple",
                       defaultOpen:false,
                    }}
                    rules={[{required:true}]}
                    debounceTime={500}
                    name={"people"}
                    showSearch
                    label="Search by username, full name"
                    request={async (k: { keyWords: string }) => {
                        const data = await CoreServiceAPI(requestActions).page({
                            criteria: {
                                searchValue: k.keyWords
                            }
                        });
                        return data.items.map(o => ({ label: o.fullName, value: o.userName }))
                    }}
                />
            </ProForm>
        </FormModalComp>
    )
}

export default CollaboratorsModalForm