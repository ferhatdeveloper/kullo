const { withAppBuildGradle } = require("expo/config-plugins");

/**
 * Expo prebuild sonrası RN `root` monorepo köküne kaymasın —
 * android/app → ../.. = apps/partner.
 */
function withMonorepoRoot(config) {
  return withAppBuildGradle(config, (cfg) => {
    if (cfg.modResults.language !== "groovy") return cfg;
    let contents = cfg.modResults.contents;
    if (contents.includes("root = file(\"../..\")")) return cfg;
    contents = contents.replace(
      /\/\* Folders \*\/[\s\S]*?\/\/ root = file\("\.\.\/\.\."\)/,
      `/* Folders */\n    // From android/app → ../.. = apps/partner (Expo package.json).\n    root = file("../..")`,
    );
    cfg.modResults.contents = contents;
    return cfg;
  });
}

module.exports = withMonorepoRoot;
