import React from 'react';
import StockStoreForm from '../components/StockStoreForm';

interface Props {
  id: number;
  actionHandlers?: {
    onBack?: () => void;
  };
}

const Edit: React.FC<Props> = ({ id }) => {
  return <StockStoreForm type="edit" id={id} />;
};

export default Edit;
