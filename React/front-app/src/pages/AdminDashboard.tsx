
import  { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Product {
  _id: string;
  name: string;
  sku: string;
  category: string;
  currentStock: number;
}

interface Log {
  _id: string;
  timestamp: string;
  type: 'IN' | 'OUT';
  quantity: number;
  productId?: { name: string };
  createdBy?: { email: string };
}

interface ProductFormData {
  name: string;
  sku: string;
  category: string;
  currentStock: number | string;
}

const AdminDashboard = () => {
  const navigate = useNavigate(); 
  
  const [products, setProducts] = useState<Product[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [view, setView] = useState<'products' | 'logs'>('products');
  
  const [formData, setFormData] = useState<ProductFormData>({ 
    name: '', sku: '', category: '', currentStock: 0 
  });
  
  const [editId, setEditId] = useState<string | null>(null);

  const getToken = () => localStorage.getItem('token') || '';

  
  const handleLogout = () => {
   
    localStorage.removeItem('token');
    localStorage.removeItem('role');
   
    navigate('/');
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/products', {
        headers: { 'x-auth-token': getToken() }
      });
      const data = await res.json();
      setProducts(data);
    } catch (err) { console.error(err); }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/stock/logs', {
        headers: { 'x-auth-token': getToken() }
      });
      const data = await res.json();
      setLogs(data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchProducts();
    fetchLogs();
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const headers = { 'Content-Type': 'application/json', 'x-auth-token': getToken() };
      const url = editId 
        ? `http://localhost:4000/api/products/${editId}` 
        : 'http://localhost:4000/api/products';
      
      const method = editId ? 'PUT' : 'POST';

      await fetch(url, { method, headers, body: JSON.stringify(formData) });
      
      alert(editId ? 'Product Updated' : 'Product Added');
      setFormData({ name: '', sku: '', category: '', currentStock: 0 });
      setEditId(null);
      fetchProducts();
    } catch (err) { alert('Error saving product'); }
  };

  const handleEditClick = (product: Product) => {
    setEditId(product._id);
    setFormData({
      name: product.name, sku: product.sku, category: product.category, currentStock: product.currentStock
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setFormData({ name: '', sku: '', category: '', currentStock: 0 });
  };

  const handleDelete = async (id: string) => {
    if(!window.confirm("Delete this product?")) return;
    try {
      await fetch(`http://localhost:4000/api/products/${id}`, {
        method: 'DELETE', headers: { 'x-auth-token': getToken() }
      });
      fetchProducts();
    } catch (err) { alert('Error deleting'); }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        
        <div className="flex items-center gap-4">
          <div className="bg-white rounded shadow p-1">
            <button 
              onClick={() => setView('products')} 
              className={`px-4 py-2 rounded ${view === 'products' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}
            >
              Products
            </button>
            <button 
              onClick={() => setView('logs')} 
              className={`px-4 py-2 rounded ${view === 'logs' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}
            >
              Logs
            </button>
          </div>

          <button 
            onClick={handleLogout} 
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded shadow font-bold"
          >
            Logout
          </button>
        </div>
      </div>

      {view === 'products' ? (
        <>
          <div className={`p-6 rounded shadow mb-8 ${editId ? 'bg-yellow-50 border border-yellow-300' : 'bg-white'}`}>
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">{editId ? 'Edit Product' : 'Add New Product'}</h3>
                {editId && <button onClick={handleCancelEdit} className="text-sm text-gray-500 underline">Cancel Edit</button>}
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-5 gap-4">
              <input placeholder="Name" className="border p-2 rounded" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              <input placeholder="SKU" className="border p-2 rounded" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} required />
              <input placeholder="Category" className="border p-2 rounded" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required />
              <input type="number" placeholder="Stock" className="border p-2 rounded" value={formData.currentStock} onChange={e => setFormData({...formData, currentStock: Number(e.target.value)})} required />
              <button className={`text-white rounded px-4 ${editId ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'}`}>
                {editId ? 'Update' : 'Add'}
              </button>
            </form>
          </div>

          <div className="bg-white p-6 rounded shadow">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-3">Name</th>
                  <th className="p-3">SKU</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Stock</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p._id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{p.name}</td>
                    <td className="p-3">{p.sku}</td>
                    <td className="p-3">{p.category}</td>
                    <td className="p-3">{p.currentStock}</td>
                    <td className="p-3 flex gap-3">
                      <button onClick={() => handleEditClick(p)} className="text-blue-600 hover:underline">Edit</button>
                      <button onClick={() => handleDelete(p._id)} className="text-red-500 hover:underline">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-xl font-bold mb-4">Stock Movement Logs</h3>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-3">Date</th>
                <th className="p-3">Product</th>
                <th className="p-3">Action</th>
                <th className="p-3">Qty</th>
                <th className="p-3">User</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log._id} className="border-b">
                  <td className="p-3">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="p-3">{log.productId?.name || 'Unknown'}</td>
                  <td className={`p-3 font-bold ${log.type === 'IN' ? 'text-green-600' : 'text-red-600'}`}>
                    {log.type}
                  </td>
                  <td className="p-3">{log.quantity}</td>
                  <td className="p-3">{log.createdBy?.email || 'Unknown'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;