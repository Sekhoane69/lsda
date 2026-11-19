# Lesotho Digital Skills Academy (LSDA)

Free digital-skills learning platform with automatic PDF certificates.
Stack: React (Vite) + Node/Express + MySQL. Languages: English and Sesotho.

## 1. What you need
- Node.js 18 or newer
- MySQL 8 (or MariaDB 10.5+) running on your computer
- VS Code

## 2. First-time setup (one terminal, from the `lsda` folder)

Make sure MySQL is running (for example start MySQL in XAMPP, or the MySQL service), then:

```bash
npm run install:all     # installs everything for the server and the website
npm run setup           # asks for your MySQL password, creates server/.env, the database and the courses
npm run dev             # starts the server AND the website together
```

Open http://localhost:5173. Press Ctrl+C once to stop.

Admin login: the one you typed during setup (default `admin@lsda.local` / `ChangeMe123`).

**You never need to put your password in the code.** `npm run setup` writes it into `server/.env`, which stays on your computer. If the server says it cannot use the database, the message tells you what to fix (MySQL not running, wrong password, or database not set up).

### For the pilot laptop and Demo Day (one command, phones on the same Wi-Fi)

```bash
npm run build           # once, after any change to the website
npm start               # the server now also serves the website
```

The terminal prints addresses such as `http://192.168.1.20:5000`. Phones connected to the same Wi-Fi as the laptop open that address. No internet is needed.

### Forgot password
Learners click "Forgot password?" on the login page and enter their email or phone number. A supervisor sees the request on the Supervise page, checks who the learner is in person, and sets a temporary password. (Nobody can reset a password just by knowing a phone number.) Supervisors can also reset a learner's password from the learner's page.

### Already have a database from the older version?
Your data is kept. From the `lsda` folder run `npm run setup` and answer "y" to keep your settings, or in `server/` run:
```bash
npm run db:init             # updates the tables (instructor -> supervisor, question sets, help tables)
npm run content:update      # adds the Sesotho lessons/questions and the new starter-quiz questions
```
Both are safe to run more than once. `content:update` never overwrites Sesotho you already typed.

## Colours
The site and certificates use the colours of the Digital Literacy Hub prototype: navy `#17264a`, gold `#e2a72e`, red `#b8372f`, green `#2e7d5b`, background `#eef1f5`, lines `#d3d9e4`, muted text `#56627d`. They are set once at the top of `client/src/styles.css`.

## Roles
| Role | Can do |
|---|---|
| **Learner** | Study, take quizzes, download certificates, ask for help, see/correct/download/delete own data |
| **Supervisor** | Monitors, does not study: no "My learning", no "My certificates", cannot join courses or take quizzes (blocked on the server too). Can read lessons to guide learners. Sees M&E indicators (click any indicator to open the records behind it), course monitoring (per course: enrolled, in progress, certified, scores, where learners stop), every learner's progress, answers help requests, downloads anonymised CSV. Can still verify certificates |
| **Admin** | Everything a supervisor can do, plus: edit course content (English + Sesotho), change roles, set a new password for a learner who forgot theirs, delete users, revoke certificates |

To make someone a supervisor: they register normally, then the admin changes their role on **Manage → Users**.

## 3. Try the full flow
1. Register (tick the consent box). Switch EN/SO at the top: the whole site, lessons and quizzes are in Sesotho.
2. Open a course and press **Join this course**: you go straight to the **starter quiz** (M&E baseline).
3. Finish every lesson, then take the **final assessment** (pass mark 70%; different questions from the starter quiz).
4. Download your PDF certificate, then check it on **Verify certificate**.
5. Ask a question on **Help**. Log in as a supervisor, answer it on **Supervise**, and look at the indicators.
6. Open **My data**: correct your details, download your data, or delete your account.

## 4. Folder structure
```
lsda/
  database/schema.sql          all tables
  server/src/
    index.js                   Express app
    init.js, seed.js           database setup + starter content
    routes/                    auth, learning, certificates, privacy (my data),
                               help, staff (supervisor), admin
    content.js                 all starter lessons + questions (English + Sesotho)
    lib/dataReport.js          "My data" PDF
    migrate.js                 updates older databases
    update-content.js          adds new content to an older database
    lib/certs.js, lib/pdf.js   certificate numbers + PDF/QR generation
    middleware/auth.js         JWT login + roles
  client/src/
    pages/                     Home, Courses, CourseDetail, Lesson, Quiz, Auth, Dashboard,
                               Certificates, Verify, Help, MyData, Supervise,
                               LearnerDetail, KpiDetail, CourseMonitor, Admin
    components/HelpThread.jsx  help conversation (learner + supervisor)
    i18n.js                    English + Sesotho interface text
    styles.css                 design (Basotho-blanket colour band)
```

## 5. How it maps to the assignment
| Requirement | Where |
|---|---|
| Pilot with 8–15 real users | Register your partner's learners; Manage page counts them |
| Baseline + post data | Starter quiz: one attempt, only before the first lesson. Final assessment: separate question set. Gain = first final attempt − starter score (retakes do not inflate it) |
| KPIs (>=5, incl. inclusion, usability, outcome) | Supervise page: 12 indicators incl. skills gain, completion, baseline coverage, female %, youth %, disability, usability %, open help requests; anonymised CSV for analysis |
| Consent / guardian consent under 18 | Registration form + server checks |
| Data minimisation | Verify page shows only "Thabo M."; no ID numbers collected; CSV uses codes (L001), no names or contacts |
| Data rights (withdraw / delete) | **My data** page: see what is kept and who sees it, correct details, view all data on screen and then download it as a PDF (English or Sesotho), delete account (password confirm). Admin can also delete on request |
| Language | Interface, all 18 lessons and all 48 questions in English and Sesotho |
| Support for learners | Help requests answered by supervisors |
| Two iteration cycles | Use the feedback form + keep a change log (see section 7) |

## 6. Things you MUST still do (not code)
- **Sesotho review**: all text has a Sesotho draft. Before the pilot, ask a fluent speaker from the partner community to read it and correct it on **Manage** (each lesson/question has an Edit button; items still missing Sesotho show a "Sesotho missing" label). Mention this review in your report.
- **Real partner**: the brief requires a real community partner, a needs assessment and a pilot. Software alone will not meet the marking criteria.
- **Deleted accounts and M&E**: when a learner deletes their account, their results leave the indicators too. Download the CSV at the end of each pilot week, and explain this in your limitations/ethics section.
- **Certificates** are academy-issued completion certificates, not accredited qualifications (this is printed on them). A deleted account's certificate no longer verifies.
- **Low-bandwidth**: the site loads two Google Fonts. For an offline pilot, delete the `<link>` fonts in client/index.html (system fonts are used instead). YouTube videos need internet: for offline, put `.mp4` files in `client/public/videos/` and use `/videos/name.mp4` as the video link.
- **Secrets**: set a long random `JWT_SECRET` and a new `ADMIN_PASSWORD` in `server/.env` before the pilot. Never hand in or upload your `.env` file.

## 7. Suggested change log (evidence for "two iteration cycles")
Keep a table: Date | Feedback from learner (photo/notes, with consent) | Change made | Result.

## 8. Deploying for the pilot
- Cheapest: run on one laptop at the partner site and open it from phones on the same Wi-Fi (set `PUBLIC_URL` in server/.env to the laptop's address).
- Online: any host that supports Node + MySQL. Run `npm run build` in `client/`, then serve `client/dist` with a web server and proxy `/api` to the Node app. Set a long random `JWT_SECRET`.
