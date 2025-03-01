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
      const comments = response.json<CommentResponse[]>();
      expect(comments).toContainEqual(
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

      const comments = response.json<CommentResponse[]>();
      expect(comments).toContainEqual(
        expect.objectContaining({
          liked: true,
        })
      );
    });
  });
});
