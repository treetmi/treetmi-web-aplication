// frontend-app/refactor-hardcodes.js
// Run dengan: node refactor-hardcodes.js

const fs = require("fs");
const path = require("path");

const FRONTEND_DIR = __dirname;

const files = [
  {
    file: "components/currency-provider.tsx",
    import: 'import { ADMIN_API } from "@/lib/api"',
    replacements: [
      {
        old: 'const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"',
        new: 'const apiBase = ADMIN_API.settings.replace("/admin/settings", "")'
      }
    ]
  },
  {
    file: "components/widget-studio.tsx",
    import: 'import { API_BASE_URL } from "@/lib/api"',
    replacements: [
      {
        old: 'const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"',
        new: 'const API_BASE = API_BASE_URL'
      }
    ]
  },
  {
    file: "app/dashboard/page.tsx",
    import: 'import { API_BASE_URL } from "@/lib/api"',
    replacements: [
      {
        old: 'const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"',
        new: 'const API_BASE = API_BASE_URL'
      }
    ]
  },
  {
    file: "app/login/page.tsx",
    import: 'import { API_BASE_URL } from "@/lib/api"',
    replacements: [
      {
        old: 'const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"',
        new: 'const apiBaseUrl = API_BASE_URL',
        replaceAll: true
      }
    ]
  },
  {
    file: "app/register/page.tsx",
    import: 'import { API_BASE_URL } from "@/lib/api"',
    replacements: [
      {
        old: 'const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"',
        new: 'const apiBaseUrl = API_BASE_URL',
        replaceAll: true
      }
    ]
  },
  {
    file: "app/widget/alert/[token]/page.tsx",
    import: 'import { API_BASE_URL } from "@/lib/api"',
    replacements: [
      {
        old: 'const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"',
        new: 'const API_BASE = API_BASE_URL'
      }
    ]
  },
  {
    file: "app/widget/mediashare/[token]/page.tsx",
    import: 'import { API_BASE_URL } from "@/lib/api"',
    replacements: [
      {
        old: 'const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"',
        new: 'const API_BASE = API_BASE_URL'
      }
    ]
  },
  {
    file: "app/widget/queue/[token]/page.tsx",
    import: 'import { API_BASE_URL } from "@/lib/api"',
    replacements: [
      {
        old: 'const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"',
        new: 'const API_BASE = API_BASE_URL'
      }
    ]
  },
  {
    file: "app/widget/donors/[token]/page.tsx",
    import: 'import { API_BASE_URL } from "@/lib/api"',
    replacements: [
      {
        old: 'const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"',
        new: 'const API_BASE = API_BASE_URL'
      }
    ]
  },
  {
    file: "app/widget/target/[token]/page.tsx",
    import: 'import { API_BASE_URL } from "@/lib/api"',
    replacements: [
      {
        old: 'const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"',
        new: 'const API_BASE = API_BASE_URL'
      }
    ]
  }
];

function addImportAtTop(content, importStatement) {
  // Check if import sudah ada
  if (content.includes(importStatement)) {
    return content;
  }

  // Find the last import statement at top
  const importRegex = /^import\s+.*from\s+["'][^"']+["'];?$/gm;
  const matches = [...content.matchAll(importRegex)];

  if (matches.length > 0) {
    const lastImport = matches[matches.length - 1];
    const insertPos = lastImport.index + lastImport[0].length;
    return content.slice(0, insertPos) + "\n" + importStatement + content.slice(insertPos);
  }

  // Jika tidak ada import, tambah setelah "use client" jika ada
  if (content.startsWith('"use client"')) {
    const firstNewline = content.indexOf("\n");
    return content.slice(0, firstNewline + 1) + "\n" + importStatement + content.slice(firstNewline + 1);
  }

  // Otherwise, prepend
  return importStatement + "\n" + content;
}

function processFile(fileConfig) {
  const { file, import: importStmt, replacements } = fileConfig;
  const fullPath = path.join(FRONTEND_DIR, file);

  if (!fs.existsSync(fullPath)) {
    console.error(`❌ File not found: ${file}`);
    return false;
  }

  let content = fs.readFileSync(fullPath, "utf-8");
  const originalContent = content;

  // Step 1: Add import at top if needed
  if (importStmt) {
    content = addImportAtTop(content, importStmt);
  }

  // Step 2: Replace const assignments
  replacements.forEach(({ old, new: newStr, replaceAll }) => {
    if (replaceAll) {
      content = content.split(old).join(newStr);
    } else {
      content = content.replace(old, newStr);
    }
  });

  if (content !== originalContent) {
    fs.writeFileSync(fullPath, content, "utf-8");
    console.log(`✅ Updated: ${file}`);
    return true;
  } else {
    console.log(`⚠️  No changes: ${file}`);
    return false;
  }
}

// Main
console.log("🚀 Starting smart hardcode replacement...\n");
let successCount = 0;

files.forEach(fileConfig => {
  if (processFile(fileConfig)) {
    successCount++;
  }
});

console.log(`\n✨ Done! Updated ${successCount}/${files.length} files`);