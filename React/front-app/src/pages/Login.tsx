import  { useState} from 'react';
import { useNavigate } from 'react-router-dom';

interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    role: 'admin' | 'staff';
  };
  msg?: string; 
}

const Login = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const navigate = useNavigate();

  const handleLogin = async (e: any) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data: LoginResponse = await response.json();
      if (!response.ok) {
        throw new Error(data.msg || 'Login failed');
      }
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.user.role); 

      if (data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/staff');
      }

    } catch (err: any) {
     
      alert(err.message || 'Login failed');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-200">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Inventory Login</h2>
        
        <input 
          type="email" 
          placeholder="Email" 
          className="w-full border p-2 mb-4 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)} 
          required/>
        
        <input 
          type="password" 
          placeholder="Password" 
          className="w-full border p-2 mb-6 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)} 
          required/>
        
        <button className="w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700">
          Sign In
        </button>
        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account? <a href="/register" className="text-blue-600 hover:underline">Register</a>
        </p>
      </form>
    </div>
  );
};

export default Login;