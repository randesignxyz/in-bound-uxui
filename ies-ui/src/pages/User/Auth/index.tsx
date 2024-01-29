import { history, useAccess, useModel } from '@umijs/max';
import { Spin } from "antd";
import { useEffect } from "react";

export default () => {

  const { initialState } = useModel('@@initialState');
  const access = useAccess()

  // const auth = async () => {
  //   await keycloak()
  //   try {
  //     if (isOffline()) {
  //       return undefined;
  //     }
  //     const currentUser = await queryCurrent();
  //     if (currentUser)
  //       setInitialState({
  //         ...initialState, currentUser: currentUser, logout: async () => {
  //           try {
  //             const logout = await kc.logout({
  //               redirectUri: endpoint().redirectUri
  //             })
  //           } catch (error) {
  //             message.error("Failed to logout.")
  //           }
  //         }
  //       })

  //   } catch (error) {
  //     return undefined;
  //   }
  // }
  // useEffect(() => {
  //   auth()
  // }, [])

  useEffect(() => {
    if (initialState?.currentUser) {
      if (access.canAccessTaskListMenu) {
        history.push("task-list")
      } else if (access.canAccessCrmMenuItem) {
        history.push("crm")
      }
      else if (access.canAccessProMenuItem) {
        history.push("pro")
      }
      else if (access.canAccesDeliveyMenu) {
        history.push("delivery")
      }
      else if (access.canAccessDeliveryExpenseMenu) {
        history.push("expense/delivery")
      }
      else if (access.canAccessFleetMenu) {
        history.push("fleet")
      }

    }
  }, [initialState?.currentUser])

  return <div>
    {initialState?.loading && <Spin spinning={true} />}
  </div>

}
