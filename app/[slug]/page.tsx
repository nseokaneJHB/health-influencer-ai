import { Suspense } from "react";
import { Influencer } from "@/components/Influencer";
import { toTitleCase } from "@/lib/utils";

type InfluencerProps = {
  params: Promise<{ slug: string }>;
};

const InfluencerPage = async ({ params }: Awaited<InfluencerProps>) => {
  const { slug } = await params;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Influencer name={toTitleCase(slug)} />;
    </Suspense>
  );
};

export default InfluencerPage;
