import React, { useState, useEffect } from 'react';
import {
  DoorClosed,
  Users,
  CreditCard,
  MessageSquareWarning,
  UserCheck,
  Megaphone,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  UserPlus,
  Send,
  Calendar,
  DollarSign,
  AlertCircle,
  Eye,
  RefreshCw,
} from 'lucide-react';
import Sidebar from '../../components/common/Sidebar';
import Navbar from '../../components/common/Navbar';
import StatCard from '../../components/common/StatCard';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import ConfirmDeleteModal from '../../components/common/ConfirmDeleteModal';
import AlertBanner from '../../components/common/AlertBanner';
import FormField from '../../components/forms/FormField';
import FormSelect from '../../components/forms/FormSelect';
import FormTextarea from '../../components/forms/FormTextarea';

import { dashboardApi } from '../../api/dashboardApi';
import { roomApi } from '../../api/roomApi';
import { hostellerApi } from '../../api/hostellerApi';
import { paymentApi } from '../../api/paymentApi';
import { complaintApi } from '../../api/complaintApi';
import { visitorApi } from '../../api/visitorApi';
import { noticeApi } from '../../api/noticeApi';
import { messageApi } from '../../api/messageApi';

const WardenDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  // Rooms State
  const [rooms, setRooms] = useState([]);
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [roomFormData, setRoomFormData] = useState({ roomNumber: '', capacity: 2, rentPerPerson: 5000 });
  const [deleteRoomModalOpen, setDeleteRoomModalOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);

  // Room Assignment State
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignData, setAssignData] = useState({ hostellerId: '', roomId: '' });

  // Hostellers State
  const [hostellersPage, setHostellersPage] = useState({ content: [], totalPages: 1, totalElements: 0, number: 0 });
  const [hostellerModalOpen, setHostellerModalOpen] = useState(false);
  const [editingHosteller, setEditingHosteller] = useState(null);
  const [hostellerFormData, setHostellerFormData] = useState({ fullName: '', phoneNumber: '', course: '' });
  const [deleteHostellerModalOpen, setDeleteHostellerModalOpen] = useState(false);
  const [hostellerToDelete, setHostellerToDelete] = useState(null);

  // Complaints State
  const [complaintsPage, setComplaintsPage] = useState({ content: [], totalPages: 1, totalElements: 0, number: 0 });
  const [complaintModalOpen, setComplaintModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [complaintResponseData, setComplaintResponseData] = useState({ status: 'RESOLVED', staffResponse: '' });
  const [deleteComplaintModalOpen, setDeleteComplaintModalOpen] = useState(false);
  const [complaintToDelete, setComplaintToDelete] = useState(null);

  // Visitors State
  const [visitorsPage, setVisitorsPage] = useState({ content: [], totalPages: 1, totalElements: 0, number: 0 });

  // Notices State
  const [notices, setNotices] = useState([]);
  const [noticeModalOpen, setNoticeModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [noticeFormData, setNoticeFormData] = useState({ title: '', content: '' });
  const [deleteNoticeModalOpen, setDeleteNoticeModalOpen] = useState(false);
  const [noticeToDelete, setNoticeToDelete] = useState(null);

  // Payments State
  const [payments, setPayments] = useState([]);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentFormData, setPaymentFormData] = useState({
    hostellerId: '',
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    amount: '',
    paymentMethod: 'UPI / Online',
    note: '',
  });

  // Messages State
  const [messages, setMessages] = useState([]);
  const [recipients, setRecipients] = useState([]);
  const [selectedRecipientId, setSelectedRecipientId] = useState('');
  const [messageContent, setMessageContent] = useState('');

  // 1. Fetch Overview Stats
  const loadStats = async () => {
    try {
      const data = await dashboardApi.getStaffStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats', err);
    }
  };

  // 2. Fetch Rooms
  const loadRooms = async () => {
    try {
      setLoading(true);
      const data = await roomApi.getAllRooms();
      setRooms(data);
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to load rooms.' });
    } finally {
      setLoading(false);
    }
  };

  // 3. Fetch Hostellers
  const loadHostellers = async (page = 0) => {
    try {
      setLoading(true);
      const data = await hostellerApi.getAllHostellers(page, 8);
      setHostellersPage(data);
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to load hostellers.' });
    } finally {
      setLoading(false);
    }
  };

  // 4. Fetch Complaints
  const loadComplaints = async (page = 0) => {
    try {
      setLoading(true);
      const data = await complaintApi.getAllComplaints(page, 8);
      setComplaintsPage(data);
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to load complaints.' });
    } finally {
      setLoading(false);
    }
  };

  // 5. Fetch Visitors
  const loadVisitors = async (page = 0) => {
    try {
      setLoading(true);
      const data = await visitorApi.getAllVisitors(page, 8);
      setVisitorsPage(data);
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to load visitors.' });
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
      setAlert({ type: 'error', message: 'Failed to load notices.' });
    } finally {
      setLoading(false);
    }
  };

  // 7. Fetch Payments
  const loadPayments = async () => {
    try {
      setLoading(true);
      const data = await paymentApi.getAllPayments();
      setPayments(data);
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to load payments.' });
    } finally {
      setLoading(false);
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
      console.error('Failed to load messages', err);
    }
  };

  useEffect(() => {
    loadStats();
    if (activeTab === 'rooms') loadRooms();
    if (activeTab === 'hostellers') loadHostellers(0);
    if (activeTab === 'complaints') loadComplaints(0);
    if (activeTab === 'visitors') loadVisitors(0);
    if (activeTab === 'notices') loadNotices();
    if (activeTab === 'payments') {
      loadPayments();
      loadHostellers(0);
    }
    if (activeTab === 'messages') loadMessages();
  }, [activeTab]);

  // Handle Room CRUD
  const handleOpenRoomModal = (room = null) => {
    if (room) {
      setEditingRoom(room);
      setRoomFormData({
        roomNumber: room.roomNumber,
        capacity: room.capacity,
        rentPerPerson: room.rentPerPerson,
      });
    } else {
      setEditingRoom(null);
      setRoomFormData({ roomNumber: '', capacity: 2, rentPerPerson: 5000 });
    }
    setRoomModalOpen(true);
  };

  const handleSaveRoom = async (e) => {
    e.preventDefault();
    try {
      if (editingRoom) {
        await roomApi.updateRoom(editingRoom.id, roomFormData);
        setAlert({ type: 'success', message: `Room ${roomFormData.roomNumber} updated successfully!` });
      } else {
        await roomApi.addRoom(roomFormData);
        setAlert({ type: 'success', message: `Room ${roomFormData.roomNumber} created successfully!` });
      }
      setRoomModalOpen(false);
      loadRooms();
      loadStats();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || err.response?.data?.error || 'Failed to save room.' });
    }
  };

  const handleDeleteRoom = async () => {
    if (!roomToDelete) return;
    try {
      await roomApi.deleteRoom(roomToDelete.id);
      setAlert({ type: 'success', message: `Room ${roomToDelete.roomNumber} deleted successfully.` });
      setDeleteRoomModalOpen(false);
      loadRooms();
      loadStats();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Cannot delete room with occupants.' });
    }
  };

  // Handle Hosteller CRUD
  const handleOpenHostellerModal = (hosteller) => {
    setEditingHosteller(hosteller);
    setHostellerFormData({
      fullName: hosteller.fullName || '',
      phoneNumber: hosteller.phoneNumber || '',
      course: hosteller.course || '',
    });
    setHostellerModalOpen(true);
  };

  const handleSaveHosteller = async (e) => {
    e.preventDefault();
    try {
      await hostellerApi.updateHosteller(editingHosteller.id, hostellerFormData);
      setAlert({ type: 'success', message: 'Hosteller profile updated successfully!' });
      setHostellerModalOpen(false);
      loadHostellers(hostellersPage.number);
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to update hosteller.' });
    }
  };

  const handleDeleteHosteller = async () => {
    if (!hostellerToDelete) return;
    try {
      await hostellerApi.deleteHosteller(hostellerToDelete.id);
      setAlert({ type: 'success', message: 'Hosteller removed successfully.' });
      setDeleteHostellerModalOpen(false);
      loadHostellers(hostellersPage.number);
      loadStats();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to delete hosteller.' });
    }
  };

  // Handle Room Assignment
  const handleOpenAssignModal = () => {
    loadRooms();
    loadHostellers(0);
    setAssignData({ hostellerId: '', roomId: '' });
    setAssignModalOpen(true);
  };

  const handleAssignHosteller = async (e) => {
    e.preventDefault();
    if (!assignData.hostellerId || !assignData.roomId) {
      setAlert({ type: 'warning', message: 'Please select both a student and a room.' });
      return;
    }
    try {
      await roomApi.assignHosteller(Number(assignData.hostellerId), Number(assignData.roomId));
      setAlert({ type: 'success', message: 'Hosteller successfully assigned to room!' });
      setAssignModalOpen(false);
      loadRooms();
      loadHostellers(0);
      loadStats();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to assign room.' });
    }
  };

  // Handle Complaint Response
  const handleOpenComplaintModal = (comp) => {
    setSelectedComplaint(comp);
    setComplaintResponseData({
      status: comp.status === 'OPEN' ? 'IN_PROGRESS' : comp.status,
      staffResponse: comp.staffResponse || '',
    });
    setComplaintModalOpen(true);
  };

  const handleSaveComplaintResponse = async (e) => {
    e.preventDefault();
    try {
      await complaintApi.updateComplaintStatus(selectedComplaint.id, complaintResponseData);
      setAlert({ type: 'success', message: 'Complaint status updated successfully!' });
      setComplaintModalOpen(false);
      loadComplaints(complaintsPage.number);
      loadStats();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to update complaint.' });
    }
  };

  const handleDeleteComplaint = async () => {
    if (!complaintToDelete) return;
    try {
      await complaintApi.deleteComplaint(complaintToDelete.id);
      setAlert({ type: 'success', message: 'Complaint deleted.' });
      setDeleteComplaintModalOpen(false);
      loadComplaints(complaintsPage.number);
      loadStats();
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to delete complaint.' });
    }
  };

  // Handle Visitor Status
  const handleUpdateVisitorStatus = async (id, status) => {
    try {
      await visitorApi.updateVisitorStatus(id, status);
      setAlert({ type: 'success', message: `Visitor pass updated to ${status}.` });
      loadVisitors(visitorsPage.number);
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to update visitor status.' });
    }
  };

  // Handle Notice CRUD
  const handleOpenNoticeModal = (notice = null) => {
    if (notice) {
      setEditingNotice(notice);
      setNoticeFormData({ title: notice.title, content: notice.content });
    } else {
      setEditingNotice(null);
      setNoticeFormData({ title: '', content: '' });
    }
    setNoticeModalOpen(true);
  };

  const handleSaveNotice = async (e) => {
    e.preventDefault();
    try {
      if (editingNotice) {
        await noticeApi.updateNotice(editingNotice.id, noticeFormData);
        setAlert({ type: 'success', message: 'Notice updated successfully!' });
      } else {
        await noticeApi.createNotice(noticeFormData);
        setAlert({ type: 'success', message: 'Notice posted successfully!' });
      }
      setNoticeModalOpen(false);
      loadNotices();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to save notice.' });
    }
  };

  const handleDeleteNotice = async () => {
    if (!noticeToDelete) return;
    try {
      await noticeApi.deleteNotice(noticeToDelete.id);
      setAlert({ type: 'success', message: 'Notice deleted.' });
      setDeleteNoticeModalOpen(false);
      loadNotices();
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to delete notice.' });
    }
  };

  // Handle Record Payment
  const handleSavePayment = async (e) => {
    e.preventDefault();
    try {
      await paymentApi.recordPayment({
        hostellerId: Number(paymentFormData.hostellerId),
        year: Number(paymentFormData.year),
        month: Number(paymentFormData.month),
        amount: Number(paymentFormData.amount),
        paymentMethod: paymentFormData.paymentMethod,
        note: paymentFormData.note,
      });
      setAlert({ type: 'success', message: 'Payment recorded successfully!' });
      setPaymentModalOpen(false);
      loadPayments();
      loadStats();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to record payment.' });
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
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} role="WARDEN" />

      <div className="main-wrapper">
        <Navbar
          title={
            activeTab === 'overview'
              ? 'Warden Dashboard'
              : activeTab === 'rooms'
              ? 'Room Management'
              : activeTab === 'hostellers'
              ? 'Hosteller Students'
              : activeTab === 'payments'
              ? 'Fee & Payments'
              : activeTab === 'complaints'
              ? 'Complaints & Maintenance'
              : activeTab === 'visitors'
              ? 'Visitor Passes'
              : activeTab === 'notices'
              ? 'Hostel Notice Board'
              : 'Direct Communication'
          }
          subtitle="Hostel Administration Portal"
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
              <div className="hero-card">
                <h2>Welcome, Warden Administrator</h2>
                <p>
                  Centralized hostel management system. Monitor room availability, manage bed allocations, resolve hosteller complaints, and review digital payments in real time.
                </p>
              </div>

              <div className="stats-grid">
                <StatCard
                  title="Total Rooms"
                  value={stats?.totalRooms ?? rooms.length}
                  hint="Registered in database"
                  icon={DoorClosed}
                  color="blue"
                />
                <StatCard
                  title="Available Beds"
                  value={stats?.availableRooms ?? '—'}
                  hint="Ready for assignment"
                  icon={CheckCircle2}
                  color="emerald"
                />
                <StatCard
                  title="Total Occupancy"
                  value={`${stats?.occupiedBeds ?? 0} / ${stats?.totalCapacity ?? 0}`}
                  hint="Current hostellers"
                  icon={Users}
                  color="amber"
                />
                <StatCard
                  title="Open Complaints"
                  value={stats?.openComplaints ?? 0}
                  hint="Requiring attention"
                  icon={MessageSquareWarning}
                  color="purple"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
                {/* Quick Actions Panel */}
                <div className="card-panel">
                  <div className="card-panel-header">
                    <div className="card-panel-title">
                      <h3>Quick Administrative Actions</h3>
                      <p>Common tasks and operations</p>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleOpenRoomModal()}
                    >
                      <Plus size={16} /> Add New Room
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={handleOpenAssignModal}
                    >
                      <UserPlus size={16} /> Assign Hosteller
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => {
                        setPaymentFormData({
                          hostellerId: '',
                          year: new Date().getFullYear(),
                          month: new Date().getMonth() + 1,
                          amount: '',
                          paymentMethod: 'UPI / Online',
                          note: '',
                        });
                        setPaymentModalOpen(true);
                      }}
                    >
                      <CreditCard size={16} /> Record Fee
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleOpenNoticeModal()}
                    >
                      <Megaphone size={16} /> Post Notice
                    </button>
                  </div>
                </div>

                {/* Hosteller Summary Panel */}
                <div className="card-panel">
                  <div className="card-panel-header">
                    <div className="card-panel-title">
                      <h3>Hostel Capacity Overview</h3>
                      <p>Occupancy saturation</p>
                    </div>
                  </div>
                  <div style={{ padding: '8px 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', fontWeight: 700 }}>
                      <span>Bed Saturation Rate</span>
                      <span>
                        {stats?.totalCapacity
                          ? `${Math.round((stats.occupiedBeds / stats.totalCapacity) * 100)}%`
                          : '0%'}
                      </span>
                    </div>
                    <div
                      style={{
                        height: '12px',
                        background: '#e2e8f0',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        marginBottom: '16px',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          background: 'linear-gradient(90deg, #3b82f6, #1d4ed8)',
                          width: `${stats?.totalCapacity ? (stats.occupiedBeds / stats.totalCapacity) * 100 : 0}%`,
                          transition: 'width 0.5s ease',
                        }}
                      />
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      Keeping occupancy optimized helps improve hostel resource allocation and ensures safe, balanced accommodation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ROOM MANAGEMENT */}
          {activeTab === 'rooms' && (
            <div className="card-panel">
              <div className="card-panel-header">
                <div className="card-panel-title">
                  <h3>Hostel Rooms Directory</h3>
                  <p>View, configure capacity, amenities, and assign beds</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn btn-secondary btn-sm" onClick={handleOpenAssignModal}>
                    <UserPlus size={15} /> Assign to Room
                  </button>
                  <button className="btn btn-primary btn-sm" onClick={() => handleOpenRoomModal()}>
                    <Plus size={15} /> Add Room
                  </button>
                </div>
              </div>

              <DataTable
                columns={[
                  { header: 'Room No.', accessor: 'roomNumber', render: (r) => <strong>Room {r.roomNumber}</strong> },
                  { header: 'Capacity', accessor: 'capacity', render: (r) => `${r.capacity} Beds` },
                  { header: 'Occupied', accessor: 'occupied', render: (r) => `${r.occupied} Occupied` },
                  { header: 'Available', accessor: 'availableBeds', render: (r) => `${r.availableBeds} Free` },
                  { header: 'Monthly Rent', accessor: 'rentPerPerson', render: (r) => `₹${Number(r.rentPerPerson).toLocaleString()}` },
                  {
                    header: 'Status',
                    accessor: 'status',
                    render: (r) => <Badge variant={r.status} text={r.status} />,
                  },
                  {
                    header: 'Amenities',
                    render: (r) => (
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {r.amenities && r.amenities.length > 0 ? (
                          r.amenities.map((a, i) => (
                            <span key={i} style={{ fontSize: '11px', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', color: '#475569' }}>
                              {a}
                            </span>
                          ))
                        ) : (
                          <span style={{ fontSize: '11px', color: '#94a3b8' }}>Basic</span>
                        )}
                      </div>
                    ),
                  },
                  {
                    header: 'Actions',
                    render: (r) => (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px' }}
                          title="Edit Room"
                          onClick={() => handleOpenRoomModal(r)}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          style={{ padding: '4px 8px' }}
                          title="Delete Room"
                          onClick={() => {
                            setRoomToDelete(r);
                            setDeleteRoomModalOpen(true);
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ),
                  },
                ]}
                data={rooms}
                loading={loading}
                searchKey="roomNumber"
                searchPlaceholder="Search room number..."
              />
            </div>
          )}

          {/* TAB 3: HOSTELLERS */}
          {activeTab === 'hostellers' && (
            <div className="card-panel">
              <div className="card-panel-header">
                <div className="card-panel-title">
                  <h3>Registered Hostellers</h3>
                  <p>All student residents, allocated rooms, and emergency profiles</p>
                </div>
                <button className="btn btn-primary btn-sm" onClick={handleOpenAssignModal}>
                  <UserPlus size={15} /> Assign to Room
                </button>
              </div>

              <DataTable
                columns={[
                  { header: 'Full Name', accessor: 'fullName', render: (h) => <strong>{h.fullName}</strong> },
                  { header: 'Email', accessor: 'email' },
                  { header: 'Phone', accessor: 'phoneNumber', render: (h) => h.phoneNumber || '—' },
                  { header: 'Course / Dept', accessor: 'course', render: (h) => h.course || '—' },
                  {
                    header: 'Allocated Room',
                    render: (h) => (
                      h.roomNumber ? (
                        <span style={{ fontWeight: 700, color: 'var(--primary)' }}>Room {h.roomNumber}</span>
                      ) : (
                        <Badge variant="warning" text="Not Assigned" />
                      )
                    ),
                  },
                  {
                    header: 'Emergency Contact',
                    render: (h) => (
                      h.guardianName ? (
                        <span style={{ fontSize: '12px' }}>{h.guardianName} ({h.guardianPhone})</span>
                      ) : (
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>—</span>
                      )
                    ),
                  },
                  {
                    header: 'Actions',
                    render: (h) => (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px' }}
                          title="Edit Hosteller"
                          onClick={() => handleOpenHostellerModal(h)}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          style={{ padding: '4px 8px' }}
                          title="Delete Hosteller"
                          onClick={() => {
                            setHostellerToDelete(h);
                            setDeleteHostellerModalOpen(true);
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ),
                  },
                ]}
                data={hostellersPage.content}
                loading={loading}
                searchKey="fullName"
                searchPlaceholder="Search hosteller name..."
                pagination={{
                  page: hostellersPage.number,
                  totalPages: hostellersPage.totalPages,
                  totalElements: hostellersPage.totalElements,
                  size: 8,
                  onPageChange: (newPage) => loadHostellers(newPage),
                }}
              />
            </div>
          )}

          {/* TAB 4: FEE MANAGEMENT */}
          {activeTab === 'payments' && (
            <div className="card-panel">
              <div className="card-panel-header">
                <div className="card-panel-title">
                  <h3>Hostel Fee Records</h3>
                  <p>Log and review monthly rent payments</p>
                </div>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    setPaymentFormData({
                      hostellerId: '',
                      year: new Date().getFullYear(),
                      month: new Date().getMonth() + 1,
                      amount: '',
                      paymentMethod: 'UPI / Online',
                      note: '',
                    });
                    setPaymentModalOpen(true);
                  }}
                >
                  <Plus size={15} /> Record Payment
                </button>
              </div>

              <DataTable
                columns={[
                  { header: 'Receipt ID', accessor: 'id', render: (p) => `#REC-${String(p.id).padStart(4, '0')}` },
                  { header: 'Hosteller', accessor: 'hostellerName', render: (p) => <strong>{p.hostellerName}</strong> },
                  { header: 'Period', render: (p) => `${p.month}/${p.year}` },
                  { header: 'Amount', accessor: 'amount', render: (p) => <span style={{ fontWeight: 800, color: 'var(--accent-emerald)' }}>₹{Number(p.amount).toLocaleString()}</span> },
                  { header: 'Method', accessor: 'paymentMethod' },
                  { header: 'Payment Date', accessor: 'paymentDate' },
                  { header: 'Remarks / Notes', accessor: 'note', render: (p) => p.note || '—' },
                ]}
                data={payments}
                loading={loading}
                searchKey="hostellerName"
                searchPlaceholder="Search student name..."
              />
            </div>
          )}

          {/* TAB 5: COMPLAINTS */}
          {activeTab === 'complaints' && (
            <div className="card-panel">
              <div className="card-panel-header">
                <div className="card-panel-title">
                  <h3>Hostel Maintenance & Complaints</h3>
                  <p>Review student tickets, assign technicians, and resolve issues</p>
                </div>
              </div>

              <DataTable
                columns={[
                  { header: 'Ticket', accessor: 'id', render: (c) => `#CMP-${c.id}` },
                  { header: 'Student', accessor: 'studentName', render: (c) => <strong>{c.studentName}</strong> },
                  { header: 'Title', accessor: 'title', render: (c) => <span style={{ fontWeight: 600 }}>{c.title}</span> },
                  { header: 'Description', accessor: 'description', width: '30%', render: (c) => <p style={{ fontSize: '12px', color: '#475569', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.description}</p> },
                  {
                    header: 'Status',
                    accessor: 'status',
                    render: (c) => <Badge variant={c.status} text={c.status} />,
                  },
                  { header: 'Staff Response', accessor: 'staffResponse', render: (c) => c.staffResponse || <span style={{ color: '#94a3b8' }}>Awaiting reply</span> },
                  {
                    header: 'Actions',
                    render: (c) => (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          className="btn btn-primary btn-sm"
                          style={{ padding: '4px 10px', fontSize: '11px' }}
                          onClick={() => handleOpenComplaintModal(c)}
                        >
                          Resolve / Respond
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          style={{ padding: '4px 8px' }}
                          title="Delete Complaint"
                          onClick={() => {
                            setComplaintToDelete(c);
                            setDeleteComplaintModalOpen(true);
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ),
                  },
                ]}
                data={complaintsPage.content}
                loading={loading}
                searchKey="title"
                searchPlaceholder="Search complaint title..."
                pagination={{
                  page: complaintsPage.number,
                  totalPages: complaintsPage.totalPages,
                  totalElements: complaintsPage.totalElements,
                  size: 8,
                  onPageChange: (p) => loadComplaints(p),
                }}
              />
            </div>
          )}

          {/* TAB 6: VISITOR PASSES */}
          {activeTab === 'visitors' && (
            <div className="card-panel">
              <div className="card-panel-header">
                <div className="card-panel-title">
                  <h3>Visitor Entry Requests</h3>
                  <p>Gate security passes and status review</p>
                </div>
              </div>

              <DataTable
                columns={[
                  { header: 'Pass ID', accessor: 'id', render: (v) => `#VIS-${v.id}` },
                  { header: 'Hosteller', accessor: 'studentName', render: (v) => <strong>{v.studentName}</strong> },
                  { header: 'Visitor Name', accessor: 'visitorName' },
                  { header: 'Relationship', accessor: 'relationship' },
                  { header: 'Visit Date', accessor: 'visitDate' },
                  { header: 'Time Slot', render: (v) => `${v.inTime || '—'} - ${v.outTime || '—'}` },
                  {
                    header: 'Status',
                    accessor: 'status',
                    render: (v) => <Badge variant={v.status} text={v.status} />,
                  },
                  {
                    header: 'Actions',
                    render: (v) => (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {v.status === 'PENDING' && (
                          <>
                            <button
                              className="btn btn-sm"
                              style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', padding: '4px 8px', fontSize: '11px' }}
                              onClick={() => handleUpdateVisitorStatus(v.id, 'APPROVED')}
                            >
                              Approve
                            </button>
                            <button
                              className="btn btn-sm"
                              style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', padding: '4px 8px', fontSize: '11px' }}
                              onClick={() => handleUpdateVisitorStatus(v.id, 'REJECTED')}
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {v.status === 'APPROVED' && (
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '4px 8px', fontSize: '11px' }}
                            onClick={() => handleUpdateVisitorStatus(v.id, 'CHECKED_IN')}
                          >
                            Mark In
                          </button>
                        )}
                        {v.status === 'CHECKED_IN' && (
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '4px 8px', fontSize: '11px' }}
                            onClick={() => handleUpdateVisitorStatus(v.id, 'CHECKED_OUT')}
                          >
                            Mark Out
                          </button>
                        )}
                      </div>
                    ),
                  },
                ]}
                data={visitorsPage.content}
                loading={loading}
                searchKey="visitorName"
                searchPlaceholder="Search visitor name..."
                pagination={{
                  page: visitorsPage.number,
                  totalPages: visitorsPage.totalPages,
                  totalElements: visitorsPage.totalElements,
                  size: 8,
                  onPageChange: (p) => loadVisitors(p),
                }}
              />
            </div>
          )}

          {/* TAB 7: NOTICES */}
          {activeTab === 'notices' && (
            <div className="card-panel">
              <div className="card-panel-header">
                <div className="card-panel-title">
                  <h3>Hostel Notice Board</h3>
                  <p>Broadcast alerts, gate timings, and hostel policies</p>
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => handleOpenNoticeModal()}>
                  <Plus size={15} /> Post Notice
                </button>
              </div>

              <DataTable
                columns={[
                  { header: 'Title', accessor: 'title', render: (n) => <span style={{ fontWeight: 700 }}>{n.title}</span> },
                  { header: 'Notice Content', accessor: 'content', width: '50%' },
                  { header: 'Posted By', accessor: 'createdBy' },
                  { header: 'Date Posted', accessor: 'createdAt', render: (n) => n.createdAt?.substring(0, 10) || 'Today' },
                  {
                    header: 'Actions',
                    render: (n) => (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px' }}
                          onClick={() => handleOpenNoticeModal(n)}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          style={{ padding: '4px 8px' }}
                          onClick={() => {
                            setNoticeToDelete(n);
                            setDeleteNoticeModalOpen(true);
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ),
                  },
                ]}
                data={notices}
                loading={loading}
                searchKey="title"
                searchPlaceholder="Search notice title..."
              />
            </div>
          )}

          {/* TAB 8: COMMUNICATION */}
          {activeTab === 'messages' && (
            <div className="card-panel">
              <div className="card-panel-header">
                <div className="card-panel-title">
                  <h3>Hosteller Messaging</h3>
                  <p>Send direct announcements or private instructions to students</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
                <div>
                  <FormSelect
                    label="Select Hosteller"
                    value={selectedRecipientId}
                    onChange={(e) => setSelectedRecipientId(e.target.value)}
                    options={recipients.map((r) => ({ value: r.id, label: `${r.fullName} (${r.role})` }))}
                  />

                  <form onSubmit={handleSendMessage}>
                    <FormTextarea
                      label="Message Content"
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      placeholder="Type your message here..."
                      rows={5}
                      required
                    />
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                      <Send size={15} /> Send Message
                    </button>
                  </form>
                </div>

                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>Recent Messages</h4>
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
                        No messages recorded yet.
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
                            <strong style={{ fontSize: '13px', color: 'var(--primary)' }}>
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
        </main>
      </div>

      {/* MODAL: ADD / EDIT ROOM */}
      <Modal
        isOpen={roomModalOpen}
        onClose={() => setRoomModalOpen(false)}
        title={editingRoom ? `Edit Room ${editingRoom.roomNumber}` : 'Add New Room'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setRoomModalOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSaveRoom}>
              {editingRoom ? 'Update Room' : 'Create Room'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSaveRoom}>
          <FormField
            label="Room Number"
            name="roomNumber"
            value={roomFormData.roomNumber}
            onChange={(e) => setRoomFormData({ ...roomFormData, roomNumber: e.target.value })}
            placeholder="e.g. 104 or A-201"
            required
          />
          <FormField
            label="Room Capacity (Beds)"
            name="capacity"
            type="number"
            min="1"
            max="10"
            value={roomFormData.capacity}
            onChange={(e) => setRoomFormData({ ...roomFormData, capacity: Number(e.target.value) })}
            required
          />
          <FormField
            label="Monthly Rent per Person (₹)"
            name="rentPerPerson"
            type="number"
            min="0"
            step="100"
            value={roomFormData.rentPerPerson}
            onChange={(e) => setRoomFormData({ ...roomFormData, rentPerPerson: Number(e.target.value) })}
            required
          />
        </form>
      </Modal>

      {/* MODAL: DELETE ROOM CONFIRMATION */}
      <ConfirmDeleteModal
        isOpen={deleteRoomModalOpen}
        onClose={() => setDeleteRoomModalOpen(false)}
        onConfirm={handleDeleteRoom}
        title="Delete Room"
        message="Are you sure you want to delete this room? This room must have 0 occupants."
        itemDescription={roomToDelete ? `Room ${roomToDelete.roomNumber} (${roomToDelete.capacity} beds)` : ''}
      />

      {/* MODAL: ASSIGN HOSTELLER TO ROOM */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="Assign Hosteller to Room"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setAssignModalOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleAssignHosteller}>
              Confirm Allocation
            </button>
          </>
        }
      >
        <form onSubmit={handleAssignHosteller}>
          <FormSelect
            label="Select Hosteller Student"
            value={assignData.hostellerId}
            onChange={(e) => setAssignData({ ...assignData, hostellerId: e.target.value })}
            options={hostellersPage.content.map((h) => ({
              value: h.id,
              label: `${h.fullName} (${h.roomNumber ? `Currently Room ${h.roomNumber}` : 'No Room'})`,
            }))}
            placeholder="Choose a hosteller..."
            required
          />

          <FormSelect
            label="Select Destination Room"
            value={assignData.roomId}
            onChange={(e) => setAssignData({ ...assignData, roomId: e.target.value })}
            options={rooms.map((r) => ({
              value: r.id,
              label: `Room ${r.roomNumber} - ${r.availableBeds} beds available (${r.status})`,
            }))}
            placeholder="Choose room..."
            required
          />
        </form>
      </Modal>

      {/* MODAL: EDIT HOSTELLER */}
      <Modal
        isOpen={hostellerModalOpen}
        onClose={() => setHostellerModalOpen(false)}
        title="Edit Hosteller Details"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setHostellerModalOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSaveHosteller}>
              Save Changes
            </button>
          </>
        }
      >
        <form onSubmit={handleSaveHosteller}>
          <FormField
            label="Full Name"
            value={hostellerFormData.fullName}
            onChange={(e) => setHostellerFormData({ ...hostellerFormData, fullName: e.target.value })}
            required
          />
          <FormField
            label="Phone Number"
            value={hostellerFormData.phoneNumber}
            onChange={(e) => setHostellerFormData({ ...hostellerFormData, phoneNumber: e.target.value })}
          />
          <FormField
            label="Course / Branch"
            value={hostellerFormData.course}
            onChange={(e) => setHostellerFormData({ ...hostellerFormData, course: e.target.value })}
          />
        </form>
      </Modal>

      {/* MODAL: DELETE HOSTELLER */}
      <ConfirmDeleteModal
        isOpen={deleteHostellerModalOpen}
        onClose={() => setDeleteHostellerModalOpen(false)}
        onConfirm={handleDeleteHosteller}
        title="Remove Hosteller"
        message="Are you sure you want to remove this hosteller? Their allocated bed will be freed up."
        itemDescription={hostellerToDelete ? `${hostellerToDelete.fullName} (${hostellerToDelete.email})` : ''}
      />

      {/* MODAL: RESOLVE COMPLAINT */}
      <Modal
        isOpen={complaintModalOpen}
        onClose={() => setComplaintModalOpen(false)}
        title={`Respond to Complaint #${selectedComplaint?.id}`}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setComplaintModalOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSaveComplaintResponse}>
              Update Ticket
            </button>
          </>
        }
      >
        {selectedComplaint && (
          <div style={{ marginBottom: '16px', padding: '12px', background: '#f8fafc', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '13px', fontWeight: 700 }}>{selectedComplaint.title}</div>
            <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>{selectedComplaint.description}</div>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Filed by: {selectedComplaint.studentName}</div>
          </div>
        )}

        <form onSubmit={handleSaveComplaintResponse}>
          <FormSelect
            label="Ticket Status"
            value={complaintResponseData.status}
            onChange={(e) => setComplaintResponseData({ ...complaintResponseData, status: e.target.value })}
            options={[
              { value: 'OPEN', label: 'OPEN' },
              { value: 'IN_PROGRESS', label: 'IN_PROGRESS' },
              { value: 'RESOLVED', label: 'RESOLVED' },
            ]}
            required
          />

          <FormTextarea
            label="Staff Response / Technician Report"
            value={complaintResponseData.staffResponse}
            onChange={(e) => setComplaintResponseData({ ...complaintResponseData, staffResponse: e.target.value })}
            placeholder="Add update or resolution details for the student..."
            rows={4}
            required
          />
        </form>
      </Modal>

      {/* MODAL: DELETE COMPLAINT */}
      <ConfirmDeleteModal
        isOpen={deleteComplaintModalOpen}
        onClose={() => setDeleteComplaintModalOpen(false)}
        onConfirm={handleDeleteComplaint}
        title="Delete Complaint Ticket"
        message="Are you sure you want to delete this complaint record?"
        itemDescription={complaintToDelete?.title}
      />

      {/* MODAL: POST / EDIT NOTICE */}
      <Modal
        isOpen={noticeModalOpen}
        onClose={() => setNoticeModalOpen(false)}
        title={editingNotice ? 'Edit Notice' : 'Post New Notice'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setNoticeModalOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSaveNotice}>
              {editingNotice ? 'Update Notice' : 'Broadcast Notice'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSaveNotice}>
          <FormField
            label="Notice Title"
            value={noticeFormData.title}
            onChange={(e) => setNoticeFormData({ ...noticeFormData, title: e.target.value })}
            placeholder="e.g. Wi-Fi Maintenance or Curfew Notice"
            required
          />
          <FormTextarea
            label="Announcement Content"
            value={noticeFormData.content}
            onChange={(e) => setNoticeFormData({ ...noticeFormData, content: e.target.value })}
            placeholder="Detailed instructions or information..."
            rows={5}
            required
          />
        </form>
      </Modal>

      {/* MODAL: DELETE NOTICE */}
      <ConfirmDeleteModal
        isOpen={deleteNoticeModalOpen}
        onClose={() => setDeleteNoticeModalOpen(false)}
        onConfirm={handleDeleteNotice}
        title="Delete Notice"
        message="Are you sure you want to remove this announcement from the notice board?"
        itemDescription={noticeToDelete?.title}
      />

      {/* MODAL: RECORD PAYMENT */}
      <Modal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        title="Record Fee Payment"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setPaymentModalOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSavePayment}>
              Save Payment Receipt
            </button>
          </>
        }
      >
        <form onSubmit={handleSavePayment}>
          <FormSelect
            label="Hosteller Student"
            value={paymentFormData.hostellerId}
            onChange={(e) => setPaymentFormData({ ...paymentFormData, hostellerId: e.target.value })}
            options={hostellersPage.content.map((h) => ({
              value: h.id,
              label: `${h.fullName} (Room: ${h.roomNumber || 'None'})`,
            }))}
            placeholder="Select hosteller..."
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <FormField
              label="Billing Month (1-12)"
              type="number"
              min="1"
              max="12"
              value={paymentFormData.month}
              onChange={(e) => setPaymentFormData({ ...paymentFormData, month: Number(e.target.value) })}
              required
            />
            <FormField
              label="Billing Year"
              type="number"
              min="2020"
              max="2035"
              value={paymentFormData.year}
              onChange={(e) => setPaymentFormData({ ...paymentFormData, year: Number(e.target.value) })}
              required
            />
          </div>

          <FormField
            label="Amount Paid (₹)"
            type="number"
            min="1"
            step="50"
            value={paymentFormData.amount}
            onChange={(e) => setPaymentFormData({ ...paymentFormData, amount: e.target.value })}
            placeholder="e.g. 5000"
            required
          />

          <FormSelect
            label="Payment Mode"
            value={paymentFormData.paymentMethod}
            onChange={(e) => setPaymentFormData({ ...paymentFormData, paymentMethod: e.target.value })}
            options={[
              { value: 'UPI / Online', label: 'UPI / Online (GPay/PhonePe)' },
              { value: 'Net Banking', label: 'Net Banking / NEFT' },
              { value: 'Cash', label: 'Cash in Hand' },
              { value: 'Credit / Debit Card', label: 'Credit / Debit Card' },
            ]}
          />

          <FormField
            label="Transaction Note"
            value={paymentFormData.note}
            onChange={(e) => setPaymentFormData({ ...paymentFormData, note: e.target.value })}
            placeholder="e.g. October rent paid via UPI reference 98124..."
          />
        </form>
      </Modal>
    </div>
  );
};

export default WardenDashboard;
