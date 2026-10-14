var API_BASE_URL = (window.HOSTEL_CONFIG && window.HOSTEL_CONFIG.AUTH_API) || "http://localhost:8080/api/auth";

// ==========================================
// 1. COMMON SIGN IN / SIGN UP TABS
// ==========================================

const signInTab = document.getElementById("signInTab");
const signUpTab = document.getElementById("signUpTab");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

function showSignIn() {
    loginForm.hidden = false;
    registerForm.hidden = true;

    signInTab.classList.add("active");
    signUpTab.classList.remove("active");

    const selectedRole =
        sessionStorage.getItem("selectedRole") || "hosteller";

    document.getElementById("formTitle").textContent =
        selectedRole === "owner"
            ? "Owner Sign In"
            : "Hosteller Sign In";

    document.getElementById("formSubtitle").textContent =
        selectedRole === "owner"
            ? "Sign in with your authorized Owner account."
            : "Sign in to access your hostel dashboard.";
}

function showSignUp() {
    loginForm.hidden = true;
    registerForm.hidden = false;

    signUpTab.classList.add("active");
    signInTab.classList.remove("active");

    const selectedRole =
        sessionStorage.getItem("selectedRole") || "hosteller";

    document.getElementById("formTitle").textContent =
        selectedRole === "owner"
            ? "Request an Owner Account"
            : "Create your Hosteller Account";

    document.getElementById("formSubtitle").textContent =
        selectedRole === "owner"
            ? "Owner access requires authorization."
            : "Enter your details to get started.";
}

if (signInTab && signUpTab) {
    signInTab.addEventListener("click", showSignIn);
    signUpTab.addEventListener("click", showSignUp);
}

// ==========================================
// 2. JWT HELPER FOR PROTECTED API REQUESTS
// ==========================================

async function fetchWithAuth(url, options = {}) {
    const savedUser = sessionStorage.getItem("hostelUser");

    if (!savedUser) {
        throw new Error("Please sign in to continue.");
    }

    let user;

    try {
        user = JSON.parse(savedUser);
    } catch (error) {
        sessionStorage.removeItem("hostelUser");
        throw new Error("Invalid login session. Please sign in again.");
    }

    if (!user.token) {
        throw new Error(
            "Authentication token is missing. Please sign in again."
        );
    }

    const headers = new Headers(options.headers || {});
    headers.set("Authorization", `Bearer ${user.token}`);

    return fetch(url, {
        ...options,
        headers
    });
}

// ==========================================
// 3. SIGN IN
// ==========================================

if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email =
            document.getElementById("loginEmail").value.trim();

        const password =
            document.getElementById("loginPassword").value;

        const message =
            document.getElementById("loginMessage");

        const loginButton =
            document.getElementById("loginButton");

        message.textContent = "";
        message.className = "message";

        loginButton.disabled = true;
        loginButton.textContent = "Signing in...";

        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });

            const responseText = await response.text();

            console.log("Login status:", response.status);
            console.log("Login response:", responseText);

            let data;

            try {
                data = responseText ? JSON.parse(responseText) : {};
            } catch (error) {
                throw new Error("The backend returned an invalid response.");
            }

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    data.error ||
                    "Login failed. Check your email and password."
                );
            }

            // Verify that the backend returned a token.
            if (!data.token) {
                throw new Error(
                    "Login response did not contain a JWT token."
                );
            }

            // Verify that the backend returned a role.
            const role = String(data.role || "").trim().toUpperCase();

            if (!role) {
                throw new Error(
                    "Login succeeded, but the user's role was not returned by the backend."
                );
            }

            // Store the authenticated user and role.
            const loggedInUser = {
                ...data,
                role: role
            };

            sessionStorage.setItem(
                "hostelUser",
                JSON.stringify(loggedInUser)
            );

            console.log("Logged-in user role:", role);

            // Redirect according to the actual backend role.
            if (role === "HOSTELER" || role === "STUDENT") {
                window.location.href = "student-dashboard.html";

            } else if (role === "WARDEN" || role === "ADMIN") {
                window.location.href = "owner-dashboard.html";

            } else {
                sessionStorage.removeItem("hostelUser");

                throw new Error(
                    `Unrecognized user role: ${role}. Please contact the administrator.`
                );
            }

        } catch (error) {
            console.error("Login error:", error);

            message.textContent =
                error instanceof TypeError
                    ? "Cannot connect to the backend. Check that Spring Boot is running."
                    : error.message;

            message.className = "message error";

        } finally {
            loginButton.disabled = false;
            loginButton.textContent = "Sign In";
        }
    });
}

// ==========================================
// 4. SIGN UP
// ==========================================

if (registerForm) {
    registerForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const fullName =
            document.getElementById("registerName").value.trim();

        const email =
            document.getElementById("registerEmail").value.trim();

        const password =
            document.getElementById("registerPassword").value;

        const message =
            document.getElementById("registerMessage");

        const registerButton =
            document.getElementById("registerButton");

        const selectedRole =
            sessionStorage.getItem("selectedRole") || "hosteller";

        if (selectedRole === "owner") {
            message.textContent =
                "Owner accounts require authorization. Please contact the hostel administrator.";

            message.className = "message error";
            return;
        }

        message.textContent = "";
        message.className = "message";

        registerButton.disabled = true;
        registerButton.textContent = "Creating account...";

        try {
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    fullName,
                    email,
                    password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    data.error ||
                    "Registration failed. Please try again."
                );
            }

            registerForm.reset();
            showSignIn();

            const loginMessage =
                document.getElementById("loginMessage");

            loginMessage.textContent =
                "Registration successful! Please sign in.";

            loginMessage.className = "message success";

        } catch (error) {
            console.error("Registration error:", error);

            message.textContent =
                error instanceof TypeError
                    ? "Cannot connect to the backend. Check that Spring Boot is running."
                    : error.message;

            message.className = "message error";

        } finally {
            registerButton.disabled = false;
            registerButton.textContent = "Create Account";
        }
    });
}

// ==========================================
// 5. DISPLAY SELECTED ACCOUNT TYPE
// ==========================================

const selectedRole = sessionStorage.getItem("selectedRole");
const formSubtitle = document.getElementById("formSubtitle");

if (selectedRole && formSubtitle) {
    if (selectedRole === "hosteller") {
        formSubtitle.textContent =
            "Sign in or create your Hosteller account.";

    } else if (selectedRole === "owner") {
        formSubtitle.textContent =
            "Sign in or request access to your Owner account.";
    }
}
