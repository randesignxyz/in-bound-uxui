# Detailed Restructuring Plan: Inbound FSD Hybrid Refactor

This document contains a comprehensive, phase-by-phase plan for restructuring the `upcoming-inbound` codebase. It incorporates correct file placements, decoupled type systems, and a compilation-safe re-export migration strategy.

---

## Phase 1: Setup Directory Structure
*(Foundation - Zero code changes)*

**Goal:** Create the complete folder hierarchy for the hybrid Feature-Sliced Design.

**Execution Steps:**
1. Create the following folder structure inside `/src/pages/prod/upcoming-inbound/`:
   ```plaintext
   upcoming-inbound/
   ├── core/
   ├── api/
   ├── state/
   ├── features/
   │   ├── goods-receipt/
   │   │   ├── components/
   │   │   ├── hooks/
   │   │   └── utils/
   │   ├── purchase-order/
   │   │   ├── components/
   │   │   └── hooks/
   │   ├── qc-review/
   │   │   ├── components/
   │   │   └── hooks/
   │   ├── supervisor-review/
   │   │   ├── components/
   │   │   └── hooks/
   │   ├── procurement/
   │   │   ├── components/
   │   │   └── hooks/
   │   └── supporting-documents/
   │       ├── components/
   │       ├── hooks/
   │       └── utils/
   ├── workspaces/
   └── shared/
       ├── ui/
       ├── hooks/
       └── utils/
   ```
2. Create an empty `index.ts` public interface file in the root of each of the 6 features (e.g. `features/goods-receipt/index.ts`).

* **Risk Level:** Very Low.
* **Compilation Status:** Unaffected.

---

## Phase 2: Migrate Core Layer (COMPLETED)
*(Pure Domain Logic & Type Extraction)*

**Goal:** Extract domain models, constants, and calculations. To keep the app compiling during this phase, create temporary "re-export" files in the root folder.

**Execution Steps:**
1. **Create `core/types.ts`**:
   * Move all interfaces/types from the current `data.ts` (e.g. `InboundPurchaseOrderSearch`, `InboundItemMasterApi`, etc.).
   * Move the interface definitions of `GoodsReceipt`, `PurchaseOrder`, `GRItem`, `GRActivity`, etc. from the current `workflow.ts`.
2. **Create `core/workflow.ts`**:
   * Move the functional logic and pure calculators from `workflow.ts` (e.g. `getPurchaseOrderReceiptState`, `hasReceiptDiscrepancy`, status color helpers).
   * Import all interface types from `./types`.
3. **Move `mappers.ts`** to **`core/mappers.ts`**:
   * Update its imports to read types from `./types`.
4. **Create `core/permissions.ts`**:
   * Place role-check functions (e.g. `canApprove`, `canSkipQC`) here.
5. **Create `core/constants.ts`**:
   * Relocate static enums, labels, and table layouts from `data.ts` and `workflow.ts`.
6. **⚠️ MITIGATION STEP (Re-exports)**: Replace the old root files with the following code so existing components continue to function:
   * **`upcoming-inbound/workflow.ts` (old file)**:
     ```typescript
     export * from './core/workflow';
     export * from './core/types';
     ```
   * **`upcoming-inbound/data.ts` (old file)**:
     ```typescript
     export * from './core/types';
     export * from './core/constants';
     ```
   * **`upcoming-inbound/mappers.ts` (old file)**:
     ```typescript
     export * from './core/mappers';
     ```

* **Risk Level:** Low.
* **Compilation Status:** Compiling (maintained via re-exports).

---

## Phase 3: Migrate API Layer (COMPLETED)
*(Network Contracts & Services)*

**Goal:** Relocate network communications and define request/response schemas.

**Execution Steps:**
1. **Create `api/dto.ts`**:
   * Extract backend request inputs and parameter interfaces from `data.ts` (e.g., `InboundSaveGoodsReceiptInput`, `InboundSubmitQcReviewInput`).
2. **Move `service.ts`** to **`api/service.ts`**:
   * Relocate API functions.
   * Update imports in `api/service.ts` to reference `api/dto.ts` and `core/types.ts`.
3. **⚠️ MITIGATION STEP (Re-exports)**: Replace the old root `service.ts` file with:
   * **`upcoming-inbound/service.ts` (old file)**:
     ```typescript
     export * from './api/service';
     export * from './api/dto';
     ```

* **Risk Level:** Low.
* **Compilation Status:** Compiling.

---

## Phase 4: Create Shared State Layer (COMPLETED)
*(Global State Providers & Data Hooks)*

**Goal:** Establish data hydration hooks and state context to remove local state drilling.

**Execution Steps:**
1. **Create `state/InboundProvider.tsx`**:
   * Define context state to hold: active roles, tabs, filter values, and selected workspace rows.
2. **Create `state/useGoodsReceipts.ts`**:
   * Wrap standard fetching/mutating operations for GRs (moving logic out of `UpcomingInboundListview.tsx`).
