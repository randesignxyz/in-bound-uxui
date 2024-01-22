import { MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { Card, Col, Divider, Modal, Row, Space, Typography } from 'antd';
import { useEffect, useState } from 'react';
import defaultIcon from '@/assets/contact.png';
import styles from './Center.less';
import { ContactData, ContactDetail } from '@/services/crm/contact';
import ContactEntryModal from '../ContactEntryModal';
import ProForm, { ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import UserComment from '@/pages/user-comment';
import ContactActivity from '../ContactActivity';
import { useForm } from 'antd/lib/form/Form';
import { LookupData } from '@/services/data';
import { GridContent } from '@ant-design/pro-components';

interface Props {
  data: {
    loading?: boolean;
    detail?: ContactDetail;
    lookupDataList?: LookupData[];
  };
  actionHandlers: {
    onFetch: () => Promise<ContactData>;
    onLoadData: () => void;
    onSave: (data: ContactData) => Promise<void>;
    onInit?:() => void;
  };
}

type tabKeyType = 'comment' | 'activity';

const ContactDetailView: React.FC<Props> = ({ actionHandlers, data }) => {
  const { detail, loading } = data;
  const [tabKey, setTabKey] = useState<tabKeyType>('comment');
  const [editVisible, setEditVisible] = useState<{ visible?: boolean; data?: ContactData }>({
    visible: false,
  });

  const [form] =
    useForm<{ gender: string; firstName: string; lastName: string; remarks: string }>();

  const onSaveActionHandler = (data: ContactData) => {
    Modal.confirm({
      title: 'Save contact',
      content: 'Are you sure:',
      onOk: async () => {
        await actionHandlers?.onSave?.(data);
        actionHandlers.onLoadData();
        setEditVisible({ visible: false });
      },
    });
  };

  useEffect(() => {
    actionHandlers?.onLoadData?.();
  }, []);

  useEffect(() => {
    if (!detail) return;
    form.setFieldsValue({
      gender: detail.gender,
      firstName: detail.firstName,
      lastName: detail.lastName,
      remarks: detail.remarks,
    });
  }, [detail]);
  return (
    <div>
      <GridContent>
        <Row gutter={24}>
          <Col lg={7} md={24}>
            <ProForm form={form} submitter={false} layout = 'horizontal'>
              <Card bordered={false} style={{ marginBottom: 24 }} loading={loading}>
                <div>
                  <div className={styles.avatarHolder}>
                    <img alt="" src={defaultIcon} />
                    <div className={styles.name}>
                      <Typography.Link
                        onClick={async () => {
                          const data = await actionHandlers.onFetch?.();
                          setEditVisible({ visible: true, data: data });
                        }}>
                          
                        {detail?.internalName}
                      </Typography.Link>
                    </div>
                    {detail?.name && <div className={styles.name}>{detail?.name}</div>}
                    <div>{detail?.jobTitle}</div>
                  </div>

                  <Divider dashed />
                  <div className={styles.detail}>
                    <Space direction="vertical">
                      <Space align="baseline">
                        <PhoneOutlined
                          style={{
                            marginRight: 8,
                          }}
                        />
                        <Typography.Text copyable> {detail?.phone1}</Typography.Text>
                      </Space>

                      {detail?.phone2 && (
                        <Space align="baseline">
                          <PhoneOutlined
                            style={{
                              marginRight: 8,
                            }}
                          />
                          <Typography.Text copyable> {detail?.phone2}</Typography.Text>
                        </Space>
                      )}
                      {detail?.phone3 && (
                        <Space align="baseline">
                          <PhoneOutlined
                            style={{
                              marginRight: 8,
                            }}
                          />
                          <Typography.Text copyable> {detail?.phone3}</Typography.Text>
                        </Space>
                      )}
                      {detail?.email && (
                        <Space align="baseline">
                          <MailOutlined
                            style={{
                              marginRight: 8,
                            }}
                          />
                          <Typography.Text copyable> {detail?.email}</Typography.Text>
                        </Space>
                      )}
                    </Space>
                  </div>
                  <Divider style={{ marginTop: 16 }} dashed />
                  <div className={styles.team}>
                    <ProFormText label="Gender" name="gender" readonly />
                    <ProFormText label="First Name" name="firstName" readonly />
                    <ProFormText label="Last Name" name="lastName" readonly />
                    <ProFormTextArea label="Remarks" name="remarks" readonly />
                  </div>
                </div>
              </Card>
            </ProForm>
          </Col>
          <Col lg={17} md={24}>
            <Card
              className={styles.tabsCard}
              bordered={false}
              tabList={[
                { key: 'comment', tab: 'Comments' },
                { key: 'activity', tab: 'Activities' },
              ]}
              activeTabKey={tabKey}
              onTabChange={(_tabKey: string) => {
                setTabKey(_tabKey as tabKeyType);
              }}
            >
              {tabKey == 'comment' && data.detail?.id && (
                <UserComment objectType="CONTACT" objectId={data.detail.id} />
              )}
              {tabKey == 'activity' && <ContactActivity />}
            </Card>
          </Col>
        </Row>
      </GridContent>

      <ContactEntryModal
        open={editVisible.visible}
        title="Edit Contact"
        onCancel={() => setEditVisible({ visible: false })}
        data={editVisible.data}
        lookupDataList = {data.lookupDataList}
        actionHandlers={{
          onSave: onSaveActionHandler,
          onLoadInitData: actionHandlers.onInit
        }}
      />
    </div>
  );
};

export default ContactDetailView;
