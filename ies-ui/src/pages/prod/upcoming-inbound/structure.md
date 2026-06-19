upcoming-inbound/
├── components/                             # Reusable UI components & modals for Inbound/GR
│   ├── FullscreenModal.tsx                 # Full-screen modal container wrapper
│   ├── GRCreationModal.tsx                 # Main modal for creating Goods Receipts (GR)
│   ├── GRCreationModal.test.tsx            # Unit tests for GR Creation modal
│   ├── GRDetailSidebar.tsx                 # Detail drawer / sidebar for Goods Receipts
│   ├── GRQueueTable.tsx                    # Table list of Goods Receipts in the queue
│   ├── InboundGRTable.tsx                  # Table listing Inbound Goods Receipts
│   ├── LinkPOModal.tsx                     # Modal to link Purchase Orders to receipts
│   ├── PODetailSidebar.tsx                 # Detail drawer / sidebar for Purchase Orders
│   ├── POListTable.tsx                     # Table listing Purchase Orders
│   ├── POListTable.test.tsx                # Unit tests for Purchase Order list table
│   ├── SupervisorApprovalSuccessModal.tsx  # Success feedback modal for supervisor approval
│   ├── SupportingDocPreviewModal.tsx       # Preview modal for uploaded documents
│   ├── SupportingDocsList.tsx              # List of associated supporting documents
│   ├── TempGRCreationModal.tsx             # Modal for creating temporary Goods Receipts (Temp GR)
│   └── TempGRCreationModal.test.tsx        # Unit tests for Temp GR Creation modal
├── procurement/                             # Procurement sub-module pages and components
│   ├── components/                          # Modals specifically for procurement operations
│   │   ├── CloseRefundModal.tsx             # Modal to close orders and process refunds
│   │   ├── ReissuePOModal.tsx               # Modal to re-issue Purchase Orders
│   │   └── ReleaseWarehouseModal.tsx        # Modal to trigger warehouse release
│   ├── close-order.html                     # HTML page template for closing orders
│   ├── procurement.html                     # HTML page template for procurement view
│   ├── re-issue.html                        # HTML page template for re-issuing POs
│   └── release.html                         # HTML page template for releasing warehouse items
├── UpcomingInboundListview.tsx              # Main list view container for Upcoming Inbound
├── data.ts                                  # Static data, constants, and type definitions
├── inboundprocurementlist.tsx               # Container list view for Inbound Procurement
├── index.tsx                                # Entry point / route definitions for Upcoming Inbound
├── mappers.ts                               # Data mapping and conversion logic (API <-> UI models)
├── procurement.tsx                          # Base procurement component
├── service.ts                               # API services / endpoints integration
├── supportingDocs.ts                        # Supporting documentation business logic & hooks
├── workflow.ts                              # Workflow & state machine definitions for Inbound steps
└── workflow.test.ts                         # Unit tests for inbound workflow states
                             




