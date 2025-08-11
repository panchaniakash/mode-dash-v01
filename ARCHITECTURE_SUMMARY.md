# Architecture Summary

This document provides a high-level overview of the production dashboard application.

## 1. Core Technologies

*   **Backend:** Node.js with Express.js framework.
*   **Frontend:** HTML, CSS, JavaScript (jQuery, ApexCharts).
*   **Database:** Microsoft SQL Server (MSSQL).
*   **Runtime:** Node.js.

## 2. System Overview

The application is a single-page dashboard designed for data visualization. It consists of a Node.js backend that serves a static HTML page and provides a set of API endpoints to fetch data from an MSSQL database. The frontend is responsible for rendering the dashboard layout, charts, and widgets based on the data retrieved from the backend.

### Major Modules:

*   **`server.js`**: The main entry point of the application. It sets up the Express server, serves static files, and defines the main routes.
*   **`routes/index.js`**: Contains all the API endpoint definitions. This module is responsible for handling all database interactions.
*   **`views/indexChairmanDaily.html`**: The main HTML file for the dashboard. It includes all the necessary CSS and JavaScript libraries.
*   **`public/js/indexChairmanDaily.js`**: The core frontend JavaScript file. It contains the logic for making API calls, handling user interactions, and rendering the charts and widgets using ApexCharts.

## 3. Critical Endpoints

The following endpoints are critical to the dashboard's performance, as they are responsible for loading the layout and data for the visualizations:

*   **`POST /index/loadPageGridDaily`**: Fetches the HTML structure for the dashboard grid.
*   **`POST /index/loadSetCharts`**: Retrieves the configuration and metadata for all charts on the current page.
*   **`POST /index/loadSetWidgets`**: Retrieves the configuration and metadata for all widgets.
*   **`POST /index/getLinearChartDataAPI`**: Fetches data for line, bar, and column charts. This is called for each chart individually.
*   **`POST /index/getPercentChartDataAPI`**: Fetches data for percentage-based charts.
*   **`POST /index/getPrevMonthDataAPI`**: Fetches data for the "Previous Month Comparison" widget.
*   **`POST /index/getAvgMaxMinRangeWidgetAPI`**: Fetches data for the "Avg Max Min Range" widget.
*   **Filter Endpoints**: `getVertical`, `getBusiness`, `getSite`, `getYearsFromSecAuto`, `getMonthFromSecAuto` are called to populate the filter dropdowns.

## 4. Dependencies

*   **Backend:** `express`, `mssql`, `dotenv`, `cors`.
*   **Frontend:** `jquery`, `bootstrap`, `sweetalert2`, `select2`, `leaflet`, `apexcharts`.

## 5. Key Performance Concerns

*   **Database Connection Management:** A new database connection is established for every API request, which is a major performance bottleneck.
*   **Sequential API Calls:** The frontend makes a series of dependent API calls (a "waterfall"), which slows down the initial page load.
*   **Complex SQL Queries:** Many of the SQL queries are complex and may be inefficient.
*   **Lack of Caching:** There is no caching mechanism in place, either on the backend or the frontend.
