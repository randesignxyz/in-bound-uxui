import { ProDescriptions } from "@ant-design/pro-components"
import { FolderServiceAPI } from "./service";
import { simpleRequestActions } from "@/services/model";
import { Button } from "antd";
import { FolderAddOutlined } from "@ant-design/icons";
import { Space } from "antd/lib";
import EntryForm from "./EntryForm";
import { useState } from "react";
import { FolderCreate } from "./data";
interface Props {
    id: number
}
export default ({ id }: Props) => {
    const requestAction = simpleRequestActions();
    const service = FolderServiceAPI(requestAction);
    const [state, setState] = useState<{
        visible?: {
            name: "modal";
            type: "ADD" | "EDIT";
            payload?: { record: FolderCreate }
        }
    }>();
    return <>
        <Space
            style={{
                display: "flex",
                justifyContent: "space-between"
            }}
        >
            <Button
                type="link"
                icon={<FolderAddOutlined />}
                onClick={() => setState({ visible: { name: "modal", type: "ADD" } })}
            >
                New Folder
            </Button>
        </Space>
        <ProDescriptions
            request={async () => {
                const data = await service.fetch(id);
                return Promise.resolve({
                    data: data,
                    success: true
                })
            }}
            columns={[
                {
                    title: 'Folder Name',
                    dataIndex: "name",
                }
            ]}
        />
        <EntryForm
            open={state?.visible?.name === "modal"}
            onCancel={() => setState((v) => ({ ...v, visible: undefined }))}
            onSave={(data: FolderCreate) => {
                service.save(data);
            }}
        />
    </>
} 