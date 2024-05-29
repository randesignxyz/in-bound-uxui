import { ActionType, PageContainer } from '@ant-design/pro-components';
import { AccessoriesCreate, AccessoriesDTO, AccessoriesSearchParam } from "./data"
import { AccessoryServiceAPI } from "./service"
import { simpleRequestActions } from "@/services/model"
import { useRef } from "react"
import TableView, { TableViewSearchParams } from '@/components/DataCrud/TableView';
import { Paging } from '@/services/API';
import { Button, message, Modal, Space, Tag } from 'antd';
import { useModel } from '@umijs/max';
import EntryModalForm from './EntiryFormModal';
import { useState } from 'react';
import { ArrowRightOutlined, DashOutlined, DeleteOutlined, EditOutlined, PlusCircleOutlined } from '@ant-design/icons';
import AddToVehicleModal from './AddToVehicleModal';
import Dropdown from 'antd/lib/dropdown/dropdown';
import { MenuProps } from 'antd/lib/menu';
import AccessoryDetailView from './Detail';
import { formatter } from '@/pages/utils';
import AccessoryAddQTY from './AccessoryAddQTY';

export default () => {
    const requestAction = simpleRequestActions();
    const services = AccessoryServiceAPI(requestAction);
    const actionRef = useRef<ActionType>();
    const [state, setState] = useState<{ visible?: { name: 'modal'; type: 'ADD' | 'Edit'; payload?: { vehicle: AccessoriesDTO } }; }>({});
    const [addToVehicle, setAddToVehicle] = useState<{ visible?: { name: 'modal'; type: 'ADD' | 'Edit'; payload?: { vehicle: AccessoriesDTO } }; }>({});
    const [detailState, setDetailState] = useState<{
        visible?: {
            name: "DRAWER";
            payload: AccessoriesDTO
        }
    }>();
    const [advanceSearchParams, setAdvanceSearchParams] = useState<AccessoriesSearchParam>({
        status: 'ALL',
    });
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
        });
    }
    const getItem = (r: AccessoriesDTO): MenuProps["items"] => [
        {
            key: 2,
            label: "View",
            itemIcon: <ArrowRightOutlined />,
            onClick: () => setDetailState({ visible: { name: "DRAWER", payload: r } })
        },
        {
            key: 1,
            label: "Edit",
            itemIcon: <EditOutlined />,
            onClick: () => setState({ visible: { name: "modal", type: "Edit", payload: { vehicle: r } } })
        },
        {
            key: 4,
            label: "Add Quantity",
            itemIcon: <PlusCircleOutlined />,
            onClick: () => setDeduction({ visible: { name: "MODAL", payload: r } })
        },
        {
            type: "divider"
        },
        {
            key: 3,
            label: "Delete",
            itemIcon: <DeleteOutlined />,
            danger: true,
            onClick: () => onDelete(r)
        },
    ];
    const [deduction, setDeduction] = useState<{
        visible?: {
            name: "MODAL",
            payload?: AccessoriesDTO
        }
    }>();
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
    return (
        <>
            <TableView<AccessoriesDTO, { searchValue?: string }>
                tableProps={{
                    actionRef: actionRef,
                }}
                actionHandlers={{
                    onAdd: onAddHandler,
                    onRequest: (criteria, pagination, sort) =>
                        onRequestHandler({
                            criteria: {
                                ...criteria,
                                advanceSearch: advanceSearchParams,
                                sort
                            }
                        }),
                    onFirstLoad: () =>
                        cacheList.fetchDataList('retailer-customer').then((v) => {
                            if (v) {
                                setAdvanceSearchParams({
                                    ...v.creteria?.criteria,
                                    status: v.creteria?.criteria?.advanceSearch?.status ?? 'ALL',
                                });
                                return v.dataList;
                            } else {
                                return onRequestHandler({
                                    criteria: {
                                        advanceSearch: advanceSearchParams,
                                    },
                                });
                            }
                        }) as Promise<Paging<AccessoriesDTO>>,
                }}
                extraFilter={
                    <Space size="large">
                    </Space>
                }
                columns={[
                    {
                        title: "Part",
                        dataIndex: "partNumber",
                        sorter: "partNumber",
                        render:(_,r)=><Button type='link' onClick={()=>setDetailState({ visible: { name: "DRAWER", payload: r } })}>{r.partNumber}</Button>
                    },
                    {
                        title: "Name",
                        dataIndex: "name",
                        sorter: true
                    },
                    {
                        title: "Category",
                        dataIndex: "category",
                        render: (_, r) => r.category?.name,
                        sorter: "category",
                    },
                    {
                        title: "Manufacturer",
                        dataIndex: "manufacturer",
                        sorter: "manufacturer",
                    },
                    {
                        title: "Quantity",
                        dataIndex: "qty",
                        sorter: true,
                        render: (_, r) => `${r.qty.toFixed(2).toString()}`
                    },
                    {
                        title: "Unit Cost",
                        dataIndex: "unitCost",
                        sorter: true,
                        valueType: "money",
                        render: (_, r) => <Tag color='gold' bordered={false}>{formatter.format(r.unitCost)}</Tag>
                    },
                    {
                        title: "Vendors",
                        dataIndex: "vendor",
                        sorter: true
                    },
                    {
                        title: "Action",
                        width: 70,
                        render: (_, r) => (
                            <Dropdown
                                menu={{
                                    items: getItem(r),
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
            <AccessoryDetailView
                open={detailState?.visible?.name === "DRAWER"}
                data={detailState?.visible?.payload}
                onClose={() => setDetailState((v) => ({ ...v, visible: undefined }))}
            />
            <AccessoryAddQTY
                open={deduction?.visible?.name == "MODAL"}
                onCancel={() => setDeduction((v) => ({ ...v, visible: undefined }))}
                data={deduction?.visible?.payload}
                onSave={(data: AccessoriesCreate) => {
                    Modal.confirm({
                        title: "Deduct quantity into accessory",
                        content: "are you sure?",
                        onOk: () => {
                            services.deductAccessoryQTY(data).then(it => {
                                message.success("SUCCESS!");
                                actionRef.current?.reload?.();
                                setDeduction((v) => ({ ...v, visible: undefined }));
                            })
                        }
                    })
                }}
            />
            </>
    )
}