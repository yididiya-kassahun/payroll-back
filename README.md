# Kerchanshe Payroll System - Backend

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

This repository contains the backend API for the Kerchanshe Payroll System. The backend is built using Node.js, Express.js, PostgreSQL, and Sequelize, providing a robust and secure foundation for managing employee data and processing payroll calculations according to Ethiopian labor laws and tax regulations.

## Features

*   **Employee Management:**
    *   Create, read, update, and delete employee records.
*   **Payroll Calculation:**
    *   Accurately calculates gross earnings, taxable income, deductions (income tax, pension, loan), and net pay.
    *   Implements Ethiopian progressive income tax brackets.
*   **Overtime Management:**
    *   Handles overtime calculations based on various rates (normal, night, weekend, holiday).
*   **Loan Management:**
    *   Manages employee loans and monthly deductions.
*   **Reporting:**
    *   Generates payroll reports in JSON format for use by the frontend.
*   **Authentication:**
    *   Secure user authentication using JWT (JSON Web Tokens).
    *   Password hashing with bcryptjs.
*   **Authorization:**
    *Role based Permissions

## Technology Stack

*   **Node.js:** JavaScript runtime environment
*   **Express.js:** Web application framework
*   **PostgreSQL:** Relational database
*   **Sequelize:** Object-Relational Mapper (ORM)
*   **jsonwebtoken:** For authentication (JWT)
*   **bcryptjs:** For password hashing
*   **cors:** Middleware for enabling Cross-Origin Resource Sharing

## Prerequisites

Before you begin, ensure you have the following installed:

*   Node.js (version 16 or higher)
*   npm (Node Package Manager) or yarn
*   PostgreSQL

## Installation

1.  **Clone the repository:**

    ```bash
    git clone <repository_url>
    cd kerchanshe-payroll-backend
    ```

2.  **Install dependencies:**

    ```bash
    npm install  # or yarn install
    ```

3.  **Configure the database:**

    *   Create a PostgreSQL database for the project.
    *   Update the database connection details in `config/config.json` with your PostgreSQL credentials.

4.  **Set Environment Variables:**
 * Create a `.env` file and assign necessary credentias

5.  **Run migrations:**

    ```bash
    npx sequelize db:migrate
    ```

6.  **(Optional) Seed the database:**

    ```bash
    npx sequelize db:seed:all
    ```

## Usage

1.  **Start the server:**

    ```bash
    npm start  # or nodemon start if you have nodemon installed
    ```

2.  **Access the API:**

    The API will be accessible at `http://localhost:4000/api-docs`

## API Endpoints

Here's a brief overview of the available API endpoints:

*   `/api/employees`:
    *   `GET`: Get all employees
    *   `GET/:employee_tin`: Get a specific employee by TIN
    *   `POST`: Create a new employee
    *   `PUT/:employee_tin`: Update an existing employee
    *   `DELETE/:employee_tin`: Delete an employee
*   `/api/payroll`:
    *   `GET`: Get all payroll records
    *   `POST`: Process payroll for an employee
*   `/api/reports`:
    *   `GET/payroll`: Generate payroll report (returns JSON data)
*   `/api/auth`:
    *   `POST/login`: Authenticate user and generate JWT

See `routes/` directory for code with more information

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. After successful login, the server returns a JWT that must be included in the `Authorization` header of subsequent requests.

## Environment Variables

The following environment variables are required:

*   `NODE_ENV`:  `development` or `production`
*   `DB_HOST`:  Database host (e.g., `localhost`)
*   `DB_USER`:  Database username
*   `DB_PASSWORD`: Database password
*   `DB_NAME`:  Database name
*  `JWT_SECRET_KEY`: Add the secret key for Json web token
## Security

*The Backend uses many security properties for all enpoints, such as:
*   **Authentication** With JWT;
*   **Role Based Permissions**
*   **Limiter Request, for dos**
*   **Data Safe**

## Contributing

Contributions are welcome! Please follow these steps:

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix.
3.  Make your changes and commit them with descriptive messages.
4.  Submit a pull request.

## License

This project is licensed under the MIT License - see the `LICENSE` file for details.
I hope this is used correctly for you!
This project should include in your readme how to configure the local database and how to test the application
Let me know for any problems or changes!
All for you!
Congratulations for finishing the app, what ever you want to create in future you already have the skill