import {useAppDispatch, useAppSelector} from './redux'
import {useEffect} from 'react'
import {setEnvData, setPage, setText} from '../redux/envReducer'
import {PAGE_MAIN} from '../const'
import useOpenai from './useOpenai'
import {findHelpItemByFlows} from '../util/biz_util'
import {flows} from '../base'
import {useDebounceEffect} from 'ahooks'
import {track} from '../util/stats_util'

const useUtoolsService = () => {
  const dispatch = useAppDispatch()
  const {navResult} = useOpenai()
  const temperature = useAppSelector(state => state.env.temperature)
  const page = useAppSelector(state => state.env.page)
  const openaiStatus = useAppSelector(state => state.env.openaiStatus)
  const openaiError = useAppSelector(state => state.env.openaiError)

  useEffect(() => {
    if (window.utools) {
      utools.onPluginEnter(({code, type, payload}) => {
        if (type === 'over') {
          dispatch(setText('' + payload))
        } else {
          dispatch(setText(''))
        }

        const helpItem = findHelpItemByFlows(flows, code.substring('cmd-'.length))
        if (helpItem?.prompt) { // 直接进入结果页面
          navResult(helpItem.prompt, '' + payload)
        } else {
          dispatch(setPage(PAGE_MAIN))
        }

        console.log('用户进入插件应用', code, type, payload)
      })
    }
  }, [dispatch, navResult])

  // 延时更新envData里的temperature
  useDebounceEffect(() => {
    dispatch(setEnvData({
      temperature,
    }))
  }, [temperature], {wait: 1000})

  // stats: page view
  useEffect(() => {
    track('view', {
      v_page: page,
    })
  }, [page])

  // stats: finish
  useEffect(() => {
    if (openaiStatus === 'finish') {
      track('finish', {
        v_has_error: !!openaiError+'',
      })
    }
  }, [openaiStatus, openaiError])
}

export default useUtoolsService
