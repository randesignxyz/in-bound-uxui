import { Transfer } from './data';
import ActivityTimeline from './ActivityTimeline';

interface Props {
  data?: Transfer;
}

export default ({ data }: Props) => {
  return <ActivityTimeline activities={data?.activities} />;
};
