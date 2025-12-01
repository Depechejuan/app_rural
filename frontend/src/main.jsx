import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Listings from './pages/Listings'
import CreateListing from './pages/CreateListing'
import Login from './pages/Login'
import Booking from './pages/Booking'

function App(){
  return (
    <BrowserRouter>
      <div style={{fontFamily:'Arial',padding:20}}>
        <h1>Rural Lease</h1>
        <nav>
          <Link to="/">Listings</Link> | <Link to="/create">Create listing</Link> | <Link to="/booking">Booking</Link>
        </nav>
        <hr/>
        <Routes>
          <Route path="/" element={<Listings/>} />
          <Route path="/create" element={<CreateListing/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/booking" element={<Booking/>} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

createRoot(document.getElementById('root')).render(<App />)
