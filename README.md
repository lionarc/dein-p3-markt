# dein-p3-markt

Ein webbasiertes Einkaufsspiel, bei dem Spieler QR-Codes finden und scannen können, um Produkte zu ihrem Warenkorb hinzuzufügen.

## 🎮 Features

- **QR-Code Scanner**: Spieler können QR-Codes scannen, um Produkte zu finden
- **Warenkorb (Shopping Cart)**: Gescannte Produkte werden automatisch zum Warenkorb hinzugefügt
- **Produktliste**: Alle verfügbaren Produkte werden angezeigt
- **Admin-Panel**: Administratoren können neue Produkte mit einem Admin-Schlüssel erstellen
- **Keine Anmeldung erforderlich**: Spieler brauchen keine Konten oder Authentifizierung
- **Öffentliche Produkte**: Alle Produkte sind für jeden sichtbar

## 🛠️ Tech Stack

- **Frontend**: Vite + React + TypeScript
- **Backend**: Firebase Spark (kostenloser Plan)
  - Firestore (Datenbank)
  - Firebase Storage (Bildspeicher)
  - Firebase Hosting (Deployment)
- **QR-Scanner**: html5-qrcode

## 🚀 Installation und Setup

### Voraussetzungen

- Node.js (v20.19.0 oder höher)
- npm oder yarn
- Firebase-Konto (kostenlos)

### 1. Repository klonen

```bash
git clone <repository-url>
cd dein-p3-markt
```

### 2. Abhängigkeiten installieren

```bash
npm install
```

### 3. Firebase-Projekt erstellen

1. Gehen Sie zu [Firebase Console](https://console.firebase.google.com/)
2. Erstellen Sie ein neues Projekt
3. Aktivieren Sie Firestore Database
4. Aktivieren Sie Firebase Storage
5. Aktivieren Sie Firebase Hosting

### 4. Firebase-Konfiguration

1. Kopieren Sie `.env.example` zu `.env`:
   ```bash
   cp .env.example .env
   ```

2. Ersetzen Sie die Werte in `.env` mit Ihren Firebase-Projektdaten:
   - Gehen Sie zu Project Settings > General
   - Unter "Your apps" wählen Sie Web App
   - Kopieren Sie die Firebase-Konfigurationswerte

3. Setzen Sie einen Admin-Schlüssel in `.env`:
   ```
   VITE_ADMIN_KEY=ihr_sicherer_schlüssel
   ```

### 5. Firebase Regeln deployen

Installieren Sie Firebase CLI:
```bash
npm install -g firebase-tools
```

Melden Sie sich an:
```bash
firebase login
```

Initialisieren Sie Firebase (wählen Sie Ihr Projekt):
```bash
firebase init
```

Deployen Sie die Sicherheitsregeln:
```bash
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
```

### 6. Entwicklungsserver starten

```bash
npm run dev
```

Die App läuft nun auf `http://localhost:5173`

## 📦 Deployment

### Build erstellen

```bash
npm run build
```

### Auf Firebase Hosting deployen

```bash
firebase deploy --only hosting
```

## 📱 Verwendung

### Für Spieler

1. **Scanner**: Klicken Sie auf "Scanner" und erlauben Sie Kamerazugriff
2. Scannen Sie QR-Codes von Produkten
3. Produkte werden automatisch zum Warenkorb hinzugefügt
4. **Warenkorb**: Zeigt alle gescannten Produkte mit Mengen und Gesamtpreis
5. **Produkte**: Zeigt alle verfügbaren Produkte (alternativ zum Scannen)

### Für Administratoren

1. Klicken Sie auf "Admin"
2. Geben Sie den Admin-Schlüssel ein (aus `.env`)
3. Füllen Sie das Formular aus:
   - Produktname
   - Beschreibung
   - Preis
   - QR-Code Text (z.B. "PROD-001")
   - Produktbild hochladen
4. Klicken Sie auf "Produkt erstellen"

### QR-Codes erstellen

Um QR-Codes für Produkte zu erstellen:

1. Verwenden Sie einen Online-QR-Generator (z.B. [qr-code-generator.com](https://www.qr-code-generator.com/))
2. Geben Sie den gleichen Text ein, den Sie im Admin-Panel als "QR-Code Text" verwendet haben
3. Drucken Sie die QR-Codes aus und verteilen Sie sie

## 🔧 Projekt-Struktur

```
dein-p3-markt/
├── src/
│   ├── components/          # React-Komponenten
│   │   ├── QRScanner.tsx   # QR-Scanner-Komponente
│   │   ├── ShoppingCart.tsx # Warenkorb-Komponente
│   │   ├── ProductList.tsx  # Produktliste-Komponente
│   │   └── AdminPanel.tsx   # Admin-Panel-Komponente
│   ├── context/            # React Context
│   │   └── CartContext.tsx # Warenkorb State Management
│   ├── services/           # Firebase Services
│   │   └── productService.ts # Produkt-CRUD-Operationen
│   ├── styles/             # CSS-Dateien
│   ├── types.ts            # TypeScript-Typen
│   ├── firebase.ts         # Firebase-Konfiguration
│   ├── App.tsx             # Haupt-App-Komponente
│   └── main.tsx            # Einstiegspunkt
├── public/                 # Statische Dateien
├── firebase.json           # Firebase-Konfiguration
├── firestore.rules         # Firestore-Sicherheitsregeln
├── storage.rules           # Storage-Sicherheitsregeln
└── .env.example            # Beispiel-Umgebungsvariablen
```

## 🔒 Sicherheit

⚠️ **WICHTIG - Nur für Demo/Entwicklungszwecke**

Diese Anwendung wurde als Demo/Prototyp entwickelt und verwendet vereinfachte Sicherheitsmaßnahmen:

- **Admin-Zugriff**: Geschützt durch einen einfachen Admin-Schlüssel (clientseitig, nicht sicher für Produktion)
- **Firestore Rules**: Lesen ist öffentlich, Schreiben ist erlaubt (nur für Demo)
- **Storage Rules**: Lesen ist öffentlich, Schreiben ist erlaubt (nur für Demo)

⚠️ **Für Produktionsumgebungen:**

1. Implementieren Sie Firebase Authentication mit benutzerdefinierten Claims für Admin-Zugriff
2. Aktualisieren Sie Firestore Rules, um Schreibzugriff nur für authentifizierte Admins zu erlauben
3. Aktualisieren Sie Storage Rules, um Uploads nur für authentifizierte Benutzer zu erlauben
4. Verwenden Sie Firebase Security Rules Emulator für Tests
5. Implementieren Sie Rate Limiting und Input Validation
6. Überwachen Sie Firebase Usage und setzen Sie Budgetalarme

**Beispiel für sichere Firestore Rules:**
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null && 
                     request.auth.token.admin == true;
    }
  }
}
```

## 📝 Lizenz

MIT

## 🤝 Contributing

Beiträge sind willkommen! Bitte öffnen Sie ein Issue oder Pull Request.
