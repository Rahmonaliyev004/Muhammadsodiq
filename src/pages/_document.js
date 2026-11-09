import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="uz">
      <Head>
        <meta charSet="utf-8" />
        <meta
          name="description"
          content="Santexnik Pro Market — santexnika, fitinglar, quvurlar, kranlar va nasoslarni onlayn buyurtma qiling. Tez yetkazib berish, kafolat va qulay narxlar."
        />
        <meta name="theme-color" content="#14352c" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
