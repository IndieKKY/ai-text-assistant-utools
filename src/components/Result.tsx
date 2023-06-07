import {useAppDispatch, useAppSelector} from '../hooks/redux'
import {
  setEnvData,
  setOpenaiError,
  setOpenaiResponse,
  setOpenaiStatus,
  setPage,
  setQuestion,
  setTemperature,
  setText
} from '../redux/envReducer'
import {PAGE_MAIN} from '../const'
import {useMemoizedFn} from 'ahooks/es'
import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import useOpenai from '../hooks/useOpenai'
import Markdown from './Markdown'
import {toast} from 'react-toastify'
import {AiOutlineCaretRight} from 'react-icons/all'
import classNames from 'classnames'
import {track} from '../util/stats_util'

const Answer = (props: {
  onRefresh: () => void
  onStop: () => void
}) => {
  const {onRefresh, onStop} = props

  const dispatch = useAppDispatch()
  const openaiResponse = useAppSelector(state => state.env.openaiResponse)
  const openaiStatus = useAppSelector(state => state.env.openaiStatus)
  const openaiError = useAppSelector(state => state.env.openaiError)
  const envData = useAppSelector(state => state.env.env)
  const temperature = useAppSelector(state => state.env.temperature)
  const [tempFold, setTempFold] = useState(true)

  const onCopy = useCallback(async () => {
    await navigator.clipboard.writeText(openaiResponse??'')
    toast.success('已复制')

    track('btn', {
      v_action: 'copy',
    })
  }, [openaiResponse])

  const onChangeStream = useCallback((e: any) => {
    dispatch(setEnvData({
      stream: !!e.target.checked
    }))

    track('btn', {
      v_action: 'stream',
    })
  }, [dispatch])

  const onFold = useCallback(() => {
    setTempFold(!tempFold)

    track('btn', {
      v_action: 'creative_fold',
    })
  }, [tempFold])

  return <div>
    <div className='w-full min-h-[40px]'><Markdown content={openaiResponse??''}/></div>
    {openaiStatus === 'finish' && openaiError && <div className='text-xs text-error'>{openaiError}</div>}
    <div className='flex justify-between items-center'>
      <div className='basis-1/4 flex justify-start items-center gap-1'>
        {openaiResponse && <button title='复制' className='btn btn-xs btn-ghost btn-square rounded' onClick={onCopy}>
          <img className='w-4 h-4' src='copy.svg'/>
        </button>}
        {openaiStatus === 'finish' && <button title='重新生成' className='btn btn-xs btn-ghost btn-square rounded' onClick={onRefresh}>
          <img className='w-4 h-4' src='refresh.svg'/>
        </button>}
        {openaiStatus === 'loading' && <button title='停止生成' className='btn btn-xs btn-ghost btn-square rounded' onClick={onStop}>
          <img className='w-[18px] h-[18px]' src='stop.svg'/>
        </button>}
      </div>
      <div className='basis-2/4 flex justify-center items-center'>
        <span title='点击展开/折叠' className='desc flex items-center link link-hover' onClick={onFold}>
          创造性{tempFold && <span>({temperature??1.0})</span>}
          <AiOutlineCaretRight className={classNames('text-base-content/50 transition transition-all', tempFold?'':'rotate-90')}/>
        </span>
        {!tempFold && <div className='ml-2 flex-1 flex flex-col'>
          <input type="range" min="0" max="200" value={(temperature??1)*100} className="range range-info range-xs" onChange={e => {
            dispatch(setTemperature(Number(e.target.value)/100))
          }} />
          <div className="w-full flex justify-between text-xs px-2">
            <span>低</span>
            <span>|</span>
            <span>中</span>
            <span>|</span>
            <span>高</span>
          </div>
        </div>}
        {!tempFold && <span className='ml-1 desc text-xs min-w-[48px] text-center'>{temperature??1.0}</span>}
      </div>
      <div className='basis-1/4 flex justify-end items-center text-sm text-base-content/75'>
        实时输出
        <input type="checkbox" className="toggle toggle-sm toggle-primary" checked={envData.stream} onChange={onChangeStream}/>
      </div>
    </div>
  </div>
}

