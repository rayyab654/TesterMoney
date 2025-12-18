import { useState, useEffect } from 'react';
import './App.css';
import { 
  PlusCircle, Wallet, TrendingUp, TrendingDown, 
  FileSpreadsheet, FileText, LogOut, LogIn 
} from 'lucide-react';
import { auth, loginWithGoogle, logout } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // State untuk Input & Data
  const [transactions, setTransactions] = useState([]);
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('income'); // 'income' or 'expense'

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

  // Tambah Transaksi
  const handleSave = () => {
    if (!desc || !amount) return;
    const newTx = {
      id: Date.now(),
      desc,
      amount: parseFloat(amount),
      type,
      date: new Date().toLocaleDateString('id-ID')
    };
    setTransactions([newTx, ...transactions]);
    setDesc('');
    setAmount('');
  };

  // Hitung-hitungan
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, c) => acc + c.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, c) => acc + c.amount, 0);
  const saldo = totalIncome - totalExpense;

  const formatRp = (n) => new Intl.NumberFormat('id-ID').format(n);

  if (loading) return <div className="loading">Memuat...</div>;

  // --- HALAMAN LOGIN (JIKA BELUM MASUK) ---
  if (!user) {
    return (
      <div className="login-wrapper">
        <div className="login-card">
          <h1 className="brand-logo">ZyFinansialPro</h1>
          <p>Kelola keuangan harian, bulanan, dan tahunan.</p>
          <button onClick={loginWithGoogle} className="google-btn">
            <LogIn size={18} /> Sign In with Google
          </button>
        </div>
      </div>
    );
  }

  // --- HALAMAN DASHBOARD (SESUAI GAMBAR) ---
  return (
    <div className="app-container">
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="nav-brand">
          <Wallet className="brand-icon" />
          <h2>ZyFinansialPro</h2>
        </div>
        <div className="nav-profile">
          <span>Halo, {user.displayName ? user.displayName.split(' ')[0] : 'User'}</span>
          <img src={user.photoURL || 'https://via.placeholder.com/40'} alt="profile" className="avatar" />
          <button onClick={logout} className="btn-logout" title="Sign Out">
            <LogOut size={18} />
          </button>
        </div>
      </nav>

      <main className="main-content">
        {/* KOLOM KIRI: FORM & EXPORT */}
        <div className="left-column">
          {/* Card Transaksi Baru */}
          <div className="card form-card">
            <h3><PlusCircle size={20}/> Transaksi Baru</h3>
            
            <div className="form-group">
              <label>Keterangan</label>
              <input 
                type="text" 
                placeholder="Contoh: Gaji, Makan..." 
                value={desc}
                onChange={e => setDesc(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Nominal (Rp)</label>
              <input 
                type="number" 
                placeholder="0" 
                value={amount}
                onChange={e => setAmount(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Tipe</label>
              <div className="type-buttons">
                <button 
                  className={`type-btn ${type === 'income' ? 'active income' : ''}`}
                  onClick={() => setType('income')}
                >
                  Pemasukan
                </button>
                <button 
                  className={`type-btn ${type === 'expense' ? 'active expense' : ''}`}
                  onClick={() => setType('expense')}
                >
                  Pengeluaran
                </button>
              </div>
            </div>

            <button className="btn-save" onClick={handleSave}>Simpan Transaksi</button>
          </div>

          {/* Card Export */}
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
            <select className="date-filter">
              <option>Bulan Ini</option>
              <option>Tahun Ini</option>
            </select>
          </div>

          {/* 3 Kotak Statistik */}
          <div className="stats-grid">
            <div className="stat-card blue">
              <div className="icon-box"><Wallet size={24}/></div>
              <div>
                <small>Saldo Saat Ini</small>
                <h3>Rp {formatRp(saldo)}</h3>
              </div>
            </div>
            <div className="stat-card green">
              <div className="icon-box"><TrendingUp size={24}/></div>
              <div>
                <small>Total Pemasukan</small>
                <h3>Rp {formatRp(totalIncome)}</h3>
              </div>
            </div>
            <div className="stat-card red">
              <div className="icon-box"><TrendingDown size={24}/></div>
              <div>
                <small>Total Pengeluaran</small>
                <h3>Rp {formatRp(totalExpense)}</h3>
              </div>
            </div>
          </div>

          {/* Grid Bawah: Grafik & Riwayat */}
          <div className="bottom-grid">
            <div className="card chart-card">
              <h3>Statistik Bulanan</h3>
              <div className="chart-placeholder">
                <p>Belum ada data grafik</p>
              </div>
            </div>

            <div className="card history-card">
              <h3>Riwayat Transaksi</h3>
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
                    {transactions.length === 0 ? (
                      <tr><td colSpan="3" style={{textAlign:'center', padding:'20px', color:'#888'}}>Data kosong</td></tr>
                    ) : (
                      transactions.map(t => (
                        <tr key={t.id}>
                          <td>{t.date}</td>
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
