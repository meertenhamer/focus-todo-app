# Focus - Georganiseerd leven

Een geavanceerde todo-app met workspaces, projecten, PARA secties, subtaken en slimme filters.

## 🚀 Deployen naar Vercel

### Optie 1: Via GitHub (Aanbevolen)

1. **Maak een GitHub account** (als je die nog niet hebt)
   - Ga naar [github.com](https://github.com) en maak een gratis account

2. **Maak een nieuwe repository**
   - Klik op het "+" icoon rechtsbovenaan
   - Kies "New repository"
   - Naam: `focus-todo-app`
   - Maak public of private (beide werken)
   - Klik "Create repository"

3. **Upload deze bestanden**
   - Sleep alle bestanden uit deze map naar je GitHub repository
   - Of gebruik GitHub Desktop voor makkelijker uploaden

4. **Deploy via Vercel**
   - Ga terug naar [vercel.com](https://vercel.com)
   - Klik "Continue with GitHub"
   - Selecteer je `focus-todo-app` repository
   - Klik "Deploy"
   - ✅ Klaar! Je krijgt een URL zoals `focus-todo-app.vercel.app`

### Optie 2: Direct uploaden (Sneller, maar moeilijker te updaten)

1. **Installeer Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login en deploy**
   ```bash
   cd focus-todo-app
   vercel
   ```

3. Volg de instructies op het scherm

### Optie 3: Via Vercel Dashboard (Eenvoudigst voor beginners)

1. **Pak alle bestanden in een ZIP**
   - Selecteer alle bestanden in deze map
   - Maak een ZIP bestand

2. **Upload naar Vercel**
   - Ga naar vercel.com dashboard
   - Sleep de ZIP naar "Import Project"
   - Vercel pakt automatisch uit en deployed

## 📱 Installeren op iPhone

1. Open je Vercel URL in Safari
2. Tik op het "Deel" icoon (vierkant met pijl omhoog)
3. Scroll naar beneden → "Zet op beginscherm"
4. De app staat nu als icoon op je home screen!

## 💻 Lokaal draaien (voor development)

```bash
# Installeer dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173
```

## ✨ Features

- 🏢 **Workspaces**: Persoonlijk, Werk, Florensis (+ custom)
- 📁 **Projecten**: Onbeperkt per workspace
- 📋 **PARA Secties**: Projects, Areas, Resources, Archive
- ✅ **Subtaken**: Meerdere niveaus mogelijk
- 🏷️ **Tags**: #urgent, #belangrijk, etc.
- 📅 **Deadlines**: Natural language ("vandaag 16:00", "morgen")
- 🎯 **Slimme Filters**: Filter op workspace, project, tag, datum
- ⏰ **Tijdfilter**: Automatisch verbergen van werk-taken na 17:00
- 🎨 **Context Menu's**: Rechtermuisklik voor opties
- 📱 **Responsive**: Werkt op desktop & mobiel

## 🔄 Data Opslag

**Let op**: De app slaat data op in browser localStorage. Dit betekent:
- ✅ Data blijft behouden bij herladen
- ❌ Data synchroniseert NIET tussen apparaten
- ❌ Data verdwijnt bij cache wissen

Voor sync tussen apparaten zou je Firebase of Supabase nodig hebben.

## 🛠️ Updates maken

Als je iets wilt aanpassen:

1. Wijzig de code in `src/App.jsx`
2. Test lokaal met `npm run dev`
3. Push naar GitHub (als je optie 1 gebruikt)
4. Vercel deployed automatisch!

## 📞 Support

Vragen? Problemen? Laat het weten!

---

**Gemaakt met ❤️ en Claude**
