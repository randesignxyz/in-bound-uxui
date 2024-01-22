import SoInvoiceForm from '../components/SoInvoiceForm';

interface Props {
  actionHandlers?: {
    onBack?: () => void;
  };
}

const CreateSoInvoice: React.FC<Props> = () => {
  return <SoInvoiceForm type="new" />;
};

export default CreateSoInvoice;
