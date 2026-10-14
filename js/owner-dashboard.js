var ROOM_API_URL = (window.HOSTEL_CONFIG && window.HOSTEL_CONFIG.ROOMS_API) || "http://localhost:8080/api/rooms";
var HOSTELLER_API_URL = (window.HOSTEL_CONFIG && window.HOSTEL_CONFIG.HOSTELLERS_API) || "http://localhost:8080/api/hostellers";
var MESSAGES_API_URL = (window.HOSTEL_CONFIG && window.HOSTEL_CONFIG.MESSAGES_API) || "http://localhost:8080/api/messages";

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
            <td colspan="7" class="text-center py-4">
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

        allRooms = rooms;

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
                    <td colspan="7"
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
                    <td>
                        <button type="button" class="btn btn-sm btn-outline-danger" title="Delete Room" onclick="deleteRoom(${room.id})">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join("");

    } catch (error) {
        console.error("Room loading failed:", error);

        tbody.innerHTML = `
            <tr>
                <td colspan="7"
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
let allRooms = [];

function selectHostellerForAssignment(studentId) {
    const select = document.getElementById("assignHosteller");
    if (!select) return;
    select.value = String(studentId);
    select.dispatchEvent(new Event("change"));
    const section = document.getElementById("room-allocation");
    if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "center" });
    }
}

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
        const fetchUrl = HOSTELLER_API_URL.includes("?")
            ? `${HOSTELLER_API_URL}&size=1000`
            : `${HOSTELLER_API_URL}?page=0&size=1000`;

        const response = await fetch(
            fetchUrl,
            roomRequestOptions()
        );

        const data = await readResponse(response);

        if (!response.ok) {
            throw new Error(
                data?.message ||
                `Could not load hostellers. HTTP ${response.status}`
            );
        }

        const hostellers = Array.isArray(data) ? data : (data.content || []);
        count.textContent = data.totalElements !== undefined ? data.totalElements : hostellers.length;
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
                    <div class="d-flex gap-1 flex-wrap">
                        <button
                            type="button"
                            class="btn btn-sm btn-outline-warning"
                            onclick="openChangeRoomModal(${studentId})"
                            title="Change Room">
                            <i class="bi bi-arrow-left-right me-1"></i>Change
                        </button>
                        <button
                            type="button"
                            class="btn btn-sm btn-outline-secondary"
                            onclick="unassignHosteller(${studentId})"
                            title="Unassign from Room">
                            <i class="bi bi-x-circle me-1"></i>Unassign
                        </button>
                        <button
                            type="button"
                            class="btn btn-sm btn-outline-danger"
                            onclick="deleteHosteller(${studentId})"
                            title="Delete Hosteller">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                  `
                : `
                    <div class="d-flex gap-1 flex-wrap">
                        <button
                            type="button"
                            class="btn btn-sm btn-outline-primary"
                            onclick="selectHostellerForAssignment(${studentId})"
                            title="Assign Room">
                            <i class="bi bi-door-open me-1"></i>Assign
                        </button>
                        <button
                            type="button"
                            class="btn btn-sm btn-outline-danger"
                            onclick="deleteHosteller(${studentId})"
                            title="Delete Hosteller">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
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
                                ? `<span class="badge text-bg-primary">Room ${escapeHTML(roomNumber)}</span>`
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
                <div class="d-flex gap-1 flex-wrap">
                    <button type="button"
                        class="btn btn-sm btn-outline-warning"
                        onclick="openChangeRoomModal(${studentId})"
                        title="Change Room">
                        <i class="bi bi-arrow-left-right me-1"></i>Change
                    </button>
                    <button type="button"
                        class="btn btn-sm btn-outline-secondary"
                        onclick="unassignHosteller(${studentId})"
                        title="Unassign from Room">
                        <i class="bi bi-x-circle me-1"></i>Unassign
                    </button>
                    <button type="button"
                        class="btn btn-sm btn-outline-danger"
                        onclick="deleteHosteller(${studentId})"
                        title="Delete Hosteller">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
              `
            : `
                <div class="d-flex gap-1 flex-wrap">
                    <button type="button"
                        class="btn btn-sm btn-outline-primary"
                        onclick="selectHostellerForAssignment(${studentId})"
                        title="Assign Room">
                        <i class="bi bi-door-open me-1"></i>Assign
                    </button>
                    <button type="button"
                        class="btn btn-sm btn-outline-danger"
                        onclick="deleteHosteller(${studentId})"
                        title="Delete Hosteller">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
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
                        ? `<span class="badge text-bg-primary">Room ${escapeHTML(roomNumber)}</span>`
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

    const statusBadge =
        document.getElementById("assignHostellerStatusBadge");

    const assignBtn =
        document.getElementById("assignRoomButton");

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
        const fetchUrl = HOSTELLER_API_URL.includes("?")
            ? `${HOSTELLER_API_URL}&size=1000`
            : `${HOSTELLER_API_URL}?page=0&size=1000`;

        const [hostellerResponse, roomResponse] =
            await Promise.all([
                fetch(fetchUrl, roomRequestOptions()),
                fetch(`${ROOM_API_URL}/available`, roomRequestOptions())
            ]);

        const hostellerData = await readResponse(hostellerResponse);
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

        const hostellers = Array.isArray(hostellerData) ? hostellerData : (hostellerData.content || []);
        allHostellers = hostellers;

        if (!Array.isArray(rooms)) {
            throw new Error("Room API did not return a list.");
        }

        const unassigned = hostellers.filter(student =>
            !student.roomNumber ||
            student.roomNumber === "Not Assigned"
        );

        const assigned = hostellers.filter(student =>
            student.roomNumber &&
            student.roomNumber !== "Not Assigned"
        );

        let hostellerHtml = '<option value="">Choose a hosteller...</option>';

        if (unassigned.length > 0) {
            hostellerHtml += '<optgroup label="Unassigned Hostellers">';
            hostellerHtml += unassigned.map(student => `
                <option value="${escapeHTML(student.id)}" data-assigned="false">
                    ${escapeHTML(student.fullName)} (ID: ${escapeHTML(student.id)})
                </option>
            `).join("");
            hostellerHtml += '</optgroup>';
        }

        if (assigned.length > 0) {
            hostellerHtml += '<optgroup label="Assigned Hostellers (Change Room)">';
            hostellerHtml += assigned.map(student => `
                <option value="${escapeHTML(student.id)}" data-assigned="true" data-room="${escapeHTML(student.roomNumber)}">
                    ${escapeHTML(student.fullName)} (Current: Room ${escapeHTML(student.roomNumber)})
                </option>
            `).join("");
            hostellerHtml += '</optgroup>';
        }

        if (hostellers.length === 0) {
            hostellerHtml = '<option value="">No registered hostellers found</option>';
        }

        hostellerSelect.innerHTML = hostellerHtml;

        const availableRooms = rooms.filter(room =>
            Number(room.capacity) > Number(room.occupied)
        );

        roomSelect.innerHTML =
            '<option value="">Choose an available room...</option>' +
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
                        — ${beds} bed(s) available (₹${Number(room.rentPerPerson || 0).toLocaleString("en-IN")})
                    </option>
                `;
            }).join("");

        if (availableRooms.length === 0) {
            roomSelect.innerHTML =
                '<option value="">No available rooms</option>';
        }

        // Setup hosteller change listener to update badge and action button
        hostellerSelect.onchange = function() {
            const selectedOpt = hostellerSelect.options[hostellerSelect.selectedIndex];
            if (!selectedOpt || !selectedOpt.value) {
                if (statusBadge) statusBadge.innerHTML = "";
                if (assignBtn) {
                    assignBtn.textContent = "Assign Room";
                    assignBtn.className = "btn btn-blue w-100 fw-bold";
                }
                return;
            }

            const isAssigned = selectedOpt.dataset.assigned === "true";
            const currentRoom = selectedOpt.dataset.room;

            if (isAssigned) {
                if (statusBadge) {
                    statusBadge.innerHTML = `<span class="badge text-bg-warning text-dark"><i class="bi bi-arrow-left-right me-1"></i>Currently in Room ${escapeHTML(currentRoom)} — Selecting a room will reassign/change room</span>`;
                }
                if (assignBtn) {
                    assignBtn.innerHTML = '<i class="bi bi-arrow-left-right me-1"></i> Change Room';
                    assignBtn.className = "btn btn-warning w-100 fw-bold";
                }
            } else {
                if (statusBadge) {
                    statusBadge.innerHTML = '<span class="badge text-bg-info text-dark"><i class="bi bi-person-check me-1"></i>Currently Unassigned — Initial Allocation</span>';
                }
                if (assignBtn) {
                    assignBtn.innerHTML = '<i class="bi bi-door-open me-1"></i> Assign Room';
                    assignBtn.className = "btn btn-blue w-100 fw-bold";
                }
            }
        };

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

