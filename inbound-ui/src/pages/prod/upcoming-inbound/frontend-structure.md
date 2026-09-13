# Upcoming Inbound Module Structure

This directory contains the frontend components, services, and types for the **Upcoming Inbound** (Goods Receipt & Inbound Procurement) features in the Production (PROD) environment.

## Directory Tree

```text
upcoming-inbound/
├── components/                              # Reusable UI components & modals for Inbound/GR
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
```

## Core Files Overview

### 1. Main Views & Navigation
* **`index.tsx`**: Defines routing and entry components for the upcoming inbound page.
* **`UpcomingInboundListview.tsx`**: Renders the dashboard and master-detail layout for inbound tasks, tracking, and receipts.
* **`inboundprocurementlist.tsx`**: Specialized page managing the procurement list view inside the inbound flow.

### 2. Business Logic & API Layer
* **`service.ts`**: Contains all HTTP client requests for retrieving/submitting Inbound, Goods Receipt, and Purchase Order data.
* **`mappers.ts`**: Converts backend DTOs (Data Transfer Objects) to frontend models for consistent render logic.
* **`workflow.ts`**: Models state transition rules and permissions for creating and approving GR / Temp GR.

### 3. Sub-modules
* **`components/`**: House all local modals (e.g. `GRCreationModal.tsx`, `TempGRCreationModal.tsx`) and drawers (e.g. `GRDetailSidebar.tsx`, `PODetailSidebar.tsx`) to keep views clean.
* **`procurement/`**: Deals with actions on purchase orders such as releasing warehouse holds, reissuing POs, and closing/refunding.
