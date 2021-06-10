/**
 * 对内容进行高亮处理
 * @param data 要高亮的数据
 * @param matches 要高亮的内容区域组成的数组
 * @param start 高亮的内容开始区域
 * @param end 高亮的内容结束区域
 * @param wapperRender 目标内容渲染函数
 */
function hightlightContent(
  data: string,
  matches: { start: number, length: number }[],
  start: number,
  end: number,
  wapperRender: HightlightWapperRender
) {
  /**
   * 因为matches中有很多重叠部分，因此需要先将重叠部分合并
   */
  // 由于matches的内容时(start,length)格式组成，需要转化为(start,end)的形式，方便计算
  const interval = new Array<{
    start: number
    end: number
  }>();
  for (const item of matches) {
    const startIndex = item.start;
    const endIndex = startIndex + item.length;
    interval.push({
      start: startIndex,
      end: endIndex
    });
  }
  // 将重叠区间合并
  let mergedMatches: typeof interval = [];
  if (interval.length !== 0) {
    // 防止什么都没搜到的情况
    const lastInterval = interval.reduce((prev, next) => {
      if (next.start > prev.start && next.start <= prev.end) {
        // 两个区间有交集，将他们两个合并在一起，并返回作为下一个的标志
        return {
          start: prev.start,
          end: next.end
        };
      }
      // 没有交际，则保存上一个内容，并返回下一个
      mergedMatches.push(prev);
      return next;
    });
    mergedMatches.push(lastInterval);
  } else {
    mergedMatches.push(...interval);
  }
  /**
   * 已经获取到无交集的关键字列表
   * 开始切分拼装字符串
   * 需要从后往前切，因为从前往后切分拼装，会打乱原有关键字位置顺序
   * 直接将end后面的部分截掉，因为已经没用了
   */
  let temp = data.slice(0, end + 1);
  mergedMatches.reverse();
  let startPos = 0;
  for (const item of mergedMatches) {
    const startIndex = item.start;
    const endIndex = item.end;
    // 截取为三部分，中间那部分两边增加样式，其他部分不变，最后拼接
    const preContent = temp.slice(0, startIndex);
    const midContent = temp.slice(startIndex, endIndex + 1);
    const subContent = temp.slice(endIndex + 1);
    temp = preContent + wapperRender(midContent) + subContent;
    startPos = preContent.length - 1;
  }
  // 可能出现改变结构后，start刚好在标签里面的情况
  // 同时规避startPos小于0的情况
  if (startPos < 0) {
    startPos = 0;
  }
  let cutStartPos = 0;
  if (startPos < start) cutStartPos = startPos;
  else cutStartPos = start;
  const content = temp.slice(cutStartPos);
  if (data.length < 87) {
    return content;
  }
  return `${content}...`;
}

/**
 * 寻找匹配最多的子串
 * @param data 数据
 * @param matches 匹配内容下表及长度的列表
 */
function findMostMatchInterval(
  data: string,
  matches: { start: number, length: number }[]
) {
  const maxLen = 71;
  let matchRecord = {
    start: 0,
    end: 0,
    matchedIndex: new Array<number>(),
    maxMatchedNum: 0
  };
  for (let i = 0; i < matches.length; i++) {
    const outter = matches[i];
    // 创造一个区间范围
    let start = outter.start;
    let end = start + maxLen;
    // 超出了给定字符最大长度。则区间上界定位最后一个字符的位置
    if (end > data.length) end = data.length - 1;
    // 初始化匹配到的内容数量为1(因为是匹配列表，只要进来，说明至少有一个匹配到了)
    let matchedNum = 1;
    // 初始化匹配到的字符位置为i(因为是匹配列表，只要进来，说明至少这个匹配到了)
    let matchedIndex = [i];
    /**
     * 因为matches是按照start升序排列，i之后的start必定比i的start大
     * 所以matches[i](即start)就是这个区间的下界
     * 因此只需要找到区间的上界即可
     */
    for (let j = i + 1; j < matches.length; j++) {
      const inner = matches[j];
      /**
       * 如果start比上界要大
       * 则说明下一个start只可能比当前区间的上界大
       * 因此就不用再继续匹配了
       */
      if (inner.start >= end) break;
      // 内层循环中，如果start比上界要小，就说明该子串可以在区间内匹配到
      matchedIndex.push(j);
      matchedNum++;
    }
    if (matchedNum > matchRecord.maxMatchedNum) {
      matchRecord.maxMatchedNum = matchedNum;
      matchRecord.matchedIndex = [...matchedIndex];
      matchRecord.start = start;
      matchRecord.end = end;
    }
    /**
     * 如果end的位置等于最后一个字符的位置
     * 则说明剩下的字符中包含目标子串数量只可能比现在要少
     * 就没有必要继续匹配
     */
    if (end === (data.length - 1)) break;
  }
  return matchRecord;
}

/**
 * 对匹配好的内容进行扩展，让内容更完整
 * @param data 数据
 * @param matches 匹配内容
 * @param matchRecord 需要扩展的内容数据结构
 */
