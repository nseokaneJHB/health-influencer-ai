import { Suspense } from "react";
import { Influencers } from "@/components/Influencers";

const HomePage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Influencers />
    </Suspense>
  );
};

export default HomePage;
