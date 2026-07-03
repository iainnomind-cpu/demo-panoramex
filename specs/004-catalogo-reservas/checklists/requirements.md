# Specification Quality Checklist: Catálogo de Tours y Módulo de Reservas

**Purpose**: Validate specification completeness and quality before proceeding to planning
**Created**: 2026-07-03
**Feature**: [spec.md](../spec.md)

## Content Quality

- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

## Requirement Completeness

- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Success criteria are technology-agnostic (no implementation details)
- [x] All acceptance scenarios are defined
- [x] Edge cases are identified
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

## Feature Readiness

- [x] All functional requirements have clear acceptance criteria
- [x] User scenarios cover primary flows
- [x] Feature meets measurable outcomes defined in Success Criteria
- [x] No implementation details leak into specification

## Completeness & Clarity

- [ ] CHK001 ¿Está especificada matemáticamente la regla de cálculo para el "saldo pendiente" (e.g. total_amount - deposit_amount)? [Clarity, Spec §FR-RES-002]
- [ ] CHK002 ¿Están enumerados los datos exactos que deben incluirse en el documento PDF de confirmación? [Completeness, Spec §FR-RES-007]
- [ ] CHK003 ¿La "alerta visual" para el umbral de cupo mínimo está definida con criterios de UI específicos (colores, íconos)? [Clarity, Spec §FR-CAT-007]
- [ ] CHK004 ¿Están definidos explícitamente los campos obligatorios para registrar a un pasajero individual (solo nombre, o también edad/ID)? [Completeness, Spec §FR-RES-002]

## Consistency

- [ ] CHK005 ¿Las políticas de permisos de visualización y edición para las reservas (`reservations`) son consistentes con las definidas para el catálogo? [Consistency, Gap]
- [ ] CHK006 ¿El comportamiento del sistema ante reservas concurrentes está definido consistentemente con la regla de validación de cupo en el momento exacto del guardado? [Consistency, Spec §FR-RES-004]

## Coverage & Edge Cases

- [ ] CHK007 ¿Están definidos los requerimientos de recuperación si la generación del PDF falla por timeout en Vercel? [Coverage, Exception Flow]
- [ ] CHK008 ¿Está especificado el comportamiento si el número de WhatsApp del prospecto es inválido o Meta Cloud API devuelve un error de rate limit? [Coverage, Spec §FR-RES-006]
- [ ] CHK009 ¿Existen requerimientos que definan el proceso de cancelación parcial de pasajeros dentro de una misma reserva? [Edge Case, Gap]
- [ ] CHK010 ¿Están definidas las reglas sobre quién puede cancelar una reserva y cómo se manejan los reembolsos de depósito? [Coverage, Gap]
- [ ] CHK011 ¿Se especifica cómo manejar escenarios donde un tour quede inactivo (`is_active = false`) pero aún tenga reservas futuras confirmadas? [Edge Case, Gap]

## Measurability & Non-Functional

- [ ] CHK012 ¿El requisito de carga en "< 3 segundos" incluye explícitamente las condiciones de latencia de red esperadas? [Measurability, Spec §SC-001]
- [ ] CHK013 ¿El tiempo de respuesta del chatbot de "< 1 segundo" es verificable de manera automatizada bajo carga? [Measurability, Spec §SC-005]
- [ ] CHK014 ¿Están documentadas las implicaciones de privacidad o manejo de PII (Personally Identifiable Information) para la lista de pasajeros? [Non-Functional, Gap]

## Notes

- El permiso `can_edit_catalog` ya existe en la tabla `agents` (feature 001); esta spec lo reutiliza sin redefinirlo.
- Pagos en línea están explícitamente fuera de alcance (ver Assumptions).
- La integración con el chatbot (feature 003) es de solo lectura; se detalla en FR-CAT-008 y SC-005.
