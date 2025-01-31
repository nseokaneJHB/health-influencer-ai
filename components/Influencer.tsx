"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn, toSlug, toTitleCase } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  X,
  Brain,
  Search,
  Filter,
  Calendar,
  DollarSign,
  TrendingUp,
  ShoppingBag,
  ExternalLink,
  ArrowDownWideNarrow,
} from "lucide-react";
import { getInfluencer } from "@/actions/influencer";
import { useQuery } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import { useCallback, useMemo, useState } from "react";
import debounce from "lodash.debounce";

type StatsItem = {
  id: string;
  title: string;
  value: string;
  description: string;
};

type ClaimItemDetails = {
  analysis: string;
  claim: string;
  claim_source: string;
  createdAt: string;
  research_source: string;
  trust: number;
  verified: string;
  category: string;
};

type InfluencerDetails = {
  bio: string;
  name: string;
  image?: string;
  stats: StatsItem[];
  categories: string[];
  claims: ClaimItemDetails[];
  products: string[];
  monetization: string;
};

const SORT_VALUES = ["date", "trust", "verified"];

export const Influencer = ({ name }: { name: string }) => {
  const route = useRouter();

  const { isLoading, isPending, data } = useQuery<InfluencerDetails>({
    queryKey: ["influencers", name],
    queryFn: async () => await getInfluencer(name),
  });

  const filters = ["Claims Analysis", "Recommended Products", "Monetization"];

  const categories = ["All Categories"].concat(data?.categories || []);

  const verification_status = [
    "All Statuses",
    "Verified",
    "Questionable",
    "Debunked",
  ];

  const [categoryValue, setCategoryValue] = useQueryState("category", {
    defaultValue: "",
    clearOnDefault: true,
  });
  const [verificationStatusValue, setVerificationStatusValue] = useQueryState(
    "status",
    {
      defaultValue: "",
      clearOnDefault: true,
    },
  );
  const [searchValue, setSearchValue] = useQueryState("search", {
    defaultValue: "",
    clearOnDefault: true,
  });
  const [sortValue, setSortValue] = useQueryState("sort", {
    defaultValue: "",
    clearOnDefault: true,
  });

  const claims = (data?.claims || [])
    .filter((claim) => {
      const matchesCategory =
        !categoryValue ||
        categoryValue === toSlug("All Categories") ||
        toSlug(claim.category) === categoryValue;

      const matchesVerificationStatus =
        !verificationStatusValue ||
        verificationStatusValue === toSlug("All Statuses") ||
        toSlug(claim.verified) === verificationStatusValue;

      const matchesSearch =
        !searchValue ||
        Object.values(claim).some(
          (value) =>
            typeof value === "string" &&
            value.toLowerCase().includes(searchValue.toLowerCase()),
        );

      return matchesCategory && matchesVerificationStatus && matchesSearch;
    })
    .sort((a, b) => {
      if (!sortValue || !SORT_VALUES.includes(sortValue)) return 0;

      switch (sortValue) {
        case "date":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "trust":
          return b.trust - a.trust;
        case "verified":
          return (b.verified ? 1 : 0) - (a.verified ? 1 : 0);
        default:
          return 0;
      }
    });

  const activeFilters: { label: string; value: string }[] = [
    categoryValue ? { label: "Category", value: categoryValue } : null,
    verificationStatusValue
      ? { label: "Status", value: verificationStatusValue }
      : null,
    searchValue ? { label: "Search", value: searchValue } : null,
    sortValue ? { label: "Sort", value: sortValue } : null,
  ].filter(
    (filter): filter is { label: string; value: string } => filter !== null,
  );

  return (
    <div className="flex flex-col gap-y-8">
      <Button
        onClick={() => route.back()}
        className="self-start border border-secondary-text-light bg-secondary-background p-4"
      >
        Go Back
      </Button>
      {isLoading || isPending ? (
        <>
          <div className="flex items-center gap-x-6">
            <Skeleton className="min-h-32 w-36 animate-pulse rounded-full bg-secondary-background" />
            <Skeleton className="min-h-40 w-full animate-pulse bg-secondary-background" />
          </div>
          <div className="flex items-center gap-x-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton
                key={`influencer-stats-skeleton-${index}`}
                className="min-h-40 w-full animate-pulse rounded-lg bg-secondary-background"
              />
            ))}
          </div>
          <Skeleton className="min-h-10 w-full animate-pulse rounded-lg bg-secondary-background" />
          <Skeleton className="min-h-80 w-full animate-pulse rounded-lg bg-secondary-background" />
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton
              key={`influencer-claims-skeleton-${index}`}
              className="min-h-40 w-full animate-pulse rounded-lg bg-secondary-background"
            />
          ))}
        </>
      ) : !isLoading && !isPending && data ? (
        <>
          <div className="flex items-center gap-4">
            <p className="flex h-28 w-full max-w-28 items-center justify-center rounded-full bg-white text-black">
              {name.split(" ").map((word, index) => (
                <span key={`${index}-${toSlug(name)}`}>{word[0]}</span>
              ))}
            </p>
            <div className="flex flex-col gap-y-4">
              <h1 className="text-6xl font-bold">{data.name}</h1>
              <div className="flex gap-4">
                {data.categories.map((category) => (
                  <span
                    key={toSlug(category)}
                    className="rounded-2xl bg-secondary-background px-4 py-2 text-sm"
                  >
                    {category}
                  </span>
                ))}
              </div>
              <p className="text-sm text-secondary-text">{data.bio}</p>
            </div>
          </div>
          <div className="flex items-stretch gap-x-6">
            {data.stats.map((item: StatsItem) => (
              <InfluencerStatsItem key={toSlug(item.title)} item={item} />
            ))}
          </div>
          <Tabs defaultValue={toSlug("Claims Analysis")}>
            <TabsList className="w-full justify-start gap-x-4 rounded-none border-b border-secondary-text/50">
              {filters.map((filter) => (
                <TabsTrigger
                  key={toSlug(filter)}
                  value={toSlug(filter)}
                  className="rounded-none py-2 text-sm text-secondary-text data-[state=active]:border-b data-[state=active]:border-success data-[state=active]:text-success"
                >
                  {filter}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent
              value={toSlug("Claims Analysis")}
              className="mt-4 flex flex-col gap-y-8"
            >
              <div className="flex flex-col gap-y-4 rounded-lg border border-secondary-text/50 bg-secondary-background p-4">
                <SearchInput value={searchValue} setValue={setSearchValue} />
                <div className="mb-4 flex flex-col gap-2">
                  <p className="mb-2 text-sm text-secondary-text">Categories</p>
                  <div className="flex gap-4">
                    {categories.map((category) => (
                      <Button
                        key={toSlug(category)}
                        onClick={() => setCategoryValue(toSlug(category))}
                        className={cn(
                          "rounded-2xl bg-primary-background px-4 py-2",
                          {
                            "first:bg-success": !categoryValue,
                          },
                          {
                            "bg-success": toSlug(category) === categoryValue,
                          },
                        )}
                      >
                        {toTitleCase(category)}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex w-full flex-col gap-2">
                    <p className="mb-2 text-sm text-secondary-text">
                      Verification Status
                    </p>
                    <div className="flex gap-4">
                      {verification_status.map((status) => (
                        <Button
                          key={toSlug(status)}
                          onClick={() =>
                            setVerificationStatusValue(toSlug(status))
                          }
                          className={cn(
                            "w-full rounded-md bg-primary-background p-7 text-center",
                            {
                              "first:bg-success": !verificationStatusValue,
                            },
                            {
                              "bg-success":
                                toSlug(status) === verificationStatusValue,
                            },
                          )}
                        >
                          {status}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <SelectInput value={sortValue} setValue={setSortValue} />
                </div>
                <div className="flex items-center gap-x-2">
                  <Filter className="h-6 w-6 text-secondary-text" />
                  <p className="text-sm text-secondary-text">
                    Active Filters:{" "}
                    {activeFilters.map((filter) => (
                      <span key={filter.value} className="mr-4 text-success">
                        {filter.label}: {toTitleCase(filter.value)}
                      </span>
                    ))}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <p className="text-sm text-secondary-text">
                  Showing {claims.length || 0} claims
                </p>
                {claims.map((claim, index) => (
                  <ClaimItem key={`claim-${index}`} item={claim} />
                ))}
              </div>
            </TabsContent>
            <TabsContent value={toSlug("Recommended Products")}>
              {data.products.map((product, index) => (
                <h1 key={`${index}-${toSlug(product)}`} className="mb-2">
                  {toTitleCase(product)}
                </h1>
              ))}
            </TabsContent>
            <TabsContent value={toSlug("Monetization")}>
              <h1>{data.monetization}</h1>
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <>No Information found.</>
      )}
    </div>
  );
};

const InfluencerStatsItem = ({ item }: { item: StatsItem }) => {
  const icon =
    item.id === "yearly-revenue" ? (
      <DollarSign className="text-success" />
    ) : item.id === "products" ? (
      <ShoppingBag className="text-success" />
    ) : (
      <TrendingUp className="text-success" />
    );

  return (
    <div className="flex w-full flex-col gap-x-4 rounded-lg border border-secondary-text/50 bg-secondary-background p-8">
      <div className="mb-4 flex items-center justify-between">
        <p className="font-bold">{item.title}</p>
        {icon}
      </div>
      <h2 className="mb-2 text-2xl font-bold text-success">{item.value}</h2>
      <p className="text-sm text-secondary-text">{item.description}</p>
    </div>
  );
};

const ClaimItem = ({ item }: { item: ClaimItemDetails }) => {
  return (
    <div className="flex flex-col gap-8 border-b border-secondary-text/50 pb-10">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-y-4">
          <div className="flex items-center gap-x-4">
            <div className="h-4 w-8 rounded-lg bg-secondary-background" />
            <span
              className={cn("rounded-2xl px-2", {
                "bg-success-light text-success":
                  item.verified.toLowerCase() === "verified",
                "bg-warning/10 text-warning":
                  item.verified.toLowerCase() === "questionable",
                "bg-danger/20 text-danger":
                  item.verified.toLowerCase() === "debunked",
              })}
            >
              {item.verified}
            </span>
            <div className="flex items-center gap-x-2">
              <Calendar className="h-4 w-4 text-secondary-text" />
              <p className="text-sm text-secondary-text">
                {new Date(item.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <p>{item.claim}</p>
          <Link
            href={item.claim_source}
            className="flex items-center gap-x-2 text-success"
          >
            <span>View Source</span>
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>

        <div className="flex flex-col gap-y-4">
          <p
            className={cn(
              "text-right",
              item.trust >= 90
                ? "text-success"
                : item.trust < 80
                  ? "text-danger"
                  : "text-warning",
            )}
          >
            {item.trust}%
          </p>
          <p className="text-sm text-secondary-text">Trust Score</p>
        </div>
      </div>

      <div className="flex flex-col gap-y-4 pl-8">
        <div className="flex items-center gap-x-2">
          <Brain className="h-6 w-6 text-success" />
          <p>AI Analysis</p>
        </div>
        <p className="text-secondary-text">{item.analysis}</p>
        <Link
          href={item.research_source}
          className="flex items-center gap-x-2 text-success"
        >
          <span>View Research</span>
          <ExternalLink className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
};

const SearchInput = ({
  value,
  setValue,
}: {
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const [search, setSearch] = useState<string>(value);

  const handleDebounceSearch = useMemo(
    () =>
      debounce((value: string) => {
        setValue(value);
      }, 1000),
    [setValue],
  );

  const handleSearch = (value: string) => {
    setSearch(value);
    return handleDebounceSearch(value);
  };

  return (
    <div className="relative flex w-full items-center">
      {search === value && search.trim() !== "" && value.trim() !== "" ? (
        <X
          className="absolute left-4 cursor-pointer"
          onClick={() => {
            setSearch("");
            setValue("");
          }}
        />
      ) : (
        <Search className="absolute left-4" />
      )}
      <input
        type="text"
        name="Search"
        value={search}
        placeholder="Search claim"
        onChange={(event) => handleSearch(event.target.value)}
        className="w-full rounded-md border border-secondary-text/50 bg-primary-background p-4 pl-16"
      />
    </div>
  );
};

const SelectInput = ({
  value,
  setValue,
}: {
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const [selectValue, setSelectValue] = useState<string>(value);

  const handleSelectValue = useCallback(
    (value: string) => {
      setValue(value);
    },
    [setValue],
  );

  const handleClearSelected = () => {
    setSelectValue("");
    setValue("");
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <label htmlFor="">Sort By</label>
      <div className="flex w-full items-center gap-x-4">
        <select
          name="sort"
          value={selectValue}
          onChange={(event) => setSelectValue(event.target.value)}
          className="w-full rounded-md border border-secondary-text/50 bg-primary-background p-3"
        >
          <option value="" defaultValue="" disabled hidden>
            Sort By
          </option>
          {SORT_VALUES.map((value) => (
            <option key={toSlug(value)} value={toSlug(value)}>
              {toTitleCase(value)}
            </option>
          ))}
        </select>
        <Button
          onClick={() =>
            selectValue === value
              ? handleClearSelected()
              : handleSelectValue(selectValue)
          }
          className="h-full w-fit border border-primary-text/50 bg-primary-background"
        >
          {selectValue === value &&
          selectValue.trim() !== "" &&
          value.trim() !== "" ? (
            <X className="!h-8 !w-8 text-secondary-text" />
          ) : (
            <ArrowDownWideNarrow className="!h-8 !w-8 text-secondary-text" />
          )}
        </Button>
      </div>
    </div>
  );
};
