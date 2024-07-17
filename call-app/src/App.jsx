import { useState } from 'react'
import './App.css'
import Auth from './Components/Auth'
import Call from './Components/Call'
import Index from './Index'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
     <main className='w-full h-full flex flex-col justify-center'>
          <Index />
     </main>
    </>
  )
}

export default App
