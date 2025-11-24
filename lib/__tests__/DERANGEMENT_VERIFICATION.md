# Verificación Matemática del Algoritmo de Derangement

## ¿Qué garantiza el algoritmo?

El algoritmo `generateDerangement` implementado en GhostSwap garantiza las siguientes propiedades matemáticas para el sorteo de Secret Santa:

---

## 🔒 Propiedades Verificadas

### 1. **Nadie se asigna a sí mismo**
**¿Qué significa?** En un sorteo con personas A, B, C, D, E:
- A nunca recibirá A
- B nunca recibirá B
- ... y así sucesivamente

**Tests realizados:**
- ✅ 1,000 iteraciones con 3 participantes
- ✅ 500 iteraciones con 10 participantes
- ✅ 100 iteraciones con 50 participantes
- ✅ 10 iteraciones con 100 participantes

**Código verificado:**
```typescript
for (let i = 0; i < n; i++) {
  if (shuffled[i] === participants[i]) {
    isDerangement = false
    break
  }
}
```

---

### 2. **Cada persona aparece exactamente UNA vez como receptor**
**¿Qué significa?** Si hay 5 personas en el grupo:
- Cada persona dará a exactamente 1 persona
- Cada persona recibirá de exactamente 1 persona
- Nadie queda sin regalo
- Nadie recibe 2 regalos

**Ejemplo:**
```
A → B
B → D
C → A
D → E
E → C
```

**Tests realizados:**
- ✅ 100 iteraciones contando frecuencia de receptores con 3 participantes
- ✅ 100 iteraciones contando frecuencia de receptores con 20 participantes

---

### 3. **Es una biyección (función uno-a-uno)**
**¿Qué significa?** El sorteo crea un mapeo perfecto donde:
- Cada "giver" tiene exactamente un "receiver"
- No hay dos "givers" que den al mismo "receiver"
- Todos los participantes son "receivers"

**Tests realizados:**
- ✅ 100 iteraciones verificando inyectividad, sobreyectividad y completitud

---

### 4. **Forma ciclos válidos**
**¿Qué significa?** El sorteo crea cadenas cerradas. Por ejemplo:
```
Ciclo 1: A → B → D → A (ciclo de 3)
Ciclo 2: C → E → C (ciclo de 2)
```

**Restricción importante:** No pueden existir ciclos de longitud 1 (una persona dándose a sí misma).

**Tests realizados:**
- ✅ 50 iteraciones verificando estructura de ciclos con 6 participantes
- ✅ Verificación de que no existen ciclos de longitud 1

---

### 5. **Es una permutación válida**
**¿Qué significa?** El resultado contiene exactamente los mismos elementos que la entrada, solo reordenados.

**Ejemplo:**
```
Entrada:   [A, B, C, D, E]
Resultado: [C, E, A, B, D]  ✅ Mismos elementos
Resultado: [C, E, A, B, X]  ❌ Contiene 'X' (inválido)
Resultado: [C, E, A, B, B]  ❌ 'B' duplicado (inválido)
```

**Tests realizados:**
- ✅ 100 iteraciones verificando que sorted(input) == sorted(output)

---

### 6. **Distribución estadística uniforme**
**¿Qué significa?** Todos los derangements válidos tienen la misma probabilidad de ocurrir.

Para 4 personas (A, B, C, D), existen exactamente **9 derangements posibles**:
1. [B, A, D, C]
2. [B, C, D, A]
3. [B, D, A, C]
4. [C, A, D, B]
5. [C, D, A, B]
6. [C, D, B, A]
7. [D, A, B, C]
8. [D, C, A, B]
9. [D, C, B, A]

**Tests realizados:**
- ✅ 1,000 iteraciones verificando que cada par válido ocurre con frecuencia similar
- ✅ Verificación de que pares prohibidos (A→A, B→B, etc.) NUNCA ocurren

---

## 🎯 Casos Extremos Verificados

### Caso 1: 2 participantes
Con 2 personas, solo existe **1 derangement posible**:
```
A → B
B → A
```
**Test:** ✅ 100 iteraciones producen siempre el mismo resultado

