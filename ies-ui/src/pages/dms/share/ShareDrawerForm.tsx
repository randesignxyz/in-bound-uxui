import { DrawerForm, DrawerFormProps, ProFormCheckbox, ProFormDatePicker, ProFormDependency, ProFormSelect, ProFormTextArea } from "@ant-design/pro-components";
import { Alert, Col, Divider, Row } from "antd";
import { ShareCreate } from "./data";
import { simpleRequestActions } from "@/services/model";
import dayjs from 'dayjs';
import { TeamsServiceAPI } from "../setting/teams/service";
import { useEffect, useState } from "react";
import { useForm } from "antd/lib/form/Form";
import { CoreServiceAPI } from "../service";

interface Props extends DrawerFormProps {
    onSave: (data: ShareCreate) => void,
    onCancel: () => void,
    docId?: number;
    type?: string
}
const ShareDrawerForm: React.FC<Props> = ({ onSave, onCancel, docId, type, ...props }: Props) => {
    const requestAction = simpleRequestActions();
    const [form] = useForm<ShareCreate>();
    const [recipeintState, setRecipeintState] = useState<{
        recipeint?: boolean;
        group?: boolean;
    }>();
    useEffect(() => {
        form.resetFields();
        setRecipeintState({ group: false, recipeint: false })
    }, [props.open]);
    return (
        <DrawerForm
            width={500}
            title="QUICK SHARE"
            form={form}
            {...props}
            resize={{
                maxWidth: window.innerWidth * 0.8,
                minWidth: 300,
            }}
            drawerProps={{
                onClose: onCancel,
            }}
            submitter={{
                onSubmit: () => {
                }
            }}
            onFinish={async () => {
                const dataForm = await form.validateFields();
                const entry = {
                    ...dataForm,
                    documentId: docId
                }
                onSave(entry)
            }}
        >
            <>
                <ProFormSelect
                    label="Recipient"
                    name="recipient"
                    placeholder={"username or user id"}
                    showSearch
                    disabled={recipeintState?.recipeint}
                    debounceTime={500}
                    rules={[{ required: !recipeintState?.recipeint }]}
                    fieldProps={{
                        onChange: (e) => {
                            if (e != undefined) {
                                setRecipeintState({ group: true })
                            }
                            else {
                                setRecipeintState({ group: false })
                            }
                        }
                    }}
                    request={async (k: { keyWords: string }) => {
                        const data = await CoreServiceAPI(requestAction).page({
                            criteria: {
                                searchValue: k.keyWords
                            }
                        });
                        return data.items.map(o => ({ label: o.fullName, value: o.userName }))
                    }}
                />
                <p>OR</p>
                <ProFormSelect
                    name={"teamId"}
                    label="Teams "
                    disabled={recipeintState?.group}
                    rules={[{ required: !recipeintState?.group }]}
                    showSearch
                    fieldProps={{
                        onChange: (e: any) => {
                            if (e != undefined) {
                                setRecipeintState({ recipeint: true })
                            }
                            else {
                                setRecipeintState({ recipeint: false })
                            }
                        }
                    }}
                    request={async (k: { keyWords: string }) => {
                        const data = await TeamsServiceAPI(requestAction).page({
                            criteria: {
                                searchValue: k.keyWords || "",
                                advanceSearch: {}
                            }
                        });
                        return data.items.map(v => ({
                            value: v.id,
                            label: v.name
                        }))
                    }}
                />
                <ProFormCheckbox
                    labelAlign="left"
                    name={"sendMail"}
                    label="Send Mail"
                    initialValue={true}
                />
                <Divider orientation="left">Setting</Divider>
                <Row gutter={16}>
                    <Col span={12}>
                        <ProFormDatePicker
                            name={"effectiveDate"}
                            label="Effective date"
                            width={"md"}
                        />
                    </Col>
                    <Col span={12}>
                        <ProFormDatePicker
                            name={"expirationDate"}
                            label="Expiry date"
                            width={"md"}
                            fieldProps={{
                                disabledDate: (current: any) => {
                                    return current && current < dayjs().endOf('day');
                                }
                            }}
                        />
                    </Col>
                </Row>
                <ProFormSelect
                    label="Accessible"
                    initialValue={"previewer"}
                    name={"accessible"}
                    rules={[
                        { required: true }
                    ]}
                    options={[
                        {
                            value: "previewer",
                            label: "Previewer"
                        },
                        {
                            value: "viewer",
                            label: "Viewer"
                        },
                        {
                            value: "editor",
                            label: "Editor"
                        },
                    ]}
                />
                <ProFormDependency dependencies={["accessible"]} name={["accessible"]}>
                    {({ accessible }) => {
                        const message = () => {
                            if (accessible == "previewer") {
                                return "Preview-only permission that allows the user to see the documents shared to them only as an in-system preview. They cannot download or print the resource, or do anything else with the documents or the system   "
                            }
                            else if (accessible == "viewer") {
                                return "The user can preview the files shared to them in-system, print and download the files. They cannot change any metadata or versions, they also cannot delete files"
                            }
                            else {
                                return "Editors can preview and download files, change metadata, add versions and delete the documents shared to them with ‘Editor’ permission. Sharing a folder or section with ‘Editor’ permission allows the person to add files and folders into that structure."
                            }
                        }
                        return <Alert message={message()} type="info" showIcon />
                    }}
                </ProFormDependency>
                <ProFormTextArea
                    name={"description"}
                    label="Remark"
                />
            </>
        </DrawerForm>
    )
}

export default ShareDrawerForm