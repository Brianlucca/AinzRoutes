# AinzRoutes

Frontend for **AinzRoutes**, a web platform focused on network diagnostics, service monitoring, observability, and technical utility tools in a single interface.

The project was built to centralize useful tools for operational and infrastructure analysis, including:

- general dashboard with charts and metrics
- IP and domain inspection
- IPv6 diagnostics
- port scanning
- MTR visualization
- service monitoring
- backend-powered web terminal
- IPv4 calculator

## What This Project Is

AinzRoutes is a **React + TypeScript + Vite** frontend styled with **Tailwind CSS**. It consumes a backend API responsible for network checks, technical queries, service monitoring, and controlled command execution.

The frontend organizes those backend capabilities into a visual, user-friendly experience focused on:

- fast data reading
- clear technical workflows
- status, risk, and connectivity visualization
- responsive usage across desktop and mobile

## How The Frontend Works

The frontend is responsible for:

- rendering the main views and navigation
- calling backend API endpoints
- transforming technical responses into cards, charts, tables, and modals
- storing lightweight browser-side preferences such as recent searches and local alerts
- refreshing monitoring areas automatically when needed

It does **not** perform every deep technical operation by itself. In most features, the browser acts as the interface layer while the backend performs the actual checks and returns the results.

### General Flow

1. the user opens a tool from the sidebar
2. the frontend calls the matching API endpoint
3. the response is processed and rendered visually
4. in some areas, such as monitoring, the frontend refreshes the data periodically
5. in specific features, the browser also performs real client-side checks, such as part of the IPv6 diagnostics flow

## Main Views

### General Dashboard

Displays a visual summary of the monitored environment with charts and metrics for:

- service status
- category distribution
- monitoring methods
- monitored ports
- resolved addresses
- latency

### IP / Domain Inspector

Provides IP or domain analysis data such as:

- geolocation
- ASN
- organization
- connection type
- reputation
- blacklist checks

### IPv6 Diagnostick

Runs real browser-side connectivity checks to verify:

- IPv4 access
- IPv6 access
- dual-stack behavior
- compatibility score from `0 to 10`

This screen combines:

- tests executed directly from the browser session
- complementary data returned by the backend API

### Port Scanner

Allows users to verify:

- open ports
- user-defined port lists
- target response
- SSL-related details when available

### MTR Visualizer

Organizes route and hop data visually, helping users read:

- packet loss
- latency
- hop sequence
- geographic enrichment when available

### Service Monitoring

Monitoring screen with:

- official and public services
- per-service history
- trend chart
- details modal
- custom monitoring
- local browser notifications

### Web Terminal

Visual interface for backend-controlled commands, designed for technical workflows inside the scope of the application.

### IPv4 Calculator

Visual tool for:

- subnet calculation
- usable host range
- broadcast address
- subnet mask
- subnet planning

### Terms Of Use

Institutional page explaining:

- the project purpose
- usage policy
- lack of sensitive data storage
- project authorship

## Frontend Structure

Main `src` structure:

```txt
src/
  components/
    dashboard/
    ip-analyzer/
    ipv4/
    layout/
    mtr/
    network/
    scanner/
    services/
    ui/
  config/
  services/
  utils/
  views/
  App.tsx
  main.tsx
```

### Organization

- `views/`: main application screens
- `components/`: reusable UI and feature-specific components
- `services/`: API communication layer
- `config/`: navigation and UI configuration
- `utils/`: shared helpers and calculation logic

## Tech Stack

- `React`
- `TypeScript`
- `Vite`
- `Tailwind CSS`
- `Leaflet`
- `React Leaflet`
- `Lucide React`

## Requirements

To run the frontend locally, you need:

- `Node.js`
- `npm`
- the AinzRoutes backend available

## Running The Frontend

### 1. Install dependencies

```bash
npm install
```

### 2. Configure the backend URL

Create a local `.env` file based on `.env.example`:

```env
VITE_API_BASE_URL=http://localhost:3333/api
```

### 3. Start development mode

```bash
npm run dev
```

### 4. Build for production

```bash
npm run build
```

### 5. Preview the production build

```bash
npm run preview
```

## Backend Communication

The frontend reads the backend base URL from the Vite environment variable below:

```env
VITE_API_BASE_URL=http://localhost:3333/api
```

You can configure it in:

- `.env` for local development
- `.env.example` as a reference template
- Vercel environment variables for production

The frontend uses that API layer for:

- session IP information
- network diagnostics
- IP analysis
- port scanning
- MTR enrichment
- terminal responses
- service monitoring data

### Example For Vercel

Set this in your Vercel project:

```env
VITE_API_BASE_URL=https://your-backend-domain.com/api
```

## Browser Storage

The frontend uses browser-side storage only for lightweight UX features, such as:

- recent searches
- custom monitors
- service alert preferences
- local service chart history

This data stays in the user browser and is used only for local interface persistence.

## Technical Notes

- some features depend on the backend running the latest version
- certain detections, such as the user's exact DNS resolver, have natural browser limitations
- the IPv6 diagnostics screen combines real session-based tests with backend-assisted data
- monitoring notifications depend on browser permission

## Available Scripts

- `npm run dev`: starts the frontend in development mode
- `npm run build`: generates the production build
- `npm run preview`: serves the local production build
- `npm run lint`: runs lint checks


## Author

Developed by **Brian Lucca**.

## Project Name

The current official name of the frontend and platform is:

**AinzRoutes**
