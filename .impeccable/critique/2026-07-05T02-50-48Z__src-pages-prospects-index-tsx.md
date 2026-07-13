---
target: Prospectos
total_score: 23
p0_count: 0
p1_count: 2
timestamp: 2026-07-05T02-50-48Z
slug: src-pages-prospects-index-tsx
---
### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Shows active filter counts and loading states clearly |
| 2 | Match System / Real World | 2 | Uses internal jargon like "CRM" in headers and "Kanban" in tooltips |
| 3 | User Control and Freedom | 3 | Good modal dismissals and filter clearing |
| 4 | Consistency and Standards | 3 | Adheres to a consistent visual language |
| 5 | Error Prevention | 2 | Filter behavior contradicts its own UI; drag-drop is fragile |
| 6 | Recognition Rather Than Recall | 3 | Status counts and clear visual tags reduce memory load |
| 7 | Flexibility and Efficiency | 1 | Complete lack of keyboard shortcuts or bulk actions |
| 8 | Aesthetic and Minimalist Design | 2 | Kanban cards are cluttered with redundant primary/secondary buttons |
| 9 | Error Recovery | 3 | Clean empty states guiding users to adjust filters |
| 10 | Help and Documentation | 1 | No contextual help or onboarding hints |
| **Total** | | **23/40** | **[Acceptable]** |

### Anti-Patterns Verdict

**LLM Assessment:**
Yes, there are strong AI tells here:
- **Card action clutter:** Every `ProspectCard` ends with identical generic "Chat" and "Detalles" buttons. This is classic AI padding. The card itself is already clickable, making the "Detalles" button completely redundant visual noise.
- **The "Fake" Apply Button:** `FiltrosPanel` updates filters live via immediate `onChange` calls, but includes an "Aplicar" button at the bottom that just closes the drawer. This is a common AI structural hallucination (mixing immediate-sync logic with deferred-sync UI).
- **Titling redundancy:** The header explicitly says "Prospectos (CRM)", which feels like an LLM echoing its prompt rather than writing human-centric copy. 

**Deterministic Scan (7 findings across 3 files):**
- **glassmorphism** in `KanbanColumn.tsx` (1 hit): Used `bg-surface-container-lowest/50 backdrop-blur-sm`.
- **uppercase-tracked-eyebrow** (6 hits): Found across `KanbanColumn.tsx`, `ProspectList.tsx`, and `FiltrosPanel.tsx`. 

*False Positives:* The uppercase-tracked-eyebrows in tables (`<thead>`) and filter drawers are standard data-UI patterns for hierarchy, not the marketing "kickers" the rule aims to catch. The glassmorphism on the Kanban column might also be an intentional functional choice for letting a complex background bleed through softly.

### Overall Impression
The foundation is highly functional and scales reasonably well, but the interface suffers from "AI surface noise" — redundant buttons everywhere, a fake "Apply" button, and HTML5 drag-and-drop which completely breaks on touch devices. The single biggest opportunity is cleaning up the Kanban cards to remove noise and fixing the Filtros UI model.

### What's Working
1. **Clean View Toggling:** The switch between Kanban and List views is seamless and well-implemented, preserving state gracefully.
2. **Scannability:** Good use of color-coding for channels (WhatsApp, etc.) and statuses makes the list highly readable.
3. **Empty States:** The system gracefully handles empty search/filter results with clear reset calls to action instead of broken UI.

### Priority Issues

**[P1] Fake "Aplicar" Button in Filters**
- **Why it matters:** It breaks the mental model. Users think changes won't apply until they click "Aplicar", but the UI updates instantly behind the drawer.
- **Fix:** Remove the "Aplicar" button completely. Rely on immediate sync and rename the top dismiss button to "Cerrar".
- **Suggested command:** `$impeccable clarify`

**[P1] Native HTML5 Drag-and-Drop is Inaccessible and Mobile-Broken**
- **Why it matters:** `draggable` and `onDragStart` (used in `ProspectCard`) are notoriously broken on touch devices and entirely inaccessible via keyboard.
- **Fix:** Replace native HTML5 drag with a robust library (e.g., `@dnd-kit/core`) that supports touch sensors and keyboard navigation.
- **Suggested command:** `$impeccable harden`

**[P2] Redundant Action Buttons on Kanban Cards**
- **Why it matters:** 50 cards on screen means 100 identical buttons competing for attention, causing severe visual clutter.
- **Fix:** Remove the "Detalles" button entirely (make the whole card clickable). Move the "Chat" action to a subtle icon button on hover, or keep it in the 360 modal.
- **Suggested command:** `$impeccable distill`

**[P2] Lack of Accelerators**
- **Why it matters:** Power users managing CRM pipelines need speed. Clicking "Nuevo Prospecto" every time is tedious.
- **Fix:** Add basic keyboard shortcuts (e.g., `C` for create, `V` to toggle view).
- **Suggested command:** `$impeccable overdrive`

### Persona Red Flags

**Alex (Power User)**
- No keyboard shortcuts for any primary actions.
- No bulk actions (cannot move 5 prospects to 'Convertido' at once).
- Forced to use mouse for repetitive kanban dragging.

**Jordan (First-Timer)**
- Jargon in the UI ("CRM" in the header, "Kanban" in the tooltip).
- The filters panel immediate-sync behavior will make them hesitate, wondering if they broke something before clicking "Aplicar".

**Casey (Mobile User)**
- HTML5 `draggable` will completely fail on touch.
- Fixed-width columns (320px each = 1920px total) means endless sideways scrolling on small screens.

### Minor Observations
- The `<select>` dropdowns in `FiltrosPanel` (Tour/Agent) look unstyled/native compared to the highly custom channel toggle buttons.
- Tooltips saying "Vista Kanban" could be localized to "Vista de tablero".

### Questions to Consider
- Does every Kanban card really need explicit "Chat" and "Detalles" buttons, or is the card itself the affordance?
- What if the list view was the default on mobile, and the kanban view was the default on desktop?
- Could the filters drawer be replaced by a simpler, more immediate filter bar above the board?
