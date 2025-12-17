# Express + CASL Hybrid RBAC/ABAC System

A robust authorization system built with **Node.js**, **Express**, **Prisma**, and **CASL** demonstrating how to implement a hybrid **Role-Based Access Control (RBAC)** and **Attribute-Based Access Control (ABAC)** system.

Instead of simple boolean checks (e.g., `isAdmin`), this system uses granular permissions where access depends on *who* you are (Role) and *what* you own (Attributes).

## Key Features

* **Hybrid Access Control:** Combines roles (Admin, Moderator) with attribute checks (Author ownership).
* **Database-Level Security:** Uses `@casl/prisma` to translate permission rules directly into Prisma `where` clauses.
* **Granular Permissions:**
    * **Admins** have full system access.
    * **Moderators** can manage content (publish posts, hide comments) but cannot delete users.
    * **Authors** have ownership logic: they can only edit/delete *their own* posts and view their own drafts.
* **Secure Authentication:** JWT-based stateless authentication with bcrypt password hashing.

## Tech Stack

* **Runtime:** Node.js & TypeScript
* **Framework:** Express.js
* **ORM:** Prisma
* **Authorization:** CASL (`@casl/ability`, `@casl/prisma`)
* **Logging:** Winston

## The Authorization Model

The core strength of this project is the authorization logic located in `utils.ts` and applied via middleware. We define abilities based on the user's role.

### Roles & Capabilities

| Role | Permissions | Logic |
| :--- | :--- | :--- |
| **ADMIN** | `manage all` | Can perform any action on any resource. |
| **MODERATOR** | `read Post`<br>`publish Post`<br>`hide Comment` | Can read posts and perform administrative content tasks. Explicitly cannot delete Users. |
| **AUTHOR** | `create Post`<br>`update/delete (Own Post)`<br>`read (Published Post)`<br>`read (Own Draft/Unpublished Post)` | Can only update/delete resources where `authorId` matches their ID. Can see all published posts, but only *their own* unpublished drafts/posts. |

### How It Works

#### 1. Defining Abilities (ABAC)
Permissions are defined dynamically at runtime. For example, an Author's ability looks like this:

```typescript
// utils.ts (Snippet)
if (user.role === "AUTHOR") {
  can("read", "Post", { isPublished: true });
  can("read", "Post", { isPublished: false, authorId: user.id }); // Attribute check
  can("create", "Post");
  
  // Ownership Rules
  can("update", "Post", { authorId: user.id }); 
  can("delete", "Post", { authorId: user.id });
}
```
#### 2. Imperative Checks
For specific actions like updating or deleting, we check the permission against the specific subject:

```typescript
// post.controller.ts
if (!req.ability.can("update", subject("Post", post))) {
  throw new AppError("Forbidden", "Forbidden", 403);
}
```
## Getting Started
Prerequisites
* Node.js (v18+)
* A Database (PostgreSQL/MySQL)

#### Setup & Installation
##### 1. Clone the repository and install
```bash
git clone https://github.com/Anthony11-hub/RBAC-nodejs.git
cd rbac-node
npm install
```

#### 2. Environment Setup
```bash
DATABASE_URL="mysql://user:password@localhost:3306/rbac"
DATABASE_HOST="localhost"
DATABASE_USER="user"
DATABASE_PASSWORD="password"
DATABASE_NAME="rbac"
# app
PORT=4000
NODE_ENV=dev
APP_URL=https://domain.com
JWT_SECRET=<secret>
```

#### 3. Database Migration
Before building, you must run the Prisma migrations to set up your database schema and generate the Prisma Client.

```bash
npx prisma migrate dev
npx prisma generate
```

#### 4. Run the project
##### Development

```bash
npm run build
npm run dev
```
##### Production
```bash
npm run build
npm run start
```

## Api Overview
* Auth: `/api/v1/auth/register`, `/api/v1/auth/login`

* Posts:
    * `GET` / (Lists posts based on visibility rules)
    * `POST` / (Create post)
    * `PATCH` /:id (Update - Authors only own posts)
    * `PATCH` /:id/publish (Moderators only)
    * `PATCH` /comments/:id/hide (Moderators only)

* Users:
    * `PATCH` /:id (Update Role - Admin only)
    * `DELETE` /:id (Delete User - Admin only)
