import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="es">
      <Head>
        <title>DiFiore Performance</title>
        <meta name="description" content="Sistema de gestión de taller - DiFiore Performance"/>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='12' fill='%230F1117'/><text y='72' x='8' font-size='55' font-family='Arial Black' font-weight='900' font-style='italic' fill='%232563EB'>DF</text></svg>"/>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
