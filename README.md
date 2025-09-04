# 📚 E-Book Store

A digital store and library for your academic textbooks.

---

## 📸 Screenshots

### 🏠 Store landing screen and user page
<div style="display: flex; gap: 10px;">
  <img src="public/screenshots/Home.png" alt="Home" width="300"/>
  <img src="public/screenshots/User.png" alt="User" width="300"/>
</div>

<div style="display: flex; gap: 10px;">
  <img src="public/screenshots/Home-Mobile.PNG" alt="HomeMobile" width="300"/>
  <img src="public/screenshots/User-Mobile.PNG" alt="UserMobile" width="300"/>
</div>

### 📚 Book page and reader
<div style="display: flex; gap: 10px;">
  <img src="public/screenshots/Book.png" alt="Book" width="300"/>
  <img src="public/screenshots/Reader.png" alt="Reader" width="300"/>
</div>

<div style="display: flex; gap: 10px;">
  <img src="public/screenshots/Book-Mobile.PNG" alt="BookMobile" width="300"/>
  <img src="public/screenshots/Reader-Mobile.PNG" alt="ReaderMobile" width="300"/>
</div>

---

## 🛠️ Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/addiiik/EBookApp
cd EBookApp
```

---

### 2️⃣ Environment Configuration for the application

The application requires environment variables for the database and auth.js.

**Step 1: Create a .env file in the root folder**

Create a .env file inside the root directory with the following content:
```
POSTGRES_USER=ebook_postgres
POSTGRES_PASSWORD=password_ebook
POSTGRES_DB=ebook_db
DATABASE_URL="postgresql://ebook_postgres:password_ebook@localhost:5432/ebook_db"
```

**Step 2: Generate a secure auth secret**

Generate a strong secret with this command:
```
npx auth secret
```

---

### 3️⃣ Start the application

Run:

```bash
npm install
npm run dev

```

---

### 4️⃣ Start the database

Open **another terminal tab** and run:

```bash
docker-compose up
```

💡 Make sure Docker is running on your machine.

---

### 5️⃣ Database seeding

Open **yet another terminal tab** and run:

```bash
npx prisma generate
npx prisma migrate dev --name init
npm run seed
```

---

### 6️⃣ Get started!

You can now use the application!  
👉 [Open in browser](http://localhost:3000)

## 🧪 Tech Stack

| Category         | Technology |
|------------------|------------|
| **Language**     | [![TypeScript](https://img.shields.io/badge/TypeScript-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/docs/) |
| **Frontend**     | [![Next.js](https://img.shields.io/badge/Next.js-000?logo=next.js&logoColor=white)](https://nextjs.org/) |
| **Backend**      | [![Next.js](https://img.shields.io/badge/Next.js-000?logo=next.js&logoColor=white)](https://nextjs.org/) |
| **Database**     | [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169e1?logo=postgresql&logoColor=white)](https://www.postgresql.org/) |
| **Authentication** | [![JWT](https://img.shields.io/badge/JWT-000?logo=jsonwebtokens&logoColor=white)](https://www.jwt.io/introduction#what-is-json-web-token) |
| **Containerization** | [![Docker](https://img.shields.io/badge/Docker-2496ed?logo=docker&logoColor=white)](https://docs.docker.com) |

---

## 📄 License

MIT License © [Addiiik](https://github.com/addiiik)
