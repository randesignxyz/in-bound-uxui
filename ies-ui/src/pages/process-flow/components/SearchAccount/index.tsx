import React, { useEffect, useState } from 'react';
import { Row, Col, Input, Select, Avatar, message } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { AccountType, SearchAccount } from '@/services/account/data';
import ProList from '@ant-design/pro-list';
import { AccountServiceAPI } from '@/services/account/services';
import { simpleRequestActions } from '@/services/model';

const SearchAccountComp: React.FC<{
    type: AccountType;
    approverOnly: boolean;
    selected?: SearchAccount[];
    onAdded: (item: SearchAccount) => void;
    onValues?: (item: SearchAccount[]) => void;
}> = ({ type, approverOnly, selected, onAdded, onValues }) => {

    const requestActions = simpleRequestActions();
    const accountServices = AccountServiceAPI(requestActions)

    //TODO: fixing
    // const userLookup = useLookupData( { name: 'WORK_FLOW', action:  approverOnly ? 'userApprovalLookups' : 'user' } as UserServiceType )
    // const groupLookup = useLookupData( {name:'WORK_FLOW', action:  (approverOnly ? 'groupApprovalLookups' : 'group') } as UserServiceType)

    const [itemList, setItemList] = useState<SearchAccount[]>([])
    const [addedItems, setAddedItems] = useState<SearchAccount[]>([...(selected || [])]);
    const [accType, setAccType] = useState<AccountType>(type === 'all' ? 'user' : type);
    const [searchValue, setSearchValue] = useState<string>()

    useEffect(() => {
        onSearchHandler(accType, searchValue)
    }, [searchValue, accType])

    const onSearchHandler = async (type: AccountType, searchValue?: string) => {
        try {
            //await actions.loadUserOrGroup(type, searchValue, approverOnly)   
            const rs = await accountServices.findUserOrGroupList({
                type: type,
                searchValue: searchValue,
                approveOnly: approverOnly
            })
            setItemList(rs)
        } catch (error: any) {
            message.error(error.message || 'Failed to load data.')
        }
         
    };

    const addItemHandler = (item: SearchAccount) => {
        const itmes = [...addedItems, item]
        setAddedItems(itmes);
        onValues?.(itmes);
        onAdded(item);
    };

    return (
        <div>
            <Row>
                <Col flex="auto">
                    <Input.Group>
                        <Row>
                           {accType == 'all' && <Col>
                                <Select
                                    onSelect={(value:AccountType) => {
                                        setAccType(value)
                                    }}
                                    disabled={type !== 'all'}
                                    defaultValue={accType}
                                    style={{ width: '100px' }}
                                    options = {[
                                        {label: 'User', value: 'user'},
                                        {label: 'Group', value: 'group'}
                                    ]}
                                    />
                            </Col>}
                            <Col flex="auto">
                                <Input.Search onSearch={setSearchValue} />
                            </Col>
                        </Row>
                    </Input.Group>
                </Col>
            </Row>
            <Row>
                <Col flex="auto">

                    <ProList<SearchAccount>
                        
                        loading = {requestActions.request?.loading}
                        showActions = 'hover'
                        
                        dataSource={itemList}
                        
                        rowKey = {r => r.type}
                        metas = {{
                            avatar: {
                                render: (_,r ) => {
                                    const added = addedItems.some(it => it.id === r.id && it.type === r.type)
                                return <Avatar style={{ backgroundColor: added ? 'grey' : 'blue' }} icon={<UserOutlined />} />
                                }
                            },
                            title: { dataIndex: 'name'},
                            //subTitle: { render: (_,r) => <Tag >{r.type}</Tag>},
                            description: { dataIndex: 'description' },
                            actions: {
                                render: (_,r )=> {
                                    const added = addedItems.some(it => it.id === r.id && it.type === r.type)
                                    return !added && <a  onClick={() => addItemHandler(r)}>Select</a>
                                }
                            }
                        }}
                    />
                </Col>
            </Row>
        </div>
    );
};

export default SearchAccountComp;
