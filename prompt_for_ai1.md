Design a dark-themed hero section for the homepage of an electronics/tech-store
e-commerce site, in React + Tailwind CSS.

Layout & copy:
- Full-viewport, near-black background with a subtle diagonal light-beam accent
- Small uppercase eyebrow line above the headline
- Large, bold display headline with the brand name
- 3-4 line description paragraph in muted gray/white
- A bold secondary line acting as a CTA header (e.g. "Buy now!")
- ONE call-to-action button only — filled indigo/purple, cart icon + "Buy" label.
  No secondary "More info" button.

Background:
- Instead of a static hero image, use a looping, muted, autoplaying animated
  background that reads as "live video" — but build it with CSS keyframes or a
  <canvas> animation (drifting particles, slow light sweep) instead of an actual
  <video src> element.
- Because there's no real video file loading, there's no "Save video as" option
  on right-click — the motion only exists as running code.
- Block the context menu on the hero as a light extra deterrent.

If real video footage is used instead of a coded animation: note it can only be
made harder to save, not impossible. Strip native controls, add
controlsList="nodownload noremoteplayback", disablePictureInPicture, block
right-click, and layer a transparent div over the video to catch clicks.