const https = require("https");
const fs = require("fs");
const path = require("path");

const targetsPath = path.join(__dirname, "targets.json");

function isAuthorized(url) {
  const targets = JSON.parse(
    fs.readFileSync(targetsPath, "utf8")
  );

  const hostname = new URL(url).hostname.toLowerCase();

  return targets.authorized_domains.some(domain => {
    const allowed = domain.toLowerCase();

    return hostname === allowed ||
      hostname.endsWith("." + allowed);
  });
}

function checkHttps(url) {
  return new Promise((resolve, reject) => {
    let parsed;

    try {
      parsed = new URL(url);
    } catch {
      return reject(new Error("Adresse invalide"));
    }

    if (parsed.protocol !== "https:") {
      return reject(new Error("HTTPS obligatoire"));
    }

    if (!isAuthorized(url)) {
      return reject(new Error("Site non autorisé"));
    }

    const request = https.get(parsed, {
      timeout: 10000
    }, response => {
      resolve({
        site: parsed.hostname,
        https: true,
        status: response.statusCode,
        securityHeaders: {
          hsts: response.headers["strict-transport-security"] || "Absent",
          csp: response.headers["content-security-policy"] || "Absent",
          xFrameOptions: response.headers["x-frame-options"] || "Absent",
          xContentTypeOptions: response.headers["x-content-type-options"] || "Absent"
        }
      });

      response.resume();
    });

    request.on("timeout", () => {
      request.destroy(new Error("Délai dépassé"));
    });

    request.on("error", reject);
  });
}

module.exports = { checkHttps };
