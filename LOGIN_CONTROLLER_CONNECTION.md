# Backend Controllers - Frontend Login İlişkiler Cədvəli

## 🔗 Frontend ↔ Backend Bağlantı Xəritəsi

### Frontend URL → Backend Endpoint

| Frontend İşləm | HTTP | Backend Endpoint | Controller | Funksiya | Parametrləri |
|---|---|---|---|---|---|
| **Qeydiyyat Forması** (Hissə 1) | POST | `/api/auth/register` | auth | `register()` | `email, password, firstName, lastName, dateOfBirth, username, skillLevel, reason` |
| **Personaj Yüklənişi** (Hissə 2) | PUT | `/api/user/character` | user | `updateCharacter()` | `gender, emotion, clothing, hairColor, skin, clothingColor, username` |
| **Giriş Forması** | POST | `/api/auth/login` | auth | `login()` | `email, password` |
| **Profil Məlumatları** | GET | `/api/users/me` | user | `getMe()` | Header: `Authorization: Bearer <token>` |

---

## 📊 Her Endpoint İçin Tam Malumaat

### 1. REGISTER ENDPOINT

```
POST /api/auth/register
```

#### Frontend Gönderger (Login.tsx - handleDeploy)

```javascript
{
  email: "user@example.com",
  password: "securePassword123",
  firstName: "Əhməd",
  lastName: "Əliyev",
  dateOfBirth: "2005-03-15T00:00:00Z",
  username: "ahmadaliyev",
  skillLevel: "advanced",
  reason: "Kod öyrənmək istəyirəm"
}
```

#### Backend Cavabı (auth.controller.ts - register)

✅ **Success (201)**
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "email": "user@example.com",
    "username": "ahmadaliyev",
    "firstName": "Əhməd",
    "lastName": "Əliyev",
    "skillLevel": "advanced",
    "isAdmin": false,
    "character": {
      "gender": "male",
      "emotion": "neutral",
      "clothing": "tshirt",
      "hairColor": "#b96321",
      "skin": "#ffdbac",
      "clothingColor": "#3b82f6"
    }
  }
}
```

❌ **Xətalar**
```json
// Email artıq istifadə olunub
{ "success": false, "message": "Bu email artıq qeydiyyatdan keçib" }

// Username artıq istifadə olunub
{ "success": false, "message": "Bu istifadəçi adı artıq istifadə olunub" }

// Email/Parol mütləq
{ "success": false, "message": "Email və parol mütləqdir" }
```

---

### 2. CHARACTER UPDATE ENDPOINT

```
PUT /api/user/character
Header: Authorization: Bearer <JWT_TOKEN>
```

#### Frontend Gönderger (Login.tsx - handleDeploy)

```javascript
{
  gender: "male",
  emotion: "happy",
  clothing: "jacket",
  hairColor: "#f44336",
  skin: "#e0ac69",
  clothingColor: "#3b82f6",
  username: "WARRIOR_HERO_001"
}
```

#### Backend Cavabı (user.controller.ts - updateCharacter)

✅ **Success (200)**
```json
{
  "success": true,
  "data": {
    "gender": "male",
    "emotion": "happy",
    "clothing": "jacket",
    "hairColor": "#f44336",
    "skin": "#e0ac69",
    "clothingColor": "#3b82f6",
    "username": "WARRIOR_HERO_001"
  }
}
```

❌ **Xətalar**
```json
// Username artıq istifadə olunub
{ "success": false, "message": "Bu personaj adı artıq istifadə olunub" }

// Token yoxdur
{ "message": "Token tələb olunur" }

// Token etibarsızdır
{ "message": "Token etibarsızdır" }

// İstifadəçi tapılmadı
{ "success": false, "message": "İstifadəçi tapılmadı" }
```

---

### 3. LOGIN ENDPOINT

```
POST /api/auth/login
```

#### Frontend Gönderger (Login.tsx - handleLogin)

```javascript
{
  email: "user@example.com",
  password: "securePassword123"
}
```

#### Backend Cavabı (auth.controller.ts - login)

✅ **Success (200)**
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "username": "ahmadaliyev",
    "firstName": "Əhməd",
    "lastName": "Əliyev",
    "skillLevel": "advanced",
    "xp": 1250,
    "level": 5,
    "isAdmin": false,
    "character": {
      "gender": "male",
      "emotion": "happy",
      "clothing": "jacket",
      "hairColor": "#f44336",
      "skin": "#e0ac69",
      "clothingColor": "#3b82f6",
      "username": "WARRIOR_HERO_001"
    }
  }
}
```

❌ **Xətalar**
```json
// Email/Parol səhv
{ "success": false, "message": "Email və ya parol səhvdir" }

// Email/Parol mütləq
{ "success": false, "message": "Email və parol mütləqdir" }
```

---

### 4. GET ME ENDPOINT

```
GET /api/users/me
Header: Authorization: Bearer <JWT_TOKEN>
```

#### Frontend Çağrısı (Login.tsx - handleLogin sonrası)

```javascript
await fetch(`${API_BASE}/users/me`, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
});
```

