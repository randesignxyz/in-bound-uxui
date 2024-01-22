import CrudWrapper from '@/components/DataCrud/CrudWrapper';
import { Access, useAccess } from 'umi';
import { SalePaths } from '..';
import Create from './Create';
import DetailTeamWork from './Detail';
import Edit from './Edit';
// import StockControlDetail from './Detail';
import TeamWorkList from './List';

export default () => {
  const access = useAccess();
  return (
    <CrudWrapper baseURL={SalePaths.teamWork}>
      {(view, id, navigate) => {
        return (
          (view === 'list' && (
            <TeamWorkList
              actionHandlers={{
                onAdd: navigate?.goToCreate,
                onDetail: navigate?.goToDetail,
              }}
            />
          )) ||
          (view === 'create' && (
            <Access
              accessible={access.canCreateEditStockControl}
              fallback={<div>Unauthorized</div>}
            >
              {' '}
              <Create />{' '}
            </Access>
          )) ||
          (view === 'edit' && (
            <Access
              accessible={access.canCreateEditStockControl}
              fallback={<div>Unauthorized</div>}
            >
              {' '}
              <Edit id={id as number} />{' '}
            </Access>
          )) ||
          (view === 'detail' && (
            <DetailTeamWork
              id={id as number}
              actionHandlers={{
                onBack: navigate?.gotToListHandler,
              }}
            />
          ))
        );
      }}
    </CrudWrapper>
  );
};
