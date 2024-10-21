import FormModalComp, { FormModalProps } from "@/components/FormModal"
import { ProForm, ProFormSelect, ProFormText, ProFormTextArea } from "@ant-design/pro-components"
import { useForm } from "antd/lib/form/Form"
import { simpleRequestActions } from "@/services/model"
import { useEffect } from "react"
import { FolderCreate, DataNode, FolderDTO } from "./data"
import { DepartmentServiceAPI } from "../setting/components/department/service"
interface Props extends FormModalProps {
    onSave: (data: FolderCreate) => void;
    data?: DataNode;
    type?: string,
    code?: string,
    libraryId?: string;
    libraryData?: FolderDTO
}
const FolderEntryForm: React.FC<Props> = ({ code, libraryId, libraryData, data, onSave, type, ...props }: Props) => {
    const [form] = useForm<FolderCreate>();
    const requestAction = simpleRequestActions();
    useEffect(() => {
        type === "EDIT" && data && form.setFieldsValue({
            name: data?.title,
            id: parseInt(data?.key || "")
        });
        !data && form.resetFields();
    }, [props.open]);   

    
    return (
        <FormModalComp
            {...props}
            title={`Form Register ${code == "LIBRARY" ? "Own Library" : "Folder"}`}
            width="500px"
            onSubmit={async () => {
                const dataForm = await form.validateFields();
                const id = type == "ADD" ? undefined : parseInt(data?.key || "");
                const entry = {
                    ...dataForm,
                    parentId: parseInt(data?.key || ""),
                    code: code,
                    libraryId: parseInt(libraryId || ""),
                    id: id
                }
                onSave(entry);
            }}
        >
            <ProForm
                submitter={false}
                form={form}
            >
                {code === "LIBRARY" && (
                    <>
                        <ProFormText
                            name={"name"}
                            label={"Library Name"}
                        />
                        <ProFormText
                            name={"location"}
                            label={"Library Location"}
                        />
                        <ProFormSelect
                            name={"type"}
                            label={"Type"}
                            initialValue={"department"}
                            disabled
                            options={[
                                {
                                    label: "Personal",
                                    value: "personal",
                                },
                                {
                                    label: "Department",
                                    value: "department",
                                },
                                {
                                    label: "Defualt",
                                    value: "default",
                                },
                            ]}
                        />
                        <ProFormSelect
                            name={"departmentId"}
                            label="Department"
                            showSearch
                            debounceTime={500}
                            request={async () => {
                                const data = await DepartmentServiceAPI(requestAction).page({
                                    criteria: {
                                        searchValue: ""
                                    }
                                })
                                return data.items.map(it => ({
                                    value: it.id,
                                    label: it.name
                                }))
                            }}
                            disabled={libraryId ? true : false}
                            rules={[{ required: libraryId ? false : true }]}
                        />
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
                            name={"status"}
                            label={"Status"}
                        />
                        <ProFormTextArea
                            name={"description"}
                            label="Description"
                        />
                    </>
                ) ||
                    (
                        <>
                            <p>Create a new folder. Folder names must be unique</p>
                            <ProFormText
                                name="name"
                                label="Folder Name"
                                rules={[{ required: true }]}
                            />
                            <ProFormText
                                name={"location"}
                                label="Location"
                            />
                            <ProFormTextArea
                                name={"description"}
                                label={"Description"}
                            />
                        </>
                    )
                }
            </ProForm>
        </FormModalComp>
    )
}
export default FolderEntryForm