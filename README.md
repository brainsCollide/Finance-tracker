💰 Finance Tracker App
A full-stack MERN (MongoDB, Express, React, Node.js) application that helps users track income and expenses in real time.
It includes authentication, data visualization, and responsive UI built with React + Tailwind CSS.

🚀 Features

- User Authentication – Sign up, log in, and manage sessions securely.
- Transaction Management – Add, edit, delete, and view transactions.
- Income & Expense Categorization – Separate and calculate totals automatically.
- Charts & Analytics – Visualize spending habits using bar and doughnut charts.
- Upcoming Payments – Get reminders for bills and due dates.
- Responsive Sidebar – Expand/shrink sidebar with quick navigation.
- Dynamic Transaction Cards – Latest transactions displayed instantly.
- Custom Hooks – Manage transaction state and fetching logic.


📂 Project Structure

```
frontend/
│── src/
│   ├── api/           # Axios instance for backend requests
│   ├── components/    # UI components (TransactionCard, TransactionBar, etc.)
│   ├── hooks/         # Custom React hooks (e.g., useTransactions)
│   ├── pages/         # Page-level components (Dashboard, Login, Signup, etc.)
│   └── App.jsx        # Main React entry point

backend/
│── models/            # MongoDB models (Transaction, User)
│── routes/            # API routes for transactions & authentication
│── controllers/       # Logic for each route
│── server.js          # Express app entry point
```



🛠️ Tech Stack
Frontend

- React (Vite)

- Tailwind CSS

- Axios

- React Router

Backend

- Node.js

- Express

- MongoDB (Mongoose)

  

📦 Installation

1️⃣ Clone the repository
```
git clone https://github.com/yourusername/finance-tracker.git
cd finance-tracker
```

2️⃣ Install dependencies
Frontend:

```
cd frontend
npm install
```

Backend:

```
cd backend
npm install
```

3️⃣ Configure environment variables
Create a .env file inside backend/:

```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

▶️ Running the App
Backend:
```
cd backend
npm run dev
```

Frontend:
```
cd frontend
npm run dev
```

📌 Roadmap
- Add currency conversion support
- Add export to CSV/Excel feature
- Add recurring transaction reminders
- Dark mode

📜 License
MIT License © 2025 Muhammad Fauzan
