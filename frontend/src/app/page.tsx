'use client';
import { api } from '@/lib/apiClient';
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';

type Role = 'system' | 'user' | 'assistant';
type Message = { role: Role; content: string };

export default function Home() {
  // Header / model state (fixed presets)
  const PRESET_MODELS: Array<{ id: string; name: string }> = [
    { id: 'anthropic/claude-3.7-sonnet', name: 'Claude (Sonnet 3.7)' },
    { id: 'openai/gpt-4o-mini', name: 'ChatGPT (GPT-4o mini)' },
    { id: 'google/gemini-2.5-flash', name: 'Gemini (2.5 Flash)' },
  ];
  const [models] = useState(PRESET_MODELS);
  const [model, setModel] = useState(PRESET_MODELS[0]?.id || '');

  // Chat state
  const [messages, setMessages] = useState<Message[]>([
    { role: 'system', content: 'You are a helpful assistant.' },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [pingStatus, setPingStatus] = useState<string>('');

  const scrollRef = useRef<HTMLDivElement>(null);
  const visibleMessages = useMemo(() => messages.filter((m) => m.role !== 'system'), [messages]);

  // Auto-scroll on new message
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [visibleMessages.length, sending]);

  // No dynamic model loading; presets only

  const doSend = async () => {
    if (!input.trim() || sending) return;
    const next = [...messages, { role: 'user', content: input.trim() } as Message];
    setMessages(next);
    setInput('');
    setSending(true);
    try {
      const res = await api.chat(model || models[0]?.id || 'openrouter/auto', next);
      const reply = res.reply || '';
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setMessages((prev) => [...prev, { role: 'assistant', content: `Error: ${msg}` }]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void doSend();
    }
  };

  const handlePing = async () => {
    setPingStatus('');
    try {
      const data = await api.ping();
      setPingStatus(`Ping OK: ${JSON.stringify(data)}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setPingStatus(`Ping NG: ${msg}`);
    }
    setTimeout(() => setPingStatus(''), 3000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-black/10 dark:border-white/10 bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-3xl px-4 py-3 flex items-center gap-3">
          <Image className="dark:invert" src="/next.svg" alt="Next.js" width={76} height={16} />
          <div className="text-sm text-gray-500">AI Dev Template</div>
          <div className="ml-auto flex items-center gap-2">
            <select
              aria-label="Model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="border rounded-md px-2 py-1 text-sm min-w-56 bg-transparent"
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
            <button
              onClick={handlePing}
              className="rounded-md border px-3 py-1.5 text-sm hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
            >
              Ping
            </button>
          </div>
        </div>
        {pingStatus && (
          <div className="mx-auto max-w-3xl px-4 pb-2 text-xs text-gray-500">{pingStatus}</div>
        )}
      </header>

      {/* Messages */}
      <main className="mx-auto max-w-3xl w-full flex-1 px-4">
        <div ref={scrollRef} className="h-full overflow-y-auto py-6">
          {visibleMessages.length === 0 ? (
            <div className="mt-20 text-center text-gray-500">
              <div className="text-lg font-medium">モデルを選んで質問を入力してください</div>
              <div className="text-sm mt-2">Shift+Enter で改行、Enter で送信</div>
            </div>
          ) : (
            <div className="space-y-4">
              {visibleMessages.map((m, idx) => {
                const isUser = m.role === 'user';
                return (
                  <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap leading-relaxed shadow-sm ${
                        isUser
                          ? 'bg-blue-600 text-white rounded-br-sm'
                          : 'bg-black/[0.04] dark:bg-white/[0.06] rounded-bl-sm'
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Composer */}
      <div className="sticky bottom-0 w-full border-t border-black/10 dark:border-white/10 bg-background/80 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 py-3">
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="メッセージを入力... (Enterで送信 / Shift+Enterで改行)"
              className="flex-1 resize-none rounded-xl border bg-transparent px-3 py-2 text-sm leading-6 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
            <button
              onClick={doSend}
              disabled={sending || !input.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 text-white px-4 py-2 text-sm disabled:opacity-50"
            >
              {sending ? (
                <>
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/60 border-t-transparent inline-block" />
                  送信中
                </>
              ) : (
                '送信'
              )}
            </button>
          </div>
          <div className="mt-2 text-[11px] text-gray-500">
            API: {(process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000') as string}
          </div>
        </div>
      </div>
    </div>
  );
}
