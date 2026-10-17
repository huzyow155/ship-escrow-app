import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon, Wallet, Anchor } from 'lucide-react';
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
      if (!ethereum) return;
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
        borderBottom: '2px dashed var(--border-dashed)',
        background: 'var(--bg-card)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: '64px',
          paddingTop: '8px',
          paddingBottom: '8px',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        {/* Customs Wordmark */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
          aria-label="Ship Escrow Homepage"
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '4px',
              background: 'var(--bg-card-header)',
              border: '1px solid var(--border)',
            }}
          >
            <Anchor size={18} style={{ color: 'var(--stamp-ochre)' }} />
          </div>
          <div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '18px',
                fontWeight: 700,
                letterSpacing: '-0.01em',
                lineHeight: 1.1,
              }}
            >
              SHIP ESCROW
            </div>
            <div
              className="font-mono"
              style={{
                fontSize: '9px',
                letterSpacing: '0.12em',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
              }}
            >
              Customs Manifest
            </div>
          </div>
          <span className="docket-tab" style={{ marginLeft: '4px' }}>
            Studionet Preview 61999
          </span>
        </Link>

        {/* Navigation Tabs */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '13px',
            fontWeight: 600,
            overflowX: 'auto',
            maxWidth: '100%',
            padding: '2px 0',
          }}
        >
          {[
            { path: '/app', label: 'Manifest Board' },
            { path: '/app/create', label: 'New Docket' },
            { path: '/app/reputation', label: 'Reputation' },
            { path: '/app/evidence', label: 'Evidence' },
            { path: '/app/limits', label: 'Limits' },
          ].map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  padding: '6px 11px',
                  borderRadius: '6px',
                  background: active ? 'var(--bg-card-header)' : 'transparent',
                  color: active ? 'var(--text-main)' : 'var(--text-muted)',
                  border: active ? '1px solid var(--border)' : '1px solid transparent',
                  fontFamily: 'var(--font-sans)',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Controls: Balance, Wallet, Theme Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {account && (
            <div
              className="font-mono"
              style={{
                fontSize: '11px',
                padding: '5px 9px',
                borderRadius: '4px',
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border)',
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{ color: 'var(--text-muted)' }}>Balance: </span>
              <strong>{balance}</strong>
            </div>
          )}

          <button
            onClick={connectWallet}
            className="btn btn-secondary"
            style={{
              fontSize: '12px',
              padding: '6px 12px',
              minHeight: '36px',
              height: '36px',
            }}
          >
            <Wallet size={14} />
            <span className="font-mono">
              {account
                ? `${account.slice(0, 6)}...${account.slice(-4)}`
                : 'Connect'}
            </span>
          </button>

          <button
            onClick={toggleTheme}
            className="btn btn-outline"
            style={{
              padding: '6px',
              minHeight: '36px',
              height: '36px',
              width: '36px',
            }}
            title="Toggle theme"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </div>
    </header>
  );
};
