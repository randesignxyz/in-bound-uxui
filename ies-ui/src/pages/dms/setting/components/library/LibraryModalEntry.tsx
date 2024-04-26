import FormModalComp, { FormModalProps } from "@/components/FormModal";
import { ProForm, ProFormDependency, ProFormSelect, ProFormText, ProFormTextArea } from "@ant-design/pro-components";
import { LibraryCreate } from "./data";
import { useForm } from "antd/es/form/Form";
import { useEffect } from "react";
import { DepartmentServiceAPI } from "../department/service";
import { simpleRequestActions } from "@/services/model";
import { LibraryServiceAPI } from "./service";

interface Props extends FormModalProps {
    onSave: (data: LibraryCreate) => void;
    code?:string;
    isAdmin:boolean;
    libraryId?:number;
}
const LibraryModalEntry: React.FC<Props> = ({ onSave,isAdmin, code, libraryId, ...props }: Props) => {
    const [form] = useForm<LibraryCreate>();
    const requestAction = simpleRequestActions();
    const onLaodData = async ()=>{
        const data = await LibraryServiceAPI(requestAction).fetch(libraryId);
       form.setFieldsValue(data);
    }
    useEffect(() => {
        props.open && form.resetFields();
        props.open && libraryId && onLaodData();
    }, [props.open]);
    return (
        <>
            <FormModalComp
                {...props}
                onSubmit={async () => {
                    const dataForm = await form.validateFields();
                    const entry = {
                        ...dataForm,
                        parseInt: 0,
                    }
                    onSave(entry);
                }}
                width="500px"
                title="Library Form Register"
            >
                <ProForm
                    form={form}
                    submitter={false}
                >
                    <ProFormText
                        name={"name"}
                        label={"Library Name"}
                         rules={[{required:true}]}
                    />
                    <ProFormText
                        name={"location"}
                        label={"Library Location"}
                    />
                    <ProFormSelect
                        name={"type"}
                        label={"Type"}
                        initialValue={isAdmin?"department":"own"}
                        rules={[{required:true}]}
                        disabled={(code=="own"?true: isAdmin) || (libraryId?true:false)}
                        options={[
                            {
                                label: "Own",
                                value: "own",
                            },
                            {
                                label: "Department",
                                value: "department",
                            },
                        ]}
                    />
                    <ProFormDependency dependencies={["type"]} name={["type"]}>
                        {({type}) => {
                            return (
                                <>
                                    {type =="department" && (
                                        <ProFormSelect
                                        name={"departmentId"}
                                        label="Department"
                                        request={async()=>{
                                            const data = await DepartmentServiceAPI(requestAction).page({
                                                criteria:{
                                                    searchValue:""
                                                }
                                            })
                                            return data.items.map(it=>({
                                                value:it.id,
                                                label:it.name
                                            }))
                                        }}
                                        disabled={libraryId?true:false}
                                        rules={[{required:libraryId?false:true}]}
                                    />
                                    )}
                                </>
                            )
                        }}
                    </ProFormDependency>
                    <ProFormSelect
                        initialValue={"active"}
                        options={[
                            {
                                label: "Active",
                                value: "active",
                            },
                            {
                                label: "Inactive",
                                value: "inactive",
                            }
                        ]}
                        rules={[{required:true}]}
                        name={"status"}
                        label={"Status"}
                    />
                    <ProFormTextArea
                        name={"description"}
                        label="Description"
                    />
                </ProForm>
            </FormModalComp>
        </>
    )
}

export default LibraryModalEntry