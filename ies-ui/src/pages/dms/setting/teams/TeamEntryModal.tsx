import FormModalComp, { FormModalProps } from "@/components/FormModal";
import { ProForm, ProFormDependency, ProFormSelect, ProFormText, ProFormTextArea } from "@ant-design/pro-components";
import { useForm } from "antd/es/form/Form";
import { useEffect } from "react";
import { CoreServiceAPI } from "../../service";
import { simpleRequestActions } from "@/services/model";
import { DepartmentServiceAPI } from "../components/department/service";
import { TeamsCreate, TeamsDTO } from "./data";

interface Props extends FormModalProps {
    onSave: (data: TeamsCreate) => void;
    data?: TeamsDTO
}


const UserGroupEntryModal: React.FC<Props> = ({ onSave, data, ...props }: Props) => {

    const [form] = useForm<TeamsCreate>();
    const requestActions = simpleRequestActions();


    useEffect(() => {
        props.open && data && form.setFieldsValue({ ...data, memberList: data?.memberList.map(it => it.userName) });
        props.open && !data && form.resetFields();
    }, [props.open])

   
    return (
        <FormModalComp
            {...props}
            title="Teams"
            width="800px"
            onSubmit={async () => {
                const dataForm = await form.validateFields();
                const entry={
                    ...dataForm,
                    id:data?.id
                }
                onSave(entry);

            }}
        >
            <ProForm
                form={form}
                submitter={false}
            >
                <ProFormText
                    name="name"
                    label="Name"
                />
               
               <ProFormSelect
                name={"department"}
                label="Department"
                showSearch
                debounceTime={500}
                request={async(k:{keyWords?:string})=>{
                    const data = await DepartmentServiceAPI(requestActions).page({
                        criteria:{
                            searchValue:k.keyWords ||""
                        }
                    });

                    return data.items.map(t=>({label:t.name, value:t.id}))
                }}
               />
                <ProFormDependency dependencies={['department']} name={["department"]}>
                    {({department})=>{
                        return (<ProFormSelect
                            name={"memberList"}
                            label="Members"
                            fieldProps={{
                                mode: "multiple"
                            }}
                            allowClear
                            debounceTime={500}
                            showSearch
                            request={async(k?:{keyWords:string})=>{
                                const data = await CoreServiceAPI(requestActions).page({
                                    criteria: {
                                        searchValue: k?.keyWords || ""
                                    }
                                });
        
                                return data.items?.filter(it=>it.department ==department).map((it) => ({
                                    label: it.fullName,
                                    value: it.userName
                                }))
                            }}
                        />)
                    }}
                </ProFormDependency>
                
                <ProFormTextArea
                    name="description"
                    label="Description"
                />

            </ProForm>
        </FormModalComp>
    )
}

export default UserGroupEntryModal