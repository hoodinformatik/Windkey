# Windkey Password Manager

A secure and modern password manager with 2FA support, built with Python Flask and React.

## Features

- **Secure Password Storage**: All passwords are encrypted using strong encryption algorithms
- **Two-Factor Authentication**: Enhanced security with 2FA support
- **Password Generator**: Create strong, random passwords
- **Password History**: Track password changes and access history
- **Category Management**: Organize passwords into categories
- **Chrome Extension**: Quick access to your passwords directly in the browser
- **Modern UI**: Clean and intuitive user interface
- **API Access**: RESTful API for easy integration

## Installation

### Backend Setup

1. Create a virtual environment:
```bash
python -m venv venv
```

2. Activate the virtual environment:
- Windows:
```bash
.\venv\Scripts\activate
```
- Linux/Mac:
```bash
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your settings
```

5. Initialize the database:
```bash
cd backend
python migrate_db.py
```

6. Start the backend server:
```bash
python app.py
```

### Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Start the development server:
```bash
npm start
```

### Chrome Extension Setup

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked" and select the `chrome-extension` folder from the project
4. The Windkey extension icon should appear in your browser toolbar

## Chrome Extension Features

- **Quick Access**: Access your passwords directly from any webpage
- **Auto-fill Support**: Automatically fill login forms on websites
- **Password Generator**: Generate secure passwords while creating accounts
- **Secure Copy**: Separately copy usernames and passwords with visual feedback
- **Search**: Quickly find passwords by title, URL, or username
- **Sync**: Keep passwords synchronized with the main application
- **2FA Support**: Same secure two-factor authentication as the main app
- **Long Sessions**: Stay logged in for extended periods

## Security Features

- End-to-end encryption for all sensitive data
- Two-factor authentication (2FA) support
- Secure password hashing
- Session management and token-based authentication
- Regular security audits of password strength
- Protection against brute force attacks
- HTTPS enforcement for all communications

## API Documentation

The backend provides a RESTful API with the following main endpoints:

- `POST /api/login`: Authenticate user
- `POST /api/register`: Create new user account
- `GET /api/passwords`: List all passwords
- `POST /api/passwords`: Create new password
- `PUT /api/passwords/<id>`: Update password
- `DELETE /api/passwords/<id>`: Delete password
- `GET /api/categories`: List all categories
- `POST /api/categories`: Create new category

For detailed API documentation, see [API.md](API.md)

## Development

### Project Structure
```
windkey/
├── backend/           # Flask backend
│   ├── app.py        # Main application file
│   ├── routes.py     # API routes
│   └── models.py     # Database models
├── frontend/         # React frontend
│   ├── src/         # Source files
│   └── public/      # Static files
├── chrome-extension/ # Chrome extension
│   ├── popup.html   # Extension popup
│   ├── popup.js     # Extension logic
│   └── manifest.json # Extension configuration
└── docs/            # Documentation
```

### Contributing

1. Fork the repository
2. Create a new branch for your feature
3. Commit your changes
4. Push to your branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue in the GitHub repository or contact the development team.
