import { toReadable } from '@/pages/utils';
import Badge from 'antd/lib/badge';

export default ({ text, value }: { text: string; value?: string }) => {
  const getColor = () => {
    const status = (value || text).toUpperCase(); 
    if (['ACTIVE', 'APPROVED', 'POSTED', 'COMPLETED', 'SELECTED', 'DONE', 'ISSUED','ACHIEVED','OPEN'].some((it) => it == status)) 
      return 'success';

    if (
      [
        'POSTED',
        'PREPARED',
        'SUBMITTED',
        'IMPORTED',
        'NEW',
        'PENDING',
        'LOADED',
        'IN_PROGRESS',
        'CONFIRMED',
        'LOADING',
        'PENDING'
      ].some((it) => it == status)
    )
      return 'processing';

    if (
      [
        'DRAFT',
        'UNCHANGED',
        'UNCHANGED',
        'REWORKED',
        'SUBMITTED',
        'IGNORED',
        'UPDATE_STATUS',
        'NEW',
        'IN_ACTIVE',
        'CLOSED',
        'EXPIRED',
        'ON_HOLD'       
      ].some((it) => it == status)
    )
      return 'warning';

    if (
      ['TERMINATED', 'FAILED', 'CANCELED', 'REJECTED', 'DELETED', 'VOID', 'CANCELED'].some((it) => it == status)
    )
      return 'error';

    return 'default';
  };

  return <Badge status={getColor()} text={toReadable(text)} />;
};
