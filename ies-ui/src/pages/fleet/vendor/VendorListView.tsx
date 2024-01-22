
import TableView, { TableViewSearchParams } from '@/components/DataCrud/TableView';
import { Paging } from '@/services/API';
import { simpleRequestActions } from '@/services/model';
import { ActionType } from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { Button, Dropdown, MenuProps, message, Space, Spin } from 'antd';
import Omit from 'omit.js';
import { useRef, useState } from 'react';
import AdvanceFuelSearch from '../components/AdvanceFuelSearch';
import { DriverSearchParam } from './data';
import { AddOnServiceAPI } from '../addOn/service';
import DetailViewDrawer from './DetailViewDrawer';
import { ArrowRightOutlined, EllipsisOutlined, RedditOutlined, StarOutlined } from '@ant-design/icons';

interface Props {
    onDetail?: (id: number) => void;
    onAdd?: () => void;
    onEdit?: (id: number) => void;
}

export default ({ onDetail, onAdd, onEdit }: Props) => {
    const requestActions = simpleRequestActions();
    const [detailState, setDetailState] = useState<{
        visible?: { name: 'modal'; type: 'ADD' | 'Edit'; payload?: { vehicle: VendorDTO } };

    }>({});

    const [advanceSearch, setAdvanceSearch] = useState<{ visible: boolean }>();
    const [advanceSearchParams, setAdvanceSearchParams] = useState<DriverSearchParam>({
        status: 'ALL',
      });

    const actionRef = useRef<ActionType>();




    const cacheList = useModel('dataList');

    const onRequestHandler = async (params: TableViewSearchParams<DriverSearchParam>) => {
        try {
            return AddOnServiceAPI(requestActions).page(params).then((it) => {
                return cacheList.cacheDataList({
                    type: 'fleet-vendor',
                    criteria: params,
                    data: it,
                });
            }) as Promise<Paging<VendorDTO>>;
        } catch (error: any) {
            message.error(error.message);
            return Promise.reject();
        }
    };

    const getItems = (record:VendorDTO): MenuProps["items"] =>[
        {
            key:"1",
            label:"View",
            itemIcon:<ArrowRightOutlined/>,
            onClick:()=>setDetailState({visible:{name:"modal", type:"ADD", payload:{vehicle:record}}})
        },
        {
            key:"2",
            label:"Add Specialist",
            itemIcon:<RedditOutlined/>,
            onClick:()=>setDetailState({visible:{name:"modal", type:"ADD", payload:{vehicle:record}}})
        },
        {
            key:"3",
            label:"Rate",
            itemIcon:<StarOutlined/>,
            onClick:()=>setDetailState({visible:{name:"modal", type:"ADD", payload:{vehicle:record}}})
        },
    ]

    return (
        <>
            <Spin spinning={requestActions.request?.loading}>
         

                <TableView<VendorDTO, { searchValue?: string , advanceSearch: DriverSearchParam}>
                    hasCriteria={Object.values(Omit(advanceSearchParams, ['status'])).some((v) => v)}
                    cache
                    displayOnly
                    extraFilter={
                        <Space size="large">
                          
                        </Space>
                    }
                    columns={[
                       
                        {
                            key: "code",
                            title: "Code",
                            dataIndex: "code"
                        },
                        {
                            key: "name_en",
                            title: "Name",
                            dataIndex: "name"
                        },
                        // {
                        //     key: "latin_name",
                        //     title: "Latin Name",
                        //     dataIndex: "latinName"
                        // },
                        {
                            key: "group",
                            title: "Group",
                            dataIndex: "group"
                        },
                        
                        {
                            key: "type",
                            title: "Type",
                            dataIndex: "type"
                        },
                        {
                            key: "specialist",
                            title: "Specialist",
                            dataIndex: "specialist"
                        },
                       
                        {
                            title: "Action",
                            render: (_, r) => (<>
                                <Dropdown
                                        menu={{
                                                items:getItems(r),
                                                style:{
                                                   width: 200 
                                                }
                                            }}
                                >
                                    <a>
                                        <EllipsisOutlined/>
                                    </a>
                                </Dropdown>
                            </>)
                        },

                    ]}
                    tableProps={{
                        actionRef: actionRef,
                    }}
                    // advanceSearch
                    actionHandlers={{
                        onAdvanceSearchClicked: () => setAdvanceSearch({ visible: true }),
                        onRequest: (criteria, pagination, sort) =>
                            onRequestHandler({
                                criteria: {
                                    ...criteria,
                                    advanceSearch: advanceSearchParams,
                                    sort,
                                  },
                                  pagination,
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
                            }) as Promise<Paging<VendorDTO>>,
                    }}


                />
            </Spin>

            
            <DetailViewDrawer
                onClose={()=>setDetailState((v)=>({...v, visible:undefined}))}
                open={detailState?.visible?.name==="modal"}
                data={detailState.visible?.payload?.vehicle}
                
            />

            {/* <AdvanceFuelSearch
                title="Advance Search"
                closable
                open={advanceSearch?.visible}
                initData={advanceSearchParams}
                onClose={() => {
                  setAdvanceSearch({ visible: false });
                }}
                onReset={() => {
                  actionRef.current?.reloadAndRest?.();
                }}
                onSearch={(data) => {
                  setAdvanceSearchParams((v) => ({ ...v, ...data, status: v.status }));
                  actionRef.current?.reloadAndRest?.();
                }}
            /> */}


        </>
    )
}