upcoming-inbound/
├── core/               # Pure domain / business logic (no React, no UI)
│   ├── workflow.ts
│   ├── permissions.ts
│   ├── mappers.ts
│   ├── types.ts
│   └── constants.ts
├── api/                                 # API contracts and calls
│   ├── service.ts
│   └── dto.ts
├── state/               # Global state providers and domain data hooks
│   ├── InboundProvider.tsx
│   ├── useInboundWorkspace.ts
│   ├── useGoodsReceipts.ts
│   ├── usePurchaseOrders.ts
│   └── useInboundData.ts
├── features/         # Interactive business features (scenarios/modals)
│   ├── goods-receipt/                   # GR creation, linking, details
│   ├── purchase-order/                  # PO tables, details
│   ├── qc-review/                       # QC checks
│   ├── supervisor-review/               # Approvals
│   ├── procurement/            # Resolution modals & hooks (no list view)
│   │   ├── components/        # CloseRefundModal, ReissuePOModal, ReleaseWarehouseModal
│   │   ├── hooks/    # useCloseRefund, useReissuePO, useReleaseWarehouse
│   │   └── index.ts               # Public API exports
│   └── supporting-documents/
├── workspaces/                          # Persona-based dashboard screens
│   ├── WarehouseWorkspace.tsx
│   ├── QCWorkspace.tsx
│   ├── SupervisorWorkspace.tsx
│   └── ProcurementWorkspace.tsx          # Renamed from inboundprocurementlist.tsx
├── shared/                              # Generic reusable elements
│   ├── ui/
│   ├── hooks/
│   └── utils/
├── index.tsx                            # Page entry point for /prod/inventory-inbound/*
├── procurement.tsx        # Page entry point for /prod/inventory-inbound/procurement/*
└── InboundListview.tsx           # Thin coordinator container for index.tsx
