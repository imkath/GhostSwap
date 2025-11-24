# Restricciones de Gifting (Exclusions)

## 📋 Descripción

Las restricciones de gifting permiten especificar que cierta persona no puede regalarle a otra persona específica. Esto es útil en escenarios como:

- **Parejas:** Dos personas que no quieren intercambiar regalos entre sí
- **Familia:** Miembros de la misma familia nuclear
- **Compañeros de oficina:** Jefes que no quieren regalar a subordinados directos
- **Restricciones presupuestarias:** Personas con presupuestos muy diferentes

## 🎯 Casos de Uso

### 1. Evento Familiar con Parejas

```
Participantes:
- Alice y Bob (pareja)
- Charlie y Diana (pareja)
- Eve (soltera)
- Frank (soltero)

Restricciones:
- Alice ⛔ Bob
- Bob ⛔ Alice
- Charlie ⛔ Diana
- Diana ⛔ Charlie

Resultado: Las parejas no se regalan entre sí, pero pueden recibir de otros.
```

### 2. Secret Santa en la Oficina

```
Participantes:
- Manager
- Senior Dev 1
- Senior Dev 2
- Junior Dev
- Intern

Restricciones:
- Manager ⛔ Intern (diferencia jerárquica)
- Intern ⛔ Manager (diferencia presupuestaria)

Resultado: Relaciones jerárquicas muy marcadas evitan intercambio directo.
```

### 3. Grupo de Amigos

```
Participantes:
- Ana
- Bruno
- Carlos
- Diana
- Elena
- Fernando

Restricciones:
- Ana ⛔ Bruno (ya se conocen muy bien)
- Carlos ⛔ Diana (vecinos, se regalan seguido)

Resultado: Fomenta conocer mejor a otros miembros del grupo.
```

## 🔧 Implementación Técnica

### Base de Datos

```sql
CREATE TABLE exclusions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  giver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  excluded_receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, giver_id, excluded_receiver_id),
  CHECK (giver_id != excluded_receiver_id)
);
```

### Algoritmo

El algoritmo de derangement fue extendido para soportar restricciones:

1. **Primer intento:** Fisher-Yates shuffle con validación (200 intentos)
2. **Fallback:** Algoritmo de backtracking si Fisher-Yates falla
3. **Timeout:** Máximo 1 segundo de ejecución para backtracking

```typescript
type ExclusionMap = Map<string, Set<string>>

function generateDerangement(
  participants: string[],
  exclusions?: ExclusionMap
): string[] | null
```

### Validación de Restricciones

El algoritmo verifica:
- ✅ Nadie se asigna a sí mismo
- ✅ Nadie da a una persona excluida
- ✅ Cada persona aparece exactamente una vez como receptor
- ✅ Las restricciones son satisfacibles

Si las restricciones son **imposibles de satisfacer**, el algoritmo retorna `null` y el sorteo falla con un mensaje descriptivo.

## ⚠️ Restricciones Imposibles

Algunos conjuntos de restricciones son imposibles de resolver:

### Ejemplo 1: Sobre-restricción

```
Participantes: A, B, C
Restricciones:
- A ⛔ B, C (A no puede dar a nadie!)
```

**Resultado:** ❌ Imposible

### Ejemplo 2: Ciclo Bloqueado

```
Participantes: A, B, C
Restricciones:
- A ⛔ B
- B ⛔ C
- C ⛔ A
```

**Resultado:** ❌ Imposible (solo queda A→C, B→A, C→B, pero viola todas las restricciones)

### Ejemplo 3: Grupo Pequeño con Muchas Restricciones

```
Participantes: A, B, C, D (4 personas)
Restricciones:
- A ⛔ B, C
- B ⛔ A, D
- C ⛔ B, D
- D ⛔ A, C
```

**Resultado:** Probablemente ❌ Imposible (demasiado restringido)

## 🎮 Interfaz de Usuario

### Vista del Admin

El admin puede:
1. Ver todas las restricciones actuales
2. Agregar nueva restricción seleccionando:
   - Persona que regala
   - Persona que NO puede recibir
