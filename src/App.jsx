import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Plus, 
  Users, 
  UserPlus, 
  Send, 
  LogOut, 
  Sparkles, 
  Smile, 
  Copy, 
  Check, 
  Shield, 
  X, 
  Bell,
  HelpCircle,
  Hash
} from 'lucide-react';
import { chatSync } from './chatSync';

// Interactive Particle System Hook/Component (Standard §2 /animation's)
function CosmicDustCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let particles = [];
    let mouse = { x: null, y: null, lastX: null, lastY: null };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const handleMouseMove = (e) => {
      // Respect prefers-reduced-motion
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      mouse.x = e.clientX;
      mouse.y = e.clientY;

      if (mouse.lastX === null || mouse.lastY === null) {
        mouse.lastX = mouse.x;
        mouse.lastY = mouse.y;
        return;
      }

      const speed = Math.hypot(mouse.x - mouse.lastX, mouse.y - mouse.lastY);
      const count = Math.min(Math.floor(speed / 2.5) + 1, 5);

      for (let i = 0; i < count; i++) {
        const hslColors = [
          'hsla(180, 82%, 48%, alpha)',
          'hsla(270, 80%, 63%, alpha)',
          'hsla(35,  85%, 53%, alpha)',
          'hsla(340, 80%, 58%, alpha)',
          'hsla(145, 75%, 48%, alpha)',
          'hsla(210, 82%, 55%, alpha)'
        ];
        const colorTemplate = hslColors[Math.floor(Math.random() * hslColors.length)];

        particles.push({
          x: mouse.x + (Math.random() - 0.5) * 20,
          y: mouse.y + (Math.random() - 0.5) * 20,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2 - 0.6,
          size: Math.random() * 2.5 + 0.8,
          colorTemplate,
          alpha: 1,
          decay: Math.random() * 0.015 + 0.007
        });
      }

      mouse.lastX = mouse.x;
      mouse.lastY = mouse.y;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(idx, 1);
          return;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.colorTemplate.replace('alpha', p.alpha);
        ctx.shadowBlur = p.size * 2.5;
        ctx.shadowColor = p.colorTemplate.replace('alpha', p.alpha);
        ctx.fill();
      });
      ctx.shadowBlur = 0;

      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 0.85
      }} 
    />
  );
}

// React Confetti Emoji Explosion Component
function EmojiExplosion({ x, y, emoji }) {
  const [particles] = useState(() => {
    return Array.from({ length: 10 }).map((_, i) => {
      const angle = (i / 10) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      const velocity = Math.random() * 70 + 40;
      const tx = Math.cos(angle) * velocity;
      const ty = Math.sin(angle) * velocity - 25;
      const delay = Math.random() * 60;
      const scale = Math.random() * 0.4 + 0.8;
      return { id: i, tx, ty, delay, scale };
    });
  });

  return (
    <div style={{ position: 'fixed', left: x, top: y, pointerEvents: 'none', zIndex: 9999 }}>
      {particles.map(p => (
        <span
          key={p.id}
          className="exploding-emoji"
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            transform: 'translate3d(-50%, -50%, 0)',
            fontSize: '1.25rem',
            animationDelay: `${p.delay}ms`,
            '--tx': `${p.tx}px`,
            '--ty': `${p.ty}px`,
            '--scale': p.scale
          }}
        >
          {emoji}
        </span>
      ))}
    </div>
  );
}

// Magnetic Button Proximity Hook
function useMagnetic(pull = 0.25) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const handleMouseMove = (e) => {
      const rect = el.getBoundingClientRect();
      const elX = rect.left + rect.width / 2;
      const elY = rect.top + rect.height / 2;

      const dx = e.clientX - elX;
      const dy = e.clientY - elY;
      const distance = Math.hypot(dx, dy);

      if (distance < 90) {
        el.style.transform = `translate3d(${dx * pull}px, ${dy * pull}px, 0)`;
        el.style.transition = 'transform 80ms cubic-bezier(0.25, 1, 0.5, 1)';
      } else {
        el.style.transform = '';
        el.style.transition = 'transform 300ms cubic-bezier(0.16, 1, 0.3, 1)';
      }
    };

    const handleMouseLeave = () => {
      el.style.transform = '';
      el.style.transition = 'transform 300ms cubic-bezier(0.16, 1, 0.3, 1)';
    };

    window.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [pull]);

  return ref;
}

