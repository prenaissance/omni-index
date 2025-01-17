import {
  FastifyPluginAsyncTypebox,
  Type,
} from "@fastify/type-provider-typebox";
import { ExceptionSchema } from "~/common/payloads/exception-schema";
import { User } from "~/common/auth/entities/user";
import { UserRole } from "~/common/auth/entities/enums/user-role";
import { JwtPayload } from "~/common/auth/plugins/authentication-strategies-plugin";

const TokenPairSchema = Type.Object(
  {
    accessToken: Type.String({
      description: "JWT access token",
    }),
    refreshToken: Type.String({
      description:
        "JWT refresh token. Use on POST /api/auth/refresh to get a new token pair.",
    }),
  },
  {
    $id: "TokenPair",
  }
);

const authRoutes: FastifyPluginAsyncTypebox = async (app) => {
  app.addSchema(TokenPairSchema);

  // This voids the benefits from PCKE.
  // If this ever becomes a problem, some sort of PCKE-like mechanism should be implemented locally.
  // https://cloudentity.com/developers/basics/oauth-extensions/authorization-code-with-pkce/
  app.post(
    "/token",
    {
      schema: {
        body: Type.Object({
          token: Type.String(),
        }),
        response: {
          200: Type.Ref(TokenPairSchema),
          400: Type.Ref(ExceptionSchema),
        },
      },
    },
    async (request, reply) => {
      const { token } = request.body;

      const existingToken = await app.users.tokenRepository.getToken(token);
      if (!existingToken) {
        return reply.code(400).send({
          message: "Invalid token",
        });
      }

      let user = await app.users.repository.getByDid(existingToken.userDid);
      if (!user) {
        user = new User({
          did: existingToken.userDid,
          role: UserRole.User,
        });
        await app.users.repository.save(user);
      }

      const refreshToken = await app.users.refreshTokenRepository.generateToken(
        existingToken.userDid
      );
      const accessToken = await app.jwt.sign({
        sub: existingToken.userDid,
        role: user.role,
      } satisfies JwtPayload);

      return {
        accessToken,
        refreshToken,
      };
    }
  );

  app.post(
    "/refresh",
    {
      schema: {
        body: Type.Object({
          refreshToken: Type.String(),
        }),
        response: {
          200: Type.Ref(TokenPairSchema),
          400: Type.Ref(ExceptionSchema),
        },
      },
    },
    async (request, reply) => {
      const { refreshToken } = request.body;

      const newRefreshToken =
        await app.users.refreshTokenRepository.reissueToken(refreshToken);
      if (!newRefreshToken) {
        return reply.code(400).send({
          message: "Invalid token",
        });
      }

      const user = await app.users.repository.getByDid(newRefreshToken.userDid);
      if (!user) {
        return reply.code(400).send({
          message: "User not found. Refresh token invalidated.",
        });
      }

      const accessToken = app.jwt.sign({
        sub: newRefreshToken.userDid,
        role: user.role,
      } satisfies JwtPayload);

      return {
        accessToken,
        refreshToken: newRefreshToken.refreshToken,
      };
    }
  );
};

export default authRoutes;
