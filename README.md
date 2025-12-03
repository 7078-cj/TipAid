# TipAid — Setup Instructions

Follow the steps below to set up the project locally.

---

## 1. Clone the Repository

```bash
git clone https://github.com/7078-cj/TipAid.git
cd TipAid
```

---

## 2. Backend Setup

```bash
cd backend
```

### Create Virtual Environment

```bash
python -m venv venv
```

Activate it:

**Windows**

```bash
venv\Scripts\activate
```

**Mac/Linux**

```bash
source venv/bin/activate
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

### Environment Variables

If the project includes `.env.example`:

```bash
cp .env.example .env
```

Then fill in all required values.

### Run Migrations (if applicable)

```bash
python manage.py migrate
```

### Start Backend Server

```bash
python manage.py runserver
```

Backend URL:

```
http://127.0.0.1:8000
```

---

## 3. Frontend Setup

Open a new terminal:

```bash
cd frontend
```

### Install Dependencies

```bash
npm install
# or
yarn install
```

### Configure API URL (if required)

In `.env` or configuration:

```
VITE_API_URL=http://127.0.0.1:8000
```

### Start Frontend Server

```bash
npm start
# or
yarn start
```

Frontend URL:

```
http://localhost:3000
```

---

## 4. Optional: Docker Setup

If Docker is available:

```bash
docker-compose up --build
```

This starts both backend and frontend.

---

## 5. Setup Complete

* Frontend running at: **[http://localhost:3000](http://localhost:3000)**
* Backend running at: **[http://127.0.0.1:8000](http://127.0.0.1:8000)**

You now have TipAid running locally.
