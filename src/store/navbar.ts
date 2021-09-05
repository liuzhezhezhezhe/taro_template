import { observable } from "mobx";

const navbar = observable({
  statusBarHeight: 0,
  setStatusBarHeight(height: number) {
    this.statusBarHeight = height;
  },
  menuButtonHeight: 32,
  setMenuButtonHeight(height: number) {
    this.menuButtonHeight = height;
  },
  navigationBarHeight: 48,
  setNavigationBarHeight(height: number) {
    this.navigationBarHeight = height;
  },
});

export default navbar;
