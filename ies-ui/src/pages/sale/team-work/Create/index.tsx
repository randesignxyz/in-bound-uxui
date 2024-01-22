import React from 'react';
import TeamWorkEntryForm from '../components/TeamWorkEntiryForm';

interface Props {
  actionHandlers?: {
    onBack?: () => void;
  };
}

const Create: React.FC<Props> = ({ actionHandlers }) => {
  return <TeamWorkEntryForm type="new" />;
};

export default Create;
