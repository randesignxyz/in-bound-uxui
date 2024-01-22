import { ContactListItem } from '@/services/crm/contact';
import { DeleteOutlined, MailOutlined, PhoneOutlined, UserOutlined } from '@ant-design/icons';
import { ProList } from '@ant-design/pro-components';
import { Button, List, Space, Typography } from 'antd';

interface Props {
  data?: ContactListItem[];
  onDetail?: (data: ContactListItem) => void;
  onRemove?: (data: ContactListItem) => void;
}
const ContactListComp: React.FC<Props> = ({ data, onDetail, onRemove }) => {
  return (
    <ProList<ContactListItem>
      size="small"
      itemLayout="horizontal"
      rowKey="id"
      dataSource={data || []}
      metas={{
        avatar: {
          render: () => <UserOutlined />
        },
        title: {
          render: (_, item) => <Space>
            <Typography.Link
              onClick={() => {
                onDetail?.(item);
              }}
              strong
            >
              {[item.internalName, item.name].filter((it) => it).join('/ ')}
            </Typography.Link>
            <Typography.Text style={{ fontSize: 12 }} type="secondary">
              {item.jobTitle}
            </Typography.Text>
          </Space>
        },
        description: {
          render: (_, item) =>
            <div>
              <Space>
                {[item.phone1, item.phone2, item.phone3]
                  .filter((it) => it)
                  .map((it, index) => (
                    <Space key={`pnone_${index}`} align="baseline">
                      <PhoneOutlined />
                      <Typography.Text copyable>{it}</Typography.Text>
                    </Space>
                  ))}
                {item.email && (
                  <Space align="baseline">
                    <MailOutlined />
                    <Typography.Text copyable>{item.email}</Typography.Text>
                  </Space>
                )}
              </Space>
            </div>
        },
        actions: {
          render: (_, item) => [
            !item.defaultContact && (
              <Button danger type="link" onClick={() => onRemove?.(item)} icon={<DeleteOutlined />} />
            ),
          ]
        }
      }}
    />
  );
};

export default ContactListComp;
