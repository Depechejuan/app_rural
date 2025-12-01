import React, {useState} from 'react'
import axios from 'axios'

export default function CreateListing(){
  const [form,setForm] = useState({title:'',description:'',location:'',price:0})
  const submit = async (e)=>{
    e.preventDefault();
    try{
      await axios.post((import.meta.env.VITE_API_URL||'http://localhost:4000') + '/listings',{
        title: form.title,
        description: form.description,
        location: form.location,
        price_per_night: form.price
      });
      alert('Created (demo). Reload to see it.');
    }catch(err){ alert('Error'); }
  }
  return (
    <div>
      <h2>Create Listing</h2>
      <form onSubmit={submit}>
        <div><input placeholder="Title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} /></div>
        <div><input placeholder="Location" value={form.location} onChange={e=>setForm({...form,location:e.target.value})} /></div>
        <div><input type="number" placeholder="Price per night" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} /></div>
        <div><textarea placeholder="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}></textarea></div>
        <button>Create</button>
      </form>
    </div>
  )
}
