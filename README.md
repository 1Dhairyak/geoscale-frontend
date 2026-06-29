# GeoScale — Full Project Documentation

> **Version:** v1.0.0  
> **GitHub:** [geoscale-frontend](https://github.com/1Dhairyak/geoscale-frontend) · [geoscale-backend](https://github.com/1Dhairyak/geoscale-backend)  
> **Stack:** React + Vite (frontend) · Spring Boot + PostgreSQL (backend)

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Tech Stack](#3-tech-stack)
4. [Project Structure](#4-project-structure)
5. [Database Schema](#5-database-schema)
6. [Backend — Spring Boot](#6-backend--spring-boot)
7. [Frontend — React/Vite](#7-frontend--reactvite)
8. [Quiz System — How It Works](#8-quiz-system--how-it-works)
9. [Geography Questions Seed Data](#9-geography-questions-seed-data)
10. [API Reference](#10-api-reference)
11. [Setup & Running Locally](#11-setup--running-locally)
12. [GitHub & Version Control](#12-github--version-control)
13. [Bug Fixes & Debug Log](#13-bug-fixes--debug-log)
14. [Known Issues & Future Work](#14-known-issues--future-work)

---

## 1. Project Overview

GeoScale is a geography-based quiz and map exploration web application. Users can:

- Explore an interactive world map with Mercator projection correction (like thetruesize.com — drag countries to compare their true size)
- Play geography quizzes with 10 randomly selected questions per session drawn from a pool of 100
- Compete in real-time multiplayer matches via WebSocket
- Track scores on a leaderboard
- Manage a friends list

The name "GeoScale" reflects the core mechanic: visualising the true scale of countries on a map.

---

## 2. Architecture

```
Browser (React/Vite - localhost:5173)
        │
        │  REST API + WebSocket
        ▼
Spring Boot Backend (localhost:8080)
        │
        │  JDBC / JPA
        ▼
PostgreSQL 18 (database: geoscale)
```

The frontend communicates with the backend via:
- **REST API** — authentication, quiz sessions, leaderboard, friends
- **WebSocket** — real-time multiplayer match events

---

## 3. Tech Stack

### Backend
| Layer | Technology |
|---|---|
| Framework | Spring Boot 3.x |
| Language | Java 17+ |
| ORM | Spring Data JPA / Hibernate |
| Database | PostgreSQL 18 |
| Auth | JWT (JSON Web Tokens) |
| Real-time | WebSocket (STOMP) |
| Build | Maven Wrapper (`mvnw`) |

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 18 |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| Map | Custom SVG Mercator projection |
| State | React hooks (`useState`, `useEffect`) |
| HTTP | Fetch API |

---

## 4. Project Structure

### Backend
```
geoscale-project/geoscale/
├── src/main/java/com/geoscale/
│   ├── entity/
│   │   ├── User.java
│   │   ├── Quiz.java
│   │   ├── Question.java
│   │   ├── GameSession.java        ← stores session_question_ids (comma-separated)
│   │   ├── Answer.java
│   │   └── Match.java
│   ├── repository/
│   │   ├── QuestionRepository.java ← findRandomByQuizId(quizId, limit)
│   │   ├── QuizRepository.java
│   │   ├── GameSessionRepository.java
│   │   ├── UserRepository.java
│   │   └── MatchRepository.java
│   ├── service/
│   │   ├── GameSessionService.java ← core quiz logic
│   │   └── MatchService.java
│   ├── controller/
│   │   └── (REST controllers)
│   ├── dto/
│   │   ├── request/
│   │   │   └── SubmitAnswerRequest.java
│   │   └── response/
│   │       ├── QuestionResponse.java ← includes correctAnswer
│   │       └── GameSessionResponse.java
│   └── exception/
│       ├── ResourceNotFoundException.java
│       └── BadRequestException.java
└── src/main/resources/
    └── application.properties
```

### Frontend
```
geoscale-frontend/
├── src/
│   ├── pages/
│   │   ├── GeoScaleMapPage.jsx     ← interactive map with Mercator fix
│   │   ├── QuizPage.jsx            ← 10-question quiz UI
│   │   ├── MatchPage.jsx           ← multiplayer
│   │   ├── LeaderboardPage.jsx
│   │   ├── FriendsPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   └── DashboardPage.jsx
│   ├── components/
│   │   └── {ui, match, quiz, leaderboard, friends}/
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

---


---

## 6. Backend — Spring Boot

### Key Design Decisions

**Random 10 Questions per Session**

When a session starts, the backend picks 10 random questions using a native PostgreSQL query and stores their IDs on the session:

```java
// QuestionRepository.java
@Query(value = "SELECT * FROM questions WHERE quiz_id = :quizId ORDER BY RANDOM() LIMIT :limit",
       nativeQuery = true)
List<Question> findRandomByQuizId(@Param("quizId") Long quizId, @Param("limit") int limit);
```

The selected IDs are persisted as a comma-separated string in `session_question_ids`:

```java
// GameSessionService.java — startSession()
List<Question> randomQuestions = questionRepository.findRandomByQuizId(quizId, 10);
String ids = randomQuestions.stream()
    .map(q -> q.getId().toString())
    .collect(Collectors.joining(","));
session.setSessionQuestionIds(ids);
```

On each `getQuestion()` and `submitAnswer()` call, the service loads questions from those stored IDs — guaranteeing the same 10 questions are used throughout the session, but different every new game.

**Score Calculation**

Each question is worth 10 points. A correct answer awards the full points; wrong answers award 0. Max score per session = 100 (10 questions × 10 points).

**correctAnswer in QuestionResponse**

The backend sends `correctAnswer` (0-based index string) in the question response so the frontend can highlight the correct option after submission:

```java
// QuestionResponse.java fields
private Long id;
private String prompt;
private String type;
private List<String> options;
private int points;
private int orderIndex;
private String correctAnswer;  // ← added for frontend highlighting
```

### Running the Backend

```powershell
cd "$env:USERPROFILE\Downloads\geoscale-project\geoscale"
.\mvnw spring-boot:run
```

Starts on `http://localhost:8080`. Wait for:
```
Started GeoscaleApplication in X.XXX seconds
```

---

## 7. Frontend — React/Vite

### Map Page (`GeoScaleMapPage.jsx`)

The map uses a custom SVG Mercator projection. The key feature is **Mercator horizontal reprojection on drag** — when you drag a country to a different latitude, its width is corrected using:

```
horizontalScale = cos(originalLat) / cos(newLat)
```

This means a country like Canada (high latitude, looks huge on standard maps) correctly narrows when dragged toward the equator, revealing its true relative size — exactly what [thetruesize.com](https://www.thetruesize.com) does.

### Quiz Page (`QuizPage.jsx`)

Key state variables:
```jsx
const [phase, setPhase] = useState("start");      // start | loading | question | result
const [session, setSession] = useState(null);
const [question, setQuestion] = useState(null);
const [orderIndex, setOrderIndex] = useState(1);
const [selected, setSelected] = useState(null);
const [submitted, setSubmitted] = useState(false);
const [correct, setCorrect] = useState(null);     // correct option index after submit
const [score, setScore] = useState(0);
const [totalQuestions, setTotalQuestions] = useState(10);
const [questionStartTime, setQuestionStartTime] = useState(Date.now());
```

Answer submission sends:
```js
{
  questionId: question.id,
  answer: String(selected),        // 0-based index string to match backend
  responseTimeMs: Date.now() - questionStartTime
}
```

Score display: `{score} / {totalQuestions * 10}` — e.g. "30/100"

Score thresholds:
- ≥ 80%: "Excellent! 🌟"
- ≥ 50%: "Good job! 👍"
- < 50%: "Keep practising! 💪"

---

## 8. Quiz System — How It Works

```
User clicks "Start Quiz"
        │
        ▼
POST /api/sessions/start?quizId=1
        │
        ├── Backend picks 10 random questions from DB (ORDER BY RANDOM() LIMIT 10)
        ├── Stores their IDs as "14,72,5,38,91,63,27,88,45,11" in game_sessions
        └── Returns session ID + totalQuestions=10
        │
        ▼
GET /api/sessions/{id}/question/1
        │
        ├── Backend loads IDs from session_question_ids
        ├── Re-indexes them 1..10 in-memory
        └── Returns question 1 (prompt + options + orderIndex + correctAnswer)
        │
        ▼
User selects answer → POST /api/sessions/{id}/answer
        │
        ├── Backend checks answer against correct_answer in DB
        ├── Awards 10 pts if correct, 0 if wrong
        ├── Increments answeredQuestions
        └── Returns updated session (score, status)
        │
        ▼
Frontend updates score display + highlights correct/wrong option
        │
        ▼
Repeat for questions 2–10
        │
        ▼
Session status → COMPLETED, show final score screen
```

Each new quiz session gets a **different random set** of 10 questions.

---

## 9. Geography Questions Seed Data

The database contains **100 geography multiple-choice questions** with quiz_id = 1. Each question has:
- 4 options (stored as JSON array)
- A correct answer (0-based index, stored as string)
- 10 points each
- Type = `MULTIPLE_CHOICE`

To re-seed (run from PowerShell after psql is available):
```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d geoscale -c "SELECT COUNT(*) FROM questions WHERE quiz_id = 1;"
```
Should return `100`.

Topics covered: world capitals, oceans, rivers, mountains, deserts, continents, countries, islands, landmarks.

---

## 10. API Reference

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login, returns JWT |

### Quiz Sessions
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/sessions/start?quizId={id}` | Start a new quiz session (picks 10 random Qs) |
| GET | `/api/sessions/{id}/question/{orderIndex}` | Get question by position (1–10) |
| POST | `/api/sessions/{id}/answer` | Submit an answer |
| POST | `/api/sessions/{id}/complete` | Mark session complete |
| GET | `/api/sessions` | Get current user's session history |
| GET | `/api/sessions/{id}` | Get specific session |

### Answer Request Body
```json
{
  "questionId": 42,
  "answer": "2",
  "responseTimeMs": 3500
}
```

### Question Response Body
```json
{
  "id": 42,
  "prompt": "What is the capital of France?",
  "type": "MULTIPLE_CHOICE",
  "options": ["Berlin", "Madrid", "Paris", "Rome"],
  "points": 10,
  "orderIndex": 3,
  "correctAnswer": "2"
}
```

---

## 11. Setup & Running Locally

### Prerequisites
- Java 17+
- Maven (or use included `mvnw`)
- Node.js 18+ and npm
- PostgreSQL 18
- Git

### Database Setup
```sql
CREATE DATABASE geoscale;
```
Then run the seed script to populate 100 questions (see `geo_seed.sql`).

### Backend
```powershell
# From project root
cd "$env:USERPROFILE\Downloads\geoscale-project\geoscale"
.\mvnw spring-boot:run
```
Runs on `http://localhost:8080`

### Frontend
```powershell
cd "$env:USERPROFILE\Downloads\geoscale-frontend"
npm install
npm run dev
```
Runs on `http://localhost:5173`

### Common Issues

**Port 8080 already in use:**
```powershell
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

**PowerShell file writing adds BOM (causes Java parse errors):**  
Use Python to write Java source files instead of `Set-Content -Encoding UTF8`:
```powershell
@"..."@ | Out-File "$env:TEMP\script.py" -Encoding ASCII
python "$env:TEMP\script.py"
```

---

## 12. GitHub & Version Control

| Repo | URL |
|---|---|
| Frontend | https://github.com/1Dhairyak/geoscale-frontend |
| Backend | https://github.com/1Dhairyak/geoscale-backend |

Both tagged as `v1.0.0`.

### Pushing Updates
```powershell
# Frontend
cd "$env:USERPROFILE\Downloads\geoscale-frontend"
git add .
git commit -m "description of change"
git push

# Backend
cd "$env:USERPROFILE\Downloads\geoscale-project\geoscale"
git add .
git commit -m "description of change"
git push
```

### Tagging a New Version
```powershell
git tag v1.1.0
git push origin v1.1.0
```

### Note on node_modules
The frontend was initially pushed with `node_modules/` included. A `.gitignore` was added afterwards. For a clean clone:
```powershell
npm install   # reinstalls from package.json
```

---

## 13. Bug Fixes & Debug Log

### Fix 1 — Question Text Not Rendering
**Problem:** `QuestionResponse` DTO used field name `prompt`; frontend looked for `questionText`.  
**Fix:** Added `prompt` to the fallback chain in `QuizPage.jsx`:
```jsx
{question.prompt ?? question.questionText ?? question.text}
```

### Fix 2 — Progress Bar Off By One
**Problem:** `orderIndex` starts at 1 but progress math used `orderIndex + 1`.  
**Fix:** Adjusted to `((orderIndex - 1) / totalQuestions) * 100`.

### Fix 3 — Quiz Not Advancing
**Problem:** Frontend sent `{ answerId, answerText }` but backend expected `{ questionId, answer, responseTimeMs }`.  
**Fix:** Corrected the answer submission body and added `questionStartTime` state.

### Fix 4 — Answer Sent as Letter Instead of Index
**Problem:** Frontend sent `String.fromCharCode(65 + selected)` (i.e. "A", "B") but backend stored `correct_answer` as "0", "1", "2", "3".  
**Fix:** Changed to `String(selected)`.

### Fix 5 — Score Showing 30/10 Instead of 30/100
**Problem:** Score denominator showed `totalQuestions` (10) instead of max points.  
**Fix:** Changed display to `{score}/{totalQuestions * 10}`.

### Fix 6 — BOM Characters Breaking Java Compilation
**Problem:** PowerShell `Set-Content -Encoding UTF8` adds a BOM (`\ufeff`) that Java cannot parse.  
**Fix:** Use Python with `open(..., encoding='utf-8')` to write all Java source files.

### Fix 7 — Mercator Horizontal Distortion
**Problem:** Dragging countries horizontally looked wrong because shape wasn't reprojected.  
**Fix:** Applied `cos(originalLat) / cos(newLat)` ratio to compress longitude offsets as latitude changes.

### Fix 8 — `session_question_ids` Column Missing
**Problem:** `GameSession` entity had no field to store selected question IDs.  
**Fix:** Added `ALTER TABLE game_sessions ADD COLUMN session_question_ids TEXT;` and corresponding entity field/getter/setter.

### Fix 9 — `setOrderIndex` Missing on Question Entity
**Problem:** `GameSessionService` called `question.setOrderIndex()` but `Question.java` had no such setter.  
**Fix:** Added `public void setOrderIndex(int v) { this.orderIndex = v; }`.

### Fix 10 — 212 Duplicate Questions in DB
**Problem:** The seed script's `DELETE` failed due to a foreign key constraint from the `answers` table, so 100 new rows were inserted on top of existing ones.  
**Fix:**
```sql
DELETE FROM answers WHERE question_id IN (SELECT id FROM questions WHERE quiz_id = 1 AND order_index <= 12);
DELETE FROM questions WHERE quiz_id = 1 AND id NOT IN (SELECT id FROM questions WHERE quiz_id = 1 ORDER BY order_index LIMIT 100);
```

---

## 14. Known Issues & Future Work

### Known Issues
- `node_modules/` was committed to the frontend repo in v1.0.0 (`.gitignore` added after initial push)
- The `quizzes` table has no `total_questions` column — question count is derived dynamically from the `questions` table
- Tibet is a region, not a country — listed as answer in question 69 ("Roof of the World")

### Planned Features
- Score history graphs per user
- Timed mode (countdown per question)
- Category filtering (capitals only, rivers only, etc.)
- Difficulty levels affecting question pool
- Mobile-responsive map dragging
- Leaderboard pagination
- Friend challenge invites via WebSocket

---

*GeoScale v1.0.0 — Built with Spring Boot + React + PostgreSQL*
