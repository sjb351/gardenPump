import React, {useEffect, useState} from 'react'
import { Container, Pagination, Card, Col, Row, Button, Modal, Table, Spinner, InputGroup, Form, DropdownButton, Dropdown } from 'react-bootstrap'
import { useParams } from 'react-router-dom'
import { useMQTTSend } from './MQTTContext';
import APIBackend from './RestAPI'
import axios from 'axios'

//todo reasons modification page (download new config file - save in right place)
//todo cancel

function MainPage({ config}) {
  const inputRef = React.useRef(null);


  const sendJsonMessage = useMQTTSend()
  const topic = config.mqtt.topic
  //sendJsonMessage(topic, payload);

  let [loaded, setLoaded] = useState(false)
  let [error, setError] = useState("")
  let [data, setData] = useState(null)
  let [dataRecieved, setDataRecieved] = useState(false)
  let url = (config.sqlite3.url ? config.sqlite3.url: window.location.hostname) +  ":" + config.sqlite3.port
      
  const backendPump = "http://" +url+"/get"
  const id = 1
  useEffect(() => {
    fetchDate()
  },[])

    useEffect(() => {
    let do_load = async () => {
      setLoaded(true)
    }
    if (!loaded) {
      do_load()
    }
  }, [loaded, config])


  const fetchDate = async () => {
    try{
      const res = await axios.get(backendPump)
      if (res.data != null){
        setData(res.data[0])
        console.log("Data from database")
        console.log(res.data)
        if (res.data.length > 0){
          setDataRecieved(true)
          setError("")
        }else{
          setDataRecieved(false)
          setError("Conected but no data")
        }
     } 
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      fetchDate();
    }, 2000); // 10000 milliseconds = 10 seconds
    // Clean up the interval when the component is unmounted
    return () => clearInterval(interval);    
  }, []); 

const handleButtonClick = async (action) => {
  let payload = { action: action }
  console.log(payload)
  try{
    sendJsonMessage(topic, payload);
    setError("")
  } catch {
    console.log("Error sending message")
    setError("Error sending MQTT message")
  }
}

  if (!loaded) {
    return <Container fluid="md">
      <Card className='mt-2 text-center'>
        {error !== null ? <h1>{error}</h1> : <Spinner></Spinner>}
      </Card>
    </Container>
  } else {
    return <>
      <Card className='mt-2'>
        <Card.Header className='text-center'>
          <h1>Garden Control App</h1>
        </Card.Header>
        <Card.Body className='text-center justify-content-center'>
          <Container fluid>
          <Row className='gx-2 gy-1'>
            <Col></Col>
            <Col className="d-grid px-1">
              <Button variant="success" size="lg" onClick={() => handleButtonClick("Start")}>Start</Button>
            </Col>
            <Col className="d-grid px-1">
              <Button variant="warning" size="lg" onClick={() => handleButtonClick("Stop")}>Stop</Button>
            </Col>
            <Col></Col>
          </Row>
          <Row className="row mt-3">
          {data !=null ? (
            <Col> The pump is set to {data.state == 1 ? "on" : "off"}</Col>
          ):(
            <Col> No data received yet</Col>
          )}
          </Row>
          <Row><Col>
          {error}
          </Col></Row>
        
      <Row className='gx-2 gy-1 row mt-3'>
          <Col ></Col>
          <Col ></Col>
          <Col className="d-grid px-4" >
            {data == null ? (
            <Card className='text-center justify-content-center bg-warning text-white'>
              <Card.Body className='text-center justify-content-center'>
                  No data
              </Card.Body>
            </Card>
            ):( <>
            {data.state == 1 ? (
          <Card className='text-center justify-content-center bg-success text-white'>
          <Card.Body className='text-center justify-content-center'>
              Pump On
          </Card.Body>
          </Card>
            ) : (
          <Card className='text-center justify-content-center bg-danger text-white'>
          <Card.Body className='text-center justify-content-center'>
              Pump Off
          </Card.Body>
          </Card>
            )}</>
            )}
          </Col>
          <Col ></Col>
          <Col ></Col>
        </Row>
        </Container>
        </Card.Body>
      </Card>
      

    
    </>
  }
}

export default MainPage;
