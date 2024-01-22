import FormModalComp, { FormModalProps } from "@/components/FormModal";
import { ProForm, ProFormDependency, ProFormSelect, ProFormText, ProFormTextArea } from "@ant-design/pro-components";
import { useForm } from "antd/es/form/Form";
import { useEffect } from "react";
import { GroupCreate, GroupDTO } from "./data";
import { CoreServiceAPI } from "../../service";
import { simpleRequestActions } from "@/services/model";
import { DepartmentServiceAPI } from "../components/department/service";

interface Props extends FormModalProps {
    onSave: (data: GroupCreate) => void;
    data?: GroupDTO
}


const UserGroupEntryModal: React.FC<Props> = ({ onSave, data, ...props }: Props) => {

    const [form] = useForm<GroupCreate>();
    const requestActions = simpleRequestActions();


    useEffect(() => {
        props.open && data && form.setFieldsValue({ ...data, userList: data?.userList.map(it => it.userName) })
    }, [props.open])

   
    return (
        <FormModalComp
            {...props}
            title="Group User"
            width="800px"
            onSubmit={async () => {
                const dataForm = await form.validateFields();
                onSave(dataForm)

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
                            name={"userList"}
                            label="Users"
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