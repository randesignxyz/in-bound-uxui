import { ModalForm } from '@ant-design/pro-components';

interface Props {
  onCancel: () => void;
  actionControll: {
    visible: boolean;
    actionType: 'pending' | 'reject' | 'accept' | 'assign' | string;
  };
}

const ActionComponent: React.FC<Props> = ({ actionControll, onCancel, ...props }) => {
  console.log(actionControll.actionType);

  const formAction =
    (actionControll.actionType === 'pending' && <>Pendding</>) ||
    (actionControll.actionType === 'reject' && <>Reject</>) ||
    (actionControll.actionType === 'accept' && <>Accept</>) ||
    (actionControll.actionType === 'assign' && <>Assign</>);

  return (
    <>
      <ModalForm
        title="Action order"
        open={actionControll.visible}
        {...props}
        onOpenChange={() => false}
        modalProps={{
          destroyOnClose: true,
          closable: true,
          onCancel: () => onCancel(),
        }}
      >
        {formAction}
      </ModalForm>
    </>
  );
};

export default ActionComponent;
