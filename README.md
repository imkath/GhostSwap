# 👻 GhostSwap

**Organiza tu Amigo Secreto o intercambio de regalos online gratis con sorteos automáticos y listas de deseos.**

[![Tests](https://img.shields.io/badge/tests-163%20passing-success)](https://github.com/imkath/GhostSwap)
[![Coverage](https://img.shields.io/badge/coverage-77%25-yellow)](https://github.com/imkath/GhostSwap)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com/)

---

## ✨ Características

### 🎯 Core Features

- 🎲 **Sorteo Automático** - Algoritmo de derangement verificado matemáticamente
- 👥 **Grupos Ilimitados** - Crea y gestiona múltiples grupos
- 🎁 **Wishlist** - Hasta 5 items por participante con URLs y descripciones
- 🚫 **Exclusiones** - Configura restricciones (ej: parejas que no se regalan entre sí)
- 💰 **Multi-Moneda** - Soporte para 9 monedas (CLP, USD, EUR, MXN, ARS, COP, PEN, BRL, GBP)
- 📅 **Fecha del Evento** - Contador de días hasta el intercambio
- 📧 **Notificaciones Email** - Aviso automático cuando se realiza el sorteo
- 🔐 **100% Privado** - Nadie ve las asignaciones, ni siquiera el admin
- 📱 **Responsive** - Funciona perfecto en mobile y desktop

### 🌎 Monedas Soportadas

| Moneda             | Símbolo    | Ejemplo     |
| ------------------ | ---------- | ----------- |
| 🇨🇱 Peso Chileno    | CLP ($)    | $50.000     |
| 🇺🇸 Dólar           | USD (US$)  | US$50       |
| 🇪🇺 Euro            | EUR (€)    | €50         |
| 🇲🇽 Peso Mexicano   | MXN (MX$)  | MX$1.000    |
| 🇦🇷 Peso Argentino  | ARS (AR$)  | AR$50.000   |
| 🇨🇴 Peso Colombiano | COP (COL$) | COL$200.000 |
| 🇵🇪 Sol Peruano     | PEN (S/)   | S/200       |
| 🇧🇷 Real Brasileño  | BRL (R$)   | R$250       |
| 🇬🇧 Libra Esterlina | GBP (£)    | £40         |

---

## 🚀 Demo

👉 **[ghostswap.kthcsk.me](https://ghostswap.kthcsk.me)**

---

## 📸 Screenshots

### Landing Page

![Landing](docs/images/landing.png)

### Crear Grupo

![Create Group](docs/images/create-group.png)

### Dashboard

![Dashboard](docs/images/dashboard.png)

---

## 🛠️ Tech Stack

### Frontend

- **Framework:** Next.js 16 (App Router)
- **UI:** React 19 + Tailwind CSS
- **Components:** Radix UI
- **Animations:** Framer Motion
- **Forms:** React Hook Form + Zod

### Backend

- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Email:** Resend
- **API:** Next.js Server Actions
- **Validation:** Zod

### Testing

- **Framework:** Vitest
- **Testing Library:** React Testing Library
- **Coverage:** 77% (163 tests passing)

---

## 🏃 Quick Start

### Prerequisites

- Node.js 18+
- npm o yarn
- Cuenta de Supabase

### 1. Clonar el repositorio

```bash
git clone https://github.com/imkath/GhostSwap.git
cd GhostSwap
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env.local
```

Edita `.env.local` y agrega:

```env
NEXT_PUBLIC_SUPABASE_URL=tu-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
RESEND_API_KEY=tu-resend-api-key  # Opcional, para notificaciones email
```

### 4. Configurar la base de datos

```bash
# Ejecuta el schema en tu proyecto de Supabase
# Copia el contenido de supabase/schema.sql
# Pégalo en el SQL Editor de Supabase
```

### 5. Ejecutar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) 🎉

---

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm test

# Tests en modo watch
npm run test

# Tests con UI
npm run test:ui

# Coverage report
npm run test:coverage
```

### Test Stats

- ✅ **163 tests** passing
- ✅ **14 test files**
- ✅ **77% coverage** (lib + hooks)
- ✅ **5,000+ iterations** de tests de estrés

---

## 📚 Documentación

- [FEATURES.md](FEATURES.md) - Lista completa de características
- [supabase/migrations/README.md](supabase/migrations/README.md) - Guía de migraciones
- [lib/**tests**/DERANGEMENT_VERIFICATION.md](lib/__tests__/DERANGEMENT_VERIFICATION.md) - Verificación matemática del algoritmo

---

## 🔐 Seguridad

- ✅ Row Level Security (RLS) en todas las tablas
- ✅ Validación de entrada con Zod
- ✅ Autenticación requerida
- ✅ Solo ves tu propia asignación
- ✅ Admin no ve asignaciones
- ✅ HTTPS only

---

## 🗂️ Estructura del Proyecto

```
ghostswap/
├── app/                    # Next.js App Router
│   ├── actions/           # Server Actions
│   ├── dashboard/         # Dashboard page
│   ├── groups/           # Group pages
│   └── ...
├── components/            # React components
│   ├── ui/               # Radix UI components
│   └── ...
├── lib/                   # Utilidades
│   ├── __tests__/        # Tests
│   ├── derangement.ts    # Algoritmo de sorteo
│   ├── validations.ts    # Schemas Zod
│   └── errors.ts         # Error handling
├── hooks/                 # Custom hooks
├── supabase/             # Database
│   ├── schema.sql        # Schema completo
│   └── migrations/       # Migraciones
└── public/               # Assets estáticos
```

---

**GhostSwap** - La plataforma más completa para organizar tu Amigo Secreto 🎁👻
