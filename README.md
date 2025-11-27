# Time Display App

A simple and elegant web application built with React and Vite that displays the current time and date in real-time.

## Features

- Real-time clock that updates every second
- 12-hour time format with AM/PM
- Full date display with day of the week
- Modern glassmorphic UI design
- Gradient background

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm (comes with Node.js)

### Installation

1. Clone the repository (if you haven't already):
```bash
git clone <repository-url>
cd test-web
```

2. Install dependencies:
```bash
npm install
```

## Development

To start the development server:

```bash
npm run dev
```

This will start the Vite development server at `http://localhost:5173/`. The page will automatically reload when you make changes to the source code.

## Build

To create a production build:

```bash
npm run build
```

This will generate optimized static files in the `dist` directory.

## Preview Production Build

To preview the production build locally:

```bash
npm run preview
```

## Project Structure

```
test-web/
├── src/
│   ├── App.jsx          # Main application component
│   ├── App.css          # Application styles
│   ├── main.jsx         # React entry point
│   └── index.css        # Global styles
├── index.html           # HTML entry point
├── vite.config.js       # Vite configuration
└── package.json         # Project dependencies and scripts
```

## Technologies Used

- React 19.2.0
- Vite 7.2.4
- JavaScript (ES6+)