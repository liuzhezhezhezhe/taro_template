import React, { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { View, Image, Button } from '@tarojs/components';
import { IFileItem } from '@/types/index.d';

import './index.scss';

/**
 * 点击删除文件后，取消展示
 * @param {ITempFile} item 要删除的文件对象
 * @param {IFileItem[]} files 已经存在的文件列表
 * @param {(f: IFileItem[]) => void} setFiles 设置文件列表
 */
function handleDeleteFile(
  item: IFileItem,
  files: IFileItem[],
  setFiles: (f: IFileItem[]) => void,
) {
  // 对比url，相同就把该文件删除
  const targetPath = item.url;
  const paths = files.filter(t => t.url !== targetPath);
  setFiles(paths);
}

/**
 * 当点击文件选择时调用
 * 根据不同的类型，弹窗后可选择不同的文件
 * @param {'image' | 'video' | 'file'} type 文件类型
 * @param {number} count 总数量控制
 * @param {IFileItem[]} files 文件列表
 * @param {(f: IFileItem[]) => void} setFiles 设置文件列表
 */
function handleChooseFile(
  type: 'image' | 'video' | 'file',
  count: number,
  files: IFileItem[],
  setFiles: (f: IFileItem[]) => void,
) {
  // 获取剩余可选择的文件长度，如果已经没有可选文件了，直接返回
  const len = count - files.length;
  if (len <= 0) {
    return;
  }
  // 匹配文件类型，调用系统接口，弹出来不同的窗口，并做一些限制
  switch (type) {
    case 'image': ;
    case 'video': {
      // FIXME: 被逼无奈调用微信原生方法，Taro后面如果修复了这个bug再改回来
      wx.chooseMedia({
        count: len,
        mediaType: [type],
        success: (res) => {
          const { tempFiles } = res;
          console.log(tempFiles);
          if (type === 'image') {
            const images = tempFiles.map(item => ({ url: item.tempFilePath, preUrl: item.tempFilePath }));
            setFiles([...files, ...images]);
          } else {
            const images = tempFiles.map(item => ({ url: item.tempFilePath, preUrl: item.thumbTempFilePath }));
            setFiles([...files, ...images]);
          }
        }
      });
    } break;
    case 'file': {
      Taro.chooseMessageFile({
        count: len,
        type: 'file',
        success: (res) => {
          const { tempFiles: taroTemp } = res;
          // TODO: 这个文件icon有点丑，后续会换掉
          const file = taroTemp.map(item => ({ url: item.path, preUrl: '/assets/image/icon/other/file.png' }));
          setFiles([...files, ...file]);
        }
      });
    } break;
  }
}

/**
 * 文件选择所需的props
 * @param {'image' | 'video' | 'file'} type 文件类型
 * @param {number} count 文件总数(不超过6个，超过6个按6个计算
 * @param {(val: IFileItem[]) => void} onChange 当文件改变时调用，同步更新父组件中的内容
 * @param {string?} className 文件样式需要特殊化处理时传进来的样式参数
 */
export interface IFilePickerProps {
  type: 'image' | 'video' | 'file'
  count: number
  onChange: (val: IFileItem[]) => void
  className?: string
}

/**
 * 文件上传逻辑/样式组件
 */
const Index: React.FC<IFilePickerProps> = (props) => {
  // 文件数量最多只能有6个
  let len = props.count;
  if (len > 6) {
    len = 6;
  }
  // 文件列表
  const [files, setFiles] = useState<IFileItem[]>([]);
  // 当文件改变时，调用onChange同步更细父组件的文件列表
  useEffect(() => {
    props.onChange(files);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);
  return <View
    className={`xst-file-picker ${props.className || ''}`}
  >
    {/* 展示列表就行 */}
    {files.map((item, index) => <View
      key={index}
      className='xst-file-picker-container'
    >
      {/* 在图片右上角的删除按钮 */}
      <Button
        className='xst-file-picker-delete'
        onClick={() => handleDeleteFile(item, files, setFiles)}
      >x</Button>
      <Image
        className='xst-file-picker-item'
        src={item.preUrl}
        onClick={() => {
          const medias = files.map(f => ({
            url: f.url,
            type: props.type,
            poster: f.preUrl
          }));
          wx.previewMedia({
            sources: medias,
            current: index
          });
        }}
      />
    </View>)}
    {/* 如果超过了6个文件，就不再展示文件选择按钮 */}
    {files.length >= len ? null :
      <View className='xst-file-picker-container'>
      <Image
        className='xst-file-picker-item'
        src='/assets/image/icon/other/picker.png'
        onClick={() => handleChooseFile(props.type, len, files, setFiles)}
      />
      </View>
    }
  </View>;
};

export default Index;
