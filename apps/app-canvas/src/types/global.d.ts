// 全局类型声明文件
import * as React from 'react';

// 修复React类型问题
declare global {
  namespace JSX {
    interface Element extends React.ReactElement<any, any> { }
  }

  namespace React {
    interface ReactElement {
      type: any;
      props: any;
      key: any;
    }
  }
}

export { };