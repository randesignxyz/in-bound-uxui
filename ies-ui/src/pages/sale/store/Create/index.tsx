import React from 'react';
import StockStoreForm from '../components/StockStoreForm';
import { SaveStockStore } from '@/services/sale/data';

interface Props {
  actionHandlers?: {
    onBack?: () => void;
  };
}

const Create: React.FC<Props> = ({ actionHandlers }) => {
  return <StockStoreForm type="new" onView={function (added?: SaveStockStore): void {
    throw new Error('Function not implemented.');
  } } onBack={function (): void {
    throw new Error('Function not implemented.');
  } } />;
};

export default Create;
