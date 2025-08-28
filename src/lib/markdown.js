import React from 'react';

export const parseMarkdown = (text) => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  // Sanitize to prevent XSS
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  // YouTube URL transformations to embedded iframe
  const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/g;
  html = html.replace(
    youtubeRegex,
    (match, videoId) => {
      // The matched URL is replaced by an iframe, so we don't need to escape it further.
      return `<div class="aspect-w-16 aspect-h-9 my-4 rounded-lg overflow-hidden"><iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position:absolute;top:0;left:0;width:100%;height:100%;"></iframe></div>`;
    }
  );

  // Standard Markdown
  html = html
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.*?)__/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/_(.*?)_/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: underline;">$1</a>')
    .replace(/(?:\r\n|\r|\n)/g, '<br />');

  // Remove <br /> tags that are inside or immediately after the div wrapper of the iframe
  html = html.replace(/<div class="aspect-w-16 aspect-h-9 my-4 rounded-lg overflow-hidden">(.*?)<\/div><br \/>/g, '<div class="aspect-w-16 aspect-h-9 my-4 rounded-lg overflow-hidden">$1</div>');

  return html;
};