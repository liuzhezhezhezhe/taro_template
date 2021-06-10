import React, { useState, useEffect } from 'react';
import { IResponse, IListParams, IListResponse } from '@/types/index.d';
import { RequestTask } from '@tarojs/taro';
import { isNumber } from 'lodash';


/**
 * 请求数据列表内容
 * @param {T[]} oldList 旧数据列表
 * @param {IListParams} params 参数列表
 * @param {(params: IListParams) => RequestTask<IResponse<IListResponse<T>>>} getList 获取列表数据的api
 * @param {React.Dispatch<React.SetStateAction<T[]>>} setList 更新list列表
 * @param {(hasData: boolean) => void} setHasData 更新加载更多显示
 */
async function fetchList<T>(
  oldList: T[],
  params: IListParams,
  getList: (params: IListParams) => RequestTask<IResponse<IListResponse<T>>>,
  setList: React.Dispatch<React.SetStateAction<T[]>>,
  setHasData: (hasData: boolean) => void,
  setTotal: (total: number) => void
) {
  try {
    const { data } = await getList(params);
    const { data: res } = data;
    if (res && isNumber(res.total)) {
      console.log(res.total);

      setTotal(res.total);
    }
    // 拼接列表
    setList([
      ...oldList,
      ...res.records
    ]);
    if (res.records.length === 0 || res.records.length < params.size) {
      /**
       * 如果返回的列表长度为0，则表示没有多余数据可以加载
       * hasData设置为false，并直接返回
       */
      setHasData(false);
      return;
    }
  } catch (error) {
  }
}

/**
 * 获取列表的封装
 * @param {{name: string, [key: string]: any}} payload 列表相关参数(page, size除外)
 * @param {(params: IListParams) => RequestTask<IResponse<IListResponse<T>>>} getList 获取列表的api函数
 * @returns {list, hasData, handlePageUp} {数据列表，是否还有数据,滑动到哪更新数据}
 */
export default function useFetchList<T>(
  payload: { name?: string, [key: string]: any },
  getList: (params: IListParams) => RequestTask<IResponse<IListResponse<T>>>
) {
  // 校园动态列表
  const [list, setList] = useState<T[]>([]);
  const [total, setTotal] = useState<number>(0);
  // 是否还有数据，有数据才继续下拉获取更多数据
  const [hasData, setHasData] = useState<boolean>(true);
  // 请求参数
  const [params, setParams] = useState<IListParams>({
    page: 1,
    size: 20,
    ...payload
  });
  /**
   * 当params发生变化后，获取列表数据
   * ist只是老数据，下拉加载更多时拼接新数据使用
   */
  useEffect(() => {
    fetchList(list, params, getList, setList, setHasData, setTotal);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);
  // 刷新数据，交给组件去处理
  function handleRefresh() {
    // 滑到底后，再请求，要确保搜索后也能下拉加载更多
    setHasData(true);
    // 清空列表数据
    setList([]);
    // 改变请求参数
    setParams({
      page: 1,
      size: 20,
      ...payload,
    });
  }
  // 当下拉到底时触发的函数，控制权交给组件去处理
  function handlePageUp() {
    const { page, size } = params;
    /**
     * 因为每次下拉到底都会触发，但不需要每次下拉到底都请求数据
     * 所以用hasData标示，到底后，就不需要再请求数据了
     */
    if (hasData) {
      setParams({
        page: page + 1,
        size,
        ...payload,
      });
    }
  }
  return { list, total, hasData, handlePageUp, handleRefresh, setList };
}
