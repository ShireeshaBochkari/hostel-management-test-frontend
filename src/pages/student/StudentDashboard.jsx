import React, { useState, useEffect } from 'react';
import {
  DoorClosed,
  CreditCard,
  MessageSquareWarning,
  UserCheck,
  Megaphone,
  Mail,
  User,
  Plus,
  Send,
  Calendar,
  CheckCircle2,
  Clock,
  Shield,
  Phone,
  BookOpen,
} from 'lucide-react';
import Sidebar from '../../components/common/Sidebar';
import Navbar from '../../components/common/Navbar';
import StatCard from '../../components/common/StatCard';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import AlertBanner from '../../components/common/AlertBanner';
import FormField from '../../components/forms/FormField';
import FormTextarea from '../../components/forms/FormTextarea';
import { useAuth } from '../../context/AuthContext';

import { dashboardApi } from '../../api/dashboardApi';
import { roomApi } from '../../api/roomApi';
import { paymentApi } from '../../api/paymentApi';
import { complaintApi } from '../../api/complaintApi';
import { visitorApi } from '../../api/visitorApi';
import { noticeApi } from '../../api/noticeApi';
import { messageApi } from '../../api/messageApi';
import { hostellerApi } from '../../api/hostellerApi';

const StudentDashboard = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  // Data states
  const [stats, setStats] = useState(null);
  const [roomInfo, setRoomInfo] = useState(null);
  const [payments, setPayments] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [notices, setNotices] = useState([]);
  const [profile, setProfile] = useState(null);

  // Modal states
  const [complaintModalOpen, setComplaintModalOpen] = useState(false);
  const [complaintFormData, setComplaintFormData] = useState({ title: '', description: '' });

  const [visitorModalOpen, setVisitorModalOpen] = useState(false);
  const [visitorFormData, setVisitorFormData] = useState({
    visitorName: '',
    relationship: '',
    visitDate: new Date().toISOString().substring(0, 10),
    inTime: '10:00',
    outTime: '17:00',
  });

  // Profile Edit State
  const [profileFormData, setProfileFormData] = useState({ fullName: '', phoneNumber: '', course: '' });

  // Messages State
  const [messages, setMessages] = useState([]);
  const [recipients, setRecipients] = useState([]);
  const [selectedRecipientId, setSelectedRecipientId] = useState('');
  const [messageContent, setMessageContent] = useState('');

  // 1. Fetch Student Overview
  const loadOverview = async () => {
    try {
      const s = await dashboardApi.getStudentStats();
      setStats(s);
    } catch (err) {
      console.error(err);
    }
  };

  // 2. Fetch My Room
  const loadMyRoom = async () => {
    try {
      setLoading(true);
      const data = await roomApi.getMyRoom();
      setRoomInfo(data);
    } catch (err) {
      console.error('Failed to load room info', err);
    } finally {
      setLoading(false);
    }
  };

  // 3. Fetch Payments
  const loadPayments = async () => {
    try {
      setLoading(true);
      const data = await paymentApi.getMyPayments();
      setPayments(data);
    } catch (err) {
      console.error('Failed to load payments', err);
    } finally {
      setLoading(false);
    }
  };

  // 4. Fetch Complaints
  const loadComplaints = async () => {
    try {
      setLoading(true);
      const data = await complaintApi.getMyComplaints();
      setComplaints(data);
    } catch (err) {
      console.error('Failed to load complaints', err);
    } finally {
      setLoading(false);
    }
  };

  // 5. Fetch Visitors
  const loadVisitors = async () => {
    try {
      setLoading(true);
      const data = await visitorApi.getMyVisitors();
      setVisitors(data);
    } catch (err) {
      console.error('Failed to load visitors', err);
    } finally {
      setLoading(false);
    }
  };

  // 6. Fetch Notices
  const loadNotices = async () => {
    try {
      setLoading(true);
      const data = await noticeApi.getAllNotices();
      setNotices(data);
    } catch (err) {
      console.error('Failed to load notices', err);
    } finally {
      setLoading(false);
    }
  };

  // 7. Fetch Profile
  const loadProfile = async () => {
    try {
      const data = await hostellerApi.getMyProfile();
      setProfile(data);
      setProfileFormData({
        fullName: data.fullName || '',
        phoneNumber: data.phoneNumber || '',
        course: data.course || '',
      });
    } catch (err) {
      console.error('Failed to load profile', err);
    }
  };

  // 8. Fetch Messages
  const loadMessages = async () => {
    try {
      const conv = await messageApi.getConversation();
      setMessages(conv);
      const rec = await messageApi.getRecipients();
      setRecipients(rec);
      if (rec.length > 0 && !selectedRecipientId) {
        setSelectedRecipientId(rec[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadOverview();
    loadMyRoom();
    if (activeTab === 'my-room') loadMyRoom();
    if (activeTab === 'payments') loadPayments();
    if (activeTab === 'complaints') loadComplaints();
    if (activeTab === 'visitors') loadVisitors();
    if (activeTab === 'notices') loadNotices();
    if (activeTab === 'profile') loadProfile();
    if (activeTab === 'messages') loadMessages();
  }, [activeTab]);

  // Handle Submit Complaint
  const handleCreateComplaint = async (e) => {
    e.preventDefault();
    if (!complaintFormData.title.trim() || !complaintFormData.description.trim()) {
      setAlert({ type: 'warning', message: 'Please provide both a title and description.' });
      return;
    }
    try {
      await complaintApi.createComplaint(complaintFormData);
      setAlert({ type: 'success', message: 'Complaint submitted successfully! Warden will review it shortly.' });
      setComplaintModalOpen(false);
      setComplaintFormData({ title: '', description: '' });
      loadComplaints();
      loadOverview();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to submit complaint.' });
    }
  };

  // Handle Request Visitor Pass
  const handleCreateVisitor = async (e) => {
    e.preventDefault();
    if (!visitorFormData.visitorName.trim()) {
      setAlert({ type: 'warning', message: 'Visitor name is required.' });
      return;
    }
    try {
      await visitorApi.createVisitorRequest(visitorFormData);
      setAlert({ type: 'success', message: 'Visitor pass requested! Waiting for warden authorization.' });
      setVisitorModalOpen(false);
      setVisitorFormData({
        visitorName: '',
        relationship: '',
        visitDate: new Date().toISOString().substring(0, 10),
        inTime: '10:00',
        outTime: '17:00',
      });
      loadVisitors();
      loadOverview();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to request visitor pass.' });
    }
  };

  // Handle Update Profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const updated = await hostellerApi.updateMyProfile(profileFormData);
      setProfile(updated);
      updateUser({ fullName: updated.fullName });
      setAlert({ type: 'success', message: 'Personal details updated successfully!' });
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to update profile.' });
    }
  };

  // Handle Send Message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!selectedRecipientId || !messageContent.trim()) return;
    try {
      await messageApi.sendMessage(Number(selectedRecipientId), messageContent.trim());
      setMessageContent('');
      loadMessages();
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to send message.' });
    }
  };

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} role="HOSTELER" />

      <div className="main-wrapper">
        <Navbar
          title={
            activeTab === 'overview'
              ? 'Hosteller Dashboard'
              : activeTab === 'my-room'
              ? 'My Room Details'
              : activeTab === 'payments'
              ? 'My Fee & Receipts'
              : activeTab === 'complaints'
              ? 'Maintenance & Complaints'
              : activeTab === 'visitors'
              ? 'My Visitor Passes'
              : activeTab === 'notices'
              ? 'Hostel Notice Board'
              : activeTab === 'messages'
              ? 'Warden Communication'
              : 'Resident Profile'
          }
          subtitle="Hosteller Resident Portal"
        />

        <main className="main-content animate-fade-in">
          {alert && (
            <AlertBanner
              type={alert.type}
              message={alert.message}
              onClose={() => setAlert(null)}
            />
          )}

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div>
              <div className="hero-card teal">
                <h2>Welcome Back, {user?.fullName}!</h2>
                <p>
                  Access your hostel room records, stay updated with official notices, track fee payments, and request maintenance support seamlessly.
                </p>
              </div>

              <div className="stats-grid">
                <StatCard
                  title="Allocated Room"
                  value={roomInfo?.assigned ? `Room ${roomInfo.roomNumber}` : 'Pending'}
                  hint={roomInfo?.assigned ? `${roomInfo.capacity} Bed Sharing` : 'Contact warden'}
                  icon={DoorClosed}
                  color="blue"
                />
                <StatCard
                  title="Monthly Rent"
                  value={roomInfo?.assigned ? `₹${Number(roomInfo.rentPerPerson).toLocaleString()}` : '—'}
                  hint="Per occupant"
                  icon={CreditCard}
                  color="emerald"
                />
                <StatCard
                  title="Active Complaints"
                  value={stats?.openComplaints ?? complaints.length}
                  hint="Tickets in progress"
                  icon={MessageSquareWarning}
                  color="amber"
                />
                <StatCard
                  title="Visitor Requests"
                  value={stats?.totalVisitors ?? visitors.length}
                  hint="Recorded passes"
                  icon={UserCheck}
                  color="purple"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
                {/* Room Quick Snapshot */}
                <div className="card-panel">
                  <div className="card-panel-header">
                    <div className="card-panel-title">
                      <h3>Room Assignment Status</h3>
                      <p>Accommodation details</p>
                    </div>
                  </div>

                  {roomInfo?.assigned ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Room Number:</span>
                        <strong style={{ fontSize: '14px', color: 'var(--accent-teal)' }}>Room {roomInfo.roomNumber}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Bed Capacity:</span>
                        <strong>{roomInfo.capacity} Persons</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Current Roommates:</span>
                        <strong>{roomInfo.occupied} Occupants</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Monthly Rent:</span>
                        <strong style={{ color: 'var(--accent-emerald)' }}>₹{Number(roomInfo.rentPerPerson).toLocaleString()}</strong>
                      </div>
                    </div>
                  ) : (
                    <div className="empty-state" style={{ padding: '24px' }}>
                      <Clock size={32} style={{ margin: '0 auto 12px', color: 'var(--accent-amber)' }} />
                      <h4>No Room Assigned Yet</h4>
                      <p>Your room allocation is being processed by the chief warden.</p>
                    </div>
                  )}
                </div>

                {/* Quick Actions Panel */}
                <div className="card-panel">
                  <div className="card-panel-header">
                    <div className="card-panel-title">
                      <h3>Resident Actions</h3>
                      <p>Frequently accessed student services</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <button
                      className="btn btn-teal"
                      style={{ padding: '14px', justifyContent: 'flex-start' }}
                      onClick={() => setComplaintModalOpen(true)}
                    >
                      <Plus size={16} /> File Maintenance Complaint
                    </button>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '14px', justifyContent: 'flex-start' }}
                      onClick={() => setVisitorModalOpen(true)}
                    >
                      <UserCheck size={16} /> Request Visitor Entry Pass
                    </button>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '14px', justifyContent: 'flex-start' }}
                      onClick={() => setActiveTab('notices')}
                    >
                      <Megaphone size={16} /> Check Notice Board
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MY ROOM */}
          {activeTab === 'my-room' && (
            <div className="card-panel">
              <div className="card-panel-header">
                <div className="card-panel-title">
                  <h3>My Hostel Accommodation</h3>
                  <p>Detailed view of your assigned living quarters</p>
                </div>
              </div>

              {roomInfo?.assigned ? (
                <div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '16px',
                      marginBottom: '28px',
                    }}
                  >
                    <div style={{ background: '#f0fdfa', border: '1px solid #ccfbf1', borderRadius: 'var(--radius-md)', padding: '18px' }}>
                      <div style={{ fontSize: '12px', color: 'var(--accent-teal)', fontWeight: 700 }}>ROOM NUMBER</div>
                      <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
                        Room {roomInfo.roomNumber}
                      </div>
                    </div>

                    <div style={{ background: '#f8fafc', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '18px' }}>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700 }}>BED CAPACITY</div>
                      <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
                        {roomInfo.capacity} Beds
                      </div>
                    </div>

                    <div style={{ background: '#f8fafc', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '18px' }}>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700 }}>CURRENT OCCUPANCY</div>
                      <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
                        {roomInfo.occupied} Beds Occupied
                      </div>
                    </div>

                    <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 'var(--radius-md)', padding: '18px' }}>
                      <div style={{ fontSize: '12px', color: '#059669', fontWeight: 700 }}>MONTHLY CHARGE</div>
                      <div style={{ fontSize: '26px', fontWeight: 800, color: '#059669', marginTop: '4px' }}>
                        ₹{Number(roomInfo.rentPerPerson).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>Included Amenities</h4>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <span className="badge badge-green">High-Speed Wi-Fi</span>
                    <span className="badge badge-green">24/7 Power Backup</span>
                    <span className="badge badge-green">Study Desk & Chair</span>
                    <span className="badge badge-green">Hot Water / Geyser</span>
                    <span className="badge badge-green">Daily Housekeeping</span>
                  </div>
                </div>
              ) : (
                <div className="empty-state">
                  <Clock size={36} style={{ margin: '0 auto 12px', color: 'var(--accent-amber)' }} />
                  <h4>No Room Allocated</h4>
                  <p>Your room allocation is currently pending. Please check back soon or consult the warden.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PAYMENTS */}
          {activeTab === 'payments' && (
            <div className="card-panel">
              <div className="card-panel-header">
                <div className="card-panel-title">
                  <h3>My Fee Payment History</h3>
                  <p>All recorded rent receipts and billing statements</p>
                </div>
              </div>

              <DataTable
                columns={[
                  { header: 'Receipt No.', accessor: 'id', render: (p) => `#REC-${String(p.id).padStart(4, '0')}` },
                  { header: 'Period', render: (p) => `${p.month}/${p.year}` },
                  { header: 'Amount Paid', accessor: 'amount', render: (p) => <span style={{ fontWeight: 800, color: 'var(--accent-emerald)' }}>₹{Number(p.amount).toLocaleString()}</span> },
                  { header: 'Payment Mode', accessor: 'paymentMethod' },
                  { header: 'Payment Date', accessor: 'paymentDate' },
                  { header: 'Status', render: () => <Badge variant="paid" text="PAID" /> },
                  { header: 'Remarks', accessor: 'note', render: (p) => p.note || '—' },
                ]}
                data={payments}
                loading={loading}
                emptyMessage="No payment records found under your account."
              />
            </div>
          )}

          {/* TAB 4: COMPLAINTS */}
          {activeTab === 'complaints' && (
            <div className="card-panel">
              <div className="card-panel-header">
                <div className="card-panel-title">
                  <h3>Maintenance & Complaints</h3>
                  <p>Track your submitted issues and warden resolutions</p>
                </div>
                <button className="btn btn-teal btn-sm" onClick={() => setComplaintModalOpen(true)}>
                  <Plus size={15} /> Submit New Complaint
                </button>
              </div>

              <DataTable
                columns={[
                  { header: 'Ticket ID', accessor: 'id', render: (c) => `#CMP-${c.id}` },
                  { header: 'Issue Title', accessor: 'title', render: (c) => <strong>{c.title}</strong> },
                  { header: 'Description', accessor: 'description', width: '35%' },
                  {
                    header: 'Status',
                    accessor: 'status',
                    render: (c) => <Badge variant={c.status} text={c.status} />,
                  },
                  {
                    header: 'Warden / Staff Response',
                    accessor: 'staffResponse',
                    render: (c) => c.staffResponse || <span style={{ color: '#94a3b8' }}>Pending investigation</span>,
                  },
                  { header: 'Date Filed', accessor: 'createdAt', render: (c) => c.createdAt?.substring(0, 10) },
                ]}
                data={complaints}
                loading={loading}
                searchKey="title"
                searchPlaceholder="Search your complaints..."
                emptyMessage="You have not filed any maintenance complaints yet."
              />
            </div>
          )}

          {/* TAB 5: VISITOR PASSES */}
          {activeTab === 'visitors' && (
            <div className="card-panel">
              <div className="card-panel-header">
                <div className="card-panel-title">
                  <h3>Visitor Entry Passes</h3>
                  <p>Manage family and guest entry permissions</p>
                </div>
                <button className="btn btn-teal btn-sm" onClick={() => setVisitorModalOpen(true)}>
                  <Plus size={15} /> Request Visitor Pass
                </button>
              </div>

              <DataTable
                columns={[
                  { header: 'Pass No.', accessor: 'id', render: (v) => `#VIS-${v.id}` },
                  { header: 'Visitor Name', accessor: 'visitorName', render: (v) => <strong>{v.visitorName}</strong> },
                  { header: 'Relationship', accessor: 'relationship' },
                  { header: 'Visit Date', accessor: 'visitDate' },
                  { header: 'Expected Slot', render: (v) => `${v.inTime} - ${v.outTime}` },
                  {
                    header: 'Pass Status',
                    accessor: 'status',
                    render: (v) => <Badge variant={v.status} text={v.status} />,
                  },
                ]}
                data={visitors}
                loading={loading}
                emptyMessage="No visitor passes requested yet."
              />
            </div>
          )}

          {/* TAB 6: NOTICES */}
          {activeTab === 'notices' && (
            <div className="card-panel">
              <div className="card-panel-header">
                <div className="card-panel-title">
                  <h3>Official Hostel Notices</h3>
                  <p>Announcements, guidelines, and schedules posted by administration</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {notices.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', textAlign: 'center', margin: '20px 0' }}>No announcements posted.</p>
                ) : (
                  notices.map((n) => (
                    <div
                      key={n.id}
                      style={{
                        padding: '20px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)',
                        background: '#ffffff',
                        boxShadow: 'var(--shadow-sm)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>{n.title}</h4>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {n.createdAt?.substring(0, 10)}
                        </span>
                      </div>
                      <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6 }}>{n.content}</p>
                      <div style={{ marginTop: '12px', fontSize: '11px', color: 'var(--text-light)', fontWeight: 600 }}>
                        POSTED BY: {n.createdBy?.toUpperCase() || 'HOSTEL WARDEN'}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 7: MESSAGES */}
          {activeTab === 'messages' && (
            <div className="card-panel">
              <div className="card-panel-header">
                <div className="card-panel-title">
                  <h3>Message Hostel Administration</h3>
                  <p>Send direct queries to the warden</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
                <div>
                  <form onSubmit={handleSendMessage}>
                    <FormTextarea
                      label="Your Message"
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      placeholder="Ask the warden a question..."
                      rows={5}
                      required
                    />
                    <button type="submit" className="btn btn-teal" style={{ width: '100%' }}>
                      <Send size={15} /> Send to Warden
                    </button>
                  </form>
                </div>

                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>Conversation Log</h4>
                  <div
                    style={{
                      maxHeight: '400px',
                      overflowY: 'auto',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '16px',
                      background: '#f8fafc',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                    }}
                  >
                    {messages.length === 0 ? (
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', margin: '20px 0' }}>
                        No conversation history yet. Send a message to start communicating with the warden.
                      </p>
                    ) : (
                      messages.map((m) => (
                        <div
                          key={m.id}
                          style={{
                            background: '#ffffff',
                            padding: '12px 16px',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-subtle)',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <strong style={{ fontSize: '13px', color: 'var(--accent-teal)' }}>
                              From: {m.senderName} → To: {m.receiverName}
                            </strong>
                            <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>
                              {m.createdAt?.substring(0, 16).replace('T', ' ')}
                            </span>
                          </div>
                          <p style={{ fontSize: '13px', color: 'var(--text-main)' }}>{m.content}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: PROFILE */}
          {activeTab === 'profile' && (
            <div className="card-panel" style={{ maxWidth: '600px' }}>
              <div className="card-panel-header">
                <div className="card-panel-title">
                  <h3>My Resident Profile</h3>
                  <p>View and update your personal information</p>
                </div>
              </div>

              <form onSubmit={handleUpdateProfile}>
                <FormField
                  label="Full Name"
                  value={profileFormData.fullName}
                  onChange={(e) => setProfileFormData({ ...profileFormData, fullName: e.target.value })}
                  required
                />
                <FormField
                  label="Email Address"
                  value={profile?.email || user?.email}
                  disabled
                />
                <FormField
                  label="Contact Phone"
                  value={profileFormData.phoneNumber}
                  onChange={(e) => setProfileFormData({ ...profileFormData, phoneNumber: e.target.value })}
                  placeholder="e.g. 9876543210"
                />
                <FormField
                  label="Course / Academic Department"
                  value={profileFormData.course}
                  onChange={(e) => setProfileFormData({ ...profileFormData, course: e.target.value })}
                  placeholder="e.g. B.Tech Computer Science"
                />

                {profile?.guardianName && (
                  <div style={{ padding: '14px', background: '#f8fafc', borderRadius: 'var(--radius-md)', marginBottom: '16px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>
                      EMERGENCY & GUARDIAN PROFILE
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-main)' }}>
                      <strong>Guardian:</strong> {profile.guardianName} ({profile.guardianPhone})
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-main)', marginTop: '4px' }}>
                      <strong>Blood Group:</strong> {profile.bloodGroup || '—'}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-main)', marginTop: '4px' }}>
                      <strong>Address:</strong> {profile.permanentAddress || '—'}
                    </div>
                  </div>
                )}

                <button type="submit" className="btn btn-teal">
                  Save Profile Updates
                </button>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* MODAL: SUBMIT COMPLAINT */}
      <Modal
        isOpen={complaintModalOpen}
        onClose={() => setComplaintModalOpen(false)}
        title="File Maintenance Complaint"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setComplaintModalOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-teal" onClick={handleCreateComplaint}>
              Submit Complaint
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateComplaint}>
          <FormField
            label="Complaint Summary"
            value={complaintFormData.title}
            onChange={(e) => setComplaintFormData({ ...complaintFormData, title: e.target.value })}
            placeholder="e.g. Fan in Room 101 not spinning properly"
            required
          />
          <FormTextarea
            label="Problem Description"
            value={complaintFormData.description}
            onChange={(e) => setComplaintFormData({ ...complaintFormData, description: e.target.value })}
            placeholder="Please provide details about the location and nature of the issue..."
            rows={5}
            required
          />
        </form>
      </Modal>

      {/* MODAL: REQUEST VISITOR PASS */}
      <Modal
        isOpen={visitorModalOpen}
        onClose={() => setVisitorModalOpen(false)}
        title="Request Visitor Entry Pass"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setVisitorModalOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-teal" onClick={handleCreateVisitor}>
              Submit Request
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateVisitor}>
          <FormField
            label="Visitor Full Name"
            value={visitorFormData.visitorName}
            onChange={(e) => setVisitorFormData({ ...visitorFormData, visitorName: e.target.value })}
            placeholder="e.g. Suresh Kumar"
            required
          />
          <FormField
            label="Relationship"
            value={visitorFormData.relationship}
            onChange={(e) => setVisitorFormData({ ...visitorFormData, relationship: e.target.value })}
            placeholder="e.g. Father, Mother, Brother, Friend"
            required
          />
          <FormField
            label="Date of Visit"
            type="date"
            value={visitorFormData.visitDate}
            onChange={(e) => setVisitorFormData({ ...visitorFormData, visitDate: e.target.value })}
            required
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <FormField
              label="Expected In-Time"
              type="time"
              value={visitorFormData.inTime}
              onChange={(e) => setVisitorFormData({ ...visitorFormData, inTime: e.target.value })}
              required
            />
            <FormField
              label="Expected Out-Time"
              type="time"
              value={visitorFormData.outTime}
              onChange={(e) => setVisitorFormData({ ...visitorFormData, outTime: e.target.value })}
              required
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StudentDashboard;
