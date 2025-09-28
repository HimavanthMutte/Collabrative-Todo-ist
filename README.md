# Modern Collaborative To-Do List Application

## Project Overview
A full-stack web application for **task management and collaboration**, designed to help users organize work efficiently.  
Built with a modern tech stack, it provides a seamless experience for **creating, managing, and sharing tasks** with others.  

**Key Features:**
- User authentication & JWT-based security
- Task creation, editing, deletion, and status management
- Task prioritization and due date tracking
- Collaboration with permission control (`view` or `edit`)
- Real-time updates ready for future integration with WebSockets
- Responsive and modern UI with gradients, icons, and animations

The project is divided into:  
- **Backend:** Node.js / Express / MongoDB  
- **Frontend:** React (Create React App)  

---

## Detailed Features

### 1. User Authentication and Management
**Registration**
- Unique username (3+ characters, alphanumeric + `_`)  
- Unique, valid email  
- Password (6+ characters, hashed with bcrypt)  
- JWT token generated (expires in 7 days)  

**Login**
- Authenticate with email & password  
- Returns JWT token and user details  

**Profile Access**
- Protected route `/api/auth/me`  
- JWT middleware ensures only authenticated users can access  

**Security Rules**
- JWT verification on all protected routes  
- CORS enabled for frontend-backend communication  
- Input validation using `express-validator`  

---

### 2. Task Management
**Create Task**
- Title (required, max 100 characters)  
- Description (optional, max 500 characters)  
- Priority (Low/Medium/High, default Medium)  
- Due Date (optional)  
- Default status: `pending`  

**View Tasks**
- Dashboard displays owned + collaborated tasks  
- Task cards show title, description, priority (color-coded), due date, status, and actions  

**Edit Task**
- Owners and collaborators with `edit` permission can update tasks  

**Delete Task**
- Only task owners can delete  
- Confirmation dialog before deletion  

### 3. Collaboration Features
**Share Task**
- Owners can share tasks via email and assign permissions (`view` or `edit`).  
- Backend validates the email and updates the `collaborators` array.  
- UI updates immediately on success, showing a notification message.  

**Collaborator Management**
- Collaborators see shared tasks in their dashboard.  
- Permissions control allowed actions:  
  - `view` → read-only  
  - `edit` → can update task details  
- Owners can remove collaborators via `DELETE /api/tasks/:id/collaborators/:userId`.  

**Real-time Aspects**
- Changes propagate on refresh or navigation.  
- Designed for easy extension with Socket.io for live updates.  

---

### 4. UI/UX Features
**Dashboard (`Dashboard.js`)**
- Header with app title, user greeting, and logout button  
- "Add New Task" button toggles the task form modal  
- Task list grid layout with loading spinner and error banners  
- Responsive for mobile and desktop  

**Components**
- **TaskCard:** Task details with action buttons (edit, complete, delete, share)  
- **TaskForm:** Form for creating/updating tasks with validation  
- **ShareModal:** Email input, permission selection, submit/cancel  
- **Auth Forms:** Centered cards with gradients, error messages, toggle between login/register  

**Styling**
- CSS Modules for scoped styles (e.g., `Dashboard.css`, `TaskForm.css`)  
- Modern design with gradients, shadows, transitions, hover effects  
- Font Awesome icons for visual appeal  
- Mobile-first using Flexbox/Grid  
- Color scheme: professional blues/greens; priority colors: red (High), yellow (Medium), green (Low)  

---

### 5. API Endpoints

**Auth**
| Method | Endpoint           | Description                    |
|--------|--------------------|--------------------------------|
| POST   | /api/auth/register | Register a new user            |
| POST   | /api/auth/login    | Login user                     |
| GET    | /api/auth/me       | Get current authenticated user |

**Tasks**
| Method | Endpoint                             | Description                                                |
|--------|--------------------------------------|------------------------------------------------------------| 
| GET    | /api/tasks                           | Get all tasks (owned + collaborated)                       |
| POST   | /api/tasks                           | Create a new task                                          |
| GET    | /api/tasks/:id                       | Get task by ID                                             |
| PUT    | /api/tasks/:id                       | Update task (edit permission required)                     |
| DELETE | /api/tasks/:id                       | Delete task (owner only)                                   |
| POST   | /api/tasks/:id/share                 | Share task with collaborator                               | 
| DELETE | /api/tasks/:id/collaborators/:userId | Remove collaborator                                        |

---

### 6. Tech Stack

**Backend**
- Node.js, Express.js  
- MongoDB, Mongoose  
- JWT (jsonwebtoken)  
- bcryptjs  
- express-validator  
- CORS, dotenv  

**Frontend**
- React 18+  
- React Hooks (`useState`, `useEffect`)  
- Axios for API calls  
- CSS3 with media queries  
- Font Awesome & Google Fonts  
- localStorage for token persistence  

---

### 7. Database Schema

**User**
```json
{
  "username": "string",
  "email": "string",
  "password": "hashed string",
  "timestamps": true
}
```
### 8. Installation & Setup

**Prerequisites**
- Node.js v14+  
- MongoDB (local or Atlas)  
- Git  

**Backend**
```bash```
cd backend
npm install
# Create a .env file with the following:
PORT=5000
MONGODB_URI=mongodb://localhost:27017/todoapp
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d
npm run dev   # Start backend with nodemon

**frontend**
cd frontend
npm install
npm start     # Runs on http://localhost:3000


