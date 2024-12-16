import { useIsFetching } from "@tanstack/react-query";

export default function Header({ children }) {
  const isFetching = useIsFetching();
  return (
    <>
      <div id="main-header-loading">{isFetching > 0 && <progress />}</div>
      <header id="main-header">
        <div id="header-title">
          <h1>Tech Events</h1>
        </div>
        <nav>{children}</nav>
      </header>
    </>
  );
}
