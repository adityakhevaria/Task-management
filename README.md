# Task Management System

A full-stack task management system built with Next.js, MongoDB, and JWT authentication.

## Features

- User authentication with JWT
- Role-based access control (admin and user roles)
- CRUD operations for users and tasks
- Task assignment to multiple users
- Attach up to 3 documents (PDF format) to tasks and view those documents when viewing task details
- Filter and sort tasks based on status, priority, and due date
- Responsive UI with Tailwind CSS

## Tech Stack

- **Frontend**: React, Next.js, Tailwind CSS, Context API
- **Backend**: Next.js API Routes
- **Database**: MongoDB
- **Authentication**: JWT
- **File Storage**: Local file system
- **Containerization**: Docker

## Prerequisites

- Node.js 18+
- MongoDB
- Docker and Docker Compose (for containerized deployment)

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

\`\`\`
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
RECIPIENT_EMAIL=recipient@gmail.com
\`\`\`

## Installation and Setup

### Local Development

1. Clone the repository:
   \`\`\`
   git clone https://github.com/yourusername/task-management-system.git
   cd task-management-system
   \`\`\`

2. Install dependencies:
   \`\`\`
   npm install
   \`\`\`

3. Create initial admin and user accounts:
   \`\`\`
   node scripts/create-admin.js
   \`\`\`
   This will create:
   - Admin user: admin@example.com / admin123
   - Regular user: user@example.com / user123

4. Run the development server:
   \`\`\`
   npm run dev
   \`\`\`

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Docker Deployment

1. Clone the repository:
   \`\`\`
   git clone https://github.com/yourusername/task-management-system.git
   cd task-management-system
   \`\`\`

2. Build and run with Docker Compose:
   \`\`\`
   docker-compose up -d
   \`\`\`

3. Create initial admin and user accounts:
   \`\`\`
   docker-compose exec app node scripts/create-admin.js
   \`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Documentation

### Authentication

- **POST /api/auth/register**: Register a new user
- **POST /api/auth/login**: Login a user

### Users

- **GET /api/users**: Get all users (admin only)
- **POST /api/users**: Create a new user (admin only)
- **GET /api/users/:id**: Get a user by ID
- **PUT /api/users/:id**: Update a user
- **DELETE /api/users/:id**: Delete a user (admin only)

### Tasks

- **GET /api/tasks**: Get all tasks
- **POST /api/tasks**: Create a new task
- **GET /api/tasks/:id**: Get a task by ID
- **PUT /api/tasks/:id**: Update a task
- **DELETE /api/tasks/:id**: Delete a task

### Documents

- **POST /api/tasks/:id/documents**: Upload a document to a task
- **GET /api/tasks/:id/documents/:documentId**: Get a document
- **DELETE /api/tasks/:id/documents/:documentId**: Delete a document

## Project Structure

\`\`\`
task-management-system/
├── app/                  # Next.js app directory
│   ├── api/              # API routes
│   ├── dashboard/        # Dashboard pages
│   ├── login/            # Login page
│   ├── register/         # Register page
│   ├── tasks/            # Task pages
│   ├── users/            # User pages
│   ├── layout.js         # Root layout
│   └── page.js           # Home page
├── components/           # React components
├── context/              # Context providers
├── lib/                  # Utility functions
├── middleware/           # Middleware functions
├── models/               # MongoDB models
├── public/               # Static files
├── scripts/              # Utility scripts
├── uploads/              # Uploaded files
├── .env.local            # Environment variables
├── Dockerfile            # Docker configuration
├── docker-compose.yml    # Docker Compose configuration
└── README.md             # Project documentation
\`\`\`

## License

MIT
