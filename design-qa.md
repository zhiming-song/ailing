# Design QA

## Scope

- Desktop first-pass layout checked in the local browser preview.
- Hero, about, experience, work category switcher, and contact closeout are present.
- Primary navigation buttons scroll to their sections.
- Work category tabs switch content between 长视频、短视频、直播礼物、图片作品。
- Media placeholders are intentional and ready for later photo/video replacement.
- Homepage v2 checked with a fixed blurred background, movable foreground layer, top-right avatar, three header entries, and four circular project entry points.
- Header avatar uses the original photo with its bathroom/mirror background preserved in `public/media/avatar-full.png`.
- About page skill tags use loose positioning with hover, floating motion, and click-selected feedback matching the `hello!` interaction.

## Result

final result: passed

## Short Video Depth Carousel — 2026-08-26

**Evidence**

- Source visual truth: `/private/tmp/short-film-reference-final.png` (existing short-film page).
- Implementation: `/private/tmp/short-video-implementation-matched.png`.
- Side-by-side comparison: `/private/tmp/short-video-design-comparison-final.png`.
- Both comparison captures: 1129 × 712 px, browser CSS viewport 1280 × 720, device density 2, initial first-card state.
- Responsive check: 390 × 844 CSS px; no horizontal or vertical overflow.

**Full-view comparison**

- The header, green blurred background, title hierarchy, centered 3D card, corner radius, video controls, footer and depth treatment match the existing short-film visual system.
- The only intended content changes are `短片` → `短视频`, project number `03` → `02`, and the supplied video/poster artwork.

**Focused region comparison**

- A separate crop was not required because the matched full-view capture clearly resolves the headline, eyebrow, card edge, play control and footer typography at equal pixel dimensions.

**Required fidelity surfaces**

- Fonts and typography: same `Noto Serif SC` and `DM Mono` hierarchy, sizes, weights and letter spacing as the source component.
- Spacing and layout rhythm: same section shell, heading offsets, card proportions, footer height, radii and controls; six-card mode adds only progressively receding background layers.
- Colors and visual tokens: source green background, translucent borders, dark footer and white text tokens are reused without substitution.
- Image quality and asset fidelity: all six supplied videos are used directly; generated posters preserve each source aspect ratio and videos use `object-fit: contain`.
- Copy and content: order verified as AI全系车色、主播样片、雪山狐狸、节目预热—西游记混剪、飞驰人生转场、果蝇恋爱. No descriptions were added.

**Interaction checks**

- Previous/next controls, mouse wheel, drag and arrow-key handlers are present.
- Six cards render and cycle in the requested order.
- MP4 playback verified; the MOV file reports readyState 4, no media error, and advances playback.
- Console errors checked: none.

**Comparison history**

- Initial implementation had no actionable P0/P1/P2 visual mismatch against the reused short-film component.
- Desktop 1440 × 1024 and mobile 390 × 844 responsive checks passed; no corrective visual iteration was required.

**Follow-up polish**

- P3: the supplied videos are large, but `preload="none"` prevents inactive cards from downloading until playback is requested.

final result: passed

Follow-up: replace `/media/hero.mp4` and the media placeholder blocks with the user's final visual assets in the next iteration.

## Live Gift Page — Background Revision

- Source image: `/Users/a123/Desktop/网页作品集/截屏2026-08-22 20.31.45.png`.
- Checked the live-gift route in the local browser at desktop size.
- The supplied cloud-and-princess artwork now fills the viewport behind the portrait video.
- The outer background uses a soft 12px blur; a clipped central layer retains a partially legible subject and cloud silhouette.
- Purple-blue shading and edge darkening preserve text contrast and keep the portrait video as the primary focal point.
- Video loading and playback were verified (10.25 seconds, playback advances normally).
- Mobile-specific blur and brightness values remain responsive.

final result: passed

## Homepage reference recreation — 2026-08-28

### Source and evidence

- Source: `/Users/a123/Desktop/截屏2026-08-28 19.05.45.png` (1638 × 792).
- Desktop: `/tmp/ailing-home-desktop-final.png` (1117 × 541 capture; CSS viewport 1132 × 548; reported DPR 1). The browser capture excludes the scrollbar and slightly scales the visible content. Compared at the same approximate 2.07:1 aspect ratio, using relativeproportional placement rather than literal pixel identity.
- Mobile: `/tmp/ailing-home-mobile-final.png` (375 × 812 capture; CSS viewport 390 × 844).
- State: homepage, initial rail position, no modal. Source and final desktop screenshot were displayed together in one comparison input. The full view resolves the headline, portrait and card proportions; source navigation microtext is too blurry to identify its exact original font, so bilingual labels are an intentional replacement.

