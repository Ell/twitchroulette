import type { ActionArgs } from "@remix-run/cloudflare";
import { redirect } from "@remix-run/cloudflare";

import type { FilterSet } from "~/components/FilterSelectModal";

export async function action({ context, request }: ActionArgs) {
  const { getSession, commitSession } = context.sessionStorage;

  const session = await getSession(request.headers.get("Cookie"));

  const data = await request.json<FilterSet>();

  if (data) {
    session.set("filters", data);
  }

  return redirect("/", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}
