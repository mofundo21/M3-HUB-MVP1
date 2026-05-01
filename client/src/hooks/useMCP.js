import { useState, useCallback } from 'react';

const API = import.meta.env.VITE_BACKEND_URL || 'https://m3-hub-mvp1-production.up.railway.app';

export function useMCP() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const call = useCallback(async (endpoint, data = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/api/mcp/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getMCPStatus = useCallback(async () => {
    const res = await fetch(`${API}/api/mcp/status`);
    return res.json();
  }, []);

  return { call, getMCPStatus, loading, error };
}
