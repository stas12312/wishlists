const Version = () => {
  return (
    <a
      className="cursor-default hover:text-default-400 block text-center text-default-300"
      href="https://github.com/stas12312/wishlists"
      rel="noreferrer"
      target="_blank"
    >
      <small className="block m-0">{`${process.env.VERSION ?? process.env.npm_package_version}`}</small>
      <small className="block m-0">{process.env.BUILD_TIME} </small>
    </a>
  );
};

export default Version;
