import { motion } from 'framer-motion';

export type EmotionType = 'neutral' | 'happy' | 'angry' | 'sad' | 'surprised';
export type ClothingType = 'tshirt' | 'hoodie' | 'jacket' | 'dress';

interface CharacterProps {
  skin: string;
  hairColor: string;
  clothingColor: string;
  gender: 'male' | 'female';
  emotion?: EmotionType;
  clothing?: ClothingType;
}

const PixelCharacter = ({ char }: { char: CharacterProps }) => {
  const { skin, hairColor, clothingColor, gender, emotion = 'neutral', clothing = 'tshirt' } = char;

  const skinDark = adjustColor(skin, -20);
  const skinLight = adjustColor(skin, 15);
  const hairDark = adjustColor(hairColor, -30);
  const hairLight = adjustColor(hairColor, 20);
  const clothDark = adjustColor(clothingColor, -25);
  const clothLight = adjustColor(clothingColor, 15);

  const breathVariants = {
    animate: {
      y: [0, -1.5, 0],
      transition: { duration: 2.8, repeat: Infinity, ease: 'easeInOut' as const },
    },
  };

  const blinkVariants = {
    animate: {
      scaleY: [1, 1, 0.1, 1, 1],
      transition: {
        duration: 4,
        repeat: Infinity,
        times: [0, 0.45, 0.5, 0.55, 1],
        ease: 'easeInOut' as const,
      },
    },
  };

  const renderEyes = () => {
    switch (emotion) {
      case 'happy':
        return (
          <>
            <path d="M24 20 Q27 18 30 20" stroke="#1e3a8a" strokeWidth="2" fill="none" />
            <path d="M34 20 Q37 18 40 20" stroke="#1e3a8a" strokeWidth="2" fill="none" />
          </>
        );

      case 'angry':
        return (
          <>
            {/* Left eye */}
            <rect x="24" y="19" width="6" height="5" fill="#ffffff" />
            <rect x="25" y="20" width="3" height="3" fill="#dc2626" />
            <rect x="26" y="21" width="2" height="2" fill="#1e1e1e" />

            {/* Right eye */}
            <rect x="34" y="19" width="6" height="5" fill="#ffffff" />
            <rect x="35" y="20" width="3" height="3" fill="#dc2626" />
            <rect x="36" y="21" width="2" height="2" fill="#1e1e1e" />

            {/* Left eyebrow — slants DOWN toward center (inner corner lower) */}
            {/* from (24,15) to (30,17) → inner side lower = angry */}
            <line x1="24" y1="15" x2="30" y2="17" stroke={hairDark} strokeWidth="2.5" strokeLinecap="square" />

            {/* Right eyebrow — slants DOWN toward center (inner corner lower) */}
            {/* from (34,17) to (40,15) → inner side lower = angry */}
            <line x1="34" y1="17" x2="40" y2="15" stroke={hairDark} strokeWidth="2.5" strokeLinecap="square" />
          </>
        );

      case 'sad':
        return (
          <>
            {/* Left eyebrow slants UP toward center = sad */}
            <line x1="24" y1="17" x2="30" y2="15" stroke={hairDark} strokeWidth="2" strokeLinecap="square" />
            {/* Right eyebrow slants UP toward center = sad */}
            <line x1="34" y1="15" x2="40" y2="17" stroke={hairDark} strokeWidth="2" strokeLinecap="square" />
            {/* Sad eyes */}
            <rect x="24" y="18" width="6" height="6" fill="#ffffff" />
            <rect x="26" y="19" width="3" height="4" fill="#60a5fa" />
            <rect x="27" y="20" width="2" height="2" fill="#1e3a8a" />
            <rect x="34" y="18" width="6" height="6" fill="#ffffff" />
            <rect x="35" y="19" width="3" height="4" fill="#60a5fa" />
            <rect x="36" y="20" width="2" height="2" fill="#1e3a8a" />
            {/* Tear drop */}
            <rect x="29" y="24" width="2" height="3" fill="#60a5fa" opacity="0.7" />
          </>
        );

      case 'surprised':
        return (
          <>
            {/* Raised eyebrows */}
            <rect x="24" y="14" width="6" height="2" fill={hairDark} />
            <rect x="34" y="14" width="6" height="2" fill={hairDark} />
            {/* Big round eyes */}
            <rect x="23" y="17" width="8" height="8" fill="#ffffff" />
            <rect x="25" y="18" width="4" height="6" fill="#3b82f6" />
            <rect x="26" y="19" width="2" height="4" fill="#1e3a8a" />
            <rect x="25" y="18" width="1" height="1" fill="#ffffff" />
            <rect x="33" y="17" width="8" height="8" fill="#ffffff" />
            <rect x="35" y="18" width="4" height="6" fill="#3b82f6" />
            <rect x="36" y="19" width="2" height="4" fill="#1e3a8a" />
            <rect x="35" y="18" width="1" height="1" fill="#ffffff" />
          </>
        );

      default: // neutral
        return (
          <motion.g variants={blinkVariants} animate="animate" style={{ transformOrigin: '32px 21px' }}>
            <rect x="24" y="16" width="6" height="2" fill={hairDark} />
            <rect x="34" y="16" width="6" height="2" fill={hairDark} />
            <rect x="24" y="18" width="6" height="6" fill="#ffffff" />
            <rect x="26" y="19" width="3" height="4" fill="#3b82f6" />
            <rect x="27" y="20" width="2" height="2" fill="#1e3a8a" />
            <rect x="26" y="19" width="1" height="1" fill="#ffffff" />
            <rect x="34" y="18" width="6" height="6" fill="#ffffff" />
            <rect x="35" y="19" width="3" height="4" fill="#3b82f6" />
            <rect x="36" y="20" width="2" height="2" fill="#1e3a8a" />
            <rect x="35" y="19" width="1" height="1" fill="#ffffff" />
          </motion.g>
        );
    }
  };

  const renderMouth = () => {
    switch (emotion) {
      case 'happy':
        return (
          <>
            <rect x="28" y="27" width="8" height="3" fill="#be185d" />
            <rect x="29" y="28" width="6" height="2" fill="#ffffff" opacity="0.8" />
          </>
        );
      case 'angry':
        return <rect x="28" y="28" width="8" height="1" fill="#7f1d1d" />;
      case 'sad':
        return <path d="M28 30 Q32 27 36 30" stroke="#be185d" strokeWidth="2" fill="none" />;
      case 'surprised':
        return (
          <>
            <ellipse cx="32" cy="29" rx="3" ry="4" fill="#be185d" />
            <ellipse cx="32" cy="28" rx="2" ry="2" fill="#111" />
          </>
        );
      default:
        return (
          <>
            <rect x="28" y="28" width="8" height="2" fill="#be185d" />
            <rect x="29" y="28" width="6" height="1" fill="#f472b6" opacity="0.5" />
          </>
        );
    }
  };

  const renderClothing = () => {
    const isFemale = gender === 'female';

    switch (clothing) {
      case 'hoodie':
        return (
          <g>
            <rect x="18" y="34" width="28" height="28" fill={clothingColor} />
            <rect x="18" y="34" width="4" height="28" fill={clothDark} />
            <rect x="42" y="34" width="4" height="28" fill={clothDark} />
            <rect x="16" y="28" width="32" height="10" fill={clothDark} />
            <rect x="22" y="48" width="20" height="10" fill={clothDark} opacity="0.5" />
            <rect x="22" y="48" width="20" height="2" fill={clothLight} opacity="0.3" />
            <rect x="28" y="38" width="2" height="12" fill={clothLight} />
            <rect x="34" y="38" width="2" height="12" fill={clothLight} />
            <rect x="24" y="32" width="16" height="4" fill={clothLight} opacity="0.4" />
            {isFemale ? (
              <ellipse cx="32" cy="36" rx="6" ry="4" fill={skin} />
            ) : (
              <rect x="26" y="32" width="12" height="6" fill={skin} />
            )}
          </g>
        );

      case 'jacket':
        return (
          <g>
            <rect x="18" y="34" width="28" height="28" fill={clothingColor} />
            <rect x="31" y="34" width="2" height="28" fill="#71717a" />
            <rect x="30" y="38" width="1" height="2" fill="#a1a1aa" />
            <rect x="30" y="44" width="1" height="2" fill="#a1a1aa" />
            <rect x="30" y="50" width="1" height="2" fill="#a1a1aa" />
            <rect x="18" y="34" width="13" height="28" fill={clothingColor} />
            <rect x="18" y="34" width="4" height="28" fill={clothDark} />
            <rect x="33" y="34" width="13" height="28" fill={clothingColor} />
            <rect x="42" y="34" width="4" height="28" fill={clothDark} />
            <polygon points="24,34 28,40 28,34" fill={clothDark} />
            <polygon points="40,34 36,40 36,34" fill={clothDark} />
            <rect x="28" y="36" width="8" height="6" fill="#ffffff" />
            {isFemale ? (
              <rect x="26" y="32" width="12" height="4" fill={skin} />
            ) : (
              <rect x="28" y="32" width="8" height="4" fill={skin} />
            )}
          </g>
        );

      case 'dress':
        if (!isFemale) return renderTshirt();
        return (
          <g>
            <rect x="20" y="34" width="24" height="16" fill={clothingColor} />
            <rect x="20" y="34" width="4" height="16" fill={clothDark} />
            <rect x="40" y="34" width="4" height="16" fill={clothDark} />
            <polygon points="16,50 48,50 52,80 12,80" fill={clothingColor} />
            <polygon points="16,50 24,50 20,80 12,80" fill={clothDark} />
            <polygon points="40,50 48,50 52,80 44,80" fill={clothDark} />
            <rect x="24" y="52" width="2" height="26" fill={clothDark} opacity="0.3" />
            <rect x="32" y="52" width="2" height="26" fill={clothLight} opacity="0.3" />
            <rect x="38" y="52" width="2" height="26" fill={clothDark} opacity="0.3" />
            <ellipse cx="32" cy="36" rx="8" ry="4" fill={skin} />
            <rect x="30" y="38" width="4" height="3" fill={clothLight} />
            <rect x="28" y="39" width="2" height="2" fill={clothLight} />
            <rect x="34" y="39" width="2" height="2" fill={clothLight} />
          </g>
        );

      default:
        return renderTshirt();
    }
  };

  const renderTshirt = () => {
    const isFemale = gender === 'female';
    return (
      <g>
        <rect x="20" y="34" width="24" height="28" fill={clothingColor} />
        <rect x="20" y="34" width="4" height="28" fill={clothDark} />
        <rect x="40" y="34" width="4" height="28" fill={clothDark} />
        <rect x="30" y="34" width="4" height="28" fill={clothLight} opacity="0.3" />
        {isFemale && (
          <>
            <rect x="20" y="50" width="2" height="8" fill={clothDark} opacity="0.3" />
            <rect x="42" y="50" width="2" height="8" fill={clothDark} opacity="0.3" />
            <ellipse cx="28" cy="42" rx="4" ry="3" fill={clothDark} opacity="0.15" />
            <ellipse cx="36" cy="42" rx="4" ry="3" fill={clothDark} opacity="0.15" />
          </>
        )}
        {!isFemale ? (
          <>
            <rect x="26" y="32" width="12" height="6" fill={skin} />
            <rect x="28" y="34" width="8" height="4" fill={skinDark} opacity="0.3" />
            <polygon points="28,38 32,44 36,38" fill={clothDark} />
          </>
        ) : (
          <>
            <rect x="24" y="32" width="16" height="6" fill={skin} />
            <rect x="26" y="34" width="12" height="4" fill={skinDark} opacity="0.3" />
            <ellipse cx="32" cy="38" rx="6" ry="3" fill={clothDark} />
          </>
        )}
        <rect x="20" y="58" width="24" height="4" fill="#0f172a" />
        <rect x="30" y="58" width="4" height="4" fill="#fbbf24" />
      </g>
    );
  };

  const renderLegs = () => {
    if (clothing === 'dress' && gender === 'female') {
      return (
        <g>
          <rect x="24" y="76" width="6" height="6" fill={skin} />
          <rect x="34" y="76" width="6" height="6" fill={skin} />
        </g>
      );
    }
    return (
      <g>
        <rect x="22" y="60" width="8" height="22" fill="#1e293b" />
        <rect x="22" y="60" width="2" height="22" fill="#0f172a" />
        <rect x="28" y="60" width="2" height="22" fill="#334155" />
        <rect x="34" y="60" width="8" height="22" fill="#1e293b" />
        <rect x="34" y="60" width="2" height="22" fill="#0f172a" />
        <rect x="40" y="60" width="2" height="22" fill="#334155" />
        <rect x="24" y="68" width="4" height="2" fill="#0f172a" opacity="0.5" />
        <rect x="36" y="68" width="4" height="2" fill="#0f172a" opacity="0.5" />
      </g>
    );
  };

  return (
    <svg
      viewBox="0 0 64 96"
      className="w-full h-full pixel-shadow"
      style={{ imageRendering: 'pixelated' }}
    >
      <defs>
        <linearGradient id="clothShine" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={clothLight} />
          <stop offset="50%" stopColor={clothingColor} />
          <stop offset="100%" stopColor={clothDark} />
        </linearGradient>
        <linearGradient id="hairShine" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={hairLight} />
          <stop offset="100%" stopColor={hairDark} />
        </linearGradient>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="32" cy="92" rx="18" ry="4" fill="rgba(0,0,0,0.4)" />

      {/* LEGS */}
      {renderLegs()}

      {/* SHOES */}
      <g>
        <rect x="20" y="80" width="12" height="8" fill="#111827" />
        <rect x="20" y="80" width="12" height="2" fill="#1f2937" />
        <rect x="18" y="84" width="4" height="4" fill="#111827" />
        <rect x="20" y="86" width="8" height="2" fill="#0a0a0a" />
        <rect x="32" y="80" width="12" height="8" fill="#111827" />
        <rect x="32" y="80" width="12" height="2" fill="#1f2937" />
        <rect x="42" y="84" width="4" height="4" fill="#111827" />
        <rect x="36" y="86" width="8" height="2" fill="#0a0a0a" />
      </g>

      <motion.g variants={breathVariants} animate="animate">
        {/* ARMS */}
        <g>
          <rect x="12" y="36" width="8" height="6" fill={clothingColor} />
          <rect x="12" y="36" width="2" height="6" fill={clothDark} />
          <rect x="14" y="42" width="6" height="14" fill={skin} />
          <rect x="14" y="42" width="2" height="14" fill={skinDark} />
          <rect x="18" y="42" width="2" height="14" fill={skinLight} />
          <rect x="14" y="54" width="6" height="6" fill={skin} />
          <rect x="12" y="56" width="2" height="4" fill={skin} />
          <rect x="44" y="36" width="8" height="6" fill={clothingColor} />
          <rect x="50" y="36" width="2" height="6" fill={clothDark} />
          <rect x="44" y="42" width="6" height="14" fill={skin} />
          <rect x="44" y="42" width="2" height="14" fill={skinDark} />
          <rect x="48" y="42" width="2" height="14" fill={skinLight} />
          <rect x="44" y="54" width="6" height="6" fill={skin} />
          <rect x="50" y="56" width="2" height="4" fill={skin} />
        </g>

        {/* TORSO */}
        {renderClothing()}

        {/* NECK */}
        <rect x="28" y="28" width="8" height="8" fill={skin} />
        <rect x="28" y="28" width="2" height="8" fill={skinDark} />
        <rect x="34" y="28" width="2" height="8" fill={skinLight} />

        {/* HEAD */}
        <g>
          <rect x="22" y="12" width="20" height="20" fill={skin} />
          <rect x="22" y="12" width="3" height="20" fill={skinDark} />
          <rect x="39" y="12" width="3" height="20" fill={skinDark} />
          <rect x="25" y="20" width="4" height="4" fill={skinLight} opacity="0.4" />
          <rect x="35" y="20" width="4" height="4" fill={skinLight} opacity="0.4" />
          <rect x="26" y="30" width="12" height="2" fill={skin} />
        </g>

        {/* FACE FEATURES — rendered BEFORE hair so hair draws on top */}
        <g>
          {renderEyes()}
          {/* Nose */}
          <rect x="31" y="22" width="2" height="4" fill={skinDark} opacity="0.4" />
          {renderMouth()}
          {(emotion === 'happy' || emotion === 'surprised') && (
            <>
              <rect x="23" y="24" width="3" height="2" fill="#fca5a5" opacity="0.4" />
              <rect x="38" y="24" width="3" height="2" fill="#fca5a5" opacity="0.4" />
            </>
          )}
        </g>

        {/* HAIR — drawn LAST so it layers over face/eyebrows correctly */}
        {gender === 'male' ? (
          <g>
            <rect x="20" y="8" width="24" height="6" fill={hairColor} />
            <rect x="22" y="6" width="20" height="4" fill={hairColor} />
            <rect x="24" y="4" width="16" height="4" fill={hairLight} />
            <rect x="18" y="10" width="4" height="6" fill={hairColor} />
            <rect x="42" y="10" width="4" height="6" fill={hairColor} />
            {/* Side parts */}
            <rect x="18" y="12" width="4" height="4" fill={hairColor} />
            <rect x="42" y="12" width="4" height="4" fill={hairColor} />
            {/* Highlight streaks */}
            <rect x="26" y="6" width="2" height="4" fill={hairDark} />
            <rect x="30" y="5" width="2" height="5" fill={hairDark} />
            <rect x="36" y="6" width="2" height="4" fill={hairDark} />
            <rect x="28" y="6" width="2" height="3" fill={hairLight} opacity="0.6" />
            <rect x="34" y="6" width="2" height="3" fill={hairLight} opacity="0.6" />
          </g>
        ) : (
          <g>
            <rect x="18" y="6" width="28" height="12" fill={hairColor} />
            <rect x="20" y="4" width="24" height="4" fill={hairLight} />
            <rect x="14" y="10" width="8" height="30" fill={hairColor} />
            <rect x="42" y="10" width="8" height="30" fill={hairColor} />
            <rect x="14" y="10" width="3" height="30" fill={hairDark} />
            <rect x="47" y="10" width="3" height="30" fill={hairDark} />
            <rect x="19" y="12" width="2" height="20" fill={hairLight} opacity="0.4" />
            <rect x="43" y="12" width="2" height="20" fill={hairLight} opacity="0.4" />
            <rect x="22" y="8" width="6" height="8" fill={hairColor} />
            <rect x="36" y="8" width="6" height="8" fill={hairColor} />
            <rect x="28" y="6" width="8" height="6" fill={hairLight} opacity="0.5" />
            <rect x="24" y="8" width="2" height="6" fill={hairDark} />
            <rect x="38" y="8" width="2" height="6" fill={hairDark} />
            <rect x="16" y="14" width="4" height="4" fill="#ec4899" />
            <rect x="17" y="15" width="2" height="2" fill="#f9a8d4" />
          </g>
        )}

        {/* EARS */}
        <rect x="20" y="18" width="4" height="6" fill={skin} />
        <rect x="40" y="18" width="4" height="6" fill={skin} />
        <rect x="21" y="19" width="2" height="4" fill={skinDark} opacity="0.3" />
        <rect x="41" y="19" width="2" height="4" fill={skinDark} opacity="0.3" />
      </motion.g>
    </svg>
  );
};

function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

export default PixelCharacter;