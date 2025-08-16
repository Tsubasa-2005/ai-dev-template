'use client';
import { api } from '@/lib/apiClient';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function Home() {
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [chatModel, setChatModel] = useState('');
  const [models, setModels] = useState<Array<{ id: string; name: string }>>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatReply, setChatReply] = useState('');

  const handlePing = async () => {
    setLoading(true);
    setStatus('');
    try {
      const data = await api.ping();
      setStatus(JSON.stringify(data));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setStatus(`Error: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const list = await api.models();
        setModels(list);
        // Initialize default model from the first item if available
        if (list.length > 0) setChatModel(list[0].id);
      } catch {
        // ignore listing error in UI; allow manual input
      }
    })();
  }, []);

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[16px] row-start-2 items-center sm:items-start w-full max-w-2xl">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <div className="flex gap-3 items-center">
          <button
            onClick={handlePing}
            disabled={loading}
            className="rounded-md bg-blue-600 text-white px-4 py-2 text-sm disabled:opacity-50"
          >
            {loading ? 'Pinging...' : 'Ping FastAPI'}
          </button>
          <span className="text-sm text-gray-500">
            Calls GET {process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}/ping
          </span>
        </div>
        {status && (
          <pre className="mt-2 w-full overflow-auto rounded bg-black/5 dark:bg-white/10 p-3 text-xs">
            {status}
          </pre>
        )}

        <hr className="my-4 w-full border-gray-200/40" />
        <div className="w-full space-y-2">
          <div className="flex items-center gap-2">
            <label className="text-sm">Model</label>
            <select
              value={chatModel}
              onChange={(e) => setChatModel(e.target.value)}
              className="border rounded px-2 py-1 text-sm min-w-56"
            >
              {models.length > 0 ? (
                models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name || m.id}
                  </option>
                ))
              ) : (
                <option value="">Loading models...</option>
              )}
            </select>
          </div>
          <div className="flex items-start gap-2">
            <textarea
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              rows={3}
              placeholder="Ask something..."
              className="flex-1 border rounded px-2 py-1 text-sm"
            />
            <button
              onClick={async () => {
                setChatReply('');
                const messages = [
                  { role: 'system', content: 'You are a helpful assistant.' },
                  { role: 'user', content: chatInput || 'Say hello' },
                ];
                try {
                  const r = await api.chat(chatModel, messages);
                  setChatReply(r.reply || '');
                } catch (e: unknown) {
                  setChatReply(e instanceof Error ? e.message : String(e));
                }
              }}
              className="rounded-md bg-emerald-600 text-white px-3 py-2 text-sm disabled:opacity-50"
              disabled={!chatInput}
            >
              Send
            </button>
          </div>
          {chatReply && (
            <div className="rounded bg-black/5 dark:bg-white/10 p-3 text-sm whitespace-pre-wrap">
              {chatReply}
            </div>
          )}
        </div>

        <div className="flex gap-4 items-center flex-col sm:flex-row mt-6">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Deploy now
          </a>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read our docs
          </a>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image aria-hidden src="/file.svg" alt="File icon" width={16} height={16} />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image aria-hidden src="/window.svg" alt="Window icon" width={16} height={16} />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image aria-hidden src="/globe.svg" alt="Globe icon" width={16} height={16} />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
