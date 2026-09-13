import { kc } from '@/auth';
import { useCallback, useState } from 'react';

const useHttpLookup = <T>(url: string, initData: T[] = [], limit: number = 10) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<T[]>(initData);

  var lastUserFetchId = 0;
  const loadData = useCallback((value: string) => {

    lastUserFetchId += 1;
    const fetchId = lastUserFetchId;
    setLoading(true);

    const token = localStorage.getItem("accessToken")
    fetch(encodeURI(`${url}/value/${value || ' '}/limit/${limit}`), {
      headers: token ? {
        'Authorization': `Bearer ${token}`
      } : {}
    })

      .then(response => response.json())
      .then(data => {
        if (fetchId !== lastUserFetchId) {
          return;
        }
        setData(data || []);
        setLoading(false);
      })
      .catch(_ => {
        setData([]);
        setLoading(false);
      });
  },
    [data],
  )

  const clearData = useCallback(() => {
    setData([]);
    setLoading(false);
  }, []);
  return {
    loading: loading,
    data: data,
    load: loadData,
    clear: clearData,
  };
};

export default useHttpLookup;