const Result = () => {
  const dispatch = useAppDispatch()
  const envData = useAppSelector(state => state.env.env)
  const prompt = useAppSelector(state => state.env.prompt)
  const useText = useAppSelector(state => state.env.useText)
  const openaiResponse = useAppSelector(state => state.env.openaiResponse)
  const openaiStatus = useAppSelector(state => state.env.openaiStatus)
  const openaiError = useAppSelector(state => state.env.openaiError)
  const {sendRequest, sendRequestStream, convertParams} = useOpenai()
  const abortControllerRef = useRef<AbortController>()

  const promptFinal = useMemo(() => convertParams(prompt??'', useText), [convertParams, prompt, useText])

  const onBack = useMemoizedFn(() => {
    dispatch(setPage(PAGE_MAIN))

    track('btn', {
      v_action: 'back',
    })
  })

  const onContinue = useMemoizedFn(() => {
    dispatch(setText(openaiResponse??''))
    dispatch(setQuestion())
    dispatch(setPage(PAGE_MAIN))

    track('btn', {
      v_action: 'continue',
    })
  })

  const onRefresh = useCallback(() => {
    if (abortControllerRef.current != null) {
      abortControllerRef.current.abort()
      abortControllerRef.current = undefined
    }
    dispatch(setOpenaiStatus('init'))
    dispatch(setOpenaiResponse())
    dispatch(setOpenaiError())
    toast.info('已重新生成')

    track('btn', {
      v_action: 'refresh',
    })
  }, [dispatch])

  const onStop = useCallback(() => {
    if (abortControllerRef.current != null) {
      abortControllerRef.current.abort()
      abortControllerRef.current = undefined
    }
    dispatch(setOpenaiStatus('finish'))
    toast.info('已停止生成')

    track('btn', {
      v_action: 'stop',
    })
  }, [dispatch])

  // 请求openai
  useEffect(() => {
    if (openaiStatus === 'init' && promptFinal) {
      if (abortControllerRef.current != null) {
        abortControllerRef.current.abort()
        abortControllerRef.current = undefined
      }

      dispatch(setOpenaiStatus('loading'))
      dispatch(setOpenaiResponse(''))
      dispatch(setOpenaiError())

      const ctrl = new AbortController()
      abortControllerRef.current = ctrl
      if (envData.stream) {
        // setTimeout to fix strange bug
        setTimeout(() => {
          sendRequestStream(promptFinal, ctrl).catch(console.error)
        }, 100)
      } else {
        sendRequest(promptFinal, ctrl).then(res => {
          dispatch(setOpenaiStatus('finish'))
          dispatch(setOpenaiResponse(res))
        }).catch(err => {
          dispatch(setOpenaiStatus('finish'))
          dispatch(setOpenaiError(err.message))
        })
      }
    }
  }, [dispatch, envData.stream, openaiStatus, promptFinal, sendRequest, sendRequestStream])

  // 离开页面时取消请求
  useEffect(() => {
    return () => {
      if (abortControllerRef.current != null) {
        abortControllerRef.current.abort()
        abortControllerRef.current = undefined
        console.log('leave page, abort')
      }
    }
  }, [])

  return <div>
    <div className='m-3 shadow-card rounded overflow-hidden flex flex-col'>
      <div className='bg-base-100 flex p-2 gap-2'>
        <div>
          <img className='w-8 h-8 p-0.5' src='personal.svg'/>
        </div>
        <div className='flex-1 whitespace-pre-wrap'>
          {promptFinal}
        </div>
      </div>
      <div className='flex bg-base-200 border-t-base-300 p-2 gap-2'>
        <div>
          <img className='w-8 h-8 bg-white rounded-full p-px' src='openai.svg'/>
        </div>
        <div className='flex-1 relative'>
          <div className='absolute top-1 right-1 select-none'>
            {openaiStatus === 'loading' && <img src='loading.svg'/>}
            {openaiStatus === 'finish' && !openaiError && <img src='success.svg'/>}
            {openaiStatus === 'finish' && openaiError && <img src='error.svg'/>}
          </div>
          <div>
            <Answer onRefresh={onRefresh} onStop={onStop}/>
          </div>
        </div>
      </div>
    </div>
    <div className='flex justify-center gap-2'>
      <div className='btn btn-ghost flex flex-col flex-nowrap gap-1 items-center h-auto py-1' onClick={onBack}>
        <img className='w-10 h-10 rotate-180' src='continue.svg'/>
        <span className='text-sm font-normal' style={{
          color: 'var(--c-light)',
        }}>返回</span>
      </div>
      <div className='btn btn-ghost flex flex-col flex-nowrap gap-1 items-center h-auto py-1' onClick={onContinue}>
        <img className='w-10 h-10' src='continue.svg'/>
        <span className='text-sm font-normal' style={{
          color: 'var(--c-light)',
        }}>继续</span>
      </div>
    </div>
    <div className='text-sm text-center py-3' style={{
      color: 'var(--c-light-md)',
    }}>
      继续时，使用回答作为新的输入内容。<br/>
      创造性越高，每次生成的结果区别越大。
    </div>
  </div>
}

export default Result
