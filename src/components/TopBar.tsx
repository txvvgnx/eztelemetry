import clsx from "clsx";

function TopBar() {
  return (
    <div
      className={clsx(
        "fixed top-0 z-10 flex h-[--topBarHeight] w-screen items-center px-2",
        "border-b border-[--borderColor] bg-[--navbarColor]",
      )}
    >
      hello
    </div>
  );
}

export default TopBar;
