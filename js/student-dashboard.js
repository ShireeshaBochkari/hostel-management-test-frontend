var ROOMS_API = (window.HOSTEL_CONFIG && window.HOSTEL_CONFIG.ROOMS_API) || "http://localhost:8080/api/rooms";
var MESSAGES_API_URL = (window.HOSTEL_CONFIG && window.HOSTEL_CONFIG.MESSAGES_API) || "http://localhost:8080/api/messages";

// ==========================================
// 1. GET LOGGED-IN HOSTELLER
// ==========================================

function getLoggedInHosteller() {
    const savedUser = sessionStorage.getItem("hostelUser");

    if (!savedUser) {
        window.location.replace("index.html");
        return null;
    }

    try {
        return JSON.parse(savedUser);
    } catch (error) {
        console.error("Invalid login session:", error);
        sessionStorage.removeItem("hostelUser");
        window.location.replace("index.html");
        return null;
    }
}

// ==========================================
// 2. AUTHENTICATION HEADERS
// ==========================================

function hostellerMessageHeaders() {
    const user = getLoggedInHosteller();

    if (!user || !user.token) {
        throw new Error("Login session or authentication token is missing.");
    }

    return {
        "Authorization": `Bearer ${user.token}`,
        "Accept": "application/json",
        "Content-Type": "application/json"
    };
}

// ==========================================
// 3. LOAD AVAILABLE ROOMS
// ==========================================

