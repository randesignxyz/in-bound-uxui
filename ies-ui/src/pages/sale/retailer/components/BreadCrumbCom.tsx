import { Link } from '@umijs/max';
import { Breadcrumb, Tag, Typography } from 'antd';

type RouteParam = {
  label: string;
  path: string;
};

interface Props {
  separator: '/' | '>';
  routes: RouteParam[];
}

export default ({ separator, routes }: Props) => {
  const { Text } = Typography;
  return (
    <Breadcrumb
      separator={separator}
      items={routes.map((it, index) => {
        if (index === routes.length - 1) {
          return {
            title:
              ['new', 'edit', 'detail'].indexOf(it.label.toLowerCase()) !== -1 ? (
                <Tag
                  color={
                    it.label.toLowerCase() === 'new'
                      ? 'blue'
                      : it.label.toLowerCase() === 'edit'
                      ? 'orange'
                      : 'green'
                  }
                >
                  {it.label}
                </Tag>
              ) : (
                <Text>{it.label}</Text>
              ),
          };
        } else {
          return {
            title: <Link to={it.path}>{it.label}</Link>,
          };
        }
      })}
    />
  );
};
