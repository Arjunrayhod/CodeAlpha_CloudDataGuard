# CloudDataGua
<img width="1912" height="978" alt="image" src="https://github.com/user-attachments/assets/6bc9bcf3-0e8d-4257-a80f-4e4b8ffd473f" />
rd

### Cloud-Based Data Validation & Redundancy Management System

CloudDataGuard is a web-based data validation system designed to detect duplicate records before they are stored in the database.

The system validates user input, checks existing records using a SHA-256 based data hash, records duplicate attempts, and temporarily blocks an email after repeated duplicate attempts.

This project is developed as part of the **CodeAlpha Cloud Computing Internship — Task 1: Data Redundancy Removal System**.

---

## 📌 Project Overview

In many applications, the same user or data can be submitted multiple times.

For example:

- Arjun → arjun@gmail.com
- Rahul → rahul@gmail.com
- Another Name → arjun@gmail.com

Even if the name is different, the same email may represent the same underlying record.

CloudDataGuard identifies such duplicate submissions before inserting them into the database.

The system stores only unique and verified records while maintaining a separate history of rejected duplicate attempts.

---

## 🚀 Features

### Data Validation

- Server-side input validation
- Name validation
- Email format validation
- Input normalization
- Invalid data is rejected before database insertion

### Duplicate Detection

- Email-based duplicate detection
- Case-insensitive email comparison
- Same email with different names is also detected
- SHA-256 hashing is used for duplicate identification
- Duplicate records are not inserted into the main records table

### Duplicate History

Every rejected duplicate attempt is recorded separately.

The history includes:

- Name
- Email
- Reason
- Date and time

A separate search option is available for duplicate history.

### Security Ban System

Repeated duplicate attempts are monitored.

After more than 5 duplicate attempts:

- The email is temporarily blocked
- A 24-hour ban is created
- Further submissions using the same email are rejected
- Ban history is stored separately

### Ban History

The application maintains a separate list of security bans.

It displays:

- Email
- Number of attempts
- Ban type
- Ban creation time
- Expiry time
- Current ban status

### Dashboard

The dashboard displays:

- Total Records
- Unique Records
- Duplicate Attempts
- Active Bans

### Search

Separate search functionality is available for:

- Records
- Duplicate History
- Ban History

### Navigation

The application includes:

- Dashboard
- Records
- Duplicate History
- Ban History
- Back to Dashboard
- Browser back/forward support

### Live Ban Countdown

Active bans display the remaining time.

Example:

```text
23h 59m remaining
23h 58m remaining
...
Expired
