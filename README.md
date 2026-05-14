# SecureBank — Information Security Demonstration Platform

![SecureBank Banner](https://img.shields.io/badge/Security-Education%20Platform-0d9373?style=for-the-badge)
![Frontend](https://img.shields.io/badge/Frontend-HTML%20%7C%20CSS%20%7C%20JavaScript-blue?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Completed-success?style=for-the-badge)
![License](https://img.shields.io/badge/License-Educational-lightgrey?style=for-the-badge)

## Overview

**SecureBank** is a modern interactive web-based cybersecurity demonstration platform developed as an **Information Security Semester Project**. The project simulates real-world cyberattacks and demonstrates how secure development practices mitigate those vulnerabilities.

Unlike theoretical security presentations, SecureBank provides:

* Live attack simulations
* Secure vs vulnerable implementation comparison
* Interactive dashboards
* Real-time attack monitoring
* Security-focused UI/UX
* Demonstrations of authentication, encryption, access control, and web vulnerabilities

The platform was designed to help students, developers, and security learners understand how common vulnerabilities work internally and how modern defense mechanisms prevent exploitation.

---

# Project Preview

SecureBank includes multiple integrated cybersecurity labs and demonstrations:

* Authentication & Access Control
* Cross-Site Scripting (XSS)
* SQL Injection (SQLi)
* Cross-Site Request Forgery (CSRF)
* Cryptography Demonstrations
* Firewall Rule Simulation
* Security Monitoring Dashboard
* Role-Based Access Control (RBAC)
* JWT Authentication Simulation
* AES Encryption Demonstration
* SHA-512 Hashing
* Digital Signature & PKI Concepts

---

# Features

## Authentication & Access Control

Demonstrates:

* Plain-text password vulnerability
* SHA-512 password hashing
* Salted hashes
* JWT token structure
* Token forgery attacks
* Role-Based Access Control (RBAC)
* Secure login flow simulation

### Security Concepts Covered

* Authentication
* Authorization
* Secure password storage
* Session security
* JWT verification
* Privilege escalation prevention

---

## XSS (Cross-Site Scripting) Lab

Includes:

* Stored XSS
* Reflected XSS
* Malicious payload execution
* Cookie theft simulation
* DOM sanitization
* CSP (Content Security Policy)

### Secure Defense Demonstrations

* `textContent`
* DOM sanitization
* CSP header simulation
* Safe rendering

---

## SQL Injection Lab

Demonstrates:

* Authentication bypass
* UNION-based SQL injection
* Blind SQL injection
* Database destruction simulation
* Raw query vulnerabilities

### Secure Defense Demonstrations

* Parameterized queries
* Input handling
* Query sanitization
* Injection prevention techniques

---

## CSRF Protection System

Demonstrates:

* Forged fund transfer requests
* Cross-origin attack simulation
* CSRF token verification
* Synchronizer token pattern

### Secure Defense Demonstrations

* CSRF token validation
* Origin verification
* Session validation

---

## Cryptography Module

Includes simulations and demonstrations for:

* AES encryption
* SHA-512 hashing
* RSA concepts
* Digital signatures
* PKI concepts
* TLS certificate chain visualization

---

## Firewall Simulation

Features:

* Custom firewall rules
* Traffic filtering
* Packet inspection simulation
* Allow/Deny actions
* Port filtering
* IP rule matching

---

## Security Dashboard

Interactive monitoring dashboard displaying:

* Attack attempts
* Blocked attacks
* Security mode status
* Real-time logs
* Security statistics
* Activity visualization

---

# Technologies Used

| Technology              | Purpose                   |
| ----------------------- | ------------------------- |
| HTML5                   | Application structure     |
| CSS3                    | Styling and responsive UI |
| JavaScript (Vanilla JS) | Application logic         |
| Lucide Icons            | Modern icon system        |
| Google Fonts            | Typography                |

---

# Project Structure

```bash
SecureBank/
│
├── SecureBank.html              # Main application UI
├── SecureBankstyle.css          # Styling and responsive design
├── SecureBankFunctions.js       # Application logic and security simulations
└── README.md                    # Documentation
```

---

# How to Run

## Option 1 — Run Locally

1. Clone the repository:

```bash
git clone https://github.com/your-username/securebank.git
```

2. Open the project folder:

```bash
cd securebank
```

3. Run the project:

Simply open:

```bash
SecureBank.html
```

inside your browser.

---

## Option 2 — VS Code Live Server

Recommended for development.

1. Install:

* Visual Studio Code
* Live Server extension

2. Right click:

```bash
SecureBank.html
```

3. Click:

```bash
Open with Live Server
```

---

# UI/UX Design Philosophy

SecureBank was intentionally designed with a professional fintech-inspired interface rather than a basic academic layout.

Key UI decisions:

* Banking-inspired dark/light security theme
* Security state indicators
* Real-time visual feedback
* Modular learning sections
* Responsive layouts
* Interactive attack simulations
* Animated transitions
* Dashboard-focused information architecture

The goal was to combine:

* Cybersecurity education
* Real-world realism
* Professional frontend engineering
* User engagement

---

# Educational Objectives

This project was created to help learners:

* Understand modern web vulnerabilities
* Visualize attack execution flow
* Learn secure coding practices
* Compare insecure vs secure implementations
* Explore real-world cybersecurity concepts interactively
* Improve frontend security awareness

---

# Example Security Concepts Demonstrated

## Vulnerable Authentication

```javascript
SELECT * FROM users WHERE username='" + u + "' AND password='" + p + "'
```

## Secure Authentication

```javascript
db.query("SELECT * FROM users WHERE username=?", [u])
```

---

## Vulnerable XSS Rendering

```javascript
commentDiv.innerHTML = userInput
```

## Secure XSS Prevention

```javascript
commentDiv.textContent = userInput
```

---

# Learning Outcomes

After exploring SecureBank, users should understand:

* Why input validation matters
* How injection attacks work
* Why hashing and salting are critical
* How JWT authentication functions
* How CSRF attacks exploit trust
* Why CSP policies matter
* The importance of defense-in-depth
* The role of secure frontend architecture

---

# Screens Included in the Project

* Home Dashboard
* Authentication Lab
* XSS Lab
* SQL Injection Lab
* CSRF Lab
* Cryptography Section
* Firewall Section
* Monitoring Dashboard

---

# Security Disclaimer

This project is strictly for:

* Educational purposes
* Academic demonstrations
* Cybersecurity learning
* Secure coding awareness

The attack simulations are intentionally built in a controlled frontend environment to demonstrate vulnerabilities safely.

Do NOT use these techniques against real systems.

---

# Future Improvements

Potential upgrades:

* Backend integration (Node.js / Express)
* Real database connectivity
* Full JWT authentication system
* Real cryptographic implementations
* Docker deployment
* Multi-user simulation
* API security demonstrations
* OWASP Top 10 coverage
* Logging & SIEM integration
* Penetration testing sandbox

---

# Developer Notes

This project focuses heavily on:

* Clean UI architecture
* Security-focused frontend engineering
* Interactive cybersecurity education
* Realistic attack simulation
* Maintainable modular code

The entire application was built using pure frontend technologies without frameworks to maximize learning transparency.

---

# Author

## Rana Hamad Iftikhar

* Information Security Student
* Frontend Developer
* Cybersecurity Enthusiast
* AR Learner
* Hockey Player

---

# Academic Context

Developed as part of an:

**Information Security Semester Project**

The project demonstrates practical implementations of major web security concepts using interactive simulations.

---

# License

This project is intended for:

* Educational use
* Learning purposes
* Academic demonstrations

You may modify and extend it for educational projects.

---

# Final Note

Most student security projects only explain attacks.

SecureBank demonstrates:

* How attacks happen
* Why they succeed
* How secure syst
