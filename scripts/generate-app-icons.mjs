import sharp from "sharp";

const orange = "#F4772B";
const svgForSize = (size, maskable = false) => {
  const wordmarkSize = Math.round(size * (maskable ? 0.19 : 0.22));
  const x = size / 2;
  const y = size / 2 + wordmarkSize * 0.34;
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="${orange}"/>
      <text x="${x}" y="${y}" text-anchor="middle" fill="#000" font-family="Work Sans, DejaVu Sans, Arial, sans-serif" font-size="${wordmarkSize}" letter-spacing="-0.055em">
        <tspan font-weight="400">Bar</tspan><tspan font-weight="800">Os</tspan>
      </text>
    </svg>`;
};

const icons = [
  [180, "public/icons/apple-touch-icon.png"],
  [192, "public/icons/icon-192.png"],
  [512, "public/icons/icon-512.png"],
  [512, "public/icons/icon-maskable-512.png", true],
];

await Promise.all(icons.map(([size, output, maskable = false]) => sharp(Buffer.from(svgForSize(size, maskable))).png().toFile(output)));
