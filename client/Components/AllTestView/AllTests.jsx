"use client"

import React, { useState, useEffect } from 'react'
import Card from './Card'
import axios from 'axios'
import Skeleton from '../Landing/Skeleton'


const AllTests = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  const getTests = async () => {
    try {
      const res = await axios.get("/api/v1/assignment");
      if (res.data && res.data.data) {
        setTests(res.data.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    getTests();
  }, []);
  
  return (
    <div className='w-full min-h-[calc(100vh-80px)] mt-20 flex flex-col px-5 py-10 max-w-7xl mx-auto gap-8'>
        <div className="w-full flex justify-between items-end border-b border-gray-200 dark:border-gray-800 pb-4">
          <h1 className='text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-white'>All Assessments</h1>
        </div>
        
        {loading ? (
            <Skeleton />
        ) : (
            <Card tests={tests}/>
        )}
    </div>
  )
}

export default AllTests