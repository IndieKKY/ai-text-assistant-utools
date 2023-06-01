import {flows} from '../base'
import {useCallback, useState} from 'react'
import useOpenai from '../hooks/useOpenai'

const MenuItem = (props: {
  type: 'normal' | 'settings'
  helpItem: HelpItem
  zIndex?: number
}) => {
  const {type, helpItem, zIndex = 100} = props
  const {navResult} = useOpenai()
  const [checked, setChecked] = useState(() => type === 'settings' && !!window.utools?.getFeatures([`cmd-${helpItem.code}`])[0])

  const onClick = useCallback(() => {
    if (helpItem.children?.length) return
    if (!helpItem.prompt) return

    if (type === 'normal') {
      navResult(helpItem.prompt)
    } else {
      if (checked) {
        setChecked(false)
        utools.removeFeature(`cmd-${helpItem.code}`)
      } else {
        setChecked(true)
        // @ts-expect-error
        utools.setFeature({
          code: `cmd-${helpItem.code}`,
          explain: helpItem.featureName??helpItem.name,
          // platform: ['win32', 'darwin', 'linux'],
          cmds: [{
            type: 'over',
            label: helpItem.featureName??helpItem.name
          }]
        })
      }
    }
  }, [checked, helpItem.children?.length, helpItem.code, helpItem.featureName, helpItem.name, helpItem.prompt, navResult, type])

  return <li>
    <a className='flex justify-between items-center' onClick={onClick}>
      {helpItem.name}
      {helpItem.children?.length && <img className='w-[16px] h-[16px]' src='right.svg'/>}
      {checked && <img className='w-[16px] h-[16px]' src='success.svg'/>}
    </a>
    {helpItem.children?.length && <ul className='p-2 rounded shadow-card menu menu-compact bg-base-100' style={{
      color: 'var(--c-desc)',
      zIndex,
    }}>
      {helpItem.children?.map((child, idx) => <MenuItem helpItem={child} key={idx} type={type} zIndex={zIndex + 10}/>)}
    </ul>}
  </li>
}

const Type = (props: {
  type: 'normal' | 'settings'
  helpType: HelpType
}) => {
  const {type, helpType} = props
  return <div className=''>
    <ul className='p-2 rounded shadow-card menu menu-compact' style={{
      color: 'var(--c-desc)'
    }}>
      <li className="menu-title">
        <span>{helpType.name}</span>
      </li>
      {helpType.items.map((item, idx) => <MenuItem key={idx} type={type} helpItem={item}/>)}
    </ul>
  </div>
}

const Flow = (props: {
  type: 'normal' | 'settings'
  helpFlow: HelpFlow
}) => {
  const {type, helpFlow} = props
  return <div className='basis-1 flex-1 flex flex-col gap-2'>
    {helpFlow.types.map((t, idx) => <Type key={idx} type={type} helpType={t}/>)}
  </div>
}

const Templates = (props: {
  type: 'normal' | 'settings'
}) => {
  const {type} = props
  return <div className='flex gap-2 mx-3 mb-3'>
    {flows.map((flow, idx) => <Flow key={idx} type={type} helpFlow={flow}/>)}
  </div>
}

export default Templates
