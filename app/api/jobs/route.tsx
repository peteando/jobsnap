import { parseJob } from "../../components/lib/parseJob";

export async function POST(req: Request) {
  const { rawText } =
    await req.json();

  const parsed =
    await parseJob(rawText);

  return Response.json(parsed);
}