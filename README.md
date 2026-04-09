# FairPlay

FairPlay is a sports venue and community activity booking platform. This repository contains:

- An Angular frontend for players and venue owners
- A Spring Boot microservices backend
- Supporting product and system design documents under `Documents/`

The current implementation lets users register, log in, browse venues, book time slots, host activities, join activities, and manage owner dashboards.

## Repository Layout

```text
FairPlay/
|- FairPlay_Frontend/fairplay/      # Angular 21 application
|- FairPlay_Backend/fairplay/       # Maven multi-module backend
|- Documents/                       # PRD and system design notes
```

## Architecture

### Frontend

- Angular 21 standalone application
- Angular Material UI
- Route guards for authenticated users and owners
- Uses the API gateway as the single backend entry point
- Runs on `http://localhost:4200`

### Backend

The backend is a Maven multi-module Spring Boot project with four services:

1. `eureka-server` on `http://localhost:8761`
2. `api-gateway` on `http://localhost:8083`
3. `user-service` on `http://localhost:8081`
4. `venue-service` on `http://localhost:8082`

Key backend technologies:

- Spring Boot 3.3
- Spring Cloud Gateway
- Eureka service discovery
- OpenFeign for service-to-service communication
- Spring Data JPA
- PostgreSQL
- JUnit and Spring Boot Test

## Main Features

### Player Features

- Register and log in
- Browse venues by location and sport type
- Create and cancel bookings
- Browse activity feed
- Host activities
- Join activities
- Update profile

### Owner Features

- Register as `OWNER`
- Create and update venues
- View owner dashboard metrics
- Review bookings across owned venues
- Update owner profile

## Frontend Screens

Implemented Angular pages:

- Dashboard
- Login
- Register
- Venues
- Activities
- Bookings
- Owner dashboard
- Profile
- Logout

## API Summary

All frontend requests are intended to go through the gateway at `http://localhost:8083`.

### User Service

- `POST /users` - register user
- `POST /users/login` - login
- `GET /users/{userId}` - get user by id
- `PUT /users/{userId}` - update user profile
- `GET /activities` - activity feed
- `POST /activities/host` - host activity
- `POST /activities/join` - join activity

### Venue Service

- `POST /venues` - create venue
- `GET /venues` - search venues with optional `location` and `sportType`
- `PUT /venues/{venueId}` - update venue
- `POST /bookings` - create booking
- `GET /bookings/{userId}` - bookings for a user
- `PUT /bookings/{bookingId}` - update or cancel booking
- `GET /owners/{ownerId}/dashboard` - owner metrics
- `GET /owners/{ownerId}/bookings` - owner booking list

## Prerequisites

- Node.js 20+ and npm
- Java 21
- Maven 3.9+ or the included Maven wrapper
- PostgreSQL

## Database Setup

The backend expects two PostgreSQL databases:

- `fairplay_user_db`
- `fairplay_venue_db`

Default local JDBC URLs in the code:

- `jdbc:postgresql://localhost:5432/fairplay_user_db`
- `jdbc:postgresql://localhost:5432/fairplay_venue_db`

Recommended environment variables before starting the backend:

```powershell
$env:USER_DB_URL="jdbc:postgresql://localhost:5432/fairplay_user_db"
$env:USER_DB_USERNAME="postgres"
$env:USER_DB_PASSWORD="your-password"
$env:VENUE_DB_URL="jdbc:postgresql://localhost:5432/fairplay_venue_db"
$env:VENUE_DB_USERNAME="postgres"
$env:VENUE_DB_PASSWORD="your-password"
$env:EUREKA_SERVER_URL="http://localhost:8761/eureka"
```

Note: the checked-in `application.properties` files contain local default passwords. Override them with environment variables instead of relying on those defaults.

## Running the Backend

Open a terminal in `FairPlay_Backend/fairplay`.

### Option 1: run services individually

```powershell
./mvnw -pl eureka-server spring-boot:run
./mvnw -pl user-service spring-boot:run
./mvnw -pl venue-service spring-boot:run
./mvnw -pl api-gateway spring-boot:run
```

Start them in this order:

1. `eureka-server`
2. `user-service`
3. `venue-service`
4. `api-gateway`

### Option 2: run tests

```powershell
./mvnw test
```

## Running the Frontend

Open a terminal in `FairPlay_Frontend/fairplay`.

Install dependencies:

```powershell
npm install
```

Start the Angular dev server:

```powershell
npm start
```

The app will be available at `http://localhost:4200`.

The Angular dev server uses `proxy.conf.json` to forward `/users`, `/activities`, `/venues`, `/bookings`, and `/owners` to the API gateway on port `8083`.

## Frontend Commands

```powershell
npm start
npm run build
npm test
```

## Deploying on Render

This repo now includes a root `render.yaml` that provisions:

- `fairplay-eureka` as a private service
- `fairplay-user-service` as a private service
- `fairplay-venue-service` as a private service
- `fairplay-api-gateway` as a private service
- `fairplay-frontend` as the public web app

The frontend is served by Nginx and proxies `/users`, `/activities`, `/venues`, `/bookings`, and `/owners` to the private API gateway over Render's internal network.

Before the first deploy, provide these Render environment variables when prompted:

```text
USER_DB_URL=jdbc:postgresql://<your-neon-host>/<fairplay_user_db>?sslmode=require
USER_DB_USERNAME=<your-neon-username>
USER_DB_PASSWORD=<your-neon-password>
VENUE_DB_URL=jdbc:postgresql://<your-neon-host>/<fairplay_venue_db>?sslmode=require
VENUE_DB_USERNAME=<your-neon-username>
VENUE_DB_PASSWORD=<your-neon-password>
```

Deploy flow:

1. Push this repo to GitHub.
2. In Render, create a new Blueprint and point it at the repo.
3. Render will read `render.yaml` and create all five services.
4. Enter the Neon credentials for the `USER_DB_*` and `VENUE_DB_*` variables.
5. After deploy completes, open the `fairplay-frontend` service URL.

Note: the backend services are configured for Render private networking, so only the frontend is exposed publicly by default.
