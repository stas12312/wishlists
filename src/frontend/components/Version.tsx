const Version = () => {
  return (
    <a
      className="cursor-default hover:text-foreground/50 block text-center text-foreground/40"
      href="https://github.com/stas12312/wishlists"
      rel="noreferrer"
      target="_blank"
    >
      <small className="block m-0">{process.env.NEXT_PUBLIC_VERSION}</small>
      <small className="block m-0">{process.env.NEXT_PUBLIC_BUILD_TIME} </small>
    </a>
  );
};

export default Version;
