import React, {useEffect, useState} from 'react'
import axios from 'axios'

export default function Listings(){
  const [listings, setListings] = useState([])
  useEffect(()=>{
    axios.get((import.meta.env.VITE_API_URL||'http://localhost:4000') + '/listings').then(r=>setListings(r.data)).catch(()=>{})
  },[])
  return (
    <div>
      <h2>Listings</h2>
      {listings.length===0 && <p>No listings yet.</p>}
      <ul>
        {listings.map(l=>(
          <li key={l.id}><strong>{l.title}</strong> — {l.location} — {l.price_per_night}€</li>
        ))}
      </ul>
    </div>
  )
}
