
    (function() {
        // ========================
        // VIBOX.IN OTP LOGIN PAGE
        // Pure OTP Authentication - No Demo Mode
        // Backend endpoints: https://api.vibox.in/send-otp and https://api.vibox.in/verify-otp
        // ========================
        
        // DOM Elements
        const loginForm = document.getElementById("loginForm");
        const emailInput = document.getElementById("email");
        const otpInput = document.getElementById("otp");
        const sendOtpBtn = document.getElementById("sendOtpBtn");
        const loginSubmitBtn = document.getElementById("loginBtn");
        const otpTimerDiv = document.getElementById("otpTimerMessage");
        const timerTextSpan = document.getElementById("timerText");
        const rememberCheckbox = document.getElementById("rememberCheckbox");
        const emailErrorDiv = document.getElementById("emailError");
        const otpErrorDiv = document.getElementById("otpError");
        
        // API Base URL - Update this to your actual vibox.in backend
        // For local development, you can change this to http://localhost:5000
        // For production, use https://api.vibox.in
        const API_BASE_URL = "http://localhost:5000";
        // Fallback to localhost for development (change as needed)
        // const API_BASE_URL = "http://localhost:5000";
        
        // State variables
        let otpCooldown = false;
        let countdownInterval = null;
        let lastSentEmail = "";
        
        // Helper: Hide error messages
        function hideErrors() {
            if (emailErrorDiv) emailErrorDiv.style.display = "none";
            if (otpErrorDiv) otpErrorDiv.style.display = "none";
        }
        
        // Helper: Show error for specific field
        function showError(field, message) {
            if (field === 'email' && emailErrorDiv) {
                emailErrorDiv.style.display = "flex";
                emailErrorDiv.querySelector('span').innerText = message;
            } else if (field === 'otp' && otpErrorDiv) {
                otpErrorDiv.style.display = "flex";
                otpErrorDiv.querySelector('span').innerText = message;
            }
        }
        
        // Start OTP cooldown timer (60 seconds)
        function startCooldown() {
            if (countdownInterval) clearInterval(countdownInterval);
            let secondsLeft = 60;
            otpCooldown = true;
            sendOtpBtn.disabled = true;
            otpTimerDiv.style.display = "flex";
            timerTextSpan.innerText = `Resend OTP in ${secondsLeft}s`;
            
            countdownInterval = setInterval(() => {
                secondsLeft--;
                if (secondsLeft <= 0) {
                    clearInterval(countdownInterval);
                    countdownInterval = null;
                    otpCooldown = false;
                    sendOtpBtn.disabled = false;
                    otpTimerDiv.style.display = "none";
                    sendOtpBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send OTP';
                } else {
                    timerTextSpan.innerText = `Resend OTP in ${secondsLeft}s`;
                }
            }, 1000);
        }
        
        // Send OTP to vibox.in backend
        async function sendOtpToBackend(email) {
            const response = await fetch(`${API_BASE_URL}/send-otp`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({ email: email })
            });
            
            if (!response.ok) {
                let errorMsg = `Server error: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.message || errorMsg;
                } catch(e) {
                    // ignore parsing error
                }
                throw new Error(errorMsg);
            }
            
            const data = await response.json();
            return { success: true, message: data.message || "OTP sent successfully to your email!" };
        }
        
        // Send OTP button click handler
        sendOtpBtn.addEventListener("click", async function(e) {
            e.preventDefault();
            hideErrors();
            
            const email = emailInput.value.trim();
            if (!email) {
                showError('email', "Please enter your email address.");
                emailInput.focus();
                return;
            }
            if (!email.includes("@") || !email.includes(".")) {
                showError('email', "Please enter a valid email address (e.g., name@vibox.in).");
                emailInput.focus();
                return;
            }
            if (otpCooldown) {
                showError('otp', "Please wait before requesting another OTP.");
                return;
            }
            
            // Show sending state
            const originalHtml = sendOtpBtn.innerHTML;
            sendOtpBtn.innerHTML = '<i class="fas fa-spinner fa-pulse"></i> Sending...';
            sendOtpBtn.disabled = true;
            
            try {
                const result = await sendOtpToBackend(email);
                alert(result.message);
                startCooldown();
                lastSentEmail = email;
                otpInput.focus();
                // Clear any previous OTP error
                if (otpErrorDiv) otpErrorDiv.style.display = "none";
            } catch (err) {
                console.error("Send OTP error:", err);
                showError('otp', err.message || "Failed to send OTP. Please try again.");
                sendOtpBtn.innerHTML = originalHtml;
                sendOtpBtn.disabled = false;
                return;
            }
            
            sendOtpBtn.innerHTML = originalHtml;
            if (!otpCooldown) {
                sendOtpBtn.disabled = false;
            }
        });
        
        // Verify OTP with vibox.in backend
        async function verifyOtpWithBackend(email, otpCode) {
            const response = await fetch(`${API_BASE_URL}/verify-otp`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({ email: email, userOtp: otpCode })
            });
            
            if (!response.ok) {
                let errorMsg = `Verification failed: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.message || errorMsg;
                } catch(e) {
                    // ignore
                }
                throw new Error(errorMsg);
            }
            
            const data = await response.json();
            if (!data.success) {
                throw new Error(data.message || "Invalid OTP");
            }
            
            return { success: true, message: data.message || "OTP verified successfully" };
        }
        
        // MAIN LOGIN SUBMIT HANDLER
        loginForm.addEventListener("submit", async function(event) {
            event.preventDefault();
            hideErrors();
            
            const email = emailInput.value.trim();
            if (!email) {
                showError('email', "Please enter your email address.");
                emailInput.focus();
                return;
            }
            if (!email.includes("@") || !email.includes(".")) {
                showError('email', "Please provide a valid email address.");
                emailInput.focus();
                return;
            }
            
            const otpCode = otpInput.value.trim();
            if (!otpCode) {
                showError('otp', "Please enter the 6-digit OTP sent to your email.");
                otpInput.focus();
                return;
            }
            if (!/^\d{6}$/.test(otpCode)) {
                showError('otp', "OTP must be exactly 6 digits (numbers only).");
                otpInput.focus();
                return;
            }
            
            // Disable login button during verification
            const originalBtnText = loginSubmitBtn.innerHTML;
            loginSubmitBtn.innerHTML = '<i class="fas fa-spinner fa-pulse"></i> Verifying OTP...';
            loginSubmitBtn.disabled = true;
            
            try {
                const verificationResult = await verifyOtpWithBackend(email, otpCode);
                
                if (verificationResult.success) {
                    // Save authentication data to localStorage
                    const username = email.split("@")[0];
                    const remember = rememberCheckbox ? rememberCheckbox.checked : false;
                    const authData = {
                        isLoggedIn: true,
                        username: username,
                        email: email,
                        loginMethod: "otp",
                        timestamp: Date.now(),
                        rememberMe: remember,
                        platform: "vibox"
                    };
                    localStorage.setItem("vibox_auth", JSON.stringify(authData));
                    
                    // If remember me is checked, store email for next time
                    if (remember) {
                        localStorage.setItem("vibox_remember_email", email);
                    } else {
                        localStorage.removeItem("vibox_remember_email");
                    }
                    
                    alert("✅ Login Successful! 🎉 Welcome to VIBOX.");
                    // Redirect to dashboard/home page
                    window.location.href = "index.html";
                }
            } catch (err) {
                console.error("Login error:", err);
                showError('otp', err.message || "OTP verification failed. Please try again.");
                otpInput.value = "";
                otpInput.focus();
                loginSubmitBtn.innerHTML = originalBtnText;
                loginSubmitBtn.disabled = false;
            }
        });
        
        // Guest button handler
        const guestLink = document.getElementById("guestLink");
        if (guestLink) {
            guestLink.addEventListener("click", function(e) {
                e.preventDefault();
                // Set guest session
                localStorage.setItem("vibox_auth", JSON.stringify({
                    isLoggedIn: false,
                    guestMode: true,
                    timestamp: Date.now(),
                    platform: "vibox"
                }));
                window.location.href = "https://vibox.in/";
            });
        }
        
        // Social login buttons
        const googleBtn = document.getElementById("mockGoogleBtn");
        const fbBtn = document.getElementById("mockFbBtn");
        if (googleBtn) {
            googleBtn.addEventListener("click", () => {
                alert("🔐 Google Sign-In will be available soon. Please use OTP login for now.");
            });
        }
        if (fbBtn) {
            fbBtn.addEventListener("click", () => {
                alert("🔐 Facebook Login will be available soon. Please use OTP login for now.");
            });
        }
        
        // Load remembered email if exists
        const rememberedEmail = localStorage.getItem("vibox_remember_email");
        if (rememberedEmail && emailInput) {
            emailInput.value = rememberedEmail;
        }
        
        // Clear timer on page unload
        window.addEventListener("beforeunload", function() {
            if (countdownInterval) clearInterval(countdownInterval);
        });
        
        // Add input validation on email field to clear error when typing
        emailInput.addEventListener("input", function() {
            if (emailErrorDiv) emailErrorDiv.style.display = "none";
        });
        
        otpInput.addEventListener("input", function() {
            if (otpErrorDiv) otpErrorDiv.style.display = "none";
        });
        
        console.log("✅ VIBOX OTP Login Ready — Connected to backend at", API_BASE_URL);
    })();
