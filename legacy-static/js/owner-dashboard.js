
const ROOM_API_URL = "http://localhost:8080/api/rooms";
const HOSTELLER_API_URL = "http://localhost:8080/api/hostellers";

// ========================================
// 1. OWNER LOGIN AND AUTHENTICATION
// ========================================

function getLoggedInOwner() {
    const savedUser = sessionStorage.getItem("hostelUser");

    if (!savedUser) {
        window.location.replace("index.html");
        return null;
    }

    try {
        const user = JSON.parse(savedUser);

        if (user.role !== "WARDEN" && user.role !== "ADMIN") {
            window.location.replace("student-dashboard.html");
            return null;
        }

        return user;
    } catch (error) {
        sessionStorage.removeItem("hostelUser");
        window.location.replace("index.html");
        return null;
    }
}

const loggedInOwner = getLoggedInOwner();

if (loggedInOwner) {
    const name = loggedInOwner.fullName || "Owner";

    document.getElementById("ownerName").textContent = name;
    document.getElementById("welcomeName").textContent = name;
    document.getElementById("ownerInitial").textContent =
        name.trim().charAt(0).toUpperCase() || "O";
}


// ========================================
// 2. COMMON HELPER FUNCTIONS
// ========================================

function roomRequestOptions() {
    return {
        headers: {
            Authorization: `Bearer ${loggedInOwner.token}`,
            Accept: "application/json",
            "Content-Type": "application/json"
        }
    };
}

function escapeHTML(value) {
    const element = document.createElement("span");
    element.textContent = String(value ?? "");
    return element.innerHTML;
}

async function readResponse(response) {
    const text = await response.text();

    if (!text) {
        return {};
    }

    try {
        return JSON.parse(text);
    } catch (error) {
        return { message: text };
    }
}


// ========================================
// 3. LOAD ALL ROOMS
// ========================================

