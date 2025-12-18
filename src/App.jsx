import { useState, useEffect } from 'react';
import './App.css';
import { Trash2, LogOut, LogIn, PlusCircle } from 'lucide-react';
import { auth, loginWithGoogle, logout } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // State Data
  const [transactions, setTransactions] = useState([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [filter, setFilter] = useState('monthly'); // Default bulan ini

  // 1. CEK STATUS LOGIN
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. LOAD DATA USER DARI LOCALSTORAGE
  useEffect(() => {
    if (user) {
      const storageKey = `keuangan-${user.uid}`; // Kunci unik per user
      const saved = localStorage.getItem(storageKey);
      setTransactions(saved ? JSON.parse(saved) : []);
    }
  }, [user]);

  // 3. SIMPAN DATA OTOMATIS
  useEffect(() => {
    if (user) {
      const storageKey = `keuangan-${user.uid}`;
      localStorage.setItem(storageKey, JSON.stringify(transactions));
    }
  }, [transactions, user]);

  // LOGIKA TAMBAH TRANSAKSI
  const addTransaction = (e) => {
    e.preventDefault();
    if (!description || !amount) return;
    const newTransaction = {
      id: Date.now(),
      description,
      amount: parseFloat(amount),
      type,
      date: new Date().toISOString(),
    };
    setTransactions([newTransaction, ...transactions]);
    setDescription('');
    setAmount('');
  };

  const deleteTransaction = (id) => {
    if(confirm('Hapus transaksi ini?')) {
        setTransactions(transactions.filter(t => t.id !== id));
    }
  };

  // LOGIKA FILTER WAKTU (Harian, Mingguan, Bulanan, Tahunan)
  const getFilteredTransactions = () => {
    const now = new Date();
    return transactions.filter(t => {
      const tDate = new Date(t.date);
      
      // Reset jam agar perbandingan tanggal akurat
      const isSameDay = (d1, d2) => d1.toDateString() === d2.toDateString();
      const isSameMonth = (d1, d2) => d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
      const isSameYear = (d1, d2) => d1.getFullYear() === d2.getFullYear();

      if (filter === 'all') return true;
      if (filter === 'daily') return isSameDay(tDate, now);
      if (filter === 'weekly') {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 7);
        return tDate >= oneWeekAgo;
      }
      if (filter === 'monthly') return isSameMonth(tDate, now);
      if (filter === 'yearly') return isSameYear(tDate, now);
      return true;
    });
  };

  const filteredData = getFilteredTransactions();
  
  // HITUNG SALDO
  const calculateTotal = (type) => filteredData.filter(t => t.type === type).reduce((acc, c) => acc + c.amount, 0);
  const totalIncome = calculateTotal('income');
  const totalExpense = calculateTotal('expense');
  const balance = totalIncome - totalExpense;

  // FORMAT RUPIAH
  const formatRupiah = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

  if (loading) return <div className="loading-screen">Memuat Aplikasi...</div>;

  // TAMPILAN JIKA BELUM LOGIN
  if (!user) {
    return (
      <div className="login-container">
        <div className="login-card">
          <h1>💸 DompetKu</h1>
          <p>Catat pengeluaran harian, mingguan, hingga tahunan dengan mudah.</p>
          <button onClick={loginWithGoogle} className="google-btn">
            <LogIn size={18} /> Masuk dengan Google
          </button>
        </div>
      </div>
    );
  }

  // TAMPILAN UTAMA (DASHBOARD)
  return (
    <div className="container">
      {/* HEADER RESPONSIVE */}
      <header className="app-header">
        <div className="user-info">
          <img src={user.photoURL} alt="User" className="avatar"/>
          <div>
            <h3>Hi, {user.displayName.split(' ')[0]}</h3>
            <span className="badge">Online</span>
          </div>
        </div>
        <button onClick={logout} className="logout-btn" title="Keluar">
            <LogOut size={20} />
        </button>
      </header>

      {/* FILTER & SALDO UTAMA */}
      <div className="filter-bar">
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="daily">Hari Ini</option>
          <option value="weekly">Minggu Ini</option>
          <option value="monthly">Bulan Ini</option>
          <option value="yearly">Tahun Ini</option>
          <option value="all">Semua Data</option>
        </select>
      </div>

      <div className="balance-card">
        <p>Sisa Saldo ({filter})</p>
        <h2>{formatRupiah(balance)}</h2>
      </div>

      <div className="summary-grid">
        <div className="box income">
          <span>Pemasukan</span>
          <h4>{formatRupiah(totalIncome)}</h4>
        </div>
        <div className="box expense">
          <span>Pengeluaran</span>
          <h4>{formatRupiah(totalExpense)}</h4>
        </div>
      </div>

      {/* FORM INPUT */}
      <div className="card input-card">
        <h4>Tambah Transaksi</h4>
        <form onSubmit={addTransaction}>
          <div className="form-group">
             <input type="text" placeholder="Keperluan (mis: Bensin)" value={description} onChange={e => setDescription(e.target.value)} required/>
          </div>
          <div className="form-row">
            <input type="number" placeholder="Rp" value={amount} onChange={e => setAmount(e.target.value)} required/>
            <select value={type} onChange={e => setType(e.target.value)}>
                <option value="expense">Keluar</option>
                <option value="income">Masuk</option>
            </select>
          </div>
          <button type="submit" className="save-btn"><PlusCircle size={16}/> Simpan</button>
        </form>
      </div>

      {/* LIST RIWAYAT */}
      <div className="card list-card">
        <h4>Riwayat ({filteredData.length})</h4>
        <ul className="transaction-list">
          {filteredData.length === 0 ? <p className="empty-state">Belum ada data.</p> : 
           filteredData.map(t => (
            <li key={t.id} className={`item ${t.type}`}>
              <div className="item-left">
                <strong>{t.description}</strong>
                <small>{new Date(t.date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}</small>
              </div>
              <div className="item-right">
                <span className={t.type}>
                    {t.type === 'expense' ? '-' : '+'} {formatRupiah(t.amount)}
                </span>
                <button onClick={() => deleteTransaction(t.id)} className="del-btn"><Trash2 size={16}/></button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
