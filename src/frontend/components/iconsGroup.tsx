import MarketIcon from "./marketIcon";

const IconsGroup = ({ sites }: { sites: string[] }) => {
  const icons = [];

  if (!sites.length) {
    return <></>;
  }

  icons.push(<MarketIcon key={sites[0]} link={sites[0]} />);
  for (let i = 1; i < sites.length; i++) {
    icons.push(<MarketIcon key={sites[i]} className="-ms-4" link={sites[i]} />);
  }
  return <>{icons}</>;
};

export default IconsGroup;
