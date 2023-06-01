import {useAppDispatch, useAppSelector} from '../hooks/redux'
import {ChangeEvent, useCallback} from 'react'
import {setQuestion, setText} from '../redux/envReducer'
import useOpenai from '../hooks/useOpenai'
import {PROMPT_DEFAULT} from '../const'

const Ask = () => {
  const dispatch = useAppDispatch()
  const envData = useAppSelector(state => state.env.env)
  const text = useAppSelector(state => state.env.text)
  const question = useAppSelector(state => state.env.question)
  const inputting = useAppSelector(state => state.env.inputting)
  const {navResult} = useOpenai()

  const onChangeText = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    dispatch(setText(e.target.value))
  }, [dispatch])

  const onChangeQuestion = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    dispatch(setQuestion(e.target.value))
  }, [dispatch])

  const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    // 有按其他控制键时，不触发
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      return
    }
    // 当前在输入中（如中文输入法）
    if (inputting) {
      return
    }

    if (e.key === 'Enter') {
      navResult(envData.prompt?envData.prompt:PROMPT_DEFAULT)
    }
  }, [envData.prompt, inputting, navResult])

  return <div className='rounded shadow-card m-3 flex flex-col gap-2 p-2'>
    <textarea className='textarea leading-tight min-h-[110px]' value={text} placeholder='文本内容' onChange={onChangeText}/>
    <div className='flex items-center gap-1'>
      <img className='w-8 h-8 flex justify-center items-center p-0.5' src='personal.svg'/>
      <input autoFocus type='text' className='flex-1 input input-sm' placeholder='提问内容，按Enter发送' value={question} onChange={onChangeQuestion} onKeyDown={onKeyDown}/>
    </div>
  </div>
}

export default Ask
