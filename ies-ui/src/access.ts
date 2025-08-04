/**
 * @see https://umijs.org/docs/max/access#access
 * */
export default function access(initialState: { currentUser?: API.CurrentUser } | undefined) {
  const { currentUser } = initialState ?? {};
  return {
    isRequesterRole:
      currentUser?.authorities.some((item) =>
        ['ROLE_PRO_PR_USER', 'ROLE_TICKET_INCIDENT_USER'].some((it) => it === item),
      ) || false,
    //Workflow
    canAccessTaskListMenu:
      currentUser?.authorities.some((item) =>
        ['ROLE_TASK_LIST', 'ROLE_WORKFLOW_ADMIN', 'ROLE_WORKFLOW_APPROVAL', 'ROLE_ADMIN'].some(
          (it) => it === item,
        ),
      ) || false,
    canAccessInstanceListMenu:
      currentUser?.authorities.some(
        (item) => ['ROLE_WORKFLOW_ADMIN', 'ROLE_ADMIN'].some((it) => it === item), //'ROLE_WORKFLOW',
      ) || false,

    canAccessRequestListMenu:
      currentUser?.authorities.some(
        (item) =>
          ['ROLE_WORKFLOW_ADMIN', 'ROLE_ADMIN', 'ROLE_WORKFLOW_REQUEST_LIST'].some(
            (it) => it === item,
          ), //'ROLE_WORKFLOW',
      ) || false,

    canAssignWorkflow:
      currentUser?.authorities.some((item) =>
        ['ROLE_WORKFLOW_ADMIN', 'ROLE_WORKFLOW_ASSIGN_DEST'].some((it) => it === item),
      ) || false,
    //Delivery
    canAccessSettingMenu:
      currentUser?.authorities.some(
        (item) => item === 'ROLE_WORKFLOW_ADMIN' || item === 'ROLE_ADMIN',
      ) || false,
    canAdmin:
      currentUser?.authorities.some(
        (item) => item === 'ROLE_ADMIN',
      ) || false,

    canConfirmDeliveryExpense:
      currentUser?.authorities.some((item) =>
        ['ROLE_DELIVERY_EXPENSE_ADMIN', 'ROLE_DELIVERY_EXPENSE_CONFIRMED'].some(
          (it) => it === item,
        ),
      ) || false,

    canClaimDeliveryExpense:
      currentUser?.authorities.some((item) =>
        ['ROLE_DELIVERY_EXPENSE_ADMIN', 'ROLE_DELIVERY_EXPENSE_USER'].some((it) => it === item),
      ) || false,
    canAccessDeliverySetupPriceList:
      currentUser?.authorities.some((item) =>
        [
          'ROLE_DELIVERY_EXPENSE_ADMIN', 'ROLE_DELIVERY_EXPENSE_USER'
        ].some((it) => it === item),
      ) || false,

    canAccessDeliveryReports:
      currentUser?.authorities.some(
        (item) =>
          item === 'ROLE_DELIVERY_EXPENSE_USER_REPORT' || item === 'ROLE_DELIVERY_EXPENSE_ADMIN',
      ) || false,

    canConfigureDeliveryPrice:
      currentUser?.authorities.some(
        (item) => item === 'ROLE_DELIVERY_EXPENSE_ADMIN' || item === 'ROLE_ADMIN',
      ) || false,

    canAccessDeliveryExpenseMenu:
      currentUser?.authorities.some((item) =>
        [
          'ROLE_DELIVERY_EXPENSE_USER',
          'ROLE_DELIVERY_EXPENSE_USER_REPORT',
          'ROLE_DELIVERY_EXPENSE_ADMIN',
        ].some((it) => it === item),
      ) || false,

    canAccessInventoryMenuItem:
      currentUser?.authorities.some((item) => item === 'ROLE_INVENTORY_ADMIN') || false,
    canAccessPurchaseMenuItem:
      currentUser?.authorities.some((item) => item === 'ROLE_PURCHASE_ADMIN') || false,

    canAccessQuotationMenuItem:
      currentUser?.authorities.some((item) => item === 'ROLE_ADMIN') || false,
    canAccessPOIMenutem: currentUser?.authorities.some((item) => item === 'ROLE_ADMIN') || false,

    canAccessCrmMenuItem:
      currentUser?.authorities.some((item) =>
        [
          'ROLE_CRM_ADMIN',
          'ROLE_SALE_ADMIN',
          'ROLE_CRM_SALE_ADMIN',
          'ROLE_SALESPERSON',
          'ROLE_ADMIN',
          'ROLE_CRM_REGISTER_CUSTOMER'
        ].some((it) => it === item),
      ) || false,

    canCreatePQ:
      currentUser?.authorities.some((item) =>
        ['ROLE_ADMIN', 'ROLE_PRO_SUPPORT', 'ROLE_PRO_ADMIN'].some((it) => it === item),
      ) || false,

    canCreateQC:
      currentUser?.authorities.some((item) =>
        ['ROLE_ADMIN', 'ROLE_PRO_SUPPORT', 'ROLE_PRO_ADMIN'].some((it) => it === item),
      ) || false,

    canCreatePO:
      currentUser?.authorities.some((item) =>
        ['ROLE_ADMIN', 'ROLE_PRO_SUPPORT', 'ROLE_PRO_ADMIN'].some((it) => it === item),
      ) || false,

    hasProOflAccess:
      currentUser?.authorities.some((item) =>
        ['ROLE_ADMIN', 'ROLE_PRO_ADMIN', 'ROLE_PRO_OFL_ACCESS'].some((it) => it === item),
      ) || false,

    hasProNvcAccess:
      currentUser?.authorities.some((item) =>
        ['ROLE_ADMIN', 'ROLE_PRO_ADMIN', 'ROLE_PRO_NVC_ACCESS'].some((it) => it === item),
      ) || false,

    hasProOmmAccess:
      currentUser?.authorities.some((item) =>
        ['ROLE_ADMIN', 'ROLE_PRO_ADMIN', 'ROLE_PRO_OMM_ACCESS'].some((it) => it === item),
      ) || false,

    hasProOmcAccess:
      currentUser?.authorities.some((item) =>
        ['ROLE_ADMIN', 'ROLE_PRO_ADMIN', 'ROLE_PRO_OMC_ACCESS'].some((it) => it === item),
      ) || false,

    canAccessSaleMenuItem:
      currentUser?.authorities.some((item) =>
        [
          'ROLE_SALE_ADMIN',
          'ROLE_SALESPERSON',
          'ROLE_ADMIN',
          'ROLE_DSD_ADMIN',
          'ROLE_CASHIER',
          'ROLE_WAREHOUSE',
          'ROLE_AR',
          'ROLE_SALE_INDIVIDUAL',
          'ROLE_DSD_REPORT',
        ].some((it) => it === item),
      ) || false,

    canAccessSaleMenuItems:
      currentUser?.authorities.some((item) =>
        ['ROLE_SALE_ADMIN', 'ROLE_SALESPERSON', 'ROLE_ADMIN'].some((it) => it === item),
      ) || false,

    canAccessCRMVisitScheduleMngt:
      currentUser?.authorities.some((item) =>
        [
          'ROLE_SALE_ADMIN',
          'ROLE_CRM_SALE_ADMIN',
          'ROLE_CRM_ADMIN',
          'ROLE_CRM_VISIT_SCHEDULE_MNGT',
          'ROLE_ADMIN',
        ].some((it) => it === item),
      ) || false,
    saleAdmin:
      currentUser?.authorities.some((item) =>
        ['ROLE_CRM_ADMIN', 'ROLE_CRM_SALE_ADMIN', 'ROLE_ADMIN'].some((it) => it === item),
      ) || false,
    crmAdmin:
      currentUser?.authorities.some((item) =>
        ['ROLE_CRM_ADMIN', 'ROLE_ADMIN'].some((it) => it === item),
      ) || false,
    crmUser:
      currentUser?.authorities.some((item) => ['ROLE_CRM_SALE_USER'].some((it) => it === item)) ||
      false,

    /***Customer */

    canAccessContact:
      currentUser?.authorities.some((item) =>
        ['ROLE_CRM_ADMIN', 'ROLE_CRM_SALE_ADMIN', 'ROLE_ADMIN', 'ROLE_CONTACT_ACCESS',].some(
          (it) => it === item,
        ),
      ) || false,

    canCreateContract:
      currentUser?.authorities.some((item) =>
        ['ROLE_CRM_ADMIN', 'ROLE_CRM_SALE_ADMIN', 'ROLE_ADMIN', 'ROLE_SALESPERSON'].some((it) => it === item),
      ) || false,

    canImportContract:
      currentUser?.authorities.some((item) =>
        ['ROLE_CRM_ADMIN', 'ROLE_ADMIN'].some((it) => it === item),
      ) || false,

    canAddEditContract: currentUser?.authorities.some((item) =>
      ['ROLE_CRM_ADMIN', 'ROLE_ADMIN'].some((it) => it === item),
    ) || false,


    canEditCustomerBasicInfo:
      currentUser?.authorities.some((item) =>
        ['ROLE_CRM_ADMIN', 'ROLE_ADMIN'].some((it) => it === item),
      ) || false,
    canEditPurchaseEst:
      currentUser?.authorities.some((item) =>
        ['ROLE_CRM_ADMIN', 'ROLE_ADMIN'].some((it) => it === item),
      ) || false,
    canVisitScheduleGen:
      currentUser?.authorities.some((item) =>
        ['ROLE_CRM_ADMIN', 'ROLE_ADMIN'].some((it) => it === item),
      ) || false,
    canDisableCustomer:
      currentUser?.authorities.some((item) =>
        ['ROLE_CRM_ADMIN', 'ROLE_ADMIN'].some((it) => it === item),
      ) || false,
    canActiveInactiveCustomer:
      currentUser?.authorities.some((item) =>
        ['ROLE_CRM_ADMIN', 'ROLE_ADMIN'].some((it) => it === item),
      ) || false,
    canTransferSe:
      currentUser?.authorities.some((item) =>
        ['ROLE_CRM_ADMIN', 'ROLE_ADMIN'].some((it) => it === item),
      ) || false,

    createEditVisitSchedule:
      currentUser?.authorities.some((item) =>
        ['ROLE_CRM_SALE_ADMIN', 'ROLE_ADMIN'].some((it) => it === item),
      ) || false,

    canVerifyContractCompliance:
      currentUser?.authorities.some((item) =>
        ['ROLE_CRM_CONTRACT_VERIFY', 'ROLE_ADMIN'].some((it) => it === item),
      ) || false,
    /*****SO */
    canCreateEditSo:
      currentUser?.authorities.some((item) =>
        ['ROLE_CRM_SALE_ADMIN', 'ROLE_SALE_ADMIN', 'ROLE_ADMIN'].some((it) => it === item),
      ) || false,

    /*****Delivery */

    canAccesDeliveyMenu:
      currentUser?.authorities.some((item) =>
        [
          'ROLE_ADMIN',
          'ROLE_DELIVERY_SETTING_ADMIN',
          'ROLE_DELIVERY_CASH_SETTLEMENT_ADMIN',
          'ROLE_DELIVERY_REVIEW',
          'ROLE_DELIVERY_LOADING_ADMIN',
          'ROLE_DELIVERY_QUEUE_ADMIN',
          'ROLE_DELIVERY_SYS_ADMIN',
          'ROLE_DELIVERY_REVIEW',
          'ROLE_LOADING_OFFICER',
          'ROLE_DELIVERY_REPORT_DELIVERY_TIME_REPORT',
          'ROLE_DELIVERY_REPORT_TRANSPORTATION_TIME_REPORT',
          'ROLE_DELIVERY_REPORT_LOADING_TIME_REPORT'

        ].some((it) => it === item),
      ) || false,

    canAccessSetttlemnetFn:
      currentUser?.authorities.some((item) =>
        ['ROLE_ADMIN', 'ROLE_DELIVERY_CASH_SETTLEMENT_ADMIN'].some((it) => it === item),
      ) || false,

    canAccessDeliveryCashSettlementMenuItem:
      currentUser?.authorities.some((item) =>
        ['ROLE_ADMIN', 'ROLE_DELIVERY_CASH_SETTLEMENT_ADMIN', 'ROLE_DELIVERY_SYS_ADMIN'].some(
          (it) => it === item,
        ),
      ) || false,

    canAccessQueueMenuItem:
      currentUser?.authorities.some((item) =>
        ['ROLE_ADMIN', 'ROLE_DELIVERY_QUEUE_ADMIN'].some((it) => it === item),
      ) || false,

    canAccessLoadingMenuItem:
      currentUser?.authorities.some((item) =>
        ['ROLE_ADMIN', 'ROLE_DELIVERY_QUEUE_ADMIN'].some((it) => it === item),
      ) || false,

    canAccessDeliveryMenuItem:
      currentUser?.authorities.some((item) =>
        ['ROLE_ADMIN', 'ROLE_DELIVERY_SYS_ADMIN'].some((it) => it === item),
      ) || false,

    canEditQueueLayoutDisplay: currentUser?.authorities.some((item) =>
      ['ROLE_ADMIN', 'ROLE_EDIT_QUEUE_LAYOUT_DISPLAY_ADMIN'].some((it) => it === item),
    ) || false,


    canAccessDeliverySettingMenuItem:
      currentUser?.authorities.some((item) =>
        ['ROLE_ADMIN', 'ROLE_DELIVERY_SETTING_ADMIN'].some((it) => it === item),
      ) || false,

    canAccesDeliveryReviewMenuItem:
      currentUser?.authorities.some((item) =>
        ['ROLE_ADMIN', 'ROLE_DELIVERY_REVIEW'].some((it) => it === item),
      ) || false,

    canAccessDeliveryLoading:
      currentUser?.authorities.some((item) =>
        ['ROLE_ADMIN', 'ROLE_DELIVERY_LOADING_ADMIN', 'ROLE_LOADING_OFFICER'].some(
          (it) => it === item,
        ),
      ) || false,
    canAccessLoadingTimeReport:
      currentUser?.authorities.some((item) =>
        ['ROLE_ADMIN', 'ROLE_DELIVERY_LOADING_ADMIN', 'ROLE_LOADING_OFFICER', 'ROLE_DELIVERY_REPORT_LOADING_TIME_REPORT'].some(
          (it) => it === item,
        ),
      ) || false,

    canAccessDeliverySettlement:
      currentUser?.authorities.some((item) =>
        ['ROLE_ADMIN', 'ROLE_DELIVERY_CASH_SETTLEMENT_ADMIN'].some((it) => it === item),
      ) || false,

    canAccessDeliveryTruck:
      currentUser?.authorities.some((item) =>
        ['ROLE_ADMIN', 'ROLE_DELIVERY_SETTING_ADMIN', 'ROLE_DELIVERY_SYS_ADMIN'].some(
          (it) => it === item,
        ),
      ) || false,

    canAccessDeliveryDriver:
      currentUser?.authorities.some((item) =>
        ['ROLE_ADMIN', 'ROLE_DELIVERY_SETTING_ADMIN', 'ROLE_DELIVERY_SYS_ADMIN'].some(
          (it) => it === item,
        ),
      ) || false,

    canAccessDeliveryTimeReport:
      currentUser?.authorities.some((item) =>
        ['ROLE_ADMIN', 'ROLE_DELIVERY_SYS_ADMIN', 'ROLE_DELIVERY_REPORT_DELIVERY_TIME_REPORT'].some(
          (it) => it === item,
        ),
      ) || false,

    canAccessTransportationTimeReport:
      currentUser?.authorities.some((item) =>
        ['ROLE_ADMIN', 'ROLE_DELIVERY_SYS_ADMIN', 'ROLE_DELIVERY_REPORT_TRANSPORTATION_TIME_REPORT'].some(
          (it) => it === item,
        ),
      ) || false,

    canAccessIssuedMultiTicket:
      currentUser?.authorities.some((item) =>
        ['ROLE_ADMIN', 'ROLE_DELIVERY_ISSUED_MULTI_TICKET'].some(
          (it) => it === item,
        ),
      ) || false,
    canAccessEnableSideDoor:
      currentUser?.authorities.some((item) =>
        ['ROLE_ADMIN', 'ROLE_DELIVERY_ENALE_SIDE_DOOR'].some(
          (it) => it === item,
        ),
      ) || false,
    canAccesAllocateDelView:
      currentUser?.authorities.some((item) =>
        ['ROLE_ADMIN', 'ROLE_DELIVERY_DEL_ALLOCATION'].some((it) => it === item),
      ) || false,

    canAccesAddRemarkAllocate:
      currentUser?.authorities.some((item) =>
        ['ROLE_DELIVERY_ALLOCATION_REMARK'].some((it) => it === item),
      ) || false,

    /**** Prod */
    canAccessProdMenu:
      currentUser?.authorities.some((item) =>
        [
          'ROLE_ADMIN',
          'ROLE_PROD_ADMIN',
          'ROLE_PROD_PRO_ADMIN',
          'ROLE_PROD_NVC_ADMIN',
          'ROLE_PROD_OFL_ADMIN',
          'ROLE_PROD_OMM_ADMIN',
          'ROLE_PROD_WARE_ADMIN',
          'ROLE_PROD_WTP_ADMIN',
        ].some((it) => it === item),
      ) || false,

    canAccessInventoryTranferRequestMenuItem:
      currentUser?.authorities.some((item) =>
        [
          'ROLE_ADMIN',
          'ROLE_PROD_ADMIN',
          'ROLE_PROD_PRO_ADMIN',
          'ROLE_PROD_NVC_ADMIN',
          'ROLE_PROD_OFL_ADMIN',
          'ROLE_PROD_OMM_ADMIN',
          'ROLE_PROD_WARE_ADMIN',
        ].some((it) => it === item),
      ) || false,

    canAccessInventoryTranferMenuItem:
      currentUser?.authorities.some((item) =>
        [
          'ROLE_ADMIN',
          'ROLE_PROD_ADMIN',
          'ROLE_PROD_PRO_ADMIN',
          'ROLE_PROD_NVC_ADMIN',
          'ROLE_PROD_OFL_ADMIN',
          'ROLE_PROD_OMM_ADMIN',
          'ROLE_PROD_WARE_ADMIN',
        ].some((it) => it === item),
      ) || false,

    canMakeInventoryTranferRequest:
      currentUser?.authorities.some((item) =>
        [
          'ROLE_ADMIN',
          'ROLE_PROD_ADMIN',
          'ROLE_PROD_PRO_ADMIN',
          'ROLE_PROD_NVC_ADMIN',
          'ROLE_PROD_OFL_ADMIN',
          'ROLE_PROD_OMM_ADMIN',
        ].some((it) => it === item),
      ) || false,
    canAccessAll:
      currentUser?.authorities.some((item) => ['ROLE_ADMIN', 'ROLE_PROD_ADMIN'].some((it) => it === item)) || false,
    canAccessItem:
      currentUser?.authorities.some((item) =>
        ['ROLE_ADMIN', 'ROLE_PROD_ADMIN', 'ROLE_PROD_PRO_ADMIN', 'ROLE_PROD_WARE_ADMIN'].some((it) => it === item),
      ) || false,
    canAccessNVCItem:
      currentUser?.authorities.some((item) => ['ROLE_PROD_NVC_ADMIN'].some((it) => it === item)) ||
      false,
    canAccessOFLItem:
      currentUser?.authorities.some((item) => ['ROLE_PROD_OFL_ADMIN'].some((it) => it === item)) ||
      false,
    canAccessOMMItem:
      currentUser?.authorities.some((item) => ['ROLE_PROD_OMM_ADMIN'].some((it) => it === item)) ||
      false,
    canAccessProductionTab:
      currentUser?.authorities.some((item) =>
        [
          'ROLE_PROD_PRO_ADMIN',
          'ROLE_PROD_NVC_ADMIN',
          'ROLE_PROD_OFL_ADMIN',
          'ROLE_PROD_OMM_ADMIN',
        ].some((it) => it === item),
      ) || false,
    canAccessWarehouseTab:
      currentUser?.authorities.some((item) =>
        [
          'ROLE_PROD_WARE_ADMIN',
          'ROLE_WARE_NVC_ADMIN',
          'ROLE_WARE_OFL_ADMIN',
          'ROLE_WARE_OMM_ADMIN',
        ].some((it) => it === item),
      ) || false,
    canAccessTransferWarehouseItem:
      currentUser?.authorities.some((item) => ['ROLE_PROD_WARE_ADMIN'].some((it) => it === item)) ||
      false,
    canAccessTransferProductionItem:
      currentUser?.authorities.some((item) => ['ROLE_PROD_PRO_ADMIN'].some((it) => it === item)) ||
      false,
    currentUser,
    canAccessDailyWaterTreatmentMenuItem:
      currentUser?.authorities.some((item) =>
        [
          'ROLE_ADMIN',
          'ROLE_PROD_WTP_ADMIN',
          'ROLE_PROD_PRO_ADMIN',
          'ROLE_PROD_ADMIN'
        ].some((it) => it === item),
      ) || false,
    canAssignItem:
      currentUser?.authorities.some((item) =>
        [
          'ROLE_ADMIN',
          'ROLE_PROD_PRO_ADMIN',
          'ROLE_PROD_WTP_ADMIN',
          'ROLE_PROD_ADMIN'
        ].some((it) => it === item),
      ) || false,

    canAccessDailyWaterTreatmentAssignItem:
      currentUser?.authorities.some((item) =>
        [
          'ROLE_PROD_DWT_USER'
        ].some((it) => it === item),
      ) || false,
    canAccessDailyPreWaterTreatmentMenuItem:
      currentUser?.authorities.some((item) =>
        [
          'ROLE_ADMIN',
          'ROLE_PROD_PRO_ADMIN',
          'ROLE_PROD_WTP_ADMIN',
          'ROLE_PROD_ADMIN'
        ].some((it) => it === item),
      ) || false,
    canAssignItemPre:
      currentUser?.authorities.some((item) =>
        [
          'ROLE_ADMIN',
          'ROLE_PROD_PRO_ADMIN',
          'ROLE_PROD_WTP_ADMIN',
          'ROLE_PROD_ADMIN'
        ].some((it) => it === item),
      ) || false,
    canAccessDailyHACCPMonitoringMenuItem:
      currentUser?.authorities.some((item) =>
        [
          'ROLE_ADMIN',
          'ROLE_PROD_HACCP_USER',
          'ROLE_PROD_PRO_ADMIN',
          'ROLE_PROD_WTP_ADMIN',
          'ROLE_PROD_ADMIN'
        ].some((it) => it === item),
      ) || false,
    canAccessDailyHACCPMonitoringOzoneMenuItem:
      currentUser?.authorities.some((item) =>
        [
          'ROLE_ADMIN',
          'ROLE_PROD_HACCP_USER',
          'ROLE_PROD_PRO_ADMIN',
          'ROLE_PROD_WTP_ADMIN',
          'ROLE_PROD_ADMIN'
        ].some((it) => it === item),
      ) || false,


    /*****Queque */
    canAccesSqueueMenu:
      currentUser?.authorities.some((item) => ['ROLE_ADMIN'].some((it) => it === item)) || false,
    canCreateQueue:
      currentUser?.authorities.some((item) => ['ROLE_ADMIN'].some((it) => it === item)) || false,

    /**Pro */

    canAccessProMenuItem:
      currentUser?.authorities.some((item) =>
        [
          'ROLE_PRO_PR_USER',
          'ROLE_PRO_PR_REQUESTER',
          'ROLE_PRO_PR_SUPPORT',
          'ROLE_PRO_PR_APPROVER',
          'ROLE_PRO_ADMIN',
          'ROLE_PRO_PR_ADMIN',
          'ROLE_ADMIN',
          'ROLE_PRO_QC_APPROVER',
          'ROLE_PRO_PO_APPROVER',
          'ROLE_PRO_SUPPORT',
          'ROLE_FLEET_PRO_PR_REQUESTER'
        ].some((it) => it === item),
      ) || false,
    canAccessFleetPurchaseRequisitionMenuItem:
      currentUser?.authorities.some((item) =>
        [
          'ROLE_FLEET_PRO_PR_REQUESTER',
          'ROLE_ADMIN'
        ].some((it) => it === item),
      ) || false,

    canAccessProSettingMenuItem: currentUser?.authorities.some((item) =>
      [
        'ROLE_PRO_ADMIN',
        'ROLE_ADMIN',
      ].some((it) => it === item),
    ) || false,

    canCreatePR:
      currentUser?.authorities.some((item) => ['ROLE_PRO_PR_USER'].some((it) => it === item)) ||
      false,

    canAccessProPQMenuItem:
      currentUser?.authorities.some((item) =>
        ['ROLE_PRO_PO_VIEW', 'ROLE_PRO_SUPPORT', 'ROLE_PRO_ADMIN', 'ROLE_ADMIN'].some(
          (it) => it === item,
        ),
      ) || false,

    canAccessProQCMenuItem:
      currentUser?.authorities.some((item) =>
        [
          'ROLE_PRO_QC_VIEW',
          'ROLE_PRO_QC_APPROVER',
          'ROLE_PRO_SUPPORT',
          'ROLE_PRO_ADMIN',
          'ROLE_ADMIN',
        ].some((it) => it === item),
      ) || false,

    canAccessProPOMenuItem:
      currentUser?.authorities.some((item) =>
        [
          'ROLE_PRO_PO_VIEW',
          'ROLE_PRO_PO_APPROVER',
          'ROLE_PRO_SUPPORT',
          'ROLE_PRO_ADMIN',
          'ROLE_ADMIN',
        ].some((it) => it === item),
      ) || false,

    canMakeITRequest:
      currentUser?.authorities.some((item) =>
        ['ROLE_PRO_IT_REQUEST_USER', 'ROLE_ADMIN'].some((it) => it === item),
      ) || false,

    canPostPRrToSap:
      currentUser?.authorities.some((item) =>
        ['ROLE_PRO_PR_SUPPORT', 'ROLE_PRO_ADMIN', 'ROLE_PRO_PR_ADMIN'].some((it) => it === item),
      ) || false,
    canAccessPRReport:
      currentUser?.authorities.some((item) =>
        ['ROLE_PRO_PR_REPORT', 'ROLE_PRO_PR_SUPPORT', 'ROLE_PRO_ADMIN', 'ROLE_PRO_PR_ADMIN'].some((it) => it === item),
      ) || false,
    canPostPoReport:
      currentUser?.authorities.some((item) =>
        ['ROLE_PRO_PO_SUPPORT', 'ROLE_PRO_ADMIN', 'ROLE_PRO_PR_ADMIN'].some((it) => it === item),
      ) || false,

    canAccessHrMenu:
      currentUser?.authorities.some((item) =>
        [
          'ROLE_HR_ADMIN',
          'ROLE_ADMIN',
          'ROLE_HR_WF_STAFF_REQUISITION_VIEW',
          'ROLE_HR_WF_STAFF_PROPOSAL_VIEW',
          'ROLE_HR_EMPLOYEE_VIEW',
          'ROLE_HR_APPRAISAL_SUBMIT',
          'ROLE_HR_APPRAISAL_SUPPORT',
          'ROLE_HR_APPRAISAL_ADMIN',
          'ROLE_HR_APPRAISAL_REQUEST',
          'ROLE_HR_APPRAISAL_REQUEST_ADMIN',
          'ROLE_HR_APPRAISAL_REQUEST_MANAGEMENT',
          'ROLE_HR_APPRAISAL_REQUEST_SM_EXECTIVE',
          'ROLE_HR_PROBATION_EVALUATION_SUBMIT',
          'ROLE_HR_PROBATION_EVALUATION_SUPPORT',
          'ROLE_HR_PROBATION_EVALUATION_VIEW',
          'ROLE_HR_PROBATION_EVALUATION_REQUESTER',
        ].some((it) => it === item),
      ) || false,
    canAccessHrEmployeeMenuItem:
      currentUser?.authorities.some((item) =>
        ['ROLE_HR_ADMIN', 'ROLE_HR_EMPLOYEE_VIEW'].some((it) => it === item),
      ) || false,
    canAccessHrViewEmployeeMenuItem:
      currentUser?.authorities.some((item) =>
        ['ROLE_HR_MENU_VIEW'].some((it) => it === item),
      ) || false,
    canAccessHrESSViewOnly:
      currentUser?.authorities.some((item) =>
        ['ROLE_HR_ESS_VIEW_ONLY'].some((it) => it === item),
      ) || false,
    canAccessHrESSImportTraing:
      currentUser?.authorities.some((item) =>
        ['ROLE_HR_ESS_IMPORT_TRAINING', 'ROLE_ADMIN'].some((it) => it === item),
      ) || false,
    canAccessHrESSApprovalProfile:
      currentUser?.authorities.some((item) =>
        ['ROLE_HR_ESS_APPROVAL_PROFILE'].some((it) => it === item),
      ) || false,
    canAccessHrSelfServiceProgressStatusExportAll:
      currentUser?.authorities.some((item) =>
        ['ROLE_HR_ESS_SELF_SERVICE_PROGRESS_STATUS_EXPORT_ALL'].some((it) => it === item),
      ) || false,
    canAccessHrESSAddEditProfile:
      currentUser?.authorities.some((item) =>
        ['ROLE_HR_ESS_ADD_EDIT_PROFILE'].some((it) => it === item),
      ) || false,
    canAccessHrESSEmpMenuReport:
      currentUser?.authorities.some((item) =>
        ['ROLE_HR_ESS_EMP_REPORT'].some((it) => it === item),
      ) || false,
    canAccessHrVissibleTraining:
      currentUser?.authorities.some((item) =>
        ['ROLE_HR_VISSIBLE_TRAINING'].some((it) => it === item),
      ) || false,

    canAccessHrStaffRequisitionMenuItem:
      currentUser?.authorities.some((item) =>
        ['ROLE_HR_ADMIN', 'ROLE_ADMIN', 'ROLE_HR_WF_STAFF_REQUISITION_VIEW'].some(
          (it) => it === item,
        ),
      ) || false,

    canRequestHrStaffRequisition:
      currentUser?.authorities.some((item) =>
        ['ROLE_HR_ADMIN', 'ROLE_ADMIN', 'ROLE_HR_WF_STAFF_REQUISITION_REQUESTER'].some(
          (it) => it === item,
        ),
      ) || false,

    canSupportHrStaffRequisition:
      currentUser?.authorities.some((item) =>
        ['ROLE_HR_WF_STAFF_REQUISITION_SUPPORT'].some((it) => it === item),
      ) || false,

    canAccessHrStaffProposalMenuItem:
      currentUser?.authorities.some((item) =>
        ['ROLE_HR_ADMIN', 'ROLE_ADMIN', 'ROLE_HR_WF_STAFF_PROPOSAL_VIEW'].some((it) => it === item),
      ) || false,

    canRequestHrStaffProposal:
      currentUser?.authorities.some((item) =>
        ['ROLE_HR_ADMIN', 'ROLE_ADMIN', 'ROLE_HR_WF_STAFF_PROPOSAL_REQUESTER'].some(
          (it) => it === item,
        ),
      ) || false,



    canAccessRetailer:
      currentUser?.authorities.some((item) =>
        ['ROLE_RETAILER_APP', 'ROLE_ADMIN'].some((it) => it === item),
      ) || false,

    canCreateRetailer:
      currentUser?.authorities.some((item) =>
        ['ROLE_RETAILER_ADMIN', 'ROLE_ADMIN'].some((it) => it === item),
      ) || false,
    canAccessRetailerSalesperons:
      currentUser?.authorities.some((item) =>
        ['ROLE_RETAILER_SALES_PERSON'].some((it) => it === item),
      ) || false,

    canViewRetailerSalesperons:
      currentUser?.authorities.some((item) =>
        [
          'ROLE_RETAILER_SALES_PERSON',
          'ROLE_RETAILER_SUPPORT',
          'ROLE_RETAILER_APP',
          'ROLE_RETAILER_ADMIN',
          'ROLE_ADMIN',
        ].some((it) => it === item),
      ) || false,

    canViewRetailer:
      currentUser?.authorities.some((item) =>
        ['ROLE_RETAILER_SUPPORT', 'ROLE_RETAILER_APP', 'ROLE_RETAILER_ADMIN', 'ROLE_ADMIN'].some(
          (it) => it === item,
        ),
      ) || false,
    /** Stock Control */

    canCreateEditStockControl: true,

    /** Start Stock Control */
    // new by reach modified 
    canAccessSaleTaskList: currentUser?.authorities.some((items) =>
      ['ROLE_CASHIER', 'ROLE_WAREHOUSE', 'ROLE_DSD_ADMIN', 'ROLE_ADMIN', 'ROLE_MPU_ADMIN'].some((it) => it === items)
    ) || false,

    canAccessSaleStore: currentUser?.authorities.some((items) =>
      ['ROLE_AR', 'ROLE_WAREHOUSE', 'ROLE_DSD_ADMIN', 'ROLE_SALE_INDIVIDUAL', 'ROLE_ADMIN', "ROLE_DSD_REPORT"].some((it) => it === items)
    ) || false,

    canAccessSaleCash: currentUser?.authorities.some((items) =>
      ['ROLE_CASHIER', 'ROLE_DSD_ADMIN', 'ROLE_ADMIN'].some((it) => it === items)
    ) || false,

    canAccessSaleDailyReport: currentUser?.authorities.some((items) =>
      ['ROLE_AR', 'ROLE_ADMIN'].some((it) => it === items)
    ) || false,

    canAccessSaleVisit: currentUser?.authorities.some((items) =>
      ['ROLE_DSD_ADMIN', 'ROLE_SALE_INDIVIDUAL', 'ROLE_ADMIN'].some((it) => it === items)
    ) || false,

    canAccessSaleLead: currentUser?.authorities.some((items) =>
      ['ROLE_DSD_ADMIN', 'ROLE_ADMIN', 'ROLE_SALE_INDIVIDUAL'].some((it) => it === items)
    ) || false,

    canAccessSaleReport: currentUser?.authorities.some((items) =>
      ['ROLE_DSD_ADMIN', 'ROLE_ADMIN', "ROLE_DSD_REPORT"].some((it) => it === items)
    ) || false,
    // canAccessSaleDailySettle :currentUser?.authorities.some((items)=>
    //  || false),
    // ==== END reach ====

    canAccessAllMenuDSD:
      currentUser?.authorities.some((item) =>
        ['ROLE_DSD_ADMIN', 'ROLE_ADMIN', "ROLE_DSD_REPORT"].some((it) => it === item),
      ) || false,

    canAcessStockControlMenuItem:
      currentUser?.authorities.some((item) =>
        ['ROLE_DSD_ADMIN', 'ROLE_WAREHOUSE', 'ROLE_ADMIN', "ROLE_DSD_REPORT", "ROLE_MPU_ADMIN"].some((it) => it === item),
      ) || false,

    canAccessSettlementMenuItem:
      currentUser?.authorities.some((item) =>
        ['ROLE_CASHIER', 'ROLE_DSD_ADMIN', 'ROLE_ADMIN', "ROLE_MPU_ADMIN"].some((it) => it === item),
      ) || false,

    canAccessARMenuItem:
      currentUser?.authorities.some((item) =>
        ['ROLE_AR', 'ROLE_DSD_ADMIN', 'ROLE_ADMIN', 'ROLE_SALE_INDIVIDUAL', "ROLE_DSD_REPORT", "ROLE_MPU_ADMIN"].some((it) => it === item),
      ) || false,

    canAccessTabWarehouse:
      currentUser?.authorities.some((item) => ['ROLE_WAREHOUSE', 'ROLE_ADMIN'].some((it) => it === item)) ||
      false,
    canAccessTabCashier:
      currentUser?.authorities.some((item) => ['ROLE_CASHIER'].some((it) => it === item)) || false,

    canAccessDSD:
      currentUser?.authorities.some((item) =>
        ['ROLE_CASHIER', 'ROLE_WAREHOUSE', 'ROLE_DSD_ADMIN', 'ROLE_ADMIN', "ROLE_MPU_ADMIN"].some(
          (it) => it === item,
        ),
      ) || false,

    canAccessDevLevel:
      currentUser?.authorities.some((item) => ['ROLE_DEVELOPER'].some((it) => it === item)) ||
      false,

    canAccesAllocateSaleView:
      currentUser?.authorities.some((item) =>
        ['ROLE_ADMIN', 'ROLE_SALE_ALLOCATION_PLAN'].some((it) => it === item),
      ) || false,
    /** MPU */

    canAccessViewMpu:
      currentUser?.authorities.some((item) =>
        ['ROLE_MPU_SUPPORT', 'ROLE_MPU_ADMIN', 'ROLE_ADMIN', "ROLE_DSD_ADMIN"].some((it) => it === item),
      ) || false,

    /** Ending Stock Control */

    /** Ticket **/
    canAccessIctMenuItem:
      currentUser?.authorities.some((item) =>
        [
          'ROLE_TICKET_INCIDENT_USER',
          'ROLE_TICKET_INCIDENT_SUPPORT',
          'ROLE_TICKET_INCIDENT_USER_READ',
          'ROLE_TICKET_INCIDENT_ADMIN',
          'ROLE_ADMIN',
          'ROLE_TICKET_INCIDENT_ANALYST',
        ].some((it) => it === item),
      ) || false,

    canCreateIncidentTicket:
      currentUser?.authorities.some((item) =>
        [
          'ROLE_TICKET_INCIDENT_USER',
          'ROLE_TICKET_INCIDENT_ANALYST',
          'ROLE_TICKET_INCIDENT_ADMIN',
        ].some((it) => it === item),
      ) || false,
    isAnalystIncidentTicket:
      currentUser?.authorities.some((item) =>
        ['ROLE_TICKET_INCIDENT_ANALYST', 'ROLE_TICKET_INCIDENT_ADMIN'].some((it) => it === item),
      ) || false,
    canCleanSolvedIncidentTicket:
      currentUser?.authorities.some((item) =>
        ['ROLE_TICKET_INCIDENT_ADMIN'].some((it) => it === item),
      ) || false,
    canAccessIncidentMenuItem:
      currentUser?.authorities.some((item) =>
        [
          'ROLE_TICKET_INCIDENT_USER',
          'ROLE_TICKET_INCIDENT_SUPPORT',
          'ROLE_TICKET_INCIDENT_USER_READ',
          'ROLE_TICKET_INCIDENT_ADMIN',
          'ROLE_ADMIN',
          'ROLE_TICKET_INCIDENT_ANALYST',
        ].some((it) => it === item),
      ) || false,
    canAccessITRequestFormMenuItem:
      currentUser?.authorities.some((item) =>
        ['ROLE_ADMIN', 'ROLE_ICT_WF_IT_REQUEST_VIEW'].some((it) => it === item),
      ) || false,
    canRequestITRequest:
      currentUser?.authorities.some((item) =>
        ['ROLE_ADMIN', 'ROLE_ICT_WF_IT_REQUEST_REQUESTER'].some((it) => it === item),
      ) || false,
    canAccessITRequestReport:
      currentUser?.authorities.some((item) =>
        ['ROLE_ADMIN', 'ROLE_ICT_WF_IT_REQUEST_REPORT'].some((it) => it === item),
      ) || false,
    canAccessFMANewStaffMenuITem:
      currentUser?.authorities.some((item) =>
        ['ROLE_ADMIN', 'ROLE_FMA_WF_NEW_STAFF_VIEW'].some((it) => it === item),
      ) || false,
    canRequestFMANewStaffRequest:
      currentUser?.authorities.some((item) =>
        ['ROLE_ADMIN', 'ROLE_FMA_WF_NEW_STAFF_REQUESTER'].some((it) => it === item),
      ) || false,

    canAccessITNewStaffMenuITem:
      currentUser?.authorities.some((item) =>
        ['ROLE_ADMIN', 'ROLE_ICT_WF_NEW_STAFF_VIEW'].some((it) => it === item),
      ) || false,
    canRequestITNewStaffRequest:
      currentUser?.authorities.some((item) =>
        ['ROLE_ADMIN', 'ROLE_ICT_WF_NEW_STAFF_REQUESTER'].some((it) => it === item),
      ) || false,

    // Reach-2024-02-13 
    canAccessFleetMenu:
      currentUser?.authorities.some((item) =>
        ['ROLE_FLEET_ADMIN', 'ROLE_FLEET', 'ROLE_ADMIN'].some((it) => it === item),
      ) || false,
    canAccessDMSMenu:
      currentUser?.authorities.some((item) =>
        ['ROLE_ADMIN', 'ROLE_DMS'].some((it) => it === item),
      ) || false,

    canAccessDMSAdminMenu:
      currentUser?.authorities.some((item) =>
        ['ROLE_ADMIN', 'ROLE_DMS_ADMIN'].some((it) => it === item),
      ) || false,
    /**SKH-20231128: Appraisal Form **/
    isAccessHRApprasilSupport:
      currentUser?.authorities.some((item) =>
        ['ROLE_HR_APPRAISAL_SUPPORT', 'ROLE_HR_APPRAISAL_ADMIN'].some((it) => it === item),
      ) || false,
    canAccessAppraisalSubmit:
      currentUser?.authorities.some((item) =>
        ['ROLE_ADMIN', 'ROLE_HR_APPRAISAL_SUBMIT', 'ROLE_HR_APPRAISAL_SUPPORT'].some(
          (it) => it === item,
        ),
      ) || false,
    canAccessAppraisalReaquest:
      currentUser?.authorities.some((item) =>
        ['ROLE_ADMIN', 'ROLE_HR_APPRAISAL_REQUEST'].some((it) => it === item),
      ) || false,
    canAccessNewAppraisalRequest:
      currentUser?.authorities.some((item) =>
        [
          'ROLE_ADMIN',
          'ROLE_HR_APPRAISAL_REQUEST_ADMIN',
          'ROLE_HR_APPRAISAL_REQUEST_STAFF',
          'ROLE_HR_APPRAISAL_REQUEST_MANAGEMENT',
          'ROLE_HR_APPRAISAL_REQUEST_SM_EXECTIVE',
        ].some((it) => it === item),
      ) || false,
    canAccessProbationEvaluation:
      currentUser?.authorities.some((item) =>
        ['ROLE_ADMIN', 'ROLE_HR_PROBATION_EVALUATION_REQUESTER', 'ROLE_HR_PROBATION_EVALUATION_SUBMIT', 'ROLE_HR_PROBATION_EVALUATION_SUPPORT', 'ROLE_HR_PROBATION_EVALUATION_VIEW'].some(
          (it) => it === item,
        ),
      ) || false,
    canAccessWhmMenu:
      currentUser?.authorities.some((item) =>
        [
          'ROLE_ADMIN',
          'ROLE_NCM_INVENTORY_TRANSFER_SUPPORT',
          'ROLE_NCM_STOCK_REQUEST_SUPPORT',
          'ROLE_NCM_INVENTORY_ITEM_ADMIN',
          'ROLE_NCM_INVENTORY_WH_EMP_MAPPING_ADMIN',
          'ROLE_NCM_STOCK_REQUEST',
          'ROLE_NCM_INVENTORY_TRANSFER_REQUEST',
          'ROLE_NCM_INVENTORY_ADJUSTMENT_REQUEST'
        ].some((it) => it === item),
      ) || false,
    canAccessNcmIssueRequestMenu:
      currentUser?.authorities.some((item) =>
        [
          'ROLE_ADMIN',
          'ROLE_NCM_STOCK_REQUEST',
        ].some((it) => it === item),
      ) || false,
    canAccessWhmItemMenu:
      currentUser?.authorities.some((item) =>
        [
          'ROLE_ADMIN',
          // 'ROLE_NCM_INVENTORY_TRANSFER_SUPPORT',
          // 'ROLE_NCM_STOCK_REQUEST_SUPPORT',
          // 'ROLE_NCM_STOCK_REQUEST_ADMIN',
          'ROLE_NCM_INVENTORY_ITEM_ADMIN'
        ].some((it) => it === item),
      ) || false,
    canAccessWhmEmpMappingMenu:
      currentUser?.authorities.some((item) =>
        [
          'ROLE_ADMIN',
          // 'ROLE_NCM_INVENTORY_TRANSFER_SUPPORT',
          'ROLE_NCM_INVENTORY_WH_EMP_MAPPING_ADMIN',
        ].some((it) => it === item),
      ) || false,
    canAccessWhmInventoryTransferRequestMenu:
      currentUser?.authorities.some((item) =>
        [
          'ROLE_ADMIN',
          'ROLE_NCM_INVENTORY_TRANSFER_REQUEST',
        ].some((it) => it === item),
      ) || false,
    canAccessWhmInventoryAdjRequestMenu:
      currentUser?.authorities.some((item) =>
        [
          'ROLE_ADMIN',
          'ROLE_NCM_INVENTORY_ADJUSTMENT_REQUEST',
        ].some((it) => it === item),
      ) || false,
    canCreateNCMRequest:
      currentUser?.authorities.some((item) => ['ROLE_ADMIN', 'ROLE_NCM_STOCK_REQUEST'].some((it) => it === item)) ||
      false,
    canCreateInventoryTransferRequest:
      currentUser?.authorities.some((item) => ['ROLE_ADMIN', 'ROLE_NCM_INVENTORY_TRANSFER_REQUEST'].some((it) => it === item)) ||
      false,
    canPostedInventoryTransferSAP:
      currentUser?.authorities.some((item) => ['ROLE_ADMIN', 'ROLE_NCM_INVENTORY_TRANSFER_SUPPORT'].some((it) => it === item)) ||
      false,
    canCreateInventoryAdjRequest:
      currentUser?.authorities.some((item) => ['ROLE_ADMIN', 'ROLE_NCM_INVENTORY_ADJUSTMENT_REQUEST'].some((it) => it === item)) ||
      false,
    canCreateHrProbationEvaluationRequest:
      currentUser?.authorities.some((item) => ['ROLE_ADMIN', 'ROLE_HR_PROBATION_EVALUATION_REQUEST'].some((it) => it === item)) ||
      false,
    isAccessHRProbationEvaluationSupport:
      currentUser?.authorities.some((item) =>
        ['ROLE_ADMIN', 'ROLE_HR_PROBATION_EVALUATION_SUBMIT', 'ROLE_HR_PROBATION_EVALUATION_SUPPORT'].some((it) => it === item),
      ) || false,
    isAccessNCMExportReport:
      currentUser?.authorities.some((item) =>
        ['ROLE_ADMIN', 'ROLE_NCM_EXPORT_REPORT'].some((it) => it === item),
      ) || false,
    isAccessPerformanceReviewImportExport:
      currentUser?.authorities.some((item) =>
        ['ROLE_ADMIN', 'ROLE_HR_APPRAISAL_REVIEW_IMPORT_EXPORT'].some((it) => it === item),
      ) || false,
    isAccessHrAppraisalAllowSubmitPartial:
      currentUser?.authorities.some((item) =>
        ['ROLE_ADMIN', 'ROLE_HR_APPRAISAL_ALLOW_SUBMIT_PARTIAL'].some((it) => it === item),
      ) || false,
    isAccessNCMRequestCriteriaExportReport:
      currentUser?.authorities.some((item) =>
        ['ROLE_ADMIN', 'ROLE_NCM_REQUEST_CRITERIA_EXPORT_REPORT'].some((it) => it === item),
      ) || false,
    canAccessNCMStoctRequestSalAdmin:
      currentUser?.authorities.some((item) =>
        ['ROLE_ADMIN', 'ROLE_NCM_STOCK_REQUEST_SAL_ADMIN'].some((it) => it === item),
      ) || false,
    canAccessGratisConfig:
      currentUser?.authorities.some((item) =>
        ['ROLE_ADMIN', 'ROLE_CRM_GRATIS_CONFIG'].some(
          (it) => it === item,
        ),
      ) || false,
    canAccessHRProbationEvaluationExportReport:
      currentUser?.authorities.some((item) =>
        ['ROLE_ADMIN', 'ROLE_HR_PROBATION_EVALUATION_EXPORT_REPORT'].some((it) => it === item),
      ) || false,
    canAccessCrmRegisterCustomerMenuItem:
      currentUser?.authorities.some((item) =>
        [
          'ROLE_CRM_REGISTER_CUSTOMER',
          'ROLE_ADMIN',
        ].some((it) => it === item),
      ) || false,
    /* LH: PURCHASE ORDER MMA  */
    canAccessRSMRequestToMPU:
      currentUser?.authorities.some((item) =>
        [
          'ROLE_SALE_ADMIN',
          'ROLE_SALE_ADMIN',
          'ROLE_MPU_LEADER',
          'ROLE_ACTIVATION_LEADER',
          'ROLE_CASHIER',
          'ROLE_CRM_ADMIN',
          'ROLE_CRM_SALE_ADMIN',
          'ROLE_DEVELOPER',
          'ROLE_MPU',
          'ROLE_RETAILER_APP',
          'ROLE_SALESPERSON',
          'ROLE_VAN_SALE_LEADER',
          'ROLE_VAN_SALES',
          'ROLE_WHAREHOUSE',
        ].some((it) => it === item),
      ) || false,

    canCreateEditMpuRequest: true,
    /* LH : END */

  };
}
