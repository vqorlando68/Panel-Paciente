export const metadata = {
  title: "Ingreso | TeKer",
};

import Content from "@/components/routes/login/Content";

export default async function page({ searchParams }) {
  const { aliado } = (await searchParams) || {};

  return <Content />;
}
