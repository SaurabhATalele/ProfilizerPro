"use client"

import React,{useState,useEffect} from 'react'
import Card from './Card'
import axios from 'axios'


const AllTests = () => {
    const [tests, setTests] = useState([]);

  const getTests = async () => {
    try {
      const res = await axios.get("/api/v1/assignment");
      setTests(res.data.data);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getTests();
  }, []);
  return (
    <div className='w-3/4 py-24 flex flex-col gap-5'>

        <h1 className='text-xl font-bold text-primary-light dark:text-primary-dark'>All tests</h1>
        
            <Card tests={tests}/>
        

    </div>
  )
}

export default AllTests