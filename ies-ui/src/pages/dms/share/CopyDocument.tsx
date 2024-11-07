import FormModalComp, { FormModalProps } from "@/components/FormModal";
import { simpleRequestActions } from "@/services/model";
import { ProDescriptions, ProForm, ProFormTreeSelect } from "@ant-design/pro-components";
import { useForm } from "antd/es/form/Form";
import { useState, useEffect } from "react";
import { DocumentationCreate, DocumentationDTO, MoveDocParams } from "../documentation/data";
import { FolderServiceAPI } from "../folder/service";
import { Alert } from "antd";
import { size } from "lodash";
import { Flex } from "antd/lib";

interface Props extends FormModalProps {
    onSave: (data: DocumentationCreate) => void,
    data?: DocumentationDTO
}

const CopyDocument: React.FC<Props> = ({ onSave, data, ...props }) => {
    const requestAction = simpleRequestActions();
    const [form] = useForm<MoveDocParams>()
    const nest = (items: any[], id = 0, link = 'parentId'): any => {
        return items.filter(item => {
            return item[link] === id
        }).map(item => ({
            ...item,
            children: nest(items, item.id)
        }))
    }
    const [value, setValue] = useState<string>();
    const onChange = (newValue: string) => {
        setValue(newValue);
    };
    useEffect(() => {
        form.resetFields();
    }, [props.open]);

    console.log(data);
    
    return (
        <>
            <FormModalComp
                {...props}
                title="Save Document To My folder"
                width="700px"
                onSubmit={async () => {
                    const dataForm = await form.validateFields();
                    const entry: DocumentationCreate = {
                        ...data,
                        ...dataForm,
                        libraryId: 0,
                        id: 0,
                        content: {
                            ...data?.documentation,
                            id: undefined
                        },
                        term: {
                            ...data?.term,
                            id: 0
                        },
                        accountant: {
                            ...data?.accountant,
                            id: 0
                        }
                    }

                    onSave(entry);
                }}
            >
                <ProForm
                    submitter={false}
                    form={form}
                >
                    <Flex vertical gap={12}>
                    <Alert
                        showIcon={false}
                        type="warning"
                        description={
                            <ProDescriptions
                            size={"small"}
                                dataSource={data}
                                column={1}
                                columns={[
                                    {
                                        title: "Code",
                                        render:(_,r)=>r.documentation.docNumber
                                    },
                                    {
                                        title: "Document Name",
                                        render:(_,r)=>r.documentation.docName
                                    },
                                    {
                                        title:"From",
                                        render:(_,r)=>r.createdBy?.toString()?.replaceAll("."," ")
                                    }
                                ]}
                            />
                        }
                    />
                    <ProFormTreeSelect
                        name={"folderId"}
                        label={"Folder "}
                        rules={[{ required: true }]}
                        allowClear
                        secondary
                        request={async (k) => {
                            const data = await FolderServiceAPI(requestAction).list({ advanceSearch: {}, searchValue: "" });
                            const flatData = data.map(o => ({ id: o.id, parentId: o.parentId, label: o.name, value: o.id }));
                            return nest(flatData)
                        }}
                    // fieldProps={{
                    //     onSearch: onChange,
                    //     filterTreeNode: true,
                    //     showSearch: true,
                    //     popupMatchSelectWidth: true,
                    //     labelInValue: true,
                    //     autoClearSearchValue: true,
                    //     treeDefaultExpandAll: true,
                    //     onChange: (e) => {
                    //         setValue(e.value)
                    //     }
                    // }}
                    />
                    </Flex>
                </ProForm>
            </FormModalComp>
        </>
    )
}

export default CopyDocument