# Spec Document

## 1. Overview

Implement account creation for the `/register` route.

Currently `GET /register` renders `templates/register.html`, but the form POSTs to `/register` with no handler for it — submitting the form does nothing.

This step wires up the registration form to actually create a user in the database.

---

## 2. Depends on

[[01-database-setup]] — requires a working `users` table, `get_db()`, and `init_db()`.

---

## 3. Routes

- `GET /register` — existing, unchanged (renders empty form)
- `POST /register` — new
    - Reads `name`, `email`, `password` from the submitted form
    - On success → creates the user, redirects to `GET /login`
    - On failure → re-renders `register.html` with an `error` message (template already supports `{% if error %}`)

---

## 4. Database Schema

No schema changes. Uses the existing `users` table from [[01-database-setup]].

---

## 5. Functions to Implement (`database/db.py`)

---

### A. `get_user_by_email(email)`

- Queries `users` for a row matching `email`
- Returns the row (`sqlite3.Row`) or `None` if not found
- Used to check for duplicate emails before insert

---

### B. `create_user(name, email, password)`

- Hashes `password` with `werkzeug.security.generate_password_hash`
- Inserts a new row into `users` (`name`, `email`, `password_hash`)
- Returns the new user's `id`
- Does **not** catch the `UNIQUE` constraint error itself — caller checks via `get_user_by_email` first

---

## 6. Changes to `app.py`

- Import `get_user_by_email` and `create_user` from `database.db`
- Change `@app.route("/register")` to accept `methods=["GET", "POST"]`
- On `POST`:
    1. Read `name`, `email`, `password` from `request.form`
    2. Validate input (see Section 10)
    3. If invalid → re-render `register.html` with `error` set, HTTP 400
    4. If `get_user_by_email(email)` already exists → re-render with `error="An account with this email already exists."`
    5. Otherwise call `create_user(...)` and `redirect(url_for("login"))`
- Import `request` and `redirect` from `flask` (add to existing `flask` import line)

---

## 7. Files to Change

- `database/db.py` → add `get_user_by_email()` and `create_user()`
- `app.py` → update `register` route, add imports

---

## 8. Files to Create

- None

---

## 9. Dependencies

- No new pip packages
- Use:
    - `werkzeug.security.generate_password_hash` (already used in `seed_db()`)
    - `flask.request`, `flask.redirect`, `flask.url_for`

---

## 10. Validation Rules

- `name` — required, non-empty after `.strip()`
- `email` — required, non-empty after `.strip()`, must contain `@`
- `password` — required, minimum 8 characters (matches the placeholder text in `register.html`: "Min. 8 characters")
- Trim whitespace from `name` and `email` before validating/storing
- Store `email` lowercased for consistent lookups

---

## 11. Rules for Implementation

- Use **parameterized queries only** — no string formatting in SQL
- Never store plaintext passwords — always hash via `generate_password_hash`
- Check for an existing email with `get_user_by_email()` *before* inserting, so the app returns a friendly error instead of a raw `sqlite3.IntegrityError`
- Keep `register.html` unchanged — it already renders `{{ error }}` and posts the correct fields
- Do not implement session/login logic here — that belongs to the login step; after registering, the user is redirected to `/login` to sign in

---

## 12. Expected Behavior

- Submitting valid, unique details creates a row in `users` and redirects to `/login`
- Submitting an already-registered email re-renders the form with an error and does not create a duplicate row
- Submitting missing/invalid fields re-renders the form with an error and does not touch the database
- Password is never stored or displayed in plaintext

---

## 13. Error Handling Expectations

- Duplicate email → handled gracefully with `error` message, HTTP 200 (form re-rendered) — no unhandled `IntegrityError`
- Missing required field → `error` message, HTTP 400
- Password under 8 characters → `error` message, HTTP 400

---

## 14. Definition of Done

- [ ]  `POST /register` with valid unique data creates a user and redirects to `/login`
- [ ]  `POST /register` with a duplicate email shows an error and does not insert a second row
- [ ]  `POST /register` with missing/invalid fields shows an error and does not query-insert
- [ ]  Password is hashed before storage, never stored in plaintext
- [ ]  All queries use parameterized SQL
- [ ]  `GET /register` behavior is unchanged
