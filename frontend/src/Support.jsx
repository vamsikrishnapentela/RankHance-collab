import { useState, useEffect, useRef } from 'react';
import { useAuth } from './hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { createTicket, getUserTickets } from './api';
import Container from './components/Container';
import Button from './components/Button';
import { MessageSquare, Send, Plus, ArrowLeft } from 'lucide-react';

export default function Support() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTicket, setActiveTicket] = useState(null);
  
  // New ticket form
  const [isCreating, setIsCreating] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newMessage, setNewMessage] = useState('');

  // Reply form
  const [replyMessage, setReplyMessage] = useState('');
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchTickets();
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeTicket]);

  const fetchTickets = async () => {
    try {
      const data = await getUserTickets();
      setTickets(data);
      if (activeTicket) {
        const updated = data.find(t => t._id === activeTicket._id);
        if (updated) setActiveTicket(updated);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newSubject || !newMessage) return;
    try {
      const savedTicket = await createTicket({ subject: newSubject, message: newMessage });
      setTickets([savedTicket, ...tickets]);
      setIsCreating(false);
      setNewSubject('');
      setNewMessage('');
      setActiveTicket(savedTicket);
    } catch (err) {
      alert("Failed to create ticket.");
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyMessage || !activeTicket) return;
    try {
      const updated = await createTicket({ ticketId: activeTicket._id, message: replyMessage });
      setTickets(tickets.map(t => t._id === updated._id ? updated : t));
      setActiveTicket(updated);
      setReplyMessage('');
    } catch (err) {
      alert("Failed to send reply.");
    }
  };

  return (
    <>
      {/* Basic Nav implementation compatible with the dashboard route */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md h-16 z-50 border-b border-gray-100 flex items-center px-6">
        <div className="max-w-5xl mx-auto w-full flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold font-heading">
            <span className="text-gray-900">Rank</span>
            <span className="text-[var(--color-primary)]">Hance</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-gray-600 font-bold hover:text-gray-900 transition-colors">Dashboard</Link>
            <button 
              onClick={logout}
              className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold font-heading text-sm hover:bg-gray-200 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-12 flex-1 w-full bg-gray-50 flex flex-col px-6 min-h-screen">
        <Container className="max-w-5xl h-[calc(100vh-140px)]">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 h-full flex overflow-hidden">
            
            {/* Sidebar (Tickets List) */}
            <div className={`w-full md:w-1/3 border-r border-gray-100 flex flex-col ${activeTicket ? 'hidden md:flex' : 'flex'}`}>
              <div className="p-6 flex justify-between items-center border-b border-gray-100">
                <h2 className="text-xl font-bold">Support Hub</h2>
                <button 
                  onClick={() => { setIsCreating(true); setActiveTicket(null); }}
                  className="p-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loading ? (
                  <p className="text-gray-400 text-sm text-center mt-6">Loading tickets...</p>
                ) : tickets.length === 0 ? (
                  <div className="text-center mt-10">
                    <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No tickets yet.</p>
                  </div>
                ) : (
                  tickets.map(t => (
                    <div 
                      key={t._id} 
                      onClick={() => { setActiveTicket(t); setIsCreating(false); }}
                      className={`p-4 rounded-xl cursor-pointer transition-all border ${activeTicket?._id === t._id ? 'border-orange-500 bg-orange-50' : 'border-gray-100 hover:border-orange-200 hover:bg-gray-50'}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold text-gray-800 line-clamp-1 flex-1">{t.subject}</span>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${t.status === 'Closed' ? 'bg-gray-200 text-gray-600' : t.status === 'Responded' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                          {t.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(t.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Chat Area / Create Ticket */}
            <div className={`flex-1 flex col flex-col bg-gray-50/50 ${!activeTicket && !isCreating ? 'hidden md:flex' : 'flex'}`}>
              
              {!isCreating && !activeTicket ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 space-y-4">
                  <MessageSquare className="w-16 h-16 opacity-30" />
                  <p>Select a ticket or create a new one.</p>
                </div>
              ) : isCreating ? (
                /* Create Ticket Form */
                <div className="flex-1 flex flex-col p-6 md:p-10">
                  <div className="flex items-center gap-3 mb-8">
                    <button onClick={() => setIsCreating(false)} className="md:hidden p-2 bg-gray-100 rounded-lg">
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-2xl font-bold">New Support Ticket</h2>
                  </div>
                  
                  <form onSubmit={handleCreate} className="space-y-6 max-w-2xl bg-white p-8 rounded-2xl border shadow-sm">
                    <div className="space-y-2">
                      <label className="font-semibold text-sm">Subject</label>
                      <input 
                        required
                        value={newSubject}
                        onChange={e => setNewSubject(e.target.value)}
                        placeholder="e.g. Briefly describe your problem..."
                        className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-orange-500 focus:outline-none transition-colors"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="font-semibold text-sm">Message</label>
                      <textarea 
                        required
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        placeholder="Describe your issue..."
                        className="w-full h-32 p-4 rounded-xl border border-gray-200 focus:border-orange-500 focus:outline-none transition-colors resize-none"
                      />
                    </div>
                    
                    <Button type="submit" className="w-full">Create Ticket</Button>
                  </form>
                </div>
              ) : (
                /* Active Ticket Chat */
                <div className="flex-1 flex flex-col h-full">
                  <div className="h-16 border-b border-gray-200 bg-white flex items-center px-6 gap-4">
                    <button onClick={() => setActiveTicket(null)} className="md:hidden p-2 bg-gray-100 rounded-lg">
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                      <h3 className="font-bold text-gray-900">{activeTicket.subject}</h3>
                      <p className="text-xs text-gray-500">Ticket #{activeTicket._id.slice(-6)}</p>
                    </div>
                    <div className="ml-auto">
                      <span className={`text-xs uppercase font-bold px-3 py-1 rounded-full ${activeTicket.status === 'Closed' ? 'bg-gray-100 text-gray-600' : 'bg-orange-100 text-orange-600'}`}>
                        {activeTicket.status}
                      </span>
                    </div>
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {activeTicket.messages.map((msg, idx) => {
                      const isStudent = msg.sender === 'student';
                      return (
                        <div key={idx} className={`flex w-full ${isStudent ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] rounded-2xl p-4 ${isStudent ? 'bg-orange-500 text-white rounded-br-none' : 'bg-white border text-gray-800 rounded-bl-none shadow-sm'}`}>
                            <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                            <p className={`text-[10px] mt-2 ${isStudent ? 'text-orange-200' : 'text-gray-400'}`}>
                              {new Date(msg.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Reply Input */}
                  {activeTicket.status !== 'Closed' ? (
                    <div className="p-4 bg-white border-t border-gray-200">
                      <form onSubmit={handleReply} className="flex gap-3">
                        <input 
                          value={replyMessage}
                          onChange={e => setReplyMessage(e.target.value)}
                          placeholder="Type your reply..."
                          className="flex-1 h-12 px-4 rounded-xl bg-gray-100 border-none focus:ring-2 focus:ring-orange-500 focus:outline-none transition-shadow"
                        />
                        <button type="submit" disabled={!replyMessage} className="h-12 w-12 flex items-center justify-center bg-orange-500 text-white rounded-xl hover:bg-orange-600 disabled:opacity-50 transition-colors">
                          <Send className="w-5 h-5" />
                        </button>
                      </form>
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-100 border-t border-gray-200 text-center text-sm text-gray-500 font-medium">
                      This ticket is marked as closed.
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </Container>
      </div>
    </>
  );
}
