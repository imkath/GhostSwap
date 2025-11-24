# GhostSwap - Características

## 🎁 Funcionalidades Principales

### 1. Sorteo de Amigo Secreto
- ✅ Algoritmo de derangement matemáticamente verificado
- ✅ Garantiza que nadie se asigna a sí mismo
- ✅ Cada participante da y recibe exactamente un regalo
- ✅ **Restricciones de gifting** - Define quién no puede regalarle a quién (ej: parejas)
- ✅ Algoritmo de backtracking para resolver restricciones complejas
- ✅ Validación de restricciones imposibles
- ✅ Mínimo 3 participantes requerido
- ✅ Máximo ilimitado de participantes
- ✅ Tests automatizados verificando corrección
- ✅ Tests de estrés con restricciones complejas

### 2. Gestión de Grupos
- ✅ Crear grupos con nombre personalizado
- ✅ Código de invitación único generado automáticamente
- ✅ Compartir link de invitación
- ✅ Roles: Admin y Miembros
- ✅ Admin puede realizar el sorteo
- ✅ Admin puede editar configuración del grupo
- ✅ Admin puede remover miembros (antes del sorteo)
- ✅ Admin puede resetear el sorteo
- ✅ Miembros pueden abandonar el grupo (antes del sorteo)

### 3. Soporte Multi-Moneda 🆕
**Monedas soportadas:**

| Código | Símbolo | País/Región | Bandera |
|--------|---------|-------------|---------|
| CLP | $ | Chile | 🇨🇱 |
| USD | US$ | Estados Unidos | 🇺🇸 |
| EUR | € | Unión Europea | 🇪🇺 |
| MXN | MX$ | México | 🇲🇽 |
| ARS | AR$ | Argentina | 🇦🇷 |
| COP | COL$ | Colombia | 🇨🇴 |
| PEN | S/ | Perú | 🇵🇪 |
| BRL | R$ | Brasil | 🇧🇷 |
| GBP | £ | Reino Unido | 🇬🇧 |

**Características:**
- ✅ Seleccionar moneda al crear grupo
- ✅ Editar moneda después de crear
- ✅ Formateo automático con separadores de miles
- ✅ Símbolo de moneda correcto en UI
- ✅ Banderas de país en display
- ✅ Validación con Zod

### 4. Presupuesto y Fecha
- ✅ Configurar presupuesto máximo (opcional)
- ✅ Mostrar presupuesto con moneda correcta
- ✅ Establecer fecha del intercambio
- ✅ Contador de días hasta el evento
- ✅ Formato de fecha localizado (español)

### 5. Wishlist / Lista de Deseos
- ✅ Hasta 5 items por persona
- ✅ Nombre del regalo (requerido)
- ✅ URL opcional (validación de formato)
- ✅ Descripción opcional
- ✅ Editor en tiempo real
- ✅ Guardado automático

### 6. Privacidad y Seguridad
- ✅ Autenticación con Supabase Auth
- ✅ Row Level Security (RLS) en todas las tablas
- ✅ Los participantes solo ven su asignación
- ✅ El admin no ve las asignaciones
- ✅ Políticas de acceso granulares
- ✅ Validación de inputs con Zod

### 7. Historial de Actividades
- ✅ Log de eventos del grupo
- ✅ Miembro se unió
- ✅ Miembro abandonó
- ✅ Miembro removido
- ✅ Sorteo realizado
- ✅ Sorteo reseteado
- ✅ Grupo actualizado
- ✅ Límite de 50 actividades recientes

### 8. Interfaz de Usuario
- ✅ Responsive (mobile y desktop)
- ✅ Animaciones con Framer Motion
- ✅ Efectos de aurora background
- ✅ Confetti al realizar sorteo
- ✅ Toasts de notificación
- ✅ Skeleton loaders
- ✅ Diálogos modales
- ✅ Diseño moderno con Tailwind CSS

### 9. Manejo de Errores
- ✅ Mensajes de error en español
- ✅ Mapeo de 20+ códigos de error
- ✅ Errores de autenticación
- ✅ Errores de base de datos
- ✅ Errores de red
- ✅ Mensajes amigables al usuario

### 10. Testing y Calidad
- ✅ 101 tests automatizados
- ✅ Cobertura de código del 77%
- ✅ Tests unitarios
- ✅ Tests de integración
- ✅ Tests de propiedades matemáticas
- ✅ Tests de estrés (1000+ iteraciones)
- ✅ Vitest como framework

---

## 🚀 Próximas Características (Roadmap)

### A Corto Plazo
- [ ] Notificaciones por email
- [ ] PWA (Progressive Web App)
- [ ] Dark mode
- [ ] Soporte para más idiomas (inglés, portugués)

### A Mediano Plazo
- [ ] Chat entre participantes
- [ ] Historial de grupos pasados
- [ ] Estadísticas y analytics
- [ ] Sugerencias de regalos con IA

### A Largo Plazo
- [ ] API pública
- [ ] Integración con e-commerce
- [ ] Conversión de monedas en tiempo real
- [ ] Temas personalizables

---

## 📊 Estadísticas Técnicas

- **Tests:** 101+ passing
- **Cobertura:** 77% (lib + hooks)
- **Archivos de test:** 8
- **Líneas de código:** ~8,500+
- **Componentes:** 61+
- **Server Actions:** 10 (incluyendo exclusiones)
- **Hooks personalizados:** 2
- **Validaciones Zod:** 8 schemas

---

## 🏗️ Arquitectura

### Frontend
- **Framework:** Next.js 16 (App Router)
- **UI:** React 19, Tailwind CSS, Radix UI
- **State:** React Hooks
- **Animaciones:** Framer Motion
- **Forms:** React Hook Form + Zod

### Backend
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **API:** Next.js Server Actions
- **Validación:** Zod schemas
- **RLS:** Row Level Security policies

### Testing
- **Framework:** Vitest
- **Render:** React Testing Library
- **Environment:** jsdom
- **Coverage:** v8

---

## 🔒 Seguridad

### Implementaciones
- ✅ Row Level Security (RLS) en todas las tablas
- ✅ Validación de entrada con Zod
- ✅ Sanitización de URLs
- ✅ Autenticación requerida
- ✅ Verificación de permisos (admin/member)
- ✅ Rate limiting (Supabase)
- ✅ HTTPS only
- ✅ CORS configurado

### Políticas RLS Implementadas
```sql
-- Profiles: Usuarios pueden ver todos, editar solo el suyo
-- Groups: Miembros pueden ver, admin puede editar
-- Members: Miembros pueden ver del grupo, admin gestiona
-- Matches: Solo puedes ver tu asignación
-- Activities: Miembros del grupo pueden ver
```

---

## 📱 Compatibilidad

### Navegadores
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

### Dispositivos
- ✅ Desktop (1920x1080+)
- ✅ Laptop (1366x768+)
- ✅ Tablet (768x1024)
- ✅ Mobile (320x568+)

---

## 🌍 Internacionalización

### Idiomas Soportados
- ✅ Español (es-ES) - Principal

### Formatos Localizados
- ✅ Fechas en formato español
- ✅ Números con separador de miles (punto)
- ✅ Símbolos de moneda localizados

---

**GhostSwap** - Tu plataforma de confianza para Amigo Secreto 🎁

**Última actualización:** 24 de Noviembre, 2025
