import { Image, View, Text } from '@tarojs/components';
import React, { useEffect, useState } from 'react';

import './index.scss';

/**
 * 多选输入框内容的数据定义
 * @param {string} key key
 * @param {string} value 内容
 */
export interface IMultipleInput {
  key: string;
  value: string
}
export interface ICheckBoxProps {
  type: 'checkbox' | 'radio'
  options: string
  onChange: (val: string[]) => void
  className?: string
}

const Index: React.FC<ICheckBoxProps> = (props) => {
  const [options, setOptions] = useState<IMultipleInput[]>([]);
  const [checkedList, setCheckedList] = useState<string[]>([]);
  useEffect(() => {
    if (props.options === '') {
      setOptions([]);
    } else {
      try {
        // 可能因为是其他类型转过来的，这里解析就会有错，需要清除掉重新设置
        const temp = JSON.parse(props.options) as IMultipleInput[];
        setOptions(temp);
      } catch (error) {
        setOptions([]);
      }
    }
  }, [props.options]);
  useEffect(() => {
    props.onChange(options.filter(item => checkedList.includes(item.key)).map(item => item.value));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkedList]);
  return <View
    className='xst-checkbox-container'
  >
    {options.map(item => <View
      className={`xst-checkbox-item ${checkedList.includes(item.key) && 'xst-checkbox-item-active'}`}
      key={item.key}
      onClick={() => {
        if (checkedList.includes(item.key)) {
          if (props.type === 'radio') {
            setCheckedList([]);
          } else {
            setCheckedList(checkedList.filter(key => key !== item.key));
          }
        } else {
          if (props.type === 'radio') {
            setCheckedList([item.key]);
          } else {
            setCheckedList([...checkedList, item.key]);
          }
        }
      }}
    >
      {checkedList.includes(item.key) ?
        <Image key='checked' src='/assets/image/icon/other/checked.png' /> :
        <Image key='unchecked' src='/assets/image/icon/other/unchecked.png' />
      }
      <Text>{item.value}</Text>
    </View>)}
  </View>;
};

export default Index;
