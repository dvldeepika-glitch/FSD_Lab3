const express = require("express");
const session = require("express-session");

const app = express();
const PORT = 3000;

// Set EJS as the view engine
app.set("view engine", "ejs");

// Middleware to read form data
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(
    session({
        secret: "mySecretKey123",
        resave: false,
        saveUninitialized: true,
        cookie: {
            maxAge: 600000,
            httpOnly: true
        }
    })
);

// ================================
// HOME PAGE
// ================================

app.get("/", (req, res) => {
    res.render("index");
});

// ================================
// PART (a) - SESSION MANAGEMENT
// ================================

// Set session data
app.get("/set-session", (req, res) => {

    req.session.username = "Admin";

    if (!req.session.visitCount) {
        req.session.visitCount = 1;
    } else {
        req.session.visitCount++;
    }

    res.redirect("/session-dashboard");
});

// Session Management Dashboard
app.get("/session-dashboard", (req, res) => {

    res.render("session-dashboard", {
        username: req.session.username || "Not Set",
        visitCount: req.session.visitCount || 0,
        sessionId: req.sessionID
    });
});

// Destroy session
app.get("/destroy-session", (req, res) => {

    req.session.destroy((err) => {

        if (err) {
            return res.send("Unable to destroy session.");
        }

        res.redirect("/");
    });
});

// ================================
// PART (b) - USER AUTHENTICATION
// ================================

// Authentication middleware
function isAuthenticated(req, res, next) {

    if (req.session.user) {
        return next();
    }

    res.redirect("/login");
}

// Login page
app.get("/login", (req, res) => {

    res.render("login", {
        error: null
    });
});

// Login authentication
app.post("/login", (req, res) => {

    const { username, password } = req.body;

    // Hardcoded credentials for demonstration
    if (username === "admin" && password === "1234") {

        req.session.user = username;
        req.session.authVisitCount = 0;

        res.redirect("/dashboard");

    } else {

        res.render("login", {
            error: "Invalid username or password."
        });

    }
});

// Protected Dashboard
app.get("/dashboard", isAuthenticated, (req, res) => {

    if (!req.session.authVisitCount) {
        req.session.authVisitCount = 1;
    } else {
        req.session.authVisitCount++;
    }

    res.render("dashboard", {
        username: req.session.user,
        visitCount: req.session.authVisitCount,
        sessionId: req.sessionID
    });
});

// Logout
app.get("/logout", (req, res) => {

    req.session.destroy((err) => {

        if (err) {
            return res.send("Unable to logout.");
        }

        res.redirect("/login");
    });
});

// ================================
// START SERVER
// ================================

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});