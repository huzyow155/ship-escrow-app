import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon, Wallet, Ship } from 'lucide-react';
import { getBalance } from '../services/escrowRead';
import { ensureStudionetNetwork } from '../services/reputation';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ship-theme') as 'light' | 'dark' | null;
      const initial = saved || 'dark';
      document.documentElement.setAttribute('data-theme', initial);
      return initial;
    }
    return 'dark';
  });
  const [account, setAccount] = useState<string>('');
  const [balance, setBalance] = useState<string>('0');

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('ship-theme', next);
    document.documentElement.setAttribute('data-theme', next);
  };

  const connectWallet = async () => {
    try {
      await ensureStudionetNetwork();
      const ethereum = (window as any).ethereum;
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts && accounts.length > 0) {
        setAccount(accounts[0]);
        const bal = await getBalance(accounts[0]);
        setBalance(bal);
      }
    } catch (err: any) {
      console.warn('Wallet connection skipped or failed:', err?.message || err);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      const ethereum = (window as any).ethereum;
      ethereum
        .request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts && accounts.length > 0) {
            setAccount(accounts[0]);
            getBalance(accounts[0]).then(setBalance).catch(() => {});
          }
        })
        .catch(() => {});

      const handleAccountsChanged = (accs: string[]) => {
        if (accs.length > 0) {
          setAccount(accs[0]);
          getBalance(accs[0]).then(setBalance).catch(() => {});
        } else {
          setAccount('');
          setBalance('0');
        }
      };

      ethereum.on?.('accountsChanged', handleAccountsChanged);
      return () => {
        ethereum.removeListener?.('accountsChanged', handleAccountsChanged);
      };
    }
  }, []);

  const isActive = (path: string) => {
    if (path === '/app' && location.pathname === '/app') return true;
    if (path !== '/app' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header
      style={{
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-card)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '64px',
          gap: '16px',
        }}
      >
        {/* Brand */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: 800,
            letterSpacing: '0.5px',
          }}
        >
          <Ship size={24} style={{ color: 'var(--primary)' }} />
          <span>SHIP ESCROW</span>
          <span
            className="badge badge-open"
            style={{ fontSize: '10px', padding: '2px 6px' }}
          >
            Preview 61999
          </span>
        </Link>

        {/* Navigation Links */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            fontWeight: 600,
          }}
        >
          <Link
            to="/app"
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              background: isActive('/app') ? 'var(--bg-subtle)' : 'transparent',
              color: isActive('/app') ? 'var(--primary)' : 'var(--text-main)',
            }}
          >
            Bounties
          </Link>
          <Link
            to="/app/create"
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              background: isActive('/app/create') ? 'var(--bg-subtle)' : 'transparent',
              color: isActive('/app/create') ? 'var(--primary)' : 'var(--text-main)',
            }}
          >
            New Bounty
          </Link>
          <Link
            to="/app/reputation"
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              background: isActive('/app/reputation') ? 'var(--bg-subtle)' : 'transparent',
              color: isActive('/app/reputation') ? 'var(--primary)' : 'var(--text-main)',
            }}
          >
            Reputation
          </Link>
          <Link
            to="/app/evidence"
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              background: isActive('/app/evidence') ? 'var(--bg-subtle)' : 'transparent',
              color: isActive('/app/evidence') ? 'var(--primary)' : 'var(--text-main)',
            }}
          >
            Evidence
          </Link>
          <Link
            to="/app/limits"
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              background: isActive('/app/limits') ? 'var(--bg-subtle)' : 'transparent',
              color: isActive('/app/limits') ? 'var(--primary)' : 'var(--text-main)',
            }}
          >
            Limits
          </Link>
        </nav>

        {/* Right Actions: Balance, Wallet, Theme */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {account && (
            <div
              className="font-mono"
              style={{
                fontSize: '12px',
                padding: '4px 10px',
                borderRadius: '6px',
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border)',
              }}
            >
              <span style={{ color: 'var(--text-muted)' }}>Credits: </span>
              <strong>{balance}</strong>
            </div>
          )}

          <button
            onClick={connectWallet}
            className="btn btn-secondary"
            style={{ fontSize: '13px', padding: '6px 14px' }}
          >
            <Wallet size={16} />
            <span className="font-mono">
              {account
                ? `${account.slice(0, 6)}...${account.slice(-4)}`
                : 'Connect Wallet'}
            </span>
          </button>

          <button
            onClick={toggleTheme}
            className="btn btn-outline"
            style={{ padding: '8px' }}
            title="Toggle theme"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </div>
    </header>
  );
};
