const { useState, useEffect, useCallback, useRef, useMemo } = React;
const T = { WALL: 0, FLOOR: 1, STAIRS: 2, TRAP: 3, CHEST: 4, SECRET: 5, PIT: 6, FIRE: 7, FOUNTAIN: 8, ICE: 10, LAVA: 11, WATER: 12, VOID: 13, SHOP: 14 };
const MW = 36, MH = 26, VR = 5;
const rng = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const uid = () => Math.random().toString(36).slice(2, 8);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function xpFor(l) {
  return 30 + l * 25 + Math.floor(l * l * 0.5);
}
const FLOOR_CONFIGS = (() => {
  const P = [
    { bg: "#13110d", wall: "#55503a", floor: "#2d2820", accent: "#c9a84c", haz: T.TRAP },
    { bg: "#14120a", wall: "#504832", floor: "#2a2418", accent: "#bba040", haz: T.PIT },
    { bg: "#110f0b", wall: "#4a4430", floor: "#28221a", accent: "#aa9838", haz: T.PIT },
    { bg: "#16130c", wall: "#5a5040", floor: "#302a20", accent: "#d0a848", haz: T.TRAP },
    { bg: "#12100a", wall: "#4e4836", floor: "#2c261e", accent: "#c0a044", haz: T.PIT },
    { bg: "#151008", wall: "#584e3a", floor: "#2e2818", accent: "#ccaa4c", haz: T.TRAP },
    { bg: "#100e0a", wall: "#464030", floor: "#262018", accent: "#b89c3c", haz: T.FIRE },
    { bg: "#141108", wall: "#524a38", floor: "#2a2416", accent: "#c4a440", haz: T.PIT },
    { bg: "#0f0d0a", wall: "#4c4634", floor: "#28221a", accent: "#b8a03a", haz: T.TRAP },
    { bg: "#181410", wall: "#5e5644", floor: "#342e24", accent: "#d8b050", haz: T.FIRE },
    { bg: "#0a1a0e", wall: "#2a4a2e", floor: "#1a2e1a", accent: "#44cc66", haz: T.WATER },
    { bg: "#0c1c10", wall: "#2e4e32", floor: "#1c3020", accent: "#48d06a", haz: T.WATER },
    { bg: "#081808", wall: "#264428", floor: "#182c18", accent: "#3ec060", haz: T.TRAP },
    { bg: "#0e1e12", wall: "#325236", floor: "#1e3222", accent: "#50d470", haz: T.WATER },
    { bg: "#0a1a0c", wall: "#2c482c", floor: "#1a2e1c", accent: "#42c864", haz: T.PIT },
    { bg: "#0c1c0e", wall: "#304e30", floor: "#1c3020", accent: "#4ace68", haz: T.WATER },
    { bg: "#08180a", wall: "#28462a", floor: "#182c1a", accent: "#3cc45e", haz: T.TRAP },
    { bg: "#0e1e10", wall: "#345234", floor: "#203222", accent: "#52d672", haz: T.WATER },
    { bg: "#0a1c0e", wall: "#2e4c2e", floor: "#1c301e", accent: "#46ca66", haz: T.PIT },
    { bg: "#101e14", wall: "#385638", floor: "#223626", accent: "#58da78", haz: T.WATER },
    { bg: "#1a1008", wall: "#5a4020", floor: "#2a1e10", accent: "#ffaa22", haz: T.PIT },
    { bg: "#1c1208", wall: "#5e4424", floor: "#2c2012", accent: "#ffb030", haz: T.PIT },
    { bg: "#181006", wall: "#56401e", floor: "#281e10", accent: "#ffa820", haz: T.FIRE },
    { bg: "#1e140a", wall: "#624828", floor: "#2e2214", accent: "#ffb438", haz: T.PIT },
    { bg: "#1a100a", wall: "#584222", floor: "#2a2012", accent: "#ffac28", haz: T.FIRE },
    { bg: "#1c1208", wall: "#5c4424", floor: "#2c2014", accent: "#ffae2c", haz: T.PIT },
    { bg: "#160e06", wall: "#523c1c", floor: "#261c0e", accent: "#ffa41e", haz: T.FIRE },
    { bg: "#1e1408", wall: "#604826", floor: "#302214", accent: "#ffb636", haz: T.PIT },
    { bg: "#18100a", wall: "#564020", floor: "#281e10", accent: "#ffa824", haz: T.FIRE },
    { bg: "#20160c", wall: "#664c2a", floor: "#322618", accent: "#ffba40", haz: T.LAVA },
    { bg: "#0e0e1e", wall: "#3a3a5a", floor: "#1a1a2e", accent: "#8888ff", haz: T.VOID },
    { bg: "#10101e", wall: "#3c3c5c", floor: "#1c1c30", accent: "#9090ff", haz: T.TRAP },
    { bg: "#0c0c1c", wall: "#383858", floor: "#18182c", accent: "#8080ff", haz: T.VOID },
    { bg: "#121220", wall: "#3e3e5e", floor: "#1e1e32", accent: "#9898ff", haz: T.TRAP },
    { bg: "#0e0e1e", wall: "#3a3a5a", floor: "#1a1a2e", accent: "#8888ff", haz: T.VOID },
    { bg: "#101020", wall: "#3c3c5e", floor: "#1c1c30", accent: "#8c8cff", haz: T.TRAP },
    { bg: "#0c0c1a", wall: "#363656", floor: "#16162a", accent: "#7c7cff", haz: T.VOID },
    { bg: "#121222", wall: "#404060", floor: "#202034", accent: "#9c9cff", haz: T.VOID },
    { bg: "#0e0e1c", wall: "#383858", floor: "#18182c", accent: "#8484ff", haz: T.TRAP },
    { bg: "#141424", wall: "#424264", floor: "#222238", accent: "#a4a4ff", haz: T.VOID },
    { bg: "#1e0a0a", wall: "#5a2210", floor: "#2e1408", accent: "#ff4422", haz: T.LAVA },
    { bg: "#200c0c", wall: "#5e2614", floor: "#30160a", accent: "#ff4e2a", haz: T.LAVA },
    { bg: "#1c0808", wall: "#56200e", floor: "#2c1208", accent: "#ff3e1e", haz: T.FIRE },
    { bg: "#220e0e", wall: "#622818", floor: "#32180c", accent: "#ff5632", haz: T.LAVA },
    { bg: "#1e0a0a", wall: "#5a2412", floor: "#2e1408", accent: "#ff4826", haz: T.LAVA },
    { bg: "#200c0a", wall: "#5c2614", floor: "#30160a", accent: "#ff502c", haz: T.FIRE },
    { bg: "#1a0808", wall: "#541e0e", floor: "#2a1206", accent: "#ff3a1c", haz: T.LAVA },
    { bg: "#220e0c", wall: "#602a18", floor: "#321a0c", accent: "#ff5834", haz: T.LAVA },
    { bg: "#1c0a0a", wall: "#582212", floor: "#2c1408", accent: "#ff4424", haz: T.FIRE },
    { bg: "#241010", wall: "#642c1a", floor: "#341c0e", accent: "#ff6038", haz: T.LAVA },
    { bg: "#0a1018", wall: "#3a5a6a", floor: "#1a2a34", accent: "#66ddff", haz: T.ICE },
    { bg: "#0c121a", wall: "#3c5c6c", floor: "#1c2c36", accent: "#6ee0ff", haz: T.ICE },
    { bg: "#080e16", wall: "#385868", floor: "#182832", accent: "#60d8ff", haz: T.ICE },
    { bg: "#0e141c", wall: "#3e5e6e", floor: "#1e2e38", accent: "#74e4ff", haz: T.ICE },
    { bg: "#0a1018", wall: "#3a5a6a", floor: "#1a2a34", accent: "#68dcff", haz: T.ICE },
    { bg: "#0c121a", wall: "#3c5c6e", floor: "#1c2c36", accent: "#6ee2ff", haz: T.ICE },
    { bg: "#080e14", wall: "#365866", floor: "#162830", accent: "#5ed6ff", haz: T.ICE },
    { bg: "#0e141e", wall: "#406070", floor: "#20303a", accent: "#78e6ff", haz: T.ICE },
    { bg: "#0a1018", wall: "#3a5a6a", floor: "#1a2a34", accent: "#66deff", haz: T.ICE },
    { bg: "#101620", wall: "#426272", floor: "#22323c", accent: "#7ceaff", haz: T.ICE },
    { bg: "#10081a", wall: "#3a2a4a", floor: "#1e1028", accent: "#bb66ff", haz: T.VOID },
    { bg: "#120a1c", wall: "#3c2c4c", floor: "#20122a", accent: "#c06eff", haz: T.VOID },
    { bg: "#0e0618", wall: "#382848", floor: "#1c0e26", accent: "#b660ff", haz: T.VOID },
    { bg: "#140c1e", wall: "#3e2e4e", floor: "#22142c", accent: "#c474ff", haz: T.VOID },
    { bg: "#10081a", wall: "#3a2a4a", floor: "#1e1028", accent: "#bc68ff", haz: T.VOID },
    { bg: "#120a1c", wall: "#3c2c4e", floor: "#20122a", accent: "#c270ff", haz: T.VOID },
    { bg: "#0e0616", wall: "#362646", floor: "#1a0e24", accent: "#b25eff", haz: T.VOID },
    { bg: "#140c20", wall: "#403050", floor: "#24162e", accent: "#c878ff", haz: T.VOID },
    { bg: "#10081a", wall: "#3a2a4a", floor: "#1e1028", accent: "#be6aff", haz: T.VOID },
    { bg: "#160e22", wall: "#423252", floor: "#261830", accent: "#cc7eff", haz: T.VOID },
    { bg: "#1a0e08", wall: "#5a3a1a", floor: "#2e1e0e", accent: "#ff8800", haz: T.LAVA },
    { bg: "#1c100a", wall: "#5c3c1c", floor: "#302010", accent: "#ff9010", haz: T.FIRE },
    { bg: "#180c06", wall: "#583818", floor: "#2c1c0c", accent: "#ff8200", haz: T.LAVA },
    { bg: "#1e120c", wall: "#5e3e1e", floor: "#322212", accent: "#ff9818", haz: T.LAVA },
    { bg: "#1a0e08", wall: "#5a3a1a", floor: "#2e1e0e", accent: "#ff8a04", haz: T.FIRE },
    { bg: "#1c100a", wall: "#5c3e1c", floor: "#302010", accent: "#ff9212", haz: T.LAVA },
    { bg: "#160c06", wall: "#563616", floor: "#2a1a0c", accent: "#ff7e00", haz: T.FIRE },
    { bg: "#1e120e", wall: "#60401e", floor: "#342414", accent: "#ff9c1c", haz: T.LAVA },
    { bg: "#1a0e08", wall: "#5a3a1a", floor: "#2e1e0e", accent: "#ff8c08", haz: T.LAVA },
    { bg: "#201410", wall: "#624220", floor: "#362616", accent: "#ffa224", haz: T.LAVA },
    { bg: "#081410", wall: "#2a4a3a", floor: "#122a20", accent: "#22ffaa", haz: T.VOID },
    { bg: "#0a1612", wall: "#2c4c3c", floor: "#142c22", accent: "#2affb0", haz: T.VOID },
    { bg: "#06120e", wall: "#284838", floor: "#10281e", accent: "#1effa4", haz: T.VOID },
    { bg: "#0c1814", wall: "#2e4e3e", floor: "#162e24", accent: "#30ffb6", haz: T.VOID },
    { bg: "#081410", wall: "#2a4a3a", floor: "#122a20", accent: "#24ffac", haz: T.VOID },
    { bg: "#0a1612", wall: "#2c4c3e", floor: "#142c22", accent: "#2cffb2", haz: T.VOID },
    { bg: "#06100e", wall: "#264636", floor: "#0e261c", accent: "#1cff9e", haz: T.VOID },
    { bg: "#0c1816", wall: "#305040", floor: "#183026", accent: "#34ffba", haz: T.VOID },
    { bg: "#081410", wall: "#2a4a3a", floor: "#122a20", accent: "#26ffae", haz: T.VOID },
    { bg: "#0e1a18", wall: "#325242", floor: "#1a3228", accent: "#38ffc0", haz: T.VOID },
    { bg: "#12100a", wall: "#4a4020", floor: "#2a2410", accent: "#ffd700", haz: T.FIRE },
    { bg: "#14120c", wall: "#4c4222", floor: "#2c2612", accent: "#ffda10", haz: T.VOID },
    { bg: "#100e08", wall: "#483e1e", floor: "#28220e", accent: "#ffd400", haz: T.FIRE },
    { bg: "#16140e", wall: "#4e4424", floor: "#2e2814", accent: "#ffde18", haz: T.VOID },
    { bg: "#12100a", wall: "#4a4020", floor: "#2a2410", accent: "#ffd604", haz: T.LAVA },
    { bg: "#14120c", wall: "#4c4224", floor: "#2c2612", accent: "#ffdc14", haz: T.VOID },
    { bg: "#0e0c08", wall: "#463c1c", floor: "#26200c", accent: "#ffd000", haz: T.FIRE },
    { bg: "#16140e", wall: "#504626", floor: "#302a16", accent: "#ffe020", haz: T.VOID },
    { bg: "#12100a", wall: "#4a4020", floor: "#2a2410", accent: "#ffd808", haz: T.LAVA },
    { bg: "#181612", wall: "#524828", floor: "#322c18", accent: "#ffe428", haz: T.VOID }
  ];
  const N = ["Dusty Entrance", "Bone Gallery", "Collapsed Hall", "Rat Warrens", "Silent Tombs", "Pillared Crypt", "Sunken Vault", "Echoing Chamber", "Ancient Archive", "Warden's Domain", "Dripping Tunnels", "Moss Grottos", "Flooded Passage", "Fungal Cavern", "Bile Channels", "Sludge Pits", "Spawn Pools", "Rotting Cistern", "Venom Lair", "Hydra's Nest", "Abandoned Shaft", "Crystal Vein", "Collapsed Tunnel", "Ore Deposit", "Lava Fissure", "Stone Bridge", "Mushroom Cave", "Quake Zone", "Deep Excavation", "Titan's Forge", "Restless Graves", "Wailing Corridor", "Death's Antechamber", "Spirit Sanctum", "Phantom Hall", "Cursed Chapel", "Lich Laboratory", "Bone Throne", "Shadow Cloister", "Malachar's Keep", "Ember Plains", "Char Pits", "Flame Corridor", "Magma Falls", "Scorched Arena", "Ash Wastes", "Infernal Gate", "Burning Maze", "Fire Sanctum", "Ignatius' Throne", "Frost Entry", "Ice Caverns", "Blizzard Pass", "Frozen Lake", "Crystal Tundra", "Avalanche Hall", "Permafrost Tomb", "Glacier Core", "Howling Peak", "Glacius' Domain", "Void Threshold", "Shadow Rift", "Dark Expanse", "Null Chamber", "Entropy Hall", "Singularity", "Abyss Maw", "Void Nexus", "Dark Matter", "Nihilex's Realm", "Scale Passage", "Hoard Antechamber", "Drake Nests", "Wyrm Tunnels", "Fire Pits", "Bone Graveyard", "Elder Roost", "Sky Bridge", "Crown Chamber", "Tiamat's Sanctum", "Warped Entry", "Reality Fracture", "Dream Corridor", "Eye Chamber", "Tentacle Hall", "Mind Maze", "Star Gate", "Madness Court", "Whisper Void", "Azathoth's Dream", "Dark Approach", "Shadow Court", "Obsidian Hall", "Throne Passage", "Crown Gallery", "Soul Forge", "Eclipse Chamber", "Doom Spire", "Final Descent", "Erebus' Throne"];
  const I = ["\u{1F3DB}\uFE0F", "\u{1F480}", "\u{1F3DA}\uFE0F", "\u{1F400}", "\u{1F56F}\uFE0F", "\u{1F3DB}\uFE0F", "\u{1F510}", "\u{1F514}", "\u{1F4DC}", "\u2694\uFE0F", "\u{1F4A7}", "\u{1F344}", "\u{1F30A}", "\u{1F7E2}", "\u{1F9EA}", "\u{1FAE7}", "\u{1F95A}", "\u{1FAB1}", "\u{1F40D}", "\u{1F40A}", "\u26CF\uFE0F", "\u{1F48E}", "\u{1FAA8}", "\u2699\uFE0F", "\u{1F30B}", "\u{1F309}", "\u{1F344}", "\u{1F4A5}", "\u{1F573}\uFE0F", "\u{1F528}", "\u26B0\uFE0F", "\u{1F631}", "\u{1F480}", "\u{1F47B}", "\u{1F3DA}\uFE0F", "\u26EA", "\u{1F9EA}", "\u{1F9B4}", "\u{1F311}", "\u2620\uFE0F", "\u{1F525}", "\u{1F30B}", "\u{1F525}", "\u{1F30A}", "\u2694\uFE0F", "\u{1F3DC}\uFE0F", "\u{1F47F}", "\u{1F525}", "\u{1F525}", "\u{1F608}", "\u2744\uFE0F", "\u{1F9CA}", "\u{1F328}\uFE0F", "\u{1F3D4}\uFE0F", "\u{1F48E}", "\u{1F3D4}\uFE0F", "\u{1FAA6}", "\u{1F9CA}", "\u{1F32C}\uFE0F", "\u2744\uFE0F", "\u{1F300}", "\u{1F573}\uFE0F", "\u{1F311}", "\u2B1B", "\u{1F300}", "\u{1F4AB}", "\u{1F444}", "\u{1F300}", "\u26AB", "\u{1F311}", "\u{1F432}", "\u{1F4B0}", "\u{1F95A}", "\u{1F40D}", "\u{1F525}", "\u{1F9B4}", "\u{1F985}", "\u{1F309}", "\u{1F451}", "\u{1F409}", "\u{1F441}\uFE0F", "\u{1F52E}", "\u{1F4AD}", "\u{1F441}\uFE0F", "\u{1F419}", "\u{1F9E9}", "\u2B50", "\u{1FAE0}", "\u{1F32B}\uFE0F", "\u{1F441}\uFE0F", "\u{1F5E1}\uFE0F", "\u{1F3F0}", "\u2B1B", "\u{1F6AA}", "\u{1F451}", "\u{1F525}", "\u{1F311}", "\u{1F5FC}", "\u2B07\uFE0F", "\u{1F451}"];
  return Array.from({ length: 100 }, (_, i) => ({ floor: i + 1, name: N[i], icon: I[i], tier: Math.floor(i / 10) + 1, ...P[i] }));
})();
const SANC_CONFIG = { bg: "#0a1220", wall: "#2a4458", floor: "#162838", accent: "#66bbee", haz: T.FLOOR, name: "Sanctuary", icon: "\u{1F3D5}\uFE0F" };
const getFC = (f) => FLOOR_CONFIGS[f - 1] || FLOOR_CONFIGS[0];
const getTier = (f) => Math.floor((f - 1) / 10) + 1;
const WP = { warrior: ["Rusty", "Iron", "Steel", "Forged", "Tempered", "Hardened", "Infernal", "Glacial", "Void", "Draconic", "Eldritch", "Abyssal", "Radiant", "Astral", "Celestial", "Cursed", "Blessed", "Ancient", "Mythic", "Divine"], mage: ["Apprentice", "Oak", "Crystal", "Enchanted", "Arcane", "Runic", "Infernal", "Glacial", "Void", "Draconic", "Eldritch", "Astral", "Radiant", "Celestial", "Cursed", "Blessed", "Ancient", "Mythic", "Divine", "Cosmic"], thief: ["Rusty", "Keen", "Serrated", "Venom", "Shadow", "Silent", "Infernal", "Glacial", "Void", "Draconic", "Eldritch", "Spectral", "Radiant", "Astral", "Cursed", "Blessed", "Ancient", "Mythic", "Divine", "Phantom"] };
const WS = { warrior: [["Sword", "\u{1F5E1}\uFE0F"], ["Mace", "\u{1F528}"], ["Blade", "\u2694\uFE0F"], ["Axe", "\u{1FA93}"], ["Halberd", "\u2694\uFE0F"], ["Hammer", "\u{1F528}"], ["Claymore", "\u{1F5E1}\uFE0F"], ["Greatsword", "\u2694\uFE0F"], ["Warblade", "\u{1F5E1}\uFE0F"], ["Kingsbane", "\u{1F451}"]], mage: [["Wand", "\u{1FA84}"], ["Staff", "\u{1FAB5}"], ["Rod", "\u{1FA84}"], ["Orb", "\u{1F52E}"], ["Scepter", "\u{1FA84}"], ["Tome", "\u{1F4D6}"], ["Focus", "\u{1F52E}"], ["Grimoire", "\u{1F4D6}"], ["Codex", "\u{1F4DC}"], ["Catalyst", "\u2B50"]], thief: [["Dagger", "\u{1F52A}"], ["Stiletto", "\u{1F5E1}\uFE0F"], ["Shiv", "\u{1F52A}"], ["Blade", "\u{1F5E1}\uFE0F"], ["Kris", "\u{1F52A}"], ["Fang", "\u{1F40D}"], ["Claw", "\u{1F43E}"], ["Tanto", "\u{1F5E1}\uFE0F"], ["Kukri", "\u{1F52A}"], ["Dirk", "\u{1F5E1}\uFE0F"]] };
const AP = { warrior: ["Leather", "Studded", "Chain", "Banded", "Plate", "Reinforced", "Infernal", "Glacial", "Void", "Draconic", "Eldritch", "Astral", "Radiant", "Celestial", "Cursed", "Blessed", "Ancient", "Mythic", "Divine", "Titanic"], mage: ["Cloth", "Linen", "Silk", "Woven", "Enchanted", "Runic", "Infernal", "Glacial", "Void", "Draconic", "Eldritch", "Astral", "Radiant", "Celestial", "Cursed", "Blessed", "Ancient", "Mythic", "Divine", "Cosmic"], thief: ["Cloth", "Leather", "Studded", "Shadow", "Night", "Stealth", "Infernal", "Glacial", "Void", "Draconic", "Eldritch", "Spectral", "Radiant", "Astral", "Cursed", "Blessed", "Ancient", "Mythic", "Divine", "Phantom"] };
const AS = { warrior: [["Vest", "\u{1F94B}"], ["Mail", "\u26D3\uFE0F"], ["Armor", "\u{1F6E1}\uFE0F"], ["Plate", "\u{1F6E1}\uFE0F"], ["Cuirass", "\u{1F6E1}\uFE0F"], ["Aegis", "\u{1F6E1}\uFE0F"], ["Fortress", "\u{1F3F0}"], ["Bastion", "\u{1F6E1}\uFE0F"], ["Guard", "\u{1F6E1}\uFE0F"], ["Crown", "\u{1F451}"]], mage: [["Robes", "\u{1F458}"], ["Vestment", "\u{1F458}"], ["Mantle", "\u2728"], ["Robe", "\u{1F458}"], ["Shroud", "\u{1F300}"], ["Regalia", "\u2728"], ["Cowl", "\u{1F9D9}"], ["Garb", "\u{1F458}"], ["Raiment", "\u2728"], ["Halo", "\u{1F607}"]], thief: [["Vest", "\u{1F94B}"], ["Tunic", "\u{1F94B}"], ["Cloak", "\u{1F311}"], ["Garb", "\u{1F319}"], ["Shroud", "\u{1F311}"], ["Suit", "\u{1F574}\uFE0F"], ["Wrap", "\u{1F311}"], ["Cowl", "\u{1F9B9}"], ["Mantle", "\u{1F47B}"], ["Veil", "\u{1F32B}\uFE0F"]] };
function genFloorWeapon(f, cls) {
  const pi = Math.min(Math.floor((f - 1) / 5), 19);
  const si = Math.min(Math.floor((f - 1) / 10), 9);
  const [suf, icon] = WS[cls][si];
  const atk = 2 + Math.floor(f * 0.55);
  return { id: `fw${f}`, name: `${WP[cls][pi]} ${suf}`, icon, type: "weapon", atk, intB: cls === "mage" ? 2 + Math.floor(f * 0.4) : void 0, dexB: cls === "thief" ? 1 + Math.floor(f * 0.3) : void 0, tier: getTier(f), val: 8 + f * 6, lvl: f, floor: f };
}
function genFloorArmor(f, cls) {
  const pi = Math.min(Math.floor((f - 1) / 5), 19);
  const si = Math.min(Math.floor((f - 1) / 10), 9);
  const [suf, icon] = AS[cls][si];
  const def = cls === "warrior" ? 2 + Math.floor(f * 0.5) : cls === "thief" ? 2 + Math.floor(f * 0.35) : 1 + Math.floor(f * 0.22);
  return { id: `fa${f}`, name: `${AP[cls][pi]} ${suf}`, icon, type: "armor", def, mpB: cls === "mage" ? 15 + Math.floor(f * 1.5) : void 0, dexB: cls === "thief" ? 1 + Math.floor(f * 0.18) : void 0, tier: getTier(f), val: 10 + f * 6, lvl: f, floor: f };
}
const CONS = [{ id: "c1", name: "HP Potion", icon: "\u2764\uFE0F", type: "consumable", effect: "hp", val: 8, amt: 35, lvl: 1 }, { id: "c2", name: "MP Potion", icon: "\u{1F499}", type: "consumable", effect: "mp", val: 8, amt: 30, lvl: 1 }, { id: "c3", name: "Antidote", icon: "\u{1F49A}", type: "consumable", effect: "cure", val: 5, amt: 0, lvl: 1 }, { id: "c4", name: "Torch", icon: "\u{1F526}", type: "consumable", effect: "vision", val: 4, amt: 2, lvl: 1 }, { id: "c5", name: "Bomb", icon: "\u{1F4A3}", type: "consumable", effect: "damage", val: 14, amt: 50, lvl: 10 }, { id: "c6", name: "Greater HP", icon: "\u2764\uFE0F\u200D\u{1F525}", type: "consumable", effect: "hp", val: 25, amt: 80, lvl: 20 }, { id: "c7", name: "Greater MP", icon: "\u{1F48E}", type: "consumable", effect: "mp", val: 25, amt: 60, lvl: 20 }, { id: "c8", name: "Mega Bomb", icon: "\u{1F9E8}", type: "consumable", effect: "damage", val: 40, amt: 120, lvl: 40 }, { id: "c9", name: "Elixir", icon: "\u2728", type: "consumable", effect: "full", val: 55, amt: 0, lvl: 50 }, { id: "c10", name: "Phoenix Down", icon: "\u{1F525}", type: "consumable", effect: "revive", val: 100, amt: 0, lvl: 70 }];
function getChestLoot(f) {
  const p = CONS.filter((c) => c.lvl <= f + 10);
  return { ...p[rng(0, p.length - 1)], id: uid() };
}
const SHOP_NAMES = ["Old Merchant", "Wandering Trader", "Cave Dealer", "Spirit Vendor", "Infernal Broker", "Frost Peddler", "Void Merchant", "Dragon Hoarder", "Eldritch Dealer", "Shadow Broker"];
function genShopStock(floor, cls) {
  const tier = getTier(floor);
  const items = [];
  const available = CONS.filter((c) => c.lvl <= floor + 15);
  for (const c of available) {
    const stock = c.lvl <= floor ? rng(2, 4) : rng(1, 2);
    items.push({ ...c, id: uid(), buyPrice: Math.floor(c.val * 3), cat: "consumable", stock, sold: 0 });
  }
  const wFloor = Math.max(1, floor - rng(1, 3));
  const aFloor = Math.max(1, floor - rng(1, 3));
  const shopW = genFloorWeapon(wFloor, cls);
  const shopA = genFloorArmor(aFloor, cls);
  items.push({ ...shopW, id: uid(), buyPrice: Math.floor(shopW.val * 4), cat: "weapon", stock: 1, sold: 0 });
  items.push({ ...shopA, id: uid(), buyPrice: Math.floor(shopA.val * 4), cat: "armor", stock: 1, sold: 0 });
  if (floor < 95) {
    const pW = genFloorWeapon(floor + rng(2, 5), cls);
    const pA = genFloorArmor(floor + rng(2, 5), cls);
    items.push({ ...pW, id: uid(), buyPrice: Math.floor(pW.val * 6), cat: "weapon", stock: 1, sold: 0, premium: true });
    items.push({ ...pA, id: uid(), buyPrice: Math.floor(pA.val * 6), cat: "armor", stock: 1, sold: 0, premium: true });
  }
  return { items, name: SHOP_NAMES[tier - 1] || "Merchant", icon: ["\u{1F9D9}", "\u{1F9DD}", "\u26CF\uFE0F", "\u{1F47B}", "\u{1F608}", "\u{1F9CA}", "\u{1F300}", "\u{1F432}", "\u{1F441}\uFE0F", "\u{1F451}"][tier - 1] || "\u{1F9D9}", tier };
}
const MB = [
  [{ n: "Rat", i: "\u{1F400}", h: 16, a: 5, d: 1, x: 8, g: 3 }, { n: "Bat", i: "\u{1F987}", h: 12, a: 6, d: 0, x: 6, g: 2 }, { n: "Skeleton", i: "\u{1F480}", h: 26, a: 9, d: 4, x: 15, g: 7 }, { n: "Zombie", i: "\u{1F9DF}", h: 32, a: 8, d: 5, x: 16, g: 6 }, { n: "Ghost", i: "\u{1F47B}", h: 20, a: 12, d: 2, x: 18, g: 9 }],
  [{ n: "Slime", i: "\u{1F7E2}", h: 24, a: 8, d: 3, x: 10, g: 4 }, { n: "Spider", i: "\u{1F577}\uFE0F", h: 18, a: 11, d: 2, x: 11, g: 5 }, { n: "Croc", i: "\u{1F40A}", h: 38, a: 14, d: 6, x: 20, g: 10 }, { n: "Sewer Hag", i: "\u{1F9D9}", h: 28, a: 16, d: 3, x: 24, g: 13 }, { n: "Hydra", i: "\u{1F40D}", h: 48, a: 18, d: 7, x: 32, g: 16 }],
  [{ n: "Kobold", i: "\u{1F47A}", h: 22, a: 12, d: 4, x: 14, g: 8 }, { n: "Golem", i: "\u{1FAA8}", h: 55, a: 13, d: 16, x: 26, g: 11 }, { n: "Mole", i: "\u{1F439}", h: 32, a: 15, d: 5, x: 18, g: 9 }, { n: "Troll", i: "\u{1F479}", h: 70, a: 20, d: 10, x: 38, g: 19 }, { n: "Basilisk", i: "\u{1F98E}", h: 48, a: 22, d: 8, x: 36, g: 20 }],
  [{ n: "Wraith", i: "\u{1F464}", h: 38, a: 18, d: 4, x: 26, g: 13 }, { n: "Banshee", i: "\u{1F631}", h: 32, a: 22, d: 3, x: 30, g: 15 }, { n: "Death Knt", i: "\u2694\uFE0F", h: 65, a: 24, d: 14, x: 42, g: 22 }, { n: "Necro", i: "\u2620\uFE0F", h: 48, a: 26, d: 6, x: 48, g: 26 }, { n: "Bone Drk", i: "\u{1F9B4}", h: 85, a: 28, d: 12, x: 56, g: 32 }],
  [{ n: "Imp", i: "\u{1F608}", h: 28, a: 20, d: 5, x: 22, g: 11 }, { n: "Fire Elem", i: "\u{1F525}", h: 50, a: 26, d: 8, x: 36, g: 17 }, { n: "Hellhound", i: "\u{1F415}", h: 45, a: 24, d: 10, x: 33, g: 15 }, { n: "Pit Fiend", i: "\u{1F47F}", h: 80, a: 30, d: 14, x: 52, g: 28 }, { n: "Balor", i: "\u{1F987}", h: 95, a: 34, d: 16, x: 62, g: 38 }],
  [{ n: "Ice Wraith", i: "\u{1F976}", h: 42, a: 22, d: 8, x: 28, g: 15 }, { n: "Frost Gnt", i: "\u{1F3D4}\uFE0F", h: 85, a: 28, d: 16, x: 48, g: 26 }, { n: "Yeti", i: "\u{1F98D}", h: 65, a: 26, d: 12, x: 40, g: 20 }, { n: "Ice Drgn", i: "\u{1F409}", h: 105, a: 32, d: 18, x: 62, g: 36 }, { n: "Wendigo", i: "\u{1F4A8}", h: 55, a: 30, d: 6, x: 46, g: 24 }],
  [{ n: "Shadow", i: "\u{1F311}", h: 48, a: 26, d: 6, x: 34, g: 18 }, { n: "Void Wlk", i: "\u{1F573}\uFE0F", h: 62, a: 30, d: 10, x: 46, g: 24 }, { n: "Flayer", i: "\u{1F419}", h: 72, a: 34, d: 8, x: 55, g: 30 }, { n: "Beholder", i: "\u{1F441}\uFE0F", h: 82, a: 36, d: 12, x: 62, g: 36 }, { n: "Devourer", i: "\u{1F636}\u200D\u{1F32B}\uFE0F", h: 96, a: 38, d: 14, x: 70, g: 40 }],
  [{ n: "Dragonkin", i: "\u{1F98E}", h: 66, a: 30, d: 14, x: 48, g: 26 }, { n: "Wyvern", i: "\u{1F985}", h: 82, a: 34, d: 12, x: 56, g: 30 }, { n: "Fire Drk", i: "\u{1F432}", h: 96, a: 38, d: 18, x: 68, g: 38 }, { n: "Elder Drg", i: "\u{1F409}", h: 135, a: 42, d: 22, x: 82, g: 52 }, { n: "Drg Lord", i: "\u{1F451}", h: 155, a: 46, d: 24, x: 92, g: 62 }],
  [{ n: "Gibberer", i: "\u{1FAE0}", h: 58, a: 32, d: 8, x: 46, g: 24 }, { n: "Star Spwn", i: "\u2B50", h: 78, a: 38, d: 14, x: 60, g: 34 }, { n: "Aboleth", i: "\u{1F40B}", h: 96, a: 40, d: 16, x: 70, g: 40 }, { n: "Shoggoth", i: "\u{1FAE7}", h: 116, a: 44, d: 18, x: 82, g: 48 }, { n: "Deep One", i: "\u{1F991}", h: 88, a: 42, d: 12, x: 72, g: 42 }],
  [{ n: "Shd Guard", i: "\u{1F5E1}\uFE0F", h: 88, a: 38, d: 18, x: 62, g: 36 }, { n: "Drk Mage", i: "\u{1F9D9}\u200D\u2642\uFE0F", h: 72, a: 46, d: 10, x: 70, g: 40 }, { n: "Chaos Knt", i: "\u265F\uFE0F", h: 116, a: 44, d: 22, x: 82, g: 50 }, { n: "Archlich", i: "\u{1F480}", h: 136, a: 50, d: 16, x: 92, g: 58 }, { n: "Fallen", i: "\u{1F607}", h: 156, a: 52, d: 24, x: 108, g: 68 }]
];
function getEnemy(f) {
  const t = getTier(f) - 1;
  const pool = MB[t] || MB[0];
  const pos = (f - 1) % 10;
  const s = 1 + pos * 0.15 + t * 0.08;
  const dm = 1 + t * 0.12;
  const b = pool[rng(0, pool.length - 1)];
  return { name: b.n, icon: b.i, hp: Math.floor(b.h * s * dm * 1.3), maxHp: Math.floor(b.h * s * dm * 1.3), atk: Math.floor(b.a * s * dm * 1.2), def: Math.floor(b.d * s * dm * 1.15), xp: Math.floor(b.x * s * dm), gold: Math.floor(b.g * s * dm), id: uid() };
}
const BD = [{ n: "Crypt Warden", i: "\u{1F6E1}\uFE0F", h: 100, a: 18, d: 12, x: 70, g: 50, sub: "Guardian of the Forgotten" }, { n: "Sewer King", i: "\u{1F40A}", h: 140, a: 24, d: 14, x: 100, g: 70, sub: "Sovereign of Filth" }, { n: "Stone Titan", i: "\u{1F5FF}", h: 190, a: 30, d: 22, x: 140, g: 95, sub: "Heart of the Mountain" }, { n: "Lich Lord", i: "\u2620\uFE0F", h: 250, a: 36, d: 16, x: 185, g: 120, sub: "Undying Archon" }, { n: "Infernal Duke", i: "\u{1F608}", h: 320, a: 44, d: 20, x: 240, g: 155, sub: "Prince of Cinders" }, { n: "Frost Emperor", i: "\u2744\uFE0F", h: 400, a: 50, d: 26, x: 300, g: 195, sub: "Eternal Winter" }, { n: "Void Sovereign", i: "\u{1F300}", h: 500, a: 56, d: 22, x: 370, g: 240, sub: "The Unmaker" }, { n: "Ancient Wyrm", i: "\u{1F409}", h: 620, a: 64, d: 32, x: 450, g: 300, sub: "First of Dragonkind" }, { n: "Elder God", i: "\u{1F441}\uFE0F", h: 760, a: 72, d: 28, x: 550, g: 370, sub: "Dreaming Horror" }, { n: "Shadow King", i: "\u{1F451}", h: 920, a: 82, d: 36, x: 680, g: 460, sub: "Lord of Darkness" }];
const MBD = [{ n: "Gravemaw", i: "\u{1F480}", h: 200, a: 28, d: 18, x: 160, g: 110, title: "Devourer of Souls", aura: "#c9a84c" }, { n: "Toxicor", i: "\u{1F40D}", h: 340, a: 40, d: 20, x: 280, g: 175, title: "Plague Incarnate", aura: "#44cc66" }, { n: "Gorath", i: "\u{1F5FF}", h: 500, a: 50, d: 30, x: 420, g: 260, title: "Living Mountain", aura: "#ffaa22" }, { n: "Malachar", i: "\u2620\uFE0F", h: 680, a: 60, d: 24, x: 580, g: 360, title: "Death's Herald", aura: "#8888ff" }, { n: "Ignatius Rex", i: "\u{1F525}", h: 880, a: 72, d: 32, x: 760, g: 480, title: "Lord of Cinders", aura: "#ff4422" }, { n: "Glacius", i: "\u2744\uFE0F", h: 1100, a: 82, d: 38, x: 960, g: 600, title: "Heart of Winter", aura: "#66ddff" }, { n: "Nihilex", i: "\u{1F311}", h: 1400, a: 94, d: 34, x: 1200, g: 750, title: "Entropy Incarnate", aura: "#bb66ff" }, { n: "Tiamat", i: "\u{1F432}", h: 1750, a: 108, d: 42, x: 1500, g: 920, title: "Mother of Dragons", aura: "#ff8800" }, { n: "Azathoth", i: "\u{1F441}\uFE0F", h: 2100, a: 118, d: 38, x: 1800, g: 1100, title: "The Blind Dreamer", aura: "#22ffaa" }, { n: "Erebus", i: "\u{1F451}", h: 2800, a: 135, d: 48, x: 2500, g: 1500, title: "King of Shadow \u2014 FINAL", aura: "#ffd700" }];
function getFloorBoss(f) {
  const b = BD[getTier(f) - 1];
  const s = 1 + (f - 1) % 10 * 0.15;
  return { ...b, name: b.n, icon: b.i, subtitle: b.sub, hp: Math.floor(b.h * s * 1.4), maxHp: Math.floor(b.h * s * 1.4), atk: Math.floor(b.a * s * 1.2), def: Math.floor(b.d * s * 1.15), xp: Math.floor(b.x * s), gold: Math.floor(b.g * s), id: uid(), isBoss: true, bossFloor: f };
}
function getMegaBoss(f) {
  const b = MBD[Math.floor((f - 1) / 10)];
  if (!b) return getFloorBoss(f);
  return { ...b, name: b.n, icon: b.i, hp: Math.floor(b.h * 1.3), maxHp: Math.floor(b.h * 1.3), atk: Math.floor(b.a * 1.15), def: b.d, xp: b.x, gold: b.g, id: uid(), isBoss: true, isMega: true, bossFloor: f };
}
const CLASSES = { warrior: { name: "Warrior", icon: "\u2694\uFE0F", hp: 130, mp: 25, str: 15, dex: 8, int: 5, def: 13, desc: "Heavy armor. Devastating strikes.", skills: ["Power Strike", "Shield Wall", "Cleave", "War Cry", "Berserk"] }, mage: { name: "Mage", icon: "\u{1F52E}", hp: 65, mp: 110, str: 4, dex: 6, int: 17, def: 4, desc: "Master of arcane destruction.", skills: ["Fireball", "Ice Shard", "Arcane Shield", "Chain Bolt", "Meteor"] }, thief: { name: "Thief", icon: "\u{1F5E1}\uFE0F", hp: 85, mp: 55, str: 9, dex: 17, int: 8, def: 6, desc: "Swift. Cunning. Lethal.", skills: ["Backstab", "Smoke Bomb", "Steal", "Assassinate", "Shadow Step"] } };
const OBJ = [
  // Early game
  { id: 1, text: "Reach Floor 5", c: (s) => s.floor >= 5, cat: "explore", xp: 20 },
  { id: 2, text: "Defeat 10 enemies", c: (s) => s.kills >= 10, cat: "combat", xp: 15 },
  { id: 3, text: "Open 5 chests", c: (s) => s.chests >= 5, cat: "explore", xp: 15 },
  { id: 4, text: "Reach Level 5", c: (s) => s.level >= 5, cat: "progress", xp: 20 },
  { id: 5, text: "Collect 200 gold total", c: (s) => s.totG >= 200, cat: "wealth", xp: 10 },
  // Mid-early
  { id: 6, text: "Reach Floor 10", c: (s) => s.floor >= 10, cat: "explore", xp: 30 },
  { id: 7, text: "Beat your first Mega Boss", c: (s) => s.megaK >= 1, cat: "combat", xp: 50 },
  { id: 8, text: "Defeat 50 enemies", c: (s) => s.kills >= 50, cat: "combat", xp: 30 },
  { id: 9, text: "Reach Level 10", c: (s) => s.level >= 10, cat: "progress", xp: 40 },
  { id: 10, text: "Open 20 chests", c: (s) => s.chests >= 20, cat: "explore", xp: 25 },
  // Mid game
  { id: 11, text: "Reach Floor 25", c: (s) => s.floor >= 25, cat: "explore", xp: 50 },
  { id: 12, text: "Collect 2,000 gold total", c: (s) => s.totG >= 2e3, cat: "wealth", xp: 35 },
  { id: 13, text: "Defeat 100 enemies", c: (s) => s.kills >= 100, cat: "combat", xp: 50 },
  { id: 14, text: "Beat 3 Mega Bosses", c: (s) => s.megaK >= 3, cat: "combat", xp: 60 },
  { id: 15, text: "Reach Level 20", c: (s) => s.level >= 20, cat: "progress", xp: 50 },
  { id: 16, text: "Walk 500 steps", c: (s) => s.steps >= 500, cat: "explore", xp: 20 },
  // Late-mid
  { id: 17, text: "Reach Floor 50", c: (s) => s.floor >= 50, cat: "explore", xp: 80 },
  { id: 18, text: "Beat 5 Mega Bosses", c: (s) => s.megaK >= 5, cat: "combat", xp: 80 },
  { id: 19, text: "Defeat 250 enemies", c: (s) => s.kills >= 250, cat: "combat", xp: 60 },
  { id: 20, text: "Collect 10,000 gold total", c: (s) => s.totG >= 1e4, cat: "wealth", xp: 70 },
  { id: 21, text: "Reach Level 30", c: (s) => s.level >= 30, cat: "progress", xp: 70 },
  // Late game
  { id: 22, text: "Reach Floor 75", c: (s) => s.floor >= 75, cat: "explore", xp: 100 },
  { id: 23, text: "Defeat 500 enemies", c: (s) => s.kills >= 500, cat: "combat", xp: 80 },
  { id: 24, text: "Walk 2,000 steps", c: (s) => s.steps >= 2e3, cat: "explore", xp: 50 },
  { id: 25, text: "Beat all 10 Mega Bosses", c: (s) => s.megaK >= 10, cat: "combat", xp: 150 },
  // Endgame
  { id: 26, text: "Reach Floor 100", c: (s) => s.floor >= 100, cat: "explore", xp: 120 },
  { id: 27, text: "Defeat Erebus, King of Shadow", c: (s) => s.erebus, cat: "combat", xp: 300 },
  { id: 28, text: "Collect 50,000 gold total", c: (s) => s.totG >= 5e4, cat: "wealth", xp: 100 },
  { id: 29, text: "Reach Level 50", c: (s) => s.level >= 50, cat: "progress", xp: 150 },
  { id: 30, text: "Defeat 1,000 enemies", c: (s) => s.kills >= 1e3, cat: "combat", xp: 120 }
];
function calcStats(p) {
  let atk = p.str, def = p.baseDef, mp = p.baseMaxMp;
  if (p.equipped.weapon) {
    atk += p.equipped.weapon.atk;
    if (p.equipped.weapon.dexB) atk += p.equipped.weapon.dexB;
    if (p.equipped.weapon.intB) atk += p.equipped.weapon.intB;
  }
  if (p.equipped.armor) {
    def += p.equipped.armor.def;
    if (p.equipped.armor.mpB) mp += p.equipped.armor.mpB;
    if (p.equipped.armor.dexB) def += Math.floor(p.equipped.armor.dexB * 0.5);
  }
  return { atk, def, maxMp: mp };
}
function rollDmg(base, variance) {
  const r1 = Math.random() * variance * 2 - variance;
  const r2 = Math.random() * variance * 2 - variance;
  return Math.max(1, Math.floor(base + (r1 + r2) / 2));
}
function calcEnemyDmg(enemy, pStats, shields) {
  const reduction = pStats.def / (pStats.def + enemy.atk + 40);
  const baseDmg = enemy.atk * (1 - reduction);
  const v = Math.max(2, Math.floor(enemy.atk * 0.2));
  let dmg = rollDmg(baseDmg, v);
  if (shields.sw) dmg = Math.floor(dmg * 0.5);
  if (shields.as) dmg = Math.floor(dmg * 0.5);
  if (Math.random() < 0.08) dmg = Math.floor(dmg * 1.5);
  return Math.max(1, dmg);
}
function getBestEquip(p) {
  const ws = p.inv.filter((i) => i.type === "weapon");
  const ar = p.inv.filter((i) => i.type === "armor");
  let bW = p.equipped.weapon, bA = p.equipped.armor;
  const wS = (w) => (w?.atk || 0) + (w?.dexB || 0) + (w?.intB || 0);
  const aS = (a) => (a?.def || 0) + Math.floor((a?.mpB || 0) * 0.1) + Math.floor((a?.dexB || 0) * 0.5);
  for (const w of ws) if (wS(w) > wS(bW)) bW = w;
  for (const a of ar) if (aS(a) > aS(bA)) bA = a;
  return { weapon: bW, armor: bA };
}
function genDungeon(f, isSanc = false) {
  const fc = isSanc ? SANC_CONFIG : getFC(f);
  const isMega = !isSanc && f % 10 === 0;
  const map = Array.from({ length: MH }, () => Array(MW).fill(T.WALL));
  const rooms = [];
  const rev = Array.from({ length: MH }, () => Array(MW).fill(false));
  const rc = isSanc ? rng(2, 3) : isMega ? rng(5, 7) : rng(7, 12);
  for (let a = 0; a < 120; a++) {
    if (rooms.length >= rc) break;
    const rw = rng(isSanc ? 5 : 4, isSanc ? 9 : 8), rh = rng(isSanc ? 4 : 3, isSanc ? 7 : 6), rx = rng(1, MW - rw - 2), ry = rng(1, MH - rh - 2);
    let ok = true;
    for (const r of rooms) if (rx < r.x + r.w + 2 && rx + rw + 2 > r.x && ry < r.y + r.h + 2 && ry + rh + 2 > r.y) {
      ok = false;
      break;
    }
    if (!ok) continue;
    for (let y = ry; y < ry + rh; y++) for (let x = rx; x < rx + rw; x++) map[y][x] = T.FLOOR;
    rooms.push({ x: rx, y: ry, w: rw, h: rh, cx: Math.floor(rx + rw / 2), cy: Math.floor(ry + rh / 2) });
  }
  for (let i = 0; i < rooms.length - 1; i++) {
    let { cx: x1, cy: y1 } = rooms[i], { cx: x2, cy: y2 } = rooms[i + 1];
    while (x1 !== x2) {
      if (map[y1][x1] === T.WALL) map[y1][x1] = T.FLOOR;
      x1 += x1 < x2 ? 1 : -1;
    }
    while (y1 !== y2) {
      if (map[y1][x1] === T.WALL) map[y1][x1] = T.FLOOR;
      y1 += y1 < y2 ? 1 : -1;
    }
    if (map[y1][x1] === T.WALL) map[y1][x1] = T.FLOOR;
  }
  const plc = (ri, t) => {
    const r = rooms[ri];
    if (!r) return null;
    for (let a = 0; a < 30; a++) {
      const px = rng(r.x + 1, r.x + r.w - 2), py = rng(r.y + 1, r.y + r.h - 2);
      if (map[py] && map[py][px] === T.FLOOR) {
        map[py][px] = t;
        return { x: px, y: py };
      }
    }
    return null;
  };
  const bri = rooms.length - 1;
  const bossPos = { x: rooms[bri].cx, y: rooms[bri].cy };
  let stairsPos = null;
  if (isSanc || f < 100) {
    stairsPos = plc(bri, T.STAIRS);
    if (!stairsPos && rooms[bri]) {
      const sx = rooms[bri].cx + 1;
      if (map[rooms[bri].cy]) {
        map[rooms[bri].cy][sx] = T.STAIRS;
        stairsPos = { x: sx, y: rooms[bri].cy };
      }
    }
  }
  if (isSanc) {
    plc(0, T.FOUNTAIN);
    if (rooms.length > 1) plc(1, T.FOUNTAIN);
    plc(rooms.length > 1 ? 1 : 0, T.SHOP);
  } else {
    for (let i = 0; i < rng(2, 3 + Math.floor(f / 8)); i++) plc(rng(1, Math.max(1, bri - 1)), T.CHEST);
    for (let i = 0; i < rng(2, 3 + Math.floor(f / 6)); i++) plc(rng(1, Math.max(1, bri - 1)), T.TRAP);
    for (let i = 0; i < rng(0, 1); i++) plc(rng(1, Math.max(1, bri - 1)), T.FOUNTAIN);
    for (let i = 0; i < rng(1, Math.floor(f / 10) + 2); i++) plc(rng(1, Math.max(1, bri - 1)), fc.haz);
  }
  const start = { x: rooms[0].cx, y: rooms[0].cy };
  map[start.y][start.x] = T.FLOOR;
  return { map, rooms, revealed: rev, start, stairsPos, bossPos, bri, fc, isMega, isSanc };
}
function revA(rev, px, py, r) {
  const n = rev.map((r2) => [...r2]);
  for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
    const nx = px + dx, ny = py + dy;
    if (nx >= 0 && nx < MW && ny >= 0 && ny < MH && dx * dx + dy * dy <= r * r + 1) n[ny][nx] = true;
  }
  return n;
}
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=JetBrains+Mono:wght@400;500&display=swap');
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}
html{height:100%;height:100dvh;}
body{height:100%;height:100dvh;overflow:hidden;background:#0c0c14;overscroll-behavior:none;}
#root{width:100%;height:100%;height:100dvh;}
@media(orientation:portrait){#root::after{content:"Rotate your device to landscape";position:fixed;inset:0;background:#0c0c14;color:#d4a843;display:flex;align-items:center;justify-content:center;font-size:18px;font-family:'Cinzel',serif;letter-spacing:3px;text-align:center;padding:40px;z-index:99999;}}
@keyframes pp{0%,100%{transform:scale(1);filter:drop-shadow(0 0 4px var(--ac,#d4a843))drop-shadow(0 0 10px rgba(212,168,67,.25));}50%{transform:scale(1.12);filter:drop-shadow(0 0 8px var(--ac,#d4a843))drop-shadow(0 0 18px rgba(212,168,67,.5));}}
@keyframes fadeUp{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
@keyframes slideUp{from{transform:translateY(100%);}to{transform:translateY(0);}}
@keyframes slideRight{from{transform:translateX(-100%);}to{transform:translateX(0);}}
@keyframes bossIn{0%{transform:scale(.15)rotate(-15deg);opacity:0;filter:blur(16px);}40%{transform:scale(1.3)rotate(3deg);opacity:1;filter:blur(0)drop-shadow(0 0 30px var(--ba,#f44));}70%{transform:scale(.95);}100%{transform:scale(1);filter:drop-shadow(0 0 20px var(--ba,#f44));}}
@keyframes megaGlow{0%,100%{filter:drop-shadow(0 0 15px var(--ba,#f44))drop-shadow(0 0 30px var(--ba,#f4444));}50%{filter:drop-shadow(0 0 25px var(--ba,#f44))drop-shadow(0 0 50px var(--ba,#f4466));}}
@keyframes shake{0%,100%{transform:translateX(0);}25%{transform:translateX(-4px);}75%{transform:translateX(4px);}}
@keyframes glow{0%,100%{opacity:.6;}50%{opacity:1;}}
@keyframes sancP{0%,100%{box-shadow:inset 0 0 30px rgba(100,180,240,.05);}50%{box-shadow:inset 0 0 60px rgba(100,180,240,.12);}}
@keyframes recB{0%,100%{box-shadow:0 0 4px #4c64;}50%{box-shadow:0 0 10px #4c68;}}
.scr::-webkit-scrollbar{width:3px;}.scr::-webkit-scrollbar-thumb{background:#333;border-radius:2px;}
@media(hover:hover){button:hover{filter:brightness(1.3);transition:filter .15s;}}
@keyframes dmgFlash{0%{opacity:.5;}100%{opacity:0;}}
@keyframes healFlash{0%{opacity:.3;}100%{opacity:0;}}
@keyframes lvlBurst{0%{transform:scale(0);opacity:1;}50%{transform:scale(2.5);opacity:.6;}100%{transform:scale(4);opacity:0;}}
@keyframes lootPop{0%{transform:translateY(0) scale(1);opacity:1;}100%{transform:translateY(-20px) scale(1.5);opacity:0;}}
@keyframes particle{0%{opacity:1;transform:translate(0,0) scale(1);}100%{opacity:0;transform:translate(var(--px,10px),var(--py,-15px)) scale(0);}}
@keyframes playerBob{0%,100%{transform:translateY(0);}50%{transform:translateY(-2px);}}
@keyframes playerGlowW{0%,100%{box-shadow:0 0 6px #fa84,inset 0 0 4px #fa83;}50%{box-shadow:0 0 12px #fa86,inset 0 0 8px #fa84;}}
@keyframes playerGlowM{0%,100%{box-shadow:0 0 6px #88f4,inset 0 0 4px #88f3;}50%{box-shadow:0 0 14px #88f6,inset 0 0 10px #88f4;}}
@keyframes playerGlowT{0%,100%{box-shadow:0 0 5px #4f84,inset 0 0 3px #4f83;}50%{box-shadow:0 0 10px #4f86,inset 0 0 6px #4f84;}}
@keyframes enemyHit{0%{filter:brightness(3);}100%{filter:brightness(1);}}
`;
const SFX = /* @__PURE__ */ (() => {
  let ctx = null;
  const getCtx = () => {
    if (!ctx) try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
    }
    return ctx;
  };
  const play = (freq, dur, type = "square", vol = 0.12, decay = true) => {
    const c = getCtx();
    if (!c) return;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.value = vol;
    if (decay) g.gain.exponentialRampToValueAtTime(1e-3, c.currentTime + dur);
    o.connect(g);
    g.connect(c.destination);
    o.start(c.currentTime);
    o.stop(c.currentTime + dur);
  };
  const noise = (dur, vol = 0.06) => {
    const c = getCtx();
    if (!c) return;
    const buf = c.createBuffer(1, c.sampleRate * dur, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * vol;
    const s = c.createBufferSource();
    const g = c.createGain();
    g.gain.value = 1;
    g.gain.exponentialRampToValueAtTime(1e-3, c.currentTime + dur);
    s.buffer = buf;
    s.connect(g);
    g.connect(c.destination);
    s.start();
  };
  return {
    step: () => play(80, 0.06, "sine", 0.04),
    hit: () => {
      play(220, 0.08, "square", 0.1);
      play(110, 0.12, "sawtooth", 0.06);
    },
    crit: () => {
      play(330, 0.06, "square", 0.12);
      play(440, 0.1, "square", 0.08);
      setTimeout(() => play(550, 0.08, "square", 0.06), 60);
    },
    enemyHit: () => {
      play(150, 0.1, "sawtooth", 0.08);
      noise(0.08, 0.08);
    },
    miss: () => play(100, 0.15, "sine", 0.04),
    heal: () => {
      play(523, 0.12, "sine", 0.08);
      setTimeout(() => play(659, 0.12, "sine", 0.08), 80);
      setTimeout(() => play(784, 0.2, "sine", 0.06), 160);
    },
    levelUp: () => {
      [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => play(f, 0.2, "sine", 0.1), i * 100));
    },
    death: () => {
      [300, 250, 200, 150, 100].forEach((f, i) => setTimeout(() => play(f, 0.3, "sawtooth", 0.08), i * 120));
    },
    chest: () => {
      play(880, 0.08, "sine", 0.06);
      setTimeout(() => play(1100, 0.12, "sine", 0.08), 80);
    },
    boss: () => {
      [150, 100, 150, 100, 200].forEach((f, i) => setTimeout(() => play(f, 0.2, "square", 0.1), i * 150));
      noise(0.6, 0.05);
    },
    buy: () => {
      play(660, 0.08, "sine", 0.06);
      play(880, 0.12, "sine", 0.06);
    },
    flee: () => {
      play(400, 0.06, "sine", 0.06);
      play(300, 0.08, "sine", 0.04);
    },
    sanctuary: () => {
      [440, 554, 659, 880].forEach((f, i) => setTimeout(() => play(f, 0.3, "sine", 0.07), i * 200));
    },
    fountain: () => {
      play(600, 0.15, "sine", 0.06);
      setTimeout(() => play(800, 0.2, "sine", 0.05), 100);
    },
    equip: () => {
      play(300, 0.06, "square", 0.06);
      play(450, 0.1, "square", 0.06);
    },
    trap: () => {
      noise(0.15, 0.12);
      play(100, 0.2, "sawtooth", 0.08);
    },
    error: () => play(150, 0.2, "square", 0.06)
  };
})();
const Bar = ({ cur, max, color, label, h = 10 }) => /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 4, width: "100%" } }, label && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 8, color: "#666", minWidth: 18, fontFamily: "'JetBrains Mono',monospace" } }, label), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, height: h, background: "#14141e", borderRadius: h, overflow: "hidden", border: "1px solid #222230", position: "relative" } }, /* @__PURE__ */ React.createElement("div", { style: { width: `${clamp(cur / max * 100, 0, 100)}%`, height: "100%", borderRadius: h, background: `linear-gradient(90deg,${color},${color}99)`, transition: "width .3s" } }), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: Math.min(8, h - 2), color: "#fffc", fontFamily: "'JetBrains Mono',monospace", textShadow: "0 1px 2px #000" } }, cur, "/", max)));
const tR = (tile, fc, vis, inFov) => {
  if (!vis) return { ch: "\xB7", color: "#080808", o: 0.1 };
  const o = inFov ? 1 : 0.25;
  const m = { [T.WALL]: { ch: "\u2588", color: fc.wall }, [T.FLOOR]: { ch: "\xB7", color: fc.floor + "99" }, [T.STAIRS]: { ch: "\u25BC", color: "#0e7", g: "0 0 4px #0e75" }, [T.TRAP]: { ch: "\xB7", color: fc.floor + "99" }, [T.CHEST]: { ch: "\u25C6", color: "#fa0", g: "0 0 4px #fa04" }, [T.SECRET]: { ch: "\u2588", color: fc.wall }, [T.PIT]: { ch: "\u25CB", color: "#500" }, [T.FIRE]: { ch: "\u2248", color: "#f40", g: "0 0 3px #f404" }, [T.FOUNTAIN]: { ch: "\u2666", color: "#48f", g: "0 0 4px #48f4" }, [T.ICE]: { ch: "\u25AA", color: "#8df" }, [T.LAVA]: { ch: "\u2248", color: "#f30", g: "0 0 3px #f304" }, [T.WATER]: { ch: "~", color: "#26a" }, [T.VOID]: { ch: "\u221E", color: "#84c", g: "0 0 3px #84c4" }, [T.SHOP]: { ch: "$", color: "#fa0", g: "0 0 5px #fa06" } };
  return { ...m[tile] || { ch: "?", color: "#333" }, o };
};
function DPad({ accent, onDir, combatActive }) {
  const timerRef = useRef(null);
  const onDirRef = useRef(onDir);
  const [active, setActive] = useState(null);
  useEffect(() => {
    onDirRef.current = onDir;
  }, [onDir]);
  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);
  useEffect(() => {
    if (combatActive) {
      stopTimer();
      setActive(null);
    }
  }, [combatActive, stopTimer]);
  useEffect(() => () => stopTimer(), [stopTimer]);
  const startMove = useCallback((dx, dy, dir) => {
    stopTimer();
    setActive(dir);
    onDirRef.current?.(dx, dy);
    timerRef.current = setInterval(() => {
      onDirRef.current?.(dx, dy);
    }, 170);
  }, [stopTimer]);
  const endMove = useCallback((e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    stopTimer();
    setActive(null);
  }, [stopTimer]);
  const bs = 42;
  const btnBase = { width: bs, height: bs, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, cursor: "pointer", touchAction: "none", userSelect: "none", WebkitUserSelect: "none", border: "none", outline: "none" };
  const arrow = (dx, dy, dir, ch) => {
    const isActive = active === dir;
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        style: { ...btnBase, background: isActive ? `${accent}22` : "rgba(20,20,30,.5)", color: isActive ? accent : "#555", textShadow: isActive ? `0 0 8px ${accent}66` : "none", border: `1px solid ${isActive ? accent + "55" : "#ffffff11"}` },
        onTouchStart: (e) => {
          e.preventDefault();
          e.stopPropagation();
          startMove(dx, dy, dir);
        },
        onTouchEnd: endMove,
        onTouchCancel: endMove,
        onMouseDown: (e) => {
          e.preventDefault();
          startMove(dx, dy, dir);
        },
        onMouseUp: endMove,
        onMouseLeave: endMove
      },
      ch
    );
  };
  return /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: `${bs}px ${bs}px ${bs}px`, gridTemplateRows: `${bs}px ${bs}px ${bs}px`, gap: 3 } }, /* @__PURE__ */ React.createElement("div", null), arrow(0, -1, "up", "\u25B2"), /* @__PURE__ */ React.createElement("div", null), arrow(-1, 0, "left", "\u25C0"), /* @__PURE__ */ React.createElement("div", { style: { width: bs, height: bs, borderRadius: 10, background: "rgba(14,14,22,.3)", border: `1px solid ${accent}15`, display: "flex", alignItems: "center", justifyContent: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { width: 8, height: 8, borderRadius: "50%", background: `radial-gradient(circle,${accent}88,${accent}33)`, boxShadow: `0 0 4px ${accent}44` } })), arrow(1, 0, "right", "\u25B6"), /* @__PURE__ */ React.createElement("div", null), arrow(0, 1, "down", "\u25BC"), /* @__PURE__ */ React.createElement("div", null));
}
function Game() {
  const [screen, setScreen] = useState("title");
  const [menu, setMenu] = useState(null);
  const [combat, setCombat] = useState(null);
  const [cLog, setCLog] = useState([]);
  const [eLog, setELog] = useState([]);
  const logRef = useRef(null);
  const cLogRef = useRef(null);
  const playerRef = useRef(null);
  const [shaking, setShaking] = useState(false);
  const [vfx, setVfx] = useState({ flash: null, particles: [], enemyHit: false });
  const addParticles = useCallback((count, color, spread = 20) => {
    const ps = [];
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const d = Math.random() * spread;
      ps.push({ id: uid(), px: Math.cos(a) * d, py: Math.sin(a) * d - 10, color, dur: 0.4 + Math.random() * 0.3 });
    }
    setVfx((v) => ({ ...v, particles: [...v.particles, ...ps] }));
    setTimeout(() => setVfx((v) => ({ ...v, particles: v.particles.filter((p) => !ps.find((pp) => pp.id === p.id)) })), 800);
  }, []);
  const flash = useCallback((type) => {
    setVfx((v) => ({ ...v, flash: type }));
    setTimeout(() => setVfx((v) => ({ ...v, flash: null })), 300);
  }, []);
  const enemyFlash = useCallback(() => {
    setVfx((v) => ({ ...v, enemyHit: true }));
    setTimeout(() => setVfx((v) => ({ ...v, enemyHit: false })), 200);
  }, []);
  const [settings, setSettings] = useState({ difficulty: "normal", tileSize: 13, minimap: true });
  const [player, setPlayer] = useState(null);
  const [dun, setDun] = useState(null);
  const [wand, setWand] = useState([]);
  const [bossAlive, setBossAlive] = useState(true);
  const [inSanc, setInSanc] = useState(false);
  const [lastSanc, setLastSanc] = useState(0);
  const [stats, setStats] = useState({ kills: 0, chests: 0, totG: 0, megaK: 0, erebus: false, steps: 0 });
  const [save, setSave] = useState(() => {
    try {
      const s = localStorage.getItem("dos_save");
      return s ? JSON.parse(s) : null;
    } catch (e) {
      return null;
    }
  });
  const [pendingDeath, setPendingDeath] = useState(false);
  const [shop, setShop] = useState(null);
  const [cInv, setCInv] = useState(false);
  const [isLand, setIsLand] = useState(() => typeof window !== "undefined" && window.innerWidth > window.innerHeight);
  const [isDesk, setIsDesk] = useState(() => typeof window !== "undefined" && !("ontouchstart" in window) && window.innerWidth >= 1024);
  const [winSize, setWinSize] = useState(() => typeof window !== "undefined" ? { w: window.innerWidth, h: window.innerHeight } : { w: 1024, h: 768 });
  useEffect(() => {
    const h = () => {
      setIsLand(window.innerWidth > window.innerHeight);
      setIsDesk(!("ontouchstart" in window) && window.innerWidth >= 1024);
      setWinSize({ w: window.innerWidth, h: window.innerHeight });
    };
    const oh = () => setTimeout(h, 150);
    window.addEventListener("resize", h);
    window.addEventListener("orientationchange", oh);
    return () => {
      window.removeEventListener("resize", h);
      window.removeEventListener("orientationchange", oh);
    };
  }, []);
  const log = useCallback((m, ty = "info") => setELog((p) => [...p.slice(-80), { m, ty, ts: Date.now() }]), []);
  const shk = useCallback(() => {
    setShaking(true);
    flash("damage");
    SFX.enemyHit();
    setTimeout(() => setShaking(false), 250);
  }, [flash]);
  const handleDeath = useCallback(() => {
    SFX.death();
    if (lastSanc > 0) setScreen("respawn");
    else setScreen("gameOver");
  }, [lastSanc]);
  useEffect(() => {
    playerRef.current = player;
  }, [player]);
  useEffect(() => {
    if (pendingDeath) {
      setPendingDeath(false);
      handleDeath();
    }
  }, [pendingDeath, handleDeath]);
  const startGame = useCallback((cls) => {
    const base = CLASSES[cls];
    const d = genDungeon(1);
    const p = { cls, name: base.name, icon: base.icon, hp: base.hp, maxHp: base.hp, mp: base.mp, maxMp: base.mp, baseMaxMp: base.mp, str: base.str, dex: base.dex, int: base.int, baseDef: base.def, level: 1, xp: 0, floor: 1, gold: 0, x: d.start.x, y: d.start.y, inv: [{ ...CONS[0], id: uid() }, { ...CONS[0], id: uid() }, { ...CONS[1], id: uid() }], equipped: { weapon: null, armor: null }, skills: base.skills, unlocked: [base.skills[0]], vr: VR, torchB: 0, poisoned: false };
    d.revealed = revA(d.revealed, d.start.x, d.start.y, VR);
    setPlayer(p);
    setDun(d);
    setBossAlive(true);
    setInSanc(false);
    setLastSanc(0);
    setWand(spawnW(d, 1));
    setStats({ kills: 0, chests: 0, totG: 0, megaK: 0, erebus: false, steps: 0 });
    setPendingDeath(false);
    setELog([{ m: `${base.name} enters. Floor 1 \u2014 ${d.fc.name} ${d.fc.icon}`, ty: "system", ts: Date.now() }]);
    setCombat(null);
    setMenu(null);
    setScreen("game");
  }, []);
  function spawnW(d, f) {
    if (d.isSanc) return [];
    const e = [];
    for (let i = 0; i < rng(3, 5 + Math.floor(f / 5)); i++) {
      const ri = rng(1, Math.max(1, d.rooms.length - 2));
      const r = d.rooms[ri];
      if (!r) continue;
      const ex = rng(r.x, r.x + r.w - 1), ey = rng(r.y, r.y + r.h - 1);
      if (d.map[ey] && d.map[ey][ex] === T.FLOOR) e.push({ ...getEnemy(f), x: ex, y: ey });
    }
    return e;
  }
  const moveW = useCallback(() => {
    if (!dun) return;
    setWand((prev) => {
      const occupied = new Set(prev.map((e) => `${e.x},${e.y}`));
      return prev.map((e) => {
        if (Math.random() > 0.35) return e;
        const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];
        const [dx, dy] = dirs[rng(0, 3)];
        const nx = e.x + dx, ny = e.y + dy;
        const key = `${nx},${ny}`;
        if (nx >= 0 && nx < MW && ny >= 0 && ny < MH && dun.map[ny] && dun.map[ny][nx] === T.FLOOR && !occupied.has(key)) {
          occupied.delete(`${e.x},${e.y}`);
          occupied.add(key);
          return { ...e, x: nx, y: ny };
        }
        return e;
      });
    });
  }, [dun]);
  const enterSanctuary = useCallback((af) => {
    const d = genDungeon(af, true);
    d.revealed = revA(d.revealed, d.start.x, d.start.y, VR + 2);
    setDun(d);
    setPlayer((p) => ({ ...p, x: d.start.x, y: d.start.y, hp: p.maxHp, mp: p.maxMp, poisoned: false }));
    setWand([]);
    setBossAlive(false);
    setInSanc(true);
    setLastSanc(af);
    SFX.sanctuary();
    flash("heal");
    log("\u{1F3D5}\uFE0F SANCTUARY \u2014 HP & MP restored! Respawn set.", "heal");
  }, [log, flash]);
  const nextFloor = useCallback(() => {
    if (inSanc) {
      const nf2 = player.floor + 1;
      if (nf2 > 100) {
        setScreen("victory");
        return;
      }
      const d2 = genDungeon(nf2);
      d2.revealed = revA(d2.revealed, d2.start.x, d2.start.y, player.vr + player.torchB);
      setDun(d2);
      setPlayer((p) => ({ ...p, floor: nf2, x: d2.start.x, y: d2.start.y }));
      setWand(spawnW(d2, nf2));
      setBossAlive(true);
      setInSanc(false);
      const fc3 = getFC(nf2);
      log(`Floor ${nf2} \u2014 ${fc3.name} ${fc3.icon}`, "system");
      if (nf2 % 10 === 0) log("\u26A0\uFE0F MEGA BOSS!", "danger");
      return;
    }
    if (player.floor % 10 === 0) {
      enterSanctuary(player.floor);
      return;
    }
    const nf = player.floor + 1;
    if (nf > 100) {
      setScreen("victory");
      return;
    }
    const d = genDungeon(nf);
    d.revealed = revA(d.revealed, d.start.x, d.start.y, player.vr + player.torchB);
    setDun(d);
    setPlayer((p) => ({ ...p, floor: nf, x: d.start.x, y: d.start.y }));
    setWand(spawnW(d, nf));
    setBossAlive(true);
    const fc2 = getFC(nf);
    log(`Floor ${nf} \u2014 ${fc2.name} ${fc2.icon}`, "system");
    if (nf % 10 === 0) log("\u26A0\uFE0F MEGA BOSS!", "danger");
  }, [player, inSanc, enterSanctuary, log]);
  const respawn = useCallback(() => {
    if (lastSanc <= 0) return;
    enterSanctuary(lastSanc);
    setPlayer((p) => ({ ...p, floor: lastSanc, gold: Math.floor(p.gold * 0.75) }));
    setCombat(null);
    setMenu(null);
    log("Respawned. -25% gold.", "system");
    setScreen("game");
  }, [lastSanc, enterSanctuary, log]);
  const equipBest = useCallback(() => {
    const best = getBestEquip(player);
    setPlayer((p) => {
      let np = { ...p, inv: [...p.inv] };
      if (best.weapon && best.weapon.id !== np.equipped.weapon?.id) {
        const old = np.equipped.weapon;
        np.inv = np.inv.filter((i) => i.id !== best.weapon.id);
        if (old) np.inv.push(old);
        np.equipped = { ...np.equipped, weapon: best.weapon };
        log(`\u2B06\uFE0F ${best.weapon.icon} ${best.weapon.name}`, "info");
      }
      if (best.armor && best.armor.id !== np.equipped.armor?.id) {
        const old = np.equipped.armor;
        np.inv = np.inv.filter((i) => i.id !== best.armor.id);
        if (old) np.inv.push(old);
        np.equipped = { ...np.equipped, armor: best.armor };
        log(`\u2B06\uFE0F ${best.armor.icon} ${best.armor.name}`, "info");
      }
      return np;
    });
  }, [player, log]);
  const useItem = useCallback((item, inC = false) => {
    if (item.type === "consumable") {
      setPlayer((p) => {
        const ni = [...p.inv];
        const idx = ni.findIndex((i) => i.id === item.id);
        if (idx === -1) return p;
        ni.splice(idx, 1);
        let np = { ...p, inv: ni };
        if (item.effect === "hp") {
          const pct = item.amt >= 80 ? Math.floor(np.maxHp * 0.35) : Math.floor(np.maxHp * 0.2);
          const heal = Math.max(item.amt, pct);
          np.hp = Math.min(np.maxHp, np.hp + heal);
          log(`+${heal}HP`, "heal");
        }
        if (item.effect === "mp") {
          const pct = item.amt >= 60 ? Math.floor(np.maxMp * 0.35) : Math.floor(np.maxMp * 0.2);
          const heal = Math.max(item.amt, pct);
          np.mp = Math.min(np.maxMp, np.mp + heal);
          log(`+${heal}MP`, "heal");
        }
        if (item.effect === "cure") {
          np.poisoned = false;
          log("Cured!", "heal");
        }
        if (item.effect === "vision") {
          np.torchB = Math.min(np.torchB + item.amt, 4);
          log("Vision+", "info");
        }
        if (item.effect === "full" || item.effect === "revive") {
          np.hp = np.maxHp;
          np.mp = np.maxMp;
          np.poisoned = false;
          log("Full restore!", "heal");
        }
        if (item.effect === "hp" || item.effect === "mp" || item.effect === "cure" || item.effect === "full" || item.effect === "revive") {
          SFX.heal();
          flash("heal");
        }
        return np;
      });
      if (inC && item.effect === "damage") {
        SFX.hit();
        addParticles(5, "#fa0");
        const bDmg = Math.max(item.amt, item.amt + Math.floor((player?.floor || 1) * 1.5));
        setCombat((c) => {
          if (!c) return c;
          const nh = c.enemy.hp - bDmg;
          setCLog((pr) => [...pr, `\u{1F4A3} ${bDmg}dmg!`]);
          if (nh <= 0) return { ...c, enemy: { ...c.enemy, hp: 0 }, phase: "won" };
          return { ...c, enemy: { ...c.enemy, hp: nh } };
        });
      }
    } else if (item.type === "weapon") {
      SFX.equip();
      setPlayer((p) => {
        const old = p.equipped.weapon;
        const ni = p.inv.filter((i) => i.id !== item.id);
        if (old) ni.push(old);
        log(`Equipped ${item.name}`, "info");
        return { ...p, inv: ni, equipped: { ...p.equipped, weapon: item } };
      });
    } else if (item.type === "armor") {
      SFX.equip();
      setPlayer((p) => {
        const old = p.equipped.armor;
        const ni = p.inv.filter((i) => i.id !== item.id);
        if (old) ni.push(old);
        log(`Equipped ${item.name}`, "info");
        return { ...p, inv: ni, equipped: { ...p.equipped, armor: item } };
      });
    }
  }, [log, player?.floor, flash, addParticles]);
  const startCombat = useCallback((enemy) => {
    const dm = settings.difficulty === "easy" ? 0.8 : settings.difficulty === "hard" ? 1.35 : 1;
    const scaled = { ...enemy, hp: Math.floor(enemy.hp * dm), maxHp: Math.floor(enemy.maxHp * dm), atk: Math.floor(enemy.atk * dm) };
    setCombat({ enemy: scaled, phase: "player", turn: 1 });
    setMenu(null);
    setCInv(false);
    setCLog([`${scaled.isMega ? "\u26A0\uFE0F MEGA BOSS \u2014 " : ""}${scaled.isBoss && !scaled.isMega ? "\u{1F479} BOSS: " : ""}${scaled.icon} ${scaled.name}!${scaled.title ? " \u2014 " + scaled.title : ""}${scaled.subtitle ? " \u2014 " + scaled.subtitle : ""}`]);
    log(`${scaled.isBoss ? "BOSS: " : ""}${scaled.name}!`, "danger");
    if (scaled.isMega || scaled.isBoss) SFX.boss();
  }, [log, settings.difficulty]);
  const calcPlayerDmg = (raw, eDef, variance) => {
    const red = eDef / (eDef + raw + 40);
    const base = raw * (1 - red);
    return rollDmg(base, variance);
  };
  const pAtk = useCallback((skill = null) => {
    if (!combat || combat.phase !== "player") return;
    const st = calcStats(player);
    const eDef = combat.enemy.def;
    let dmg, msg = "", isCrit = false;
    if (skill) {
      if (skill === "Smoke Bomb") {
        if (combat.enemy.isBoss) {
          setCLog((p) => [...p, "Can't flee bosses!"]);
          return;
        }
        if (player.mp < 6) {
          setCLog((p) => [...p, "Not enough MP!"]);
          return;
        }
        setPlayer((p) => ({ ...p, mp: p.mp - 6 }));
        setCLog((p) => [...p, "\u{1F4A8} Escaped!"]);
        setTimeout(() => {
          setCombat(null);
          log("Escaped!", "info");
        }, 500);
        return;
      }
      const sm = {
        "Power Strike": { d: () => calcPlayerDmg(st.atk * 2, eDef, st.atk * 0.3), mp: 8, m: "\u2694\uFE0F Power Strike!" },
        "Cleave": { d: () => calcPlayerDmg(st.atk * 1.5, eDef, st.atk * 0.25), mp: 12, m: "\u{1F4A5} Cleave!" },
        "War Cry": { d: () => {
          const bonus = Math.min(2, 10 - Math.max(0, player.str - CLASSES[player.cls].str));
          if (bonus <= 0) {
            setCLog((p) => [...p, "STR maxed from War Cry!"]);
            return 0;
          }
          setPlayer((p) => ({ ...p, str: p.str + bonus }));
          return 0;
        }, mp: 10, m: "\u{1F4E2} +STR!", no: true },
        "Berserk": { d: () => calcPlayerDmg(st.atk * 3, eDef, st.atk * 0.4), mp: 20, m: "\u{1F525} BERSERK!" },
        "Fireball": { d: () => calcPlayerDmg(player.int * 3, eDef * 0.5, player.int * 0.4), mp: 15, m: "\u{1F525} Fireball!" },
        "Ice Shard": { d: () => calcPlayerDmg(player.int * 2.2, eDef * 0.3, player.int * 0.3), mp: 10, m: "\u2744\uFE0F Ice Shard!" },
        "Chain Bolt": { d: () => calcPlayerDmg(player.int * 2.5, eDef * 0.3, player.int * 0.35), mp: 22, m: "\u26A1 Chain Bolt!" },
        "Meteor": { d: () => calcPlayerDmg(player.int * 4, eDef * 0.6, player.int * 0.5), mp: 35, m: "\u2604\uFE0F METEOR!" },
        "Backstab": { d: () => calcPlayerDmg(st.atk + player.dex * 2, eDef, player.dex * 0.4), mp: 10, m: "\u{1F5E1}\uFE0F Backstab!" },
        "Assassinate": { d: () => calcPlayerDmg(st.atk * 2 + player.dex * 3, eDef, player.dex * 0.5), mp: 25, m: "\u{1F480} Assassinate!" },
        "Shadow Step": { d: () => calcPlayerDmg(st.atk + player.dex * 2.5, eDef * 0.5, player.dex * 0.35), mp: 18, m: "\u{1F464} Shadow Step!" },
        "Shield Wall": { d: () => 0, mp: 5, m: "\u{1F6E1}\uFE0F Shield Wall!", sp: "sw" },
        "Arcane Shield": { d: () => 0, mp: 8, m: "\u{1F52E} Arcane Shield!", sp: "as" },
        "Steal": { d: () => {
          if (Math.random() < 0.5 + player.dex * 0.02) {
            const g = rng(1, combat.enemy.gold || 10);
            setPlayer((p) => ({ ...p, gold: p.gold + g }));
            setCLog((p) => [...p, `\u{1F911} +${g}g!`]);
          } else setCLog((p) => [...p, "Miss!"]);
          return 0;
        }, mp: 5, m: "", no: true }
      };
      const s = sm[skill];
      if (!s) return;
      if (player.mp < s.mp) {
        setCLog((p) => [...p, "Not enough MP!"]);
        return;
      }
      setPlayer((p) => ({ ...p, mp: p.mp - s.mp }));
      if (s.sp === "sw") {
        setCLog((p) => [...p, s.m]);
        setCombat((c) => ({ ...c, phase: "enemy", sw: true }));
        return;
      }
      if (s.sp === "as") {
        setCLog((p) => [...p, s.m]);
        setCombat((c) => ({ ...c, phase: "enemy", as: true }));
        return;
      }
      dmg = Math.max(1, Math.floor(s.d()));
      msg = s.m;
      if (s.no) {
        if (msg) setCLog((p) => [...p, msg]);
        setCombat((c) => ({ ...c, phase: "enemy" }));
        return;
      }
      SFX.hit();
    } else {
      const baseAtk = player.cls === "mage" ? st.atk + Math.floor(player.int * 1.5) : st.atk;
      isCrit = Math.random() < player.dex * 0.015 + 0.06;
      dmg = calcPlayerDmg(baseAtk, eDef, Math.max(2, baseAtk * 0.2));
      if (isCrit) {
        dmg = Math.floor(dmg * 1.9);
        msg = "\u{1F4A5} CRIT! ";
        SFX.crit();
      } else {
        SFX.hit();
      }
    }
    dmg = Math.max(1, dmg);
    setCLog((p) => [...p, `${msg}${dmg}dmg!`]);
    addParticles(isCrit ? 8 : 4, "#f44");
    enemyFlash();
    const nh = combat.enemy.hp - dmg;
    if (nh <= 0) setCombat((c) => ({ ...c, enemy: { ...c.enemy, hp: 0 }, phase: "won" }));
    else setCombat((c) => ({ ...c, enemy: { ...c.enemy, hp: nh }, phase: "enemy" }));
  }, [combat, player, log, enemyFlash, addParticles]);
  useEffect(() => {
    if (!combat || combat.phase !== "enemy") return;
    const t = setTimeout(() => {
      const p = playerRef.current;
      if (!p) return;
      const st = calcStats(p);
      if (Math.random() < p.dex * 0.012) {
        SFX.miss();
        setCLog((pr) => [...pr, `${combat.enemy.icon} misses!`]);
        setCombat((c) => ({ ...c, phase: "player", turn: c.turn + 1, sw: false, as: false }));
        return;
      }
      const dmg = calcEnemyDmg(combat.enemy, st, { sw: !!combat.sw, as: !!combat.as });
      const didPoison = !p.poisoned && Math.random() < 0.15;
      shk();
      setCLog((pr) => [...pr, `${combat.enemy.icon} ${dmg}dmg!${didPoison ? " \u2620\uFE0F Poisoned!" : ""}`]);
      const nh = p.hp - dmg;
      if (nh <= 0) {
        setPlayer((pp) => ({ ...pp, hp: 0 }));
        setCombat((c) => ({ ...c, phase: "lost" }));
      } else {
        setPlayer((pp) => ({ ...pp, hp: nh, poisoned: pp.poisoned || didPoison }));
        setCombat((c) => ({ ...c, phase: "player", turn: c.turn + 1, sw: false, as: false }));
      }
    }, 650);
    return () => clearTimeout(t);
  }, [combat?.phase]);
  const flee = useCallback(() => {
    if (combat?.enemy?.isBoss) {
      setCLog((p) => [...p, "Can't flee!"]);
      SFX.error();
      return;
    }
    if (Math.random() < 0.35 + player.dex * 0.015) {
      setCombat(null);
      SFX.flee();
      log("Fled!", "info");
    } else {
      setCLog((p) => [...p, "Failed!"]);
      SFX.miss();
      setCombat((c) => ({ ...c, phase: "enemy" }));
    }
  }, [combat, player, log]);
  const claimWin = useCallback(() => {
    if (!combat) return;
    const e = combat.enemy;
    const dm = settings.difficulty === "easy" ? 0.7 : settings.difficulty === "hard" ? 1.4 : 1;
    const xpG = Math.floor(e.xp * dm);
    setPlayer((p) => {
      let np = { ...p, xp: p.xp + xpG, gold: p.gold + e.gold };
      while (np.xp >= xpFor(np.level)) {
        np.xp -= xpFor(np.level);
        np.level++;
        np.maxHp += np.cls === "warrior" ? 10 : np.cls === "mage" ? 4 : 7;
        np.hp = np.maxHp;
        np.baseMaxMp += np.cls === "mage" ? 12 : np.cls === "thief" ? 6 : 3;
        np.maxMp = np.baseMaxMp + (np.equipped.armor?.mpB || 0);
        np.mp = np.maxMp;
        np.str += np.cls === "warrior" ? 2 : 1;
        np.dex += np.cls === "thief" ? 2 : 1;
        np.int += np.cls === "mage" ? 2 : 1;
        np.baseDef += np.cls === "warrior" ? 2 : 1;
        [1, 4, 8, 14, 22].forEach((th, i) => {
          if (np.level >= th && np.skills[i] && !np.unlocked.includes(np.skills[i])) np.unlocked = [...np.unlocked, np.skills[i]];
        });
        SFX.levelUp();
        flash("heal");
        log(`\u2B06\uFE0F LEVEL ${np.level}!`, "levelup");
      }
      if (e.isBoss) {
        const bf = e.bossFloor || player.floor;
        const uw = genFloorWeapon(bf, np.cls);
        const ua = genFloorArmor(bf, np.cls);
        const hasW = np.inv.some((i) => i.id === uw.id) || np.equipped.weapon && np.equipped.weapon.id === uw.id;
        const hasA = np.inv.some((i) => i.id === ua.id) || np.equipped.armor && np.equipped.armor.id === ua.id;
        if (!hasW) {
          np.inv = [...np.inv, uw];
          log(`\u{1F5E1}\uFE0F ${uw.icon} ${uw.name} (F${bf})!`, "loot");
        }
        if (!hasA) {
          np.inv = [...np.inv, ua];
          log(`\u{1F6E1}\uFE0F ${ua.icon} ${ua.name} (F${bf})!`, "loot");
        }
      }
      return np;
    });
    if (e.isBoss) setBossAlive(false);
    setWand((p) => p.filter((w) => w.id !== e.id));
    setStats((p) => ({ ...p, kills: p.kills + 1, totG: p.totG + e.gold, megaK: p.megaK + (e.isMega ? 1 : 0), erebus: p.erebus || e.name === "Erebus" }));
    log(`${e.isBoss ? "\u{1F3C6}" : "\u2694\uFE0F"} ${e.name}! +${xpG}xp +${e.gold}g`, "victory");
    if (!e.isBoss && Math.random() < 0.25) {
      const l = getChestLoot(player.floor);
      setPlayer((p) => ({ ...p, inv: [...p.inv, l] }));
      log(`Drop: ${l.icon} ${l.name}`, "loot");
    }
    setCombat(null);
  }, [combat, player, settings, log]);
  const move = useCallback((dx, dy) => {
    if (!player || !dun || combat || menu || shop) return;
    const nx = player.x + dx, ny = player.y + dy;
    if (nx < 0 || nx >= MW || ny < 0 || ny >= MH) return;
    const tile = dun.map[ny][nx];
    if (tile === T.WALL) {
      if (Math.random() < 0.08 && player.int > 10) {
        const nm = dun.map.map((r) => [...r]);
        nm[ny][nx] = T.FLOOR;
        setDun((d) => ({ ...d, map: nm }));
        log("Secret!", "loot");
      }
      return;
    }
    if (tile === T.PIT) {
      const d = rng(5 + player.floor, 15 + player.floor * 2);
      const willDie = player.hp - d <= 0;
      setPlayer((p) => ({ ...p, hp: Math.max(0, p.hp - d) }));
      log(`Pit! -${d}HP`, "danger");
      shk();
      if (willDie) setPendingDeath(true);
      return;
    }
    setPlayer((p) => ({ ...p, x: nx, y: ny }));
    setStats((p) => ({ ...p, steps: p.steps + 1 }));
    SFX.step();
    setDun((d) => ({ ...d, revealed: revA(d.revealed, nx, ny, player.vr + player.torchB) }));
    if (tile === T.TRAP) {
      const d = rng(4 + player.floor * 2, 10 + player.floor * 3);
      if (Math.random() < player.dex * 0.025) log("Disarmed!", "info");
      else {
        SFX.trap();
        const willDie = player.hp - d <= 0;
        setPlayer((p) => ({ ...p, hp: Math.max(0, p.hp - d) }));
        log(`Trap! -${d}HP`, "danger");
        shk();
        if (willDie) setPendingDeath(true);
      }
      const nm = dun.map.map((r) => [...r]);
      nm[ny][nx] = T.FLOOR;
      setDun((d2) => ({ ...d2, map: nm }));
    }
    if (tile === T.CHEST) {
      SFX.chest();
      flash("loot");
      addParticles(6, "#fa0");
      const loot = getChestLoot(player.floor);
      const g = rng(5, 12 + player.floor * 4);
      setPlayer((p) => ({ ...p, inv: [...p.inv, loot], gold: p.gold + g }));
      setStats((p) => ({ ...p, chests: p.chests + 1, totG: p.totG + g }));
      log(`Chest! ${loot.icon} ${loot.name} +${g}g`, "loot");
      const nm = dun.map.map((r) => [...r]);
      nm[ny][nx] = T.FLOOR;
      setDun((d2) => ({ ...d2, map: nm }));
    }
    if (tile === T.FIRE || tile === T.LAVA) {
      const d = rng(3 + player.floor, 10 + player.floor * 2);
      const willDie = player.hp - d <= 0;
      setPlayer((p) => ({ ...p, hp: Math.max(0, p.hp - d) }));
      log(`${tile === T.LAVA ? "Lava" : "Fire"}! -${d}HP`, "danger");
      shk();
      if (willDie) setPendingDeath(true);
    }
    if (tile === T.ICE && Math.random() < 0.3) {
      const d = rng(2, 6);
      setPlayer((p) => ({ ...p, hp: Math.max(1, p.hp - d) }));
      log(`Slipped! -${d}HP`, "danger");
    }
    if (tile === T.VOID) {
      const d = rng(5 + player.floor, 15 + player.floor);
      const willDie = player.hp - d <= 0;
      setPlayer((p) => ({ ...p, hp: Math.max(0, p.hp - d), mp: Math.max(0, p.mp - 5) }));
      log(`Void! -${d}HP`, "danger");
      if (willDie) setPendingDeath(true);
    }
    if (tile === T.FOUNTAIN) {
      SFX.fountain();
      flash("heal");
      const h = rng(20, 40 + player.floor), m = rng(10, 25);
      setPlayer((p) => ({ ...p, hp: Math.min(p.maxHp, p.hp + h), mp: Math.min(p.maxMp, p.mp + m) }));
      log(`Fountain! +${h}HP +${m}MP`, "heal");
      const nm = dun.map.map((r) => [...r]);
      nm[ny][nx] = T.FLOOR;
      setDun((d2) => ({ ...d2, map: nm }));
    }
    if (tile === T.SHOP) {
      SFX.buy();
      const s = genShopStock(player.floor, player.cls);
      setShop(s);
      log(`${s.icon} ${s.name}: "Browse my wares!"`, "system");
      return;
    }
    if (tile === T.STAIRS) {
      if (!inSanc && bossAlive) {
        const boss = player.floor % 10 === 0 ? getMegaBoss(player.floor) : getFloorBoss(player.floor);
        startCombat(boss);
        return;
      }
      nextFloor();
      return;
    }
    if (!inSanc && bossAlive && dun.bossPos && nx === dun.bossPos.x && ny === dun.bossPos.y) {
      const boss = player.floor % 10 === 0 ? getMegaBoss(player.floor) : getFloorBoss(player.floor);
      startCombat(boss);
      return;
    }
    const hit = wand.find((e) => e.x === nx && e.y === ny);
    if (hit) {
      startCombat(hit);
      return;
    }
    if (!inSanc && bossAlive && tile === T.FLOOR && Math.random() < 0.08) {
      startCombat(getEnemy(player.floor));
      return;
    }
    if (player.poisoned) setPlayer((p) => ({ ...p, hp: Math.max(1, p.hp - 2) }));
    if (!inSanc) moveW();
  }, [player, dun, combat, menu, shop, wand, bossAlive, inSanc, nextFloor, startCombat, moveW, log, shk]);
  useEffect(() => {
    const h = (e) => {
      if (screen !== "game") return;
      if (shop) {
        if (e.key === "Escape") setShop(null);
        return;
      }
      if (combat) {
        if (combat.phase === "won" && (e.key === "Enter" || e.key === " ")) claimWin();
        if (combat.phase === "lost" && (e.key === "Enter" || e.key === " ")) handleDeath();
        return;
      }
      if (menu) {
        if (e.key === "Escape") setMenu(null);
        return;
      }
      const m = { ArrowUp: [0, -1], w: [0, -1], W: [0, -1], ArrowDown: [0, 1], s: [0, 1], S: [0, 1], ArrowLeft: [-1, 0], a: [-1, 0], A: [-1, 0], ArrowRight: [1, 0], d: [1, 0], D: [1, 0] };
      if (m[e.key]) {
        e.preventDefault();
        move(...m[e.key]);
      }
      if (e.key === "i" || e.key === "I") setMenu((x) => x === "inv" ? null : "inv");
      if (e.key === "Escape") setMenu(null);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [screen, combat, menu, shop, move, claimWin, handleDeath]);
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [eLog]);
  useEffect(() => {
    if (cLogRef.current) cLogRef.current.scrollTop = cLogRef.current.scrollHeight;
  }, [cLog]);
  const saveGame = useCallback(() => {
    const data = { player, dun: { ...dun }, wand, stats, eLog, bossAlive, inSanc, lastSanc, completedQuests: [...completedQuests] };
    setSave(data);
    try {
      localStorage.setItem("dos_save", JSON.stringify(data));
    } catch (e) {
    }
    log("Saved!", "system");
  }, [player, dun, wand, stats, eLog, bossAlive, inSanc, lastSanc, completedQuests, log]);
  const loadGame = useCallback(() => {
    const s = save || (() => {
      try {
        const d = localStorage.getItem("dos_save");
        return d ? JSON.parse(d) : null;
      } catch (e) {
        return null;
      }
    })();
    if (!s) return;
    setPlayer(s.player);
    setDun(s.dun);
    setWand(s.wand);
    setStats(s.stats);
    setELog(s.eLog);
    setBossAlive(s.bossAlive);
    setInSanc(s.inSanc);
    setLastSanc(s.lastSanc);
    if (s.completedQuests) setCompletedQuests(new Set(s.completedQuests));
    setCombat(null);
    setMenu(null);
    setPendingDeath(false);
    setCInv(false);
    log("Loaded!", "system");
  }, [save, log]);
  const [completedQuests, setCompletedQuests] = useState(() => /* @__PURE__ */ new Set());
  useEffect(() => {
    if (!player) return;
    const st = { ...stats, floor: player.floor, level: player.level };
    let xpGain = 0;
    const newDone = new Set(completedQuests);
    OBJ.forEach((o) => {
      if (!newDone.has(o.id) && o.c(st)) {
        newDone.add(o.id);
        xpGain += o.xp;
        log(`\u{1F4DC} Quest complete: ${o.text} +${o.xp}xp`, "levelup");
      }
    });
    if (xpGain > 0) {
      setCompletedQuests(newDone);
      setPlayer((p) => ({ ...p, xp: p.xp + xpGain }));
    }
  }, [stats, player?.floor, player?.level]);
  useEffect(() => {
    if (player && dun && screen === "game") {
      const data = { player, dun: { ...dun }, wand, stats, eLog, bossAlive, inSanc, lastSanc, completedQuests: [...completedQuests] };
      setSave(data);
      try {
        localStorage.setItem("dos_save", JSON.stringify(data));
      } catch (e) {
      }
    }
    ;
  }, [player?.floor, inSanc, stats.kills, bossAlive]);
  const computed = useMemo(() => player ? calcStats(player) : null, [player]);
  const fc = dun?.fc || (inSanc ? SANC_CONFIG : FLOOR_CONFIGS[0]);
  const logCol = (t) => ({ danger: "#e54", heal: "#4c6", loot: "#ea3", victory: "#d4a843", levelup: "#c4c", system: "#58c" })[t] || "#667";
  const recW = useMemo(() => {
    if (!player) return null;
    const b = getBestEquip(player);
    return b.weapon && b.weapon.id !== player.equipped.weapon?.id ? b.weapon : null;
  }, [player]);
  const recA = useMemo(() => {
    if (!player) return null;
    const b = getBestEquip(player);
    return b.armor && b.armor.id !== player.equipped.armor?.id ? b.armor : null;
  }, [player]);
  const hasRec = recW || recA;
  const btnS = { padding: "7px 12px", background: "#111119", border: "1px solid #2a2a3a", color: "#888", borderRadius: 7, fontSize: 10, cursor: "pointer", fontFamily: "'JetBrains Mono',monospace", touchAction: "manipulation" };
  const fullScreen = (bg, ch) => /* @__PURE__ */ React.createElement("div", { style: { width: "100vw", height: "100dvh", overflow: "hidden", background: "#000" } }, /* @__PURE__ */ React.createElement("div", { style: { height: "100%", marginLeft: "env(safe-area-inset-left,0px)", marginRight: "env(safe-area-inset-right,0px)", background: bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", userSelect: "none", padding: 24 } }, /* @__PURE__ */ React.createElement("style", null, CSS), ch));
  if (screen === "title") return fullScreen("radial-gradient(ellipse at 50% 35%,#1e1a10,#0c0c14 65%)", /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 32, color: "#d4a843", textShadow: "0 0 30px #d4a84333", letterSpacing: 4, textAlign: "center", lineHeight: 1.2, fontFamily: "'Cinzel',serif" } }, "DEPTHS OF", /* @__PURE__ */ React.createElement("br", null), "SHADOW"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: "#555", letterSpacing: 5, marginTop: 10, fontFamily: "'JetBrains Mono',monospace" } }, "A DUNGEON CRAWLER"), /* @__PURE__ */ React.createElement("div", { style: { width: "60%", height: 1, background: "linear-gradient(90deg,transparent,#d4a84344,transparent)", margin: "24px 0" } }), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 240 } }, /* @__PURE__ */ React.createElement("button", { style: { padding: "14px 0", background: "#1a1508", border: "1px solid #8b691466", color: "#d4a843", borderRadius: 8, fontSize: 14, letterSpacing: 3, fontFamily: "'Cinzel',serif", cursor: "pointer" }, onClick: () => setScreen("classSelect") }, "NEW GAME"), save && /* @__PURE__ */ React.createElement("button", { style: { padding: "11px 0", background: "#111119", border: "1px solid #2a2a3a", color: "#888", borderRadius: 8, fontSize: 11, fontFamily: "'JetBrains Mono',monospace", cursor: "pointer" }, onClick: () => {
    loadGame();
    setScreen("game");
  } }, "CONTINUE \u2014 F", save.player.floor))));
  if (screen === "classSelect") return /* @__PURE__ */ React.createElement("div", { style: { width: "100vw", height: "100dvh", overflow: "hidden", background: "#000" } }, /* @__PURE__ */ React.createElement("div", { style: { height: "100%", marginLeft: "env(safe-area-inset-left,0px)", marginRight: "env(safe-area-inset-right,0px)", overflow: "auto", background: "#0c0c14", display: "flex", flexDirection: "column", alignItems: "center", padding: "28px 16px", userSelect: "none" } }, /* @__PURE__ */ React.createElement("style", null, CSS), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 16, color: "#d4a843", letterSpacing: 4, marginBottom: 20, fontFamily: "'Cinzel',serif" } }, "CHOOSE CLASS"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 340 } }, Object.entries(CLASSES).map(([k, c]) => /* @__PURE__ */ React.createElement("button", { key: k, onClick: () => startGame(k), style: { padding: 14, textAlign: "left", display: "flex", gap: 12, alignItems: "center", background: "#111119", border: "1px solid #2a2a3a", borderRadius: 10, cursor: "pointer", color: "#c8c8d0", fontFamily: "'JetBrains Mono',monospace" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 30, width: 40, textAlign: "center" } }, c.icon), /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: "#d4a843", fontFamily: "'Cinzel',serif" } }, c.name), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: "#777", lineHeight: 1.4 } }, c.desc), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 9, color: "#4a4a5a", marginTop: 4 } }, "HP:", c.hp, " MP:", c.mp, " STR:", c.str, " DEX:", c.dex, " INT:", c.int))))), /* @__PURE__ */ React.createElement("button", { style: { marginTop: 18, ...btnS }, onClick: () => setScreen("title") }, "\u2190 Back")));
  if (screen === "respawn") return fullScreen("radial-gradient(ellipse at center,#0a1828,#0c0c14 65%)", /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 40 } }, "\u{1F3D5}\uFE0F"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 20, color: "#66bbee", letterSpacing: 3, fontFamily: "'Cinzel',serif" } }, "SANCTUARY RESPAWN"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "#888", marginTop: 10, textAlign: "center", lineHeight: 1.8, fontFamily: "'JetBrains Mono',monospace" } }, "Fell on Floor ", player?.floor, ".", /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("span", { style: { color: "#c84" } }, "-25% gold penalty")), /* @__PURE__ */ React.createElement("button", { style: { marginTop: 24, padding: "12px 28px", background: "#0a1828", border: "1px solid #6be4", color: "#6be", borderRadius: 8, fontSize: 12, cursor: "pointer", fontFamily: "'Cinzel',serif", letterSpacing: 2 }, onClick: respawn }, "RESPAWN")));
  if (screen === "gameOver") return fullScreen("radial-gradient(ellipse at center,#2a0808,#0c0c14 65%)", /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 44 } }, "\u{1F480}"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 22, color: "#c33", letterSpacing: 4, fontFamily: "'Cinzel',serif" } }, "YOU DIED"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: "#555", marginTop: 10, fontFamily: "'JetBrains Mono',monospace" } }, "F", player?.floor, " \xB7 Lv", player?.level, " \xB7 ", stats.kills, " kills"), /* @__PURE__ */ React.createElement("button", { style: { marginTop: 24, padding: "12px 28px", background: "#1a0808", border: "1px solid #a336", color: "#c44", borderRadius: 8, fontSize: 12, cursor: "pointer", fontFamily: "'Cinzel',serif" }, onClick: () => setScreen("classSelect") }, "Try Again"), save && /* @__PURE__ */ React.createElement("button", { style: { marginTop: 8, ...btnS }, onClick: () => {
    loadGame();
    setScreen("game");
  } }, "Load Save")));
  if (screen === "victory") return fullScreen("radial-gradient(ellipse at center,#1a1a08,#0c0c14 65%)", /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 48 } }, "\u{1F451}"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 22, color: "#d4a843", letterSpacing: 4, fontFamily: "'Cinzel',serif", marginTop: 8 } }, "VICTORY"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "#999", marginTop: 8 } }, "All 100 floors conquered!"), /* @__PURE__ */ React.createElement("button", { style: { marginTop: 28, ...btnS, borderColor: "#d4a8434", color: "#d4a843" }, onClick: () => setScreen("title") }, "Return")));
  if (!player || !dun) return null;
  const vr = player.vr + player.torchB;
  const viewDX = isDesk ? 18 : 11;
  const viewDY = isDesk ? 12 : 8;
  const cols = viewDX * 2 + 1;
  const rows = viewDY * 2 + 1;
  const ts = isDesk ? Math.max(16, Math.min(52, Math.floor(Math.min(winSize.w * 0.92 / cols, winSize.h * 0.92 / rows)) - 2)) : settings.tileSize;
  const uiS = isDesk ? Math.max(1, Math.min(2.5, ts / 16)) : 1;
  const mmS = isDesk ? Math.max(3, Math.floor(uiS * 3)) : 2.2;
  const mapRows = [];
  for (let dy = -viewDY; dy <= viewDY; dy++) {
    const row = [];
    for (let dx = -viewDX; dx <= viewDX; dx++) {
      const mx = player.x + dx, my = player.y + dy;
      const isP = dx === 0 && dy === 0;
      const inB = mx >= 0 && mx < MW && my >= 0 && my < MH;
      const vis = inB && dun.revealed[my] && dun.revealed[my][mx];
      const inFov = dx * dx + dy * dy <= vr * vr;
      const enemy = wand.find((e) => e.x === mx && e.y === my);
      const isBoss = !inSanc && bossAlive && dun.bossPos && mx === dun.bossPos.x && my === dun.bossPos.y;
      const tile = inB ? dun.map[my][mx] : T.WALL;
      const s = tR(tile, fc, vis, inFov);
      if (isP) {
        const cls = player?.cls || "warrior";
        const pColors = { warrior: { body: "#d4843a", head: "#ffe088", glow: "#fa8", anim: "playerGlowW" }, mage: { body: "#6868cc", head: "#c8c0ff", glow: "#88f", anim: "playerGlowM" }, thief: { body: "#2a8a4a", head: "#90e8a0", glow: "#4f8", anim: "playerGlowT" } }[cls];
        const sz = Math.max(ts - 2, 8);
        const headSz = Math.round(sz * 0.5);
        const bodySz = Math.round(sz * 0.7);
        row.push(/* @__PURE__ */ React.createElement("td", { key: dx, style: { width: ts + 2, height: ts + 2, textAlign: "center", verticalAlign: "middle", padding: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { width: sz, height: sz, margin: "auto", position: "relative", animation: `playerBob 1.2s ease-in-out infinite, ${pColors.anim} 2.5s ease-in-out infinite`, borderRadius: "20%" } }, /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: bodySz, height: Math.round(sz * 0.55), borderRadius: `${Math.round(sz * 0.15)}px ${Math.round(sz * 0.15)}px ${Math.round(sz * 0.1)}px ${Math.round(sz * 0.1)}px`, background: `linear-gradient(180deg,${pColors.body},${pColors.body}88)` } }), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: headSz, height: headSz, borderRadius: "50%", background: `radial-gradient(circle at 40% 35%,${pColors.head},${pColors.body})`, border: `1px solid ${pColors.head}88` } }), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", top: Math.round(headSz * 0.35), left: "50%", transform: "translateX(-50%)", display: "flex", gap: Math.max(1, Math.round(headSz * 0.2)) } }, /* @__PURE__ */ React.createElement("div", { style: { width: Math.max(1, Math.round(headSz * 0.15)), height: Math.max(1, Math.round(headSz * 0.15)), borderRadius: "50%", background: "#111" } }), /* @__PURE__ */ React.createElement("div", { style: { width: Math.max(1, Math.round(headSz * 0.15)), height: Math.max(1, Math.round(headSz * 0.15)), borderRadius: "50%", background: "#111" } })), cls === "warrior" && /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", right: -1, top: Math.round(sz * 0.2), width: Math.max(2, Math.round(sz * 0.12)), height: Math.round(sz * 0.6), background: "linear-gradient(180deg,#ccc,#888)", borderRadius: 1 } }), cls === "mage" && /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", top: -2, left: "50%", transform: "translateX(-50%)", width: headSz + 2, height: Math.round(headSz * 0.4), borderRadius: `${Math.round(headSz * 0.5)}px ${Math.round(headSz * 0.5)}px 0 0`, background: "linear-gradient(180deg,#6060cc,#4040aa)", border: "1px solid #8888ff44", borderBottom: "none" } }), cls === "thief" && /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: -1, top: Math.round(sz * 0.3), width: Math.max(2, Math.round(sz * 0.1)), height: Math.round(sz * 0.45), background: "linear-gradient(180deg,#aaa,#666)", borderRadius: 1, transform: "rotate(-20deg)" } }), player?.poisoned && /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", top: -3, right: -3, width: Math.max(4, Math.round(sz * 0.2)), height: Math.max(4, Math.round(sz * 0.2)), borderRadius: "50%", background: "#0f0", boxShadow: "0 0 4px #0f06", animation: "glow 1s infinite" } }))));
      } else if (enemy && vis && inFov) row.push(/* @__PURE__ */ React.createElement("td", { key: dx, style: { width: ts + 2, height: ts + 2, textAlign: "center", verticalAlign: "middle", padding: 0, fontSize: ts - 3, color: "#f44", textShadow: "0 0 4px #f006" } }, enemy.icon));
      else if (isBoss && vis && inFov) row.push(/* @__PURE__ */ React.createElement("td", { key: dx, style: { width: ts + 2, height: ts + 2, textAlign: "center", verticalAlign: "middle", padding: 0, fontSize: ts - 1, color: player.floor % 10 === 0 ? "#f26" : "#f64", textShadow: `0 0 8px ${player.floor % 10 === 0 ? "#f268" : "#f648"}`, animation: "glow 1.2s infinite" } }, player.floor % 10 === 0 ? "\u{1F451}" : "\u{1F479}"));
      else row.push(/* @__PURE__ */ React.createElement("td", { key: dx, style: { width: ts + 2, height: ts + 2, textAlign: "center", verticalAlign: "middle", padding: 0, fontSize: ts, color: s.color, opacity: s.o, textShadow: s.g, lineHeight: 1, fontFamily: "'JetBrains Mono',monospace" } }, s.ch));
    }
    mapRows.push(/* @__PURE__ */ React.createElement("tr", { key: dy }, row));
  }
  const miniDots = [];
  if (settings.minimap) {
    for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
      if (!dun.revealed[y] || !dun.revealed[y][x]) continue;
      let c = "#181818";
      const t = dun.map[y][x];
      if (t === T.FLOOR || t === T.TRAP) c = fc.floor;
      else if (t === T.STAIRS) c = "#0d8";
      else if (t === T.CHEST) c = "#ea0";
      else if (t === T.FOUNTAIN) c = "#48f";
      else if (t === T.SHOP) c = "#fa0";
      else if (t === T.WALL) c = fc.wall;
      if (x === player.x && y === player.y) c = "#ffd700";
      miniDots.push(/* @__PURE__ */ React.createElement("div", { key: `${x}-${y}`, style: { position: "absolute", left: x * mmS, top: y * mmS, width: mmS, height: mmS, background: c } }));
    }
  }
  return /* @__PURE__ */ React.createElement("div", { style: { width: "100vw", height: "100dvh", overflow: "hidden", background: "#000", position: "relative", userSelect: "none" } }, /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", top: 0, bottom: 0, left: "env(safe-area-inset-left,0px)", right: "env(safe-area-inset-right,0px)", overflow: "hidden", background: fc.bg, color: "#c8c8d0", fontFamily: "'JetBrains Mono',monospace" } }, /* @__PURE__ */ React.createElement("style", null, CSS, `:root{--ac:${fc.accent};}`), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", animation: shaking ? "shake .2s" : inSanc ? "sancP 4s infinite" : "none" } }, /* @__PURE__ */ React.createElement("table", { style: { borderCollapse: "collapse" } }, /* @__PURE__ */ React.createElement("tbody", null, mapRows))), vfx.flash && /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", inset: 0, zIndex: 3, pointerEvents: "none", animation: "dmgFlash .3s forwards", background: vfx.flash === "damage" ? "rgba(255,40,40,.15)" : vfx.flash === "heal" ? "rgba(40,255,100,.12)" : "rgba(255,200,40,.12)" } }), vfx.particles.length > 0 && /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", top: "50%", left: "50%", zIndex: 4, pointerEvents: "none" } }, vfx.particles.map((p) => /* @__PURE__ */ React.createElement("div", { key: p.id, style: { position: "absolute", width: 6, height: 6, borderRadius: "50%", background: p.color, boxShadow: `0 0 4px ${p.color}`, animation: `particle ${p.dur}s ease-out forwards`, "--px": `${p.px}px`, "--py": `${p.py}px` } }))), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", top: isDesk ? 16 : 6, left: isDesk ? 16 : 6, zIndex: 10, display: "flex", flexDirection: "column", gap: isDesk ? Math.round(5 * uiS) : 3, width: isDesk ? Math.round(180 * uiS) : 160, pointerEvents: "none" } }, /* @__PURE__ */ React.createElement(Bar, { cur: player.hp, max: player.maxHp, color: "#c33", label: "HP", h: isDesk ? Math.round(12 * uiS) : 8 }), /* @__PURE__ */ React.createElement(Bar, { cur: player.mp, max: player.maxMp, color: "#36c", label: "MP", h: isDesk ? Math.round(12 * uiS) : 8 }), /* @__PURE__ */ React.createElement(Bar, { cur: player.xp, max: xpFor(player.level), color: "#74a", label: "XP", h: isDesk ? Math.round(10 * uiS) : 6 }), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", fontSize: isDesk ? Math.round(10 * uiS) : 8, color: "#888", paddingTop: 1 } }, /* @__PURE__ */ React.createElement("span", null, fc.icon, " F", player.floor, " Lv", player.level), /* @__PURE__ */ React.createElement("span", null, "\u{1F4B0}", player.gold))), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", top: isDesk ? 16 : 6, right: isDesk ? 16 : 6, zIndex: 20, display: "flex", flexDirection: "column", gap: isDesk ? 6 : 4, alignItems: "flex-end" } }, /* @__PURE__ */ React.createElement("button", { onClick: () => setMenu((m) => m ? null : "open"), style: { width: isDesk ? Math.round(40 * uiS) : 42, height: isDesk ? Math.round(40 * uiS) : 42, borderRadius: 10, background: "rgba(14,14,22,.65)", border: `1px solid ${fc.accent}33`, color: menu ? fc.accent : "#888", fontSize: isDesk ? Math.round(18 * uiS) : 18, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", backdropFilter: "blur(4px)", touchAction: "manipulation", position: "relative" } }, menu ? "\u2715" : "\u2630", hasRec && !menu && /* @__PURE__ */ React.createElement("span", { style: { position: "absolute", top: 3, right: 3, width: 7, height: 7, borderRadius: "50%", background: "#4c6", animation: "recB 1.5s infinite" } })), menu === "open" && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: isDesk ? 5 : 3, animation: "fadeUp .15s" } }, [["stats", "\u{1F4CA} Stats"], ["inv", "\u{1F392} Inventory"], ["obj", "\u{1F4DC} Quests"], ["log", "\u{1F4CB} Event Log"], ["settings", "\u2699\uFE0F Settings"]].map(([k, lb]) => /* @__PURE__ */ React.createElement("button", { key: k, onClick: () => setMenu(k), style: { padding: isDesk ? `${Math.round(10 * uiS)}px ${Math.round(16 * uiS)}px` : "8px 14px", borderRadius: 8, background: "rgba(14,14,22,.8)", border: "1px solid #2a2a3a", color: "#aaa", fontSize: isDesk ? Math.round(12 * uiS) : 11, cursor: "pointer", backdropFilter: "blur(6px)", textAlign: "left", fontFamily: "'JetBrains Mono',monospace", touchAction: "manipulation", whiteSpace: "nowrap" } }, lb)))), settings.minimap && !menu && /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", top: isDesk ? Math.round(56 * uiS) : 54, right: isDesk ? 16 : 6, width: MW * mmS + 2, height: MH * mmS + 2, background: "rgba(6,6,12,.55)", border: `1px solid ${fc.wall}33`, borderRadius: 4, overflow: "hidden", zIndex: 8 } }, miniDots), inSanc && /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", top: 6, left: "50%", transform: "translateX(-50%)", padding: "3px 12px", background: "rgba(30,60,80,.35)", border: "1px solid #48a3", borderRadius: 8, fontSize: 9, color: "#6bd", zIndex: 10, backdropFilter: "blur(4px)" } }, "\u{1F3D5}\uFE0F SANCTUARY"), !inSanc && bossAlive && /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", top: 6, left: "50%", transform: "translateX(-50%)", padding: "3px 10px", background: "rgba(160,20,50,.25)", border: "1px solid #8233", borderRadius: 8, fontSize: 9, color: "#d46", zIndex: 10, backdropFilter: "blur(4px)" } }, player.floor % 10 === 0 ? "\u{1F451} MEGA BOSS" : "\u{1F479} BOSS"), /* @__PURE__ */ React.createElement("div", { ref: logRef, className: "scr", style: { position: "absolute", bottom: isDesk ? 16 : 140, left: isDesk ? 16 : 6, maxWidth: isDesk ? Math.round(280 * uiS) : 180, maxHeight: isDesk ? Math.round(50 * uiS) : 32, overflowY: "auto", zIndex: 8, pointerEvents: "none" } }, eLog.slice(isDesk ? -5 : -3).map((e, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { fontSize: isDesk ? Math.round(10 * uiS) : 7, color: logCol(e.ty), opacity: i === Math.min(eLog.length - 1, isDesk ? 4 : 2) ? 1 : 0.4, lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", textShadow: "0 1px 4px #000" } }, e.m))), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", bottom: isDesk ? Math.round(68 * uiS) : 174, left: isDesk ? 16 : 6, fontSize: isDesk ? Math.round(9 * uiS) : 7, color: "#444", zIndex: 7, pointerEvents: "none", textShadow: "0 1px 3px #000" } }, inSanc ? "Sanctuary" : fc.name), !isDesk && /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", bottom: 6, right: 6, zIndex: 15 } }, /* @__PURE__ */ React.createElement(DPad, { accent: fc.accent, onDir: move, combatActive: !!combat || !!shop })), menu && menu !== "open" && /* @__PURE__ */ React.createElement("div", { style: { position: "fixed", inset: 0, zIndex: 50, display: "flex" }, onClick: () => setMenu(null) }, /* @__PURE__ */ React.createElement("div", { className: "scr", style: { width: isDesk ? 400 : 300, maxWidth: isDesk ? "40vw" : "75vw", height: "100%", background: "rgba(12,12,20,.95)", borderRight: `1px solid ${fc.wall}`, overflowY: "auto", padding: isDesk ? "24px 20px" : "18px 14px", backdropFilter: "blur(10px)", animation: "slideRight .2s ease" }, onClick: (e) => e.stopPropagation() }, menu === "stats" && (() => {
    const eqW = player.equipped.weapon;
    const eqA = player.equipped.armor;
    const pct = Math.round(player.xp / xpFor(player.level) * 100);
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 16, color: "#d4a843", letterSpacing: 2, textAlign: "center", marginBottom: 4, fontFamily: "'Cinzel',serif" } }, player.icon, " ", player.name), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: "#666", textAlign: "center", marginBottom: 14 } }, "Level ", player.level, " ", player.cls.charAt(0).toUpperCase() + player.cls.slice(1), " \xB7 Floor ", player.floor, "/100 \xB7 Tier ", getTier(player.floor)), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 5, marginBottom: 14 } }, /* @__PURE__ */ React.createElement(Bar, { cur: player.hp, max: player.maxHp, color: "#c33", label: "HP", h: 14 }), /* @__PURE__ */ React.createElement(Bar, { cur: player.mp, max: player.maxMp, color: "#36c", label: "MP", h: 14 }), /* @__PURE__ */ React.createElement(Bar, { cur: player.xp, max: xpFor(player.level), color: "#74a", label: "XP", h: 10 }), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 9, color: "#555", textAlign: "right" } }, pct, "% to Level ", player.level + 1)), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 9, color: fc.accent, letterSpacing: 2, marginBottom: 6, borderBottom: `1px solid ${fc.accent}22`, paddingBottom: 4 } }, "ATTRIBUTES"), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px 12px", fontSize: 12, marginBottom: 14 } }, [["STR", player.str, "#d94", "\u2694\uFE0F"], ["DEX", player.dex, "#4c8", "\u{1F3F9}"], ["INT", player.int, "#a8e", "\u{1F52E}"], ["ATK", computed?.atk, "#e84", "\u{1F4A5}"], ["DEF", computed?.def, "#8ac", "\u{1F6E1}\uFE0F"], ["Gold", player.gold, "#d4a843", "\u{1F4B0}"]].map(([l, v, c, ic]) => /* @__PURE__ */ React.createElement("div", { key: l, style: { background: "#0e0e1a", borderRadius: 8, padding: "8px 10px", border: "1px solid #1e1e2e", textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 8, color: "#555", marginBottom: 2 } }, ic, " ", l), /* @__PURE__ */ React.createElement("div", { style: { color: c, fontSize: 14, fontWeight: "bold" } }, v)))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 9, color: "#c64", letterSpacing: 2, marginBottom: 6, borderBottom: "1px solid #c6422", paddingBottom: 4 } }, "EQUIPPED"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 4, marginBottom: 14, fontSize: 11 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: "#0e0e1a", borderRadius: 6, border: "1px solid #1e1e2e" } }, /* @__PURE__ */ React.createElement("span", null, "\u{1F5E1}\uFE0F"), /* @__PURE__ */ React.createElement("span", { style: { color: eqW ? "#ddd" : "#444", flex: 1 } }, eqW ? `${eqW.icon} ${eqW.name}` : "None"), eqW && /* @__PURE__ */ React.createElement("span", { style: { color: "#c64", fontSize: 9 } }, "+", eqW.atk, "ATK")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: "#0e0e1a", borderRadius: 6, border: "1px solid #1e1e2e" } }, /* @__PURE__ */ React.createElement("span", null, "\u{1F6E1}\uFE0F"), /* @__PURE__ */ React.createElement("span", { style: { color: eqA ? "#ddd" : "#444", flex: 1 } }, eqA ? `${eqA.icon} ${eqA.name}` : "None"), eqA && /* @__PURE__ */ React.createElement("span", { style: { color: "#68c", fontSize: 9 } }, "+", eqA.def, "DEF"))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 9, color: "#6a7", letterSpacing: 2, marginBottom: 6, borderBottom: "1px solid #6a72", paddingBottom: 4 } }, "SKILLS"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 14 } }, player.unlocked.map((s) => /* @__PURE__ */ React.createElement("span", { key: s, style: { padding: "4px 10px", background: "#0a140e", border: "1px solid #4c63", borderRadius: 6, fontSize: 10, color: "#8c8" } }, "\u2726 ", s)), player.skills.filter((s) => !player.unlocked.includes(s)).map((s) => /* @__PURE__ */ React.createElement("span", { key: s, style: { padding: "4px 10px", background: "#0c0c16", border: "1px solid #1e1e2e", borderRadius: 6, fontSize: 10, color: "#333" } }, "\u{1F512} ", s))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 9, color: "#555", letterSpacing: 2, marginBottom: 6, borderBottom: "1px solid #2224", paddingBottom: 4 } }, "JOURNEY"), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 14px", fontSize: 10 } }, [["Enemies slain", stats.kills], ["Chests opened", stats.chests], ["Steps walked", stats.steps], ["Mega bosses", stats.megaK], ["Total gold earned", stats.totG], ["Respawn point", lastSanc > 0 ? `F${lastSanc}` : "None"]].map(([l, v]) => /* @__PURE__ */ React.createElement("div", { key: l, style: { display: "flex", justifyContent: "space-between", padding: "3px 0" } }, /* @__PURE__ */ React.createElement("span", { style: { color: "#444" } }, l), /* @__PURE__ */ React.createElement("span", { style: { color: "#777" } }, v)))));
  })(), menu === "inv" && (() => {
    const gear = player.inv.filter((i) => i.type === "weapon" || i.type === "armor");
    const cons = player.inv.filter((i) => i.type === "consumable");
    const stacks = {};
    cons.forEach((c) => {
      const k = c.name;
      if (!stacks[k]) stacks[k] = { ...c, count: 0, ids: [] };
      stacks[k].count++;
      stacks[k].ids.push(c.id);
    });
    const stackList = Object.values(stacks);
    const sortedGear = [...gear].sort((a, b) => {
      if (a.type !== b.type) return a.type === "weapon" ? -1 : 1;
      const av = a.type === "weapon" ? (a.atk || 0) + (a.intB || 0) + (a.dexB || 0) : a.def || 0;
      const bv = b.type === "weapon" ? (b.atk || 0) + (b.intB || 0) + (b.dexB || 0) : b.def || 0;
      return bv - av;
    });
    const totalSellVal = cons.reduce((s, c) => s + Math.floor(c.val / 2), 0);
    const eqW = player.equipped.weapon;
    const eqA = player.equipped.armor;
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 15, color: "#d4a843", letterSpacing: 2, textAlign: "center", marginBottom: 10, fontFamily: "'Cinzel',serif" } }, "INVENTORY ", /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, color: "#666" } }, "(", player.inv.length, ")")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 9, color: fc.accent, letterSpacing: 2, marginBottom: 6, borderBottom: `1px solid ${fc.accent}22`, paddingBottom: 4 } }, "EQUIPPED"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 5, marginBottom: 14 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", padding: "8px 10px", background: "#0e0e1a", borderRadius: 8, border: "1px solid #2a2a3a", gap: 10 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13 } }, "\u{1F5E1}\uFE0F"), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, fontSize: 11 } }, eqW ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("span", { style: { color: "#ddd" } }, eqW.icon, " ", eqW.name), eqW.floor && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 7, color: "#555", marginLeft: 3 } }, "F", eqW.floor), /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("span", { style: { color: "#c64", fontSize: 9 } }, "+", eqW.atk, "ATK", eqW.intB ? ` +${eqW.intB}INT` : "", eqW.dexB ? ` +${eqW.dexB}DEX` : "")) : /* @__PURE__ */ React.createElement("span", { style: { color: "#444" } }, "None"))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", padding: "8px 10px", background: "#0e0e1a", borderRadius: 8, border: "1px solid #2a2a3a", gap: 10 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13 } }, "\u{1F6E1}\uFE0F"), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, fontSize: 11 } }, eqA ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("span", { style: { color: "#ddd" } }, eqA.icon, " ", eqA.name), eqA.floor && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 7, color: "#555", marginLeft: 3 } }, "F", eqA.floor), /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("span", { style: { color: "#68c", fontSize: 9 } }, "+", eqA.def, "DEF", eqA.mpB ? ` +${eqA.mpB}MP` : "", eqA.dexB ? ` +${eqA.dexB}DEX` : "")) : /* @__PURE__ */ React.createElement("span", { style: { color: "#444" } }, "None")))), hasRec && /* @__PURE__ */ React.createElement("button", { style: { ...btnS, width: "100%", marginBottom: 12, padding: "10px 0", textAlign: "center", borderColor: "#4c66", color: "#4c6", background: "#0a1a0e", fontSize: 11, animation: "recB 2s infinite" }, onClick: equipBest }, "\u2B06\uFE0F EQUIP BEST", recW ? ` \u{1F5E1}\uFE0F${recW.name}` : "", recA ? ` \u{1F6E1}\uFE0F${recA.name}` : ""), sortedGear.length > 0 && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 9, color: "#c64", letterSpacing: 2, marginBottom: 6, borderBottom: "1px solid #c6422", paddingBottom: 4 } }, "GEAR ", /* @__PURE__ */ React.createElement("span", { style: { color: "#555" } }, "(", sortedGear.length, ")")), sortedGear.map((item) => {
      const isR = recW && item.id === recW.id || recA && item.id === recA.id;
      return /* @__PURE__ */ React.createElement("div", { key: item.id, style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 10px", background: isR ? "#0c1a0e" : "#0c0c16", borderRadius: 8, border: `1px solid ${isR ? "#4c63" : "#1e1e2e"}`, marginBottom: 4 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, flex: 1 } }, /* @__PURE__ */ React.createElement("span", { style: { color: isR ? "#8d8" : "#ccc" } }, item.icon, " ", item.name), item.floor && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 7, color: "#555", marginLeft: 3 } }, "F", item.floor), isR && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 8, color: "#4c6", marginLeft: 4 } }, "\u2B06\uFE0F"), /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("span", { style: { color: "#555", fontSize: 9 } }, item.type === "weapon" ? `+${item.atk}ATK${item.intB ? ` +${item.intB}INT` : ""}${item.dexB ? ` +${item.dexB}DEX` : ""}` : item.type === "armor" ? `+${item.def}DEF${item.mpB ? ` +${item.mpB}MP` : ""}${item.dexB ? ` +${item.dexB}DEX` : ""}` : "")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 4 } }, /* @__PURE__ */ React.createElement("button", { style: { ...btnS, fontSize: 9, padding: "3px 10px", borderColor: isR ? "#4c64" : "#2a2a3a", color: isR ? "#4c6" : "#888" }, onClick: () => useItem(item) }, "Equip"), /* @__PURE__ */ React.createElement("button", { style: { ...btnS, fontSize: 9, padding: "3px 8px", color: "#d4a843" }, onClick: () => {
        const v = Math.floor(item.val / 2);
        setPlayer((p) => ({ ...p, inv: p.inv.filter((i) => i.id !== item.id), gold: p.gold + v }));
        log(`Sold ${item.name} ${v}g`, "info");
      } }, "Sell")));
    }), /* @__PURE__ */ React.createElement("div", { style: { height: 8 } })), stackList.length > 0 && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, borderBottom: "1px solid #46c2", paddingBottom: 4 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 9, color: "#4a8", letterSpacing: 2 } }, "CONSUMABLES ", /* @__PURE__ */ React.createElement("span", { style: { color: "#555" } }, "(", cons.length, ")")), cons.length > 3 && /* @__PURE__ */ React.createElement("button", { style: { ...btnS, fontSize: 8, padding: "2px 8px", color: "#d4a843", borderColor: "#d4a84344" }, onClick: () => {
      setPlayer((p) => ({ ...p, inv: p.inv.filter((i) => i.type !== "consumable"), gold: p.gold + totalSellVal }));
      log(`Sold all consumables +${totalSellVal}g`, "info");
    } }, "Sell All (", totalSellVal, "g)")), stackList.map((stack) => /* @__PURE__ */ React.createElement("div", { key: stack.name, style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 10px", background: "#0c0c16", borderRadius: 8, border: "1px solid #1e1e2e", marginBottom: 4 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, flex: 1 } }, /* @__PURE__ */ React.createElement("span", { style: { color: "#ccc" } }, stack.icon, " ", stack.name), stack.count > 1 && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 10, color: fc.accent, marginLeft: 5, fontWeight: "bold" } }, "\xD7", stack.count), /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("span", { style: { color: "#555", fontSize: 9 } }, stack.effect, stack.amt > 0 ? ` (+${stack.amt})` : "")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 4, alignItems: "center" } }, /* @__PURE__ */ React.createElement("button", { style: { ...btnS, fontSize: 9, padding: "3px 10px", color: "#4a8" }, onClick: () => {
      const item = player.inv.find((i) => i.name === stack.name);
      if (item) useItem(item);
    } }, "Use"), /* @__PURE__ */ React.createElement("button", { style: { ...btnS, fontSize: 9, padding: "3px 8px", color: "#d4a843" }, onClick: () => {
      const item = player.inv.find((i) => i.name === stack.name);
      if (item) {
        const v = Math.floor(item.val / 2);
        setPlayer((p) => ({ ...p, inv: p.inv.filter((i) => i.id !== item.id), gold: p.gold + v }));
        log(`Sold ${item.name} ${v}g`, "info");
      }
    } }, "Sell 1"), stack.count > 1 && /* @__PURE__ */ React.createElement("button", { style: { ...btnS, fontSize: 8, padding: "3px 6px", color: "#c64" }, onClick: () => {
      const ids = player.inv.filter((i) => i.name === stack.name).map((i) => i.id);
      const val = ids.reduce((s, id) => {
        const it = player.inv.find((i) => i.id === id);
        return s + Math.floor((it?.val || 0) / 2);
      }, 0);
      setPlayer((p) => ({ ...p, inv: p.inv.filter((i) => !ids.includes(i.id)), gold: p.gold + val }));
      log(`Sold ${ids.length}\xD7 ${stack.name} +${val}g`, "info");
    } }, "Sell All"))))), player.inv.length === 0 && /* @__PURE__ */ React.createElement("div", { style: { color: "#333", textAlign: "center", padding: 20, fontSize: 12 } }, "Inventory empty"));
  })(), menu === "obj" && (() => {
    const st = { ...stats, floor: player.floor, level: player.level };
    const done = OBJ.filter((o) => o.c(st)).length;
    const cats = [["explore", "\u{1F5FA}\uFE0F Exploration"], ["combat", "\u2694\uFE0F Combat"], ["progress", "\u{1F4C8} Progression"], ["wealth", "\u{1F4B0} Wealth"]];
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 16, color: "#d4a843", letterSpacing: 2, textAlign: "center", marginBottom: 4, fontFamily: "'Cinzel',serif" } }, "QUESTS"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: "#555", textAlign: "center", marginBottom: 14 } }, done, "/", OBJ.length, " completed"), /* @__PURE__ */ React.createElement("div", { style: { width: "100%", marginBottom: 14 } }, /* @__PURE__ */ React.createElement(Bar, { cur: done, max: OBJ.length, color: "#d4a843", label: "", h: 6 })), cats.map(([cat, label]) => {
      const items = OBJ.filter((o) => o.cat === cat);
      const catDone = items.filter((o) => o.c(st)).length;
      return /* @__PURE__ */ React.createElement("div", { key: cat, style: { marginBottom: 14 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, borderBottom: "1px solid #2224", paddingBottom: 4 } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 10, color: "#888", letterSpacing: 1 } }, label), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 9, color: "#555" } }, catDone, "/", items.length)), items.map((o) => {
        const ok = o.c(st);
        return /* @__PURE__ */ React.createElement("div", { key: o.id, style: { display: "flex", alignItems: "center", gap: 8, padding: "5px 8px", marginBottom: 2, borderRadius: 6, background: ok ? "rgba(68,204,102,.05)" : "transparent" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 14, width: 20, textAlign: "center" } }, ok ? "\u2705" : "\u2B1C"), /* @__PURE__ */ React.createElement("span", { style: { flex: 1, fontSize: 11, color: ok ? "#4c6" : "#777", textDecoration: ok ? "line-through" : "none" } }, o.text), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 9, color: ok ? "#4c6" : "#444" } }, "+", o.xp, "xp"));
      }));
    }));
  })(), menu === "log" && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 16, color: "#d4a843", letterSpacing: 2, textAlign: "center", marginBottom: 14, fontFamily: "'Cinzel',serif" } }, "EVENT LOG"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: "#555", textAlign: "center", marginBottom: 10 } }, eLog.length, " entries"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 1 } }, eLog.slice(-60).map((e, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { fontSize: 11, color: logCol(e.ty), padding: "3px 6px", borderRadius: 4, background: i % 2 === 0 ? "rgba(20,20,30,.3)" : "transparent", lineHeight: 1.5 } }, e.m))), eLog.length > 60 && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 9, color: "#444", textAlign: "center", marginTop: 8 } }, "Showing last 60 entries")), menu === "settings" && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 16, color: "#d4a843", letterSpacing: 2, textAlign: "center", marginBottom: 14, fontFamily: "'Cinzel',serif" } }, "SETTINGS"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 14, fontSize: 11 } }, /* @__PURE__ */ React.createElement("div", { style: { background: "#0e0e1a", borderRadius: 8, padding: "12px 14px", border: "1px solid #1e1e2e" } }, /* @__PURE__ */ React.createElement("div", { style: { color: "#888", fontSize: 10, letterSpacing: 1, marginBottom: 8 } }, "\u2694\uFE0F DIFFICULTY"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6 } }, ["easy", "normal", "hard"].map((d) => /* @__PURE__ */ React.createElement("button", { key: d, style: { ...btnS, flex: 1, padding: "8px 0", borderColor: settings.difficulty === d ? fc.accent + "88" : "#2a2a3a", color: settings.difficulty === d ? fc.accent : "#555", textTransform: "uppercase", background: settings.difficulty === d ? "rgba(200,168,67,.08)" : "#111119" }, onClick: () => setSettings((s) => ({ ...s, difficulty: d })) }, d))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 8, color: "#444", marginTop: 6 } }, settings.difficulty === "easy" ? "Less XP, forgiving combat" : settings.difficulty === "hard" ? "More XP, brutal combat" : "Balanced experience")), /* @__PURE__ */ React.createElement("div", { style: { background: "#0e0e1a", borderRadius: 8, padding: "12px 14px", border: "1px solid #1e1e2e" } }, /* @__PURE__ */ React.createElement("div", { style: { color: "#888", fontSize: 10, letterSpacing: 1, marginBottom: 8 } }, "\u{1F5A5}\uFE0F DISPLAY"), !isDesk && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { color: "#666", fontSize: 10, marginBottom: 6 } }, "Tile Size"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, marginBottom: 10 } }, [{ l: "Small", v: 11 }, { l: "Medium", v: 13 }, { l: "Large", v: 15 }].map((s) => /* @__PURE__ */ React.createElement("button", { key: s.l, style: { ...btnS, flex: 1, padding: "8px 0", borderColor: settings.tileSize === s.v ? fc.accent + "88" : "#2a2a3a", color: settings.tileSize === s.v ? fc.accent : "#555", background: settings.tileSize === s.v ? "rgba(200,168,67,.08)" : "#111119" }, onClick: () => setSettings((st) => ({ ...st, tileSize: s.v })) }, s.l)))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between" } }, /* @__PURE__ */ React.createElement("span", { style: { color: "#666" } }, "Minimap"), /* @__PURE__ */ React.createElement("button", { style: { ...btnS, padding: "6px 16px", borderColor: settings.minimap ? "#4a66" : "#2a2a3a", color: settings.minimap ? "#4a6" : "#555", background: settings.minimap ? "rgba(68,170,102,.08)" : "#111119" }, onClick: () => setSettings((s) => ({ ...s, minimap: !s.minimap })) }, settings.minimap ? "ON" : "OFF"))), /* @__PURE__ */ React.createElement("div", { style: { background: "#0e0e1a", borderRadius: 8, padding: "12px 14px", border: "1px solid #1e1e2e" } }, /* @__PURE__ */ React.createElement("div", { style: { color: "#888", fontSize: 10, letterSpacing: 1, marginBottom: 8 } }, "\u{1F3AE} CONTROLS"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: "#555", lineHeight: 1.8 } }, isDesk ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { style: { color: "#777" } }, "WASD / Arrows"), " \u2014 Move"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { style: { color: "#777" } }, "I"), " \u2014 Open inventory"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { style: { color: "#777" } }, "Escape"), " \u2014 Close menu / shop"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { style: { color: "#777" } }, "Enter / Space"), " \u2014 Confirm in combat")) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { style: { color: "#777" } }, "Joystick"), " \u2014 Move (bottom-right)"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { style: { color: "#777" } }, "\u2630 Menu"), " \u2014 Stats, inventory, quests")))), /* @__PURE__ */ React.createElement("div", { style: { background: "#0e0e1a", borderRadius: 8, padding: "12px 14px", border: "1px solid #1e1e2e" } }, /* @__PURE__ */ React.createElement("div", { style: { color: "#888", fontSize: 10, letterSpacing: 1, marginBottom: 8 } }, "\u{1F4BE} SAVE DATA"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6 } }, /* @__PURE__ */ React.createElement("button", { style: { ...btnS, flex: 1, padding: "10px 0", borderColor: "#46c6", color: "#58c", textAlign: "center" }, onClick: saveGame }, "\u{1F4BE} Save Game"), save && /* @__PURE__ */ React.createElement("button", { style: { ...btnS, flex: 1, padding: "10px 0", borderColor: "#4a66", color: "#4a6", textAlign: "center" }, onClick: loadGame }, "\u{1F4C2} Load Save")), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 8, color: "#444", marginTop: 6 } }, "Auto-saves on floor change, sanctuary, and combat")), /* @__PURE__ */ React.createElement("button", { style: { ...btnS, borderColor: "#c336", color: "#c44", padding: "10px 0", textAlign: "center" }, onClick: () => {
    setScreen("title");
    setMenu(null);
  } }, "\u{1F6AA} Quit to Title"))), /* @__PURE__ */ React.createElement("button", { style: { ...btnS, width: "100%", marginTop: 14, textAlign: "center" }, onClick: () => setMenu(null) }, "Close")), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, background: "rgba(0,0,0,.3)" } })), shop && (() => {
    const conItems = shop.items.filter((i) => i.cat === "consumable");
    const gearItems = shop.items.filter((i) => i.cat === "weapon" || i.cat === "armor");
    const buyItem = (item) => {
      if (item.sold >= item.stock) {
        log("Sold out!", "danger");
        return;
      }
      if (player.gold < item.buyPrice) {
        log("Not enough gold!", "danger");
        return;
      }
      const bought = { ...item, id: uid() };
      delete bought.buyPrice;
      delete bought.cat;
      delete bought.premium;
      delete bought.stock;
      delete bought.sold;
      setPlayer((p) => ({ ...p, gold: p.gold - item.buyPrice, inv: [...p.inv, bought] }));
      setShop((s) => ({ ...s, items: s.items.map((i) => i.id === item.id ? { ...i, sold: i.sold + 1 } : i) }));
      SFX.buy();
      log(`Bought ${item.icon} ${item.name} for ${item.buyPrice}g`, "loot");
    };
    return /* @__PURE__ */ React.createElement("div", { style: { position: "fixed", inset: 0, zIndex: 55, display: "flex", alignItems: "center", justifyContent: "center", background: "radial-gradient(ellipse at center,#0a1828cc,rgba(8,8,14,.98) 60%)", backdropFilter: "blur(6px)", animation: "fadeUp .15s" } }, /* @__PURE__ */ React.createElement("div", { className: "scr", style: { width: "100%", maxWidth: 460, maxHeight: "90vh", overflowY: "auto", background: "rgba(12,16,24,.95)", border: "1px solid #2a4a5a", borderRadius: 12, padding: "18px 16px" } }, /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", marginBottom: 14 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 36 } }, shop.icon), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 16, color: "#fa0", letterSpacing: 3, fontFamily: "'Cinzel',serif" } }, shop.name), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: "#555", marginTop: 4 } }, "Tier ", shop.tier, " Sanctuary \xB7 ", /* @__PURE__ */ React.createElement("span", { style: { color: "#d4a843" } }, "\u{1F4B0} ", player.gold, " gold"))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 9, color: "#c64", letterSpacing: 2, marginBottom: 6, borderBottom: "1px solid #c6422", paddingBottom: 4 } }, "WEAPONS & ARMOR"), gearItems.map((item) => {
      const canBuy = player.gold >= item.buyPrice && item.sold < item.stock;
      const soldOut = item.sold >= item.stock;
      return /* @__PURE__ */ React.createElement("div", { key: item.id, style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: soldOut ? "#0a0a12" : item.premium ? "#12101a" : "#0c0e16", borderRadius: 8, border: `1px solid ${soldOut ? "#1a1a22" : item.premium ? "#a8642" : "#1e2e3e"}`, marginBottom: 4, opacity: soldOut ? 0.5 : 1 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, flex: 1 } }, /* @__PURE__ */ React.createElement("span", { style: { color: item.premium ? "#fa0" : "#ccc" } }, item.icon, " ", item.name), item.premium && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 7, color: "#fa0", marginLeft: 4 } }, "\u2605 PREMIUM"), item.floor && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 7, color: "#555", marginLeft: 3 } }, "F", item.floor), /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("span", { style: { color: "#555", fontSize: 9 } }, item.type === "weapon" ? `+${item.atk}ATK${item.intB ? ` +${item.intB}INT` : ""}${item.dexB ? ` +${item.dexB}DEX` : ""}` : item.type === "armor" ? `+${item.def}DEF${item.mpB ? ` +${item.mpB}MP` : ""}${item.dexB ? ` +${item.dexB}DEX` : ""}` : "")), soldOut ? /* @__PURE__ */ React.createElement("span", { style: { fontSize: 9, color: "#555", padding: "5px 10px" } }, "SOLD OUT") : /* @__PURE__ */ React.createElement("button", { style: { ...btnS, fontSize: 10, padding: "5px 14px", color: canBuy ? "#fa0" : "#444", borderColor: canBuy ? "#fa06" : "#222" }, onClick: () => buyItem(item), disabled: !canBuy }, "\u{1F4B0}", item.buyPrice));
    }), /* @__PURE__ */ React.createElement("div", { style: { height: 10 } }), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 9, color: "#4a8", letterSpacing: 2, marginBottom: 6, borderBottom: "1px solid #4a82", paddingBottom: 4 } }, "CONSUMABLES"), conItems.map((item) => {
      const canBuy = player.gold >= item.buyPrice && item.sold < item.stock;
      const soldOut = item.sold >= item.stock;
      const remaining = item.stock - item.sold;
      return /* @__PURE__ */ React.createElement("div", { key: item.id, style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 12px", background: soldOut ? "#0a0a12" : "#0c0e16", borderRadius: 8, border: "1px solid #1e2e3e", marginBottom: 3, opacity: soldOut ? 0.5 : 1 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, flex: 1 } }, /* @__PURE__ */ React.createElement("span", { style: { color: "#ccc" } }, item.icon, " ", item.name), !soldOut && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 8, color: "#555", marginLeft: 6 } }, "\xD7", remaining), /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("span", { style: { color: "#555", fontSize: 9 } }, item.effect, item.amt > 0 ? ` (+${item.amt})` : "")), soldOut ? /* @__PURE__ */ React.createElement("span", { style: { fontSize: 9, color: "#555", padding: "4px 8px" } }, "SOLD OUT") : /* @__PURE__ */ React.createElement("button", { style: { ...btnS, fontSize: 10, padding: "4px 12px", color: canBuy ? "#fa0" : "#444", borderColor: canBuy ? "#fa06" : "#222" }, onClick: () => buyItem(item), disabled: !canBuy }, "\u{1F4B0}", item.buyPrice));
    }), /* @__PURE__ */ React.createElement("button", { style: { ...btnS, width: "100%", marginTop: 14, textAlign: "center", fontSize: 12, padding: "10px 0", color: "#6be", borderColor: "#6be4" }, onClick: () => {
      setShop(null);
      log("Come back anytime!", "system");
    } }, "Leave Shop")));
  })(), combat && (() => {
    const e = combat.enemy;
    const aura = e.aura || fc.accent;
    const consItems = player.inv.filter((i) => i.type === "consumable");
    return /* @__PURE__ */ React.createElement("div", { style: { position: "fixed", inset: 0, zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", background: e.isMega ? `radial-gradient(ellipse at 50% 30%,${aura}22,rgba(8,8,14,.98) 50%)` : e.isBoss ? `radial-gradient(ellipse at center,${aura}15,rgba(8,8,14,.97) 50%)` : "radial-gradient(ellipse at center,#1a0e0e,rgba(8,8,14,.97) 55%)", backdropFilter: "blur(8px)", animation: "fadeUp .15s", "--ba": aura } }, /* @__PURE__ */ React.createElement("div", { style: { width: "100%", maxWidth: 580, maxHeight: "96vh", padding: "10px 16px", display: "flex", flexDirection: "column", alignItems: "center", overflow: "hidden" } }, e.isMega && /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", top: 0, left: 0, right: 0, height: 80, background: `radial-gradient(ellipse at 50% 100%,${aura}18,transparent 70%)`, pointerEvents: "none" } }), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 12, width: "100%", marginBottom: 6 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: e.isMega ? 48 : e.isBoss ? 40 : 32, filter: e.hp <= 0 ? "grayscale(1) brightness(.3)" : vfx.enemyHit ? "brightness(3)" : "none", transition: "filter .2s", animation: combat.turn === 1 ? e.isMega || e.isBoss ? "bossIn .7s cubic-bezier(.34,1.56,.64,1)" : "fadeUp .3s" : e.isMega ? "megaGlow 3s infinite" : "none", flexShrink: 0 } }, e.icon), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6 } }, e.isMega && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 8, color: aura, letterSpacing: 2 } }, "\u26A0\uFE0F MEGA"), e.isBoss && !e.isMega && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 8, color: aura, letterSpacing: 2 } }, "BOSS"), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 14, color: e.isMega ? aura : e.isBoss ? "#d64" : "#c54", letterSpacing: 2, fontFamily: "'Cinzel',serif" } }, e.name)), (e.title || e.subtitle) && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 9, color: "#665", fontStyle: "italic" } }, e.title || e.subtitle), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 4 } }, /* @__PURE__ */ React.createElement(Bar, { cur: e.hp, max: e.maxHp, color: e.isMega ? aura : "#c44", h: 12 })), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 9, color: "#555", marginTop: 2 } }, "ATK:", e.atk, " DEF:", e.def, " \xB7 Turn ", combat.turn))), /* @__PURE__ */ React.createElement("div", { ref: cLogRef, className: "scr", style: { width: "100%", background: "rgba(8,8,14,.85)", border: "1px solid #1e1e2e", borderRadius: 8, padding: 8, minHeight: 48, maxHeight: 80, overflowY: "auto", marginBottom: 6 } }, cLog.map((m, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { fontSize: 12, color: i === cLog.length - 1 ? "#ddd" : "#666", lineHeight: 1.5 } }, m))), /* @__PURE__ */ React.createElement("div", { style: { width: "100%", marginBottom: 8 } }, /* @__PURE__ */ React.createElement(Bar, { cur: player.hp, max: player.maxHp, color: "#4a6", label: "YOU", h: 10 })), combat.phase === "player" && /* @__PURE__ */ React.createElement("div", { style: { width: "100%", display: "flex", flexDirection: "column", gap: 6 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, width: "100%" } }, /* @__PURE__ */ React.createElement("button", { style: { ...btnS, flex: 2, padding: "12px 0", fontSize: 14, borderColor: "#c446", color: "#c44", textAlign: "center" }, onClick: () => pAtk() }, "\u2694\uFE0F Attack"), /* @__PURE__ */ React.createElement("button", { style: { ...btnS, flex: 1, padding: "12px 0", fontSize: 13, textAlign: "center" }, onClick: flee }, "\u{1F3C3} Flee"), /* @__PURE__ */ React.createElement("button", { style: { ...btnS, flex: 1, padding: "12px 0", fontSize: 13, textAlign: "center", borderColor: "#4a86", color: "#6be" }, onClick: () => setCInv((c) => !c) }, cInv ? "\u2715" : "\u{1F392}")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 4, flexWrap: "wrap" } }, player.unlocked.map((s) => /* @__PURE__ */ React.createElement("button", { key: s, style: { ...btnS, fontSize: 10, padding: "6px 10px", borderColor: "#64a5", color: "#97c" }, onClick: () => pAtk(s) }, s))), cInv && /* @__PURE__ */ React.createElement("div", { className: "scr", style: { width: "100%", maxHeight: 100, overflowY: "auto", background: "rgba(8,8,14,.9)", border: "1px solid #2a4a5a", borderRadius: 8, padding: 8 } }, consItems.length === 0 && /* @__PURE__ */ React.createElement("div", { style: { color: "#444", fontSize: 10, textAlign: "center" } }, "No consumables"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 4 } }, consItems.map((item) => /* @__PURE__ */ React.createElement("button", { key: item.id, style: { ...btnS, fontSize: 10, padding: "6px 10px", borderColor: "#4a83", color: "#8cc" }, onClick: () => {
      useItem(item, true);
      if (consItems.length <= 1) setCInv(false);
    } }, item.icon, " ", item.name, item.amt > 0 ? ` +${item.amt}` : ""))))), combat.phase === "enemy" && /* @__PURE__ */ React.createElement("div", { style: { color: "#d84", fontSize: 14, padding: 10 } }, /* @__PURE__ */ React.createElement("span", { style: { animation: "glow .7s infinite" } }, e.icon, " Attacking...")), combat.phase === "won" && /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", width: "100%" } }, /* @__PURE__ */ React.createElement("div", { style: { color: e.isMega ? aura : "#4c6", fontSize: 16, marginBottom: 4, fontFamily: "'Cinzel',serif" } }, e.isMega ? "\u{1F3C6} MEGA BOSS SLAIN!" : e.isBoss ? "\u{1F3C6} BOSS SLAIN!" : "Victory!"), e.isBoss && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 10, color: "#888", marginBottom: 3 } }, "\u{1F5E1}\uFE0F\u{1F6E1}\uFE0F Unique F", e.bossFloor || player.floor, " gear!"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "#888", marginBottom: 8 } }, "+", e.xp, "xp +", e.gold, "g"), /* @__PURE__ */ React.createElement("button", { style: { ...btnS, padding: "12px 32px", fontSize: 14, borderColor: `${aura}66`, color: aura }, onClick: claimWin }, "Collect [Enter]")), combat.phase === "lost" && /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", width: "100%" } }, /* @__PURE__ */ React.createElement("div", { style: { color: "#c33", fontSize: 15, marginBottom: 8 } }, "Defeated..."), /* @__PURE__ */ React.createElement("button", { style: { ...btnS, padding: "12px 24px", fontSize: 13 }, onClick: handleDeath }, lastSanc > 0 ? "Respawn" : "Continue"))));
  })()));
}
