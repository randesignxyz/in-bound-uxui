import SoInvoiceForm from '../components/SoInvoiceForm';

interface Props {
  id: number;
}

const EditSoInvoice: React.FC<Props> = ({ id }) => {
  return <SoInvoiceForm type="edit" id={id} />;
};

export default EditSoInvoice;
