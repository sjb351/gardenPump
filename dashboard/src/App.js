import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route, NavLink, Outlet } from 'react-router-dom'
import { Container, Navbar, Nav, Row, Col, ToastContainer, Toast, Card, Spinner, ListGroup, Button } from 'react-bootstrap';
import MainPage from './MainPage'
import { MQTTProvider, useMQTTState } from './MQTTContext'
import React from 'react';
import APIBackend from './RestAPI'

function App() {
  let [loaded, setLoaded] = React.useState(false)
  let [pending, setPending] = React.useState(false)
  let [error, setError] = React.useState(null)
  let [config, setConfig] = React.useState([])


  React.useEffect(() => {
    let do_load = async () => {
      setPending(true)
      let response = await APIBackend.api_get('http://' + document.location.host + '/config/config.json');
      if (response.status === 200) {
        const raw_conf = response.payload;
        console.log("config", raw_conf)
        setConfig(raw_conf)
        setLoaded(true)
      } else {
        console.log("ERROR LOADING CONFIG")
        setError("ERROR: Unable to load configuration!")
      }
    }
    if (!loaded && !pending) {
      do_load()
    }
  }, [loaded, pending])
  if (!loaded) {
    return <Container fluid="md">
      <Card className='mt-2 text-center'>
        {error !== null ? <h1>{error}</h1> : <div><Spinner></Spinner> <h2 className='d-inline'>Loading Config</h2></div>}
      </Card>
    </Container>
  } else {
    return (
      <MQTTProvider
        host={config?.mqtt?.host ?? document.location.hostname}
        port={config?.mqtt?.port ?? 9001}
        prefix={config?.mqtt?.prefix ?? []}>
          <BrowserRouter>
            <Routes>
              <Route path='/' element={<MainPage config={config} />}>
              </Route>
            </Routes>
          </BrowserRouter>
      </MQTTProvider>
    )
  }
}


export default App;
