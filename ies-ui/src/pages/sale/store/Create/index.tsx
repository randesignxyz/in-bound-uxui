import React from 'react';
import StockStoreForm from '../components/StockStoreForm';

interface Props {
  actionHandlers?: {
    onBack?: () => void;
  };
}

const Create: React.FC<Props> = ({ actionHandlers }) => {
  return <StockStoreForm type="new" />;
};

export default Create;