#### Backend Cavabı (user.controller.ts - getMe)

✅ **Success (200)**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "username": "ahmadaliyev",
    "firstName": "Əhməd",
    "lastName": "Əliyev",
    "dateOfBirth": "2005-03-15T00:00:00.000Z",
    "skillLevel": "advanced",
    "reason": "Kod öyrənmək istəyirəm",
    "xp": 1250,
    "level": 5,
    "character": {
      "gender": "male",
      "emotion": "happy",
      "clothing": "jacket",
      "hairColor": "#f44336",
      "skin": "#e0ac69",
      "clothingColor": "#3b82f6",
      "username": "WARRIOR_HERO_001"
    },
    "isAdmin": false,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

❌ **Xətalar**
```json
// Token yoxdur
{ "message": "Token tələb olunur" }

// Token etibarsızdır
{ "message": "Token etibarsızdır" }

// İstifadəçi tapılmadı
{ "success": false, "message": "İstifadəçi tapılmadı" }
```

---

## 🔄 Tam Qeydiyyat Axırışı (Step-by-Step)

```
STEP 1: Qeydiyyat Forması
┌─────────────────────────────────────┐
│ Frontend: Tüm sahələri doldurduk    │
│ username, email, password vb.       │
│ character: gender, emotion, clothing│
└─────────────────────────────────────┘
                ↓
STEP 2: Qeydiyyat Request
┌─────────────────────────────────────┐
│ POST /api/auth/register             │
│ Body: {email, password, firstName...│username, skillLevel, reason}        │
└─────────────────────────────────────┘
                ↓
STEP 3: Backend Qeydiyyat
┌─────────────────────────────────────┐
│ auth.controller.register()          │
│ 1. Email unikallığını yoxla         │
│ 2. Username unikallığını yoxla      │
│ 3. Parolı hash et                   │
│ 4. Yeni User dokumenti yaradıcı     │
│ 5. JWT token yaradıcı               │
└─────────────────────────────────────┘
             ↓
STEP 4: Token Cavabı
┌─────────────────────────────────────┐
│ Response: {accessToken, userData}   │
│ Frontend: localStorage-ə token saxla│
└─────────────────────────────────────┘
             ↓
STEP 5: Personaj Yüklənişi
┌─────────────────────────────────────┐
│ PUT /api/user/character             │
│ Body: {gender, emotion, clothing... │ username}              │
│ Header: Authorization: Bearer <token│
└─────────────────────────────────────┘
             ↓
STEP 6: Backend Personaj Güncəllənməsi
┌─────────────────────────────────────┐
│ user.controller.updateCharacter()   │
│ 1. Token-dən user id tapə           │
│ 2. Character username unikallığını  │   yoxla                         │
│ 3. Character məlumatlarını yüncəllə │
│ 4. Saxla                            │
└─────────────────────────────────────┘
             ↓
STEP 7: Profil Səhifəsinə Yönəlt
┌─────────────────────────────────────┐
│ window.location.href = '/profile'   │
│ localStorage GET /users/me ilə      │ istifadəçi məlumatlarını əldə edir │
└─────────────────────────────────────┘
```

---

## 💾 localStorage-də Saxlanan Məlumatlar

```javascript
// Token
localStorage.setItem('token', accessToken);  // JWT token

// Email
localStorage.setItem('email', email);  // Giriş eəmail

// Tam Istifadəçi Məlumatları
localStorage.setItem('currentUserData', JSON.stringify({
  username: "ahmadaliyev",
  firstName: "Əhməd",
  lastName: "Əliyev",
  email: "user@example.com",
  skillLevel: "advanced",
  character: {
    username: "WARRIOR_HERO_001",
    gender: "male",
    emotion: "happy",
    clothing: "jacket",
    hairColor: "#f44336",
    skin: "#e0ac69",
    clothingColor: "#3b82f6"
  }
}));
```

---

## 🚀 Müxtəlif Sənariyolar

### Ssenario 1: Yeni Istifadəçi Qeydiyyatı
```
1. Register → 201 ✅
2. Character Update → 200 ✅
3. → Profile sahifəsinə
```

### Ssenario 2: Mövcud Istifadəçi Girişi
```
1. Login → 200 ✅
2. Get Me → 200 ✅
3. → Profile sahifəsinə
```

### Ssenario 3: Xəta Halı
```
1. Register → 400 (Email artıq)
2. Xəta mesajı göstərilir
3. Formda qalır
```

---

## ✅ Tamamlanan Bağlantılar

- ✅ Frontend Register → Backend Register Controller
- ✅ Frontend Character Update → Backend updateCharacter Controller
- ✅ Frontend Login → Backend Login Controller
- ✅ Frontend Get User Data → Backend getMe Controller
- ✅ Token-based Authentication (JWT)
- ✅ Email & Username Uniqueness Validation
- ✅ Character Username Uniqueness Validation
- ✅ Error Handling ve Mesajlar
- ✅ localStorage Integration

**Sistem tam olaraq tətbiq edilib! 🎉**
