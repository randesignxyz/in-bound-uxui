import type { MyRequestItem } from '../data';

export const myRequestsMockSeed: MyRequestItem[] = [
  {
    id: 101,
    requestId: 'Re-0101',
    priority: 'high',
    requestDate: '2026-03-02T04:00:00.000Z',
    totalItems: 4,
    receivedItems: 0,
    requestStatus: 'pending',
    remark: 'Urgent line maintenance',
    type: 'MRO-W',
  },
  {
    id: 102,
    requestId: 'Re-0102',
    priority: 'normal',
    requestDate: '2026-03-02T06:00:00.000Z',
    totalItems: 2,
    receivedItems: 2,
    requestStatus: 'in-progress',
    remark: 'Routine replacement',
    type: 'MRO-S',
  },
  {
    id: 103,
    requestId: 'Re-0103',
    priority: 'low',
    requestDate: '2026-03-03T02:30:00.000Z',
    totalItems: 5,
    receivedItems: 2,
    requestStatus: 'partial',
    remark: 'Waiting remaining stock',
    type: 'MRO-W',
  },
  {
    id: 104,
    requestId: 'Re-0104',
    priority: 'urgent',
    requestDate: '2026-03-03T10:00:00.000Z',
    totalItems: 1,
    receivedItems: 0,
    requestStatus: 'rejected',
    remark: 'Invalid purpose',
    type: 'MRO-G',
  },
];

