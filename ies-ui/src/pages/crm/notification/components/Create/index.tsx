import NotificationEntryForm from '../NotificationEntryForm';

interface Props {
  actionHandlers?: {
    onBack?: () => void;
  };
}

const CreateNotification: React.FC<Props> = ({}) => {
  return <NotificationEntryForm type="new" />;
};

export default CreateNotification;
