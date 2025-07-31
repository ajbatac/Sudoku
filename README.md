# Sudoku

A modern Sudoku web application built with React, Vite, and Vike, featuring a clean and responsive UI styled with Tailwind CSS. This project is designed for high performance and a seamless user experience, leveraging server-side rendering (SSR) and a fast development environment.

## Table of Contents

- [Project Overview](#project-overview)
- [File Structure](#file-structure)
- [Dependencies](#dependencies)
  - [Production Dependencies](#production-dependencies)
  - [Development Dependencies](#development-dependencies)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running in Development Mode](#running-in-development-mode)
  - [Building for Production](#building-for-production)
  - [Previewing the Production Build](#previewing-the-production-build)
- [Docker Setup](#docker-setup)
  - [Development Environment](#development-environment)
  - [Production Environment](#production-environment)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)
- [Author](#author)

## Project Overview

This Sudoku application is a single-page application (SPA) built with a modern JavaScript stack. It uses Vike for file-based routing and server-side rendering, providing fast page loads and a smooth user experience. The UI is built with React and styled with Tailwind CSS for a clean and responsive design.

## File Structure

The project is organized into the following directory structure:

```
/
├── .gitignore
├── bun.lock
├── netlify.toml
├── package.json
├── tsconfig.json
├── vite.config.ts
├── src/
│   ├── layouts/
│   │   └── tailwind.css
│   └── pages/
│       ├── +config.ts
│       └── index/
│           └── +Page.jsx
├── Dockerfile.dev
├── Dockerfile.prod
├── CHANGELOG.md
└── README.md
```

- **`src/`**: Contains the main source code for the application.
  - **`layouts/`**: Contains shared layout components and styles.
    - **`tailwind.css`**: The main stylesheet for Tailwind CSS.
  - **`pages/`**: Contains the application's pages.
    - **`+config.ts`**: Vike configuration file for pages.
    - **`index/`**: Contains the files for the index page.
      - **`+Page.jsx`**: The main React component for the index page.
- **`vite.config.ts`**: Configuration file for Vite.
- **`package.json`**: Lists the project's dependencies and scripts.
- **`Dockerfile.dev`**: Docker configuration for the development environment.
- **`Dockerfile.prod`**: Docker configuration for the production environment.
- **`CHANGELOG.md`**: A log of all notable changes to the project.
- **`README.md`**: This file, providing an overview of the project.

## Dependencies

### Production Dependencies

| Package             | Version   | Description                               |
| ------------------- | --------- | ----------------------------------------- |
| `vike`              | `^0.4.228`| A Vite-based framework for building web apps. |
| `@vitejs/plugin-react`| `^4.3.4`  | Vite plugin for React.                    |
| `react`             | `^19.1.0` | A JavaScript library for building user interfaces. |
| `react-dom`         | `^19.1.0` | Serves as the entry point to the DOM and server renderers for React. |
| `vike-react`        | `^0.6.1`  | Vike plugin for React.                    |

### Development Dependencies

| Package             | Version   | Description                               |
| ------------------- | --------- | ----------------------------------------- |
| `typescript`        | `^5.8.3`  | A typed superset of JavaScript that compiles to plain JavaScript. |
| `vite`              | `^6.2.6`  | A fast build tool and development server. |
| `@types/react`      | `^19.1.1` | TypeScript definitions for React.         |
| `@types/react-dom`  | `^19.1.2` | TypeScript definitions for React DOM.     |
| `tailwindcss`       | `^4.1.3`  | A utility-first CSS framework.            |
| `@tailwindcss/vite` | `^4.1.3`  | Vite plugin for Tailwind CSS.             |
| `wrangler`          | `^3.0.0`  | A command-line tool for Cloudflare Workers. |
| `@types/bun`        | `latest`  | TypeScript definitions for Bun.           |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Bun](https://bun.sh/) (v1.0 or higher)
- [Docker](https://www.docker.com/) (optional, for containerized setup)

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/ajbatac/Sudoku.git
    cd Sudoku
    ```

2.  Install the dependencies:
    ```bash
    bun install
    ```

### Running in Development Mode

To start the development server, run the following command:

```bash
bun run dev
```

The application will be available at `http://localhost:3000`.

### Building for Production

To build the application for production, run the following command:

```bash
bun run build
```

This will create a `dist` directory with the optimized production build.

### Previewing the Production Build

To preview the production build locally, run the following command:

```bash
bun run preview
```

## Docker Setup

### Development Environment

To run the application in a Docker container for development, use `Dockerfile.dev`.

1.  Build the Docker image:
    ```bash
    docker build -t sudoku-dev -f Dockerfile.dev .
    ```

2.  Run the Docker container:
    ```bash
    docker run -p 3000:3000 -v .:/app sudoku-dev
    ```

### Production Environment

To run the application in a Docker container for production, use `Dockerfile.prod`.

1.  Build the Docker image:
    ```bash
    docker build -t sudoku-prod -f Dockerfile.prod .
    ```

2.  Run the Docker container:
    ```bash
    docker run -p 3000:3000 sudoku-prod
    ```

## Deployment

The application can be deployed to any platform that supports Node.js or Docker. For example, to deploy to Cloudflare Pages, you can use the `wrangler` CLI:

```bash
bun run deploy
```

## Troubleshooting

-   **`bun install` fails**: Ensure you have the latest version of Bun installed.
-   **Tailwind CSS classes not applying**: Make sure the `@tailwindcss/vite` plugin is correctly configured in `vite.config.ts`.

## Best Practices

-   Keep components small and focused on a single responsibility.
-   Use descriptive names for variables and functions.
-   Write comments for complex logic.

## Author

Created with ❤️ by AJ Batac (@ajbatac) - v1.0.0
