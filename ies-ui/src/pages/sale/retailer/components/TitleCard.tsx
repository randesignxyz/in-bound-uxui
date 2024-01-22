import { Space, Tag, Typography } from 'antd';

interface Props {
  title: string;
  tagLable: string;
  color: string;
}

export default ({ title, tagLable, color }: Props) => {
  const { Text } = Typography;
  return (
    <Space>
      <Text>{title}</Text>
      <Tag color={color}>{tagLable}</Tag>
    </Space>
  );
};