3. Eliminar restricciones existentes
4. Las restricciones se muestran visualmente con avatares

### Restricciones de Uso

- ✅ Solo el admin puede gestionar restricciones
- ✅ Solo antes del sorteo (no después)
- ✅ No se puede excluir a alguien de sí mismo (redundante)
- ✅ No se puede agregar la misma restricción dos veces
- ✅ Ambos usuarios deben ser miembros del grupo

## 📊 Tests

Se crearon **tests exhaustivos** para verificar:

### Tests Básicos
- ✅ Restricción simple (A ⛔ B)
- ✅ Múltiples exclusiones para una persona
- ✅ Múltiples personas con exclusiones
- ✅ Exclusiones bidireccionales (parejas)

### Tests de Casos Reales
- ✅ Evento familiar con 4 parejas
- ✅ Secret Santa de oficina con jerarquías
- ✅ Grupos grandes (50 personas) con restricciones moderadas

### Tests de Propiedades
- ✅ Distribución estadística justa con restricciones
- ✅ Performance con restricciones (< 1 segundo)
- ✅ Detección de restricciones imposibles

### Tests de Edge Cases
- ✅ Restricciones imposibles retornan null
- ✅ Map vacío funciona como derangement normal
- ✅ Undefined exclusions funciona normalmente

## 🚀 Uso en la Aplicación

### Agregar Restricción

```typescript
import { addExclusion } from '@/app/actions/exclusions'

const result = await addExclusion(
  groupId,
  'uuid-giver',
  'uuid-excluded-receiver'
)

if (result.success) {
  // Restricción agregada
} else {
  // Error: result.error
}
```

### Eliminar Restricción

```typescript
import { removeExclusion } from '@/app/actions/exclusions'

const result = await removeExclusion(exclusionId)
```

### Obtener Restricciones

```typescript
import { getExclusions } from '@/app/actions/exclusions'

const result = await getExclusions(groupId)

if (result.success) {
  console.log(result.exclusions)
}
```

## 📈 Complejidad

- **Tiempo (mejor caso):** O(n²) - Fisher-Yates con validación encuentra solución rápido
- **Tiempo (peor caso):** O(n!) - Backtracking explora todo el espacio de búsqueda
- **Espacio:** O(n) - Para el resultado y estructuras auxiliares
- **Timeout:** 1 segundo máximo para backtracking

## 🎓 Teoría de Grafos

Las restricciones se pueden modelar como un **grafo dirigido**:

- **Vértices:** Participantes
- **Aristas:** Asignaciones permitidas (todas excepto self-loops y exclusiones)
- **Objetivo:** Encontrar un ciclo Hamiltoniano (o unión de ciclos disjuntos)

El problema se vuelve **NP-completo** con restricciones arbitrarias, por eso usamos backtracking con timeout.

## 💡 Recomendaciones

1. **Mantener restricciones al mínimo:** Más restricciones = mayor probabilidad de fallo
2. **Grupos más grandes:** Más fácil satisfacer restricciones
3. **Simetría en parejas:** Si A ⛔ B, agregar B ⛔ A
4. **Probar antes del sorteo:** Configurar restricciones antes del día del evento
5. **Tener plan B:** Si fallan restricciones, reducirlas y reintentar

## 🔍 Debugging

Si el sorteo falla con restricciones:

1. **Revisar número de participantes vs restricciones**
   - Regla general: Restricciones < n/2

2. **Verificar simetría**
   - Parejas deben tener exclusión bidireccional

3. **Simplificar restricciones**
   - Remover las menos importantes

4. **Aumentar participantes**
   - Más personas = más opciones para asignar

## 📚 Referencias

- [Derangement (Wikipedia)](https://en.wikipedia.org/wiki/Derangement)
- [Constrained Permutations](https://en.wikipedia.org/wiki/Permutation#Constrained_permutations)
- [Backtracking Algorithm](https://en.wikipedia.org/wiki/Backtracking)
- [Hamiltonian Path Problem](https://en.wikipedia.org/wiki/Hamiltonian_path_problem)
