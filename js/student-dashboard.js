
const ROOMS_API = "http://localhost:8080/api/rooms";
const MESSAGES_API_URL = "http://localhost:8080/api/messages";

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

        const rooms = await response.json();

        if (!Array.isArray(rooms) || rooms.length === 0) {
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
// 8. INITIALIZE DASHBOARD FEATURES
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    // Existing room feature
    loadAvailableRooms();

    // Communication feature
    const recipientSelect =
        document.getElementById("messageRecipient");

    const messageForm =
        document.getElementById("hostellerMessageForm");

    if (recipientSelect) {
        recipientSelect.addEventListener(
            "change",
            loadHostellerConversation
        );
    }

    if (messageForm) {
        messageForm.addEventListener(
            "submit",
            sendHostellerMessage
        );
    }

    if (recipientSelect) {
        loadMessageRecipients();
    }
});
