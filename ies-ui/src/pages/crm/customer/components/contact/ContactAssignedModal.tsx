import FormModalComp, { FormModalProps } from "@/components/FormModal"
import { Paging } from "@/services/API"
import { ContactListItem } from "@/services/crm/contact"
import { MailOutlined, PhoneOutlined, PlusOutlined, UserAddOutlined, UserOutlined } from "@ant-design/icons"
import { Button, Card, Input, List, Space, Typography } from "antd"

interface Props extends FormModalProps {
    loading?: boolean;
    data?: Paging<ContactListItem>;
    added?: number[];
    onSearch?: (value?: string) => void;
    onAddNew?:() => void;
    onAssign?: (data: ContactListItem) => void;
}

const ContactAssignedModal: React.FC<Props> = ({ data, loading, added, onSearch, onAddNew, onAssign, ...rest }) => {
    return (
        <FormModalComp title="Search Contact" {...rest} footer={<span />}>
            <Card size='small' extra={(
                <Space>
                    <Input.Search onSearch={onSearch} />
                    <Button onClick = {onAddNew} icon={<UserAddOutlined />} />
                </Space>
            )}>
                <List<ContactListItem>


                    loading={loading}
                    dataSource={data?.items || []}
                    renderItem={item => (
                        <List.Item actions={ added?.some(id => id == item.id)?[]:[<Button onClick = {() => onAssign?.(item)} type='link' icon={<PlusOutlined />} />]}>
                            <List.Item.Meta
                                avatar={<UserOutlined />}
                                title={
                                    <Space>
                                        <Typography.Text strong >{[item.internalName, item.name].filter(it => it).join("/ ")}</Typography.Text>
                                        <Typography.Text style={{ fontSize: 12 }} type="secondary">{item.jobTitle}</Typography.Text>
                                    </Space>

                                }
                                description={(
                                    <div>
                                        <div>
                                            <Space>
                                                {[item.phone1, item.phone2, item.phone3].filter(it => it).map((it, index) => (
                                                    <Space key={`pnone_${index}`} align='baseline'><PhoneOutlined /><Typography.Text copyable>{it}</Typography.Text></Space>
                                                ))}
                                                {item.email && <Space align='baseline'><MailOutlined /><Typography.Text copyable>{item.email}</Typography.Text></Space>}
                                            </Space>

                                        </div>

                                    </div>
                                )}
                            />
                        </List.Item>
                    )}
                />
            </Card>

        </FormModalComp>
    )
}

export default ContactAssignedModal