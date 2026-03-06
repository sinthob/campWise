export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";

export default async function CampgroundDetailsPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  redirect(`/campground/${id}`);
}
