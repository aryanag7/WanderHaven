<p align="center">
  <img src="https://img.icons8.com/fluency/96/000000/cottage.png" alt="WanderHaven Logo"/>
</p>

<h1 align="center">WanderHaven</h1>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#screenshots">Screenshots</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#installation">Installation</a> •
  <a href="#usage">Usage</a> •
  <a href="#contributing">Contributing</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue" alt="Version 1.0.0"/>
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License MIT"/>
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen" alt="PRs Welcome"/>
</p>

<p align="center">
  A modern web application that connects travelers with unique homestay experiences around the world. WanderHaven enables hosts to list their properties and guests to discover and book their perfect accommodations.
</p>

<hr>

## 🎯 Features

- **User Authentication** - Secure signup and login system for both hosts and guests
- **Listing Management** - Hosts can create, update, and delete their home stay listings
- **Advanced Search** - Find properties based on country, category, and other filters
- **Interactive Maps** - Visual representation of property locations using Mapbox
- **Reviews & Ratings** - Guests can leave feedback about their stay experiences
- **Responsive Design** - Optimized for all device sizes from mobile to desktop
- **Image Management** - Cloudinary integration for property photo uploads and storage

## 📸 Snapshots

<details open>
  <summary><b>Homepage</b></summary>
  <p align="center">
    
  </p>
</details>

<details>
  <summary><b>Listing Details</b></summary>
  <p align="center">
    
  </p>
</details>

<details>
  <summary><b>User Authentication</b></summary>
  <p align="center">
    
  </p>
</details>

<details>
  <summary><b>Filtering & Searching</b></summary>
  <p align="center">
    
  </p>
</details>

## 🛠️ Tech Stack

<table>
  <tr>
    <td align="center"><b>Frontend</b></td>
    <td align="center"><b>Backend</b></td>
    <td align="center"><b>Cloud Services</b></td>
  </tr>
  <tr>
    <td>
      <ul>
        <li>HTML5/CSS3</li>
        <li>Bootstrap</li>
        <li>JavaScript</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>Node.js</li>
        <li>Express.js</li>
        <li>MongoDB (Atlas)</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>Cloudinary (Image Storage)</li>
        <li>Mapbox (Location Services)</li>
      </ul>
    </td>
  </tr>
</table>

## 🚀 Installation

### Prerequisites

- Node.js (v14 or higher)
- npm
- MongoDB Atlas account
- Cloudinary account
- Mapbox account

### Setup Steps

1. **Clone the repository**

```bash
git clone https://github.com/aryanag7/WanderHaven.git
cd WanderHaven
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

Create a `.env` file in the root directory with the following variables:

```bash
# Cloudinary Configuration
CLOUD_NAME=your_cloud_name
CLOUD_API_KEY=your_cloud_api_key
CLOUD_API_SECRET=your_cloud_api_secret

# Mapbox Configuration
MAP_TOKEN=your_mapbox_token

# MongoDB Atlas Configuration
ATLASDB_URL=your_mongodb_atlas_url

# Session Secret
SECRET=your_session_secret
```

> **Note:** Never commit your `.env` file to version control. Add it to your `.gitignore` file.

4. **Start the development server**

```bash
npm start
```

The application will be available at `http://localhost:8080`.

## 📖 Usage

1. **Account Creation**
   - Register as a new user or log in with existing credentials
   - Choose your account type (host or guest)

2. **For Hosts**
   - Create new listings with detailed descriptions
   - Upload high-quality images of your property
   - Set your property's location on the interactive map
   - Manage your existing listings

3. **For Guests**
   - Browse available home stays
   - Filter properties by country, category, or other criteria
   - View detailed information about each property
   - Leave reviews and ratings after your stay

## 👥 Contributing

Contributions are always welcome! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add some amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. Open a **Pull Request**

---
