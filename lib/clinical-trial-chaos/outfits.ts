export type OutfitId =
  | "cra-business-casual"
  | "lab-coat"
  | "audit-day-suit"
  | "series-a-hoodie"
  | "wfh-mullet"
  | "lanyard-collector"
  | "borrowed-scrubs";

export type OutfitAccessory =
  "none" | "lanyard" | "lanyards" | "stethoscope" | "tie" | "hood" | "headset";

/**
 * Colours for the player avatar. Every value is a hex colour so the same
 * palette can drive the canvas sprite and DOM previews.
 */
export interface OutfitPalette {
  top: string;
  bottom: string;
  skin: string;
  hair: string;
  accent: string;
}

export interface OutfitConfig {
  id: OutfitId;
  name: string;
  tagline: string;
  /** Audit-trail line written when the player clocks in wearing this outfit. */
  clockInLine: string;
  palette: OutfitPalette;
  accessory: OutfitAccessory;
  /** Coats hang past the waist and cover the top of the legs. */
  longCoat: boolean;
  /** Plaid pyjama bottoms instead of plain trousers. */
  plaidBottoms: boolean;
}

/**
 * Selectable player outfits. They are purely cosmetic: no outfit changes
 * scoring, timers, the auditor or the sponsor.
 */
export const OUTFITS: readonly OutfitConfig[] = [
  {
    id: "cra-business-casual",
    name: "CRA Business Casual",
    tagline: "Dressed for a site visit you'll spend in a supply closet.",
    clockInLine:
      "You clocked in wearing business casual. The site coordinator assumed you were from IT.",
    palette: {
      top: "#1e3a8a",
      bottom: "#a8a29e",
      skin: "#f1c27d",
      hair: "#3f2a1d",
      accent: "#10b981",
    },
    accessory: "lanyard",
    longCoat: false,
    plaidBottoms: false,
  },
  {
    id: "lab-coat",
    name: "Lab Coat (Never Been Near a Lab)",
    tagline: "Nobody asks questions when you wear the coat.",
    clockInLine:
      "You clocked in wearing a lab coat. The auditor asked which lab. You said 'the data lab'.",
    palette: {
      top: "#f4f4f5",
      bottom: "#334155",
      skin: "#c68642",
      hair: "#111827",
      accent: "#94a3b8",
    },
    accessory: "stethoscope",
    longCoat: true,
    plaidBottoms: false,
  },
  {
    id: "audit-day-suit",
    name: "Audit Day Suit",
    tagline: "Only worn when the FDA is in the building. Still has the tags.",
    clockInLine:
      "You clocked in wearing the audit suit. The auditor noticed the price tag. Suspicion unchanged.",
    palette: {
      top: "#27272a",
      bottom: "#27272a",
      skin: "#e0ac69",
      hair: "#1c1917",
      accent: "#dc2626",
    },
    accessory: "tie",
    longCoat: false,
    plaidBottoms: false,
  },
  {
    id: "series-a-hoodie",
    name: "Series-A Hoodie",
    tagline: "Company swag. The company is nine months old.",
    clockInLine:
      "You clocked in wearing the startup hoodie. Three people asked if you're hiring.",
    palette: {
      top: "#18181b",
      bottom: "#1d4ed8",
      skin: "#8d5524",
      hair: "#0c0a09",
      accent: "#f59e0b",
    },
    accessory: "hood",
    longCoat: false,
    plaidBottoms: false,
  },
  {
    id: "wfh-mullet",
    name: "The WFH Mullet",
    tagline: "Business on camera. Pyjamas off camera.",
    clockInLine:
      "You clocked in wearing a dress shirt and pyjama bottoms. Please do not stand up during the audit call.",
    palette: {
      top: "#e0f2fe",
      bottom: "#7c3aed",
      skin: "#ffdbac",
      hair: "#92400e",
      accent: "#38bdf8",
    },
    accessory: "headset",
    longCoat: false,
    plaidBottoms: true,
  },
  {
    id: "lanyard-collector",
    name: "Conference Lanyard Collector",
    tagline: "A badge from every DIA meeting since 2011. Wears them all.",
    clockInLine:
      "You clocked in wearing seven conference lanyards. The metal detector has filed a deviation.",
    palette: {
      top: "#0f766e",
      bottom: "#44403c",
      skin: "#f1c27d",
      hair: "#a8a29e",
      accent: "#f43f5e",
    },
    accessory: "lanyards",
    longCoat: false,
    plaidBottoms: false,
  },
  {
    id: "borrowed-scrubs",
    name: "Borrowed Scrubs",
    tagline: "Site coordinator solidarity. Please return by Friday.",
    clockInLine:
      "You clocked in wearing borrowed scrubs. A patient asked you for a blood draw. You declined, compliantly.",
    palette: {
      top: "#0e7490",
      bottom: "#0e7490",
      skin: "#c68642",
      hair: "#1f2937",
      accent: "#67e8f9",
    },
    accessory: "none",
    longCoat: false,
    plaidBottoms: false,
  },
];

