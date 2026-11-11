"use client";

import { useState } from "react";
import { site } from "@/lib/site";
import { CopyButton } from "./copy-button";

const base = site.defaultBaseUrl;

const TABS = [
  {
    id: "curl",
    label: "cURL",
    code: `curl -X POST ${base}/api/upload \\
  -H "Authorization: Bearer $IMGBLUE_API_KEY" \\
  -F "file=@photo.png"`,
  },
  {
    id: "js",
    label: "JavaScript",
    code: `const form = new FormData();
form.append("file", fileInput.files[0]);

const res = await fetch("${base}/api/upload", {
  method: "POST",
  headers: {
    Authorization: "Bearer " + process.env.IMGBLUE_API_KEY,
  },
  body: form,
});

const image = await res.json();
console.log(image.url);`,
  },
  {
    id: "python",
    label: "Python",
    code: `import os
import requests

with open("photo.png", "rb") as f:
    res = requests.post(
        "${base}/api/upload",
        headers={"Authorization": f"Bearer {os.environ['IMGBLUE_API_KEY']}"},
        files={"file": f},
    )

res.raise_for_status()
print(res.json()["url"])`,
  },
  {
    id: "base64",
    label: "Base64 JSON",
    code: `curl -X POST ${base}/api/upload \\
  -H "Authorization: Bearer $IMGBLUE_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"image":"data:image/png;base64,iVBORw0KGgo..."}'`,
  },
];

export function CodeTabs() {
  const [active, setActive] = useState(TABS[0].id);
  const tab = TABS.find((item) => item.id === active) ?? TABS[0];

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-ink-950/60">
      <div className="flex items-center justify-between gap-2 border-b border-white/[0.07] px-2.5 py-2">
        <div className="flex gap-1 overflow-x-auto">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActive(item.id)}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                active === item.id
                  ? "bg-white/10 text-white"
                  : "text-ice-400 hover:bg-white/5 hover:text-ice-100"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <CopyButton value={tab.code} label="Copy code" />
      </div>
      <pre className="code-block max-h-[360px] overflow-auto rounded-none border-0 bg-transparent">{tab.code}</pre>
    </div>
  );
}
