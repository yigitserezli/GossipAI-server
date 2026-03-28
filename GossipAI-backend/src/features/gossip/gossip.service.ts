import { prisma } from "../../lib/prisma";
import type { AuthContextUser } from "../../shared/types/auth";
import type { CreateGossipInput } from "./gossip.schema";

interface GossipResponse {
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: string;
}

const toGossipResponse = (gossip: {
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: Date;
}): GossipResponse => ({
  id: gossip.id,
  title: gossip.title,
  content: gossip.content,
  authorId: gossip.authorId,
  createdAt: gossip.createdAt.toISOString()
});

export const gossipService = {
  async list() {
    const gossips = await prisma.gossip.findMany({
      orderBy: {
        createdAt: "desc"
      }
    });

    return gossips.map(toGossipResponse);
  },

  async create(input: CreateGossipInput, author: AuthContextUser) {
    const gossip = await prisma.gossip.create({
      data: {
        title: input.title,
        content: input.content,
        authorId: author.id
      }
    });

    return toGossipResponse(gossip);
  }
};
