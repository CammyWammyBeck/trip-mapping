import { useState } from 'react';
import { shareApi } from '../../api';

interface Props {
  tripId: number;
  existingToken: string | null;
}

export function ShareButton({ tripId, existingToken }: Props) {
  const [token, setToken] = useState<string | null>(existingToken);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (token) {
      await copyToClipboard(token);
      return;
    }

    setLoading(true);
    try {
      const result = await shareApi.generateToken(tripId);
      setToken(result.share_token);
      await copyToClipboard(result.share_token);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (t: string) => {
    const url = `${window.location.origin}/shared/${t}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleShare}
      disabled={loading}
      title={token ? 'Copy share link' : 'Generate share link'}
      style={{
        padding: '8px 12px',
        borderRadius: 6,
        border: '1px solid #d0d0d0',
        background: copied ? '#34a853' : '#fbbc04',
        color: copied ? '#fff' : '#1a1a1a',
        cursor: loading ? 'wait' : 'pointer',
        fontSize: 14,
        fontWeight: 600,
        whiteSpace: 'nowrap',
      }}
    >
      {loading ? '...' : copied ? 'Copied!' : 'Share'}
    </button>
  );
}
