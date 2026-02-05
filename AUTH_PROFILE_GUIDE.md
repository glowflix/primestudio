# Guide d'Authentification et Profil Utilisateur

## 📋 Résumé

L'application Prime Studio intègre un système d'authentification complet avec Supabase incluant:
- **Connexion Email/Mot de passe** - Authentification traditionnelle
- **Connexion Google OAuth** - Authentification sociale
- **Profils Utilisateur** - Gestion complète du compte
- **Galerie Photos Utilisateur** - Upload et gestion des photos
- **Paramètres de Compte** - Modification du profil et mot de passe

---

## 🔐 Authentification

### Page `/auth`

**Nouvelles Fonctionnalités:**
- ✅ Toggle Login/Register avec interface unifiée
- ✅ Affichage/masquage du mot de passe
- ✅ Validation des champs
- ✅ Google OAuth avec icône SVG animée
- ✅ Redirection automatique vers `/profile` si connecté
- ✅ Messages d'erreur et succès formatés
- ✅ Design professionnel avec animations Framer Motion

### Flux d'Authentification

```
Utilisateur → Page /auth
              ↓
      Email + Mot de passe OU Google OAuth
              ↓
      Supabase authentifie
              ↓
      Session créée (dans auth.users)
              ↓
      Redirection vers /profile
```

---

## 👤 Profil Utilisateur

### Page `/profile`

**Trois Onglets Principaux:**

#### 1. **Aperçu (Overview)**
- ✅ Avatar avec initiale du nom
- ✅ Affichage du nom, email, téléphone, bio
- ✅ Modification du profil en mode édition
- ✅ Stats: Nombre de photos, partages, likes
- ✅ Sauvegarde automatique dans Supabase

#### 2. **Galerie (Gallery)**
- ✅ Affichage grille de photos uploadées
- ✅ Image avec lazy loading (next/image)
- ✅ Bouton de partage copiant le lien
- ✅ Message "Aucune photo" avec CTA
- ✅ Animation de chargement

#### 3. **Paramètres (Settings)**
- ✅ Changement de mot de passe (Email uniquement)
- ✅ Affichage/masquage du mot de passe
- ✅ Validation: 6+ caractères, correspondance
- ✅ Info compte: ID, Provider, Date création
- ✅ Statut sécurité pour Google OAuth

### Interactions Principales

```
✎ Modifier → Mode édition → Sauvegarder → user_profiles upsert
🔒 Mot de passe → Formulaire → Confirmation → supabase.auth.updateUser()
📤 Partager photo → Copie URL → Notif "Copié"
🚪 Déconnexion → supabase.auth.signOut() → Redirect /
```

---

## 🗄️ Tables Supabase Requises

### Table: `user_profiles`
```sql
- id (UUID) - PK, Ref: auth.users(id)
- email (TEXT) - Email utilisateur
- full_name (TEXT) - Nom complet
- bio (TEXT) - Bio personnelle
- phone (TEXT) - Numéro téléphone
- avatar_url (TEXT) - URL avatar
- provider (TEXT) - 'email' ou 'google'
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

**RLS Policies:**
- Utilisateur peut LIRE son profil
- Utilisateur peut METTRE À JOUR son profil
- Utilisateur peut INSÉRER son profil

### Table: `user_photos`
```sql
- id (UUID) - PK, Gen UUID
- user_id (UUID) - FK: auth.users(id)
- image_url (TEXT) - URL image
- title (TEXT) - Titre photo
- description (TEXT) - Description
- likes_count (INTEGER) - Nombre de likes
- shares_count (INTEGER) - Nombre de partages
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

**RLS Policies:**
- Utilisateur peut LIRE ses photos
- Utilisateur peut CRÉER ses photos
- Utilisateur peut METTRE À JOUR ses photos
- Utilisateur peut SUPPRIMER ses photos

**Indexes:**
- `idx_user_photos_user_id`
- `idx_user_photos_created_at`

### Setup SQL

Exécutez `SUPABASE_USER_TABLES.sql` dans la console Supabase SQL Editor:
1. Allez sur https://app.supabase.com/
2. Sélectionnez votre projet
3. Ouvrez SQL Editor
4. Collez le contenu de `SUPABASE_USER_TABLES.sql`
5. Exécutez

---

## 📱 Fonctionnalités Principales

### 1. Authentification Google OAuth

**Icône SVG Personnalisée:**
- Affiche le logo Google coloré
- Animation au survol
- Redirection vers Google Consent Screen
- Retour automatique à `/auth/callback`

