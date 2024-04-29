
import TableView from "@/components/DataCrud/TableView";
import { ActionType, PageContainer } from "@ant-design/pro-components";
import InventoryForm from "./InventoryForm";
import { useRef, useState } from "react";
import { Button, Flex, Modal, message } from "antd";
import { simpleRequestActions } from "@/services/model";
import { InventoryAPIService } from "./service";

interface Props {
    onDetail?: (id: number) => void;
    onAdd?: () => void;
    onEdit?: (id: number) => void;
}

export default ({ onDetail, onAdd, onEdit }: Props) => {
    const requestAction = simpleRequestActions();
    const actionRef = useRef<ActionType>();
    const services = InventoryAPIService(requestAction);
    const [state, setState] = useState<{
        visible?: {
            name: "MODAL",
            type: "ADD" | "EDIT",
            payload?: any
        }
    }>();
    return <>

        <TableView
            actionHandlers={{
                onAdd: () => setState({ visible: { name: "MODAL", type: "ADD" } }),

            }}
            tableProps={{
                actionRef: actionRef
            }}

            columns={[
                {
                    title: "Part",
                    dataIndex: "part",
                    sorter: true
                },
                {
                    title: "Name",
                    dataIndex: "category"
                },
                {
                    title: "Category",
                    dataIndex: "category"
                },

                {
                    title: "Description",
                    dataIndex: "category",
                    sorter: true
                },
                {
                    title: "Manufacturer",
                    dataIndex: "category",
                    sorter: true
                },
                {
                    title: "Quantity",
                    dataIndex: "category",
                    sorter: true
                },
                {
                    title: "Unit Cost",
                    dataIndex: "category",
                    sorter: true
                },
                {
                    title: "Vendors",
                    dataIndex: "category",
                    sorter: true
                },
                {
                    title: "",
                    render: (_, r) => (<></>)
                },
            ]}
        />



        <InventoryForm
            onSave={(data: InventoryCreate) => {
                Modal.confirm({
                    title: "Save Inventory record",
                    content: "are you sure?",
                    onOk: () => {
                        services.save(data).then(() => {
                            message.success("Success!");
                            actionRef.current?.reload?.();
                        });
                    }
                })
            }}
            open={state?.visible?.name === "MODAL"}
            onCancel={() => setState((v) => ({ ...v, visible: undefined }))}
        />
    </>
}