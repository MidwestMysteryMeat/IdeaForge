# IdeaForge

A single-file, zero-dependency **inspiration slot machine** for game developers and tool builders. One big button. Every pull generates a coherent, usable project idea — with a rarity system, XP, streaks, daily challenges, and a persistent codex of everything you've discovered.

**No build step. No frameworks. No server.** Open `index.html` in any modern browser and start pulling.

## What a pull gives you

Every idea is fully structured:

- **Category** — Game, Engine/Middleware, Tool/Utility, Web/Desktop App, Creative Software, or Experimental/Weird Tech
- **Genre / Type** — 18 game genres, 10 engine archetypes, and dozens of software niches
- **Working title** — punchy, generated
- **Core hook** — one strong sentence
- **3–5 key features** — pulled from hand-written, genre-coherent tables (no random word soup)
- **Twist / constraint** — tiered from grounded ("16-color palette, chosen once") to reality-bending ("the whole game state fits in a URL")
- **Platform and scope** — from weekend prototype to ambitious

Higher rarities unlock genre fusions (Roguelike × Card Battler, Networking-first Voxel Engine), wilder twists, and stranger platforms. Mythic pulls get two twists and a special animation.

## The game around the generator

- **Rarity tiers** — Common → Uncommon → Rare → Epic → Legendary → Mythic, with particles, screen shake, flashes, and per-rarity audio
- **Creative Rank** — XP per pull, streak multipliers, seven level titles from Novice to Mythic Creator
- **Streaks** — pull again within 45 seconds to keep it; 5+ sets you On Fire
- **Codex** — every unique idea is saved locally; "New Discovery!" banner for first-time finds
- **Daily challenges** — three per day; completing them grants XP and unlocks color themes
- **Favorites, history, copy-as-text, export-as-Markdown**
- **Surprise Me Harder** — dramatically better odds of Rare+ and weirder combinations

Everything persists in `localStorage`. Nothing leaves the page.

## Controls

| Input | Action |
|---|---|
| Click **PULL IDEA** / `Space` / `Enter` | Generate an idea |
| `Esc` | Close the codex |
| 📚 Codex | Browse discoveries, favorites, themes, stats |
| 🌶 Harder | Toggle high-rarity mode |
| 🔊 | Toggle sound |

## Development

The entire app is `index.html`. A Node smoke test validates the generator (field integrity across 1000 ideas, rarity/category coverage, the full pull → XP → codex → persistence path, fusion rules, daily rollover):

```
node test/smoke.js
```

## License

Apache-2.0 — see [LICENSE](LICENSE) and [NOTICE](NOTICE).
