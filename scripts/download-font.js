const fs = require("fs");
const path = require("path");
const https = require("https");

const fonts = [
  {
    url: "https://fonts.gstatic.com/s/inter/v19/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7.woff2", // Regular 400
    name: "Inter-Regular.woff2",
  },
  {
    url: "https://fonts.gstatic.com/s/inter/v19/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa25L7SUc.woff2", // Bold 700
    name: "Inter-Bold.woff2",
  },
];

const outputDir = path.resolve("src/fonts");

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fonts.forEach(({ url, name }) => {
  const filePath = path.join(outputDir, name);

  // ✅ skip kalau sudah ada
  if (fs.existsSync(filePath)) {
    console.log(`ℹ️  Skip, already exists: ${name}`);
    return;
  }

  const file = fs.createWriteStream(filePath);

  https.get(url, (res) => {
    if (res.statusCode !== 200) {
      console.error(`❌ Failed to download ${url}`);
      return;
    }
    res.pipe(file);
    file.on("finish", () => {
      file.close();
      console.log(`✅ Downloaded ${name}`);
    });
  });
});
