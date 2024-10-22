const MarkdownIt = require('markdown-it');
const frontMatter = require('front-matter');
const fs = require('fs-extra');
const path = require('path');

// Initialize markdown-it with desired plugins
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
});


// Custom plugin to handle [[link text]]
md.use(function(md) {
    // Add a rule to handle the custom syntax
    md.inline.ruler.before('link', 'double_bracket_link', function(state, silent) {
        const max = state.posMax;
        const start = state.pos;

        // Check if we have the opening '[['
        if (state.src.charCodeAt(start) !== 0x5B || state.src.charCodeAt(start + 1) !== 0x5B) {
            return false;
        }

        let end = start + 2;

        // Find the closing ']]'
        while (end < max) {
            if (state.src.charCodeAt(end) === 0x5D && state.src.charCodeAt(end + 1) === 0x5D) {
                break;
            }
            end++;
        }

        // If we don't have the closing brackets, return false
        if (end >= max) {
            return false;
        }

        // Extract the link text
        const content = state.src.slice(start + 2, end).trim();

        // If silent, return true but don't process further (for inline checks)
        if (silent) {
            return true;
        }

        // Create the token for the link opening tag
        const tokenLinkOpen = state.push('link_open', 'a', 1);
        tokenLinkOpen.attrs = [['href', content.concat(".html")]];  // Set href attribute
        tokenLinkOpen.markup = '[[';
        tokenLinkOpen.content = content;

        // Add the text inside the link
        const tokenText = state.push('text', '', 0);
        tokenText.content = content;  // Set the content for the link

        // Create the token for the link closing tag
        const tokenLinkClose = state.push('link_close', 'a', -1);
        tokenLinkClose.markup = ']]';

        // Move the state position to after the closing ']]'
        state.pos = end + 2;
        return true;
    });
});


// Function to process markdown content
function processMarkdown(content) {
  const { body, attributes } = frontMatter(content);
  const html = md.render(body);  // Render Markdown into HTML

  return { html, metadata: attributes };
}

module.exports = { processMarkdown };