import { useRef, useEffect, useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { socket } from '../../socket/client';

export function ChatBox() {
  const [input, setInput] = useState('');
  const messages = useGameStore((s) => s.chatMessages);
  const myColor = useGameStore((s) => s.myColor);
  const myId = useGameStore((s) => s.myId);
  const phase = useGameStore((s) => s.phase);
  const teams = useGameStore((s) => s.teams);
  const bottomRef = useRef<HTMLDivElement>(null);

  const myTeam = teams.find((t) => t.playerIds.includes(myId));
  const isTeamChat = phase === 'VOTING_THEME' && !!myTeam;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    socket.emit('send-chat', text);
    setInput('');
  };

  return (
    <div style={{ position: 'absolute', bottom: 20, left: 20, zIndex: 20, width: 280 }}>
      <div
        style={{
          background: 'rgba(10,10,20,0.75)',
          backdropFilter: 'blur(16px)',
          border: `1px solid ${isTeamChat ? myTeam!.color + '66' : 'rgba(255,255,255,0.1)'}`,
          borderRadius: 12,
          overflow: 'hidden',
        }}
      >
        {isTeamChat && (
          <div style={{
            padding: '5px 10px',
            fontSize: 11,
            fontWeight: 700,
            color: myTeam!.color,
            background: myTeam!.color + '18',
            borderBottom: `1px solid ${myTeam!.color}33`,
            letterSpacing: 0.5,
          }}>
            TEAM CHAT — {myTeam!.name}
          </div>
        )}

        {/* Messages */}
        <div
          style={{
            height: 180,
            overflowY: 'auto',
            padding: '8px 10px',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          {messages.map((msg) => (
            <div key={msg.id} style={{ fontSize: 12, lineHeight: '1.4' }}>
              <span style={{ color: msg.color, fontWeight: 700 }}>{msg.name}: </span>
              <span style={{ color: 'rgba(255,255,255,0.85)' }}>{msg.text}</span>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex' }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder={isTeamChat ? 'Message your team...' : 'Type a message...'}
            maxLength={300}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#fff',
              fontSize: 12,
              padding: '8px 10px',
            }}
          />
          <button
            onClick={send}
            style={{
              background: myColor,
              border: 'none',
              color: '#000',
              fontWeight: 700,
              fontSize: 11,
              padding: '0 12px',
              cursor: 'pointer',
            }}
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
