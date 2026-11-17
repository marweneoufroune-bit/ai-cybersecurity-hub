const https = require("https");

function checkHttps(url) {
  return new Promise((resolve) => {
    https.get(url, (response) => {
      resolve({
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
    }).on("error", (error) => {
      resolve({
        https: false,
        error: error.message
      });
    });
  });
}

module.exports = { checkHttps };
