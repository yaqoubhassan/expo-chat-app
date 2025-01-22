/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    subtext: '#888888',
    background: '#fff',
    border: '#DDDDDD',
    // tint: tintColorLight,
    tint: '#32CD32',
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    subtext: '#AAAAAA',
    background: '#151718',
    // tint: tintColorDark,
    tint: '#32CD32',
    icon: '#9BA1A6',
    border: '#333333',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};