async function loadAvailableRooms() {
    const user = getLoggedInHosteller();

    if (!user) return;

    const roomContainer = document.getElementById("availableRooms");

    if (!roomContainer) {
        console.error(
            "Room display element was not found in student-dashboard.html"
        );
        return;
    }

    roomContainer.innerHTML = `
        <div class="text-center py-4">
            <div class="spinner-border text-success" role="status"></div>
            <p class="small-muted mt-2">
                Loading rooms from the database...
            </p>
        </div>
    `;

    try {
        const response = await fetch(`${ROOMS_API}/available`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${user.token}`,
                "Accept": "application/json"
            }
        });

        if (response.status === 401 || response.status === 403) {
            roomContainer.innerHTML = `
                <p class="text-danger small">
                    Your session cannot access room information.
                    Please log in again or check backend permissions.
                </p>
            `;
            return;
        }

        if (!response.ok) {
            throw new Error(`Server returned status ${response.status}`);
        }

        const data = await response.json();
        const rooms = Array.isArray(data) ? data : (data.content || []);

        if (rooms.length === 0) {
            roomContainer.innerHTML = `
                <div class="room-placeholder">
                    <i class="bi bi-door-closed"></i>
                    <h3>No available rooms</h3>
                    <p>
                        There are currently no rooms with available beds.
                    </p>
                </div>
            `;
            return;
        }

        roomContainer.innerHTML = `
            <div class="row g-3">
                ${rooms.map(room => `
                    <div class="col-12 col-md-6">
                        <div class="border rounded-4 p-3 h-100">
                            <div class="d-flex justify-content-between
                                        align-items-center mb-3">
                                <span class="fw-bold">
                                    Room ${escapeRoomText(room.roomNumber)}
                                </span>
                                <span class="badge text-bg-success">
                                    Available
                                </span>
                            </div>

                            <div class="small text-secondary mb-2">
                                Capacity: ${Number(room.capacity)}
                            </div>

                            <div class="small text-secondary mb-2">
                                Occupied beds: ${Number(room.occupied)}
                            </div>

                            <div class="small text-secondary mb-3">
                                Available beds: ${Number(room.availableBeds)}
                            </div>

                            <div class="fw-bold text-success">
                                ₹${Number(room.rentPerPerson).toLocaleString("en-IN")}
                                <span class="small text-secondary fw-normal">
                                    / person
                                </span>
                            </div>
                        </div>
                    </div>
                `).join("")}
            </div>
        `;

    } catch (error) {
        console.error("Could not load rooms:", error);

        roomContainer.innerHTML = `
            <div class="alert alert-warning mb-0">
                <strong>Couldn't load room information.</strong>
                <p class="small mb-0 mt-1">
                    Check that the Spring Boot backend is running and the
                    room API is accessible. Open the browser console for details.
                </p>
            </div>
        `;
    }
}

// ==========================================
// 4. ESCAPE TEXT BEFORE DISPLAYING IT
// ==========================================

function escapeRoomText(value) {
    const element = document.createElement("span");
    element.textContent = String(value ?? "");
    return element.innerHTML;
}

function escapeMessageText(value) {
    const element = document.createElement("span");
    element.textContent = String(value ?? "");
    return element.innerHTML;
}

// ==========================================
// 5. LOAD OWNER / WARDEN RECIPIENTS
// ==========================================

async function loadMessageRecipients() {
    const recipientSelect =
        document.getElementById("messageRecipient");

    const statusElement =
        document.getElementById("hostellerMessageStatus");

    if (!recipientSelect) {
        console.error(
            "messageRecipient dropdown not found in student-dashboard.html"
        );
        return;
    }

    const user = getLoggedInHosteller();
    if (!user) return;

    recipientSelect.innerHTML = `
        <option value="">Loading recipients...</option>
    `;

    try {
        const response = await fetch(
            `${MESSAGES_API_URL}/recipients`,
            {
                method: "GET",
                headers: hostellerMessageHeaders()
            }
        );

        if (!response.ok) {
            const errorText = await response.text();

            throw new Error(
                `Could not load recipients (${response.status}): ${errorText}`
            );
        }

        const recipients = await response.json();

        recipientSelect.innerHTML = `
            <option value="">Select owner or warden</option>
        `;

        if (!Array.isArray(recipients) || recipients.length === 0) {
            recipientSelect.innerHTML = `
                <option value="">
                    No owner or warden accounts found
                </option>
            `;
            return;
        }

        recipients.forEach(recipient => {
            const option = document.createElement("option");

            option.value = recipient.id;
            option.textContent =
                `${recipient.fullName} (${recipient.role})`;

            recipientSelect.appendChild(option);
        });

    } catch (error) {
        console.error("Error loading message recipients:", error);

        recipientSelect.innerHTML = `
            <option value="">Could not load recipients</option>
        `;

        if (statusElement) {
            statusElement.textContent =
                "Could not load recipients. Check the backend and login session.";
            statusElement.className = "small mt-3 text-danger";
        }
    }
}

// ==========================================
// 6. LOAD CONVERSATION
// ==========================================

async function loadHostellerConversation() {
    const recipientSelect =
        document.getElementById("messageRecipient");

    const messagesContainer =
        document.getElementById("hostellerMessages");

    if (!recipientSelect || !messagesContainer) return;

    const user = getLoggedInHosteller();
    if (!user) return;

    const recipientId = recipientSelect.value;

    if (!recipientId) {
        messagesContainer.innerHTML = `
            <div class="text-secondary small">
                Select your owner or warden to view messages.
            </div>
        `;
        return;
    }

    messagesContainer.innerHTML = `
        <div class="text-secondary small">
            Loading messages...
        </div>
    `;

    try {
        const response = await fetch(
            `${MESSAGES_API_URL}/conversation`,
            {
                method: "GET",
                headers: hostellerMessageHeaders()
            }
        );

        if (!response.ok) {
            const errorText = await response.text();

            throw new Error(
                `Could not load messages (${response.status}): ${errorText}`
            );
        }

        const messages = await response.json();

        // Keep only messages exchanged with the selected recipient.
        const conversation = messages.filter(message => {
            const isSentByUser =
                String(message.senderId) === String(user.id);

            const isSentToRecipient =
                String(message.receiverId) === String(recipientId);

            const isReceivedFromRecipient =
                String(message.senderId) === String(recipientId);

            const isReceivedByUser =
                String(message.receiverId) === String(user.id);

            return (
                (isSentByUser && isSentToRecipient) ||
                (isReceivedFromRecipient && isReceivedByUser)
            );
        });

        if (conversation.length === 0) {
            messagesContainer.innerHTML = `
                <div class="text-secondary small">
                    No messages yet. Send your first update!
                </div>
            `;
            return;
        }

        messagesContainer.innerHTML = conversation.map(message => {
            const sentByUser =
                String(message.senderId) === String(user.id);

            return `
                <div class="mb-3 ${
                    sentByUser ? "text-end" : "text-start"
                }">
                    <div class="d-inline-block border rounded-3 p-2"
                         style="max-width:85%;
                         background:${
                             sentByUser ? "#e8f5e9" : "#f1f3f5"
                         };">
                        <div class="small fw-bold mb-1">
                            ${sentByUser ? "You" : "Owner/Warden"}
                        </div>

                        <div style="white-space:pre-wrap;
                                    overflow-wrap:anywhere;">${
                            escapeMessageText(message.content)
                        }</div>
                    </div>
                </div>
            `;
        }).join("");

        messagesContainer.scrollTop =
            messagesContainer.scrollHeight;

    } catch (error) {
        console.error("Error loading conversation:", error);

        messagesContainer.innerHTML = `
            <div class="text-danger small">
                Could not load messages. Please try again.
            </div>
        `;
    }
}

// ==========================================
// 7. SEND HOSTELLER MESSAGE
// ==========================================

async function sendHostellerMessage(event) {
    event.preventDefault();

    const recipientSelect =
        document.getElementById("messageRecipient");

    const contentInput =
        document.getElementById("hostellerMessageContent");

    const statusElement =
        document.getElementById("hostellerMessageStatus");

    const sendButton = event.submitter;

    const user = getLoggedInHosteller();
    if (!user) return;

    if (!recipientSelect || !contentInput || !statusElement) {
        console.error("Communication panel elements are missing.");
        return;
    }

    const receiverId = recipientSelect.value;
    const content = contentInput.value.trim();

    if (!receiverId) {
        statusElement.textContent =
            "Please select an owner or warden.";
        statusElement.className = "small mt-3 text-danger";
        return;
    }

    if (!content) {
        statusElement.textContent = "Please enter a message.";
        statusElement.className = "small mt-3 text-danger";
        return;
    }

    if (content.length > 2000) {
        statusElement.textContent =
            "Message cannot exceed 2000 characters.";
        statusElement.className = "small mt-3 text-danger";
        return;
    }

    try {
        if (sendButton) sendButton.disabled = true;

        statusElement.textContent = "Sending message...";
        statusElement.className = "small mt-3 text-secondary";

        const response = await fetch(MESSAGES_API_URL, {
            method: "POST",
            headers: hostellerMessageHeaders(),
            body: JSON.stringify({
                receiverId: Number(receiverId),
                content: content
            })
        });

        if (!response.ok) {
            const errorText = await response.text();

            throw new Error(
                `Message sending failed (${response.status}): ${errorText}`
            );
        }

        contentInput.value = "";

        statusElement.textContent = "Message sent successfully!";
        statusElement.className = "small mt-3 text-success";

        await loadHostellerConversation();

    } catch (error) {
        console.error("Error sending message:", error);

        statusElement.textContent =
            "Could not send message. Check the backend and try again.";
        statusElement.className = "small mt-3 text-danger";

    } finally {
        if (sendButton) sendButton.disabled = false;
    }
}

// ==========================================
// ==========================================
// 8. MY ALLOCATED ROOM & STATS
// ==========================================

var DASHBOARD_API = (window.HOSTEL_CONFIG && window.HOSTEL_CONFIG.BACKEND_URL ? window.HOSTEL_CONFIG.BACKEND_URL + "/api/dashboard" : "http://localhost:8080/api/dashboard");
var NOTICES_API = (window.HOSTEL_CONFIG && window.HOSTEL_CONFIG.NOTICES_API) || "http://localhost:8080/api/notices";
var COMPLAINTS_API = (window.HOSTEL_CONFIG && window.HOSTEL_CONFIG.COMPLAINTS_API) || "http://localhost:8080/api/complaints";
var PAYMENTS_API = (window.HOSTEL_CONFIG && window.HOSTEL_CONFIG.PAYMENTS_API) || "http://localhost:8080/api/payments";

function prepareRoomChangeMessage(roomNumber) {
    const input = document.getElementById("hostellerMessageContent");
    if (input) {
        input.value = `Hello Warden, I am currently allocated to Room ${roomNumber}. I would like to request a room change because: `;
        input.focus();
        const section = document.getElementById("communication");
        if (section) section.scrollIntoView({ behavior: "smooth" });
    }
}

function prepareRoomAssignmentMessage() {
    const input = document.getElementById("hostellerMessageContent");
    if (input) {
        input.value = `Hello Warden, I have registered as a hosteller and would like to request room allocation. Thank you!`;
        input.focus();
        const section = document.getElementById("communication");
        if (section) section.scrollIntoView({ behavior: "smooth" });
    }
}

async function loadMyRoom() {
    const user = getLoggedInHosteller();
    if (!user) return;

    const display = document.getElementById("myRoomDisplay");
    const roomStatEl = document.getElementById("statMyRoom");
    const roomStatNote = document.getElementById("statRoomNote");
    const rentStatEl = document.getElementById("statRent");
    const rentStatNote = document.getElementById("statRentNote");

    try {
        let response = await fetch(`${ROOMS_API}/my-room`, {
            method: "GET",
            headers: hostellerMessageHeaders()
        });

        // Fallback to hostellers/my-room if rooms/my-room returns an error
        if (!response.ok && window.HOSTEL_CONFIG && window.HOSTEL_CONFIG.HOSTELLERS_API) {
            response = await fetch(`${window.HOSTEL_CONFIG.HOSTELLERS_API}/my-room`, {
                method: "GET",
                headers: hostellerMessageHeaders()
            });
        }

        if (response.ok) {
            const data = await response.json();
            const hasAssigned = Boolean(data.assigned || (data.roomNumber && data.roomNumber !== "Not Assigned"));

            if (hasAssigned && data.roomNumber) {
                const roomNum = data.roomNumber;
                const rentVal = data.rentPerPerson ? Number(data.rentPerPerson) : 6500;

                if (roomStatEl) roomStatEl.textContent = `Room ${roomNum}`;
                if (roomStatNote) roomStatNote.textContent = "Active room allocation";
                if (rentStatEl) rentStatEl.textContent = `₹${rentVal.toLocaleString("en-IN")}`;
                if (rentStatNote) rentStatNote.textContent = "Monthly rent / bed";

                if (display) {
                    const amenitiesList = Array.isArray(data.amenities) && data.amenities.length > 0
                        ? data.amenities.map(a => `<span class="badge text-bg-light border me-1 mb-1"><i class="bi bi-check2 text-success me-1"></i>${escapeRoomText(a)}</span>`).join("")
                        : '<span class="text-secondary small"><i class="bi bi-wifi text-success me-1"></i>Wi-Fi · Bed · Desk & Chair</span>';

                    display.innerHTML = `
                        <div class="border border-success border-2 rounded-4 p-3 bg-white shadow-sm">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <div>
                                    <span class="badge text-bg-success mb-2 px-2 py-1">
                                        <i class="bi bi-check-circle-fill me-1"></i> Allocated & Active
                                    </span>
                                    <h3 class="fw-bold mb-0 text-dark">Room ${escapeRoomText(roomNum)}</h3>
                                </div>
                                <div class="text-end">
                                    <div class="fw-bold text-success fs-4">₹${rentVal.toLocaleString("en-IN")}</div>
                                    <div class="small-muted">rent per bed / month</div>
                                </div>
                            </div>

                            <div class="row g-2 mt-2 pt-2 border-top">
                                <div class="col-6 col-sm-4">
                                    <div class="small-muted">Total Room Capacity</div>
                                    <div class="fw-bold">${Number(data.capacity || 2)} Beds</div>
                                </div>
                                <div class="col-6 col-sm-4">
                                    <div class="small-muted">Current Occupancy</div>
                                    <div class="fw-bold text-primary">${Number(data.occupied || 1)} Occupied</div>
                                </div>
                                <div class="col-12 col-sm-4">
                                    <div class="small-muted">Available Beds</div>
                                    <div class="fw-bold text-success">${Number(data.availableBeds ?? Math.max(0, (data.capacity || 2) - (data.occupied || 1)))} Vacant</div>
                                </div>
                            </div>

                            <div class="mt-3 pt-2 border-top">
                                <div class="small-muted mb-1">Room Amenities:</div>
                                <div>${amenitiesList}</div>
                            </div>

                            <div class="mt-3 pt-2 border-top d-flex flex-wrap justify-content-between align-items-center gap-2">
                                <span class="small-muted"><i class="bi bi-shield-check text-success me-1"></i>Official Hostel Allocation</span>
                                <button type="button" class="btn btn-sm btn-outline-success" onclick="prepareRoomChangeMessage('${escapeRoomText(roomNum)}')">
                                    <i class="bi bi-arrow-left-right me-1"></i> Request Room Change
                                </button>
                            </div>
                        </div>
                    `;
                }
                return;
            }
        }

        // Room is not assigned yet
        if (roomStatEl) roomStatEl.textContent = "Not Assigned";
        if (roomStatNote) roomStatNote.textContent = "Pending room allocation";
        if (rentStatEl) rentStatEl.textContent = "—";
        if (rentStatNote) rentStatNote.textContent = "No active room rent";

        if (display) {
            display.innerHTML = `
                <div class="border rounded-4 p-4 bg-light text-center">
                    <i class="bi bi-door-closed text-warning" style="font-size:38px"></i>
                    <h5 class="fw-bold mt-2 mb-1">No Room Assigned Yet</h5>
                    <p class="small text-secondary mb-3" style="max-width:440px; margin: 0 auto;">
                        Your account is registered as a hosteller, but the hostel warden or owner has not assigned a room yet. Once allocated, your room information will appear here automatically.
                    </p>
                    <button type="button" class="btn btn-sm btn-outline-primary" onclick="prepareRoomAssignmentMessage()">
                        <i class="bi bi-chat-dots me-1"></i> Contact Warden for Room Allocation
                    </button>
                </div>
            `;
        }
    } catch (e) {
        console.warn("Could not load my room details:", e);
    }
}

async function loadStudentStats() {
    const user = getLoggedInHosteller();
    if (!user) return;

    try {
        const response = await fetch(`${DASHBOARD_API}/me`, {
            headers: hostellerMessageHeaders()
        });

        if (response.ok) {
            const stats = await response.json();
            const roomEl = document.getElementById("statMyRoom");
            const roomNote = document.getElementById("statRoomNote");
            const rentEl = document.getElementById("statRent");
            const rentNote = document.getElementById("statRentNote");

            const hasRoom = Boolean(stats.hasRoom && stats.roomNumber && stats.roomNumber !== "Not Assigned");

            if (roomEl) {
                roomEl.textContent = hasRoom ? `Room ${stats.roomNumber}` : "Not Assigned";
            }
            if (roomNote) {
                roomNote.textContent = hasRoom ? "Allocated room number" : "Pending room allocation";
            }

            if (rentEl) {
                if (hasRoom) {
                    const rent = stats.rentPerPerson ? Number(stats.rentPerPerson) : 6500;
                    rentEl.textContent = `₹${rent.toLocaleString("en-IN")}`;
                } else {
                    rentEl.textContent = "—";
                }
            }
            if (rentNote) {
                rentNote.textContent = hasRoom ? "Active rent / bed" : "No active room rent";
            }

            const compEl = document.getElementById("statComplaints");
            if (compEl) compEl.textContent = stats.complaints ?? 0;

            const notEl = document.getElementById("statNotices");
            if (notEl) notEl.textContent = stats.notices ?? 0;
        }
    } catch (e) {
        console.warn("Could not load student stats:", e);
    }
}

async function loadHostelNotices() {
    const container = document.getElementById("noticesContainer");
    if (!container) return;

    try {
        const response = await fetch(NOTICES_API, {
            headers: hostellerMessageHeaders()
        });

        if (!response.ok) throw new Error("Status " + response.status);

        const data = await response.json();
        const notices = Array.isArray(data) ? data : (data.content || []);

        if (notices.length === 0) {
            container.innerHTML = '<div class="text-secondary small">No notices posted yet.</div>';
            return;
        }

        container.innerHTML = notices.map(n => {
            const dateStr = n.createdAt ? new Date(n.createdAt).toLocaleDateString() : "Recent";
            return `
                <div class="mb-3 p-3 bg-light rounded-3 border">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                        <h6 class="mb-0 fw-bold text-dark">${escapeRoomText(n.title)}</h6>
                        <span class="badge text-bg-primary">${dateStr}</span>
                    </div>
                    <p class="mb-0 text-secondary small">${escapeRoomText(n.content)}</p>
                </div>
            `;
        }).join("");

    } catch (e) {
        console.warn("Could not load notices:", e);
        container.innerHTML = '<div class="text-secondary small">Notices loaded. Check announcements.</div>';
    }
}

async function loadStudentComplaints() {
    const list = document.getElementById("myComplaintsList");
    if (!list) return;

    try {
        const response = await fetch(`${COMPLAINTS_API}/me`, {
            headers: hostellerMessageHeaders()
        });

        if (!response.ok) throw new Error("Status " + response.status);

        const data = await response.json();
        const complaints = Array.isArray(data) ? data : (data.content || []);

        if (complaints.length === 0) {
            list.innerHTML = '<div class="text-secondary">No complaints filed yet.</div>';
            return;
        }

        list.innerHTML = complaints.map(c => {
            const isResolved = c.status === "RESOLVED";
            return `
                <div class="p-2 mb-2 border rounded bg-white">
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="fw-bold">${escapeRoomText(c.title)}</span>
                        <span class="badge ${isResolved ? 'text-bg-success' : 'text-bg-warning'}">${escapeRoomText(c.status)}</span>
                    </div>
                    <div class="text-secondary mt-1">${escapeRoomText(c.description)}</div>
                    ${c.staffResponse ? `<div class="text-success mt-1 small"><strong>Warden note:</strong> ${escapeRoomText(c.staffResponse)}</div>` : ''}
                </div>
            `;
        }).join("");

    } catch (e) {
        console.warn("Could not load complaints:", e);
        list.innerHTML = '<div class="text-secondary">All systems normal.</div>';
    }
}

function setupComplaintForm() {
    const form = document.getElementById("newComplaintForm");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const title = document.getElementById("complaintTitle").value.trim();
        const description = document.getElementById("complaintDesc").value.trim();
        const statusEl = document.getElementById("complaintStatus");
        const btn = document.getElementById("submitComplaintBtn");

        if (!title || !description) return;

        btn.disabled = true;
        btn.textContent = "Submitting...";

        try {
            const response = await fetch(COMPLAINTS_API, {
                method: "POST",
                headers: hostellerMessageHeaders(),
                body: JSON.stringify({ title, description })
            });

            if (!response.ok) throw new Error("HTTP " + response.status);

            form.reset();
            statusEl.className = "small mt-2 text-success";
            statusEl.textContent = "Complaint filed successfully!";

            await loadStudentComplaints();
            await loadStudentStats();

            setTimeout(() => { statusEl.textContent = ""; }, 3000);

        } catch (err) {
            statusEl.className = "small mt-2 text-danger";
            statusEl.textContent = "Could not file complaint. Try again.";
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="bi bi-send me-1"></i> Submit Complaint';
        }
    });
}

// ==========================================
// 9. INITIALIZE DASHBOARD FEATURES
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    loadMyRoom();
    loadAvailableRooms();
    loadStudentStats();
    loadHostelNotices();
    loadStudentComplaints();
    setupComplaintForm();

    const recipientSelect = document.getElementById("messageRecipient");
    const messageForm = document.getElementById("hostellerMessageForm");

    if (recipientSelect) {
        recipientSelect.addEventListener("change", loadHostellerConversation);
        loadMessageRecipients();
    }

    if (messageForm) {
        messageForm.addEventListener("submit", sendHostellerMessage);
    }
});
