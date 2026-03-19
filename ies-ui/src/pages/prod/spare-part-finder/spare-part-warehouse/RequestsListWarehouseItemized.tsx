// import { EyeOutlined } from '@ant-design/icons';
// import type { ProColumns } from '@ant-design/pro-components';
// import { Button, Tag, Typography } from 'antd';
// import {
//   deriveWarehouseDisplayStatus,
//   type WarehouseDisplayStatus,
//   type WarehouseRequestLineItem,
//   type WarehouseRequestRecord,
//   warehouseStatusColorMap,
//   warehouseStatusLabelMap,
// } from './requestsWarehouse.shared';

// export interface ItemizedRow extends WarehouseRequestLineItem {
//   id: number;
//   requestId: string;
//   requestAmount: number;
//   sendingAmount: number;
//   totalAmount: number;
//   pickupDate: string;
//   pickedUpBy: string;
//   status: WarehouseDisplayStatus;
// }

// export const buildItemizedData = (requests: WarehouseRequestRecord[]): ItemizedRow[] =>
//   requests.flatMap((request) =>
//     request.items.map((item) => ({
//       ...item,
//       id: item.id,
//       requestId: request.requestId,
//       requestAmount: request.items.reduce((sum, line) => sum + line.quantity, 0),
//       sendingAmount: item.receivedQuantity ?? 0,
//       totalAmount: item.quantity,
//       pickupDate: request.pickupDate || '-',
//       pickedUpBy: request.pickedUpBy || '-',
//       status: deriveWarehouseDisplayStatus(request),
//     })),
//   );

// export const buildItemizedColumns = (options: {
//   requests: WarehouseRequestRecord[];
//   onViewRequest?: (request: WarehouseRequestRecord) => void;
// }): ProColumns<ItemizedRow>[] => [
//     {
//       title: '',
//       key: 'view',
//       width: 42,
//       render: (_, record) => {
//         const parent = options.requests.find((r) => r.requestId === record.requestId);
//         return (
//           <Button
//             type="text"
//             icon={<EyeOutlined />}
//             onClick={() => parent && options.onViewRequest?.(parent)}
//             style={{ color: '#1677ff' }}
//           />
//         );
//       },
//     },
//     {
//       title: 'Request ID',
//       dataIndex: 'requestId',
//       key: 'requestId',
//       width: 120,
//       render: (value) => <Typography.Link>{value}</Typography.Link>,
//     },
//     { title: 'Product ID', dataIndex: 'productId', key: 'productId', width: 120, ellipsis: true },
//     { title: 'Item Name', dataIndex: 'itemName', key: 'itemName', width: 200, ellipsis: true },
//     { title: 'Request Amount', dataIndex: 'requestAmount', key: 'requestAmount', width: 110 },
//     { title: 'Sending Amount', dataIndex: 'sendingAmount', key: 'sendingAmount', width: 110 },
//     { title: 'Total Amount', dataIndex: 'totalAmount', key: 'totalAmount', width: 100 },
//     { title: 'BU', dataIndex: 'businessUnit', key: 'businessUnit', width: 70 },
//     {
//       title: 'Created Date',
//       key: 'createdDate',
//       width: 150,
//       render: (_, record) => options.requests.find((r) => r.requestId === record.requestId)?.requestDate || '-',
//     },
//     { title: 'Picked Up Date', dataIndex: 'pickupDate', key: 'pickupDate', width: 150 },
//     { title: 'Picked Up by', dataIndex: 'pickedUpBy', key: 'pickedUpBy', width: 120 },
//     {
//       title: 'Status',
//       dataIndex: 'status',
//       key: 'status',
//       width: 120,
//       render: (_, record) => {
//         return (
//           <Tag
//             color={warehouseStatusColorMap[record.status]}
//             style={{ width: '100%', textAlign: 'center' }}
//           >
//             {warehouseStatusLabelMap[record.status]}
//           </Tag>
//         );
//       },
//     },
//   ];
