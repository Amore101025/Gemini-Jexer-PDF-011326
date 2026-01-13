# Specification: FDA 510(k) Agentic Reviewer Pro - Ultra

## 1. Executive Summary and Mission Statement
The **FDA 510(k) Agentic Reviewer Pro - Ultra** is a state-of-the-art, AI-orchestrated platform designed specifically for Regulatory Affairs (RA) professionals, biomedical engineers, and medical device consultants. Its primary mission is to streamline the arduous process of preparing, reviewing, and synthesizing documentation for FDA 510(k) submissions. 

By leveraging the multi-modal capabilities of the Gemini 2.5 Flash and 3.0 Pro models, the application transforms raw, unstructured data (Word documents, legacy PDFs, handwritten notes) into structured, insight-rich Markdown content. The platform prioritizes "Regulatory Aesthetics," ensuring that while the back-end performs complex agentic reasoning, the front-end remains inspiring, customizable, and accessible through artistic "Painter Styles" and a sophisticated dark/light mode engine.

---

## 2. Core Architectural Pillars

### 2.1. The Document Lifecycle Engine
The application handles the "Entropy Problem" in regulatory documentation—where files exist in fragmented formats. 
- **The Converter Segment**: Utilizing `Mammoth.js` for robust DOCX-to-HTML parsing and `html2pdf.js` for high-fidelity PDF generation. This ensures that a draft created in Microsoft Word is instantly "frozen" into a regulatory-standard PDF for consistent viewing and OCR indexing.
- **The Multi-Modal Pipeline**: Integrating `PDF.js` for client-side rendering. This allows the user to perform "Partial OCR," selecting only specific technical diagrams or tabular pages (e.g., the Biocompatibility Matrix or the Predicate Comparison Table) to be sent to the Gemini 2.5 Flash model, reducing token costs and latency while maximizing accuracy.

### 2.2. The AI Note Keeper & "Magic" Suite
This is the operational heart of the application. It is not a simple text box; it is an AI-augmented workspace.
- **Auto-Processor**: A high-level agentic function that cleans up pasted text, identifies regulatory nomenclature (CFR titles, ISO standards, K-numbers), and applies a distinctive **Coral** highlighting.
- **AI Magics**: A suite of six specialized "spells" or micro-agents:
    1. **Visual Analogy**: Translating complex engineering concepts into simple metaphors.
    2. **Smart Tags**: Generating metadata for Quality Management System (QMS) integration.
    3. **Translate Mirror**: A bidirectional bridge between English and Traditional Chinese, maintaining technical nuances.
    4. **Deep Summary**: Extracting the "Critical to Quality" (CtQ) points from 50+ page documents.
    5. **Pro Polish**: Elevating engineering jargon into formal FDA-style prose.
    6. **AI Keywords**: A user-defined highlighting engine using custom colors.

---

## 3. Detailed Component Specification

### 3.1. Navigation & State Management
The application utilizes a sophisticated sidebar navigation system based on the `AppTab` enum:
- **Dashboard**: High-level telemetry of AI token usage, system health, and history.
- **Doc Converter**: The entry point for file ingestion.
- **OCR Engine**: The interface for page-level analysis.
- **AI Note Keeper**: The creative and editing workspace.
- **Summary & Entities**: The final synthesis layer.
- **Orchestration**: The conceptual hub for multi-agent strategy.
- **Settings**: The configuration layer for model selection (Flash vs Pro) and theme persistence.

### 3.2. Visual Identity & The "Style Jackpot" Engine
The UI is built on Tailwind CSS with a custom design system. The standout feature is the **Painter Style Engine**, which allows the UI to morph based on the aesthetic philosophies of 20 historical masters:
- **Van Gogh Theme**: Introduces yellow accents and bold, stroke-like borders.
- **Mondrian Theme**: Implements a strict grid-based layout with primary color borders (Red/Blue).
- **Basquiat Theme**: Switches typography to JetBrains Mono and adds raw, expressive red highlights.
- **Monet Theme**: Softens the UI with pastel Cyan and slight transparency.
- **Banksy Theme**: Grayscale filters with high-contrast stenciled elements.
This feature is designed to reduce "Reviewer Fatigue," allowing users to refresh their visual environment during long hours of document auditing.

---

## 4. Technical Logic and Prompts

### 4.1. Prompt Engineering Strategy
The application relies on highly structured `SYSTEM_PROMPTS` to maintain regulatory fidelity:
- **OCR Prompt**: Instructs the model to output *pure* Markdown while specifically identifying "Regulatory and Technical Terms" and wrapping them in the application's signature `<span style="color: coral;">` tags.
- **Magic Keyword Prompt**: Dynamically takes user input (comma-separated terms) and color hex codes to perform surgical text replacements without altering the surrounding document context.

### 4.2. Internationalization (i18n)
The application handles i18n through a `TRANSLATIONS` constant. It supports:
- **Traditional Chinese (繁體中文)**: Targeted at the significant medical device manufacturing sectors in Taiwan and Greater China.
- **English**: The global standard for FDA submissions.
The UI components dynamically react to the `settings.language` state, updating every button, label, and tooltip in real-time.

---

## 5. User Persona and Workflow Scenario

### 5.1. The "Pre-Submission Audit" Workflow
1. **Ingestion**: The user uploads a 45-page `Device_Description.docx`.
2. **Conversion**: The system renders a preview PDF and provides a download link for the regulatory record.
3. **Targeted OCR**: The user selects Pages 12-15 (containing the circuit diagrams and material lists). Gemini 2.5 Flash extracts this into Markdown.
4. **Note Augmentation**: The user moves the extracted text to the **AI Note Keeper**.
5. **Magic Application**: The user applies "Smart Tags" to categorize the materials and "Pro Polish" to refine the justification of biocompatibility.
6. **Synthesis**: The "Review Memo Generator" takes the refined notes and formats them into an "Internal Executive Summary" ready for senior management sign-off.

---

## 6. Future Expansion Capabilities (Agentic Roadmap)
While the current version is a "Reviewer Pro," the architecture is ready for:
- **RAG Integration**: Connecting the "Orchestrator" to the actual FDA Database (OpenFDA API) to pull live predicate data.
- **Multi-Agent Collaboration**: Spawning a "Biocompatibility Agent" and a "Software Validation Agent" to review separate document sections in parallel.
- **Voice-to-Memo**: Leveraging the native audio capabilities of Gemini to allow reviewers to dictate findings directly into the AI Note Keeper.

---

## 7. Implementation Guidelines for OPAL Re-generation

To recreate this app, the generation engine must:
1.  **Strictly adhere to the CSS class-based theme engine**: Ensure that `document.body.className` updates correctly to trigger the Painter styles.
2.  **Maintain the Service/Constant separation**: Keep prompts in `constants.ts` and API logic in `services/geminiService.ts` to ensure maintainability.
3.  **Ensure Asset Resilience**: Use the ES6 module imports for Lucide icons and reliable CDNs for Mammoth and PDF.js workers.
4.  **Prioritize the "Coral" Highlight**: The `#FF7F50` color is the visual anchor of the app and must be used consistently for all AI-detected regulatory terms.

---
*End of Specification Document*