async function loadRooms() {
    if (!loggedInOwner) return;

    const tbody = document.getElementById("roomTableBody");
    const message = document.getElementById("roomLoadMessage");

    tbody.innerHTML = `
        <tr>
            <td colspan="6" class="text-center py-4">
                Loading rooms...
            </td>
        </tr>
    `;

    message.textContent = "";

    try {
        const response = await fetch(
            ROOM_API_URL,
            roomRequestOptions()
        );

        const rooms = await readResponse(response);

        if (!response.ok) {
            throw new Error(
                rooms.message ||
                `Could not load rooms. HTTP ${response.status}`
            );
        }

        if (!Array.isArray(rooms)) {
            throw new Error("The room API did not return a room list.");
        }

        const totalRooms = rooms.length;

        const totalCapacity = rooms.reduce(
            (sum, room) => sum + Number(room.capacity || 0),
            0
        );

        const occupiedBeds = rooms.reduce(
            (sum, room) => sum + Number(room.occupied || 0),
            0
        );

        const availableRooms = rooms.filter(
            room => Number(room.capacity) > Number(room.occupied)
        ).length;

        document.getElementById("totalRooms").textContent =
            totalRooms;

        document.getElementById("availableRoomsCount").textContent =
            availableRooms;

        document.getElementById("totalCapacity").textContent =
            totalCapacity;

        document.getElementById("occupiedBeds").textContent =
            occupiedBeds;

        if (rooms.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6"
                        class="text-center text-secondary py-4">
                        No rooms have been added yet.
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = rooms.map(room => {
            const capacity = Number(room.capacity || 0);
            const occupied = Number(room.occupied || 0);

            const available = Math.max(
                0,
                Number(
                    room.availableBeds ?? (capacity - occupied)
                )
            );

            const isFull = available <= 0;

            return `
                <tr>
                    <td class="fw-bold">
                        ${escapeHTML(room.roomNumber)}
                    </td>

                    <td>${capacity}</td>
                    <td>${occupied}</td>
                    <td>${available}</td>

                    <td>
                        ₹${Number(
                            room.rentPerPerson || 0
                        ).toLocaleString("en-IN")}
                    </td>

                    <td>
                        <span class="badge ${
                            isFull
                                ? "text-bg-danger"
                                : "text-bg-success"
                        }">
                            ${isFull ? "FULL" : "AVAILABLE"}
                        </span>
                    </td>
                </tr>
            `;
        }).join("");

    } catch (error) {
        console.error("Room loading failed:", error);

        tbody.innerHTML = `
            <tr>
                <td colspan="6"
                    class="text-center text-danger py-4">
                    Could not load rooms.
                </td>
            </tr>
        `;

        message.textContent = error.message;
    }
}


// ========================================
// 4. LOAD REGISTERED HOSTELLERS
// ========================================
let allHostellers = [];
async function loadHostellers() {
    if (!loggedInOwner) return;

    const tbody = document.getElementById("hostellerTableBody");
    const count = document.getElementById("totalHostellers");
    const message = document.getElementById("hostellerLoadMessage");

    if (!tbody || !count || !message) {
        console.error("Hosteller table elements are missing.");
        return;
    }

    tbody.innerHTML = `
        <tr>
            <td colspan="6" class="text-center py-4">
                Loading hostellers...
            </td>
        </tr>
    `;

    message.textContent = "";

    try {
        const response = await fetch(
            HOSTELLER_API_URL,
            roomRequestOptions()
        );

        const hostellers = await readResponse(response);

        if (!response.ok) {
            throw new Error(
                hostellers?.message ||
                `Could not load hostellers. HTTP ${response.status}`
            );
        }

        if (!Array.isArray(hostellers)) {
            throw new Error(
                "The API did not return a hosteller list."
            );
        }

        count.textContent = hostellers.length;
        allHostellers = hostellers;

        if (hostellers.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6"
                        class="text-center text-secondary py-4">
                        No registered hostellers found.
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = hostellers.map(student => {
            const roomNumber =
                student.roomNumber || "Not Assigned";

            const hasRoom =
                roomNumber !== "Not Assigned";

            const studentId = Number(student.id);

            const actionButton = hasRoom
                ? `
                    <button
                        type="button"
                        class="btn btn-sm btn-outline-warning"
                        onclick="changeHostellerRoom(${studentId})">
                        Change Room
                    </button>
                  `
                : `
                    <button
                        type="button"
                        class="btn btn-sm btn-outline-primary"
                        onclick="
                            document.getElementById('assignHosteller').value='${studentId}';
                            document.getElementById('assignHosteller').scrollIntoView({
                                behavior: 'smooth',
                                block: 'center'
                            });
                        ">
                        Assign Room
                    </button>
                  `;

            return `
                <tr>
                    <td>${escapeHTML(student.id)}</td>

                    <td class="fw-bold">
                        ${escapeHTML(student.fullName)}
                    </td>

                    <td>${escapeHTML(student.email)}</td>

                    <td>
                        <span class="badge text-bg-success">
                            ${escapeHTML(student.role)}
                        </span>
                    </td>

                    <td>
                        ${
                            hasRoom
                                ? escapeHTML(roomNumber)
                                : '<span class="text-secondary">Not Assigned</span>'
                        }
                    </td>

                    <td>${actionButton}</td>
                </tr>
            `;
        }).join("");

    } catch (error) {
        console.error("Hosteller loading failed:", error);

        count.textContent = "—";

        tbody.innerHTML = `
            <tr>
                <td colspan="6"
                    class="text-center text-danger py-4">
                    Could not load hostellers.
                </td>
            </tr>
        `;

        message.textContent = error.message;
    }
}

function filterHostellers() {
    const searchInput = document.getElementById("hostellerSearch");
    const statusFilter = document.getElementById("roomStatusFilter");
    const tbody = document.getElementById("hostellerTableBody");

    if (!searchInput || !statusFilter || !tbody) return;

    const searchText = searchInput.value.trim().toLowerCase();
    const selectedStatus = statusFilter.value;

    const filteredHostellers = allHostellers.filter(student => {
        const roomNumber = student.roomNumber || "";
        const hasRoom =
            roomNumber !== "" &&
            roomNumber !== "Not Assigned";

        const matchesSearch =
            String(student.id ?? "").toLowerCase().includes(searchText) ||
            String(student.fullName ?? "").toLowerCase().includes(searchText) ||
            String(student.email ?? "").toLowerCase().includes(searchText);

        const matchesStatus =
            selectedStatus === "ALL" ||
            (selectedStatus === "ASSIGNED" && hasRoom) ||
            (selectedStatus === "UNASSIGNED" && !hasRoom);

        return matchesSearch && matchesStatus;
    });

    if (filteredHostellers.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6"
                    class="text-center text-secondary py-4">
                    No matching hostellers found.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = filteredHostellers.map(student => {
        const roomNumber = student.roomNumber || "Not Assigned";
        const hasRoom = roomNumber !== "Not Assigned";
        const studentId = Number(student.id);

        const actionButton = hasRoom
            ? `
                <button type="button"
                    class="btn btn-sm btn-outline-warning"
                    onclick="changeHostellerRoom(${studentId})">
                    Change Room
                </button>
              `
            : `
                <button type="button"
                    class="btn btn-sm btn-outline-primary"
                    onclick="
                        document.getElementById('assignHosteller').value='${studentId}';
                        document.getElementById('assignHosteller').scrollIntoView({
                            behavior: 'smooth',
                            block: 'center'
                        });
                    ">
                    Assign Room
                </button>
              `;

        return `
            <tr>
                <td>${escapeHTML(student.id)}</td>
                <td class="fw-bold">${escapeHTML(student.fullName)}</td>
                <td>${escapeHTML(student.email)}</td>
                <td>
                    <span class="badge text-bg-success">
                        ${escapeHTML(student.role)}
                    </span>
                </td>
                <td>
                    ${hasRoom
                        ? escapeHTML(roomNumber)
                        : '<span class="text-secondary">Not Assigned</span>'}
                </td>
                <td>${actionButton}</td>
            </tr>
        `;
    }).join("");
}


// ========================================
// 5. LOAD ASSIGNMENT DROPDOWNS
// ========================================

async function loadRoomAssignmentDropdowns() {
    if (!loggedInOwner) return;

    const hostellerSelect =
        document.getElementById("assignHosteller");

    const roomSelect =
        document.getElementById("assignRoom");

    const message =
        document.getElementById("assignRoomMessage");

    if (!hostellerSelect || !roomSelect || !message) {
        console.error("Room assignment HTML elements are missing.");
        return;
    }

    hostellerSelect.disabled = true;
    roomSelect.disabled = true;

    hostellerSelect.innerHTML =
        '<option value="">Loading hostellers...</option>';

    roomSelect.innerHTML =
        '<option value="">Loading rooms...</option>';

    try {
        const [hostellerResponse, roomResponse] =
            await Promise.all([
                fetch(HOSTELLER_API_URL, roomRequestOptions()),
                fetch(`${ROOM_API_URL}/available`, roomRequestOptions())
            ]);

        const hostellers = await readResponse(hostellerResponse);
        const rooms = await readResponse(roomResponse);

        if (!hostellerResponse.ok) {
            throw new Error(
                `Hosteller API error: ${hostellerResponse.status}`
            );
        }

        if (!roomResponse.ok) {
            throw new Error(
                `Room API error: ${roomResponse.status}`
            );
        }

        if (!Array.isArray(hostellers)) {
            throw new Error("Hosteller API did not return a list.");
        }

        if (!Array.isArray(rooms)) {
            throw new Error("Room API did not return a list.");
        }

        const unassignedHostellers = hostellers.filter(student =>
            !student.roomNumber ||
            student.roomNumber === "Not Assigned"
        );

        hostellerSelect.innerHTML =
            '<option value="">Choose a hosteller</option>' +
            unassignedHostellers.map(student => `
                <option value="${escapeHTML(student.id)}">
                    ${escapeHTML(student.fullName)}
                    (ID: ${escapeHTML(student.id)})
                </option>
            `).join("");

        const availableRooms = rooms.filter(room =>
            Number(room.capacity) > Number(room.occupied)
        );

        roomSelect.innerHTML =
            '<option value="">Choose an available room</option>' +
            availableRooms.map(room => {
                const beds = Math.max(
                    0,
                    Number(
                        room.availableBeds ??
                        (Number(room.capacity) - Number(room.occupied))
                    )
                );

                return `
                    <option value="${escapeHTML(room.id)}">
                        Room ${escapeHTML(room.roomNumber)}
                        — ${beds} bed(s) available
                    </option>
                `;
            }).join("");

        if (unassignedHostellers.length === 0) {
            hostellerSelect.innerHTML =
                '<option value="">No unassigned hostellers</option>';
        }

        if (availableRooms.length === 0) {
            roomSelect.innerHTML =
                '<option value="">No available rooms</option>';
        }

        message.textContent = "";
        message.className = "small mt-3";

    } catch (error) {
        console.error("Assignment dropdown error:", error);

        hostellerSelect.innerHTML =
            '<option value="">Could not load hostellers</option>';

        roomSelect.innerHTML =
            '<option value="">Could not load rooms</option>';

        message.textContent = error.message;
        message.className = "small mt-3 text-danger";

    } finally {
        hostellerSelect.disabled = false;
        roomSelect.disabled = false;
    }
}

async function changeHostellerRoom(hostellerId) {
    if (!loggedInOwner) return;

    try {
        const response = await fetch(
            `${ROOM_API_URL}/available`,
            roomRequestOptions()
        );

        const rooms = await readResponse(response);

        if (!response.ok || !Array.isArray(rooms)) {
            throw new Error("Could not load available rooms.");
        }

        const availableRooms = rooms.filter(room =>
            Number(room.capacity) > Number(room.occupied)
        );

        if (availableRooms.length === 0) {
            alert("No rooms with available beds were found.");
            return;
        }

        const options = availableRooms.map(room =>
            `${room.id}: Room ${room.roomNumber} (${Math.max(
                0,
                Number(room.availableBeds ??
                    (Number(room.capacity) - Number(room.occupied)))
            )} beds available)`
        ).join("\n");

        const selection = prompt(
            "Enter the ID of the new room:\n\n" + options
        );

        if (selection === null || selection.trim() === "") return;

        const newRoomId = Number(selection.trim());

        if (!Number.isInteger(newRoomId)) {
            alert("Please enter a valid room ID.");
            return;
        }

        
const selectedRoom = availableRooms.find(
    room => Number(room.id) === newRoomId
);

if (!selectedRoom) {
    alert("Please select an ID from the available rooms.");
    return;
}

console.log("Available rooms:", JSON.stringify(availableRooms, null, 2));
console.log("Entered room ID:", newRoomId, typeof newRoomId);

        if (!selectedRoom) {
            alert("Please select an ID from the available rooms.");
            return;
        }

        if (!confirm(
            `Move this hosteller to Room ${selectedRoom.roomNumber}?`
        )) {
            return;
        }

        const updateResponse = await fetch(
            `${ROOM_API_URL}/reassign/${hostellerId}/${selectedRoom.id}`,
            {
                ...roomRequestOptions(),
                method: "PUT"
            }
        );

        const result = await readResponse(updateResponse);

        if (!updateResponse.ok) {
            throw new Error(
                result.message ||
                result.detail ||
                `Room change failed. HTTP ${updateResponse.status}`
            );
        }

        alert("Room changed successfully!");

        await Promise.all([
            loadHostellers(),
            loadRooms(),
            loadRoomAssignmentDropdowns()
        ]);

    } catch (error) {
        console.error("Change room failed:", error);
        alert(error.message || "Could not change the room.");
    }

}


// ========================================
// 8. REFRESH BUTTONS AND LOGOUT
// ========================================

document.getElementById("refreshRooms")
    ?.addEventListener("click", loadRooms);

document.getElementById("refreshHostellers")
    ?.addEventListener("click", async function() {
        await Promise.all([
            loadHostellers(),
            loadRoomAssignmentDropdowns()
        ]);
    });

document.getElementById("logoutButton")
    ?.addEventListener("click", function(event) {
        event.preventDefault();

        sessionStorage.removeItem("hostelUser");
        sessionStorage.removeItem("selectedRole");

        window.location.replace("index.html");
    });


// ========================================
// 9. INITIAL DASHBOARD LOAD
// ========================================


console.log("Owner dashboard JS loaded");

function initializeOwnerDashboard() {
    console.log("Initializing owner dashboard...");

    if (!loggedInOwner) {
        console.error("Owner is not logged in.");
        return;
    }

    console.log("Automatically loading rooms...");
    loadRooms();

    console.log("Automatically loading hostellers...");
    loadHostellers();

    console.log("Automatically loading assignment dropdowns...");
    loadRoomAssignmentDropdowns();

    
document.getElementById("hostellerSearch")
    ?.addEventListener("input", filterHostellers);

document.getElementById("roomStatusFilter")
    ?.addEventListener("change", filterHostellers);

}

// Your existing owner-dashboard.js code stays above.

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeOwnerDashboard, { once: true });
} else {
    initializeOwnerDashboard();
}

// ========================================
// 10. OWNER-HOSTELLER COMMUNICATION
// ========================================

// Paste the communication functions here.
// ========================================
// 10. OWNER-HOSTELLER COMMUNICATION
// ========================================

const MESSAGES_API_URL = "http://localhost:8080/api/messages";

function messageRequestOptions(method = "GET", body = null) {
    return {
        method,
        headers: {
            Authorization: `Bearer ${loggedInOwner.token}`,
            Accept: "application/json",
            "Content-Type": "application/json"
        },
        ...(body ? { body: JSON.stringify(body) } : {})
    };
}

function setOwnerMessageStatus(text, isError = false) {
    const status = document.getElementById("ownerMessageStatus");
    if (!status) return;

    status.textContent = text;
    status.className = `small mt-3 ${isError ? "text-danger" : "text-success"}`;
}

function populateMessageHostellers() {
    const select = document.getElementById("messageHosteller");
    if (!select) return;

    const previousId = select.value;

    select.innerHTML =
        '<option value="">Choose a hosteller</option>' +
        allHostellers
            .filter(student => student.role === "HOSTELER")
            .map(student => `
                <option value="${escapeHTML(student.id)}">
                    ${escapeHTML(student.fullName)}
                    (ID: ${escapeHTML(student.id)})
                </option>
            `).join("");

    if (allHostellers.some(student =>
        String(student.id) === previousId &&
        student.role === "HOSTELER"
    )) {
        select.value = previousId;
    }
}

async function loadOwnerConversation() {
    const select = document.getElementById("messageHosteller");
    const container = document.getElementById("ownerMessages");

    if (!select || !container || !loggedInOwner) return;

    const receiverId = select.value;

    if (!receiverId) {
        container.innerHTML =
            '<div class="text-secondary small">Select a hosteller to view messages.</div>';
        return;
    }

    container.innerHTML =
        '<div class="text-secondary small">Loading messages...</div>';

    try {
        const response = await fetch(
            `${MESSAGES_API_URL}/conversation`,
            messageRequestOptions()
        );

        const messages = await readResponse(response);

        if (!response.ok || !Array.isArray(messages)) {
            throw new Error(
                messages.message || `Could not load messages. HTTP ${response.status}`
            );
        }

        const conversation = messages.filter(message =>
            (String(message.senderId) === String(loggedInOwner.id) &&
             String(message.receiverId) === receiverId) ||
            (String(message.senderId) === receiverId &&
             String(message.receiverId) === String(loggedInOwner.id))
        );

        if (conversation.length === 0) {
            container.innerHTML =
                '<div class="text-secondary small">No messages yet. Send the first message!</div>';
            return;
        }

        container.innerHTML = conversation.map(message => {
            const mine =
                String(message.senderId) === String(loggedInOwner.id);

            return `
                <div class="mb-3 ${mine ? "text-end" : "text-start"}">
                    <div class="small text-secondary mb-1">
                        ${mine ? "You" : escapeHTML(message.senderName)}
                        · ${escapeHTML(message.createdAt || "")}
                    </div>
                    <div class="d-inline-block rounded p-2 ${
                        mine ? "bg-primary text-white" : "bg-light border"
                    }" style="max-width:85%; overflow-wrap:anywhere;">
                        ${escapeHTML(message.content)}
                    </div>
                </div>
            `;
        }).join("");

        container.scrollTop = container.scrollHeight;
    } catch (error) {
        console.error("Conversation loading failed:", error);
        container.innerHTML =
            '<div class="text-danger small">Could not load messages.</div>';
        setOwnerMessageStatus(error.message, true);
    }
}

async function sendOwnerMessage(event) {
    event.preventDefault();

    const select = document.getElementById("messageHosteller");
    const contentInput = document.getElementById("ownerMessageContent");

    if (!select || !contentInput || !select.value) {
        setOwnerMessageStatus("Please select a hosteller first.", true);
        return;
    }

    const content = contentInput.value.trim();

    if (!content) {
        setOwnerMessageStatus("Please enter a message.", true);
        return;
    }

    try {
        setOwnerMessageStatus("Sending message...");

        const response = await fetch(
            MESSAGES_API_URL,
            messageRequestOptions("POST", {
                receiverId: Number(select.value),
                content
            })
        );

        const result = await readResponse(response);

        if (!response.ok) {
            throw new Error(
                result.error || result.message ||
                `Message could not be sent. HTTP ${response.status}`
            );
        }

        contentInput.value = "";
        setOwnerMessageStatus("Message sent successfully!");
        await loadOwnerConversation();
    } catch (error) {
        console.error("Sending message failed:", error);
        setOwnerMessageStatus(error.message, true);
    }
}

document.getElementById("messageHosteller")
    ?.addEventListener("change", loadOwnerConversation);

document.getElementById("ownerMessageForm")
    ?.addEventListener("submit", sendOwnerMessage);

// Populate the recipient dropdown after hostellers load.
const originalLoadHostellers = loadHostellers;

loadHostellers = async function() {
    await originalLoadHostellers();
    populateMessageHostellers();
};

populateMessageHostellers();