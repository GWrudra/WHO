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

const COLORS = [
  { value: 'hsl(180, 100%, 50%)', name: 'Cyan Spectra', clrVar: '--clr-cyan' },
  { value: 'hsl(270, 95%, 65%)', name: 'Violet Nebula', clrVar: '--clr-violet' },
  { value: 'hsl(35, 100%, 55%)', name: 'Amber Glow', clrVar: '--clr-amber' },
  { value: 'hsl(340, 95%, 60%)', name: 'Rose Aurora', clrVar: '--clr-rose' },
  { value: 'hsl(145, 90%, 50%)', name: 'Emerald Prism', clrVar: '--clr-emerald' },
  { value: 'hsl(355, 90%, 58%)', name: 'Crimson Flare', clrVar: '--clr-crimson' },
  { value: 'hsl(50, 100%, 50%)', name: 'Solar Ray', clrVar: '--clr-gold' },
  { value: 'hsl(210, 100%, 55%)', name: 'Azure Deep', clrVar: '--clr-azure' }
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
                  onChange={(e) => setMyId(e.target.value.toLowerCase().replace(/\s+/g, ''))}
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
          <div className="glass-panel dashboard-card glass-panel-accent" style={{ '--accent': myColor }}>
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
                required
              />
              <button type="submit" className="btn-primary" style={{ '--accent': myColor, '--accent-glow': myColor.replace(')', ', 0.15)').replace('hsl', 'hsla') }}>
                Create Room
              </button>
            </form>
          </div>

          {/* Join Room Card */}
          <div className="glass-panel dashboard-card">
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
                required
              />
              <button type="submit" className="btn-secondary">
                Connect
              </button>
            </form>
          </div>
        </div>

        {/* Info panel */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h4 style={{ display: 'flex', alignState: 'center', gap: '8px', fontSize: '1rem', fontWeight: 600 }}>
            <Sparkles size={18} style={{ color: myColor }} /> Incognito Lobby Details
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <div>
              <p style={{ marginBottom: '4px' }}>Logged in as: <strong style={{ color: '#fff' }}>{myId}</strong></p>
              <p>Signature Spectra: <span style={{ color: myColor, fontWeight: 700 }}>{getColorName(myColor)}</span></p>
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>
                Note: In Sandbox split-screen mode, all clients share the same network. Add friends using their ID.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                {Object.keys(globalSandboxUsers).length > 0 && (
                  <>
                    <span style={{ color: 'var(--text-muted)' }}>Online Sandbox IDs:</span>
                    {Object.entries(globalSandboxUsers).map(([id, color]) => (
                      id !== myId && (
                        <span 
                          key={id} 
                          className="status-indicator" 
                          style={{ color, backgroundColor: 'rgba(255,255,255,0.05)', border: `1px solid ${color}`, borderRadius: '10px', padding: '1px 6px', fontSize: '0.75rem', height: 'auto', width: 'auto', display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}
                          onClick={() => setFriendIdToInvite(id)}
                          title="Click to paste ID to invite"
                        >
                          {id}
                        </span>
                      )
                    ))}
                  </>
                )}
              </div>
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
      <div className="glass-panel chat-sidebar">
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
      <div className="glass-panel chat-main">
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
                      background: 'rgba(7, 9, 14, 0.95)',
                      border: '1px solid var(--border-glass-glow)',
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
            <button type="submit" className="btn-primary" style={{ padding: '14px', width: '48px', height: '48px', flexShrink: 0, '--accent': myColor, '--accent-glow': myColor.replace(')', ', 0.15)').replace('hsl', 'hsla') }}>
              <Send size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Main Root Application
export default function App() {
  const [sandboxMode, setSandboxMode] = useState(false);
  const [globalSandboxUsers, setGlobalSandboxUsers] = useState({}); // { userId: color }
  const [theme, setTheme] = useState('dark'); // 'dark' | 'classic' | 'blueprint' | 'playful'

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const registerSandboxUser = (userId, color) => {
    setGlobalSandboxUsers(prev => {
      if (prev[userId] === color) return prev;
      return { ...prev, [userId]: color };
    });
  };

  return (
    <div className="app-container">
      {/* Cosmic background glows */}
      <div className="cosmic-bg">
        <div className="cosmic-glow-1"></div>
        <div className="cosmic-glow-2"></div>
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

          <button 
            onClick={() => setSandboxMode(!sandboxMode)} 
            className={`sandbox-mode-btn ${sandboxMode ? 'active' : ''}`}
            title="Toggle Split-Screen Dev Sandbox"
          >
            <Users size={16} /> 
            {sandboxMode ? 'Exit Dev Sandbox' : 'Open Dev Sandbox (Split-Screen)'}
          </button>
        </div>
      </header>

      {/* Main Workspace Area */}
      <main className="main-workspace">
        {sandboxMode ? (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '12px' }}>
            <div className="glass-panel" style={{ padding: '16px 20px', borderLeft: '4px solid var(--clr-violet)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} style={{ color: 'var(--clr-violet)' }} /> Developer Split-Screen Sandbox
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Simulating three separate devices in real-time. Setup each client with a unique ID (e.g. <code>alice</code>, <code>bob</code>, <code>charlie</code>). Create a room in one client, copy its ID, and invite other clients by typing their ID, or let them join by pasting the Room ID!
              </p>
            </div>

            <div className="sandbox-container">
              {/* Client A */}
              <div className="sandbox-panel">
                <div className="sandbox-panel-header">
                  <span className="sandbox-badge"><Shield size={12} /> Client A (Simulated)</span>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '12px', background: 'rgba(0,0,0,0.15)', overflowY: 'auto' }}>
                  <ChatClient 
                    initialId="alice" 
                    defaultColorIndex={0} 
                    isSandbox={true}
                    globalSandboxUsers={globalSandboxUsers}
                    registerSandboxUser={registerSandboxUser}
                  />
                </div>
              </div>

              {/* Client B */}
              <div className="sandbox-panel">
                <div className="sandbox-panel-header">
                  <span className="sandbox-badge"><Shield size={12} /> Client B (Simulated)</span>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '12px', background: 'rgba(0,0,0,0.15)', overflowY: 'auto' }}>
                  <ChatClient 
                    initialId="bob" 
                    defaultColorIndex={1} 
                    isSandbox={true}
                    globalSandboxUsers={globalSandboxUsers}
                    registerSandboxUser={registerSandboxUser}
                  />
                </div>
              </div>

              {/* Client C */}
              <div className="sandbox-panel">
                <div className="sandbox-panel-header">
                  <span className="sandbox-badge"><Shield size={12} /> Client C (Simulated)</span>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '12px', background: 'rgba(0,0,0,0.15)', overflowY: 'auto' }}>
                  <ChatClient 
                    initialId="charlie" 
                    defaultColorIndex={3} 
                    isSandbox={true}
                    globalSandboxUsers={globalSandboxUsers}
                    registerSandboxUser={registerSandboxUser}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <ChatClient 
            initialId="me" 
            defaultColorIndex={0} 
            isSandbox={false}
            globalSandboxUsers={globalSandboxUsers}
            registerSandboxUser={registerSandboxUser}
          />
        )}
      </main>

      {/* Simple Footer */}
      <footer style={{ padding: '16px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--color-panel-border)', background: 'var(--color-panel)' }}>
        WHO Anonymous Group Chat • Built with React & WebSockets • Secure & ID-Anonymous
      </footer>
    </div>
  );
}
