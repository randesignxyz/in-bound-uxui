import ListView from "@/components/ListView";
import { formatDateTime } from "@/pages/utils";
import { Paging } from "@/services/API";
import { ContactData, ContactListItem } from "@/services/crm/contact";
import { LookupData } from "@/services/data";
import { MailOutlined, PhoneOutlined, UserOutlined } from "@ant-design/icons";
import { useSetState } from "ahooks";
import { message, Modal, Space, Spin, Typography } from "antd"
import { useEffect } from "react";
import ContactEntryModal from "../ContactEntryModal";
import { useAccess } from "@umijs/max";

export interface ListProps {
    loading?: boolean;
    searchable?: boolean;
    data: {
        itemList?: Paging<ContactListItem>;
        lookupDataList?: LookupData[];
    }
    actionHandlers?: {
        onSearch?: (searchValue?: string) => Promise<void>;
        onSave?: (data: ContactData) => Promise<void>;
        onDetail?: (data: ContactListItem) => void;
        onInit?:() => void;
    }
}

const ContactListView: React.FC<ListProps> = ({ loading, searchable, actionHandlers, data }) => {
    const access = useAccess();
    const [addModal, setAddModal] = useSetState<{ visible?: boolean }>({})

    useEffect(() => {
        actionHandlers?.onSearch?.()
    }, [])

    const onSaveActionHandler = (data: ContactData) => {
        Modal.confirm({
            title: "Save contact",
            content: "Are you sure:",
            onOk: async () => {
                await actionHandlers?.onSave?.(data)
            }
        })
    }
    return (
        <Spin spinning={loading}>
            <ListView<ContactListItem, string>
                
                rowKey='id'
                dataSource={data.itemList?.items}
                searchable={searchable}
                avatar={() => <UserOutlined />}
                
                actionHandlers={{
                    onSearch: async v => await actionHandlers?.onSearch?.(v),
                    
                    onAdd: () => access.can("CRM_CONTACT","CREATE")?setAddModal({visible: true}):message.warning("Unauthorize")

                }}
                title={r => (
                    <Space>
                        <Typography.Link onClick={() => access.can("CRM_CONTACT","DETAIL")? actionHandlers?.onDetail?.(r):message.warning("Unauthorize")} strong >{[r.internalName, r.name].filter(it => it).join("/ ")}</Typography.Link>
                        <Typography.Text style={{ fontSize: 12 }} type="secondary">{r.jobTitle}</Typography.Text>
                    </Space>
                )}
                description={r => (
                    <div>
                        <div>
                            <Space>
                                {[r.phone1, r.phone2, r.phone3].filter(it => it).map((it, index) => (
                                    <Space key={`pnone_${index}`} align='baseline'><PhoneOutlined /><Typography.Text copyable>{it}</Typography.Text></Space>
                                ))}
                                {r.email && <Space align='baseline'><MailOutlined /><Typography.Text copyable>{r.email}</Typography.Text></Space>}
                            </Space>
                        </div>
                    </div>
                )}
                contentList={[
                    { title: 'Created By', render: r => r.createdBy },
                    { title: 'Created Date', render: r => formatDateTime(r.createdDate) },
                ]}
            />

            <ContactEntryModal
                title="Add New Contact"
                open={addModal.visible}
                width={'500px'}
                onCancel={() => setAddModal({ visible: false })}
                lookupDataList = {data.lookupDataList}
                actionHandlers={{
                    onSave: onSaveActionHandler,
                    onLoadInitData: actionHandlers?.onInit
                }}
            />
        </Spin>
    )
}

export default ContactListView