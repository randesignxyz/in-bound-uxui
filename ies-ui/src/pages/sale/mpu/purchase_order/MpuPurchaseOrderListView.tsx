import { simpleRequestActions } from '@/services/model';
import { Typography } from 'antd';

export default ({}) => {
  const requestActions = simpleRequestActions();
  const { Text } = Typography;
  return (
    <>
      <Text>Hello worl</Text>
    </>
  );
};
