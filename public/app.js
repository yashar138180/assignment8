const statusEl = document.querySelector("#status");
const outputEl = document.querySelector("#output");
const buttons = document.querySelectorAll("button[data-url]");

// Show JSON with indentation; leave any other text as it is.
function formatBody(text) {
  try {
    return JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    return text;
  }
}

async function callRoute(method, url) {
  statusEl.textContent = `Sending ${method} ${url}...`;
  statusEl.className = "status";
  outputEl.textContent = "";

  try {
    // Relative URL: the request goes to the same server that served this page.
    const response = await fetch(url, { method });
    const text = await response.text();

    statusEl.textContent = `${method} ${url} -> ${response.status} ${response.statusText}`;
    statusEl.className = response.ok ? "status ok" : "status error";
    outputEl.textContent = formatBody(text);
  } catch (error) {
    // Network failure (for example the server is stopped): show it, do not crash.
    statusEl.textContent = `${method} ${url} -> request failed`;
    statusEl.className = "status error";
    outputEl.textContent = error.message;
  }
}

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    callRoute(button.dataset.method, button.dataset.url);
  });
});