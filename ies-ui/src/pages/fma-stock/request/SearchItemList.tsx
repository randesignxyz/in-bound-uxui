import { ActionType, DrawerForm, ModalFormProps, ProFormCheckbox, ProFormRadio, ProList } from "@ant-design/pro-components";
import { StockRequestAdvanceSearchParams, ItemDetail, ItemGroupListItem, ItemListItem, SearchParams } from "./data.types";
import { simpleRequestActions } from '@/services/model';
import { Badge, Button, Col, Descriptions, Divider, Input, message, Row, Spin, Tag } from 'antd';
import CheckableTag from 'antd/es/tag/CheckableTag';import { useEffect, useRef, useState } from "react";
import { FetchPagingParams, TableViewSearchParams } from "@/components/DataCrud/TableView";
import { createService } from "./services";
import { PlusCircleOutlined } from "@ant-design/icons";


interface Props extends ModalFormProps {
    addedItems?: number[];
    onAddItem?: (data: ItemDetail) => void;
    selectedGroupId: number
}

export default ({ addedItems, onAddItem, selectedGroupId, ...rest }: Props) => {
    const actionRef = useRef<ActionType>();
    const [searchValue, setSearchValue] = useState<string>('');
    const [itemGroups, setItemGroups] = useState<ItemGroupListItem[]>([]);
    const requestActions = simpleRequestActions();
    const [searchParams, setSearchParams] = useState<StockRequestAdvanceSearchParams>({status:'ALL', groupIds:[]});
    const services = createService(requestActions);
    
    useEffect(() => {
      if (rest.open) initData();
    }, [rest.open]);
    const initData = async () => {
      const data = await services.listAllItemGroup();
      setItemGroups(data);
    };

    const onRequestHandler = async (params: FetchPagingParams<SearchParams>,) => {
        try {
          const data = await services.fetchItemPaging({
            ...params,
            criteria: {
              ...params.criteria,
              advanceSearch: searchParams,
            },
          });
          return {
            success: !!data,
            total: data?.total,
            data: data?.items,
          };
        } catch (error: any) {
          message.error(error.message);
          return Promise.reject();
        }
      };
      
    return  <DrawerForm
      onValuesChange={(changedValue) => {
        if ('itemType' in changedValue) {
          const { itemType } = changedValue;
          setSearchParams((v) => ({ ...v, itemType: itemType }));
          actionRef.current?.reloadAndRest?.();
        }
      }}
        {...rest}   
        title="Select item"
        resize={{
            maxWidth: window.innerWidth * 0.99,
            minWidth: 1000,
        }}
        submitter={false}
    >
        <Spin spinning={requestActions.request?.loading||false}>
            <ProFormCheckbox.Group name={'itemGroup'} disabled={true}>
                {itemGroups.map((it) => (
                    (selectedGroupId==-1 || it.id==selectedGroupId)?
                    <CheckableTag                     
                        key={it.id}
                        onChange={(checked) => {
                            if (checked)
                                setSearchParams((v) => ({ ...v, groupIds: [...(v.groupIds || []), it.id] }));
                            else
                                setSearchParams((v) => ({
                                ...v,
                                groupIds: v.groupIds?.filter((it1) => it1 !== it.id),
                                }));
                              actionRef.current?.reloadAndRest?.();
                        } } 
                        checked={searchParams.groupIds?.some((it1) => it1 == it.id) || false}
                    >
                    {it.itemGroupName}
                    </CheckableTag>:<Tag>{it.itemGroupName}</Tag>
                ))}
            </ProFormCheckbox.Group>
            <Row>
                {/* <Col>
                    <ProFormRadio.Group
                    radioType="button"
                    fieldProps={{
                        buttonStyle: 'solid',
                    }}
                    initialValue={'ALL'}
                    name={'itemType'}
                    options={[
                        { label: 'All', value: 'ALL' },
                        { label: 'Product', value: 'PRODUCT' },
                        { label: 'Service', value: 'SERVICE' },
                    ]}
                    />
                </Col> */}
                <Col flex={'Auto'}>
                    <Input.Search
                    allowClear
                    onSearch={(v) => {
                        setSearchValue(v);
                        actionRef.current?.reloadAndRest?.();
                    }}
                    />
                </Col>
            </Row>
            <Divider/>
            <ProList<ItemListItem>
                // showActions="hover"
                actionRef={actionRef}
                key="id"
                pagination={{
                    defaultPageSize: 20,
                    showSizeChanger: true,
                }}
                metas={{
                    title: { dataIndex: 'itemName' },
                    subTitle: { dataIndex: 'itemCode' },
                    description: {
                        render: (_, r) => (
                            <Descriptions size="small">
                              <Descriptions.Item label="Group"> {r.itemGroup.itemGroupName} </Descriptions.Item>                             
                              <Descriptions.Item label="UoM"> {r.defaultUoM}</Descriptions.Item>
                              <Descriptions.Item label=""> {''}</Descriptions.Item>
                              <Descriptions.Item label=""> {''}</Descriptions.Item>
                            </Descriptions>
                          ),
                    },
                    actions: {
                        render: (_, row, index) => [
                          <Badge
                            key={`${row.id}-${index}`}
                            style={{ top: -10 }}
                            count={addedItems?.filter((it) => it == row.id).length}
                          >
                            <Button onClick={async () => {
                              await services.detail(row.id).then(rs=>{
                                  onAddItem?.(rs);
                                })                              
                              }}
                              type='link' icon={<PlusCircleOutlined />}  disabled={selectedGroupId!=-1 && (row.itemGroup.id!=selectedGroupId)}/>
                             
          
                          </Badge>,
                        ],
                      },
                }}
                request={(sort,pagination) =>
                    onRequestHandler({
                      criteria: {
                        searchValue,
                        // advanceSearch: searchParams,
                      },
                      sort,
                      pagination,
                    })
                  }
          />
        </Spin>
    </DrawerForm>
}