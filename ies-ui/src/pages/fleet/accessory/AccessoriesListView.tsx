import { ActionType } from '@ant-design/pro-components';
import { AccessoriesCreate, AccessoriesDTO, AccessoriesSearchParam } from "./data"
import { AccessoryServiceAPI } from "./service"
import { simpleRequestActions } from "@/services/model"
import { useRef } from "react"
import TableView, { TableViewSearchParams } from '@/components/DataCrud/TableView';
import { Paging } from '@/services/API';
import { message, Modal, Space } from 'antd';
import { useModel } from '@umijs/max';
import EntryModalForm from './EntiryFormModal';
import { useState } from 'react';
import { DashOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import AddToVehicleModal from './AddToVehicleModal';
import Dropdown from 'antd/lib/dropdown/dropdown';
import { MenuProps } from 'antd/lib/menu';


interface Props {
    id?: "",

}
export default ({ id }: Props) => {
    const requestAction = simpleRequestActions();
    const services = AccessoryServiceAPI(requestAction);
    const actionRef = useRef<ActionType>();

    const [state, setState] = useState<{ visible?: { name: 'modal'; type: 'ADD' | 'Edit'; payload?: { vehicle: AccessoriesDTO } }; }>({});
    const [addToVehicle, setAddToVehicle] = useState<{ visible?: { name: 'modal'; type: 'ADD' | 'Edit'; payload?: { vehicle: AccessoriesDTO } }; }>({});


    const cacheList = useModel('dataList');

    const onRequestHandler = async (params: TableViewSearchParams<AccessoriesSearchParam>) => {
        try {
            return services.page(params).then((it) => {
                return cacheList.cacheDataList({
                    type: 'fleet-accessories',
                    criteria: params,
                    data: it,
                });
            }) as Promise<Paging<AccessoriesDTO>>;
        } catch (error: any) {
            message.error(error.message);
            return Promise.reject();
        }
    };


    const onAddHandler = () => {
        setState((v) => ({
            ...v,
            visible: { name: 'modal', type: 'ADD' },
        }));
    }

    const onSaveActionHandler = (data: AccessoriesCreate) => {
        Modal.confirm({
            title: "Save Accessory record",
            content: " are you sure?",
            onOk: async () => {
                const response = await services.save(data) as ({
                    message: string,
                    data: string,
                });
                setState((v) => ({ ...v, visible: undefined }));
                message.success(response.message);
                actionRef.current?.reloadAndRest?.();
            }
        })

    }


    const items: MenuProps["items"] = [
        {
            key: 1,
            label: "Edit",
            itemIcon: <EditOutlined />,
        },
        // {
        //     key: 2,
        //     label: "Detail",
        //     itemIcon: <EyeOutlined />,
        // },
        {
            type: "divider"
        },
        {
            key: 3,
            label: "Delete",
            itemIcon: <DeleteOutlined />,
            danger: true,
        },

    ];

    const onDelete = (r: AccessoriesDTO) => {
        Modal.confirm({
            title: "Delete Accessory",
            content: "are you sure?",
            onOk: async () => {
                services.delete(r.id);
                message.success("accessory was delete");
                actionRef.current?.reload();
            }
        });
    }

    return (<>
        <TableView<AccessoriesDTO, { searchValue?: string }>

            columns={[

                {
                    title: "Name",
                    valueType: "text",
                    dataIndex: "name",
                },
                {
                    title: "Brand",
                    valueType: "text",
                    dataIndex: "brand",
                },
                {
                    title: "Code",
                    valueType: "text",
                    dataIndex: "code",
                },
                {
                    title: "Quantity",
                    valueType: "digit",
                    dataIndex: "quantity",
                },
                {
                    title: "Action",
                    width:70,
                    render: (_, r) => (
                        <Dropdown
                            menu={{
                                items,
                                onClick: (e) => {
                                    e.key === "3" && onDelete(r);
                                    // e.key === "2"
                                    e.key === "1" && setState({ visible: { name: "modal", type: "Edit", payload: { vehicle: r } } })
                                },
                                style: { width: 200 }
                            }}
                        >
                            <a>
                                <DashOutlined />
                            </a>
                        </Dropdown>

                    )
                },
            ]}
            tableProps={{
                actionRef: actionRef,

            }}

            actionHandlers={{
                onAdd: onAddHandler,
                onRequest: (criteria, pagination, sort) =>
                    onRequestHandler({
                        criteria,
                        pagination,
                    }),
            }}

            extraFilter={
                <Space size="large">
                </Space>
            }

        />

        <EntryModalForm
            actionType={""}
            open={state.visible?.name == "modal"}
            onCancel={() => setState((v) => ({ ...v, visible: undefined }))}
            onSave={onSaveActionHandler}
            data={state.visible?.payload?.vehicle}
        />
        <AddToVehicleModal
            id=''
            actionType={""}
            open={addToVehicle.visible?.name == "modal"}
            onCancel={() => setAddToVehicle((v) => ({ ...v, visible: undefined }))}
            onSave={onSaveActionHandler}

        />

    </>)

}