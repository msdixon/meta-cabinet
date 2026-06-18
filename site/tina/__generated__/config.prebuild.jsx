// tina/config.ts
import { defineConfig } from "tinacms";
var config_default = defineConfig({
  branch: process.env.TINA_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || "main",
  clientId: process.env.TINA_CLIENT_ID || "",
  token: process.env.TINA_TOKEN || "",
  build: {
    outputFolder: "admin",
    publicFolder: "public"
  },
  media: {
    tina: {
      mediaRoot: "",
      publicFolder: "public"
    }
  },
  schema: {
    collections: [
      {
        name: "landing",
        label: "Landing page",
        path: "src/data",
        format: "json",
        match: { include: "landing" },
        ui: { allowedActions: { create: false, delete: false } },
        fields: [
          { name: "mastheadKicker", label: "Masthead kicker", type: "string" },
          { name: "mastheadLocation", label: "Location", type: "string" },
          { name: "mastheadMaintainedBy", label: "Maintained by (name)", type: "string" },
          { name: "mastheadMaintainerUrl", label: "Maintained by (URL)", type: "string" },
          { name: "mastheadGithubUrl", label: "GitHub URL", type: "string" },
          { name: "mastheadEst", label: "Est. year", type: "string" },
          {
            name: "ledeAttribution",
            label: "Lede attribution",
            type: "object",
            fields: [
              { name: "prefix", label: "Prefix text", type: "string" },
              { name: "linkText", label: "Link text", type: "string" },
              { name: "linkUrl", label: "Link URL", type: "string" },
              { name: "suffix", label: "Suffix text", type: "string" }
            ]
          },
          {
            name: "practiceGrid",
            label: "Practice grid",
            type: "object",
            list: true,
            ui: { itemProps: (item) => ({ label: item.heading }) },
            fields: [
              { name: "heading", label: "Heading", type: "string" },
              { name: "body", label: "Body", type: "string", ui: { component: "textarea" } }
            ]
          },
          { name: "footerSig", label: "Footer signature", type: "string" },
          {
            name: "footerLinks",
            label: "Footer links",
            type: "object",
            list: true,
            ui: { itemProps: (item) => ({ label: item.label }) },
            fields: [
              { name: "label", label: "Label", type: "string" },
              { name: "url", label: "URL", type: "string" }
            ]
          }
        ]
      },
      {
        name: "rooms",
        label: "Rooms",
        path: "src/content/rooms",
        format: "md",
        ui: { filename: { slugify: (values) => `${String(values.order).padStart(2, "0")}-${values.titleMain?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "") || "room"}` } },
        fields: [
          { name: "order", label: "Order", type: "number", required: true },
          { name: "index", label: 'Index label (e.g. "I.")', type: "string" },
          { name: "titleMain", label: "Title (main)", type: "string", required: true },
          { name: "titleSuffix", label: "Title suffix (italic)", type: "string" },
          { name: "tag", label: "Tag", type: "string" },
          { name: "sub", label: "Sub-line", type: "string" },
          { name: "metaLine1", label: "Meta line 1", type: "string" },
          { name: "metaLine2", label: "Meta line 2", type: "string" },
          { name: "githubUrl", label: "GitHub URL", type: "string" },
          { name: "anchor", label: "HTML anchor id (optional)", type: "string" },
          {
            name: "rosterSections",
            label: "Roster sections",
            type: "object",
            list: true,
            ui: { itemProps: (item) => ({ label: item.label }) },
            fields: [
              { name: "label", label: "Section label", type: "string" },
              {
                name: "members",
                label: "Members",
                type: "object",
                list: true,
                ui: { itemProps: (item) => ({ label: item.name }) },
                fields: [
                  { name: "name", label: "Name", type: "string" },
                  { name: "role", label: "Role", type: "string" }
                ]
              }
            ]
          },
          { name: "body", label: "Purpose (markdown)", type: "rich-text", isBody: true }
        ]
      },
      {
        name: "transcript",
        label: "Transcript excerpt",
        path: "src/data",
        format: "json",
        match: { include: "transcript" },
        ui: { allowedActions: { create: false, delete: false } },
        fields: [
          { name: "sectionTitle", label: "Section title", type: "string" },
          { name: "sectionNote", label: "Section note", type: "string" },
          { name: "headerLabel", label: "Exhibit label", type: "string" },
          { name: "source", label: "Source note", type: "string" },
          { name: "prompt", label: "Source document excerpt", type: "string", ui: { component: "textarea" } },
          {
            name: "entries",
            label: "Transcript entries",
            type: "object",
            list: true,
            ui: { itemProps: (item) => ({ label: item.speaker }) },
            fields: [
              { name: "speaker", label: "Speaker", type: "string" },
              { name: "text", label: "Text (use *asterisks* for italics)", type: "string", ui: { component: "textarea" } }
            ]
          },
          { name: "note", label: "Closing note", type: "string" }
        ]
      }
    ]
  }
});
export {
  config_default as default
};
