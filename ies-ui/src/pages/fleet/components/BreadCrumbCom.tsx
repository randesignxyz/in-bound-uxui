import { history, Link } from '@umijs/max';
import { Breadcrumb, Typography } from 'antd';
import { uniqueId } from 'lodash';

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
    <Breadcrumb separator={separator}>
      {routes.map((it, index) => {
        if (index === routes.length - 1) {
          return (
            <Breadcrumb.Item key={uniqueId()}>
              <Text>{it.label}</Text>
            </Breadcrumb.Item>
          );
        } else {
          return (
            <Breadcrumb.Item key={uniqueId()} onClick={() => history.push(it.path)}>
              <Link to={it.path}>{it.label}</Link>
            </Breadcrumb.Item>
          );
        }
      })}
    </Breadcrumb>
  );
};
