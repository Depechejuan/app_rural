import React, {useState} from 'react'
import axios from 'axios'

export default function Login(){
  const [email,setEmail] = useState('demo@example.com')
  const [password,setPassword] = useState('password')
  const submit = async (e)=>{
    e.preventDefault()
    try{
      const r = await axios.post((import.meta.env.VITE_API_URL||'http://localhost:4000') + '/auth/login',{email,password})
      alert('Token: ' + r.data.token.substring(0,20) + '... (demo)')
    }catch(e){ alert('Login failed') }
  }
  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={submit}>
        <input value={email} onChange={e=>setEmail(e.target.value)} />
        <input value={password} onChange={e=>setPassword(e.target.value)} />
        <button>Login</button>
      </form>
    </div>
  )
}
