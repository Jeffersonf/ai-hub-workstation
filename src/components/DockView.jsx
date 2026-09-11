import React, { useState, useEffect, useMemo } from 'react';
import { DockBar } from './DockBar';
import { AccountCardPopover } from './AccountCardPopover';

export function DockView() {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState(null);

  // Load initial accounts and listen for real-time updates
  useEffect(() => {
    if (window.electronAPI?.getAccounts) {
      window.electronAPI.getAccounts().then((data) => {
        if (Array.isArray(data)) setAccounts(data);
      });
    }

    if (window.electronAPI?.onAccountsUpdated) {
      return window.electronAPI.onAccountsUpdated((updated) => {
        if (Array.isArray(updated)) setAccounts(updated);
      });
    }
  }, []);

  // Compute recommended account (account with highest quota & active)
  const recommendedAccountId = useMemo(() => {
    if (!accounts || accounts.length === 0) return null;
    let best = accounts[0];
    for (const acc of accounts) {
      if ((acc.quotaPercent ?? 0) > (best.quotaPercent ?? 0)) {
        best = acc;
      }
    }
    return best?.id || null;
  }, [accounts]);

  const selectedAccount = useMemo(() => {
    return accounts.find((a) => a.id === selectedAccountId) || null;
  }, [accounts, selectedAccountId]);

  const handleSelectAccount = (id) => {
    const nextId = selectedAccountId === id ? null : id;
    setSelectedAccountId(nextId);
    if (window.electronAPI?.setDockExpanded) {
      window.electronAPI.setDockExpanded(!!nextId);
    }
  };

  const handleClosePopover = () => {
    setSelectedAccountId(null);
    if (window.electronAPI?.setDockExpanded) {
      window.electronAPI.setDockExpanded(false);
    }
  };

  const handleUpdateQuota = (id, newPercent) => {
    const updated = accounts.map((acc) => {
      if (acc.id === id) {
        return {
          ...acc,
          quotaPercent: newPercent,
          lastChecked: new Date().toLocaleTimeString('pt-BR')
        };
      }
      return acc;
    });
    setAccounts(updated);
    if (window.electronAPI?.saveAccounts) {
      window.electronAPI.saveAccounts(updated);
    }
  };

  const handleOpenWorkstation = (accId) => {
    if (window.electronAPI?.restoreWorkstation) {
      window.electronAPI.restoreWorkstation(accId || selectedAccountId);
    }
  };

  const handleOpenUrl = (url) => {
    if (window.electronAPI?.openExternal && url) {
      window.electronAPI.openExternal(url);
    }
  };

  const handleMinimize = () => {
    if (window.electronAPI?.minimize) {
      window.electronAPI.minimize();
    }
  };

  const handleClose = () => {
    if (window.electronAPI?.closeDock) {
      window.electronAPI.closeDock();
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-end select-none overflow-hidden pr-1 relative bg-transparent">
      {/* Click-away backdrop to close popover */}
      {selectedAccount && (
        <div
          className="absolute inset-0 z-10"
          onClick={handleClosePopover}
          style={{ WebkitAppRegion: 'no-drag' }}
        />
      )}

      {/* Flyout Card (Expands smoothly to the left of the dock) */}
      {selectedAccount && (
        <div
          className="relative z-20 mr-3 animate-in fade-in slide-in-from-right-4 duration-200"
          style={{ WebkitAppRegion: 'no-drag' }}
        >
          <AccountCardPopover
            account={selectedAccount}
            isRecommended={recommendedAccountId === selectedAccount.id}
            onClose={handleClosePopover}
            onOpenUrl={handleOpenUrl}
            onOpenAccountWindow={() => handleOpenWorkstation(selectedAccount.id)}
            onUpdateQuota={handleUpdateQuota}
            onEdit={() => handleOpenWorkstation(selectedAccount.id)}
          />
        </div>
      )}

      {/* Resvori Vertical Dock Bar */}
      <div className="relative z-20 h-full flex items-center justify-center">
        <DockBar
          accounts={accounts}
          selectedAccountId={selectedAccountId}
          recommendedAccountId={recommendedAccountId}
          onSelectAccount={handleSelectAccount}
          onOpenSettings={() => handleOpenWorkstation()}
          onOpenPrompts={() => handleOpenWorkstation()}
          onOpenSplit={() => handleOpenWorkstation()}
          onMinimize={handleMinimize}
          onClose={handleClose}
          onRestoreWorkstation={() => handleOpenWorkstation()}
        />
      </div>
    </div>
  );
}
export default DockView;
