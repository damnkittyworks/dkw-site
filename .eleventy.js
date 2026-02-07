const markdownIt = require("markdown-it");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });

  eleventyConfig.setLibrary(
    "md",
    markdownIt({
      html: false,
      linkify: true,
      typographer: true,
    })
  );

  eleventyConfig.addCollection("posts", (collectionApi) => {
    return collectionApi
      .getFilteredByGlob("src/posts/*.md")
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
