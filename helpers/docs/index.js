const packageName = process.env.LERNA_PACKAGE_NAME;
const newReadmeFileName = packageName.startsWith("@rooks")
  ? packageName.split("@rooks/")[1]
  : packageName;

const writeFileSync = require("fs").writeFileSync;
const readFileSync = require("fs").readFileSync;
const parseReadme = require("./parse-readme");

function ls() {
  let readmeFileContent = readFileSync(`./README.md`, "utf8");
  readmeFileContent = parseReadme(readmeFileContent);
  let examplesFileContent = null;
  try {
    examplesFileContent = readFileSync(`./Examples.md`, "utf8");
  } catch (err) {
    console.log("Could not read examples in package: " + newReadmeFileName);
  }
  let frontMatter = `id: ${newReadmeFileName}
title: ${newReadmeFileName}
hide_title: true
sidebar_label: ${newReadmeFileName}`;
  if (newReadmeFileName === "rooks") {
    frontMatter = `${frontMatter}      
slug: /`;
  }
  const fileBody = examplesFileContent
    ? `
${readmeFileContent}

---

## Codesandbox Examples

${examplesFileContent}    



`
    : readmeFileContent;

  const updatedFileContent = `---
${frontMatter}
---

${fileBody}
    `;
  writeFileSync(
    `../docusaurus/docs/${newReadmeFileName}.md`,
    updatedFileContent,
    "utf8"
  );
}

function addToSidebarJson() {
  const INDEPENDENT_PACKAGES_SIDEBAR_INDEX = 1
  if (newReadmeFileName === "rooks") {
    return;
  }
  let currentSidebarJson;
  let fileContent;
  try {
    fileContent = readFileSync(`../docusaurus/sidebars.json`, "utf8");
    currentSidebarJson = JSON.parse(fileContent);
    if (
      Object.keys(currentSidebarJson.docs[INDEPENDENT_PACKAGES_SIDEBAR_INDEX].items).includes(
        "newReadmeFileName"
      )
    ) {
      return;
    }
    const independentPackages = {
      ...currentSidebarJson.docs[INDEPENDENT_PACKAGES_SIDEBAR_INDEX],
      items: Array.from(
        new Set(
          [
            ...currentSidebarJson.docs[INDEPENDENT_PACKAGES_SIDEBAR_INDEX].items,
            newReadmeFileName,
          ].sort()
        )
      )
    };
    const newSidebarJson = {
      ...currentSidebarJson,
      docs: [
        ...currentSidebarJson.docs.slice(0, INDEPENDENT_PACKAGES_SIDEBAR_INDEX),
        independentPackages,
        ...currentSidebarJson.docs.slice(INDEPENDENT_PACKAGES_SIDEBAR_INDEX+1)
      ],
    };
    writeFileSync(
      `../docusaurus/sidebars.json`,
      JSON.stringify(newSidebarJson, null, 2),
      "utf-8"
    );
  } catch (err) {
    console.log("----");
    console.log(err);
    console.log("----");
  }
}

try {
  ls();
  addToSidebarJson();
} catch (err) {
  console.log(err);
}
