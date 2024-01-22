
import { ActionType, ModalForm, ModalFormProps, ProCard, ProList } from "@ant-design/pro-components"
import { Button, Input, message, Modal, ModalProps, Space } from "antd"
import { SearchAccount } from '@/services/account/data';
import { useEffect, useRef, useState } from "react";
import { CheckOutlined, TeamOutlined, UserOutlined } from "@ant-design/icons";
import { simpleRequestActions } from "@/services/model";
import { fetchDataPagingService } from '@/services/apiGateway';
import { Contributor } from "@/services/shared/data";
import { AccountServiceAPIs } from "@/services/account/services";

const convertType =  (type: 'user' | 'group'| 'USER' | 'GROUP_USER' | 'DEPT' | 'SUB_DEPT'): 'USER' | 'GROUP_USER' | 'DEPT' | 'SUB_DEPT' => {
    if(type == 'user') return 'USER'
    if(type == 'group') return 'GROUP_USER'
    return type as any
}

export default ({ selectedList, approverOnly, type, onSelectItem, ...rest }: ModalFormProps & {
    selectedList: (number | string)[];
    approverOnly?: true;
    multi?: true;
    type: 'USER' | 'GROUP_USER' | 'DEPT' | 'SUB_DEPT';
    onSelectItem?: (selectedItem: Contributor, cb?: (closed?: true) => void) => void;
    onSelectItems?: (selectedList: Contributor[]) => void;
}) => {
    const actionRef = useRef<ActionType>();
    const requestActions = simpleRequestActions();
    const [searchValue, setSearchValue] = useState<string>()

    const onRequestHandler = async () => {

        try {
            const rs =  await AccountServiceAPIs.fetchListContributors(searchValue).query(requestActions)
            return {
                data: rs,
                success: true,
                total: rs.length,
            }    
        } catch (error: any) {
            message.error(error.message || 'Failed to fetch data.')
            return {
                success: false,
            }
        }
        
    }

    useEffect(()=> {
        actionRef.current?.reloadAndRest?.()
    }, [searchValue])

    return <ModalForm {...rest} submitter = {false}>
        <ProCard>
            <Space style={{width: '100%'}} direction="vertical">
                <Input.Search onSearch={(value) => { setSearchValue(value) }} />
                <ProList<SearchAccount>
                
                    metas={{
                        avatar: {
                            
                            render: (_, r) => {
                                if (r.type == 'user') {
                                    return <UserOutlined />
                                }

                                if (r.type == 'group') {
                                    return <TeamOutlined />
                                }
                            }
                        },

                        title: {
                            render: (_, r) => r.name,
                        },

                        subTitle: {
                            render: (_, r) => r.code || ''
                        },

                        actions: {
                            render: (_, r) => <Button 
                                disabled = {selectedList.some(it =>  it == r.id)}
                                onClick = {() => onSelectItem?.({...r, type: convertType(r.type) }, (closed) => {
                                    closed && rest.onOpenChange?.(false)
                                })} 
                                type="link" icon={<CheckOutlined />} 
                            />
                        }
                    }}

                    request={onRequestHandler}
                    actionRef = {actionRef}
                    showActions='hover'
                />
            </Space>
        </ProCard>

    </ModalForm>
}