import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const components = {
  img: ({ node, ...props }) => <img {...props} className="max-w-full h-auto rounded-lg my-4" alt={props.alt || ''} />,
  a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline" />,
  p: ({ node, ...props }) => {
    if (node.children.length === 1 && node.children[0].type === 'text' && /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)[a-zA-Z0-9_-]{11}/.test(node.children[0].value)) {
      const url = node.children[0].value;
      const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
      const match = url.match(youtubeRegex);
      const videoId = match ? match[1] : null;

      if (videoId) {
        return (
          <div 
            className="my-4 rounded-lg overflow-hidden shadow-lg"
            style={{ 
              position: 'relative', 
              paddingBottom: '56.25%', /* 16:9 */
              height: 0 
            }}
          >
            <iframe 
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
              }}
              src={`https://www.youtube.com/embed/${videoId}`} 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
              title="Embedded YouTube video"
            ></iframe>
          </div>
        );
      }
    }
    return <p {...props} />;
  },
};

const MarkdownPreview = ({ content }) => {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {content || "L'aperçu s'affichera ici."}
    </ReactMarkdown>
  );
};

export default MarkdownPreview;