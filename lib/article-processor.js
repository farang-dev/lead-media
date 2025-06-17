"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupArticle = cleanupArticle;
function cleanupArticle(content) {
    // Remove "Posted:" at the beginning of the content
    content = content.replace(/^Posted:\s*\n\n/g, '');
    // First, check if the content starts with the title and remove it
    // This pattern looks for a title-like text at the beginning of the content
    // that might be wrapped in bold formatting
    const titleMatch = content.match(/^\*\*([^\*]+)\*\*/);
    if (titleMatch) {
        const title = titleMatch[1];
        // Remove the title from the beginning of the content
        content = content.replace(new RegExp(`^\\*\\*${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\*\\*\\n\\n`), '');
    }
    // Remove "Posted:" text if it appears at the beginning after title removal
    content = content.replace(/^Posted:\s*\n\n/g, '');
    content = content.replace(/^Posted:/g, '');
    // Remove Topics section
    content = content.replace(/\*\*Topics:\*\*[\s\S]*?(?=\n\n|\*\*|$)/g, '');
    // Remove Popular Stories section
    content = content.replace(/\*\*Popular Stories:\*\*[\s\S]*?(?=\n\n|\*\*|$)/g, '');
    // Remove Related Articles section - multiple patterns to catch different formats
    content = content.replace(/\*\*Read More on TechCrunch:\*\*[\s\S]*$/g, '');
    content = content.replace(/\*\*Related Articles\*\*[\s\S]*$/g, '');
    content = content.replace(/\*\*Related Articles:\*\*[\s\S]*$/g, '');
    content = content.replace(/Read More on TechCrunch:[\s\S]*$/g, '');
    content = content.replace(/Related Articles:[\s\S]*$/g, '');
    // Remove individual related article links
    content = content.replace(/– \[(.*?)\]\((.*?)\)/g, '');
    content = content.replace(/- \[(.*?)\]\((.*?)\)/g, '');
    // Remove About the Author section
    content = content.replace(/\*\*About the Author\*\*[\s\S]*?(?=\n\n|\*\*|$)/g, '');
    content = content.replace(/About the Author[\s\S]*?(?=\n\n|\*\*|$)/g, '');
    // Remove any AI Editor or similar markers
    content = content.replace(/\*AI Editor\*/g, '');
    content = content.replace(/—\s*\n\n\*AI Editor\*/, '');
    // Remove trailing dash and AI Editor
    content = content.replace(/\n—\s*\n\n\*AI Editor\*$/g, '');
    // Convert any remaining bold formatting to HTML
    content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Convert any remaining italic formatting to HTML
    content = content.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Remove any trailing whitespace
    content = content.trim();
    return content;
}
