import FormModalComp, { FormModalProps } from "@/components/FormModal"
import { CoreServiceAPI } from "@/pages/dms/service";
import { simpleRequestActions } from "@/services/model";
import { ProForm, ProFormSelect } from "@ant-design/pro-components"
import { useForm } from "antd/lib/form/Form"

interface Props extends FormModalProps {
    onSave: (data: AssignDepartment) => void,
    department?: DepartmentDTO;
}

const AsseignUserModalForm: React.FC<Props> = ({ onSave, department, ...props }) => {
    const [form] = useForm();
    const requestAction = simpleRequestActions();
    return (
        <>
            <FormModalComp
                {...props}
                onSubmit={async () => {
                    const data = await form.validateFields();
                    const entry={
                        ...data,
                        department:department?.id,
                        departmentName:department?.name
                    }
                    onSave(entry)
                }}
                title="Assign Fun"
            >
                <ProForm
                    submitter={false}
                    form={form}
                >
                    <ProFormSelect
                        name={"userId"}
                        label="Users"
                        fieldProps={{
                            mode: "multiple"
                        }}
                        allowClear
                        debounceTime={500}
                        showSearch
                        request={async (k?: { keyWords: string }) => {
                            const data = await CoreServiceAPI(requestAction).page({
                                criteria: {
                                    searchValue: k?.keyWords || ""
                                }
                            });
                            return data.items?.map((it) => ({
                                label: it.fullName,
                                value: it.id
                            }));
                        }}
                    />
                </ProForm>
            </FormModalComp>
        </>
    )
}

export default AsseignUserModalForm