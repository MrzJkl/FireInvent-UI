# API:

- Externe Artikel-Nummer für Produkt und Variante
- Wenn Artikelnummer von Variante leer ist, dann nimm die vom Produkt
- User Sync geht aktuell nicht
- Jede Ansicht CSV-Export
- Bestellpositionen sollen optional Personen zugeordnet werden

# Features:

- Termine hinterlegen und personen zu Terminen zuordnen. Wann kommt wer. Zu diesem Besuch gibt es Produkte mit Anzahl
  - Bestandsabfrage, ob es Items gibt die aktuell keinem zugeordnet sind
  - Kennzeichen, ob Item ein Musterexemplar ist, soll nicht in Bestandsabfrage auftauchen
  - Beim Besuch wird Variante festgelegt. Wenn Bestand vorhanden ist, wird diese zugeordnet. Dann kann Bestellung ausgelöst werden, um Bestand wieder aufzufüllen. Wenn nicht im Bestand Bestellung mit Personenzuordnung
  - Wenn Bestellung ins Inventar überführt wird, müssen Externe IDs für die Itms vergeben werden (können) und direkt die Personenzuordnung gemacht werden

# UI:

- Bei Wartung anlegen: Durchgeführt von Vorbefüllen mit aktuellem Benutzer
- Token Refresh macht aktuell einen Page reload. Müssen vor dem Request prüfen ob das Token noch gültig ist
- Neuer Abschnitt "Wartung", wo man eine Liste von Items anlegen kann, um für diese dann eine Wartung zu dokumentieren
  - Massenaktion notwendig
- Wartungsvorgänge nach Zeitraum exportieren wegen Abrechnung

# Auth:

- Unterschiedliche Rollen für unterschiedliche Organisationen
- API Integration fehlt Organizations claim
