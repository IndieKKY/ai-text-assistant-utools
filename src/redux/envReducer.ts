import {createSlice, PayloadAction} from '@reduxjs/toolkit'
import {PAGE_MAIN} from '../const'

export interface EnvData {
  serverUrl?: string
  apiKey?: string
  temperature?: number
  language?: string
  prompt?: string
  theme?: string
  stream?: boolean
}

interface EnvState {
  env: EnvData
  envReady: boolean

  temperature?: number
  inputting: boolean
  text: string
  question?: string
  page: string
  prompt?: string
  useText?: string
  openaiResponse?: string
  openaiStatus?: OpenaiStatus
  openaiError?: string
}

const initialState: EnvState = {
  env: {
    stream: true,
  },
  inputting: false,
  text: '',
  page: PAGE_MAIN,
  envReady: false,
}

export const slice = createSlice({
  name: 'env',
  initialState,
  reducers: {
    setInputting: (state, action: PayloadAction<boolean>) => {
      state.inputting = action.payload
    },
    setText: (state, action: PayloadAction<string>) => {
      state.text = action.payload
    },
    setQuestion: (state, action: PayloadAction<string | undefined>) => {
      state.question = action.payload
    },
    setPage: (state, action: PayloadAction<string>) => {
      state.page = action.payload
    },
    setTemperature: (state, action: PayloadAction<number | undefined>) => {
      state.temperature = action.payload
    },
    setPrompt: (state, action: PayloadAction<string | undefined>) => {
      state.prompt = action.payload
    },
    setUseText: (state, action: PayloadAction<string | undefined>) => {
      state.useText = action.payload
    },
    setOpenaiResponse: (state, action: PayloadAction<string | undefined>) => {
      state.openaiResponse = action.payload
    },
    addOpenaiResponse: (state, action: PayloadAction<string | undefined>) => {
      state.openaiResponse = (state.openaiResponse ?? '') + (action.payload ?? '')
    },
    setOpenaiStatus: (state, action: PayloadAction<OpenaiStatus | undefined>) => {
      state.openaiStatus = action.payload
    },
    setOpenaiError: (state, action: PayloadAction<string | undefined>) => {
      state.openaiError = action.payload
    },
    setEnvData: (state, action: PayloadAction<EnvData>) => {
      state.env = {
        ...state.env,
        ...action.payload,
      }
    },
    setEnvReady: (state) => {
      state.envReady = true
    },
  },
})

export const {
  setTemperature,
  setUseText,
  setInputting,
  addOpenaiResponse,
  setQuestion,
  setOpenaiError,
  setOpenaiStatus,
  setOpenaiResponse,
  setPrompt,
  setPage,
  setText,
  setEnvData,
  setEnvReady,
} = slice.actions

export default slice.reducer
