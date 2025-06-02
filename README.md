# 💪 E-Book Store

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

- **Full Stack**: Next.js, TypeScript
- **Database**: Postgres (via Docker)
- **Authentication**: JWT

---

## 📄 License

MIT License © [Addiiik](https://github.com/addiiik)
