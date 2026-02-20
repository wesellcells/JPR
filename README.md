# Robocod Slice (Phaser 3 + Capacitor)

Vertical slice minimale tipo platform anni '90:
- tilemap con collisioni
- player, nemico, pickups
- checkpoint + salvataggio (Capacitor Preferences con fallback localStorage)
- 1 chiave + 1 porta (azione contestuale) per simulare backtracking/missioni

## Avvio (web)
```bash
npm install
npm run dev
```

## Build web
```bash
npm run build
npm run preview
```

## Capacitor
```bash
npm run build
npx cap add android
npx cap add ios
npx cap sync
```

Note:
- per test rapido su desktop: frecce + SPACE (azione); R resetta il salvataggio.
- su mobile: touch zones (sinistra/destra/jump/action).
