import React, { Component } from 'react';
import Taro from '@tarojs/taro';
import { Provider } from 'mobx-react';

import navbar from '@/store/navbar';

import './app.scss';

const store = {
  navbar
};

class App extends Component {
  componentDidMount() { }

  componentDidShow() {
    const { statusBarHeight, platform } = Taro.getSystemInfoSync();
    const { top, height } = Taro.getMenuButtonBoundingClientRect();

    // 状态栏高度
    navbar.setStatusBarHeight(statusBarHeight);
    navbar.setMenuButtonHeight(height ? height : 32);

    // 判断胶囊按钮信息是否成功获取
    if (top && top !== 0 && height && height !== 0) {
      const navigationBarHeight = (top - statusBarHeight) * 2 + height;
      // 导航栏高度
      navbar.setNavigationBarHeight(navigationBarHeight);
    } else {
      navbar.setNavigationBarHeight(
        platform === 'android' ? 48 : 40
      );
    }
  }

  componentDidHide() { }

  componentDidCatchError() { }

  // this.props.children 就是要渲染的页面
  render() {
    return (
      <Provider store={store}>
        {this.props.children}
      </Provider>
    );
  }
}

export default App;
