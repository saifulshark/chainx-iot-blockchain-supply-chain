// import "../styles/globals.css";

// export default function App({ Component, pageProps }) {
//   return <Component {...pageProps} />;
// }
import "../styles/globals.css";

//internal import
import {TrackingProvider} from "../Conetxt/TrackingContext";

export default function App({ Component, pageProps }) {
  return (
    <TrackingProvider>
      <Component {...pageProps} />
    </TrackingProvider>
  );
}
