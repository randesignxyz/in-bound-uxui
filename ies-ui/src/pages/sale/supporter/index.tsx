import ListMenuComp, { ListMenuItem } from "@/components/ListMenu";
import { TeamOutlined } from "@ant-design/icons";
import { Divider, MenuProps, message } from "antd";
import { useState, useMemo } from "react";
import POAdjustForm from "./component/POAdjustForm";
import InvoiceCorrectForm from "./component/InvoiceCorrectForm";
import { useAccess } from "@umijs/max";
import { SupporterServiceAPI } from "./services";
import { simpleRequestActions } from "@/services/model";

/* ---------------------------------- */
/* Types                              */
/* ---------------------------------- */
interface Props { }

type ActionType =
  | "PO_ROLLBACK"
  | "PO_CHANGE_ITEM"
  | "INVOICE"
  | undefined;

interface ActionState {
  open: boolean;
  action?: ActionType;
}

/* ---------------------------------- */
/* Component                          */
/* ---------------------------------- */
const Supporter: React.FC<Props> = () => {
  const access = useAccess();
  const requestActions = simpleRequestActions();

  const [actionState, setActionState] = useState<ActionState>({
    open: false,
  });

  /* ---------------------------------- */
  /* Menu helper                        */
  /* ---------------------------------- */
  type MenuItem = Required<MenuProps>["items"][number];

  const getItem = (
    label: React.ReactNode,
    key: React.Key,
    icon?: React.ReactNode
  ): MenuItem => ({
    key,
    icon,
    label,
  });

  /* ---------------------------------- */
  /* Menu click handler                 */
  /* ---------------------------------- */
  const onMenuClick: MenuProps["onClick"] = (info) => {
    switch (info.key) {
      case "PO_ROLLBACK":
      case "PO_CHANGE_ITEM":
      case "INVOICE":
        setActionState({
          open: true,
          action: info.key as ActionType,
        });
        break;

      default:
        message.error("Unsupported action.");
    }
  };

  /* ---------------------------------- */
  /* Action menus                       */
  /* ---------------------------------- */
  const actionMenuPO = useMemo<MenuProps>(() => {
    const items: MenuItem[] = [
      access.can("SALE_SUPPORTER", "PO_ROLLBACK") &&
      getItem("PO Adjustment & Correction", "PO_ROLLBACK", <TeamOutlined />),

      access.can("SALE_SUPPORTER", "PO_CHANGE_ITEM") &&
      getItem("Change Item Price", "PO_CHANGE_ITEM", <TeamOutlined />),

      access.can("SALE_SUPPORTER", "INVOICE_CORRECTION") &&
      getItem("Invoice", "INVOICE", <TeamOutlined />),
    ].filter(Boolean) as MenuItem[];


    return { items, onClick: onMenuClick };
  }, [access]);

  // const actionMenuInvoice = useMemo<MenuProps>(() => {
  //   const items: MenuItem[] = [
  //     access.can("SALE_SUPPORTER", "INVOICE_CORRECTION") &&
  //     getItem("Invoice Correction", "INVOICE_CORRECTION", <TeamOutlined />),
  //   ].filter(Boolean) as MenuItem[];

  //   return { items, onClick: onMenuClick };
  // }, [access]);

  /* ---------------------------------- */
  /* List menu cards                    */
  /* ---------------------------------- */
  const SalePaths = {
    po: "/sale/supporter/po/list",
    invoice: "/sale/supporter/invoice/list",
  };

  const listItems: ListMenuItem[] = useMemo(
    () =>
      [
        access.canAccess("SALE_SUPPORTER") && {
          id: "PO",
          name: "Adjustment & Correction",
          description: "Tools for adjusting, fixing, and updating PO data.",
          menu: actionMenuPO,
          link: SalePaths.po,
        },

        // access.can("SALE_SUPPORTER", "INVOICE_CORRECTION") && {
        //   id: "SaleInvoice",
        //   name: "Invoice Correction",
        //   description: "Update or correct sale invoice data.",
        //   menu: actionMenuInvoice, // ✅ FIXED
        //   link: SalePaths.invoice,
        // },
      ].filter(Boolean) as ListMenuItem[],
    [access, actionMenuPO]
  );

  /* ---------------------------------- */
  /* Render                             */
  /* ---------------------------------- */
  return (
    <>
      {access.canAccess("SALE_SUPPORTER") && <Divider orientation='left' plain >Supporter</Divider>}
      <ListMenuComp items={listItems} />

      {/* PO Modal */}
      <POAdjustForm
        open={
          actionState.open &&
          actionState.action !== "INVOICE"
        }
        actionType={actionState.action}
        onClose={async () => {
          setActionState({ open: false })
        }}
        modalProps={{
          width:
            actionState.action === "PO_ROLLBACK" ? "80%" : "60%",
          onCancel: () => setActionState({ open: false }),
        }}
      />

      {/* Invoice Modal */}
      <InvoiceCorrectForm
        open={
          actionState.open && actionState.action === "INVOICE"
        }
        onClose={() => setActionState({ open: false })}
        actionType={actionState.action}
        modalProps={{
          width: "80%",
          onCancel: () => setActionState({ open: false }),
        }}
      />
    </>
  );
};

export default Supporter;
