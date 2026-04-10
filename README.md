# FairPlay

FairPlay is a sports venue booking and community activity platform for players and venue owners. Players can discover venues, reserve slots, host activities, join existing games, and manage bookings. Owners can publish venues, update or delete listings, review bookings, and track business metrics from an owner dashboard.

## Live Demo

- Frontend: https://fairplay-frontend-nn2g.onrender.com/

Render free-tier services can cold start after inactivity, so the first request may take a little longer.

## Repository Contents

- `FairPlay_Frontend/fairplay` - Angular 21 frontend
- `FairPlay_Backend/fairplay` - Spring Boot multi-module backend
- `Documents/` - product and system design notes
- `render.yaml` - Render Blueprint for the deployed stack

## Core Features

### Player Features

- Register and log in
- Browse venues by location and sport type
- Create and cancel bookings
- Browse upcoming activities
- Host new activities
- Join existing activities
- Manage profile details

### Owner Features

- Register as `OWNER`
- Create, update, and delete venues
- View owned venues directly on the dashboard
- Review bookings across owned venues
- Track owner dashboard metrics
- Manage owner profile details

## Application Pages

- Dashboard
- Login
- Register
- Venues
- Activities
- Bookings
- Owner dashboard
- Profile
- Logout

## Tech Stack

- Frontend: Angular 21, Angular Material, RxJS
- Backend: Spring Boot 3.3.5, Spring Cloud Gateway, Eureka, OpenFeign, Spring Data JPA
- Database: PostgreSQL
- Authentication: JWT
- Deployment: Docker + Render Blueprint

## Architecture

### Frontend

- Standalone Angular application
- Uses the API gateway as the single backend entry point
- Runs locally on `http://localhost:4200`
- Uses `proxy.conf.json` in local development to forward API requests to the gateway

### Backend

The backend is a Maven multi-module Spring Boot project with these services in local development:

1. `eureka-server` on `http://localhost:8761`
2. `api-gateway` on `http://localhost:8083`
3. `user-service` on `http://localhost:8081`
4. `venue-service` on `http://localhost:8082`

### Deployment Topology

The root `render.yaml` provisions these Render services:

- `fairplay-user-service`
- `fairplay-venue-service`
- `fairplay-api-gateway`
- `fairplay-frontend`

Local development uses Eureka service discovery. The Render deployment disables Eureka and connects services by each service's `RENDER_EXTERNAL_URL`, which keeps the free-tier deployment simple.

## Repository Layout

```text
FairPlay/
|- FairPlay_Frontend/fairplay/      Angular application
|- FairPlay_Backend/fairplay/       Spring Boot multi-module backend
|- Documents/                       Product and system design documents
|- render.yaml                      Render Blueprint definition
```

## API Summary

All frontend requests are intended to go through the API gateway.

### User Service

- `POST /users` - register a new user
- `POST /users/login` - log in and receive a JWT
- `GET /users/me` - get the authenticated user
- `GET /users/{userId}` - get a user by id
- `PUT /users/{userId}` - update profile details
- `GET /activities` - list activities
- `POST /activities/host` - host a new activity
- `POST /activities/join` - join an activity

### Venue Service

- `POST /venues` - create a venue
- `GET /venues` - search venues with optional `location` and `sportType`
- `PUT /venues/{venueId}` - update a venue
- `DELETE /venues/{venueId}` - delete a venue owned by the authenticated owner
- `POST /bookings` - create a booking
- `GET /bookings/{userId}` - get bookings for a user
- `PUT /bookings/{bookingId}` - update or cancel a booking
- `GET /owners/{ownerId}/dashboard` - fetch owner dashboard metrics
- `GET /owners/{ownerId}/bookings` - fetch bookings across owned venues
- `GET /owners/{ownerId}/venues` - fetch venues owned by the authenticated owner

## Prerequisites

- Node.js 20+ and npm
- Java 21
- Maven 3.9+ or the Maven wrapper included in the repo
- PostgreSQL

## Database Setup

Create two PostgreSQL databases:

- `fairplay_user_db`
- `fairplay_venue_db`

Default local JDBC targets used by the app:

- `jdbc:postgresql://localhost:5432/fairplay_user_db`
- `jdbc:postgresql://localhost:5432/fairplay_venue_db`

Recommended environment variables before starting backend services:

```powershell
$env:USER_DB_URL="jdbc:postgresql://localhost:5432/fairplay_user_db"
$env:USER_DB_USERNAME="postgres"
$env:USER_DB_PASSWORD="your-password"
$env:VENUE_DB_URL="jdbc:postgresql://localhost:5432/fairplay_venue_db"
$env:VENUE_DB_USERNAME="postgres"
$env:VENUE_DB_PASSWORD="your-password"
$env:EUREKA_SERVER_URL="http://localhost:8761/eureka"
```

Override local defaults with environment variables instead of relying on checked-in passwords in `application.properties`.

## Running the Backend Locally

Open a terminal in `FairPlay_Backend/fairplay`.

Start the services in this order:

1. `eureka-server`
2. `user-service`
3. `venue-service`
4. `api-gateway`

PowerShell commands:

```powershell
.\mvnw.cmd -pl eureka-server spring-boot:run
.\mvnw.cmd -pl user-service spring-boot:run
.\mvnw.cmd -pl venue-service spring-boot:run
.\mvnw.cmd -pl api-gateway spring-boot:run
```

Run backend tests:

```powershell
.\mvnw.cmd test
```

If you are using Git Bash or a Unix shell, use `./mvnw` instead of `.\mvnw.cmd`.

## Running the Frontend Locally

Open a terminal in `FairPlay_Frontend/fairplay`.

Install dependencies:

```powershell
npm install
```

Start the Angular dev server:

```powershell
npm start
```

The frontend runs at `http://localhost:4200`.

Local development proxies these paths to the API gateway on port `8083`:

- `/users`
- `/activities`
- `/venues`
- `/bookings`
- `/owners`

Useful frontend commands:

```powershell
npm start
npm run build
npm test
```

## Deploying on Render

The project already includes a root `render.yaml` for a Render Blueprint deployment.

Before the first deploy, provide database credentials for these variables:

```text
USER_DB_URL=jdbc:postgresql://<your-neon-host>/<fairplay_user_db>?sslmode=require
USER_DB_USERNAME=<your-neon-username>
USER_DB_PASSWORD=<your-neon-password>
VENUE_DB_URL=jdbc:postgresql://<your-neon-host>/<fairplay_venue_db>?sslmode=require
VENUE_DB_USERNAME=<your-neon-username>
VENUE_DB_PASSWORD=<your-neon-password>
```

Deployment flow:

1. Push the repository to GitHub.
2. In Render, create a new Blueprint and point it at the repository.
3. Render reads `render.yaml` and creates the frontend plus backend services.
4. Enter the PostgreSQL credentials when prompted.
5. Open the frontend URL after deployment finishes.

The frontend container uses Nginx to proxy `/users`, `/activities`, `/venues`, `/bookings`, and `/owners` to the deployed API gateway, so browser requests stay on the same origin.

## Render Free-Tier Notes

- Services can spin down after periods of inactivity.
- The first request after idle time can take around a minute while services wake up.
- The free setup is appropriate for demos and evaluation, not for reliable production traffic.
- The deployed frontend URL for this repository is https://fairplay-frontend-nn2g.onrender.com/
