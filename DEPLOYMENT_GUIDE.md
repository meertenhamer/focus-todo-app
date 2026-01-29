# 📋 Stap-voor-stap: Deploy naar Vercel

## 🎯 Wat je nodig hebt
- Een GitHub account (gratis)
- 10 minuten van je tijd

---

## 📝 Stappen

### Stap 1: GitHub Account
1. Ga naar [github.com](https://github.com)
2. Klik "Sign up" rechtsboven
3. Maak een gratis account
4. Verifieer je email

### Stap 2: Nieuwe Repository maken
1. Klik op het **"+"** icoon rechtsboven in GitHub
2. Kies **"New repository"**
3. Vul in:
   - Repository name: `focus-todo-app`
   - Description: "Mijn persoonlijke todo app"
   - Kies **Public** (of Private, beide werken)
4. Klik **"Create repository"**

### Stap 3: Bestanden uploaden
Je hebt nu een lege repository. Tijd om je app erin te zetten!

**Optie A - Via Browser (Makkelijkst):**
1. Pak alle bestanden uit de `focus-todo-app` map
2. Sleep ze naar je browser in GitHub
3. Scroll naar beneden
4. Klik **"Commit changes"**

**Optie B - Via ZIP:**
1. Download [GitHub Desktop](https://desktop.github.com)
2. Clone je repository
3. Kopieer alle bestanden uit `focus-todo-app` naar de repository map
4. Commit en push in GitHub Desktop

### Stap 4: Vercel koppelen
1. Ga terug naar [vercel.com](https://vercel.com) (het scherm dat je liet zien)
2. Klik op **"Continue with GitHub"** (zwarte knop)
3. Geef Vercel toegang tot je GitHub
4. Selecteer je **`focus-todo-app`** repository
5. Laat alle instellingen standaard
6. Klik **"Deploy"**

### Stap 5: Wachten...
Vercel bouwt nu je app. Dit duurt 1-2 minuten.

Je ziet:
- ⏳ Building... (gele status)
- ✅ Ready! (groene status)

### Stap 6: Je app is live! 🎉
Je krijgt een URL zoals:
```
https://focus-todo-app.vercel.app
```

Of met je eigen naam:
```
https://focus-todo-app-jouw-naam.vercel.app
```

---

## 📱 Op je iPhone installeren

1. **Open Safari** op je iPhone
2. Ga naar je Vercel URL
3. Tik op het **"Deel"** icoon (□↑) onderaan
4. Scroll naar beneden
5. Tik op **"Zet op beginscherm"**
6. Geef het een naam: "Focus"
7. Tik **"Voeg toe"**

✅ De app staat nu op je home screen als een echte app!

---

## 💻 Op je Laptop gebruiken

Gewoon de URL openen in je browser:
- Chrome: Voeg toe aan bladwijzers
- Safari: Voeg toe aan favorieten
- Edge: Pin aan taakbalk

---

## 🔄 Later updates maken

Als je iets wilt veranderen:

1. Bewerk bestanden in GitHub (online editor)
2. Of gebruik GitHub Desktop
3. Commit je changes
4. Vercel deployed **automatisch**! 🚀

Binnen 1 minuut zie je je wijzigingen online!

---

## ❓ Problemen?

### "Build failed"
- Check of alle bestanden goed zijn geüpload
- Zorg dat `package.json` in de root staat

### "App doet het niet op iPhone"
- Gebruik Safari (niet Chrome!)
- Check of je HTTPS gebruikt (vercel doet dit automatisch)

### "Ik zie een witte pagina"
- Open browser console (F12)
- Stuur me de error die je ziet

---

## 🎊 Klaar!

Je hebt nu:
- ✅ Een online todo-app
- ✅ Toegankelijk vanaf overal
- ✅ iPhone app icoon
- ✅ Automatische updates via GitHub

**Geniet van je nieuwe productiviteits-tool!** 🚀

---

*Heb je vragen? Laat het weten!*
