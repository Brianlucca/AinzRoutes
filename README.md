# AinzRoutes

Frontend for **AinzRoutes**, a web platform focused on network diagnostics, service monitoring, observability, and technical utility tools in a single interface.

The project centralizes useful tools for operational and infrastructure analysis, including:

- general dashboard with charts and metrics
- IP and domain inspection
- IPv6 diagnostics
- port scanning
- MTR visualization
- service monitoring
- backend-powered web terminal
- IPv4 calculator

## What This Project Is

AinzRoutes is a **React + TypeScript + Vite** frontend styled with **Tailwind CSS**. It consumes the AinzRoutes backend API and organizes technical responses into a cleaner, visual workflow for real-world usage.

The interface was designed to support:

- fast data reading
- technical workflows with low friction
- status, risk, and connectivity visualization
- desktop and mobile usage

## How The Frontend Works

The frontend is responsible for:

- rendering the main views and sidebar navigation
- calling backend API endpoints
- transforming technical responses into cards, charts, tables, and modals
- storing lightweight browser-side preferences such as recent searches and local alerts
- refreshing monitoring areas automatically when needed

In most features, the browser works as the interface layer while the backend performs the actual technical checks and returns the results.

### General Flow

1. the user opens a tool from the sidebar
2. the frontend calls the matching API endpoint
3. the response is processed and rendered visually
4. some views refresh data automatically, especially monitoring-related screens
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

This view combines:

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

## External Services Used By The Frontend

The frontend itself uses **ipify** for browser-side public IP and connectivity checks in the IPv6 diagnostics screen.

Current endpoints used on the client side:

- `https://api4.ipify.org?format=json`
- `https://api6.ipify.org?format=json`
- `https://api64.ipify.org?format=json`

Purpose:

- detect public IPv4
- detect public IPv6
- verify dual-stack behavior from the browser session

The frontend does **not** document backend-only providers here. Services such as IP geolocation providers used exclusively by the backend should remain documented in the backend project instead.

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

## Author

Developed by **Brian Lucca**.

## Project Name

The current official name of the frontend and platform is:

**AinzRoutes**
