import React from 'react';
import StockStoreForm from '../components/StockStoreForm';
import { SaveStockStore } from '@/services/sale/data';

interface Props {
  id: number;
  actionHandlers?: {
    onBack?: () => void;
  };
}

const Edit: React.FC<Props> = ({ id }) => {
  return <StockStoreForm type="edit" id={id} onView={function (added?: SaveStockStore): void {
    throw new Error('Function not implemented.');
  } } onBack={function (): void {
    throw new Error('Function not implemented.');
  } } />;
};

export default Edit;
