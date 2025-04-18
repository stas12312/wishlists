import WindowReload from "./window";

export default async function OAuthPage({
  params,
  searchParams,
}: {
  params: Promise<{ type: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const token = (await searchParams).code;
  const oauth_type = (await params).type;
  return <WindowReload oAuthType={oauth_type} token={token || ""} />;
}
