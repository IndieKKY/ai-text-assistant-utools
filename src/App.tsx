import React, {useCallback, useMemo} from 'react'
import {useEventEmitter} from 'ahooks'
import 'react-toastify/dist/ReactToastify.css'
import {ToastContainer} from 'react-toastify'
import {useAppDispatch, useAppSelector} from './hooks/redux'
import {EnvData, setEnvData, setEnvReady, setTemperature} from './redux/envReducer'
import {handleJson} from './util/util'
import {PAGE_MAIN, PAGE_RESULT, PAGE_SETTINGS, STORAGE_ENV} from './const'
import 'tippy.js/dist/tippy.css'
import {cloneDeep} from 'lodash-es'
import Footer from './components/Footer'
import useUtoolsService from './hooks/useUtoolsService'
import Ask from './components/Ask'
import Templates from './components/Templates'
import Settings from './components/Settings'
import Result from './components/Result'
import useKeyService from './hooks/useKeyService'
import {useLocalStorage} from '@kky002/kky-hooks'
import Contact from './components/Contact'

export const EventBusContext = React.createContext<any>(null)

function App() {
  const dispatch = useAppDispatch()
  const envData = useAppSelector(state => state.env.env)
  const page = useAppSelector(state => state.env.page)

  // env数据
  const savedEnvData = useMemo(() => {
    return handleJson(cloneDeep(envData)) as EnvData
  }, [envData])
  const onLoadEnv = useCallback((data?: EnvData) => {
    if (data != null) {
      dispatch(setEnvData(data))
      dispatch(setTemperature(data.temperature??1.0))
    }
    dispatch(setEnvReady())
  }, [dispatch])
  useLocalStorage<EnvData>(import.meta.env.VITE_UTOOLS === 'true'?'utools':'web', STORAGE_ENV, savedEnvData, onLoadEnv)

  // service
  useUtoolsService()
  useKeyService()

  // 事件总线
  const eventBus$ = useEventEmitter()
  eventBus$.useSubscription(async (e: any) => {
    // if (e.type === EVENT_OPEN_EDIT_BOOKMARK) { // 打开编辑书签面板
    //   setEditBookmarkPanelVisible(true)
    //   setEditBookmarkCardId(e.cardId)
    //   setEditBookmarkBookmark(e.bookmark)
    // }
  })

  return (
    <EventBusContext.Provider value={eventBus$}>
      <div>
        {page === PAGE_MAIN && <>
          <Ask/>
          <Templates type='normal'/>
          <Contact/>
        </>}
        {page === PAGE_RESULT && <Result/>}
        {page === PAGE_SETTINGS && <Settings/>}

        {page !== PAGE_SETTINGS && <Footer/>}
        <ToastContainer/>
      </div>
    </EventBusContext.Provider>
  )
}

export default App
