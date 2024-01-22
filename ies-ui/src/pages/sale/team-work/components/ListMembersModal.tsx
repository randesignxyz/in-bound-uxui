import FormModalComp, { FormModalProps } from '@/components/FormModal';
import { SalesTeamWorkLess } from '@/services/sale/data';
import { Button, List, Skeleton } from 'antd';
import { useEffect, useState } from 'react';

interface Props extends FormModalProps {
  data?: SalesTeamWorkLess[];
  actionsHandler?: {
    onAdd: (items?: SalesTeamWorkLess[]) => void;
  };
}

const ListMembersModal: React.FC<Props> = ({ data, actionsHandler, ...rest }) => {
  const [memberShips, setMemberShips] = useState<SalesTeamWorkLess[]>([]);
  useEffect(() => {
    if (!rest.visible) return;
    setMemberShips([]);
  }, [rest.visible]);

  return (
    <FormModalComp
      {...rest}
      width="450px"
      footer={[
        <Button key="button" onClick={() => rest.onCancel && rest.onCancel()}>
          Cancel
        </Button>,
        <Button
          loading={rest.confirmLoading}
          disabled={rest.disabled}
          key="submit"
          type="primary"
          onClick={async () => {
            actionsHandler?.onAdd && actionsHandler.onAdd(memberShips);
          }}
        >
          Ok
        </Button>,
      ]}
    >
      <List<SalesTeamWorkLess>
        itemLayout="horizontal"
        dataSource={data}
        renderItem={(item) => (
          <List.Item
            actions={[
              <div style={{ float: 'right' }}>content</div>,
              <a
                key="list-loadmore-add"
                onClick={() => {
                  //   console.log(item);
                  setMemberShips([...memberShips, item]);
                }}
              >
                add
              </a>,
            ]}
          >
            <Skeleton avatar title={false} loading={false} active>
              <List.Item.Meta
                //avatar={<Avatar src={item.picture.large} />}
                title={`${item.salespersonCode} - ${item.salespersonName} - ${item.phoneNumber}`}
                //description=""
              />
              {/* <div style={{ float: 'right' }}>content</div> */}
            </Skeleton>
          </List.Item>
        )}
      />
    </FormModalComp>
  );
};

export default ListMembersModal;
