# Evoke — Design Plan

Subject: a browser-based 3D game-creation tool (build worlds, publish, play).
Audience: hobbyist creators, teens–20s, used to Roblox Studio / Figma / Discord.
Single job of the shell: get someone from "I have an idea" to "I'm placing blocks in the Studio" in under 30 seconds.

## Palette
- --bg-void:      #0B0C10   (app background, near-black with a blue cast, not pure black)
- --bg-surface:   #14161C   (panels, cards)
- --bg-raised:    #1C1F27   (raised panels, modals, toolbars)
- --border-hair:  #2A2E38   (hairline borders)
- --accent-arc:   #6E5BFF   (primary accent — electric violet, the "Evoke spark")
- --accent-arc-dim: #4B3FCC
- --accent-mint:  #35E6B0   (success / publish / online state)
- --accent-amber: #FFB454   (warnings, draft state)
- --text-primary: #EDEFF5
- --text-muted:   #8B90A0

Rationale: avoids the cream/terracotta default and the flat near-black+single-neon default by pairing
a cool void background with a violet "arc" accent evoking a spark/energy — ties to the "Evoke" name
(evoke = to call forth/summon) — plus a mint secondary for live/publish states, distinguishing
draft vs. published across the whole product.

## Type
- Display: "Cabinet Grotesk" (fallback: "Inter", sans-serif) — geometric, slightly technical, used only
  for hero/page titles and the logotype, at wide tracking on small sizes.
- Body/UI: "Inter" — neutral, dense-legible, used for all interface chrome (panels, labels, buttons).
- Mono/data: "JetBrains Mono" — used for coordinate values, transform numbers in the Properties panel,
  asset file sizes — anywhere a raw value is shown, to visually mark it as data vs. label.

## Layout concept
Shell = persistent left rail (nav, icon+label) + top bar (search, avatar) + content canvas.
Studio breaks this: full-bleed 3D viewport with floating glass panels (Explorer left, Properties right,
Toolbar top-center floating pill, Asset drawer bottom) — panels float over the canvas rather than
boxing it in, so the viewport always reads as the primary surface, like Figma's canvas-first layout.

ASCII (Shell):
+--+--------------------------------------------------+
|N |  topbar: search .......................  avatar  |
|a +--------------------------------------------------+
|v |                                                   |
|  |   content (home / discover / games / profile)     |
|  |                                                   |
+--+--------------------------------------------------+

ASCII (Studio):
+----------------------------------------------------+
| [floating toolbar pill: select move rotate scale]   |
|Ex|                                              |Pr |
|pl|            3D VIEWPORT (full bleed)          |op |
|or|                                              |s  |
|  +----------------------------------------------+   |
|  |   asset drawer (collapsible, bottom)          |   |
+----------------------------------------------------+

## Signature element
"The Arc" — a thin animated gradient stroke (violet → mint) that traces the active edge of whatever
panel/tool is focused (e.g. outlines the selected tool in the toolbar, underlines the active nav item,
rings the avatar on hover). One consistent motion primitive, used sparingly, instead of scattered
micro-animations — it's the one thing that moves with intention across every screen.
