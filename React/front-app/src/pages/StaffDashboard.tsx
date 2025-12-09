import  { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Product {
  _id: string;
  name: string;
  sku: string;
  category: string;
  currentStock: number;
}

interface FormState {
  productId: string;
  type: 'IN' | 'OUT';
  quantity: string;
}

const StaffDashboard = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string>('');
  
  const [form, setForm] = useState<FormState>({ 
    productId: '', type: 'IN', quantity: '' 
  });

  const getToken = () => localStorage.getItem('token') || '';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/');
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/products', {
        headers: { 'x-auth-token': getToken() }
      });
      const data = await response.json();
      setProducts(data);
    } catch (err: any) { 
      console.error("Failed to load products", err); 
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleStockUpdate = async (e: any) => {
    e.preventDefault();
    setError(''); 

    if (!form.productId) return setError("Please select a product first.");
    const qtyNumber = Number(form.quantity);
    if (qtyNumber <= 0) return setError("Quantity must be a positive number.");

    try {
      const response = await fetch('http://localhost:4000/api/stock/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': getToken()
        },
        body: JSON.stringify({
          productId: form.productId,
          type: form.type,
          quantity: qtyNumber
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.msg || "Server Error");

      alert('Stock Updated Successfully!');
      setForm({ ...form, quantity: '' }); 
      fetchProducts(); 

    } catch (err: any) {
      setError(err.message || "Server Error: Could not update stock.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Staff Dashboard</h1>
        <button 
          onClick={handleLogout} 
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded shadow font-bold"
        >
          Logout
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error: </strong> {error}
        </div>
      )}

      <div className="bg-white p-6 rounded shadow-lg mb-8 max-w-2xl mx-auto border-t-4 border-blue-500">
        <h2 className="text-xl font-bold mb-4">Record Stock Movement</h2>
        <form onSubmit={handleStockUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Select Product</label>
            <select 
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500"
              value={form.productId}
              onChange={(e: any) => setForm({ ...form, productId: e.target.value })}
            >
              <option value="">-- Choose Product --</option>
              {products.map(p => (
                <option key={p._id} value={p._id}>
                  {p.name} (Available: {p.currentStock})
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block text-sm font-medium mb-1">Action Type</label>
              <select 
                className="w-full border p-2 rounded"
                value={form.type}
                onChange={(e: any) => setForm({ ...form, type: e.target.value })}
              >
                <option value="IN">IN (Restock)</option>
                <option value="OUT">OUT (Sale/Use)</option>
              </select>
            </div>
            <div className="w-1/2">
              <label className="block text-sm font-medium mb-1">Quantity</label>
              <input 
                type="number" 
                min="1" 
                className="w-full border p-2 rounded"
                placeholder="0"
                value={form.quantity}
                onChange={(e: any) => setForm({ ...form, quantity: e.target.value })}
              />
            </div>
          </div>
          <button className="w-full bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700 transition">
            Submit Stock Update
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded shadow">
        <h3 className="text-lg font-bold mb-4">Current Stock Levels</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map(p => (
            <div key={p._id} className="p-4 border rounded flex justify-between items-center bg-gray-50">
              <div>
                <p className="font-bold text-lg">{p.name}</p>
                <p className="text-sm text-gray-500">SKU: {p.sku}</p>
              </div>
              <div className="text-right">
                <span className={`block text-2xl font-bold ${p.currentStock < 10 ? 'text-red-600' : 'text-blue-600'}`}>
                    {p.currentStock}
                </span>
                <span className="text-xs text-gray-500 uppercase">{p.category}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;