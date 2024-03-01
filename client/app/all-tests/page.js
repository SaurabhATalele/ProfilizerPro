import AllTests from '@/Components/AllTestView/AllTests'
import  Navbar  from '@/Components/Navbar/Navbar'
import React from 'react'

const page = () => {
  return (
    <div className='flex flex-col w-full items-center p-5'>
    <Navbar/>
    <AllTests/>
    </div>
  )
}

export default page