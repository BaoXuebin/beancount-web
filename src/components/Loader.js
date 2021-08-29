import React from 'react';

import './styles/Loader.css';

export default () => (
  // <p>加载中...</p>
  <div style={{ width: '100%' }} className="lds-rolling">
    <div></div>
  </div>
);