import { FastifyInstance } from "fastify";
import { faker } from "@faker-js/faker";
import { createMock } from "@golevelup/ts-vitest";
import { ComAtprotoNS } from "@atproto/api";
import { ObjectId } from "mongodb";
import { createIntegrationEntry } from "../entry-mocks";
import { createIntegrationUser } from "../auth-mocks";
import { build } from "~/app";
import { CreateCommentRequest } from "~/media/comments/payloads";
import { CommentResponse } from "~/media/comments/payloads/comment-response";
import { mockAtprotoAgent, setMockUserDid } from "test/__e2e-setup__";
import { User } from "~/common/auth/entities/user";
import { AtprotoDeletionResponse } from "~/common/payloads";
import { CommentEntity } from "~/media/comments/entities";
import { PaginatedCommentsResponse } from "~/media/comments/payloads/paginated-comments-response";

describe("Media Comments", () => {
  let app: FastifyInstance;
  let user: User;

  beforeAll(async () => {
    app = await build();
    user = await createIntegrationUser(app);
    setMockUserDid(user.did);
  });
  beforeEach(() => {
    mockAtprotoAgent.com.atproto = createMock<ComAtprotoNS>({
      repo: {
        putRecord: vi.fn(),
        deleteRecord: vi.fn(),
      },
    });
    vi.mocked(mockAtprotoAgent.com.atproto.repo.putRecord).mockResolvedValue({
      success: true,
      headers: {},
      data: {
        cid: faker.string.alphanumeric(24),
        uri: faker.internet.url(),
      },
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe("Pagination & sorting", () => {
    afterAll(async () => {
      await app.mediaEntry.comments.repository.deleteMany({});
    });

    it("should paginate comments & sort by creation date", async () => {
      const entry = await createIntegrationEntry(app);
      await app.mediaEntry.comments.repository.save(
        new CommentEntity({
          tid: "1",
          entrySlug: entry.slug,
          text: faker.lorem.sentence(),
          createdByDid: user.did,
          createdAt: new Date("2023-01-01T00:00:00Z"),
        })
      );
      await app.mediaEntry.comments.repository.save(
        new CommentEntity({
          tid: "2",
          entrySlug: entry.slug,
          text: faker.lorem.sentence(),
          createdByDid: user.did,
          createdAt: new Date("2023-01-03T00:00:00Z"),
        })
      );
      await app.mediaEntry.comments.repository.save(
        new CommentEntity({
          tid: "3",
          entrySlug: entry.slug,
          text: faker.lorem.sentence(),
          createdByDid: user.did,
          createdAt: new Date("2023-01-02T00:00:00Z"),
        })
      );

      const firstPageResponse = await app.inject({
        method: "GET",
        url: `/api/entries/${entry._id}/comments`,
        query: {
          page: "1",
          limit: "2",
        },
      });
      expect(firstPageResponse.statusCode).toBe(200);
      const firstPageComments =
        firstPageResponse.json<PaginatedCommentsResponse>();
      expect(firstPageComments.total).toBe(3);
      expect(firstPageComments.comments).toEqual([
        {
          tid: "2",
          text: expect.any(String),
          createdBy: expect.objectContaining({
            did: user.did,
          }),
          createdAt: "2023-01-03T00:00:00.000Z" as never,
          likes: 0,
          liked: false,
        },
        {
          tid: "3",
          text: expect.any(String),
          createdBy: expect.objectContaining({
            did: user.did,
          }),
          createdAt: "2023-01-02T00:00:00.000Z" as never,
          likes: 0,
          liked: false,
        },
      ] satisfies CommentResponse[]);

      const secondPageResponse = await app.inject({
        method: "GET",
        url: `/api/entries/${entry._id}/comments`,
        query: {
          page: "2",
          limit: "2",
        },
      });
      expect(secondPageResponse.statusCode).toBe(200);
      const secondPageComments =
        secondPageResponse.json<PaginatedCommentsResponse>();
      expect(secondPageComments.total).toBe(3);
      expect(secondPageComments.comments).toEqual([
        {
          tid: "1",
          text: expect.any(String),
          createdBy: expect.objectContaining({
            did: user.did,
          }),
          createdAt: "2023-01-01T00:00:00.000Z" as never,
          likes: 0,
          liked: false,
        },
      ] satisfies CommentResponse[]);
    });
  });

  describe("Creating comments", () => {
    it("should add a comment to a media entry", async () => {
      const entry = await createIntegrationEntry(app);
      const commentText = faker.lorem.sentence();

      let response = await app.inject({
        method: "POST",
        url: `/api/entries/${entry._id}/comments`,
        payload: {
          text: commentText,
        } satisfies CreateCommentRequest,
      });
      expect(response.statusCode).toBe(201);

      response = await app.inject({
        method: "GET",
        url: `/api/entries/${entry._id}/comments`,
      });
      expect(response.statusCode).toBe(200);
      const comments = response.json<PaginatedCommentsResponse>();
      expect(comments.comments).toContainEqual(
        expect.objectContaining({
          text: commentText,
          createdBy: expect.objectContaining({
            did: user.did,
          }),
        })
      );
    });
  });

  describe("Liking comments", () => {
    let entryId: ObjectId;
    let commentTid: string;
    let otherUser: User;
    beforeEach(async () => {
      otherUser = await createIntegrationUser(app);
      const entry = await createIntegrationEntry(app);
      entryId = new ObjectId(entry._id);
      const commentText = faker.lorem.sentence();

      const response = await app.inject({
        method: "POST",
        url: `/api/entries/${entry._id}/comments`,
        payload: {
          text: commentText,
        } satisfies CreateCommentRequest,
      });
      expect(response.statusCode).toBe(201);

      commentTid = response.json<CommentResponse>().tid;
    });

    it("should increase the likes count of a comment when liking it", async () => {
      // like with the other user
      setMockUserDid(otherUser.did);

      let response = await app.inject({
        method: "POST",
        url: `/api/entries/${entryId}/comments/${commentTid}/like`,
      });
      expect(response.statusCode).toBe(201);
      // like with the original user
      setMockUserDid(user.did);

      response = await app.inject({
        method: "POST",
        url: `/api/entries/${entryId}/comments/${commentTid}/like`,
      });
      expect(response.statusCode).toBe(201);

      response = await app.inject({
        method: "GET",
        url: `/api/entries/${entryId}/comments/${commentTid}`,
      });
      const comment = response.json<CommentResponse>();
      expect(comment.likes).toBe(2);
    });

    it("should show which comments the user has liked", async () => {
      // like with the other user
      setMockUserDid(otherUser.did);

      let response = await app.inject({
        method: "POST",
        url: `/api/entries/${entryId}/comments/${commentTid}/like`,
      });
      expect(response.statusCode).toBe(201);
      // like with the original user
      setMockUserDid(user.did);

      response = await app.inject({
        method: "POST",
        url: `/api/entries/${entryId}/comments/${commentTid}/like`,
      });
      expect(response.statusCode).toBe(201);

      response = await app.inject({
        method: "GET",
        url: `/api/entries/${entryId}/comments`,
        query: {
          page: "1",
          limit: "10",
        },
      });
      expect(response.statusCode).toBe(200);

      const comments = response.json<PaginatedCommentsResponse>();
      expect(comments.comments).toContainEqual(
        expect.objectContaining({
          tid: commentTid,
          liked: true,
          likes: 2,
        })
      );
    });

    it("should decrease the likes count of a comment when unliking it", async () => {
      vi.mocked(
        mockAtprotoAgent.com.atproto.repo.deleteRecord
      ).mockResolvedValueOnce({
        success: true,
        headers: {},
        data: {
          cid: faker.string.alphanumeric(24),
          uri: faker.internet.url(),
          commit: {
            cid: faker.string.alphanumeric(24),
            rev: faker.string.alphanumeric(24),
          },
        },
      });
      // like with the other user
      setMockUserDid(otherUser.did);

      let response = await app.inject({
        method: "POST",
        url: `/api/entries/${entryId}/comments/${commentTid}/like`,
      });
      expect(response.statusCode).toBe(201);
      // like with the original user
      setMockUserDid(user.did);

      response = await app.inject({
        method: "POST",
        url: `/api/entries/${entryId}/comments/${commentTid}/like`,
      });
      expect(response.statusCode).toBe(201);

      response = await app.inject({
        method: "GET",
        url: `/api/entries/${entryId}/comments/${commentTid}`,
      });
      const commentBefore = response.json<CommentResponse>();
      expect(commentBefore.likes).toBe(2);

      response = await app.inject({
        method: "DELETE",
        url: `/api/entries/${entryId}/comments/${commentTid}/like`,
      });
      expect(response.statusCode).toBe(200);
      expect(response.json<AtprotoDeletionResponse>()).toEqual({
        locallyDeleted: true,
        atprotoDeleted: true,
      });

      response = await app.inject({
        method: "GET",
        url: `/api/entries/${entryId}/comments/${commentTid}`,
      });
      const comment = response.json<CommentResponse>();
      expect(comment.likes).toBe(1);
    });

    it("should do nothing when unliking a comment that has not been liked", async () => {
      vi.mocked(
        mockAtprotoAgent.com.atproto.repo.deleteRecord
      ).mockResolvedValue({
        success: false,
        headers: {},
        data: {},
      });

      const response = await app.inject({
        method: "DELETE",
        url: `/api/entries/${entryId}/comments/${commentTid}/like`,
      });
      expect(response.statusCode).toBe(200);
      expect(response.json<AtprotoDeletionResponse>()).toEqual({
        locallyDeleted: false,
        atprotoDeleted: false,
      });
    });
  });
});
