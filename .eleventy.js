const markdownIt = require("markdown-it");
const path = require("path");

function normalizeInputPath(inputPathValue) {
  if (!inputPathValue || typeof inputPathValue !== "string") {
    return null;
  }

  const normalized = inputPathValue.replace(/\\/g, "/");
  const srcIndex = normalized.indexOf("src/");
  if (srcIndex >= 0) {
    return normalized.slice(srcIndex);
  }

  return normalized.startsWith("./") ? normalized.slice(2) : normalized;
}

function getSlugFromPostLike(postLike) {
  if (!postLike) {
    return null;
  }

  if (typeof postLike === "string") {
    return postLike;
  }

  if (postLike.fileSlug) {
    return postLike.fileSlug;
  }

  if (postLike.slug) {
    return postLike.slug;
  }

  if (postLike.data && postLike.data.slug) {
    return postLike.data.slug;
  }

  if (postLike.data && postLike.data.page && postLike.data.page.fileSlug) {
    return postLike.data.page.fileSlug;
  }

  if (postLike.page && postLike.page.fileSlug) {
    return postLike.page.fileSlug;
  }

  const inputPathValue =
    postLike.inputPath ||
    (postLike.page && postLike.page.inputPath) ||
    (postLike.data && postLike.data.page && postLike.data.page.inputPath);

  if (inputPathValue) {
    return path.basename(inputPathValue, path.extname(inputPathValue));
  }

  return null;
}

function getHistoryEntry(postLike, gitHistory) {
  if (!gitHistory) {
    return null;
  }

  const slug = getSlugFromPostLike(postLike);
  if (slug && gitHistory.posts && gitHistory.posts[slug]) {
    return gitHistory.posts[slug];
  }

  const inputPathValue =
    postLike &&
    (postLike.inputPath ||
      (postLike.page && postLike.page.inputPath) ||
      (postLike.data && postLike.data.page && postLike.data.page.inputPath));
  const normalized = normalizeInputPath(inputPathValue);
  if (normalized && gitHistory.byFile && gitHistory.byFile[normalized]) {
    return gitHistory.byFile[normalized];
  }

  if (slug && gitHistory.byFile && gitHistory.byFile[`src/posts/${slug}.md`]) {
    return gitHistory.byFile[`src/posts/${slug}.md`];
  }

  return null;
}

function getUpdatedDate(postLike, gitHistory) {
  const historyEntry = getHistoryEntry(postLike, gitHistory);
  if (historyEntry && historyEntry.lastUpdated) {
    return historyEntry.lastUpdated;
  }

  if (postLike && postLike.data && postLike.data.lastUpdated) {
    return postLike.data.lastUpdated;
  }

  if (postLike && postLike.lastUpdated) {
    return postLike.lastUpdated;
  }

  if (postLike && postLike.date) {
    return postLike.date;
  }

  if (postLike && postLike.data && postLike.data.date) {
    return postLike.data.date;
  }

  return null;
}

function getRevisionCount(postLike, gitHistory) {
  const historyEntry = getHistoryEntry(postLike, gitHistory);
  if (historyEntry && Number.isFinite(historyEntry.revisions)) {
    return Math.max(historyEntry.revisions, 1);
  }

  if (postLike && postLike.data && Number.isFinite(postLike.data.revisionCount)) {
    return Math.max(postLike.data.revisionCount, 1);
  }

  if (postLike && Number.isFinite(postLike.revisionCount)) {
    return Math.max(postLike.revisionCount, 1);
  }

  return 1;
}

function stripHtml(inputValue) {
  if (!inputValue) {
    return "";
  }

  return String(inputValue)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });

  eleventyConfig.setLibrary(
    "md",
    markdownIt({
      html: false,
      linkify: true,
      typographer: false,
    })
  );

  eleventyConfig.addCollection("posts", (collectionApi) => {
    return collectionApi
      .getFilteredByGlob("src/posts/*.md")
      .filter((item) => !(item.data && item.data.draft))
      .sort((a, b) => b.date - a.date);
  });

  eleventyConfig.addCollection("builds", (collectionApi) => {
    return collectionApi
      .getFilteredByGlob("src/builds/*.md")
      .sort((a, b) => b.date - a.date);
  });

  eleventyConfig.addFilter("prettyDate", (value) => {
    if (!value) {
      return "TBD";
    }

    const parsed = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return "TBD";
    }

    return parsed.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  });

  eleventyConfig.addFilter("historyForPost", (postLike, gitHistory) => {
    return getHistoryEntry(postLike, gitHistory);
  });

  eleventyConfig.addFilter("postLastUpdated", (postLike, gitHistory) => {
    return getUpdatedDate(postLike, gitHistory);
  });

  eleventyConfig.addFilter("postRevisions", (postLike, gitHistory) => {
    return getRevisionCount(postLike, gitHistory);
  });

  eleventyConfig.addFilter("sortPostsByLastUpdated", (posts, gitHistory) => {
    if (!Array.isArray(posts)) {
      return [];
    }

    return [...posts].sort((a, b) => {
      const dateA = new Date(getUpdatedDate(a, gitHistory) || 0).getTime();
      const dateB = new Date(getUpdatedDate(b, gitHistory) || 0).getTime();
      return dateB - dateA;
    });
  });

  eleventyConfig.addFilter("postSnippet", (postLike, limit = 100) => {
    const source =
      (postLike && postLike.data && postLike.data.excerpt) ||
      stripHtml(postLike && postLike.templateContent) ||
      "";

    if (!source) {
      return "";
    }

    if (source.length <= limit) {
      return source;
    }

    return `${source.slice(0, Math.max(0, limit - 1)).trimEnd()}...`;
  });

  eleventyConfig.addFilter("postUrlBySlug", (posts, slug) => {
    if (!Array.isArray(posts) || !slug) {
      return null;
    }

    const match = posts.find((post) => {
      const postSlug = getSlugFromPostLike(post);
      return postSlug === slug;
    });

    return match ? match.url : null;
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["njk", "md", "html"],
  };
};
