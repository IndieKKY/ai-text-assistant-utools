import {useAppDispatch} from './redux'
import {useEffect} from 'react'
import {setInputting} from '../redux/envReducer'

const useKeyService = () => {
  const dispatch = useAppDispatch()

  // 输入中
  useEffect(() => {
    const onInputtingStart = (e: CompositionEvent) => {
      dispatch(setInputting(true))
    }
    const onInputtingEnd = (e: CompositionEvent) => {
      dispatch(setInputting(false))
    }

    document.addEventListener('compositionstart', onInputtingStart)
    document.addEventListener('compositionend', onInputtingEnd)
    return () => {
      document.removeEventListener('compositionstart', onInputtingStart)
      document.removeEventListener('compositionend', onInputtingEnd)
    }
  }, [dispatch])
}

export default useKeyService
