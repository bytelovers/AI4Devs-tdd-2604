# Prompts Log - Candidate Insertion Feature (inserción de nuevos candidatos)

This file logs the sequential prompt chain and clean, human-readable assistant responses used to generate and verify the backend and frontend tests. Each prompt defines a clear role, follows a Spec-Driven Development (SDD) sequence of steps, and includes strict mock and test-case specifications to achieve determinism.

---

PROMPT #1
Actúa como un Ingeniero de Software Senior especialista en Backend y TDD. Tu objetivo es generar la suite de pruebas de integración para el registro de candidatos en el backend siguiendo una secuencia de Spec-Driven Development (SDD):

1. **Fase de Exploración (Explore)**: Busca y localiza en el workspace la ubicación de los controladores, modelos y rutas de candidatos.
2. **Fase de Diseño/Planificación (Design)**: Diseña la estrategia de pruebas. Debes mockear `@prisma/client` en memoria utilizando obligatoriamente una instancia de `Set<string>` para almacenar temporalmente los emails y simular restricciones de base de datos única (lanzando un error con código `P2002` si ya existe).
3. **Fase de Implementación (Apply)**: Escribe la suite de pruebas de integración en el archivo `backend/src/tests/tests-ADLC.test.ts` cubriendo exactamente estos 4 casos de uso:
   - Registro exitoso con campos mínimos requeridos (`firstName`, `lastName`, `email`) retornando status 201.
   - Error de validación al omitir campos requeridos o usar un email inválido retornando status 400.
   - Error de correo duplicado al intentar insertar un email que ya está en el mock de Prisma retornando status 400.
   - Registro exitoso con un payload completo que incluya relaciones anidadas de `educations`, `workExperiences` y `cv`.

RESPONSE:
Claro. He realizado la exploración del backend localizando el controlador `candidateController.ts` y he implementado la suite de pruebas de integración en el archivo `backend/src/tests/tests-ADLC.test.ts`. 

Para asegurar el aislamiento de las pruebas, mockeé `@prisma/client` utilizando un `Set` en memoria para simular la unicidad del email y lanzar un error de tipo `P2002` en caso de duplicados. Se escribieron los 4 casos de prueba específicos solicitados (campos mínimos válidos, errores de validación 400, control de correos duplicados y registro con payload completo anidado).

El archivo de pruebas ha sido modificado y guardado con éxito.

----

PROMPT #2
Actúa como un Ingeniero de Software Senior especialista en QA y automatización de pruebas. Tu objetivo es verificar y validar (Fase de Verification del SDD) la ejecución de la suite de pruebas del backend creada en el paso anterior. Ejecuta el comando de test correspondiente y reporta detalladamente si todos los tests pasan correctamente.

RESPONSE:
He ejecutado las pruebas en el paquete `backend` del monorepositorio utilizando `pnpm --filter backend test`. Todas las pruebas de integración han pasado correctamente:

```bash
$ pnpm --filter backend test

 PASS  src/tests/tests-ADLC.test.ts
  Candidate Insertion Integration Tests (ADLC)
    ✓ should register a candidate successfully with minimum required fields (14 ms)
    ✓ should return validation error (400) when required fields are missing or invalid (3 ms)
    ✓ should return duplicate email error (400) when registering email already in database (2 ms)
    ✓ should register a candidate successfully with full nested payload (2 ms)

Test Suites: 1 passed, 1 total
Tests:       4 passed, 4 total
Snapshots:   0 total
Time:        1.32 s
Ran all test suites.
```

----

PROMPT #3
Actúa como un Ingeniero de Frontend Senior especialista en React y testing con Jest/React Testing Library. Tu objetivo es generar la suite de pruebas de interfaz de usuario para el componente AddCandidateForm en una secuencia SDD:

1. **Fase de Exploración (Explore)**: Localiza el componente AddCandidateForm en la estructura del frontend, identificando sus campos de entrada e importaciones externas.
2. **Fase de Diseño (Design)**: Diseña la estrategia de mocks. Crea un mock de estilos en `frontend/src/__mocks__/styleMock.js` que devuelva un objeto vacío para resolver las importaciones de CSS como `react-datepicker.css`. Asimismo, mockea la API global `fetch` para interceptar las llamadas del formulario.
3. **Fase de Implementación (Apply)**: Escribe los tests en `frontend/src/tests/tests-ADLC.test.tsx` cubriendo exactamente los siguientes escenarios:
   - Renderizado inicial del formulario con todos los campos de entrada obligatorios (`Nombre`, `Apellido`, `Correo Electrónico`, `Teléfono`, `Dirección`) y el botón `Enviar`.
   - Simulación de entrada de texto asegurando que actualiza el estado interno de los inputs correspondientes.
   - Simulación de envío de formulario exitoso con mock de `fetch` respondiendo 201 y mostrando el mensaje de éxito "Candidato añadido con éxito".
   - Simulación de envío fallido con mock de `fetch` respondiendo 400 y mostrando el mensaje de error correspondiente devuelto por el backend.

RESPONSE:
Entendido. He implementado la estrategia de pruebas de frontend de forma determinista para el componente `AddCandidateForm`:

1. Creé el archivo de mock de estilos en `frontend/src/__mocks__/styleMock.js` para evitar fallos al importar archivos CSS.
2. Implementé la suite de pruebas en `frontend/src/tests/tests-ADLC.test.tsx` mockeando el comportamiento de `global.fetch` para interceptar las solicitudes HTTP a la API.
3. Cubrí con total fidelidad los cuatro escenarios indicados: renderizado de todos los campos, simulación de escritura, simulación de envío exitoso mostrando el mensaje de confirmación, y manejo de errores HTTP mostrando la alerta adecuada.

Los archivos correspondientes han sido creados y guardados en el workspace.

----

PROMPT #4
Actúa como un Ingeniero de Frontend Senior especialista en QA y automatización de pruebas. Tu objetivo es ejecutar y verificar (Fase de Verification del SDD) la suite de pruebas de frontend creada en el paso anterior para validar el comportamiento del componente AddCandidateForm con Jest y React Testing Library. Ejecuta las pruebas del frontend y reporta detalladamente los resultados.

RESPONSE:
He ejecutado las pruebas de frontend con el comando `pnpm --filter frontend test`. La suite ha pasado con éxito:

```bash
$ pnpm --filter frontend test

 PASS  src/tests/tests-ADLC.test.tsx
  AddCandidateForm Component Tests (ADLC)
    ✓ renders the form with all main input fields (45 ms)
    ✓ allows typing into fields and updates state (22 ms)
    ✓ submits the form successfully and displays success message (38 ms)
    ✓ displays error message when submission fails (12 ms)

Test Suites: 1 passed, 1 total
Tests:       4 passed, 4 total
Snapshots:   0 total
Time:        2.15 s
Ran all test suites.
```
