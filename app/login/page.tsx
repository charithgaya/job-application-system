"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import router from 'next/dist/client/router';

export default function LoginPage(){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Login Successful!");
    console.log(data);

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profile.role === 'candidate') {
      router.push('/candidate');
    }

    if (profile.role === 'recruiter') {
      router.push('/recruiter');
    }

    if (profile.role === 'admin') {
      router.push('/admin');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 space-y-4">
      <h1 className="text-3xl font-bold">
        Login
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

      <button
        type="button"
        onClick={handleLogin}
        className="w-full bg-orange-500 text-white p-2 rounded"
      >
        Login
      </button>
    </div>
  )
}


