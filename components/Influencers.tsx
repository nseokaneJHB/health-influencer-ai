"use client";
import { useRouter } from "next/navigation";
import {
  Minus,
  Users,
  TrendingUp,
  ArrowUpDown,
  ChartColumn,
  TrendingDown,
  CircleCheckBig,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableCaption,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, toSlug } from "@/lib/utils";
import { getInfluencers } from "@/actions/influencer";
import { useQuery } from "@tanstack/react-query";
import { useQueryState } from "nuqs";

type AnalyticsItem = {
  id: string;
  value: string;
  description: string;
};

type Influencer = {
  rank: string;
  name: string;
  image?: string;
  category: string;
  trust: number;
  trend: string;
  followers: string;
  claims: string;
};

export const Influencers = () => {
  const route = useRouter();

  const [categoryValue, setCategoryValue] = useQueryState("category", {
    defaultValue: "",
    clearOnDefault: true,
  });
  const [sortValue, setSortValue] = useQueryState("sort", {
    defaultValue: "",
    clearOnDefault: true,
  });

  const influencersQuery = useQuery({
    queryKey: ["influencers"],
    queryFn: async () => await getInfluencers(),
  });

  const filters = ["All", "Nutrition", "Fitness", "Medicine", "Mental Health"];

  const influencers = (
    (influencersQuery?.data?.influencers as Influencer[]) || []
  )
    .filter(
      (influencer) =>
        !categoryValue ||
        categoryValue === "all" ||
        toSlug(influencer.category) === categoryValue,
    )
    .sort((a, b) =>
      !sortValue || sortValue === "asc"
        ? Number(a.rank) - Number(b.rank)
        : Number(b.rank) - Number(a.rank),
    );

  return (
    <div className="flex flex-col gap-y-8">
      <div className="flex flex-col gap-y-8">
        <h1 className="text-6xl font-bold">Influencer Trust Leaderboard</h1>
        <p className="text-secondary-text">
          Real-time rankings of health influencers based on scientific accuracy,
          credibility, and transparency. Updated daily using Al-powered
          analysis.
        </p>
      </div>
      <div className="flex items-center gap-x-6">
        {influencersQuery.isLoading || influencersQuery.isPending
          ? Array.from({ length: 3 }).map((_, index) => (
              <Skeleton
                key={`dashboard-stats-skeleton-${index}`}
                className="min-h-40 w-full animate-pulse rounded-lg bg-secondary-background"
              />
            ))
          : influencersQuery?.data?.stats.map((item: AnalyticsItem) => (
              <DashboardAnalyticsItem key={item.id} item={item} />
            ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-4">
          {filters.map((filter) => (
            <Button
              key={toSlug(filter)}
              onClick={() => setCategoryValue(toSlug(filter))}
              className={cn(
                "rounded-3xl bg-secondary-background p-6 text-lg text-secondary-text-light",
                {
                  "first:bg-success first:text-primary-text": !categoryValue,
                },
                {
                  "bg-success text-primary-text":
                    toSlug(filter) === categoryValue,
                },
              )}
            >
              {filter}
            </Button>
          ))}
        </div>
        <Button
          className="flex items-center rounded-lg bg-secondary-background p-6 text-secondary-text-light"
          onClick={() =>
            setSortValue((prev) =>
              !prev ? "desc" : prev === "asc" ? "desc" : "asc",
            )
          }
        >
          <ArrowUpDown className="min-h-7 min-w-7" />
          <span className="text-lg">
            {!sortValue || sortValue === "asc" ? "Lowest" : "Highest"} First
          </span>
        </Button>
      </div>
      <Table className="rounded-lg border border-secondary-text/50 bg-secondary-background">
        <TableCaption>
          Top {influencers?.length || 0} list of Active Health Influencers.
        </TableCaption>
        <TableHeader className="">
          <TableRow className="border-secondary-text/50">
            <TableHead className="p-4 text-md">RANK</TableHead>
            <TableHead className="p-4 text-md">INFLUENCER</TableHead>
            <TableHead className="p-4 text-md">CATEGORY</TableHead>
            <TableHead className="p-4 text-md">TRUST SCORE</TableHead>
            <TableHead className="p-4 text-md">TREND</TableHead>
            <TableHead className="p-4 text-md">FOLLOWERS</TableHead>
            <TableHead className="p-4 text-md">VERIFIED CLAIMS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {influencersQuery.isLoading || influencersQuery.isPending ? (
            Array.from({ length: 5 }).map((_, index) => (
              <TableRow
                key={`dashboard-influencer-skeleton-${index}`}
                className="animate-pulse border-secondary-text/50 bg-secondary-background"
              >
                <TableCell colSpan={7}>
                  <Skeleton className="min-h-16 w-full animate-pulse bg-secondary-background" />
                </TableCell>
              </TableRow>
            ))
          ) : influencers && influencers.length > 0 ? (
            influencers.map(
              (
                { rank, name, trust, trend, claims, category, followers },
                index,
              ) => (
                <TableRow
                  key={`dashboard-influencer-${index}`}
                  className="cursor-pointer border-secondary-text/50 hover:bg-primary-background"
                  onClick={() => route.push(`/${toSlug(name)}`)}
                >
                  <TableCell className="p-4 text-md">{rank + "#"}</TableCell>
                  <TableCell className="flex items-center gap-4">
                    <p className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-black">
                      {name.split(" ").map((word, index) => (
                        <span key={`${index}-${toSlug(name)}`}>{word[0]}</span>
                      ))}
                    </p>
                    <p>{name}</p>
                  </TableCell>
                  <TableCell className="p-4 text-md">{category}</TableCell>
                  <TableCell
                    className={cn(
                      "p-4 text-md",
                      trust >= 90
                        ? "text-success"
                        : trust < 80
                          ? "text-danger"
                          : "text-warning",
                    )}
                  >{`${trust}%`}</TableCell>
                  <TableCell className="p-4 text-md">
                    {["High", "Up"].includes(trend) ? (
                      <TrendingUp className="text-success" />
                    ) : ["Low", "Down"].includes(trend) ? (
                      <TrendingDown className="text-danger" />
                    ) : (
                      <Minus className="text-warning" />
                    )}
                  </TableCell>
                  <TableCell className="p-4 text-md">{followers}</TableCell>
                  <TableCell className="p-4 text-md">{claims}</TableCell>
                </TableRow>
              ),
            )
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="p-4 text-center text-xl">
                No Influencers found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

const DashboardAnalyticsItem = ({ item }: { item: AnalyticsItem }) => {
  const icon =
    item.id === "active-influencers" ? (
      <Users className="h-14 w-14 text-success" />
    ) : item.id === "verified-claims" ? (
      <CircleCheckBig className="h-14 w-14 text-success" />
    ) : (
      <ChartColumn className="h-14 w-14 text-success" />
    );

  return (
    <div className="flex w-full items-center gap-x-4 rounded-lg border border-secondary-text/50 bg-secondary-background p-8">
      <div className="h-14 w-14">{icon}</div>
      <div>
        <h2 className="text-2xl font-bold">
          {item.value}
          {item.id === "average-trust-score" ? "%" : ""}
        </h2>
        <p className="text-secondary-text">{item.description}</p>
      </div>
    </div>
  );
};
