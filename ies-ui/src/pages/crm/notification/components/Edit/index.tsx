import NotificationEntryForm from '../NotificationEntryForm';

interface Props {
  id: number;
  actionHandlers?: {
    onBack?: () => void;
  };
}

const EditNotification: React.FC<Props> = ({ id }) => {
  return <NotificationEntryForm type="edit" id={id} />;
};

export default EditNotification;
