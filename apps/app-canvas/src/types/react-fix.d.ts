import * as React from 'react';

declare module 'react' {
  // 扩展React.ReactNode类型定义，解决类型不兼容问题
  type ReactNode =
    | React.ReactElement
    | string
    | number
    | boolean
    | null
    | undefined
    | React.ReactNodeArray
    | React.ReactPortal
    | React.ReactFragment;

  // 修复ReactElement和ReactPortal之间的类型兼容问题
  interface ReactElement {
    children?: ReactNode;
  }
}