**Avantage:** 
- Pas de gestion de mot de passe pour l'utilisateur
- Sécurité gérée par Google

### 2. Profil Utilisateur Complet

**Champs Modifiables:**
- Nom complet
- Bio personnelle
- Numéro de téléphone

**Champs Affichage Seul:**
- Email
- Date de création
- Fournisseur auth (Google/Email)

### 3. Galerie Photos

**Gestion Photos:**
- Affichage en grille responsive (3 colonnes)
- Image optimisée avec `next/image`
- Hover effect (zoom)
- Info: titre, description

**Partage Social:**
```
Bouton Partager → Copie URL 
  → Utilisateur partage sur réseaux
  → Lien format: /store?photo=<id>
```

### 4. Sécurité Mot de Passe

**Uniquement pour Email Auth:**
- Changement de mot de passe
- Minimum 6 caractères
- Confirmation requise
- Eye icon pour afficher/masquer
- Validation en temps réel

**Pour Google:**
- Message informatif: gestion par Google
- Pas d'option de changement

---

## 🎨 Design & UX

### Animations
- ✅ Framer Motion pour transitions fluides
- ✅ Stagger animations pour listes
- ✅ Hover effects sur boutons
- ✅ Skeleton loader pendant le chargement
- ✅ Toasts erreur/succès

### Responsivité
- ✅ Mobile-first (320px+)
- ✅ Tablette optimisée (768px+)
- ✅ Desktop full-width (1200px+)
- ✅ Grille photos adaptée (1-3 colonnes)

### Gradients & Couleurs
- Fond: `from-black via-pink-950/20 to-black`
- Accent: `from-pink-500 to-red-500`
- Secondary: `from-blue-500/10 to-cyan-500/10`
- Glass effect: `bg-white/5 border border-white/10`

---

## 🚀 Routes & Navigation

| Route | Type | Description |
|-------|------|-------------|
| `/auth` | Client | Login/Signup avec Email ou Google |
| `/profile` | Client | Profil + Galerie + Paramètres (Auth requis) |
| `/profile?tab=gallery` | Client | Galerie photos utilisateur |
| `/profile?tab=settings` | Client | Paramètres compte & sécurité |
| `/auth/callback` | API | Callback OAuth Google |

---

## 🔄 État Global & Hooks

### useState
- `user` - User Supabase courant
- `profile` - Données profil utilisateur
- `photos` - Array photos utilisateur
- `activeTab` - Onglet actif ('overview' | 'gallery' | 'settings')
- `isEditMode` - Mode édition profil
- `showPasswordForm` - Afficher formulaire mot de passe
- `editForm` - Form data édition profil
- `passwordForm` - Form data changement mot de passe

### useEffect
1. **Init Auth** - Récupère session, charge profil + photos
2. **Auth State Change** - Écoute les changements de session
3. **Profile Load** - Charge données utilisateur depuis DB
4. **Photos Load** - Charge galerie photos utilisateur

### useCallback
- `loadProfile()` - Récupère profil depuis `user_profiles`
- `loadPhotos()` - Récupère photos depuis `user_photos`

---

## 🛠️ Variables d'Environnement

```env
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
```

Ces variables sont nécessaires dans:
- `.env.local` (développement local)
- Vercel Environment Variables (production)

---

## 📝 Exemples d'Utilisation

### Sauvegarder le Profil
```tsx
const handleSaveProfile = async () => {
  await supabase.from('user_profiles').upsert({
    id: user.id,
    email: user.email,
    full_name: editForm.full_name,
    bio: editForm.bio,
    phone: editForm.phone,
    provider: user.app_metadata?.provider || 'email',
    created_at: user.created_at,
  });
};
```

### Charger Galerie Photos
```tsx
const loadPhotos = async (userId: string) => {
  const { data } = await supabase
    .from('user_photos')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  setPhotos(data || []);
};
```

### Changer Mot de Passe
```tsx
await supabase.auth.updateUser({ 
  password: newPassword 
});
```

---

## ⚠️ Points Importants

1. **RLS ACTIVÉ** - Les données sont protégées par Row Level Security
2. **Auth requis** - `/profile` redirige vers `/auth` si non connecté
3. **Email Validation** - Inscription nécessite confirmation email
4. **Google Callback** - Doit être configuré dans Google Cloud & Supabase
5. **Env Vars Build Time** - Changemd les vars sur Vercel nécessite rebuild

---

## 📚 Ressources

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Supabase Database Docs](https://supabase.com/docs/guides/database)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Framer Motion](https://www.framer.com/motion/)

---

**Développé pour Prime Studio** 📸✨
