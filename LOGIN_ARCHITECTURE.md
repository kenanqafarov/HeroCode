# Login Flow Architecture

## Sistem Axırışı (Complete Flow)

### Frontend → Backend İntegrasiyası

```
CLIENT (React)                          SERVER (Express + MongoDB)
┌─────────────────────┐                ┌──────────────────────┐
│   Login.tsx         │                │   app.ts             │
│   ├── handleLogin   │─────POST───────│   /api/auth/login    │
│   └── handleDeploy  │                │   auth.controller    │
│       (Register)    │                │   ├── login()        │
│                     │                │   └── register()     │
│   localStorage      │<────JWT────────│                      │
│   ├── token         │                │   User Model         │
│   ├── email         │                │   ├── email          │
│   └── currentUserData│               │   ├── password       │
│                     │                │   ├── username       │
│   /api/users/me     │────GET─────────│   ├── character      │
│   /api/user/character│────PUT─────────│   └── skillLevel    │
└─────────────────────┘                └──────────────────────┘
```

## 1. GİRİŞ (Login) Prosesi

### Frontend (client/src/pages/Login.tsx)

```typescript
// Giriş verilərini toplə
const handleLogin = async () => {
  const loginData = {
    email: "user@example.com",
    password: "password123"
  };
  
  // Backend-ə POST et
  const loginRes = await fetch(`http://localhost:5000/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(loginData)
  });
  
  // JWT token-i əldə et və localStorage-ə sax
  const { accessToken } = await loginRes.json();
  localStorage.setItem('token', accessToken);
  localStorage.setItem('email', loginData.email);
  
  // Qeyd: Backend login etdikdən sonra profil səhifəsinə yönəlt
  window.location.href = '/profile';
};
```

### Backend (server/src/controllers/auth.controller.ts)

```typescript
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    // 1. Email ilə istifadəçini tapə
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Email və ya parol səhvdir' });
    }
    
    // 2. Parol düzgün olduğunu yoxla
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Email və ya parol səhvdir' });
    }
    
    // 3. JWT token yaradıcı
    const token = generateToken(user._id.toString(), user.isAdmin);
    
    // 4. İstifadəçi məlumatları ilə cavab ver
    res.json({
      success: true,
      accessToken: token,
      data: {
        id: user._id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        skillLevel: user.skillLevel,
        xp: user.xp,
        level: user.level,
        isAdmin: user.isAdmin,
        character: user.character
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

---

## 2. QEYDİYYAT (Registration) Prosesi

### Frontend (client/src/pages/Login.tsx)

```typescript
const handleDeploy = async () => {
  // Validasiya et
  if (!isRegisterFormValid()) {
    setErrorMessage('Bütün məcburi sahələri düzgün doldurun!');
    return;
  }
  
  // 1. QEYDIYYAT: Əsas istifadəçi məlumatlarını göndər
  const registerPayload = {
    email: formData.email,
    password: formData.password,
    firstName: formData.name,
    lastName: formData.surname,
    dateOfBirth: new Date(formData.birthDate).toISOString(),
    username: formData.username,        // ➕ YENI
    skillLevel: formData.skillLevel,    // ➕ YENI
    reason: formData.reason             // ➕ YENI
  };
  
  const registerRes = await fetch(`http://localhost:5000/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(registerPayload)
  });
  
  const { accessToken } = await registerRes.json();
  localStorage.setItem('token', accessToken);
  localStorage.setItem('email', formData.email);
  
  // 2. PERSONAJ YÜKLƏNİŞİ: Token ilə avtorizasiya edərək personajı yüklə
  const characterPayload = {
    gender: char.gender,
    emotion: char.emotion,
    clothing: char.clothing,
    hairColor: char.hairColor,
    skin: char.skin,
    clothingColor: char.clothingColor,
    username: char.username  // ➕ PERSONAJ ADI
  };
  
  const updateRes = await fetch(`http://localhost:5000/api/user/character`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`  // JWT token ilə autentifikasiya
    },
    body: JSON.stringify(characterPayload)
  });
  
  window.location.href = '/profile';
};
```

### Backend Routes

#### 1. Register Route (server/src/routes/auth.routes.ts)
```typescript
router.post('/register', register);  // Qoruma yoxdur - hər kim qeydiyyat edə bilər
```

#### 2. Character Update Route (server/src/routes/user.routes.ts)
```typescript
router.put('/character', protect, updateCharacter);  // protect middleware ilə qorunur
```

### Backend Controller (server/src/controllers/auth.controller.ts)

```typescript
export const register = async (req: Request, res: Response) => {
  try {
    const { 
      email, 
      password, 
      firstName, 
      lastName, 
      dateOfBirth,
      username,
      skillLevel,
      reason
    } = req.body;
    
    // 1. Verilərləri validasiya et
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email və parol mütləqdir' });
    }
    
    // 2. Email unikallığını yoxla
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, message: 'Bu email artıq qeydiyyatdan keçib' });
    }
    
    // 3. Username unikallığını yoxla
    if (username) {
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        return res.status(400).json({ success: false, message: 'Bu istifadəçi adı artıq istifadə olunub' });
      }
    }
    
    // 4. Parol hash et
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 5. Yeni istifadəçi yaradıcı
    user = new User({
      email,
      password: hashedPassword,
      username,
      firstName,
      lastName,
      dateOfBirth,
      skillLevel,
      reason,
      isAdmin: false
    });
    
    await user.save();
    
    // 6. JWT token yaradıcı
    const token = generateToken(user._id.toString(), user.isAdmin);
    
    res.status(201).json({
      success: true,
      accessToken: token,
      data: {
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        skillLevel: user.skillLevel,
        isAdmin: user.isAdmin,
        character: user.character
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

---

## 3. PERSONAJ GÜNCƏLLƏNMƏSI (Character Update)

### Backend Controller (server/src/controllers/user.controller.ts)

```typescript
export const updateCharacter = async (req: AuthRequest, res: Response) => {
  try {
    const { gender, emotion, clothing, hairColor, skin, clothingColor, username } = req.body;
    
    // 1. Autentifikasiya olunmuş istifadəçini tapə
    const user = await User.findById(req.user!.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'İstifadəçi tapılmadı' });
    }
    
    // 2. Personaj məlumatlarını yüncəllə
    if (gender) user.character.gender = gender;
    if (emotion) user.character.emotion = emotion;
    if (clothing) user.character.clothing = clothing;
    if (hairColor) user.character.hairColor = hairColor;
    if (skin) user.character.skin = skin;
    if (clothingColor) user.character.clothingColor = clothingColor;
    
    // 3. Personaj username-i yüncəllə (unikallığını yoxla)
    if (username) {
      const existingUser = await User.findOne({ 
        'character.username': username, 
        _id: { $ne: user._id }  // Özün istisna et
      });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Bu personaj adı artıq istifadə olunub' });
      }
      user.character.username = username;
    }
    
    await user.save();
    
    res.json({ success: true, data: user.character });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
```

---

## 4. AUTENTIFIKASYON AXIRŞI

### Middleware (server/src/middleware/auth.middleware.ts)

```typescript
export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;
  
  // Token-i Header-dən çıxar
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  if (!token) {
    return res.status(401).json({ message: 'Token tələb olunur' });
  }
  
  try {
    // Token-i doğrula
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { 
      id: string; 
      isAdmin?: boolean 
    };
    
    // req-ə istifadəçi məlumatlarını əlavə et
    req.user = { id: decoded.id, isAdmin: !!decoded.isAdmin };
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token etibarsızdır' });
  }
};
```

### JWT Utility (server/src/utils/jwt.ts - nümunə)

```typescript
import jwt from 'jsonwebtoken';

