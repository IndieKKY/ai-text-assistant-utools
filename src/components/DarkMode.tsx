import React, {useEffect, useMemo} from 'react'
import {useAppDispatch, useAppSelector} from '../hooks/redux'
import {setEnvData} from '../redux/envReducer'
import {setTheme} from '../util/biz_util'
import {isDarkMode} from '@kky002/kky-util'
import {track} from '../util/stats_util'

const DARK_MODES = [
  {
    name: '☀️ 浅色',
    value: 'light',
    // cls: MdOutlineLightMode,
  },
  {
    name: '🌙 深色',
    value: 'dark',
    // cls: MdNightlight,
  },
  {
    name: '🔄 跟随系统',
    value: 'system',
    // cls: MdOutlineComputer,
  },
]
const DARK_MODES_MAP: {[key: string]: typeof DARK_MODES[number]} = {}
DARK_MODES.forEach(item => {
  DARK_MODES_MAP[item.value] = item
})

const DarkMode = () => {
  const dispatch = useAppDispatch()
  const envData = useAppSelector(state => state.env.env)
  const envReady = useAppSelector(state => state.env.envReady)
  const mode = useMemo(() => {
    let value
    if (!envReady || !envData.theme) {
      value = 'system'
    } else {
      value = envData.theme
    }
    return DARK_MODES_MAP[value]
  }, [envData.theme, envReady])

  const themeFinal = useMemo(() => envReady?(envData.theme ?? (isDarkMode() ? 'dark' : 'light')):'light', [envData.theme, envReady])

  // theme改变时，设置主题
  useEffect(() => {
    if (envReady) {
      setTheme(themeFinal)
    }
  }, [envReady, themeFinal])

  return <div className='px-2 py-1 rounded-full flex items-center text-xl'>
    <ul className='menu menu-compact rounded'>
      <li className='relative'>
        <div className='flex items-center gap-1.5'>
          {mode.name}
        </div>

        <ul className='p-2 rounded shadow-card menu menu-compact bg-base-100 absolute bottom-0 z-[9999]'>
          {DARK_MODES.map((mode, idx) => <li key={mode.value}>
            <a className='flex justify-between items-center' onClick={() => {
              dispatch(setEnvData({
                theme: mode.value === 'system' ? undefined : mode.value,
              }))

              track('btn', {
                v_action: 'theme',
                v_mode: mode.value,
              })
            }}>
              {mode.name}
            </a>
          </li>)}
        </ul>
      </li>
    </ul>
  </div>
}

export default DarkMode
