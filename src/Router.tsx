import App from './App'

const map: {[key: string]: string} = {
  '/close': 'close',
}

const Router = () => {
  const path = map[window.location.pathname]??'app'

  if (path === 'close') {
    window.close()
  }

  return <>
    {path === 'app' && <App/>}
  </>
}

export default Router
