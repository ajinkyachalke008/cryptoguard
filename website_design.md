<user_request>Redesign the homepage and supporting components into a futuristic, premium, engaging site with the following requirements:

1. General Theme:
   - Color scheme: black + neon golden, with glowing highlights and premium futuristic vibe.
   - Futuristic UI: neon-gold borders, soft glows, glassmorphism overlays.
   - Remove old 3D coin.
   - Hero background: animated shader with golden neon particles + subtle waves.
   - Add global dark/light toggle: default is black + neon-gold, light mode has white + gold.

2. Hero Section:
   - Trust badge: "NEW • AI Fraud Detection" with ⚡ glowing icon.
   - Headline:
     - Line 1: "Cryptoguard" in animated neon-gold gradient.
     - Line 2: "AI Crypto Fraud Detection" in glowing gold (#FFD700).
   - Subtitle: white/gray centered.
   - Buttons:
     - Primary: "Launch Live Demo" → glowing neon-gold button.
     - Secondary: "View Dashboard" → outline glowing button.
     - Registration → opens modal (see section 8).
   - Hover effects: buttons slightly enlarge with glowing shadows.
   - Interactive cursor: small neon particles trail behind the mouse.

3. 3D Realistic Earth Globe (Centerpiece Demo):
   - Ultra-realistic rotating earth globe.
   - Countries visible with glowing gold borders.
   - Real-time transactions visualized as glowing arcs/dots:
     - Green = safe
     - Orange = risky
     - Red = fraud
   - Arcs animate between source & destination (e.g., India → US).
   - Globe rotates slowly, user can drag to spin.
   - Fraud "heatmap" overlay: brighter glow on countries with more fraud.
   - Floating glowing labels for top transaction countries.
   - Use Three.js or react-globe.gl.

4. Real-Time Transaction Feed + Analytics:
   - Directly below globe: transaction feed list with neon glow highlights.
   - Each feed entry synced to globe arc.
   - Status colors:
     - Safe → green glow
     - Risky → orange glow
     - Fraud → red glow
   - Below feed:
     - Graph (Chart.js / Recharts): transactions per minute, color-coded.
     - Leaderboard table: "Top Fraudulent Countries" (ranked, with flags).
     - Standard transaction table: Tx ID, Amount, From, To, Risk Status (with glowing badges).

5. Features Section:
   - Three glowing futuristic feature cards:
     - "Real-time Risk Scoring"
     - "Graph + Rules + LLM Hybrid Detection"
     - "Exports & Case Bundles"
   - Hover: 3D tilt effect + neon outline glow.

6. Solutions Section:
   - Title: "Our Solutions" in glowing gold.
   - 3–4 solution cards with HD futuristic images + glowing borders.
   - On click → modal opens with mini demo (animated fraud dashboard, compliance report, graph network).
   - Cards float with subtle hover parallax.

7. Engagement & Extra Features:
   - Floating 3D crypto icons (BTC, ETH, USDT) orbit around globe in background.
   - Voice interaction button in navbar: users can ask AI questions like "Show latest fraud in Asia".
   - Particle background that responds to mouse movement.
   - Neon glowing timeline (optional) to showcase company milestones.
   - Leaderboard carousel: displays top safe and fraud-prone countries dynamically.

8. Registration Section:
   - Button in hero/nav triggers neon-glowing modal.
   - Modal: black background, neon-gold glowing borders.
   - Fields: Name, Email, Organization, Password.
   - Submit with glowing animation.
   - Modal fade/slide with glow edges.

9. Footer:
   - Black background, glowing gold links:
     - Explore features · About us · Contact
   - Social media glowing icons.
   - Toggle switch for dark/light mode.

10. Backend / Data Hooks (for Orchids integration):
   - Transaction globe + feed + graphs should consume mock API (ready to connect with backend).
   - Registration form posts to endpoint.
   - Leaderboard + heatmap update dynamically from transaction data.

11. Animation & Interactivity:
   - Hero: neon particle background with slow golden pulses.
   - Globe: rotating + interactive arcs with glowing trails.
   - Feed: items slide in with neon flashes.
   - Graphs: animate when new data arrives.
   - Cards: hover tilt with neon outlines.
   - Cursor: trailing golden sparks.
   - Voice AI: simple placeholder mic button → opens modal "Ask Cryptoguard".
   - All animations must feel premium, futuristic, engaging.

Final Goal:
Website must feel like a futuristic AI-powered fraud detection platform. 
Design is premium black + neon-gold, engaging with 3D globe visualization, real-time transaction arcs, synced feed/graphs, glowing futuristic UI, interactive registration, and advanced extra features (voice interaction, leaderboard, crypto icons). 
The experience should feel immersive, cutting-edge, and visually stunning.</user_request>

<todo_list>
1. Create futuristic hero section with animated neon-gold particle background, trust badge, headline with gradient text, subtitle, and glowing buttons with hover effects
2. Build 3D Earth globe component using Three.js with realistic textures, rotating animation, transaction arcs (green/orange/red), country borders, and interactive drag controls
3. Implement real-time transaction feed, analytics charts, and leaderboard components with neon glow effects and color-coded status indicators synced to globe arcs
4. Create features and solutions sections with 3D tilt hover effects, glowing cards, modal demos, and floating crypto icons orbiting the globe
5. Add navigation with voice interaction button, registration modal with neon styling, footer with dark/light toggle, interactive cursor trails, and responsive particle backgrounds
</todo_list>