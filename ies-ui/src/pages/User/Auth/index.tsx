import { endpoint, keycloak } from '@/auth';
import { isOffline } from '@/pages/utils';
import { queryCurrent } from '@/services/user';
import { history, useAccess, useModel, useSearchParams } from '@umijs/max';
import { Spin } from 'antd';
import { useEffect } from 'react';

export default () => {
  const { initialState, setInitialState } = useModel('@@initialState');
  const [searchParams] = useSearchParams();
  const access = useAccess();

  const auth = async () => {
    const ck = await keycloak();
    try {
      if (isOffline()) {
        return undefined;
      }
      const currentUser = await queryCurrent();
      if (currentUser)
        setInitialState({
          ...initialState,
          currentUser: currentUser,
          logout: () => {
            ck?.clearToken();
            ck?.logout({
              redirectUri: endpoint().redirectUri,
            });
          },
        });
    } catch (error) {
      return undefined;
    }
  };
  useEffect(() => {
    auth();
  }, []);

  useEffect(() => {
    console.log(initialState?.currentUser);

    if (initialState?.currentUser) {
      const redirect = searchParams.get('path');
      if (redirect == '/') {
        if (access.canAccessTaskListMenu) {
          history.push('/task-list');
        } else if (access.canAccessCrmMenuItem) {
          history.push('/crm');
        } else if (access.canAccessProMenuItem) {
          history.push('/pro');
        } else if (access.canAccesDeliveyMenu) {
          history.push('/delivery');
        } else if (access.canAccessDeliveryExpenseMenu) {
          history.push('/expense/delivery');
        } else if (access.canAccessFleetMenu) {
          history.push('/fleet');
        }
        return;
      }
      history.push(`${redirect}`);
    }
  }, [initialState?.currentUser]);

  return <div>{initialState?.loading && <Spin spinning={true} />}</div>;
};