// Desaturated per 2026 UI standards — 80-85% saturation for eye comfort
const COLORS = [
  { value: 'hsl(180, 82%, 48%)', name: 'Cyan Spectra',   clrVar: '--clr-cyan' },
  { value: 'hsl(270, 80%, 63%)', name: 'Violet Nebula',  clrVar: '--clr-violet' },
  { value: 'hsl(35,  85%, 53%)', name: 'Amber Glow',     clrVar: '--clr-amber' },
  { value: 'hsl(340, 80%, 58%)', name: 'Rose Aurora',    clrVar: '--clr-rose' },
  { value: 'hsl(145, 75%, 48%)', name: 'Emerald Prism',  clrVar: '--clr-emerald' },
  { value: 'hsl(355, 78%, 56%)', name: 'Crimson Flare',  clrVar: '--clr-crimson' },
  { value: 'hsl(50,  85%, 50%)', name: 'Solar Ray',      clrVar: '--clr-gold' },
  { value: 'hsl(210, 82%, 55%)', name: 'Azure Deep',     clrVar: '--clr-azure' }
];

// Reusable Chat Client Component
function ChatClient({ 
  initialId = '', 
  defaultColorIndex = 0, 
  isSandbox = false,
  globalSandboxUsers = {},
  registerSandboxUser = () => {}
}) {
  const [myId, setMyId] = useState(initialId);
  const [myColor, setMyColor] = useState(COLORS[defaultColorIndex].value);
  const [isRegistered, setIsRegistered] = useState(false);
  const [roomInput, setRoomInput] = useState('');
  const [activeRoom, setActiveRoom] = useState(null); // { id, name }
  const [members, setMembers] = useState([]); // Array of HSL colors
  const [messages, setMessages] = useState([]); // Array of message objects
  const [invitations, setInvitations] = useState([]); // [{ roomId, roomName, hostColor }]
  const [knownUsers, setKnownUsers] = useState({}); // { userId: color }
  const [inputText, setInputText] = useState('');
  const [friendIdToInvite, setFriendIdToInvite] = useState('');
  const [inviteFeedback, setInviteFeedback] = useState(null);
  const [copiedRoomId, setCopiedRoomId] = useState(false);
  const [typingUsers, setTypingUsers] = useState({}); // { colorCode: timestamp }
  const [showEmojiPickerForMsg, setShowEmojiPickerForMsg] = useState(null); // messageId
  const [explosions, setExplosions] = useState([]); // [{ id, x, y, emoji }]

  const magneticSubmitRef = useMagnetic(0.22);
  const magneticCreateRef = useMagnetic(0.20);
  const magneticSendRef = useMagnetic(0.28);

  const triggerExplosion = (messageId, emoji) => {
    const el = document.getElementById(`msg-bubble-${messageId}`);
    if (el) {
      const rect = el.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      const id = Date.now() + Math.random();
      setExplosions(prev => [...prev, { id, x, y, emoji }]);
      setTimeout(() => {
        setExplosions(prev => prev.filter(exp => exp.id !== id));
      }, 1200);
    }
  };

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Find color name helper
  const getColorName = (colorValue) => {
    const found = COLORS.find(c => c.value === colorValue);
    return found ? found.name : 'Unknown Spectra';
  };

  // Auto scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUsers]);

  // Synchronize registered state with the parent sandbox component
  useEffect(() => {
    if (isRegistered && isSandbox && myId) {
      registerSandboxUser(myId, myColor);
    }
  }, [isRegistered, myId, myColor, isSandbox]);

  // Handle Incoming Broadcast Channel Events
  useEffect(() => {
    if (!isRegistered) return;

    const unsubscribe = chatSync.subscribe((event) => {
      const { type, payload } = event;

      switch (type) {
        case 'REGISTER_ONLINE':
          if (payload.userId !== myId) {
            setKnownUsers(prev => ({ ...prev, [payload.userId]: payload.color }));
            // Reply back immediately so the new user knows we are online
            chatSync.publish({
              type: 'REGISTER_REPLY',
              payload: { userId: myId, color: myColor }
            });
          }
          break;

        case 'REGISTER_REPLY':
          if (payload.userId !== myId) {
            setKnownUsers(prev => ({ ...prev, [payload.userId]: payload.color }));
          }
          break;

        case 'INVITE_USER':
          if (payload.targetId === myId) {
            // Check if invitation already exists to avoid duplicates
            setInvitations(prev => {
              if (prev.some(inv => inv.roomId === payload.roomId)) return prev;
              return [...prev, { 
                roomId: payload.roomId, 
                roomName: payload.roomName, 
                hostColor: payload.hostColor 
              }];
            });
          }
          break;

        case 'JOIN_ROOM':
          if (activeRoom && payload.roomId === activeRoom.id) {
            // Add user color to members list if not already there
            setMembers(prev => {
              if (prev.includes(payload.userColor)) return prev;
              return [...prev, payload.userColor];
            });

            // Add system message
            const systemMsgId = `sys_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
            setMessages(prev => [
              ...prev, 
              {
                id: systemMsgId,
                type: 'system',
                text: 'Someone in ' + getColorName(payload.userColor) + ' joined the chat',
                color: payload.userColor,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }
            ]);

            // If we are already in the room, we reply with current room state to sync the newcomer
            // We use a small randomized delay so multiple users don't overwhelm the network
            setTimeout(() => {
              chatSync.publish({
                type: 'ROOM_STATE_SYNC',
                payload: {
                  roomId: activeRoom.id,
                  roomName: activeRoom.name,
                  // We share the current list of member colors and messages
                  members: [...members, myColor, payload.userColor], 
                  messages: [
                    ...messages,
                    {
                      id: systemMsgId,
                      type: 'system',
                      text: 'Someone in ' + getColorName(payload.userColor) + ' joined the chat',
                      color: payload.userColor,
                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }
                  ]
                }
              });
            }, Math.random() * 400 + 100);
          }
          break;

        case 'ROOM_STATE_SYNC':
          if (activeRoom && payload.roomId === activeRoom.id) {
            // Newcomer initializes their room details from the synced state
            setMembers(prev => {
              const combined = new Set([...prev, ...payload.members]);
              return Array.from(combined);
            });
            // Update messages, but deduplicate by messageId
            setMessages(prev => {
              const msgMap = new Map();
              prev.forEach(m => msgMap.set(m.id, m));
              payload.messages.forEach(m => msgMap.set(m.id, m));
              return Array.from(msgMap.values()).sort((a, b) => a.id.localeCompare(b.id));
            });
          }
          break;

        case 'CHAT_MESSAGE':
          if (activeRoom && payload.roomId === activeRoom.id) {
            setMessages(prev => {
              if (prev.some(m => m.id === payload.messageId)) return prev;
              return [...prev, {
                id: payload.messageId,
                type: 'chat',
                text: payload.text,
                color: payload.color,
                senderId: payload.senderId,
                timestamp: payload.timestamp,
                reactions: payload.reactions || []
              }];
            });
            // Clear typing state for this color
            setTypingUsers(prev => {
              const copy = { ...prev };
              delete copy[payload.color];
              return copy;
            });
          }
          break;

        case 'TYPING_STATUS':
          if (activeRoom && payload.roomId === activeRoom.id && payload.color !== myColor) {
            if (payload.isTyping) {
              setTypingUsers(prev => ({
                ...prev,
                [payload.color]: Date.now()
              }));
            } else {
              setTypingUsers(prev => {
                const copy = { ...prev };
                delete copy[payload.color];
                return copy;
              });
            }
          }
          break;

        case 'REACTION':
          if (activeRoom && payload.roomId === activeRoom.id) {
            triggerExplosion(payload.messageId, payload.emoji);
            setMessages(prev => prev.map(msg => {
              if (msg.id === payload.messageId) {
                const existingReactions = msg.reactions || [];
                // Check if this specific color already reacted with this emoji
                const alreadyReacted = existingReactions.some(
                  r => r.userColor === payload.userColor && r.emoji === payload.emoji
                );

                let updatedReactions;
                if (alreadyReacted) {
                  // Toggle off (remove reaction)
                  updatedReactions = existingReactions.filter(
                    r => !(r.userColor === payload.userColor && r.emoji === payload.emoji)
                  );
                } else {
                  // Add new reaction, filter out other reactions by same user on same message if you want single reaction limit
                  const cleanReactions = existingReactions.filter(r => r.userColor !== payload.userColor);
                  updatedReactions = [...cleanReactions, { emoji: payload.emoji, userColor: payload.userColor }];
                }

                return { ...msg, reactions: updatedReactions };
              }
              return msg;
            }));
          }
          break;

        case 'LEAVE_ROOM':
          if (activeRoom && payload.roomId === activeRoom.id) {
            setMembers(prev => prev.filter(c => c !== payload.userColor));
            setMessages(prev => [
              ...prev,
              {
                id: `sys_leave_${Date.now()}`,
                type: 'system',
                text: 'Someone in ' + getColorName(payload.userColor) + ' left the room',
                color: payload.userColor,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }
            ]);
          }
          break;

        default:
          break;
      }
    });

    // Announce presence on register
    chatSync.publish({
      type: 'REGISTER_ONLINE',
      payload: { userId: myId, color: myColor }
    });

    return () => {
      unsubscribe();
    };
  }, [isRegistered, myId, myColor, activeRoom, members, messages]);

  // Periodic typing status cleanups (in case a user leaves or closes tab midway)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setTypingUsers(prev => {
        const copy = { ...prev };
        let changed = false;
        Object.keys(copy).forEach(color => {
          if (now - copy[color] > 3000) {
            delete copy[color];
            changed = true;
          }
        });
        return changed ? copy : prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Enter Incognito Dashboard
  const handleRegister = (e) => {
    e.preventDefault();
    if (!myId.trim()) return;
    setIsRegistered(true);
  };

  // Create Room
  const handleCreateRoom = (e) => {
    e.preventDefault();
    if (!roomInput.trim()) return;
    const newRoomId = `room_${Math.floor(1000 + Math.random() * 9000)}`;
    const room = {
      id: newRoomId,
      name: roomInput
    };
    setActiveRoom(room);
    setMembers([myColor]);
    setMessages([
      {
        id: `sys_create_${Date.now()}`,
        type: 'system',
        text: 'Room "' + roomInput + '" launched. Share Room ID: ' + newRoomId + ' to invite friends!',
        color: myColor,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setRoomInput('');
  };

  // Join Room
  const handleJoinRoom = (e, targetRoomId) => {
    if (e) e.preventDefault();
    const rId = targetRoomId || roomInput;
    if (!rId.trim()) return;

    const room = {
      id: rId,
      name: 'Connected Room'
    };

    setActiveRoom(room);
    setMembers([myColor]);
    setMessages([]);

    // Broadcast that we joined
    chatSync.publish({
      type: 'JOIN_ROOM',
      payload: {
        roomId: rId,
        userColor: myColor,
        userId: myId
      }
    });

    // Clear invitations that match this roomId
    setInvitations(prev => prev.filter(inv => inv.roomId !== rId));
    setRoomInput('');
  };

  // Accept Invite
  const handleAcceptInvite = (roomId) => {
    handleJoinRoom(null, roomId);
  };

  // Decline Invite
  const handleDeclineInvite = (roomId) => {
    setInvitations(prev => prev.filter(inv => inv.roomId !== roomId));
  };

  // Leave Room
  const handleLeaveRoom = () => {
    if (!activeRoom) return;

    chatSync.publish({
      type: 'LEAVE_ROOM',
      payload: {
        roomId: activeRoom.id,
        userColor: myColor
      }
    });

    setActiveRoom(null);
    setMembers([]);
    setMessages([]);
  };

  // Send Message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeRoom) return;

    const messageId = `msg_${Date.now()}_${myId}_${Math.random().toString(36).substr(2, 5)}`;
    const message = {
      messageId,
      roomId: activeRoom.id,
      text: inputText,
      color: myColor,
      senderId: myId, // Only used for outgoing check, omitted from display
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reactions: []
    };

    // Publish to the channel
    chatSync.publish({
      type: 'CHAT_MESSAGE',
      payload: message
    });

    setInputText('');

    // Stop typing broadcast
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    chatSync.publish({
      type: 'TYPING_STATUS',
      payload: { roomId: activeRoom.id, color: myColor, isTyping: false }
    });
  };

  // Handle Typing indicator
  const handleInputChange = (e) => {
    setInputText(e.target.value);
    if (!activeRoom) return;

    // Broadcast we are typing
    chatSync.publish({
      type: 'TYPING_STATUS',
      payload: { roomId: activeRoom.id, color: myColor, isTyping: true }
    });

    // Debounce stop typing status
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      chatSync.publish({
        type: 'TYPING_STATUS',
        payload: { roomId: activeRoom.id, color: myColor, isTyping: false }
      });
    }, 2000);
  };

  // Invite Friend by ID
  const handleInviteFriend = (e) => {
    e.preventDefault();
    if (!friendIdToInvite.trim() || !activeRoom) return;

    const targetId = friendIdToInvite.trim();

    // Check if the user exists in knownUsers
    // Even if they don't, we still broadcast in case they just came online
    chatSync.publish({
      type: 'INVITE_USER',
      payload: {
        targetId,
        roomId: activeRoom.id,
        roomName: activeRoom.name,
        hostColor: myColor
      }
    });

    setInviteFeedback(`Invitation sent to "${targetId}"!`);
    setFriendIdToInvite('');

    setTimeout(() => {
      setInviteFeedback(null);
    }, 4000);
  };

  // React to Message
  const handleReactToMessage = (messageId, emoji) => {
    if (!activeRoom) return;

    triggerExplosion(messageId, emoji);

    chatSync.publish({
      type: 'REACTION',
      payload: {
        roomId: activeRoom.id,
        messageId,
        emoji,
        userColor: myColor
      }
    });
    setShowEmojiPickerForMsg(null);
  };

  // Copy Room ID to clipboard
  const copyRoomIdToClipboard = () => {
    if (!activeRoom) return;
    navigator.clipboard.writeText(activeRoom.id);
    setCopiedRoomId(true);
    setTimeout(() => setCopiedRoomId(false), 2000);
  };

  // Render Login / Setup Screen
  if (!isRegistered) {
    return (
      <div className="setup-container animate-fade-in">
        <div className="glass-panel setup-card" style={{ '--accent': myColor, '--accent-glow': myColor.replace(')', ', 0.15)').replace('hsl', 'hsla') }}>
          <div className="brand-logo" style={{ background: `linear-gradient(135deg, ${myColor} 0%, #a200ff 100%)`, margin: '0 auto 20px auto' }}>WHO</div>
          <h2 className="setup-title">Anonymous Chat</h2>
          <p className="setup-subtitle">Enter a custom ID to join the network. Inside groups, your ID will be completely hidden.</p>

          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ textAlign: 'left' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>YOUR UNIQUE ID</label>
              <div className="glass-input-wrapper">
                <input 
                  type="text" 
                  className="glass-input" 
                  placeholder="e.g. cyber_ghost, rudra_45"
                  value={myId}
                  onChange={(e) => setMyId(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  pattern="^[a-z0-9_]{3,16}$"
                  title="ID must be 3-16 characters, lowercase alphanumeric or underscores only."
                  required
                />
              </div>
            </div>

            <div style={{ textAlign: 'left' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>CHOOSE YOUR SIGNATURE SPECTRA COLOR</label>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '12px' }}>This color is how other group members will distinguish you in chats.</p>
              
              <div className="color-selector-grid">
                {COLORS.map((clr, idx) => (
                  <div 
                    key={idx}
                    className={`color-option ${myColor === clr.value ? 'selected' : ''}`}
                    style={{ backgroundColor: clr.value, color: clr.value }}
                    onClick={() => setMyColor(clr.value)}
                    title={clr.name}
                  />
                ))}
              </div>
            </div>

            <button 
              ref={magneticSubmitRef}
              type="submit" 
              className="btn-primary" 
              style={{ width: '100%' }}
              disabled={!myId.trim()}
            >
              <Shield size={18} /> Enter Incognito Network
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Render Lobby (Dashboard) View
  if (!activeRoom) {
    return (
      <div className="animate-fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Invitation Alerts Banner */}
        {invitations.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {invitations.map((inv, idx) => (
              <div key={idx} className="invitation-alert animate-fade-in" style={{ '--accent': inv.hostColor }}>
                <div className="invitation-content">
                  <div className="status-indicator" style={{ color: inv.hostColor, backgroundColor: inv.hostColor }}></div>
                  <span style={{ fontSize: '0.9rem' }}>
                    You've been invited to join the anonymous room <strong>"{inv.roomName}"</strong>
                  </span>
                </div>
                <div className="invitation-actions">
                  <button onClick={() => handleAcceptInvite(inv.roomId)} className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.8rem', height: '32px' }}>Accept</button>
                  <button onClick={() => handleDeclineInvite(inv.roomId)} className="btn-secondary" style={{ padding: '6px 14px', fontSize: '0.8rem', height: '32px' }}>Decline</button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="dashboard-grid">
          {/* Create Room Card */}
          <div className="glass-panel dashboard-card glass-panel-accent stagger-1" style={{ '--accent': myColor }}>
            <h3 className="card-title"><Plus size={20} style={{ color: myColor }} /> Launch Chatroom</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Launch a secure anonymous chatroom. Only people you add by their ID will receive invitations to enter.
            </p>
            <form onSubmit={handleCreateRoom} style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input 
                type="text" 
                className="glass-input" 
                placeholder="Room Title (e.g. Secret Ops, Weekend Hangout)" 
                value={roomInput}
                onChange={(e) => setRoomInput(e.target.value)}
                pattern="^[a-zA-Z0-9\s_-]{3,30}$"
                title="Room Title must be 3-30 characters, alphanumeric, spaces, dashes or underscores."
                required
              />
              <button ref={magneticCreateRef} type="submit" className="btn-primary" style={{ '--accent': myColor, '--accent-glow': myColor.replace(')', ', 0.15)').replace('hsl', 'hsla') }}>
                Create Room
              </button>
            </form>
          </div>

          {/* Join Room Card */}
          <div className="glass-panel dashboard-card stagger-2">
            <h3 className="card-title"><Hash size={20} style={{ color: 'var(--text-muted)' }} /> Join Room</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
              If a friend gave you a Room ID, enter it below to join their active anonymous chat room directly.
            </p>
            <form onSubmit={(e) => handleJoinRoom(e)} style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input 
                type="text" 
                className="glass-input" 
                placeholder="Enter Room ID (e.g. room_3284)" 
                value={roomInput}
                onChange={(e) => setRoomInput(e.target.value)}
                pattern="^room_[0-9]{4}$"
                title="Room ID must be room_ followed by 4 digits."
                required
              />
              <button type="submit" className="btn-secondary">
                Connect
              </button>
            </form>
          </div>
        </div>

        {/* Info panel */}
        <div className="glass-panel stagger-3" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h4 style={{ display: 'flex', alignState: 'center', gap: '8px', fontSize: '1rem', fontWeight: 600 }}>
            <Sparkles size={18} style={{ color: myColor }} /> Incognito Lobby Details
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <div>
              <p style={{ marginBottom: '4px' }}>Logged in as: <strong style={{ color: '#fff' }}>{myId}</strong></p>
              <p>Signature Spectra: <span style={{ color: myColor, fontWeight: 700 }}>{getColorName(myColor)}</span></p>
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)', marginBottom: '6px' }}>
                Note: Share this application link with friends to start chatting. Invite friends to secure rooms by sending them invitations via their unique ID.
              </p>
              <p style={{ color: 'var(--text-muted)' }}>
                This application is PWA-enabled. You can install it on your home screen for quick offline launch and native window controls.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Chatroom View
  return (
    <div className="chat-workspace animate-fade-in">
      {/* Sidebar: Room Info & Add friends */}
      <div className="glass-panel chat-sidebar stagger-1">
        {/* Section 1: Room Identity */}
        <div className="sidebar-section">
          <span className="section-label">Anonymous Room</span>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {activeRoom.name}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '10px', fontSize: '0.8rem', border: '1px solid var(--color-panel-border)' }}>
            <span style={{ fontFamily: 'monospace', color: 'var(--text-secondary)', flex: 1 }}>ID: {activeRoom.id}</span>
            <button 
              onClick={copyRoomIdToClipboard} 
              className="btn-icon" 
              style={{ width: '28px', height: '28px', borderRadius: '6px', border: 'none' }}
              title="Copy Room ID"
            >
              {copiedRoomId ? <Check size={14} style={{ color: 'var(--clr-emerald)' }} /> : <Copy size={14} />}
            </button>
          </div>
        </div>

        {/* Section 2: Members list (Strictly Anonymous, Colors Only) */}
        <div className="sidebar-section">
          <div className="section-label">
            <span>Room Members</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{members.length} online</span>
          </div>
          <div className="members-list">
            {members.map((color, idx) => (
              <div 
                key={idx} 
                className="member-orb" 
                style={{ backgroundColor: color, color: color, boxShadow: `0 0 10px ${color.replace(')', ', 0.3)').replace('hsl', 'hsla')}` }}
              >
                {/* Visual indicator for current user's orb */}
                {color === myColor && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#000' }}></span>}
                <div className="member-tooltip">
                  {color === myColor ? 'You (Spectra)' : getColorName(color)}
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '4px' }}>
            *User IDs are completely hidden in this room.
          </p>
        </div>

        {/* Section 3: Add/Invite friends */}
        <div className="sidebar-section" style={{ marginTop: 'auto' }}>
          <span className="section-label">Add Friend to Chat</span>
          <form onSubmit={handleInviteFriend} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <input 
              type="text" 
              className="glass-input" 
              style={{ padding: '10px 12px', fontSize: '0.85rem' }}
              placeholder="Friend's User ID..." 
              value={friendIdToInvite}
              onChange={(e) => setFriendIdToInvite(e.target.value.toLowerCase().replace(/\s+/g, ''))}
              required
            />
            <button type="submit" className="btn-primary" style={{ padding: '10px', fontSize: '0.85rem', width: '100%', '--accent': myColor, '--accent-glow': myColor.replace(')', ', 0.15)').replace('hsl', 'hsla') }}>
              <UserPlus size={16} /> Send Invitation
            </button>
          </form>
          {inviteFeedback && (
            <span style={{ fontSize: '0.75rem', color: myColor, display: 'block', textAlign: 'center', marginTop: '4px' }}>
              {inviteFeedback}
            </span>
          )}
        </div>

        {/* Section 4: Leave room */}
        <button onClick={handleLeaveRoom} className="btn-secondary" style={{ width: '100%', gap: '8px', padding: '10px' }}>
          <LogOut size={16} /> Leave Room
        </button>
      </div>

      {/* Main Chat Panel */}
      <div className="glass-panel chat-main stagger-2">
        {/* Chat header */}
        <div className="chat-header">
          <div className="chat-room-title">
            <span className="brand-logo" style={{ background: `linear-gradient(135deg, ${myColor} 0%, #a200ff 100%)`, width: '28px', height: '28px', fontSize: '0.9rem' }}>WHO</span>
            <h3>Spectra Lobby</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <span>Your Avatar:</span>
            <div className="status-indicator" style={{ color: myColor, backgroundColor: myColor, width: '12px', height: '12px', boxShadow: `0 0 10px ${myColor}` }}></div>
            <span style={{ fontWeight: 600 }}>{getColorName(myColor)}</span>
          </div>
        </div>

        {/* Messages Feed */}
        <div className="chat-messages-container">
          {messages.map((msg, index) => {
            if (msg.type === 'system') {
              return (
                <div key={msg.id || index} className="system-notification" style={{ '--msg-color': msg.color }}>
                  <div className="system-notification-dot"></div>
                  <span>{msg.text}</span>
                </div>
              );
            }

            const isMyMessage = msg.senderId === myId;
            const messageColor = msg.color;

            return (
              <div 
                key={msg.id || index} 
                className={`message-wrapper ${isMyMessage ? 'outgoing' : 'incoming'}`}
                style={{ '--msg-color': messageColor }}
              >
                <div 
                  className="message-bubble"
                  id={`msg-bubble-${msg.id}`}
                  onMouseEnter={() => setShowEmojiPickerForMsg(msg.id)}
                  onMouseLeave={() => setShowEmojiPickerForMsg(null)}
                >
                  <div className="message-bubble-header">
                    <span className="sender-color-name">
                      {isMyMessage ? 'YOU (SPECTRA)' : getColorName(messageColor)}
                    </span>
                  </div>
                  <span style={{ wordBreak: 'break-word' }}>{msg.text}</span>
                  <span className="message-time">{msg.timestamp}</span>

                  {/* Reaction Toolbar */}
                  {showEmojiPickerForMsg === msg.id && (
                    <div className="reactions-box" style={{
                      position: 'absolute',
                      bottom: '-28px',
                      [isMyMessage ? 'right' : 'left']: '4px',
                      background: 'var(--color-panel-active)',
                      border: '1px solid var(--color-panel-border)',
                      borderRadius: '20px',
                      padding: '2px 8px',
                      zIndex: 20
                    }}>
                      {['❤️', '👍', '😂', '🔥', '😮'].map(emoji => (
                        <button
                          key={emoji}
                          className="reaction-btn"
                          onClick={() => handleReactToMessage(msg.id, emoji)}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Applied Reactions */}
                  {msg.reactions && msg.reactions.length > 0 && (
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '4px',
                      marginTop: '6px'
                    }}>
                      {/* Group reactions by emoji */}
                      {Object.entries(
                        msg.reactions.reduce((acc, r) => {
                          acc[r.emoji] = acc[r.emoji] || [];
                          acc[r.emoji].push(r.userColor);
                          return acc;
                        }, {})
                      ).map(([emoji, colors]) => (
                        <span 
                          key={emoji}
                          className="reaction-bubble"
                          style={{ position: 'static', gap: '3px' }}
                          title={`Reacted by: ${colors.map(c => getColorName(c)).join(', ')}`}
                        >
                          <span>{emoji}</span>
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{colors.length}</span>
                          <div style={{ display: 'inline-flex', gap: '2px', marginLeft: '2px' }}>
                            {colors.map((c, i) => (
                              <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: c }} />
                            ))}
                          </div>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Typing indicators */}
        <div style={{ height: '20px', padding: '0 24px' }}>
          {Object.keys(typingUsers).length > 0 && (
            <div className="typing-indicator-text">
              <div className="typing-dots">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
              <span>
                Someone in {Object.keys(typingUsers).map(c => getColorName(c)).join(' and ')} is typing...
              </span>
            </div>
          )}
        </div>

        {/* Chat input */}
        <form onSubmit={handleSendMessage} className="chat-input-bar">
          <div className="chat-input-row">
            <input 
              type="text" 
              className="glass-input" 
              placeholder="Send anonymous message..." 
              value={inputText}
              onChange={handleInputChange}
              required
            />
            <button ref={magneticSendRef} type="submit" className="btn-primary" style={{ padding: '14px', width: '48px', height: '48px', flexShrink: 0, '--accent': myColor, '--accent-glow': myColor.replace(')', ', 0.15)').replace('hsl', 'hsla') }}>
              <Send size={18} />
            </button>
          </div>
        </form>
      </div>
      {explosions.map(exp => (
        <EmojiExplosion key={exp.id} x={exp.x} y={exp.y} emoji={exp.emoji} />
      ))}
    </div>
  );
}

// Main Root Application
export default function App() {
  const [theme, setTheme] = useState('dark'); // 'dark' | 'classic' | 'blueprint' | 'playful'
  const [isConnected, setIsConnected] = useState(chatSync.isConnected());

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    chatSync.on('connect', handleConnect);
    chatSync.on('disconnect', handleDisconnect);
    chatSync.on('connect_error', handleDisconnect);

    // Set initial connection status
    setIsConnected(chatSync.isConnected());

    return () => {
      chatSync.off('connect', handleConnect);
      chatSync.off('disconnect', handleDisconnect);
      chatSync.off('connect_error', handleDisconnect);
    };
  }, []);

  return (
    <div className="app-container">
      <CosmicDustCanvas />
      {/* Cosmic background glows */}
      <div className="cosmic-bg">
        <div className="cosmic-glow-1"></div>
        <div className="cosmic-glow-2"></div>
        <div className="cosmic-glow-3"></div>
      </div>

      {/* Top Navbar */}
      <header className="navbar">
        <div className="brand">
          <div className="brand-logo">W</div>
          <span className="brand-logo-text">WHO</span>
          <span style={{ fontSize: '0.65rem', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-muted)', border: '1px solid var(--color-panel-border)', borderRadius: '10px', padding: '2px 8px', marginLeft: '6px' }}>
            INCOGNITO
          </span>
        </div>

        <div className="navbar-actions">
          {/* Connection status indicator */}
          <div className="connection-status" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.75rem',
            color: isConnected ? 'hsl(145, 75%, 48%)' : 'hsl(355, 78%, 56%)',
            backgroundColor: isConnected ? 'rgba(145, 75%, 48%, 0.08)' : 'rgba(355, 78%, 56%, 0.08)',
            border: `1px solid ${isConnected ? 'rgba(145, 75%, 48%, 0.2)' : 'rgba(355, 78%, 56%, 0.2)'}`,
            borderRadius: '20px',
            padding: '4px 10px',
            fontWeight: 600,
            textShadow: isConnected ? '0 0 8px rgba(145, 75%, 48%, 0.3)' : 'none'
          }}>
            <span 
              className={isConnected ? '' : 'sync-pulse-dot'}
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: isConnected ? 'hsl(145, 75%, 48%)' : 'hsl(355, 78%, 56%)',
                boxShadow: `0 0 8px ${isConnected ? 'hsl(145, 75%, 48%)' : 'hsl(355, 78%, 56%)'}`
              }}
            ></span>
            <span>{isConnected ? 'Sync Connected' : 'Sync Offline'}</span>
          </div>

          <div className="theme-select-container">
            <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Theme:</span>
            <select 
              value={theme} 
              onChange={(e) => setTheme(e.target.value)}
              className="theme-select"
            >
              <option value="dark">Elegant Dark</option>
              <option value="classic">Classic Light</option>
              <option value="blueprint">Corporate Blueprint</option>
              <option value="playful">Playful Gradient</option>
            </select>
          </div>

        </div>
      </header>

      {/* Main Workspace Area */}
      <main className="main-workspace">
        <ChatClient 
          initialId="" 
          defaultColorIndex={0} 
          isSandbox={false}
        />
      </main>

      {/* Simple Footer */}
      <footer style={{ padding: '16px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--color-panel-border)', background: 'var(--color-panel)' }}>
        WHO Anonymous Group Chat • Built with React & WebSockets • Secure & ID-Anonymous
      </footer>
    </div>
  );
}