3. **Create `state/usePurchaseOrders.ts`**:
   * Wrap fetching/linking operations for POs.
4. **Create `state/useInboundWorkspace.ts`**:
   * Handle active panel switching, active sub-views, and layout settings.
5. **Create `state/useInboundData.ts`**:
   * Manage overall list queries, counts, and background syncing.
6. **Integrate at entry points**:
   * Wrap main index router and procurement router in `<InboundProvider>`.

* **Risk Level:** Low.
* **Compilation Status:** Compiling (fully integrated with entry points).

---

## Phase 5: Organize Feature Components
*(UI Decomposition & Segments)*

**Goal:** Deconstruct massive components into self-contained feature slices.

**Execution Steps:**
1. **Goods Receipt Feature (`features/goods-receipt/`)**:
   * Move `GRCreationModal.tsx`, `GRDetailSidebar.tsx`, `GRQueueTable.tsx`, and `InboundGRTable.tsx` from `components/` to `features/goods-receipt/components/`.
   * Export these from `features/goods-receipt/index.ts`.
2. **Purchase Order Feature (`features/purchase-order/`)**:
   * Move `PODetailSidebar.tsx`, `POListTable.tsx`, and `LinkPOModal.tsx` to `features/purchase-order/components/`.
   * Export from `features/purchase-order/index.ts`.
3. **QC Review Feature (`features/qc-review/`)**:
   * Create QC components and hook states inside `features/qc-review/`.
4. **Supervisor Review Feature (`features/supervisor-review/`)**:
   * Move `SupervisorApprovalSuccessModal.tsx` to `features/supervisor-review/components/`.
5. **Procurement Feature (`features/procurement/`)**:
   * Move `CloseRefundModal.tsx`, `ReissuePOModal.tsx`, and `ReleaseWarehouseModal.tsx` from the old `procurement/components/` into `features/procurement/components/`.
6. **Supporting Documents Feature (`features/supporting-documents/`)**:
   * Move `SupportingDocPreviewModal.tsx` and `SupportingDocsList.tsx` to `features/supporting-documents/components/`.
   * **Crucial Step**: Move `supportingDocs.ts` (API/AntD adapters) to **`features/supporting-documents/utils/supportingDocs.ts`**.
7. **Shared UI Components (`shared/ui/`)**:
   * Move `FullscreenModal.tsx` to `shared/ui/`.
8. Ensure all moved components update their internal imports to read from `./core/*` and `./api/*` re-exports if they fail.

* **Risk Level:** High.
* **Compilation Status:** Temporary compile errors may occur while files are being moved; solve by updating relative paths.

---

## Phase 6: Migrate Workspaces & Entry Points
*(UI Composition & Routing)*

**Goal:** Reconstruct the dashboards based on user roles and setup entry points.

**Execution Steps:**
1. **Warehouse Workspace (`workspaces/WarehouseWorkspace.tsx`)**:
   * Assemble Goods Receipt and Purchase Order features into the warehouse operator layout.
2. **QC Workspace (`workspaces/QCWorkspace.tsx`)**:
   * Assemble PO/GR lists with QC Review actions and Supporting Documents.
3. **Supervisor Workspace (`workspaces/SupervisorWorkspace.tsx`)**:
   * Assemble approval layouts and success confirmation modals.
4. **Procurement Workspace (`workspaces/ProcurementWorkspace.tsx`)**:
   * **Rename** `inboundprocurementlist.tsx` to `ProcurementWorkspace.tsx` and move it to `workspaces/`.
   * Wire it to use the new `features/procurement/` modals.
5. **Entry Points in the root directory**:
   * **`InboundListview.tsx`**: Thin coordinator wrapping `<InboundProvider>` and choosing the workspace to load based on path.
   * **`index.tsx`**: Route handler for standard inbound operations.
   * **`procurement.tsx`**: Route handler for the procurement sub-module.

* **Risk Level:** Medium.
* **Compilation Status:** Compiling.

---

## Phase 7: Clean Up & Verify
*(Final Integration)*

**Goal:** Safely remove the temporary root files and ensure clean builds.

**Execution Steps:**
1. **Remove Old Root Files**:
   * Delete `upcoming-inbound/workflow.ts`
   * Delete `upcoming-inbound/data.ts`
   * Delete `upcoming-inbound/mappers.ts`
   * Delete `upcoming-inbound/service.ts`
2. **Update Global Imports**:
   * In all workspace files, page containers, and features, update import paths from `./workflow` or `./service` to point directly to their final locations (e.g., `./core/workflow` or `./api/service`).
3. **UmiJS Route Verification**:
   * Review `/config/routesIntern.ts` to ensure components are resolving correctly.
4. **Build Verification**:
   * Run compilation/build script:
     ```bash
     npm run build
     ```
   * Fix any remaining type or export errors.

* **Risk Level:** Low-Medium.
* **Compilation Status:** Fully Compiling & Production Ready.
