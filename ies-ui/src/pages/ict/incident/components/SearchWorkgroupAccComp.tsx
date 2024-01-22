import React, { useEffect, useState } from 'react';
import { Row, Col, Input, Avatar, message } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { SearchAccount } from '@/services/account/data';
import ProList from '@ant-design/pro-list';
import { simpleRequestActions } from '@/services/model';
import { WorkgorupMatrix } from '@/services/ict/data';
import { AccountServiceAPI } from '@/services/account/services';

const SearchWorkgroupAccComp: React.FC<{
    workgroupMatrixList: WorkgorupMatrix[];
    selected?: SearchAccount[];
    onAdded: (item: SearchAccount) => void;
}> = ({workgroupMatrixList, selected, onAdded }) => {

    const requestActions = simpleRequestActions();
    const accountServices = AccountServiceAPI(requestActions)

    const [itemList, setItemList] = useState<SearchAccount[]>([])
    const [addedItems, setAddedItems] = useState<SearchAccount[]>([...(selected || [])]);
    const [searchValue, setSearchValue] = useState<string>()

    useEffect(() => {
        onSearchHandler(searchValue)
    }, [searchValue])

    const onSearchHandler = async (searchValue?: string) => {
        try {
            const rs = await accountServices.findUsers({list: workgroupMatrixList.map(wgm => wgm.username)});  
            
            setItemList(searchValue ? rs.filter(f => f.name.match(searchValue)) : rs);
            
        } catch (error: any) {
            message.error(error.message || 'Failed to load data.')
        }
         
    };

    const addItemHandler = (item: SearchAccount) => {
        setAddedItems([...addedItems, item]);
        onAdded(item);
    };

    return (
        <div>
            <Row>
                <Col flex="auto">
                    <Input.Group>
                        <Row>
                           
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
                        metas = {{
                            avatar: {
                                render: (_,r ) => {
                                    const added = addedItems.some(it => it.id === r.id)
                                    return <Avatar style={{ backgroundColor: added ? 'grey' : 'blue' }} icon={<UserOutlined />} />
                                }
                            },
                            title: { dataIndex: 'name'},
                            
                            description: { dataIndex: 'description' },
                            actions: {
                                render: (_,r )=> {
                                    const added = addedItems.some(it => it.id === r.id)
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

export default SearchWorkgroupAccComp;
