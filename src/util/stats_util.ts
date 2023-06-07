import {v4} from 'uuid'

const CLIENT_ID_KEY = 'client_id'
const SESSION_ID_KEY = 'session_id'

// clientId cache
let clientId: string | null | undefined
let sessionId: string | null | undefined

const getClientId = () => {
  if (clientId) {
    return clientId
  }
  clientId = window.utools?window.utools.dbStorage.getItem(CLIENT_ID_KEY):localStorage.getItem(CLIENT_ID_KEY)
  if (!clientId) {
    clientId = v4()
    if (window.utools) {
      utools.dbStorage.setItem(CLIENT_ID_KEY, clientId)
    } else {
      localStorage.setItem(CLIENT_ID_KEY, clientId)
    }
  }
  return clientId
}

const getRandomNumber = (min: number, max: number) => {
  // Adding 1 to include the maximum value
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const getSessionId = () => {
  if (sessionId) {
    return sessionId
  }
  sessionId = sessionStorage.getItem(SESSION_ID_KEY)
  if (!sessionId) {
    sessionId = getRandomNumber(1, 99999)+''
    sessionStorage.setItem(SESSION_ID_KEY, sessionId)
  }
  return sessionId
}

export const track = (eventName: string, params?: {[key: string]: string}, isDebug?: boolean) => {
  const user = window.utools?window.utools.getUser():{nickname: '$undefined'}

  fetch(`https://op.kongkongye.com/${isDebug?'dcollect':'collect'}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: getClientId(),
      user_id: user?.nickname??'$undefined',
      timestamp_micros: Date.now()*1000,
      non_personalized_ads: false,
      validationBehavior: isDebug?'ENFORCE_RECOMMENDATIONS':undefined,
      events: [{
        name: eventName,
        params: {
          engagement_time_msec: '100',
          session_id: getSessionId(),

          c_channel: 'utools', // 渠道
          c_env: import.meta.env.MODE, // 环境

          ...(params??{}),
        }
      }],
    }),
  }).catch(console.error)
}
