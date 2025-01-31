import { Influencer } from "@/components/Influencer";
import { toTitleCase } from "@/lib/utils";

type InfluencerProps = {
  params: {
    slug: string;
  };
};

const InfluencerPage = async ({ params }: InfluencerProps) => {
  const { slug } = await params;

  return <Influencer name={toTitleCase(slug)} />;
};

export default InfluencerPage;
