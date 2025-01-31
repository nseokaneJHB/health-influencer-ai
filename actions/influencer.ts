"use server";

import {
  GoogleGenerativeAI,
  SchemaType,
  ResponseSchema,
} from "@google/generative-ai";

export const generateResults = async (
  schema: ResponseSchema,
  prompt: string,
) => {
  const genAI = new GoogleGenerativeAI(process.env.AUTH_GOOGLE_GEN_AI_KEY!);

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-pro",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: schema,
    },
    systemInstruction:
      "You are a researcher in the health and social media industry",
  });

  try {
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  } catch (error) {
    console.error("Error parsing JSON:", error);
    throw error;
  }
};

export const getInfluencers = async () => {
  const schema = {
    description: "Health Influencer Data",
    type: SchemaType.OBJECT,
    properties: {
      active_influencers: {
        type: SchemaType.STRING,
        description: "Active Health Influencers (Number of active influencers)",
        nullable: false,
      },
      overall_verified_claims: {
        type: SchemaType.STRING,
        description:
          "Verified claims (The number of confirmed articles, blogs, podcast transcripts, tweets and books by Health Influencers)",
        nullable: false,
      },
      overall_average_trust_score: {
        type: SchemaType.STRING,
        description:
          "Average Trust Score (The percentage of trustworthiness articles, blogs, podcast transcripts, tweets, and books by Health Influencers)",
        nullable: false,
      },
      influencers: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            rank: {
              type: SchemaType.NUMBER,
              description: "Overall Influencer ranking (Not based on category)",
              nullable: false,
            },
            name: {
              type: SchemaType.STRING,
              description: "Influencer name",
              nullable: false,
            },
            image: {
              type: SchemaType.STRING,
              description: "Influencer image",
              nullable: false,
            },
            category: {
              type: SchemaType.STRING,
              description: "Influencer category",
              nullable: false,
            },
            trust: {
              type: SchemaType.NUMBER,
              description:
                "Influencer trust score (The percentage of trustworthiness articles, blogs, podcast transcripts, tweets, and books by Health Influencers)",
              nullable: false,
            },
            trend: {
              type: SchemaType.STRING,
              description: "Influencer trend",
              nullable: false,
            },
            followers: {
              type: SchemaType.STRING,
              description: "Influencer followers",
              nullable: false,
            },
            claims: {
              type: SchemaType.NUMBER,
              description: "Verified, Questionable or Debunked?",
              nullable: false,
            },
          },
          required: [
            "rank",
            "name",
            "image",
            "category",
            "trust",
            "trend",
            "followers",
            "claims",
          ],
        },
      },
    },
    required: [
      "active_influencers",
      "overall_verified_claims",
      "overall_average_trust_score",
      "influencers",
    ],
  };

  const prompt = `Get a list of Health Influencers for these categories (Nutrition, Fitness, Medicine, Mental Health). Your response should be real data (real-time).`;

  const response = await generateResults(schema, prompt);

  const stats = [
    {
      id: "active-influencers",
      value: response.active_influencers,
      description: "Active Influencers",
    },
    {
      id: "verified-claims",
      value: response.overall_verified_claims,
      description: "Verified Claims",
    },
    {
      id: "average-trust-score",
      value: response.overall_average_trust_score,
      description: "Average Trust Score",
    },
  ];

  return { influencers: response.influencers, stats };
};

export const getInfluencer = async (name: string) => {
  const schema = {
    type: SchemaType.OBJECT,
    description: "Health Influencer Details",
    properties: {
      image: {
        type: SchemaType.STRING,
        description: "Influencer image",
        nullable: false,
      },
      name: {
        type: SchemaType.STRING,
        description: "Influencer name",
        nullable: false,
      },
      categories: {
        type: SchemaType.ARRAY,
        description: "Influencer categories",
        items: {
          type: SchemaType.STRING,
          nullable: false,
        },
      },
      bio: {
        type: SchemaType.STRING,
        description: "Influencer bio",
        nullable: false,
      },
      trust: {
        type: SchemaType.OBJECT,
        description: "Influencer trust score",
        properties: {
          value: {
            type: SchemaType.STRING,
            description: "Trust score value in percentage",
            nullable: false,
          },
          description: {
            type: SchemaType.STRING,
            description: "Trust score based on how many claims?",
            nullable: false,
          },
        },
        required: ["value", "description"],
      },
      revenue: {
        type: SchemaType.OBJECT,
        description: "Influencer yearly revenue",
        properties: {
          value: {
            type: SchemaType.STRING,
            description: "Revenue value",
            nullable: false,
          },
          description: {
            type: SchemaType.STRING,
            nullable: false,
          },
        },
        required: ["value", "description"],
      },
      products: {
        type: SchemaType.ARRAY,
        description: "Influencer's recommended products",
        items: {
          type: SchemaType.STRING,
          description: "A recommended product",
          nullable: false,
        },
      },
      followers: {
        type: SchemaType.OBJECT,
        description: "Influencer total followers",
        properties: {
          value: {
            type: SchemaType.STRING,
            nullable: false,
          },
          description: {
            type: SchemaType.STRING,
            nullable: false,
          },
        },
        required: ["value", "description"],
      },
      claims: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            verified: {
              type: SchemaType.STRING,
              description: "Verified, Questionable or Debunked?",
              nullable: false,
            },
            createdAt: {
              type: SchemaType.STRING,
              description: "Claim date",
              nullable: false,
            },
            claim: {
              type: SchemaType.STRING,
              description: "Claim claim",
              nullable: false,
            },
            claim_source: {
              type: SchemaType.STRING,
              description: "Claim source url",
              nullable: false,
            },
            trust: {
              type: SchemaType.NUMBER,
              description: "Claim trust score in percentage",
              nullable: false,
            },
            analysis: {
              type: SchemaType.STRING,
              description: "AI analysis",
              nullable: false,
            },
            research_source: {
              type: SchemaType.STRING,
              description: "Research source",
              nullable: false,
            },
            category: {
              type: SchemaType.STRING,
              description: "Claim category",
              nullable: false,
            },
          },
          required: [
            "verified",
            "createdAt",
            "claim",
            "claim_source",
            "trust",
            "analysis",
            "research_source",
            "category",
          ],
        },
      },
    },
    required: [
      "image",
      "name",
      "categories",
      "bio",
      "trust",
      "revenue",
      "products",
      "followers",
      "claims",
    ],
  };

  const prompt = `Get the details of the health influencer ${name}. Do not duplicate claims.`;

  const response = await generateResults(schema, prompt);

  const stats = [
    { ...response.trust, id: "trust-score", title: "Trust Score" },
    { ...response.revenue, id: "yearly-revenue", title: "Yearly Revenue" },
    {
      description: "Recommended products",
      id: "products",
      title: "Products",
      value: response.products.length || 0,
    },
    { ...response.followers, id: "followers", title: "Followers" },
  ];

  response["stats"] = stats;
  response["monetization"] = response.revenue.description;

  delete response.trust;
  delete response.revenue;
  delete response.followers;

  return response;
};
