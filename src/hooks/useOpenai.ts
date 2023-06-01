import {useCallback} from 'react'
import {useAppDispatch, useAppSelector} from './redux'
import {
  addOpenaiResponse,
  setOpenaiError,
  setOpenaiResponse,
  setOpenaiStatus,
  setPage,
  setPrompt,
  setUseText
} from '../redux/envReducer'
import {LANGUAGE_DEFAULT, LANGUAGES_MAP, PAGE_RESULT, SERVER_URL_DEFAULT} from '../const'
import {fetchEventSource} from '@microsoft/fetch-event-source'

export type Callback = (s: string) => void

const useOpenai = () => {
  const dispatch = useAppDispatch()
  const envData = useAppSelector(state => state.env.env)
  const text = useAppSelector(state => state.env.text)
  const question = useAppSelector(state => state.env.question)
  const temperature = useAppSelector(state => state.env.temperature)

  const convertParams = useCallback((prompt: string, useText?: string) => {
    const language = LANGUAGES_MAP[envData.language??LANGUAGE_DEFAULT].name
    prompt = prompt.replace('{{text}}', (useText??text).trim())
    prompt = prompt.replace('{{question}}', (question??'').trim())
    prompt = prompt.replace('{{language}}', language)
    return prompt
  }, [envData.language, question, text])

  const navResult = useCallback((prompt: string, useText?: string) => {
    dispatch(setPage(PAGE_RESULT))
    dispatch(setPrompt(prompt))
    dispatch(setUseText(useText))
    dispatch(setOpenaiStatus('init'))
    dispatch(setOpenaiError())
    dispatch(setOpenaiResponse())
  }, [dispatch])

  const sendRequest = useCallback(async (prompt: string, ctrl: AbortController) => {
    console.log('sendRequest:', prompt)
    const resp = await fetch(`${envData.serverUrl??SERVER_URL_DEFAULT}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${envData.apiKey??''}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        temperature: temperature??1.0,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
      signal: ctrl.signal,
    })
    const data = await resp.json()
    return data.choices?.[0]?.message?.content?.trim()
  }, [envData.apiKey, envData.serverUrl, temperature])

  const sendRequestStream = useCallback(async (prompt: string, ctrl: AbortController) => {
    console.log('sendRequestStream:', prompt)
    await fetchEventSource(`${envData.serverUrl??SERVER_URL_DEFAULT}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${envData.apiKey??''}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        stream: true,
        temperature: temperature??1.0,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
      signal: ctrl.signal,
      async onopen(res) {
        if (res.ok && res.status === 200) {
          console.log('[SSE]Connect success', res)
        } else if (
          res.status >= 400 &&
          res.status < 500 &&
          res.status !== 429
        ) {
          console.log('[SSE]Connect fail', res)

          dispatch(setOpenaiStatus('finish'))
          dispatch(setOpenaiError('Connect fail: '+res.status))
        }
      },
      onmessage(event) {
        console.debug('[SSE]Message', event.data)

        const data = event.data?.trim()
        if (data === '[DONE]') {
          dispatch(setOpenaiStatus('finish'))
        } else {
          const json = JSON.parse(data)
          const choice = json.choices?.[0]
          if (choice) {
            const addContent = choice.delta?.content
            if (addContent) {
              dispatch(addOpenaiResponse(addContent))
            }
            if (choice.finish_reason != null) {
              dispatch(setOpenaiStatus('finish'))
            }
          }
        }
      },
      onclose() {
        console.log('[SSE]Close')

        dispatch(setOpenaiStatus('finish'))
      },
      onerror(err) {
        console.log('[SSE]Error', err)

        dispatch(setOpenaiStatus('finish'))
        dispatch(setOpenaiError(err.message??'error'))

        throw err
      },
    })
  }, [dispatch, envData.apiKey, envData.serverUrl, temperature])

  return {convertParams, navResult, sendRequest, sendRequestStream}
}

export default useOpenai
