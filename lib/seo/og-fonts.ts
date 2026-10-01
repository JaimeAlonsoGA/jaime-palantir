// Geist for the share image, fetched from Google Fonts at build time.
// If the network is down the image still renders, in the default font.
type Font = { name: string; data: ArrayBuffer; weight: 400 | 500 | 600 | 700; style: "normal" };

async function load(family: string, weight: Font["weight"]): Promise<Font | null> {
  try {
    const css = await (
      await fetch(`https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}:wght@${weight}`, {
        // An old user agent gets TrueType, which the image renderer can read
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/534.30 (KHTML, like Gecko)" },
      })
    ).text();
    const url = css.match(/src: url\((.+?)\) format\('(?:truetype|opentype)'\)/)?.[1];
    if (!url) return null;
    return { name: family, data: await (await fetch(url)).arrayBuffer(), weight, style: "normal" };
  } catch {
    return null;
  }
}

export async function ogFonts() {
  const fonts = await Promise.all([load("Geist", 400), load("Geist", 700), load("Geist Mono", 500)]);
  return fonts.filter((font): font is Font => font !== null);
}
