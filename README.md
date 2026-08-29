# Smart Waste Collection Planner

An administrative management portal and smart routing optimizer for municipal waste collection systems. Built with React, TypeScript, and Vite.

## Table of Contents
- [Features](#features)
- [Dependencies](#dependencies)
- [Installation](#installation)
- [Build](#build)
- [Run](#run)
- [Usage](#usage)

---

## Features
- **Roster & Schedule Management**: Create and configure operator dispatches and collection schedules.
- **Vessel Fleet Management**: Track truck capacities, active load percentages, and vehicle profiles.
- **TSP Routing Solvers**:
  - **Greedy Solver**: Local search algorithm to quickly minimize route travel.
  - **Genetic Algorithm**: Comprehensive TSP solver using elitism, crossovers, and mutations.
  - **Simulated Annealing**: Temperature scheduling heuristic solver.
- **Advanced Forecasting**:
  - **Holt-Winters Smoothing**: Double and Triple exponential smoothing for seasonal waste trends.
  - **Neural Network Forecaster**: Multi-layer perceptron (MLP) trained locally to forecast waste generation.
- **Export Capabilities**: Clean CSV exports and PDF summary sheets using `jsPDF`.

---

## Dependencies
This application runs on **Node.js (v18+)** and utilizes the following major libraries:
- **React 18** & **Vite**
- **Recharts** (Visualizations)
- **jsPDF** (PDF exports)
- **Vitest** (Unit testing framework)

---

## Installation
1. Clone the repository or extract the archive.
2. Open your terminal in the project directory.
3. Install package dependencies:
   ```bash
   npm install
   ```

---

## Build
To bundle the project assets for production deployment:
```bash
npm run build
```
The output assets will be generated in the `dist/` directory.

---

## Run
To run the local development server:
```bash
npm run dev
```
The application will host on **`http://localhost:3000/`** (or `3001` if port 3000 is occupied).

---

## Usage
Log in using one of the following mock operator profiles:
- **Admin**: `admin` / `admin123`
- **Operator**: `operator` / `operator123`
- **Driver**: `driver` / `driver123`
