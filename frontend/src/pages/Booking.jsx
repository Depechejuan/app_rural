import React, {useState} from 'react'
import axios from 'axios'
import { format } from 'date-fns'

export default function Booking(){
  const [listingId, setListingId] = useState('1')
  const [start, setStart] = useState('2025-12-01')
  const [end, setEnd] = useState('2025-12-05')
  const [available, setAvailable] = useState(null)
  const [message, setMessage] = useState('')

  const checkAvailability = async ()=>{
    try{
      const api = import.meta.env.VITE_API_URL || 'http://localhost:4000'
      const r = await axios.get(`${api}/listings/${listingId}/availability`, { params: { start_date: start, end_date: end } })
      setAvailable(r.data.available)
      setMessage(r.data.available ? 'Fechas disponibles' : 'Fechas NO disponibles (conflicto)')
    }catch(e){ setMessage('Error comprobando disponibilidad') }
  }

  const book = async ()=>{
    try{
      const api = import.meta.env.VITE_API_URL || 'http://localhost:4000'
      const r = await axios.post(`${api}/bookings`, {
        listing_id: parseInt(listingId,10),
        user_id: 1,
        start_date: start,
        end_date: end,
        total_price: 100
      })
      setMessage('Reserva creada: id ' + r.data.id)
    }catch(e){
      if(e.response && e.response.data) setMessage('Error: ' + JSON.stringify(e.response.data))
      else setMessage('Error creando reserva')
    }
  }

  return (
    <div>
      <h2>Booking demo</h2>
      <div>
        <label>Listing id: <input value={listingId} onChange={e=>setListingId(e.target.value)} /></label>
      </div>
      <div>
        <label>Start: <input type="date" value={start} onChange={e=>setStart(e.target.value)} /></label>
      </div>
      <div>
        <label>End: <input type="date" value={end} onChange={e=>setEnd(e.target.value)} /></label>
      </div>
      <div style={{marginTop:10}}>
        <button onClick={checkAvailability}>Comprobar disponibilidad</button>
        <button onClick={book} style={{marginLeft:10}}>Reservar</button>
      </div>
      <div style={{marginTop:10}}>
        <strong>{message}</strong>
      </div>
    </div>
  )
}
