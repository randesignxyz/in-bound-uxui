import { LookupDataItem2 } from '@/services/data';
import { simpleRequestActions } from '@/services/model';
import { DeleteOutlined, EditOutlined, EyeOutlined, PlusCircleFilled, StarTwoTone } from '@ant-design/icons';
import { ProList } from '@ant-design/pro-components';
import { Button, message, Modal, Space, Typography } from 'antd';
import { useEffect, useState } from 'react';
import ContactModal from './modal/ContactModal';
import { ContactData, ProfileData, SaveContract } from './data';
import { ProfileServices } from './service';
import { useAccess } from '@umijs/max';

interface Props {
  profile: ProfileData;
  step: any;
  is_admin: number;
}

export default ({ profile, step, is_admin }: Props) => {
  const requestActions = simpleRequestActions();
  const [modalVisible, setModalVisible] = useState<
    { type: 'ADD'; payload: undefined } | { type: 'EDIT'; payload: ContactData }
  >();
  const [cardActionProps] = useState<'actions' | 'extra'>('extra');
  const [lookupDataList, setLookupDataList] = useState<LookupDataItem2[]>([]);
  const [contactList, setContactList] = useState<ContactData[]>([]);

  const access = useAccess();

  useEffect(() => {
    initData();
  }, []);

  const defaultEmail = {
    title: 'Email',
    subTitle: <StarTwoTone />,
    avatar: 'https://gw.alipayobjects.com/zos/antfincdn/UCSiy1j6jx/xingzhuang.svg',
    content: (
      <div
        style={{
          flex: 1,
        }}
      >
        <Typography.Text copyable>{profile.email}</Typography.Text>
      </div>
    ),
  };
  const data = [
    defaultEmail,
    ...contactList.map((item) => ({
      title: item.type.name,
      subTitle: item.isMain && <StarTwoTone />,
      actions: [
        // admin
        <a style={{ display: access.canAccessHrESSAddEditProfile == true && is_admin == 2 ? '' : 'none' }} key="edit" onClick={() => onEditHandler(item)} >
          <EditOutlined />
        </a>,
        <a style={{ display: access.canAccessHrESSAddEditProfile == true && is_admin == 2 ? '' : 'none' }} key="delete" onClick={() => deleteContractHandler(item)}>
          <DeleteOutlined />
        </a>,
        // employee
        <a key="edit" onClick={() => onEditHandler(item)} style={{ display: [7, 5, 4].find((element) => element == step) ? '' : 'none' }}>
          <EditOutlined />
        </a>,
        <a style={{ display: [7, 5, 4].find((element) => element == step) ? '' : 'none' }} key="delete" onClick={() => deleteContractHandler(item)}>
          <DeleteOutlined />
        </a>,
      ],
      avatar: 'https://gw.alipayobjects.com/zos/antfincdn/UCSiy1j6jx/xingzhuang.svg',
      content: (
        <div
          key={`${item.id}`}
          style={{
            flex: 1,
          }}
        >
          <Typography.Text copyable>{item.value}</Typography.Text>
        </div>
      ),
    })),
  ];

  const initData = async () => {
    try {
      setContactList(profile.contacts);
      if (lookupDataList.length > 0) return;
      const rs = await ProfileServices.listLookupData(['CONTACT_TYPE']).query(requestActions);
      setLookupDataList(rs);
    } catch (error: any) {
      message.error(error.message || 'Failed to load data.');
    }
  };

  const hideModal = (visble?: boolean) => !visble && setModalVisible(undefined);

  const onEditHandler = (contact: ContactData) => {
    setModalVisible({ type: 'EDIT', payload: contact });
  };

  const deleteContractHandler = async (contact: ContactData) => {
    Modal.confirm({
      title: 'Delete contact',
      content: 'Are you sure?',
      onOk: async () => {
        try {
          data.type = 'EDIT';
          await ProfileServices.deleteContact(contact.id)(requestActions);
          setContactList((v) => v.filter((it) => it.id !== contact.id));
        } catch (error: any) {
          message.error(error.message || 'Failed to delete.');
        }
      },
    });
  };

  const saveContactHandler = async (data: SaveContract) => {
    Modal.confirm({
      title: 'Save contact',
      content: 'Are you sure?',
      onOk: async () => {
        try {
          data.type = modalVisible?.type || '';
          await ProfileServices.saveContact(data, is_admin)(requestActions);


          const list = await ProfileServices.listContact(data.empId).query(requestActions);
          setContactList(list);
          // if (modalVisible?.type == 'EDIT') 
          hideModal();
        } catch (error: any) {
          message.error(error.message || 'Failed to save.');
        }
      },
    });
  };

  return (
    <div>
      <ProList<any>
        toolBarRender={() => {
          return [
            <Button style={{ display: ([7, 5, 2].find((element) => element == step)) && is_admin == 0 ? '' : 'none' }}
              onClick={() => setModalVisible({ type: 'ADD', payload: undefined })}
              icon={<PlusCircleFilled />}
              key=" 3 "
              type="primary"
            >
              Add
            </Button>,
            access.canAccessHrESSAddEditProfile == true ? <Button style={{ display: is_admin == 2 ? '' : 'none' }}
              onClick={() => setModalVisible({ type: 'ADD', payload: undefined })}
              icon={<PlusCircleFilled />}
              key=" 3 "
              type="primary"
            >
              Add
            </Button> : '',
          ];
        }}
        showActions="hover"
        rowSelection={false}
        grid={{ gutter: 16, column: 4 }}
        onItem={(record: any) => {
          return {
            onMouseEnter: () => {
              // console.log(record);
            },
            onClick: () => {
              // console.log(record);
            },
          };
        }}
        metas={{
          title: {},
          subTitle: {},
          type: {},
          avatar: {},
          content: {},
          actions: {
            cardActionProps,
          },
        }}
        dataSource={data}
      />

      <ContactModal
        open={!!modalVisible?.type}
        lookupList={lookupDataList}
        onOpenChange={(visible) => hideModal(visible)}
        data={modalVisible?.payload}
        onFinishFailed={(error) => {
          message.error(
            <Space direction="vertical" align="start">
              {error.errorFields.map((it) => (
                <div>{it.errors.join(', ')}</div>
              ))}
            </Space>,
          );
        }}
        onFinish={(data) => {
          return saveContactHandler({ ...data, id: modalVisible?.payload?.id, empId: profile.id });
        }}
      />
    </div>
  );
};
