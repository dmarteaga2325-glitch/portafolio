import express from "express";
import { createServer as createViteServer } from "vite";
import { Client } from "@notionhq/client";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Lazy Notion client setup
let notionClient: Client | null = null;
function getNotion() {
  if (!notionClient) {
    const apiKey = process.env.NOTION_API_KEY;
    if (!apiKey) {
      throw new Error("NOTION_API_KEY is not defined");
    }
    notionClient = new Client({ auth: apiKey });
  }
  return notionClient;
}

// Helper to extract UUID from Notion ID/URL
function extractUuid(id: string) {
  if (!id || typeof id !== 'string') return id;
  
  // Remove any quotes that might come from misplaced env vars
  const cleanId = id.replace(/['"]/g, '').trim();
  
  // Look for a 36-char hyphenated UUID
  const hyphenatedMatch = cleanId.match(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/i);
  if (hyphenatedMatch) return hyphenatedMatch[0];
  
  // Look for a 32-char hex string
  const match = cleanId.match(/[a-f0-9]{32}/i);
  if (match) return match[0];
  
  return cleanId;
}

// Helper to get children of a block/page
async function getChildren(id: string) {
  const notion = getNotion();
  const response = await (notion as any).blocks.children.list({ block_id: extractUuid(id) });
  return response.results;
}

// Helper to get plain text from a block (joins all segments)
function getPlainText(block: any) {
  const type = block.type;
  const richText = block[type]?.rich_text;
  if (!Array.isArray(richText)) return "";
  return richText.map((segment: any) => segment.plain_text).join("");
}

// Helper to get title from a page object (joins all segments)
function getPageTitle(page: any) {
  const titleProps = page.properties?.title?.title || page.properties?.Name?.title;
  if (Array.isArray(titleProps)) {
    return titleProps.map((segment: any) => segment.plain_text).join("");
  }
  return "Sin título";
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check - checks if both keys are present
  app.get("/api/health", (req, res) => {
    const configured = !!process.env.NOTION_API_KEY && !!process.env.NOTION_ROOT_ID;
    res.json({ status: "ok", notionConfigured: configured });
  });

  // Dynamic Discovery Route for Projects
  app.get("/api/projects", async (req, res) => {
    try {
      const rootId = process.env.NOTION_ROOT_ID;
      if (!rootId) return res.status(400).json({ error: "NOTION_ROOT_ID not configured" });

      const rootChildren = await getChildren(rootId);
      
      // Look for pages or databases
      const projectContainers = rootChildren.filter((c: any) => 
        (c.type === "child_page" && (c.child_page.title === "IDENTIDAD VISUAL" || c.child_page.title === "FOTOGRAFIA")) ||
        (c.type === "child_database" && (c.child_database.title === "IDENTIDAD VISUAL" || c.child_database.title === "FOTOGRAFIA"))
      );

      let allProjects: any[] = [];

      for (const container of projectContainers) {
        const catName = container.type === "child_page" ? container.child_page.title : container.child_database.title;
        
        if (container.type === "child_database") {
          // Query Database
          const dbResponse: any = await (getNotion() as any).databases.query({
            database_id: container.id,
          });
          
          for (const page of dbResponse.results) {
            const title = getPageTitle(page);
            const descProperty = Object.values(page.properties).find((p: any) => p.type === "rich_text") as any;
            const description = descProperty?.rich_text 
              ? descProperty.rich_text.map((s: any) => s.plain_text).join("")
              : "Descripción desde base de datos.";
            const fileProperty = Object.values(page.properties).find((p: any) => p.type === "files") as any;
            const imageUrl = fileProperty?.files?.[0]?.file?.url || fileProperty?.files?.[0]?.external?.url;

            // Also check page content for gallery
            const pBlocks = await getChildren(page.id);
            const gallery = pBlocks.filter((b: any) => b.type === "image").map((b: any) => b.image.file?.url || b.image.external?.url);

            allProjects.push({
              id: page.id,
              category: catName,
              title: title,
              description: description,
              image: imageUrl || gallery[0] || "https://images.unsplash.com/photo-1626785774573-4b799315345d",
              type: catName === "FOTOGRAFIA" ? "Photography" : "Branding",
              gallery: gallery.length > 0 ? gallery : [imageUrl].filter(Boolean)
            });
          }
        } else {
          // Conventional Page Logic (Child Pages)
          const projectPages = await getChildren(container.id);
          for (const p of projectPages) {
            if (p.type !== "child_page") continue;
            const pBlocks = await getChildren(p.id);
            const description = pBlocks.find((b: any) => b.type === "paragraph" || b.type === "text")
              ? getPlainText(pBlocks.find((b: any) => b.type === "paragraph" || b.type === "text"))
              : "Descripción del proyecto en Notion.";
            const images = pBlocks.filter((b: any) => b.type === "image").map((b: any) => b.image.file?.url || b.image.external?.url);

            allProjects.push({
              id: p.id,
              category: catName,
              title: p.child_page.title,
              description: description,
              image: images[0] || "https://images.unsplash.com/photo-1626785774573-4b799315345d",
              type: catName === "FOTOGRAFIA" ? "Photography" : "Branding",
              gallery: images
            });
          }
        }
      }

      res.json(allProjects);
    } catch (error: any) {
      console.error("Notion Discovery Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Dynamic Discovery Route for Home Content
  app.get("/api/content/home", async (req, res) => {
    try {
      const rootId = process.env.NOTION_ROOT_ID;
      if (!rootId) return res.status(400).json({ error: "NOTION_ROOT_ID not configured" });

      const rootChildren = await getChildren(rootId);
      const homePage = rootChildren.find((c: any) => c.type === "child_page" && c.child_page.title === "INICIO");
      
      if (!homePage) {
        return res.json({ title: "PORTFOLIO", description: "Página INICIO no encontrada en Notion." });
      }

      const blocks = await getChildren(homePage.id);
      const description = blocks
        .filter((b: any) => b.type === "paragraph")
        .map((b: any) => getPlainText(b))
        .join("\n") || "Contenido de inicio desde Notion.";

      res.json({
        title: homePage.child_page.title || "PORTFOLIO",
        description: description
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