function expandInterval(
  data: string,
  matches: { start: number, length: number }[],
  matchRecord: { start: number, end: number, matchedIndex: number[], maxMatchedNum: number }
) {
  // 对子串进行扩展，让子串尽可能显示为一句完整的话
  /**
   * 向前扩展
   * 尽可能先让文字的头部完整
   * 由于之前的匹配规则，子串的第一个字符肯定为匹配到内容的第一个字符
   * 因此前向扩展则寻找遇到的第一个标点符号
   */
  // 除闭合之外的标点符号正则
  // [\u2026|\u2014|\uff5e|\ufe4f|\uff0c|\u3002|\uff1f|\uff01|\uff1a|\uff1b|\p{Z}]
  // 以汉字结尾的正则表达式
  // const reg = new RegExp('.*(?<![\u4e00-\u9fa5])', 'g');
  // 连续汉字前面跟着一个符号的表达式
  // const reg = /.*(?<![\u4e00-\u9fa5])/ug;
  const reg = /[\u2026|\u2014|\uff5e|\ufe4f|\uff0c|\u3002|\uff1f|\uff01|\uff1a|\uff1b|\p{Z}]/ug;
  /**
   * 在字符的开始到子串的上界之间找第一个标点符号
   * 找到之后，需要验证标点符号与上界之间是否有匹配内容
   * 如果有，记录下标记
   */
  const end = matchRecord.start;
  // 字符串反转之后找第一个匹配到的标点符号(不能用断言，只能这么干了)
  const temp = data.slice(0, end);
  reg.exec(temp.split('').reverse().join(''));
  const punctuationIndex = temp.length - reg.lastIndex + 1;
  // 先往前截取23个，后面会再修改
  const start = end - 27;
  matchRecord.start = start > 0 ? start : 0;
  // 计算匹配到内容与子串下界之间距离
  const len = end - punctuationIndex;
  if (punctuationIndex >= 0 && len < 27) {
    // 如果距离比30小，就更新到标点符号的位置
    matchRecord.start = punctuationIndex;
  }
  /**
   * matchRecord.start到matchRecord[0].start之间可能还有匹配到的内容
   * 因此向前遍历matches，直到matches[i].start小于matchRecord.start
   * 将索引内容添加进去
   */
  let firstMatchedIndex = matchRecord.matchedIndex[0];
  if (firstMatchedIndex !== 0) {
    let i = 1;
    while (firstMatchedIndex - i >= 0 && matches[firstMatchedIndex - i].start > matchRecord.start) {
      matchRecord.matchedIndex.unshift(firstMatchedIndex - i);
      i++;
    }
  }
  /**
   * 向后扩展
   * 后面不完整不影响阅读
   * 因此只需要保证向后扩展时，只需要保证最后一个匹配字符位置的完整性即可
   */
  let lastMatchedIndex = matchRecord.matchedIndex[matchRecord.matchedIndex.length - 1];
  const lastMatched = matches[lastMatchedIndex];
  /**
   * 最后一个匹配的位置加上长度如果比要截断的字符串最后的位置长
   * 则将要截断的字符串的位置更新
   */
  if ((lastMatched.start + lastMatched.length) > matchRecord.end) {
    matchRecord.end = lastMatched.start + lastMatched.length;
  }
}

/**
 * 寻找最优数据高亮范围，让高亮的内容显示得尽可能多
 * @param data 数据
 * @param matches 匹配到的数据内容
 */
function findBestInterval(
  data: string,
  matches: { start: number, length: number }[]
) {
  let matchRecord = findMostMatchInterval(data, matches);
  expandInterval(data, matches, matchRecord);
  return matchRecord;
}

/**
 * 可以自定义高亮函数
 */
export type HightlightWapperRender =  (target: string) => string;

/**
 * 默认的高亮函数
 * @param target 要高亮的内容
 */
function hightlightWapperRender(target: string) {
  return `<em style="font-style:normal;color:red;">${target}</em>`;
}

/**
 * 渲染数据
 * @param data 原始数据
 * @param matches 匹配到的数据内容
 * @param targetRender 目标内容渲染函数
 */
export default function renderContent(
  data: string,
  matches: { start: number, length: number }[],
  targetRender: HightlightWapperRender = hightlightWapperRender
) {
  if (data.length < 87) {
    // 如果字符长度小于87，直接做高亮处理即可
    return hightlightContent(data, matches, 0, data.length - 1, targetRender);
  }
  if (matches.length === 0) {
    // 如果没有匹配到内容，需要将内容截取到一个合适的长度显示
    return `${data.slice(0, 87)}...`;
  }
  const bestInterval = findBestInterval(data, matches);
  // 抽出来要渲染的区间，交给渲染函数取渲染
  const interval = bestInterval.matchedIndex.map(index => matches[index]);
  return hightlightContent(data, interval, bestInterval.start, bestInterval.end, targetRender);
}