export const generateToken = (userId: string, isAdmin: boolean = false) => {
  return jwt.sign(
    { id: userId, isAdmin },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );
};
```

---

## 5. API ENDPOINT-ƏRİ (Xülasə)

| HTTP | Endpoint | Qoruma | Məsul Controller | İşlər |
|------|----------|--------|------------------|------|
| POST | `/api/auth/register` | ✗ Yoxdur | `auth.controller.ts` | Qeydiyyat, istifadəçi yaradıcı |
| POST | `/api/auth/login` | ✗ Yoxdur | `auth.controller.ts` | Giriş, token yaradıcı |
| GET | `/api/users/me` | ✓ Token tələb | `user.controller.ts` | İstifadəçi məlumatlarını əldə et |
| PUT | `/api/user/character` | ✓ Token tələb | `user.controller.ts` | Personaj məlumatlarını yüncəllə |

---

## 6. LOCALSTORAGA VƏRİLƏRİ

Frontend bu məlumatları localStorage-ə saxyalayır:

```javascript
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "email": "user@example.com",
  "currentUserData": {
    "username": "X_PLAYER_123",
    "firstName": "Əhməd",
    "lastName": "Əliyev",
    "email": "user@example.com",
    "skillLevel": "advanced",
    "character": {
      "username": "WARRIOR_HERO_123",
      "gender": "male",
      "emotion": "happy",
      "clothing": "jacket",
      "hairColor": "#b96321",
      "skin": "#ffdbac",
      "clothingColor": "#3b82f6"
    }
  }
}
```

---

## 7. XƏTALAR VƏ MƏLUMAT

### Qeydiyyat Zamanı Mümkün Xətalar

| Xəta | Status | Səbəb |
|------|--------|-------|
| "Email və parol mütləqdir" | 400 | Email və ya parol boş |
| "Bu email artıq qeydiyyatdan keçib" | 400 | Email artıq istifadə olunub |
| "Bu istifadəçi adı artıq istifadə olunub" | 400 | Username artıq istifadə olunub |
| Server Error | 500 | Database xətası |

### Giriş Zamanı Mümkün Xətalar

| Xəta | Status | Səbəb |
|------|--------|-------|
| "Email və ya parol səhvdir" | 401 | Email yoxdur və ya parol qeyd yanlış |
| "Token tələb olunur" | 401 | Token göndərilməyib |
| "Token etibarsızdır" | 401 | Token sürəsi bitib və ya düzgün deyil |

---

## 8. CORS VƏ DEPLOYMENT

Əgər frontend və backend fərqli portlarda/domendə çalışırsa CORS-u konfiqurasiya et:

```typescript
// server/src/app.ts
app.use(cors({ 
  origin: ['http://localhost:5173', 'http://localhost:3000', '*'],
  credentials: true 
}));
```

---

## 9. TESTLƏMƏ MƏSƏLƏLƏRI

### cURL ilə Login Test

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### cURL ilə Register Test

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"newuser@example.com",
    "password":"password123",
    "firstName":"John",
    "lastName":"Doe",
    "dateOfBirth":"2000-01-01T00:00:00Z",
    "username":"johndoe",
    "skillLevel":"beginner",
    "reason":"Learn coding"
  }'
```

---

## 10. MƏLUMATLAR VƏ TOPŞURİŞLƏR

### Müqəddəmə Yolu
1. **Frontend**: Login.tsx → handleLogin() və ya handleDeploy()
2. **API Request**: POST /api/auth/login | /api/auth/register
3. **Backend**: auth.controller.ts → login() | register()
4. **Database**: User model saxlanılır
5. **Response**: JWT token + User Data
6. **Frontend**: localStorage-ə token sax, profil səhifəsinə yönəlt

### Sizə Lazım Olan Environment Variables (.env file)

```
JWT_SECRET=your_super_secret_key_here
MONGO_URI=mongodb://localhost:27017/heroDB
PORT=5000
ADMIN_EMAILS=admin@example.com
```

Artıq frontend ilə backend arasında tam iletişim sağlanıb! 🚀
