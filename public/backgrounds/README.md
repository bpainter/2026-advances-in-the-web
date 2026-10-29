# Backgrounds, v5

Smooth multi-color gradients with fine film grain, generated with Higgsfield (Soul v2) on
28 October 2026 from the Slalom palette and the references in `docs/design/inspiration/v5/`
(`gradient-1.png` to `gradient-4.png` for the field, `grain-texture.webp` for the grain). No
shapes, glass objects, text, logos or people.

The files arrived at 2048 by 1152. They were resized to 1920 by 1080 (JPEG quality 88; `o7.jpg`
at 86 to stay under 900 KB) so the baked grain maps one to one to stage pixels (PRD v5, 1.1). The
shared overlay `public/theme/grain.png` is the grain of record.

Nine files were reworked after the design review (review-v5.md H8, M3, L8) to remove baked JPEG
blocks and hard shapes: `o3`, `o5`, `d5`, `f1` (removed in r7) and `closing` were blurred (sigma 8 to 16) and
`f4` and `c2` more heavily (26 and 12); `o7` and `d3` were regenerated with Higgsfield and blurred
lightly. All nine then had the same monochrome grain added (sd 4.4, quality 90, 4:4:4), so their
fine-detail energy matches the median of the untouched files.

The registry is `content/backgrounds.ts`; `pnpm backgrounds` measures the text zones into
`content/.generated/backgrounds.json`. The generation prompts were not delivered with the files;
the direction each was generated from is table 1.4 of `docs/PRD-demos-v5.md`, repeated here.

| File | Used by | Direction (lead hue first) | Tone |
|---|---|---|---|
| `v5/title.jpg` | title | Navy and cobalt blue field, magenta glow lower left, orange glow upper right | dark |
| `v5/o2.jpg` | the-mandate | Chartreuse and yellow bloom upper center, cyan wash lower left, cream base | light |
| `v5/o3.jpg` | three-reactions | Peach upper left, lavender and pale blue lower right, cream base | light |
| `v5/o4.jpg` | two-perspectives | Navy base, violet center, magenta glow right, cyan glow top left | dark |
| `v5/o5.jpg` | keep-humanity | Saturated cobalt blue with violet lower left and magenta and pink upper right | saturated |
| `v5/o6.jpg` | open-web | Pale blue, lilac and cream vertical washes, peach at the right edge | light |
| `v5/o7.jpg` | what-we-cover | Navy base, purple and cyan bands across the lower half, chartreuse and yellow glow lower right | dark |
| `v5/d1.jpg` | D1 order actions | Cyan and cobalt upper left, violet lower half, pale yellow upper right | light to mid |
| `v5/d2.jpg` | D2 product card | Beige and peach left, coral center, lavender right | light |
| `v5/d3.jpg` | D3 support form | Pale mint top, chartreuse and cyan along the bottom | light |
| `v5/d4.jpg` | D4 dashboard navigation | Pale periwinkle white, dark blue and purple sweep from the lower left | light |
| `v5/d5.jpg` | D5 rich content | Saturated violet, magenta and pink vertical bands | saturated |
| `v5/d6.jpg` | D6 variant picker | Pale grey-white top, soft cyan, pink and yellow glows across the lower middle | light |
| `v5/f2.jpg` | F2 caching | Warm grey field, cobalt blue orb left, orange and yellow glow right | light to mid |
| `v5/f3.jpg` | F3 package trust | Icy white top, cyan and navy along the bottom with a coral edge lower right | light |
| `v5/f4.jpg` | F4 Vite 8 locally | Lilac, periwinkle and pink soft blooms on white | light |
| `v5/m1.jpg` | M1 shop the look | Lavender upper left, pale yellow center, soft cyan lower right, cream base | light |
| `v5/m2.jpg` | M2 trail photos | Pale yellow and cream field, orange glow lower left, lilac haze on the right | light |
| `v5/m3.jpg` | M3 pricing app | Blush pink upper right, pale blue on the left, peach along the bottom | light |
| `v5/m4.jpg` | M4 return guide | Pale cyan top, mint center, cobalt haze along the bottom | light |
| `v5/m5.jpg` | M5 trail gear pages | White top band, coral glow upper left, peach center, purple along the bottom | light |
| `v5/c1.jpg` | what-changed | Ice white top, cobalt, purple and cyan haze rising from the bottom | light |
| `v5/c2.jpg` | people-to-follow | Cream center, yellow and coral glow upper right, orange and purple at the edges | light |
| `v5/closing.jpg` | closing | Near-black navy left, cobalt blue center, purple into a coral and pink band on the right | dark |

The five Still in motion files, `m1.jpg` to `m5.jpg` (still-in-motion-demos.md 2), were generated
with Higgsfield (Soul v2) on 28 October 2026 from the directions above. They were then blurred
(sigma 5 to 48), resized to 1920 by 1080 and given the same monochrome grain (sd 4.4, quality 90,
4:4:4) as the reworked v5 files. The registry has 25 entries (F5 was removed on 28 October 2026).
