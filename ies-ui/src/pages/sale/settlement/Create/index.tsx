import SettlementEntiryForm from '../components/SettlementEntiryForm';

type Props = {
  // id: number;
  // actionHandlers?: {
  //   onBack?: () => void;
  // };
};

const SettlementCreate: React.FC<Props> = ({}) => {
  return <SettlementEntiryForm type="new" />;
};

export default SettlementCreate;
