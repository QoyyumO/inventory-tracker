# Inventory Tracker

## Overview

The Inventory Tracker is a web application that allows users to manage their inventory efficiently. Users can create and manage inventory items, categorize them, and track their quantities and expiry dates. This application is built using Next.js, Material-UI (MUI), Firebase, and Groq.

## Features

- User authentication with Firebase
- Real-time inventory updates using Firebase
- Search and filter inventory items by name and category
- Categorization of inventory items
- Responsive design with Material-UI components
- AI for monitoring expired products or low quantity products
- Animated transitions for a smoother user experience

## Tech Stack

- **Frontend:** Next.js, React, Material-UI (MUI)
- **Backend:** Firebase Firestore
- **Authentication:** Firebase
- **AI API:** Groq with LLaMA 3
- **Styling:** CSS-in-JS with Material-UI's styled components
- **State Management:** React hooks (useState, useEffect)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/inventory-tracker.git
   cd inventory-tracker
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a .env file in the root directory and add your Groq API key:
    ```bash
   GROQ_API_KEY=your_api_key_here
   ```
4. Run the development server:
    ```bash
    npm run dev
    ```
5. Open your browser and navigate to http://localhost:3000.
   
## Usage

- **Sign Up / Log In:** Use Firebase for user authentication.
- **Manage Inventory:** Add, edit, or delete inventory items.
- **Search and Filter:** Use the search bar and category filter to find specific items.
- **View Items:** Items will be displayed with their quantity and expiry date.
- **AI Monitoring:** Items that are almost finished or expired will be displayed when the button is pressed.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Acknowledgements

- Next.js
- Material-UI
- Firebase
- Groq
