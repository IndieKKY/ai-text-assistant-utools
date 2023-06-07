import React, {useCallback, useMemo} from 'react'
import {useAppDispatch, useAppSelector} from '../hooks/redux'
import {setEnvData, setPage} from '../redux/envReducer'
import {LANGUAGE_DEFAULT, LANGUAGES, LANGUAGES_MAP, PAGE_RESULT, PAGE_SETTINGS} from '../const'
import DarkMode from './DarkMode'
import {track} from '../util/stats_util'

const Footer = () => {
  const dispatch = useAppDispatch()
  const envData = useAppSelector(state => state.env.env)
  const prompt = useAppSelector(state => state.env.prompt)
  const page = useAppSelector(state => state.env.page)
  const hasLanguage = useMemo(() => prompt?.includes('{{language}}'), [prompt])

  const onNavSettings = useCallback(() => {
    dispatch(setPage(PAGE_SETTINGS))
  }, [dispatch])

  return <>
    <div className='w-full h-[60px]'></div>
    <div
      className='fixed bottom-0 left-0 right-0 border-t border-t-base-300 flex justify-between items-center py-1.5 px-3 bg-base-200/75'>
      <div className='basis-1 flex-1'>
        <DarkMode/>
      </div>
      <div className='basis-1 flex-1 flex justify-center'>
        {(page === PAGE_RESULT?hasLanguage:true)
          ?<ul className='menu menu-compact rounded'>
          <li className='relative'>
            <div className='flex items-center gap-1.5'>
              <span>🌍</span>
              {LANGUAGES_MAP[envData.language ?? LANGUAGE_DEFAULT].name}
              <img className='rotate-90' src='right.svg'/>
            </div>

            <ul className='p-2 rounded shadow-card menu menu-compact bg-base-100 absolute bottom-0 z-[9999]'>
              {LANGUAGES.map((lang, idx) => <li key={lang.code}>
                <a className='flex justify-between items-center' onClick={() => {
                  dispatch(setEnvData({
                    language: lang.code
                  }))

                  track('btn', {
                    v_action: 'lang',
                    v_lang: lang.code,
                  })
                }}>
                  {lang.name}
                </a>
              </li>)}
            </ul>
          </li>
        </ul>
          :<div className='desc text-sm'>提示词未包含语言变量</div>}
      </div>
      <div className='basis-1 flex-1 flex justify-end items-center'>
        {!envData.apiKey && <div className='text-error text-center font-medium animate-bounce'>请先设置API KEY 👉</div>}
        <button className='btn btn-sm btn-ghost py-1 px-2' onClick={onNavSettings}>设置 <img className='ml-1 w-4 h-4'
                                                                                             src='settings.svg'/>
        </button>
      </div>
    </div>
  </>
}

export default Footer
