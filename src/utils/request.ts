import { request as wxRequest, RequestTask } from '@tarojs/taro';

interface IRequestTask {
  url: string
  data: any
  timestamp: number
  abort: Function
}

let taskList: IRequestTask[] = [];

function checkHasRequest(url: string) {
  let currentList = taskList.filter(item => item.url === url);
  taskList = taskList.filter(item => item.url !== url);
  if (currentList && currentList.length !== 0) {
    currentList.forEach(item => item.abort());
  }
}

export const request = <T = any, U = any>(option: wxRequest.Option<U>): RequestTask<T> => {
  checkHasRequest(option.url);
  const task = wxRequest<T, U>(option);
  taskList.push({
    url: option.url,
    data: option.data,
    abort: task.abort,
    timestamp: (new Date()).valueOf(),
  });
  task.then(() => {
    taskList = taskList.filter(item => item.url !== option.url);
  });
  return task;
};
