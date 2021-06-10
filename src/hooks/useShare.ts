import Taro, { useShareAppMessage, useShareTimeline } from '@tarojs/taro';

/**
 * 分享
 * @param title 分享的内容标题
 */
export function useShare(title: string) {
  Taro.showShareMenu({
    withShareTicket: true
  });
  useShareAppMessage(() => {
    return {
      title
    };
  });
  useShareTimeline(() => {
    return {
      title
    };
  });
}
