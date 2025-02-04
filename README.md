# Windkey - Sicherer Passwort-Manager

Ein moderner, sicherer Passwort-Manager mit Fokus auf Benutzerfreundlichkeit und Sicherheit.

## Features

### Passwort-Management
- Sichere Speicherung von Passwörtern mit Verschlüsselung
- Automatische Passwortgenerierung mit anpassbaren Optionen:
  - Länge (4-128 Zeichen)
  - Großbuchstaben
  - Kleinbuchstaben
  - Zahlen
  - Sonderzeichen
- Passwort-Stärke-Anzeige in Echtzeit
- Kopieren von Passwörtern in die Zwischenablage

### Sicherheitsfunktionen
- Zwei-Faktor-Authentifizierung (2FA)
- Überprüfung auf kompromittierte Passwörter via haveibeenpwned
- Sichere Verschlüsselung aller gespeicherten Daten
- Automatische Abmeldung nach Inaktivität

### Statistiken & Analysen
- Übersichtliche Statistik-Seite mit:
  - Gesamtanzahl der Passwörter
  - Erkennung von Duplikaten
  - Durchschnittliche Passwortlänge
  - Verteilung der Passwort-Stärken
- Detaillierte Ansicht von:
  - Duplikaten (gruppiert)
  - Kompromittierten Passwörtern
  - Schwachen Passwörtern

### Benutzeroberfläche
- Modernes, responsives Design
- Dark Mode
- Intuitive Benutzerführung
- Schnelle Suche und Filterung
- Übersichtliche Kategorisierung

## Installation

### Backend (Python/Flask)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

### Frontend (React)
```bash
cd frontend
npm install
npm start
```

## Technologie-Stack

### Backend
- Python 3.8+
- Flask (Web Framework)
- SQLAlchemy (ORM)
- Cryptography (Verschlüsselung)
- PyOTP (2FA)

### Frontend
- React 18
- Material-UI (UI Framework)
- Axios (HTTP Client)
- React Router

## Sicherheitshinweise
- Alle Passwörter werden verschlüsselt gespeichert
- Die 2FA-Aktivierung wird dringend empfohlen
- Regelmäßige Überprüfung auf kompromittierte Passwörter
- Automatische Abmeldung nach 15 Minuten Inaktivität
- Keine Speicherung von Passwörtern im Klartext

## Entwicklung

### Setup für Entwickler
1. Repository klonen
2. Backend und Frontend Dependencies installieren
3. Entwicklungsserver starten

### Code-Struktur
- `/backend`: Flask-Server und API
- `/frontend`: React-Anwendung
- `/docs`: Dokumentation

## Lizenz
MIT