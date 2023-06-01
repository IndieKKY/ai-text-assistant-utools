import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.less'
import store from './store'
import {Provider} from 'react-redux'
import Router from './Router'
import {APP_DOM_ID} from './const'

ReactDOM.createRoot(document.getElementById(APP_DOM_ID) as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <Router/>
    </Provider>
  </React.StrictMode>
)
