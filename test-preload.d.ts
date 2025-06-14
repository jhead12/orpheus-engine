import React from 'react';
import ReactDOM from 'react-dom';

export const reactHooks: {
  useState: typeof React.useState;
  useEffect: typeof React.useEffect;
  useRef: typeof React.useRef;
  useCallback: typeof React.useCallback;
  useMemo: typeof React.useMemo;
  useContext: typeof React.useContext;
  useReducer: typeof React.useReducer;
  useLayoutEffect: typeof React.useLayoutEffect;
};

export { React, ReactDOM };
