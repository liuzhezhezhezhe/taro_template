import React from 'react';

import { View } from '@tarojs/components';

import Navbar from '@/components/NavigationBar';

/**
 * 首页内容
 */
const Index: React.FC<{}> = () => {
  return <View className='container'>
    <Navbar />
    你好首页
  </View>;
};

export default Index;
