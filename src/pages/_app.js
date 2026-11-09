import { Plus_Jakarta_Sans } from "next/font/google";
import "../styles/globals.css";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export default function App({ Component, pageProps }) {
  return (
    <div className={`${sans.className} min-h-screen`}>
      <Component {...pageProps} />
    </div>
  );
}