### Findings and comparison history

- First desktop pass: [P2] fixed spacing at smaller desktop sizes pushed the card row down. Replaced desktop spacing with proportional viewport sizing; final evidence shows the enlarged second card beginning near the same relative height as the reference.
- First mobile pass: [P2] intrinsic portrait dimensions overrode the circular container's aspect ratio. Positioned the image inside the square container; verified width and height are both 222.30 CSS px at 390px viewport. Final mobile screenshot shows a circle without page overflow.
- [P2] React reported keys spread through card props. Keys are now explicit on both button and anchor branches; final fresh-page console check returned no errors.
- No outstanding P0/P1/P2 visual issues in the agreed adaptation. This is a reference-based recreation with user-approved personal-content changes, not pixel-identical artwork reproduction.

### Required fidelity surfaces

- Typography: bold sans-serif Chinese name, white PORTFOLIO, lime role label and small introductory line follow the reference hierarchy. System Chinese sans-serif replaces the unreadable reference font; no font download is required for the hero.
- Layout: centered pill navigation; left copy near 19% width; circular portrait near 56% width; staggered portrait cards below. Desktop first three cards have distinct scale/rotation. Mobile stacks copy and portrait while keeping horizontal card browsing.
- Color: dark blue-green surface, lime accent, off-white secondary note, dark outlined secondary CTA. Background uses a faint existing image texture. Exact source glow/noise and screenshot compression are not replicated.
- Images: original portrait and existing work posters retained in full color; all ten homepage images load. No replacement person, fake project image or screenshot play overlay is used.
- Content: 刘爱玲 / 内容运营, existing education information, ten selected cards. First three remain 《舍得》, AI全系车色, 《我们都是追梦人》. Corporate film stays available in the original short-film collection, while an image-work entry occupies its homepage slot.

### Interaction verification

- Wheel: rail scrollLeft changed 0 → 180 (maximum 189), without moving the page.
- Horizontal drag: rail changed 180 → 30; dialog count stayed 0.
- Previous arrow: rail returned to 0.
- First three videos and 云上星梦 each opened their correct video source in the same-page dialog; close returned to homepage without navigation.
- 《舍得》 native video controls played successfully: paused false, currentTime advanced, duration 389.14 seconds, no media error.
- Image card opened `/ailing/works/image-works/`; existing return-to-portfolio link remained present.
- Homepage navigation returned to `#home`. Ten card entries rendered, with no broken homepage images.
- Mobile page and navigation stayed within viewport width. Touch uses the same pointer drag handlers, but physical touch hardware was not tested.

### Follow-up polish

- P3: original screenshot font, compressed texture and exact glow are not available as source assets. Personal photograph and project artwork differ intentionally at the user's request.

final result: passed

## 2026-08-28 — Homepage refinements and shared dark-teal theme

### Scope and visual evidence

- Preserve the existing reference-led composition and interactions; apply the user's approved photo, navigation, equal-size cards, centered priorities and site-wide palette changes.
- Source visual truth: `/tmp/ailing-home-desktop-final.png` (1117×541), `/tmp/ailing-home-mobile-final.png` (375×812), plus the user's explicit amendments. Original art direction: `/Users/a123/Desktop/截屏2026-08-28 19.05.45.png`.
- Final implementation: `/tmp/ailing-theme-home-final.png` (1117×541) and `/tmp/ailing-theme-mobile-final.png` (375×812).
- Desktop CSS viewport 1132×548; mobile 390×844; browser DPR 2. Browser screenshots were emitted at matching above dimensions; source and implementation are matched output pairs with no manual rescaling. Each pair was opened together in the same comparison call. State: homepage, no dialog, priority group centered (intentional change from left-aligned original).
- Additional rendered evidence: `/tmp/ailing-theme-tablet.png` (820×900 CSS viewport), `/tmp/ailing-theme-about.png`, `/tmp/ailing-theme-about-mobile.png`, `/tmp/ailing-theme-experience.png`, `/tmp/ailing-theme-work.png`, `/tmp/ailing-theme-film.png`, `/tmp/ailing-theme-short-video.png`, `/tmp/ailing-theme-gift.png`, `/tmp/ailing-theme-mobile-modal.png`.
- Focused checks: DOM dimensions and hover transforms for all homepage cards; avatar square/circular crop; header/introduction spacing on the image gallery. Full-view source/implementation comparisons were sufficient for the unchanged hero hierarchy; focused DOM facts verified equal sizes independently of perspective/rotation.

