import { FastifyInstance } from "fastify";
import { faker } from "@faker-js/faker";
import { createMock } from "@golevelup/ts-vitest";
import { ComAtprotoNS } from "@atproto/api";
import { createIntegrationEntry } from "../entry-mocks";
import { createIntegrationUser } from "../auth-mocks";
import { build } from "~/app";
import { CreateCommentRequest } from "~/media/comments/payloads";
import { CommentResponse } from "~/media/comments/payloads/comment-response";
import { mockAtprotoAgent } from "test/__e2e-setup__";
import { User } from "~/common/auth/entities/user";

describe("Media Comments", () => {
  let app: FastifyInstance;
  let user: User;

  beforeAll(async () => {
    app = await build();
    user = await createIntegrationUser(app);
    const writableAtprotoAgent = mockAtprotoAgent as {
      did: string;
      assertDid: string;
    };
    writableAtprotoAgent.assertDid = writableAtprotoAgent.did = user.did;
  });
  afterAll(async () => {
    await app.close();
  });

  it("should add a comment to a media entry", async () => {
    mockAtprotoAgent.com.atproto = createMock<ComAtprotoNS>({
      repo: {
        putRecord: vi.fn(),
      },
    });
    vi.mocked(
      mockAtprotoAgent.com.atproto.repo.putRecord
    ).mockResolvedValueOnce({
      success: true,
      headers: {},
      data: {
        cid: faker.string.alphanumeric(24),
        uri: faker.internet.url(),
      },
    });
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
