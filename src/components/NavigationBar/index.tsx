import React from "react";

import { View } from "@tarojs/components";
import { useLocalStore, useObserver } from "mobx-react-lite";

import navbarStore from "@/store/navbar";

import './index.scss';

/**
 * 导航栏
 */
const Index: React.FC<{}> = () => {
  const navbar = useLocalStore(() => navbarStore);
  const { navigationBarHeight, statusBarHeight, menuButtonHeight } = navbar;
  const navigationBarAndStatusBarHeight = statusBarHeight + navigationBarHeight;
  return useObserver(() => (
    <View
      className='navigation-container'
      style={{
        height: `${navigationBarAndStatusBarHeight}px`,
      }}
    >
      {/* 空出来statusBar的距离 */}
      <View
        style={{
          height: `${statusBarHeight}px`,
        }}
      />
      <View
        className='navigation-bar'
        style={{
          height: `${navigationBarHeight}px`,
        }}
      >
        <View
          className='navigation-main'
          style={{
            height: `${menuButtonHeight}`,
          }}
        >
          自定义导航栏
        </View>
      </View>
    </View>
  ));
};

export default Index;
