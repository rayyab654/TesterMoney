import { useState, useEffect } from 'react';
import './App.css';
import { 
  PlusCircle, Wallet, TrendingUp, TrendingDown, 
  FileSpreadsheet, FileText, LogOut, LogIn, Mail 
} from 'lucide-react';
import { 
  auth, loginWithGoogle, logout, 
  registerWithEmail, loginWithEmail 
} from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // State Data
  const [transactions, setTransactions] = useState([]);
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('income');
  
  // State Filter Waktu
  const [filterType, setFilterType] = useState('monthly'); // daily, weekly, monthly, yearly, all

  // State Login Form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false); // Mode Login atau Daftar

  // 1. Cek Login
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Load Data User
  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`zyfin-${user.uid}`);
      setTransactions(saved ? JSON.parse(saved) : []);
    }
  }, [user]);

  // 3. Simpan Data
  useEffect(() => {
    if (user) {
      localStorage.setItem(`zyfin-${user.uid}`, JSON.stringify(transactions));
    }
  }, [transactions, user]);

  // --- LOGIKA EMAIL AUTH ---
  const handleEmailAuth = async (e) => {
    e.preventDefault();
    try {
      if (isRegistering) {
        await registerWithEmail(email, password);
      } else {
        await loginWithEmail(email, password);
      }
    } catch (error) {
      alert("Gagal: " + error.message);
    }
  };

  // --- LOGIKA TRANSAKSI ---
  const handleSave = () => {
    if (!desc || !amount) return;
    const newTx = {
      id: Date.now(),
      desc,
      amount: parseFloat(amount),
      type,
      dateString: new Date().toISOString(), // Format ISO untuk filter
      dateDisplay: new Date().toLocaleDateString('id-ID') // Format Tampil
    };
    setTransactions([newTx, ...transactions]);
    setDesc('');
    setAmount('');
  };

  // --- LOGIKA FILTER CANGGIH ---
  const getFilteredTransactions = () => {
    const now = new Date();
    return transactions.filter(t => {
      const tDate = new Date(t.dateString); // Ubah string balik ke Date

      if (filterType === 'all') return true;

      // Filter Hari Ini
      if (filterType === 'daily') {
        return tDate.toDateString() === now.toDateString();
      }

      // Filter Minggu Ini (7 Hari Terakhir)
      if (filterType === 'weekly') {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 7);
        return tDate >= oneWeekAgo;
      }

      // Filter Bulan Ini
      if (filterType === 'monthly') {
        return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
      }

      // Filter Tahun Ini
      if (filterType === 'yearly') {
        return tDate.getFullYear() === now.getFullYear();
      }

      return true;
    });
  };

  const filteredData = getFilteredTransactions();

  // Hitung Saldo Berdasarkan Data yang DI-FILTER
  const totalIncome = filteredData.filter(t => t.type === 'income').reduce((acc, c) => acc + c.amount, 0);
  const totalExpense = filteredData.filter(t => t.type === 'expense').reduce((acc, c) => acc + c.amount, 0);
  const saldo = totalIncome - totalExpense;

  const formatRp = (n) => new Intl.NumberFormat('id-ID').format(n);

  if (loading) return <div className="loading">Memuat...</div>;

  // --- HALAMAN LOGIN & REGISTER ---
  if (!user) {
    return (
      <div className="login-wrapper">
        <div className="login-card">
          <h1 className="brand-logo">ZyFinansialPro</h1>
          <p>{isRegistering ? "Daftar akun baru" : "Masuk untuk mengelola keuangan"}</p>

          <form onSubmit={handleEmailAuth} className="login-form">
            <input 
              type="email" placeholder="Email" required 
              value={email} onChange={e => setEmail(e.target.value)}
            />
            <input 
              type="password" placeholder="Password" required 
              value={password} onChange={e => setPassword(e.target.value)}
            />
            <button type="submit" className="email-btn">
              {isRegistering ? "Daftar Sekarang" : "Masuk"}
            </button>
          </form>

          <div className="divider"><span>ATAU</span></div>

          <button onClick={loginWithGoogle} className="google-btn">
            <LogIn size={18} /> Masuk dengan Google
          </button>

          <p className="toggle-text">
            {isRegistering ? "Sudah punya akun?" : "Belum punya akun?"} 
            <span onClick={() => setIsRegistering(!isRegistering)}>
              {isRegistering ? " Login" : " Daftar"}
            </span>
          </p>
        </div>
      </div>
    );
  }

  // --- HALAMAN UTAMA (DASHBOARD) ---
  return (
    <div className="app-container">
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="nav-brand">
          <Wallet className="brand-icon" />
          <h2>ZyFinansialPro</h2>
        </div>
        <div className="nav-profile">
          <span>{user.email}</span>
          <button onClick={logout} className="btn-logout" title="Sign Out">
            <LogOut size={18} />
          </button>
        </div>
      </nav>

      <main className="main-content">
        {/* KOLOM KIRI: INPUT */}
        <div className="left-column">
          <div className="card form-card">
            <h3><PlusCircle size={20}/> Transaksi Baru</h3>
            <div className="form-group">
              <label>Keterangan</label>
              <input type="text" placeholder="Contoh: Gaji..." value={desc} onChange={e => setDesc(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Nominal (Rp)</label>
              <input type="number" placeholder="0" value={amount} onChange={e => setAmount(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Tipe</label>
              <div className="type-buttons">
                <button className={`type-btn ${type === 'income' ? 'active income' : ''}`} onClick={() => setType('income')}>Pemasukan</button>
                <button className={`type-btn ${type === 'expense' ? 'active expense' : ''}`} onClick={() => setType('expense')}>Pengeluaran</button>
              </div>
            </div>
            <button className="btn-save" onClick={handleSave}>Simpan</button>
          </div>
          
          <div className="card export-card">
            <h3>Export Laporan</h3>
            <div className="export-buttons">
              <button className="btn-excel"><FileSpreadsheet size={16}/> Excel</button>
              <button className="btn-pdf"><FileText size={16}/> PDF</button>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN: DASHBOARD */}
        <div className="right-column">
          <div className="dashboard-header">
            <h2>Dashboard Ringkasan</h2>
            {/* DROPDOWN FILTER BERFUNGSI */}
            <select 
              className="date-filter" 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="daily">Hari Ini</option>
              <option value="weekly">Minggu Ini</option>
              <option value="monthly">Bulan Ini</option>
              <option value="yearly">Tahun Ini</option>
              <option value="all">Semua Data</option>
            </select>
          </div>

          <div className="stats-grid">
            <div className="stat-card blue">
              <div className="icon-box"><Wallet size={24}/></div>
              <div><small>Saldo ({filterType})</small><h3>Rp {formatRp(saldo)}</h3></div>
            </div>
            <div className="stat-card green">
              <div className="icon-box"><TrendingUp size={24}/></div>
              <div><small>Masuk ({filterType})</small><h3>Rp {formatRp(totalIncome)}</h3></div>
            </div>
            <div className="stat-card red">
              <div className="icon-box"><TrendingDown size={24}/></div>
              <div><small>Keluar ({filterType})</small><h3>Rp {formatRp(totalExpense)}</h3></div>
            </div>
          </div>

          <div className="bottom-grid">
            <div className="card history-card" style={{gridColumn: 'span 2'}}>
              <h3>Riwayat Transaksi ({filteredData.length})</h3>
              <div className="table-responsive">
                <table>
                  <thead>
                    <tr>
                      <th>TANGGAL</th>
                      <th>KETERANGAN</th>
                      <th>NOMINAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.length === 0 ? (
                      <tr><td colSpan="3" style={{textAlign:'center', padding:'20px', color:'#888'}}>Data kosong untuk periode ini</td></tr>
                    ) : (
                      filteredData.map(t => (
                        <tr key={t.id}>
                          <td>{t.dateDisplay}</td>
                          <td>{t.desc}</td>
                          <td className={t.type === 'income' ? 'text-green' : 'text-red'}>
                            {t.type === 'income' ? '+' : '-'} Rp {formatRp(t.amount)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default App;
