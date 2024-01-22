import React from 'react';
import TeamWorkEntiryForm from '../components/TeamWorkEntiryForm';
interface Props {
  id: number;
  actionHandlers?: {
    onBack?: () => void;
  };
}

const Edit: React.FC<Props> = ({ id }) => {
  return <TeamWorkEntiryForm type="edit" id={id} />;
};

export default Edit;