// Open modal for changing room
async function openChangeRoomModal(hostellerId) {
    if (!loggedInOwner) return;

    const student = allHostellers.find(s => Number(s.id) === Number(hostellerId));
    if (!student) {
        alert("Hosteller details not found. Please refresh.");
        return;
    }

    const nameInput = document.getElementById("modalHostellerName");
    const idInput = document.getElementById("modalHostellerId");
    const currentRoomInput = document.getElementById("modalCurrentRoom");
    const roomSelect = document.getElementById("modalNewRoomSelect");
    const msg = document.getElementById("modalChangeRoomMessage");

    if (nameInput) nameInput.value = `${student.fullName} (ID: ${student.id})`;
    if (idInput) idInput.value = student.id;
    if (currentRoomInput) currentRoomInput.value = student.roomNumber || "Not Assigned";
    if (msg) msg.textContent = "";

    if (roomSelect) {
        roomSelect.innerHTML = '<option value="">Loading available rooms...</option>';
    }

    const modalEl = document.getElementById("changeRoomModal");
    if (!modalEl) {
        console.error("changeRoomModal element not found.");
        return;
    }

    const modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
    modalInstance.show();

    try {
        const response = await fetch(`${ROOM_API_URL}/available`, roomRequestOptions());
        const rooms = await readResponse(response);

        if (!response.ok || !Array.isArray(rooms)) {
            throw new Error("Could not load available rooms.");
        }

        const availableRooms = rooms.filter(room =>
            Number(room.capacity) > Number(room.occupied) &&
            String(room.roomNumber) !== String(student.roomNumber)
        );

        if (availableRooms.length === 0) {
            roomSelect.innerHTML = '<option value="">No other rooms with available beds</option>';
            return;
        }

        roomSelect.innerHTML =
            '<option value="">Choose new room...</option>' +
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
                        Room ${escapeHTML(room.roomNumber)} (${beds} bed(s) available — ₹${Number(room.rentPerPerson || 0).toLocaleString("en-IN")})
                    </option>
                `;
            }).join("");

    } catch (err) {
        console.error("Error loading rooms for modal:", err);
        if (roomSelect) roomSelect.innerHTML = '<option value="">Failed to load rooms</option>';
        if (msg) {
            msg.className = "small mt-2 text-danger";
            msg.textContent = err.message || "Failed to load rooms.";
        }
    }
}

function setupChangeRoomModal() {
    const confirmBtn = document.getElementById("modalConfirmChangeBtn");
    if (!confirmBtn || confirmBtn.dataset.bound) return;
    confirmBtn.dataset.bound = "true";

    confirmBtn.addEventListener("click", async function() {
        const hostellerId = parseInt(document.getElementById("modalHostellerId").value, 10);
        const newRoomId = parseInt(document.getElementById("modalNewRoomSelect").value, 10);
        const msg = document.getElementById("modalChangeRoomMessage");

        if (!newRoomId || isNaN(newRoomId)) {
            if (msg) {
                msg.className = "small mt-2 text-danger";
                msg.textContent = "Please select a new room.";
            }
            return;
        }

        confirmBtn.disabled = true;
        confirmBtn.textContent = "Changing Room...";
        if (msg) msg.textContent = "";

        try {
            const res = await fetch(`${ROOM_API_URL}/reassign/${hostellerId}/${newRoomId}`, {
                ...roomRequestOptions(),
                method: "PUT"
            });
            const data = await readResponse(res);

            if (!res.ok) {
                throw new Error(data.message || data.error || `Failed to change room (HTTP ${res.status})`);
            }

            if (msg) {
                msg.className = "small mt-2 text-success";
                msg.textContent = `Room successfully changed to Room ${data.roomNumber || ''}!`;
            }

            await Promise.all([
                loadHostellers(),
                loadRooms(),
                loadRoomAssignmentDropdowns()
            ]);

            setTimeout(() => {
                const modalEl = document.getElementById("changeRoomModal");
                if (modalEl) {
                    const inst = bootstrap.Modal.getInstance(modalEl);
                    if (inst) inst.hide();
                }
            }, 1000);

        } catch (err) {
            if (msg) {
                msg.className = "small mt-2 text-danger";
                msg.textContent = err.message || "Could not change room.";
            }
        } finally {
            confirmBtn.disabled = false;
            confirmBtn.innerHTML = '<i class="bi bi-check2-circle me-1"></i> Confirm Room Change';
        }
    });
}

// Backward compatibility alias for any existing callers
function changeHostellerRoom(hostellerId) {
    openChangeRoomModal(hostellerId);
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

    loadOwnerPayments();
    loadOwnerComplaints();

    setupAddRoomForm();
    setupAssignRoomButton();
    setupChangeRoomModal();

    document.getElementById("hostellerSearch")
        ?.addEventListener("input", filterHostellers);

    document.getElementById("roomStatusFilter")
        ?.addEventListener("change", filterHostellers);

}

async function deleteRoom(roomId) {
    if (!loggedInOwner) return;

    const targetRoom = allRooms.find(r => Number(r.id) === Number(roomId));
    const occupied = targetRoom ? Number(targetRoom.occupied || 0) : 0;
    const confirmMsg = occupied > 0
        ? `Room ${targetRoom ? targetRoom.roomNumber : roomId} currently has ${occupied} occupant(s). Deleting it will automatically unassign all hostellers in this room. Are you sure you want to delete this room?`
        : "Are you sure you want to delete this room? This action cannot be undone.";

    if (!confirm(confirmMsg)) {
        return;
    }

    try {
        const response = await fetch(`${ROOM_API_URL}/${roomId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${loggedInOwner.token}`
            }
        });

        if (!response.ok) {
            const data = await readResponse(response);
            throw new Error(data.message || data.error || `Failed to delete room (HTTP ${response.status})`);
        }

        alert("Room deleted successfully!");
        await Promise.all([
            loadRooms(),
            loadHostellers(),
            loadRoomAssignmentDropdowns()
        ]);
    } catch (err) {
        alert(err.message || "Could not delete room.");
    }
}

async function unassignHosteller(studentId) {
    if (!loggedInOwner) return;

    const student = allHostellers.find(s => Number(s.id) === Number(studentId));
    const name = student ? student.fullName : `Hosteller #${studentId}`;

    if (!confirm(`Are you sure you want to remove ${name} from their current room?`)) {
        return;
    }

    try {
        const response = await fetch(`${ROOM_API_URL}/unassign/${studentId}`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${loggedInOwner.token}`,
                Accept: "application/json"
            }
        });

        const data = await readResponse(response);

        if (!response.ok) {
            throw new Error(data.message || data.error || `Failed to unassign hosteller (HTTP ${response.status})`);
        }

        alert("Hosteller unassigned from room successfully!");
        await Promise.all([
            loadHostellers(),
            loadRooms(),
            loadRoomAssignmentDropdowns()
        ]);
    } catch (err) {
        alert(err.message || "Could not unassign hosteller.");
    }
}

async function deleteHosteller(studentId) {
    if (!loggedInOwner) return;

    const student = allHostellers.find(s => Number(s.id) === Number(studentId));
    const name = student ? student.fullName : `Hosteller #${studentId}`;

    if (!confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
        return;
    }

    try {
        const response = await fetch(`${HOSTELLER_API_URL}/${studentId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${loggedInOwner.token}`
            }
        });

        if (!response.ok) {
            const data = await readResponse(response);
            throw new Error(data.message || data.error || `Failed to delete hosteller (HTTP ${response.status})`);
        }

        alert("Hosteller deleted successfully!");
        await Promise.all([
            loadHostellers(),
            loadRooms(),
            loadRoomAssignmentDropdowns()
        ]);
    } catch (err) {
        alert(err.message || "Could not delete hosteller.");
    }
}

function setupAddRoomForm() {
    const form = document.getElementById("addRoomForm");
    const msg = document.getElementById("roomFormMessage");
    const btn = document.getElementById("addRoomButton");

    if (!form || form.dataset.bound) return;
    form.dataset.bound = "true";

    form.addEventListener("submit", async function(event) {
        event.preventDefault();

        const roomNumber = document.getElementById("roomNumber").value.trim();
        const capacity = parseInt(document.getElementById("capacity").value, 10);
        const rentPerPerson = parseFloat(document.getElementById("rentPerPerson").value);

        if (!roomNumber || isNaN(capacity) || isNaN(rentPerPerson)) {
            msg.className = "small mt-3 text-danger";
            msg.textContent = "Please fill in all room details.";
            return;
        }

        btn.disabled = true;
        btn.textContent = "Adding room...";
        msg.textContent = "";

        try {
            const response = await fetch(ROOM_API_URL, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${loggedInOwner.token}`,
                    "Content-Type": "application/json",
                    Accept: "application/json"
                },
                body: JSON.stringify({
                    roomNumber,
                    capacity,
                    rentPerPerson
                })
            });

            const data = await readResponse(response);

            if (!response.ok) {
                throw new Error(data.message || data.error || `Could not create room (HTTP ${response.status})`);
            }

            form.reset();
            msg.className = "small mt-3 text-success";
            msg.textContent = `Room ${roomNumber} created successfully!`;

            await Promise.all([
                loadRooms(),
                loadRoomAssignmentDropdowns()
            ]);

            setTimeout(() => { if (msg) msg.textContent = ""; }, 4000);

        } catch (error) {
            console.error("Add room error:", error);
            msg.className = "small mt-3 text-danger";
            msg.textContent = error.message || "Failed to add room.";
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="bi bi-plus-circle me-1"></i> Add Room';
        }
    });
}

function setupAssignRoomButton() {
    const btn = document.getElementById("assignRoomButton");
    const hostellerSelect = document.getElementById("assignHosteller");
    const roomSelect = document.getElementById("assignRoom");
    const msg = document.getElementById("assignRoomMessage");

    if (!btn || btn.dataset.bound) return;
    btn.dataset.bound = "true";

    btn.addEventListener("click", async function() {
        const hostellerId = hostellerSelect ? parseInt(hostellerSelect.value, 10) : null;
        const roomId = roomSelect ? parseInt(roomSelect.value, 10) : null;

        if (!hostellerId || isNaN(hostellerId)) {
            msg.className = "small mt-3 text-danger";
            msg.textContent = "Please select a hosteller.";
            return;
        }

        if (!roomId || isNaN(roomId)) {
            msg.className = "small mt-3 text-danger";
            msg.textContent = "Please select an available room.";
            return;
        }

        const student = allHostellers.find(s => Number(s.id) === hostellerId);
        const hasRoom = student && student.roomNumber && student.roomNumber !== "Not Assigned";

        btn.disabled = true;
        btn.textContent = hasRoom ? "Changing room..." : "Assigning room...";
        msg.textContent = "";

        try {
            const url = hasRoom
                ? `${ROOM_API_URL}/reassign/${hostellerId}/${roomId}`
                : `${ROOM_API_URL}/assign`;

            const options = hasRoom
                ? {
                    ...roomRequestOptions(),
                    method: "PUT"
                  }
                : {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${loggedInOwner.token}`,
                        "Content-Type": "application/json",
                        Accept: "application/json"
                    },
                    body: JSON.stringify({
                        hostellerId,
                        roomId
                    })
                  };

            const response = await fetch(url, options);
            const data = await readResponse(response);

            if (!response.ok) {
                throw new Error(data.message || data.error || `Operation failed (HTTP ${response.status})`);
            }

            msg.className = "small mt-3 text-success";
            msg.textContent = hasRoom
                ? `Hosteller successfully moved to Room ${data.roomNumber || ''}!`
                : `Hosteller successfully assigned to Room ${data.roomNumber || ''}!`;

            await Promise.all([
                loadHostellers(),
                loadRooms(),
                loadRoomAssignmentDropdowns()
            ]);

            setTimeout(() => { if (msg) msg.textContent = ""; }, 4000);

        } catch (error) {
            console.error("Assign/change room error:", error);
            msg.className = "small mt-3 text-danger";
            msg.textContent = error.message || "Failed to process room assignment.";
        } finally {
            btn.disabled = false;
            const selectedOpt = hostellerSelect.options[hostellerSelect.selectedIndex];
            const isAssigned = selectedOpt && selectedOpt.dataset.assigned === "true";
            btn.textContent = isAssigned ? "Change Room" : "Assign Room";
        }
    });
}

var OWNER_PAYMENTS_API = (window.HOSTEL_CONFIG && window.HOSTEL_CONFIG.PAYMENTS_API) || "http://localhost:8080/api/payments";
var OWNER_COMPLAINTS_API = (window.HOSTEL_CONFIG && window.HOSTEL_CONFIG.COMPLAINTS_API) || "http://localhost:8080/api/complaints";

async function loadOwnerPayments() {
    const el = document.getElementById("ownerPaymentsList");
    if (!el || !loggedInOwner) return;

    try {
        const res = await fetch(OWNER_PAYMENTS_API, roomRequestOptions());
        if (!res.ok) throw new Error("HTTP " + res.status);
        const data = await readResponse(res);
        const list = Array.isArray(data) ? data : (data.content || []);

        if (list.length === 0) {
            el.innerHTML = '<div class="text-secondary">No payment transactions recorded yet.</div>';
            return;
        }

        el.innerHTML = list.map(p => `
            <div class="d-flex justify-content-between align-items-center p-2 mb-2 border rounded bg-white">
                <div>
                    <strong>${escapeHTML(p.hostellerName || 'Hosteller #' + p.hostellerId)}</strong>
                    <div class="text-secondary small">${p.paymentMethod || 'Online'} · ${p.month}/${p.year}</div>
                </div>
                <div class="text-end">
                    <span class="fw-bold text-success">₹${Number(p.amount || 0).toLocaleString('en-IN')}</span>
                    <div><span class="badge text-bg-success">PAID</span></div>
                </div>
            </div>
        `).join("");
    } catch (e) {
        console.warn("Could not load owner payments:", e);
        el.innerHTML = '<div class="text-secondary">No recent payment transactions.</div>';
    }
}

async function loadOwnerComplaints() {
    const el = document.getElementById("ownerComplaintsList");
    if (!el || !loggedInOwner) return;

    try {
        const res = await fetch(OWNER_COMPLAINTS_API, roomRequestOptions());
        if (!res.ok) throw new Error("HTTP " + res.status);
        const data = await readResponse(res);
        const list = Array.isArray(data) ? data : (data.content || []);

        if (list.length === 0) {
            el.innerHTML = '<div class="text-secondary">No open complaints from students.</div>';
            return;
        }

        el.innerHTML = list.map(c => `
            <div class="p-2 mb-2 border rounded bg-white">
                <div class="d-flex justify-content-between align-items-center">
                    <strong>${escapeHTML(c.title)}</strong>
                    <span class="badge ${c.status === 'RESOLVED' ? 'text-bg-success' : 'text-bg-warning'}">${escapeHTML(c.status)}</span>
                </div>
                <div class="text-secondary small mt-1">${escapeHTML(c.description)}</div>
                <div class="text-muted small mt-1">Reported by: ${escapeHTML(c.studentName || 'Hosteller')}</div>
            </div>
        `).join("");
    } catch (e) {
        console.warn("Could not load owner complaints:", e);
        el.innerHTML = '<div class="text-secondary">All complaints resolved.</div>';
    }
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

if (typeof MESSAGES_API_URL === "undefined") {
    var MESSAGES_API_URL = "http://localhost:8080/api/messages";
}

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