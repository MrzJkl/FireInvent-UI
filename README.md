# FireInvent UI

FireInvent UI ist eine moderne Webanwendung zur Verwaltung von Inventar für Feuerwehren. Die Anwendung ermöglicht die Verwaltung von Produkten, Varianten, Einzelgegenständen (Items), Personen, Abteilungen und Wartungen.

## Features

- **Produktverwaltung**: Anlegen und Verwalten von Produkten mit Produkttypen
- **Variantenverwaltung**: Produktvarianten mit zusätzlichen Spezifikationen
- **Gegenstandsverwaltung**: Tracking einzelner Gegenstände mit Zustand, Kaufdatum und Standort
- **Personenzuordnung**: Zuweisung von Gegenständen an Personen mit Historisierung
- **Wartungsverwaltung**: Dokumentation von Wartungen und Prüfungen
- **Mehrsprachigkeit**: Unterstützung für Deutsch und Englisch
- **Dark Mode**: Automatische Anpassung an Systemeinstellungen

## Rollen & Berechtigungen

Die Rollen werden aus dem Keycloak-Token (Feld `roles` bzw. `realm_access.roles`) gelesen. Der UI-Zugriff richtet sich danach:

- **admin**: Vollzugriff auf alle Bereiche inkl. API-Integrationen und Benutzerliste
- **procurement**: Anlegen/Bearbeiten in allen Fachbereichen außer API-Integrationen und Benutzer
- **maintenance**: Lesezugriff überall; Wartungen dürfen angelegt/bearbeitet werden, sonst nur Lesen; API-Integrationen werden ausgeblendet
- **ohne Rolle** (nur `default-roles-fireinvent`): Reiner Lesezugriff in allen Bereichen

Navigation und Aktions-Buttons werden entsprechend ein- bzw. ausgeblendet. Geschützte Routen (z. B. API-Integrationen, Benutzer) sind nur für Admins erreichbar.

## Technologie-Stack

- **React 19** mit TypeScript
- **Vite** als Build-Tool
- **Tailwind CSS** für Styling
- **Radix UI** / **shadcn/ui** für UI-Komponenten
- **React Router** für Navigation
- **Keycloak** für Authentifizierung
- **i18next** für Internationalisierung

## Voraussetzungen

- Node.js 18 oder höher
- npm oder pnpm
- Zugang zu einer FireInvent API-Instanz
- Zugang zu einer Keycloak-Instanz

## Installation

```bash
# Dependencies installieren
pnpm install

# Entwicklungsserver starten
pnpm run dev
```

## Konfiguration

Die Anwendung wird über Umgebungsvariablen konfiguriert. Kopiere `.env.example` zu `.env.local` und passe die Werte an:

```bash
cp .env.example .env.local
```

### Umgebungsvariablen

| Variable                  | Beschreibung                 | Standardwert             |
| ------------------------- | ---------------------------- | ------------------------ |
| `VITE_API_BASE_URL`       | Basis-URL der FireInvent API | `https://localhost:7197` |
| `VITE_KEYCLOAK_URL`       | URL des Keycloak-Servers     | `http://localhost:8080`  |
| `VITE_KEYCLOAK_REALM`     | Keycloak Realm               | `fireinvent`             |
| `VITE_KEYCLOAK_CLIENT_ID` | Keycloak Client ID           | `fireinvent-spa`         |

## Skripte

| Befehl                | Beschreibung                          |
| --------------------- | ------------------------------------- |
| `pnpm run dev`        | Startet den Entwicklungsserver        |
| `pnpm run build`      | Erstellt einen Production-Build       |
| `pnpm run preview`    | Vorschau des Production-Builds        |
| `pnpm run lint`       | Führt ESLint aus                      |
| `pnpm run openapi-ts` | Generiert API-Client aus OpenAPI-Spec |

## Production Deployment

### Docker

Die empfohlene Methode für das Deployment ist Docker. Das Repository enthält einen GitHub Actions Workflow, der automatisch ein Docker-Image erstellt.

```bash
# Image bauen
docker build -t fireinvent-ui .

# Container starten
docker run -p 80:80 \
  -e VITE_API_BASE_URL=https://api.example.com \
  -e VITE_KEYCLOAK_URL=https://auth.example.com \
  -e VITE_KEYCLOAK_REALM=fireinvent \
  -e VITE_KEYCLOAK_CLIENT_ID=fireinvent-spa \
  fireinvent-ui
```

### Manuelles Deployment

1. Build erstellen:

   ```bash
   npm run build
   ```

2. Den Inhalt des `dist`-Verzeichnisses auf einen Webserver kopieren (nginx, Apache, etc.)

3. Server so konfigurieren, dass alle Anfragen auf `index.html` umgeleitet werden (SPA-Routing)

### nginx Konfiguration (Beispiel)

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## API-Client Generierung

Der API-Client wird aus der OpenAPI-Spezifikation (`swagger.json`) generiert:

```bash
# Swagger-Datei aktualisieren und Client neu generieren
npm run openapi-ts
```

## Lizenz

Dieses Projekt steht unter der MIT-Lizenz. Siehe [LICENSE](LICENSE) für Details.
