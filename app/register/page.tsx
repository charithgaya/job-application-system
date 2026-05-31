"use client";

import React from 'react';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function RegisterPage(){

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('candidate');
  
  const handleRegister = async () => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role
        }
      }
    });

    const user = data.user;

    if (user) {
      await supabase.from('profiles').insert({
        id: user.id,
        email,
        role,
        full_name: '',
      });
    }

    if (error){
      alert(error.message);
      return;
    }

    alert("Registration Successfull!");
    console.log(data);
  };

    return (
    <div className="max-w-md mx-auto mt-20 space-y-4">
       <h1 className="text-3xl font-bold">
         Register
       </h1>

       <input
         type="email"
         placeholder="Email"
         value={email}
         onChange={(e) => setEmail(e.target.value)}
         className="w-full p-2 border border-gray-300 rounded"
       />

       <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
       />

       <select
         value={role}
         onChange={(e) => setRole(e.target.value)}
         className="w-full p-2 border border-gray-300 rounded mt-4"
       >
         <option value="candidate">Candidate</option>
         <option value="recruiter">Recruiter</option>
       </select>


       <button
         type="button"
         onClick={handleRegister}
         className="bg-orange-500 text-white p-2 rounded w-full"
       >
         Register
       </button>
    </div>
  )
}