### Findings and correction history

- [Resolved P2] Homepage widths differed across the first three cards and on mobile. Removed all nth-child width overrides; retained tilt/offset composition. Desktop all ten cards measure 106×142 CSS px at 1132px viewport, tablet 120×172 at 820px, mobile 132×189 at 390px. CSS uses shared fractional dimensions; measurements are rounded by offsetWidth/Height.
- [Resolved P2] Resize after initial load could leave the priority group off-center. A resize observer centers the group until browsing begins, without overriding subsequent user scrolling. Final desktop group-center error was −0.22px. Order is Cloud Dream, image works, host sample, then 舍得 / AI全系车色 / 我们都是追梦人, followed by remaining shorts.
- [Resolved P2] Existing image-page intro sat in the header at y45px, overlapping the return area. Evidence `/tmp/ailing-theme-images.png`; corrected spacing in `/tmp/ailing-theme-images-fixed.png`. Both screenshots were emitted together at 1132×548. Header ends at 84px, introduction begins at 102px and ends at 120px, first active card begins at 178px. Mobile checked in `/tmp/ailing-theme-images-mobile.png`.
- No remaining actionable P0/P1/P2 visual findings. Original source compression/font differences remain acceptable P3; no claim of pixel-identical identity-preserving photo editing.

### Required fidelity surfaces

- Typography: homepage hierarchy and sizes retained; corresponding sections use the same system Chinese sans-serif family. Lime section labels/headings, pale body copy, subdued secondary text. Existing compact monospace metadata remains where useful.
- Spacing/layout: hero composition, circular portrait, capsule navigation, card rotations, About lanyard, timeline, and collection carousels preserved. Only requested equalization/reordering and the identified introduction collision changed layout. Desktop, tablet and mobile show no document-width overflow.
- Colors/tokens: `portfolio-theme.css` centralizes #081a1c background, #dbf52b accent, #f6f7ef text, #b8c9c5 muted text and dark translucent panels. Images/videos retain their previous rendering; company logos retain light tiles. Live Gift cloud image and blur remain unchanged. Image gallery retains a subdued reactive color glow.
- Images: new 1254×1254 portrait is centered in the existing circle; homepage has no broken images. About intentionally keeps its existing certificate portrait and lanyard. Existing project assets are unchanged.
- Copy/content: both homepage About links say to the existing #about section; no new route. Original biography and work descriptions preserved. First three priority works remain together and centrally presented.

### Interaction and build verification

- Homepage wheel: scrollLeft 96 → 236, page scrollY stayed 0. Horizontal mouse drag: 236 → 126, no modal opened accidentally.
- Hover: active pointer over the AI card, computed matrix stayed `matrix(1, 0, 0, 1, 0, 0)`. Click-only opening class scales 1.045, then opens after 160ms; reduced-motion uses no delay/transition.
- Each priority card opened the correct video: shede.m4v, short-video/ai-colors.mp4, dreamers.m4v. Native controls present, paused initially. Close and Escape restore homepage browsing; mobile modal also checked visually.
- Body and top-nav About links both reach #about (top approximately 76px, clear of fixed navigation). No extra About page was created.
- All four collection return links reach /ailing/#work (work top approximately 76px, homepage above viewport), not the hero.
- Short-film and short-video next controls change active video correctly; image carousel ArrowRight selects the next image.
- Cloud background still uses `/ailing/images/live-gift-backdrop.png` with original blur(12px), brightness(.68), saturate(.96).
- Development HMR emitted two existing createRoot warnings while main.jsx imports were edited. A final fresh-navigation run produced zero new error logs; these are not hidden as production errors.
- Final Vite build passed in `/tmp/ailing-theme-build-0828-final`; git diff --check passed. Branch remains develop; no commits, master operations or remote pushes.

### Photo asset provenance

- Source: `/Users/a123/Desktop/IMG_8616.heic` (format-converted to PNG for inspection).
- Output: `/Users/a123/Documents/Codex/vibe coding/src/assets/home-portrait-teal.png`.
- Built-in image_gen edit, not CLI/API fallback. Prompt: replace only the background with deep blue-green #081a1c; make a centered square upper-body portrait for circular cropping; strictly retain the person's identity, expression, hair, blue clothing, phone, hand pose and occlusion; no beautification, skin smoothing, face replacement, new props, borders or text.
- Visual inspection found no obvious identity changes; generative background replacement is not pixel-exact masking.

final result: passed
