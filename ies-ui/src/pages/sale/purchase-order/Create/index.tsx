import React from 'react';
import MpuCreateForm from '../components/MpuCreateForm';

interface Props {
  actionHandlers?: {
    onBack?: () => void;
  };
}

const Create: React.FC<Props> = ({ actionHandlers }) => {
  return <MpuCreateForm type="new" isLoading={false} />;
};

export default Create;