---

### Caso 2: 100 participantes
**Tests realizados:**
- ✅ 10 iteraciones verificando todas las propiedades con 100 personas

---

### Caso 3: UUIDs reales (caso de producción)
Simulación con UUIDs reales de usuarios:
```typescript
const userIds = [
  '550e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440002',
  // ...
]
```
**Test:** ✅ 100 iteraciones con 5 UUIDs verificando todas las propiedades

---

## 📊 Resumen de Cobertura de Tests

| Propiedad | Tests | Iteraciones Totales |
|-----------|-------|---------------------|
| Nadie se asigna a sí mismo | 4 | 1,610 |
| Cada persona una vez | 2 | 200 |
| Biyección | 1 | 100 |
| Ciclos válidos | 1 | 50 |
| Permutación válida | 1 | 100 |
| Distribución uniforme | 1 | 1,000 |
| Casos extremos | 3 | 210 |
| **TOTAL** | **13** | **3,270** |

---

## 🛡️ Garantías Matemáticas

### Para cualquier tamaño de grupo N (donde N ≥ 2):

1. ✅ **Ningún participante se asignará a sí mismo** (0% probabilidad)
2. ✅ **Cada participante dará a exactamente 1 persona** (100% garantizado)
3. ✅ **Cada participante recibirá de exactamente 1 persona** (100% garantizado)
4. ✅ **No habrá duplicados ni omisiones** (matemáticamente imposible)
5. ✅ **El sorteo es justo** (distribución uniforme entre todos los derangements posibles)

---

## 🔬 Fórmula Matemática

El número de derangements posibles para N personas se calcula con:

```
D(n) = n! × Σ(k=0 to n) [(-1)^k / k!]
```

**Ejemplos:**
- N=2: D(2) = 1
- N=3: D(3) = 2
- N=4: D(4) = 9
- N=5: D(5) = 44
- N=10: D(10) = 1,334,961

Nuestro algoritmo selecciona uniformemente entre todos estos derangements posibles.

---

## 🎲 Ejemplo de Ejecución Real

### Input:
```json
["Alice", "Bob", "Charlie", "Diana", "Eve"]
```

### Posibles Outputs Válidos:
```json
["Bob", "Charlie", "Diana", "Eve", "Alice"]   ✅
["Charlie", "Eve", "Bob", "Alice", "Diana"]   ✅
["Diana", "Alice", "Eve", "Bob", "Charlie"]   ✅
["Alice", "Bob", "Charlie", "Diana", "Eve"]   ❌ (nadie se mueve)
["Bob", "Alice", "Charlie", "Diana", "Eve"]   ❌ (Charlie → Charlie)
```

### Mapeo (ejemplo 1):
```
Alice   → Bob      (giver → receiver)
Bob     → Charlie
Charlie → Diana
Diana   → Eve
Eve     → Alice
```

**Verificación:**
- ✅ Alice no se da a sí misma
- ✅ Bob no se da a sí mismo
- ✅ ... (todos cumplen)
- ✅ Todos dan a alguien diferente
- ✅ Todos reciben de alguien

---

## 🧪 Cómo Ejecutar los Tests

```bash
# Todos los tests de derangement
npm run test:run -- lib/__tests__/derangement

# Solo tests de propiedades matemáticas
npm run test:run -- lib/__tests__/derangement-properties.test.ts

# Con reporte detallado
npm run test:run -- lib/__tests__/derangement-properties.test.ts --reporter=verbose
```

---

## 📝 Conclusión

El algoritmo `generateDerangement` ha sido **rigurosamente testeado** con más de **3,000 iteraciones** verificando todas las propiedades matemáticas de un derangement válido.

**Garantiza que:**
- 🎅 Nadie se regala a sí mismo
- 🎁 Todos dan y reciben exactamente un regalo
- 🎲 El sorteo es completamente justo y aleatorio
- 🔒 Funciona con cualquier número de participantes (≥ 2)
