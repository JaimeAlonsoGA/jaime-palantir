// Pure helpers, safe on the client. Measuring images lives in media.ts (server only).

/** portrait: phone screenshots (they carry their own bezel). landscape: screens, drawn in a window frame. */
export type Shape = "portrait" | "landscape";

export const shapeOf = (ratio: number): Shape => (ratio < 0.9 ? "portrait" : "landscape");
