import { useState, useRef, useEffect } from 'react'
import { useLandedStore } from '../store'
import { callLandedAI, makeChatSystemPrompt } from '../utils/ai'
import { type Message } from '../types'

export function AIChat() {
  const { profile, chatMessages, chatOpen, toggleChat, addMessage, updateLastAssistantMessage } = useLandedStore()
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (chatOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 200)
    }
  }, [chatOpen])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages, streaming])

  const streamingContent = useRef('')

  const sendFixed = async () => {
    const text = input.trim()
    if (!text || streaming) return
    setInput('')
    setError(null)
    streamingContent.current = ''

    const userMsg: Message = { role: 'user', content: text, id: Date.now().toString() }
    addMessage(userMsg)
    const assistantMsg: Message = { role: 'assistant', content: '', id: (Date.now() + 1).toString() }
    addMessage(assistantMsg)
    setStreaming(true)

    try {
      const systemPrompt = makeChatSystemPrompt(profile)
      const historyMessages = [...chatMessages, userMsg].map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }))

      await callLandedAI(
        systemPrompt,
        profile,
        (chunk) => {
          streamingContent.current += chunk
          updateLastAssistantMessage(streamingContent.current)
        },
        historyMessages,
        600
      )
    } catch (e: unknown) {
      updateLastAssistantMessage('Sorry, I ran into an issue. Please try again.')
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setStreaming(false)
      streamingContent.current = ''
    }
  }

  const STARTERS = [
    'Which card is actually easiest to get?',
    'What income should I report?',
    'How long until my score hits 700?',
  ]

  return (
    <>
      {/* Floating chat button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 z-40 rounded-full bg-accent text-white
          flex items-center justify-center shadow-lg shadow-accent/25
          hover:bg-accent-dark active:scale-95 transition-all"
        style={{ width: '52px', height: '52px' }}
        aria-label="Ask anything"
      >
        {chatOpen ? (
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <path d="M4 4L16 16M16 4L4 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M2 5C2 3.9 2.9 3 4 3H16C17.1 3 18 3.9 18 5V13C18 14.1 17.1 15 16 15H11L7 18V15H4C2.9 15 2 14.1 2 13V5Z"
              stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" fill="currentColor" fillOpacity="0.15"/>
          </svg>
        )}
      </button>

      {/* Backdrop */}
      {chatOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
          onClick={toggleChat}
        />
      )}

      {/* Chat side panel */}
      <div
        className="fixed top-0 right-0 bottom-0 z-50 flex flex-col w-full max-w-sm transition-transform duration-300 ease-out"
        style={{
          transform: chatOpen ? 'translateX(0)' : 'translateX(100%)',
          boxShadow: chatOpen ? '-8px 0 40px rgba(0,0,0,0.10)' : 'none',
          background: 'var(--surface)',
          borderLeft: '1px solid var(--border)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <p className="font-body font-semibold text-text-primary text-sm">Ask anything</p>
            <p className="font-body text-xs text-text-secondary">Context-aware financial guide</p>
          </div>
          <button
            onClick={toggleChat}
            className="w-8 h-8 rounded-lg bg-surface-raised flex items-center justify-center
              text-text-secondary hover:text-text-primary transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-3 scroll-area">
          {chatMessages.length === 0 && (
            <div className="flex flex-col gap-2 mt-2">
              <p className="font-body text-sm text-text-secondary text-center mb-3">
                I know your profile. Ask me anything.
              </p>
              {STARTERS.map((q) => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="text-left px-4 py-3 rounded-xl bg-surface-raised border border-border
                    font-body text-sm text-text-secondary hover:border-border-hover hover:text-text-primary transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {chatMessages.map((msg, idx) => {
            const isLastAssistant = msg.role === 'assistant' && idx === chatMessages.length - 1
            return (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                style={{ animation: 'fade-up 0.25s ease forwards' }}
              >
                <div
                  className={`max-w-[85%] px-4 py-3 rounded-2xl font-body text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-accent text-white rounded-br-sm'
                      : 'bg-surface-raised text-text-primary rounded-bl-sm border border-border'
                  }`}
                >
                  {msg.content || (streaming && isLastAssistant ? '' : '…')}
                  {isLastAssistant && streaming && <span className="blinking-cursor" />}
                </div>
              </div>
            )
          })}

          {error && (
            <p className="font-body text-xs text-danger text-center">{error}</p>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-4 border-t border-border">
          <div className="flex gap-2 items-center">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendFixed()}
              placeholder="Ask about your cards, credit, income…"
              className="flex-1 px-4 py-2.5 rounded-xl bg-surface-raised border border-border
                text-text-primary font-body text-sm placeholder:text-text-muted
                focus:outline-none focus:border-accent transition-colors"
            />
            <button
              onClick={sendFixed}
              disabled={!input.trim() || streaming}
              className="w-10 h-10 rounded-xl bg-accent text-white flex items-center justify-center
                disabled:opacity-30 hover:bg-accent-dark active:scale-95 transition-all flex-shrink-0"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M2 8H14M14 8L9 3M14 8L9 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
