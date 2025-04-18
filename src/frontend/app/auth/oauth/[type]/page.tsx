import WindowReload from "./window";

const OAuthPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ type: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) => {
  const token = (await searchParams).code;
  const oauth_type = (await params).type;
  return <WindowReload oAuthType={oauth_type} token={token || ""} />;
};

export default OAuthPage;