export const DEFAULT_OUTFIT_ID: OutfitId = "cra-business-casual";

/**
 * Resolves an outfit by id, falling back to the default outfit for unknown ids.
 */
export function getOutfitById(id: string | null | undefined): OutfitConfig {
  return OUTFITS.find((o) => o.id === id) ?? OUTFITS[0];
}

/**
 * The subset of the Canvas 2D API the avatar renderer needs, so it can be
 * driven by a real context or a lightweight test double.
 */
export type AvatarCanvas = Pick<
  CanvasRenderingContext2D,
  | "fillStyle"
  | "strokeStyle"
  | "lineWidth"
  | "fillRect"
  | "beginPath"
  | "arc"
  | "fill"
  | "moveTo"
  | "lineTo"
  | "stroke"
>;

/**
 * Draws the player avatar in the given outfit. (`x`, `baseY`) is the point
 * between the feet; the sprite is 22 units wide and 44 tall at `scale` 1.
 */
export function drawOutfitAvatar(
  ctx: AvatarCanvas,
  x: number,
  baseY: number,
  outfit: OutfitConfig,
  scale = 1
): void {
  const s = scale;
  const { palette } = outfit;
  const rect = (
    dx: number,
    dy: number,
    w: number,
    h: number,
    color: string
  ) => {
    ctx.fillStyle = color;
    ctx.fillRect(x + dx * s, baseY + dy * s, w * s, h * s);
  };
  const line = (points: [number, number][], color: string, width = 1) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = width * s;
    ctx.beginPath();
    points.forEach(([px, py], i) => {
      if (i === 0) ctx.moveTo(x + px * s, baseY + py * s);
      else ctx.lineTo(x + px * s, baseY + py * s);
    });
    ctx.stroke();
  };
  const circle = (dx: number, dy: number, r: number, color: string) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x + dx * s, baseY + dy * s, r * s, 0, Math.PI * 2);
    ctx.fill();
  };

  // Legs and shoes
  rect(-6, -14, 5, 13, palette.bottom);
  rect(1, -14, 5, 13, palette.bottom);
  if (outfit.plaidBottoms) {
    for (const dy of [-11, -7, -3]) rect(-6, dy, 12, 1, palette.accent);
    for (const dx of [-4, 3]) rect(dx, -14, 1, 13, palette.accent);
  }
  rect(-7, -2, 6, 2, "#18181b");
  rect(1, -2, 6, 2, "#18181b");

  // Hood sits behind the head
  if (outfit.accessory === "hood") circle(0, -35, 8, palette.top);

  // Arms, hands and torso
  rect(-11, -29, 3, 12, palette.top);
  rect(8, -29, 3, 12, palette.top);
  circle(-9.5, -16, 1.8, palette.skin);
  circle(9.5, -16, 1.8, palette.skin);
  rect(-8, -30, 16, outfit.longCoat ? 22 : 16, palette.top);
  if (outfit.longCoat)
    line(
      [
        [0, -30],
        [0, -8],
      ],
      palette.accent
    );

  // Head and hair
  circle(0, -36, 6, palette.skin);
  ctx.fillStyle = palette.hair;
  ctx.beginPath();
  ctx.arc(x, baseY - 37 * s, 6 * s, Math.PI, Math.PI * 2);
  ctx.fill();

  switch (outfit.accessory) {
    case "lanyard":
      line(
        [
          [-5, -30],
          [0, -22],
          [5, -30],
        ],
        palette.accent
      );
      rect(-2, -22, 4, 5, "#f4f4f5");
      break;
    case "lanyards":
      ["#f43f5e", "#f59e0b", "#38bdf8"].forEach((color, i) => {
        line(
          [
            [-6 + i, -30],
            [-1 + i * 2, -24 + i * 2],
            [6 - i, -30],
          ],
          color
        );
        rect(-3 + i * 2, -24 + i * 2, 3, 4, "#f4f4f5");
      });
      break;
    case "stethoscope":
      line(
        [
          [-5, -30],
          [-4, -22],
          [0, -20],
          [4, -22],
          [5, -30],
        ],
        palette.accent,
        1.2
      );
      circle(0, -20, 1.8, palette.accent);
      break;
    case "tie":
      rect(-1, -30, 2, 11, palette.accent);
      rect(-2, -30, 4, 2, palette.accent);
      break;
    case "hood":
      line(
        [
          [-2, -30],
          [-2, -25],
        ],
        palette.accent
      );
      line(
        [
          [2, -30],
          [2, -25],
        ],
        palette.accent
      );
      break;
    case "headset":
      line(
        [
          [-6, -37],
          [-6, -44],
          [6, -44],
          [6, -37],
        ],
        "#27272a",
        1.2
      );
      line(
        [
          [-6, -35],
          [-3, -32],
        ],
        "#27272a",
        1
      );
      circle(-2.5, -31.5, 1.2, palette.accent);
      break;
    case "none":
      break;
  }
}
