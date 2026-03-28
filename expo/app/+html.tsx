import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="PomoMate" />
        <meta name="mobile-web-app-capable" content="yes" />
        
        <meta name="theme-color" content="#6366f1" />
        <meta name="description" content="ポモドーロテクニックで集中力を高めるタイマーアプリ" />
        <meta name="keywords" content="ポモドーロ,タイマー,集中力,生産性,フォーカス" />
        
        <meta property="og:title" content="PomoMate - フォーカスタイマー" />
        <meta property="og:description" content="ポモドーロテクニックで集中力を高めるタイマーアプリ" />
        <meta property="og:type" content="website" />
        
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/icon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icon.png" />
        
        <ScrollViewStyleReset />
        
        <style dangerouslySetInnerHTML={{ __html: `
          * {
            box-sizing: border-box;
          }
          html, body, #root {
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
            overflow: hidden;
          }
          body {
            background-color: #121212;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          #root {
            display: flex;
            flex-direction: column;
          }
          
          @supports (padding: max(0px)) {
            body {
              padding-left: max(0px, env(safe-area-inset-left));
              padding-right: max(0px, env(safe-area-inset-right));
            }
          }
          
          input, textarea, button, select {
            font-family: inherit;
          }
          
          ::-webkit-scrollbar {
            display: none;
          }
        `}} />
      </head>
      <body>{children}</body>
    </html>
  );
}
