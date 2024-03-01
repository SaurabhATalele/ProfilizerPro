

import React from 'react'

function Button  ({num,status}) {
  return (
    <>
    <button className={` w-10 h-8 ${status==="attempted" &&  'bg-green-500'} ${status==="marked" &&  'bg-yellow-500'} bg-stone-100`} >{num}</button>
    </>
  )
}

export default Button